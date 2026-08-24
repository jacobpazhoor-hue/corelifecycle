"""Proofs for the publish guard (scripts/upload_guard.py).

No YouTube call is stubbed with a mock here — it is proved unreachable instead. The guard runs
at the top of yt_upload.main(), BEFORE get_service(), so a blocked upload never authorizes and
never opens a socket. The end-to-end tests below run the real scripts/yt_upload.py inside a
throwaway ROOT that has no secrets/token.json: an upload the guard clears dies at "NOT
AUTHORIZED" (exit 2), which is itself the proof it got past the guard and stopped short of the API.
"""
import json, os, shutil, subprocess, sys, tempfile, time, unittest

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import upload_guard  # noqa: E402


def _render(path, body=b"pretend-mp4-bytes"):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as fh:
        fh.write(body)
    return path


class GuardCase(unittest.TestCase):
    """A throwaway ROOT holding out/episode.mp4 + out/review/."""

    def setUp(self):
        self.root = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.root, True)
        self.lock = os.path.join(self.root, "runs", ".lock")
        self.video = _render(os.path.join(self.root, "out", "episode.mp4"))
        os.makedirs(os.path.join(self.root, "out", "review"), exist_ok=True)

    def verdict(self, decision):
        p = os.path.join(self.root, "out", "review", "verdict.json")
        with open(p, "w") as fh:
            json.dump({"decision": decision, "score": "8", "issues": []}, fh)
        return p

    def stamp(self):
        return upload_guard.stamp_review(self.video, root=self.root)

    def audit_ok(self, verdict="pass"):
        """A PASSING pre-publish audit record bound to the video's CURRENT bytes.

        Since 2026-08-24 the guard requires one (checks 9-13): a reviewer approval proves a human
        watched these bytes, not that the episode is true. Every test below that expects a CLEAR
        publish has to satisfy both locks, which is the point.
        """
        src = os.path.join(self.root, "content.py")
        if not os.path.exists(src):
            with open(src, "w") as fh:
                fh.write("SCENES = []\n")
        rec = {
            "verdict": verdict,
            "generatedAt": "2026-08-24T00:00:00",
            "topic": "ftx",
            "video": os.path.basename(self.video),
            "sha256": upload_guard.sha256_file(self.video),
            "size": os.path.getsize(self.video),
            "sources": {"content.py": upload_guard.sha256_file(src)},
            "fails": [] if verdict == "pass" else ["a named person's legal status is unsourced"],
            "warns": [],
        }
        path = os.path.join(self.root, "out", "review", "prepublish_audit.json")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as fh:
            json.dump(rec, fh)
        # the audit must not be OLDER than the render
        os.utime(path, (time.time() + 5, time.time() + 5))
        return path

    def check(self):
        return upload_guard.check(self.video, root=self.root, lock=self.lock)

    def reasons_text(self):
        return " ".join(self.check())


class TestBlocksUnreviewedRender(GuardCase):
    """PROOF (a): a render the reviewer never saw, and one it rejected."""

    def test_no_verdict_at_all_is_blocked(self):
        self.assertIn("NO REVIEW", self.reasons_text())
        with self.assertRaises(upload_guard.GuardError):
            upload_guard.assert_publishable(self.video, root=self.root, lock=self.lock)

    def test_rejected_verdict_is_blocked(self):
        self.verdict("revise")
        self.stamp()
        self.assertIn("did NOT approve", self.reasons_text())

    def test_approved_verdict_without_a_stamp_is_blocked(self):
        # the exact hole the old code had: an approve on file, nothing tying it to these bytes
        self.verdict("approve")
        self.assertIn("NO REVIEW STAMP", self.reasons_text())


