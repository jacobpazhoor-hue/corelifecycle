#!/usr/bin/env python3
"""PUBLISH GUARD — nothing reaches YouTube that the reviewer did not approve.

WHY THIS EXISTS (2026-08-17)
----------------------------
The coordinator ran `python3 scripts/yt_upload.py --privacy public` by hand against
out/episode.mp4 while an autopilot run was mid-revision-loop. The reviewer had REJECTED
that render — four factual errors, including a false claim that a named living person held
a cabinet post — and the revision agent had already fixed them in content.py. yt_upload.py
uploads whatever byte-file sits at out/episode.mp4; it had no idea a verdict existed. The
uncorrected render went public, and then its own title blocked the corrected one via the
duplicate guard. A retraction is not a recoverable failure the way a dark night is.

THE RULE
--------
An approval blesses ONE SPECIFIC RENDER, not a filename. The reviewer's verdict is only
usable if the bytes on disk are the same bytes the reviewer watched. So the review step
stamps the render it sampled (`upload_guard.py stamp out/episode.mp4` -> a sha256 in
out/review/reviewed_render.json), and this guard re-hashes the file at upload time. Re-render
after approval and the hash moves, so the stale approval stops applying — which is exactly
the case the old code could not see.

CHECKS (all must pass, and each names itself when it fails)
  1. the video exists
  2. no OTHER autopilot run is in flight (runs/.lock held by a live pid that is not one of
     our own ancestors — the autopilot's own upload runs *under* that lock and is allowed)
  3. a verdict file exists for this video
  4. verdict decision == "approve"
  5. a review stamp exists for this video
  6. the stamp names this video
  7. sha256(video on disk) == sha256 recorded at review time
  8. the verdict is not OLDER than the render
  9. a PRE-PUBLISH AUDIT record exists for this video (scripts/prepublish_audit.py)
 10. that audit PASSED
 11. the audit was run against THESE bytes (its recorded sha256 == the file on disk)
 12. every source file the audit read is UNCHANGED since it ran (content.py, src/timeline.json,
     ops/episode_meta.json, out/upload_kit.json, docs/research/<topic>.md)
 13. the audit is not OLDER than the render

WHY 9-13 (2026-08-24)
---------------------
Scene t169 asserted that two named living people were "still waiting on their own sentences". Both
had been sentenced in late 2024, and docs/research/ftx.md never supported it. Checks 1-8 were all
GREEN for that render: the reviewer had seen those exact bytes, the sha matched, the verdict was
fresh. Approval binding proves the reviewer looked at the right video; it cannot prove the video is
true. The audit is the second lock, and check 12 is the one that closes the 2026-08-17 shape for
good: an approval survives a content.py edit (the mp4 does not change, so the sha still matches),
but the audit's source hashes do not. Edit the script after the sweep and the sweep stops applying,
exactly the way re-rendering stops the reviewer's approval from applying.

Unknown files (anything that is not out/episode.mp4 or out/short.mp4) have no reviewer and
are refused; publish them with the override.

THE OVERRIDE
------------
`--publish-without-review-approval --override-reason "..."` — both are required, the reason
cannot be blank, and using it writes a loud line to runs/upload_guard.log AND
runs/autopilot/ALERTS.log naming every check it stepped over. It is deliberately long to
type: there is no short spelling of "publish something the reviewer refused".
"""
import os, sys, json, hashlib, subprocess
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

OVERRIDE_FLAG = "--publish-without-review-approval"
GUARD_LOG = os.path.join(ROOT, "runs", "upload_guard.log")
ALERTS_LOG = os.path.join(ROOT, "runs", "autopilot", "ALERTS.log")
RUN_LOCK = os.path.join(ROOT, "runs", ".lock")

# video basename -> (verdict file, review stamp file), both relative to out/review/
REVIEWED = {
    "episode.mp4": ("verdict.json", "reviewed_render.json"),
    "short.mp4": ("short_verdict.json", "reviewed_short.json"),
}

AUDIT_REL = os.path.join("out", "review", "prepublish_audit.json")

# The Short is CUT FROM the approved episode (shorts_cut.py), so it shares content.py, the research
# file and the packaging the audit swept — but not the episode's bytes. It therefore has to satisfy
# the audit's verdict and its source hashes, and must NOT be asked to match a sha256 taken of
# out/episode.mp4. Requiring that would block the Shorts path on a condition it can never meet.
AUDIT_BINDS_SHA = {"episode.mp4"}