class TestBlocksRenderNewerThanVerdict(GuardCase):
    """PROOF (b): approval granted, then the file changed underneath it."""

    def test_rerender_after_approval_is_blocked(self):
        self.stamp()
        v = self.verdict("approve")
        self.audit_ok()
        self.assertEqual(self.check(), [], "sanity: approved render should start clear")
        # the revision agent's fixes land and the runner re-renders
        _render(self.video, b"a-DIFFERENT-render-with-the-facts-fixed")
        os.utime(self.video, (time.time() + 60, time.time() + 60))
        text = self.reasons_text()
        self.assertIn("STALE APPROVAL", text)
        self.assertIn("is OLDER than the render", text)

    def test_verdict_older_than_render_is_blocked_even_if_bytes_match(self):
        # belt and braces: hash agrees, timestamps do not -> still refused
        self.verdict("approve")
        self.stamp()
        old = time.time() - 3600
        os.utime(os.path.join(self.root, "out", "review", "verdict.json"), (old, old))
        self.assertIn("is OLDER than the render", self.reasons_text())


class TestAllowsApprovedRender(GuardCase):
    """PROOF (c): the autopilot's own happy path — reviewer approved THESE bytes."""

    def test_approved_render_passes(self):
        self.stamp()
        self.verdict("approve")
        self.audit_ok()
        self.assertEqual(self.check(), [])
        upload_guard.assert_publishable(self.video, root=self.root, lock=self.lock)  # no raise

    def test_autopilots_own_run_lock_does_not_block_it(self):
        # the autopilot uploads UNDER runs/.lock; the holder is our own ancestor, so it is allowed
        self.stamp()
        self.verdict("approve")
        self.audit_ok()
        os.makedirs(self.lock, exist_ok=True)
        with open(os.path.join(self.lock, "holder"), "w") as fh:
            fh.write(str(os.getpid()))
        self.assertEqual(self.check(), [])


class TestRunInFlight(GuardCase):
    def test_foreign_live_run_blocks(self):
        self.stamp()
        self.verdict("approve")
        proc = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(30)"])
        self.addCleanup(proc.wait)
        self.addCleanup(proc.kill)
        os.makedirs(self.lock, exist_ok=True)
        with open(os.path.join(self.lock, "holder"), "w") as fh:
            fh.write(str(proc.pid))
        self.assertIn("IN FLIGHT", self.reasons_text())

    def test_dead_holder_is_a_stale_lock_not_a_run(self):
        self.stamp()
        self.verdict("approve")
        self.audit_ok()
        proc = subprocess.Popen([sys.executable, "-c", "pass"])
        proc.wait()
        os.makedirs(self.lock, exist_ok=True)
        with open(os.path.join(self.lock, "holder"), "w") as fh:
            fh.write(str(proc.pid))
        self.assertEqual(self.check(), [])


class TestUnknownVideo(GuardCase):
    def test_a_file_no_reviewer_judges_is_blocked(self):
        stray = _render(os.path.join(self.root, "out", "some_old_cut.mp4"))
        reasons = upload_guard.check(stray, root=self.root, lock=self.lock)
        self.assertIn("no reviewer verdict is defined", " ".join(reasons))


class TestOverride(GuardCase):
    def test_override_without_a_reason_is_refused(self):
        with self.assertRaises(upload_guard.GuardError) as cm:
            upload_guard.assert_publishable(self.video, override=True, reason="  ",
                                            root=self.root, lock=self.lock)
        self.assertIn("requires --override-reason", str(cm.exception))

    def test_override_with_a_reason_passes_and_logs_loudly(self):
        log = os.path.join(self.root, "runs", "upload_guard.log")
        alerts = os.path.join(self.root, "runs", "autopilot", "ALERTS.log")
        orig = upload_guard.GUARD_LOG, upload_guard.ALERTS_LOG
        upload_guard.GUARD_LOG, upload_guard.ALERTS_LOG = log, alerts
        try:
            upload_guard.assert_publishable(self.video, override=True,
                                            reason="restoring a retracted episode by hand",
                                            root=self.root, lock=self.lock)
        finally:
            upload_guard.GUARD_LOG, upload_guard.ALERTS_LOG = orig
        for p in (log, alerts):
            with open(p) as fh:
                body = fh.read()
            self.assertIn("REVIEW GUARD OVERRIDDEN", body)
            self.assertIn("restoring a retracted episode by hand", body)
            self.assertIn("stepped over", body)