class GuardError(Exception):
    """The render on disk is not cleared to publish."""


def sha256_file(path, chunk=4 * 1024 * 1024):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for blk in iter(lambda: fh.read(chunk), b""):
            h.update(blk)
    return h.hexdigest()


def paths_for(video, root=ROOT):
    """(verdict_path, stamp_path) for a video, or (None, None) if nothing reviews it."""
    names = REVIEWED.get(os.path.basename(video))
    if not names:
        return None, None
    return (os.path.join(root, "out", "review", names[0]),
            os.path.join(root, "out", "review", names[1]))


def stamp_review(video, root=ROOT):
    """Record WHICH render is going in front of the reviewer. Called by the review step."""
    _, stamp_path = paths_for(video, root)
    if not stamp_path:
        raise GuardError(f"no review stamp is defined for {video!r} "
                         f"(known: {', '.join(sorted(REVIEWED))})")
    if not os.path.exists(video):
        raise GuardError(f"cannot stamp a render that does not exist: {video}")
    rec = {
        "video": os.path.basename(video),
        "sha256": sha256_file(video),
        "size": os.path.getsize(video),
        "mtime": os.path.getmtime(video),
        "stampedAt": datetime.now().isoformat(timespec="seconds"),
    }
    os.makedirs(os.path.dirname(stamp_path), exist_ok=True)
    with open(stamp_path, "w") as fh:
        json.dump(rec, fh, indent=2)
    return rec


def _ancestors(pid=None):
    """Every pid from us up to init. The autopilot's upload is a CHILD of the lock holder."""
    pid = os.getpid() if pid is None else pid
    seen, out = set(), []
    while pid and pid > 1 and pid not in seen:
        seen.add(pid)
        out.append(pid)
        try:
            ppid = subprocess.run(["ps", "-o", "ppid=", "-p", str(pid)],
                                  capture_output=True, text=True, timeout=5).stdout.strip()
            pid = int(ppid) if ppid.isdigit() else 0
        except Exception:
            break
    return out


def foreign_run_in_flight(lock=RUN_LOCK):
    """A LIVE autopilot run that is not ours -> its render may land on disk mid-upload."""
    holder = os.path.join(lock, "holder")
    if not os.path.exists(holder):
        return None
    try:
        with open(holder) as fh:
            pid = int(fh.read().strip())
    except (ValueError, OSError):
        return None
    try:
        os.kill(pid, 0)          # signal 0 == "does this process exist"
    except OSError:
        return None              # dead holder: a stale lock, not a live run
    if pid in _ancestors():
        return None              # this IS our run -- the autopilot uploading its own episode
    return pid