class TestEndToEndUploadScript(unittest.TestCase):
    """Run the REAL scripts/yt_upload.py in an isolated ROOT with no credentials."""

    def setUp(self):
        self.root = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.root, True)
        os.makedirs(os.path.join(self.root, "scripts"))
        os.makedirs(os.path.join(self.root, "out", "review"))
        for f in ("yt_upload.py", "upload_guard.py"):
            shutil.copy(os.path.join(ROOT, "scripts", f), os.path.join(self.root, "scripts", f))
        self.script = os.path.join(self.root, "scripts", "yt_upload.py")
        self.video = _render(os.path.join(self.root, "out", "episode.mp4"))

    def run_upload(self, *args):
        return subprocess.run([sys.executable, self.script, self.video, "--privacy", "public", *args],
                              capture_output=True, text=True, cwd=self.root, timeout=120)

    def approve(self):
        """Both locks: the reviewer's approval AND a passing pre-publish audit (2026-08-24)."""
        subprocess.run([sys.executable, os.path.join(self.root, "scripts", "upload_guard.py"),
                        "stamp", self.video], check=True, capture_output=True, cwd=self.root)
        with open(os.path.join(self.root, "out", "review", "verdict.json"), "w") as fh:
            json.dump({"decision": "approve"}, fh)
        src = os.path.join(self.root, "content.py")
        with open(src, "w") as fh:
            fh.write("SCENES = []\n")
        path = os.path.join(self.root, "out", "review", "prepublish_audit.json")
        with open(path, "w") as fh:
            json.dump({"verdict": "pass", "topic": "ftx", "video": "episode.mp4",
                       "sha256": upload_guard.sha256_file(self.video),
                       "sources": {"content.py": upload_guard.sha256_file(src)},
                       "fails": [], "warns": []}, fh)
        os.utime(path, (time.time() + 5, time.time() + 5))

    def test_rejected_render_never_reaches_youtube(self):
        with open(os.path.join(self.root, "out", "review", "verdict.json"), "w") as fh:
            json.dump({"decision": "revise", "issues": [{"severity": "high"}]}, fh)
        r = self.run_upload()
        self.assertEqual(r.returncode, 3, r.stdout + r.stderr)
        self.assertIn("REFUSING TO PUBLISH", r.stdout)
        self.assertNotIn("uploading:", r.stdout)
        self.assertNotIn("NOT AUTHORIZED", r.stdout)  # it never even tried to authorize

    def test_approved_render_gets_past_the_guard(self):
        self.approve()
        r = self.run_upload()
        # no token in this throwaway root -> it stops at authorization, which only happens
        # AFTER the guard cleared it. That is the pass signal, with no network touched.
        self.assertEqual(r.returncode, 2, r.stdout + r.stderr)
        self.assertIn("NOT AUTHORIZED", r.stdout)
        self.assertNotIn("REFUSING TO PUBLISH", r.stdout)

    def test_override_flag_gets_past_a_rejection_and_logs(self):
        with open(os.path.join(self.root, "out", "review", "verdict.json"), "w") as fh:
            json.dump({"decision": "revise"}, fh)
        r = self.run_upload(upload_guard.OVERRIDE_FLAG, "--override-reason", "manual restore")
        self.assertEqual(r.returncode, 2, r.stdout + r.stderr)
        self.assertIn("PUBLISHING WITHOUT REVIEW APPROVAL", r.stderr)
        with open(os.path.join(self.root, "runs", "upload_guard.log")) as fh:
            self.assertIn("REVIEW GUARD OVERRIDDEN", fh.read())

    def test_override_without_reason_is_refused_by_the_script(self):
        self.approve()
        r = self.run_upload(upload_guard.OVERRIDE_FLAG)
        # an approved render + a reasonless override still uploads (nothing was overridden)
        self.assertEqual(r.returncode, 2, r.stdout + r.stderr)
        with open(os.path.join(self.root, "out", "review", "verdict.json"), "w") as fh:
            json.dump({"decision": "revise"}, fh)
        r = self.run_upload(upload_guard.OVERRIDE_FLAG)
        self.assertEqual(r.returncode, 3, r.stdout + r.stderr)
        self.assertIn("requires --override-reason", r.stdout)


if __name__ == "__main__":
    unittest.main(verbosity=2)