def audit_reasons(video, root=ROOT, disk_sha=None):
    """Reasons the PRE-PUBLISH AUDIT does not clear this render. Empty list == clear.

    Kept separate from check() so the audit can be reasoned about (and tested) on its own, and so a
    failure here names the audit rather than hiding inside a wall of review-guard text.
    """
    reasons = []
    path = os.path.join(root, AUDIT_REL)
    name = os.path.basename(video)
    if not os.path.exists(path):
        return [f"NO PRE-PUBLISH AUDIT: {AUDIT_REL} does not exist — the factual sweep "
                f"(scripts/prepublish_audit.py) never ran for this render, so no check has "
                f"compared this episode's claims against docs/research/<topic>.md. Run it: "
                f"python3 scripts/prepublish_audit.py out/episode.mp4"]
    try:
        with open(path) as fh:
            audit = json.load(fh)
    except (ValueError, OSError) as e:
        return [f"{AUDIT_REL} is unreadable ({e}) — a half-written or truncated audit record "
                f"cannot clear anything. Re-run scripts/prepublish_audit.py"]

    verdict = str(audit.get("verdict", "")).strip().lower()
    if verdict != "pass":
        fails = audit.get("fails") or []
        detail = ("; ".join(str(f) for f in fails[:3])) if fails else "no reasons recorded"
        reasons.append(f"the pre-publish audit FAILED (verdict={verdict or 'missing'!r}, "
                       f"{len(fails)} failure(s)): {detail}"
                       + (" …" if len(fails) > 3 else ""))

    if name in AUDIT_BINDS_SHA:
        if audit.get("video") != name:
            reasons.append(f"the pre-publish audit is bound to {audit.get('video')!r}, not "
                           f"{name!r} — it did not sweep this render")
        elif not audit.get("sha256"):
            reasons.append(f"the pre-publish audit recorded no sha256 — it was run WITHOUT the "
                           f"render (`prepublish_audit.py` with no argument), so it cannot say "
                           f"which bytes it cleared. Re-run it as: "
                           f"python3 scripts/prepublish_audit.py {os.path.relpath(video, root)}")
        else:
            on_disk = disk_sha if disk_sha is not None else sha256_file(video)
            if on_disk != audit.get("sha256"):
                reasons.append(
                    "STALE AUDIT: the render on disk is NOT the render that was audited "
                    f"(disk sha256 {on_disk[:12]}…, audited {str(audit.get('sha256'))[:12]}…). "
                    "Re-run scripts/prepublish_audit.py against these bytes.")

    # THE CHECK THAT CLOSES THE 2026-08-17 SHAPE. The mp4 does not change when content.py does, so
    # a sha-bound approval survives a mid-revision script edit. These hashes do not.
    for relpath, recorded in (audit.get("sources") or {}).items():
        src = os.path.join(root, relpath)
        if not os.path.exists(src):
            reasons.append(f"{relpath} was audited but is now MISSING — the audit describes a tree "
                           f"that no longer exists. Re-run scripts/prepublish_audit.py")
            continue
        if sha256_file(src) != recorded:
            reasons.append(
                f"{relpath} HAS CHANGED since the pre-publish audit ran — the audit cleared "
                f"different content than what is about to be published. This is the 2026-08-17 "
                f"shape (a hand-run upload while the revision agent was still editing the script). "
                f"Re-run scripts/prepublish_audit.py, and re-render if the change affects the video.")

    if not (audit.get("sources") or {}):
        reasons.append(f"{AUDIT_REL} records no source hashes — it cannot show that the script it "
                       f"swept is the script on disk. Re-run scripts/prepublish_audit.py")

    a_mtime, f_mtime = os.path.getmtime(path), os.path.getmtime(video)
    if a_mtime < f_mtime:
        reasons.append(
            f"the pre-publish audit is OLDER than the render (audit "
            f"{datetime.fromtimestamp(a_mtime):%F %H:%M:%S} < render "
            f"{datetime.fromtimestamp(f_mtime):%F %H:%M:%S}) — it belongs to a previous run")
    return reasons


def check(video, root=ROOT, lock=RUN_LOCK):
    """Return the list of reasons this render must not publish. Empty list == clear."""
    reasons = []
    disk_sha = None
    if not video or not os.path.exists(video):
        return [f"the video does not exist: {video}"]

    pid = foreign_run_in_flight(lock)
    if pid:
        reasons.append(f"an autopilot run is IN FLIGHT (runs/.lock held by live pid {pid}); "
                       "it may replace this render mid-upload")

    verdict_path, stamp_path = paths_for(video, root)
    if not verdict_path:
        reasons.append(f"no reviewer verdict is defined for {os.path.basename(video)!r} — "
                       f"only {', '.join(sorted(REVIEWED))} go through review")
        return reasons

    if not os.path.exists(verdict_path):
        reasons.append(f"NO REVIEW: {os.path.relpath(verdict_path, root)} does not exist — "
                       "this render was never reviewed")
        return reasons
    try:
        with open(verdict_path) as fh:
            verdict = json.load(fh)
    except (ValueError, OSError) as e:
        return reasons + [f"{os.path.relpath(verdict_path, root)} is unreadable ({e}) — "
                          "cannot confirm an approval"]

    decision = str(verdict.get("decision", "")).strip().lower()
    if decision != "approve":
        reasons.append(f"the reviewer did NOT approve this episode: decision={decision or 'missing'!r} "
                       f"in {os.path.relpath(verdict_path, root)}")

    if not os.path.exists(stamp_path):
        reasons.append(f"NO REVIEW STAMP: {os.path.relpath(stamp_path, root)} is missing, so the "
                       "verdict cannot be tied to the bytes on disk (was this render ever reviewed?)")
    else:
        try:
            with open(stamp_path) as fh:
                stamp = json.load(fh)
        except (ValueError, OSError) as e:
            stamp = None
            reasons.append(f"{os.path.relpath(stamp_path, root)} is unreadable ({e})")
        if stamp:
            if stamp.get("video") != os.path.basename(video):
                reasons.append(f"the review stamp is for {stamp.get('video')!r}, not "
                               f"{os.path.basename(video)!r}")
            else:
                on_disk = disk_sha = sha256_file(video)
                if on_disk != stamp.get("sha256"):
                    reasons.append(
                        "STALE APPROVAL: the render on disk is NOT the render that was reviewed "
                        f"(disk sha256 {on_disk[:12]}…, reviewed {str(stamp.get('sha256'))[:12]}…). "
                        "Re-review it: the approval on file belongs to different bytes.")

    v_mtime, f_mtime = os.path.getmtime(verdict_path), os.path.getmtime(video)
    if v_mtime < f_mtime:
        reasons.append(
            f"the verdict is OLDER than the render (verdict {datetime.fromtimestamp(v_mtime):%F %H:%M:%S} < "
            f"render {datetime.fromtimestamp(f_mtime):%F %H:%M:%S}) — it cannot have judged this file")

    # --- THE PRE-PUBLISH AUDIT (2026-08-24) ------------------------------------------------------
    # The reviewer's approval says a human watched THESE bytes. It does not say the episode is
    # accurate — t169 proved that a fully approved, correctly bound render can still assert
    # something false about two named living people. This is the second lock, and it is not
    # optional: an audit that did not run is not a pass.
    reasons += audit_reasons(video, root=root, disk_sha=disk_sha)
    return reasons


def _log(line):
    for path in (GUARD_LOG, ALERTS_LOG):
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "a") as fh:
                fh.write(line + "\n")
        except OSError:
            pass


def assert_publishable(video, override=False, reason=None, root=ROOT, lock=RUN_LOCK):
    """Raise GuardError unless this exact render is cleared to publish."""
    reasons = check(video, root=root, lock=lock)
    stamp = datetime.now().isoformat(timespec="seconds")
    if not reasons:
        _log(f"{stamp} PUBLISH OK {os.path.basename(video)} — reviewer approved this render")
        return
    if not override:
        raise GuardError(
            "REFUSING TO PUBLISH — " + os.path.basename(video) + "\n"
            + "\n".join(f"  • {r}" for r in reasons)
            + "\n\nThe reviewer's approval covers one specific render. If you are certain this "
              "file should go public anyway, re-run with:\n"
              f"    {OVERRIDE_FLAG} --override-reason \"why\"")
    if not (reason or "").strip():
        raise GuardError(f"{OVERRIDE_FLAG} requires --override-reason \"...\" — "
                         "an override with no stated reason is not a deliberate act.")
    banner = "!" * 78
    loud = (f"{stamp} !!! REVIEW GUARD OVERRIDDEN !!! {os.path.basename(video)} "
            f"by uid={os.getuid()} pid={os.getpid()} reason={reason.strip()!r} "
            f"| stepped over: " + " | ".join(reasons))
    _log(loud)
    print(banner, file=sys.stderr)
    print(f"!! PUBLISHING WITHOUT REVIEW APPROVAL — {os.path.basename(video)}", file=sys.stderr)
    for r in reasons:
        print(f"!!   stepped over: {r}", file=sys.stderr)
    print(f"!! reason given: {reason.strip()}", file=sys.stderr)
    print(f"!! logged to {os.path.relpath(GUARD_LOG, root)} and {os.path.relpath(ALERTS_LOG, root)}",
          file=sys.stderr)
    print(banner, file=sys.stderr, flush=True)


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    usage = ("usage:\n"
             "  upload_guard.py stamp <video>   record the render being sent to the reviewer\n"
             "  upload_guard.py check <video>   exit 0 if that render may publish, 1 if not")
    if len(argv) != 2 or argv[0] not in ("stamp", "check"):
        print(usage); return 2
    cmd, video = argv
    if cmd == "stamp":
        try:
            rec = stamp_review(video)
        except GuardError as e:
            print(f"stamp failed: {e}"); return 1
        print(f"review stamp: {rec['video']} sha256={rec['sha256'][:12]}… size={rec['size']}")
        return 0
    reasons = check(video)
    if reasons:
        print("BLOCKED:"); [print(f"  • {r}") for r in reasons]
        return 1
    print(f"OK: {os.path.basename(video)} is the render the reviewer approved")
    return 0


if __name__ == "__main__":
    sys.exit(main())
