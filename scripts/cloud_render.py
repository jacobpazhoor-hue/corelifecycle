#!/usr/bin/env python3
"""Offload the heavy render to free GitHub Actions (16GB runner), keeping review + publish LOCAL.

Flow (called by daily_autopilot.sh in place of the old local render()):
  1. commit + push the creative output (content.py / episode_meta / src changes) to the repo
  2. trigger the `render` workflow (workflow_dispatch) via the GitHub REST API
  3. poll until the run completes
  4. download the artifact (episode.mp4 + short.mp4 + thumbnail + kits + timeline.json) into out/

The Mac then runs the normal LLM reviewer on the REAL downloaded frames and publishes via the
local OAuth — so no secrets ever go to GitHub. Exit 0 only if out/episode.mp4 was downloaded.

Config: secrets/gh.env (gitignored) with:
    GH_OWNER=your-github-user
    GH_REPO=corelifecycle
    GH_TOKEN=ghp_xxx   (a PAT with 'repo' + 'workflow' scope)
Usage: python3 scripts/cloud_render.py <topic-slug>
"""
import os, sys, json, time, ssl, zipfile, io, subprocess, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://api.github.com"
_CTX = None  # cached SSL context (probed once)


def _ssl_ctx():
    """The launchd framework Python has no system CA bundle -> ssl.create_default_context()
    fails CERTIFICATE_VERIFY_FAILED. Fall back to certifi's bundle when the default can't verify."""
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen("https://api.github.com", context=ctx, timeout=10):
            return ctx
    except Exception:
        try:
            import certifi
            return ssl.create_default_context(cafile=certifi.where())
        except Exception:
            return ctx
WORKFLOW = "render.yml"
POLL_SECS = 20
# Hard cap on the whole cloud attempt, re-runs included. The workflow's own worst case is
# prepare(40) + render(45) + stitch(45) = 130 min, and a re-run of the failed jobs adds roughly
# one shard-length plus stitch. This is the outer bound; the re-run count below is the inner one.
MAX_WAIT = 165 * 60
MAX_RERUNS = 2
RESTART_GRACE = 5 * 60   # how long a requested re-run gets to actually leave status=completed


def load_cfg():
    cfg = {}
    p = os.path.join(ROOT, "secrets", "gh.env")
    if os.path.exists(p):
        for line in open(p):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1); cfg[k.strip()] = v.strip()
    for k in ("GH_OWNER", "GH_REPO", "GH_TOKEN"):
        cfg[k] = os.environ.get(k, cfg.get(k, ""))
        if not cfg[k]:
            sys.exit(f"cloud_render: missing {k} (set in secrets/gh.env or env)")
    return cfg


def api(cfg, method, path, body=None, raw=False):
    url = path if path.startswith("http") else f"{API}{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    # add_UNREDIRECTED_header: the artifact-zip endpoint 302-redirects to a *presigned* Azure blob
    # URL that needs NO auth and REJECTS a stray Bearer token (HTTP 401). A normal add_header is
    # re-sent on redirects by urllib -> that 401 was the artifact-download failure that made the
    # autopilot fall back to the (failing) local render. Unredirected = sent to GitHub only.
    req.add_unredirected_header("Authorization", f"Bearer {cfg['GH_TOKEN']}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    req.add_header("User-Agent", "corelifecycle-autopilot")
    if data:
        req.add_header("Content-Type", "application/json")
    global _CTX
    if _CTX is None:
        _CTX = _ssl_ctx()
    with urllib.request.urlopen(req, context=_CTX, timeout=120) as r:
        blob = r.read()
        if raw:
            return blob, r.status
        return (json.loads(blob) if blob else {}), r.status


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)


def main():
    topic = sys.argv[1] if len(sys.argv) > 1 else "episode"
    cfg = load_cfg()
    owner, repo = cfg["GH_OWNER"], cfg["GH_REPO"]
    base = f"/repos/{owner}/{repo}"

    # 1) commit + push the creative output (source only; .gitignore keeps audio/video/secrets out)
    # Stage ONLY what the cloud render actually consumes. This used to be `git add -A`, which swept
    # the whole working tree into a commit labelled "<topic> content" and pushed it — so unrelated
    # in-progress edits (scripts/, prompts, tests) were published under a misleading message, and a
    # half-finished change sitting on disk at 2AM shipped straight to the render. 2026-07-20.
    RENDER_INPUTS = ["content.py", "src", "ops/episode_meta.json", "docs/research"]
    staged = [p for p in RENDER_INPUTS if os.path.exists(os.path.join(ROOT, p))]
    for p in staged:
        git("add", "--", p)
    missing = [p for p in RENDER_INPUTS if p not in staged]
    if missing:
        print("cloud_render: WARNING — render inputs missing from disk:", ", ".join(missing))
    git("commit", "-m", f"autopilot: {topic} content for cloud render")  # may be empty -> ignored
    push = git("push", "origin", "HEAD:main")
    if push.returncode != 0 and "Everything up-to-date" not in (push.stderr + push.stdout):
        print("cloud_render: git push failed:\n", push.stderr);
        # not fatal if remote already has the commit; continue to trigger
    sha = git("rev-parse", "HEAD").stdout.strip()
    print(f"cloud_render: pushed {sha[:8]}, triggering workflow for '{topic}'")

    # 2) trigger workflow_dispatch
    try:
        api(cfg, "POST", f"{base}/actions/workflows/{WORKFLOW}/dispatches",
            {"ref": "main", "inputs": {"topic": topic}})
    except urllib.error.HTTPError as e:
        sys.exit(f"cloud_render: dispatch failed {e.code}: {e.read().decode()[:300]}")

    # 3) find the run (created from our dispatch) + poll to completion
    deadline = time.time() + MAX_WAIT

    def get_run(run_id):
        """Our dispatch's run: by id once we know it, otherwise by head_sha."""
        if run_id is not None:
            r, _ = api(cfg, "GET", f"{base}/actions/runs/{run_id}")
            return r
        runs, _ = api(cfg, "GET", f"{base}/actions/workflows/{WORKFLOW}/runs"
                                  f"?event=workflow_dispatch&per_page=10")
        for r in runs.get("workflow_runs", []):
            if r.get("head_sha") == sha:
                return r
        return None

    def wait_completed(run_id, require_restart=False):
        """Block until the run reports status=completed; returns (id, conclusion, html_url).

        require_restart is for the poll that follows a re-run request: for a few seconds the API
        keeps serving the PREVIOUS completed/cancelled state, and taking that at face value would
        look like the re-run failing instantly. So first insist on seeing it leave 'completed'."""
        left_completed = not require_restart
        restart_deadline = time.time() + RESTART_GRACE
        while time.time() < deadline:
            time.sleep(POLL_SECS)
            try:                                # a transient SSL/DNS blip during a poll must NOT kill the
                r = get_run(run_id)             # whole wait — the render is running fine on GitHub.
            except Exception as e:              # Just retry.
                print(f"cloud_render: poll blip ({e}); retrying"); continue
            if r is None:
                print("cloud_render: waiting for run to appear..."); continue
            run_id = r["id"]; status = r["status"]; concl = r.get("conclusion")
            print(f"cloud_render: run {run_id} status={status} conclusion={concl}")
            if not left_completed:
                if status != "completed":
                    left_completed = True
                elif time.time() > restart_deadline:
                    sys.exit(f"cloud_render: re-run of {run_id} never started — see {r.get('html_url')}")
                continue
            if status == "completed":
                return run_id, concl, r.get("html_url")
        sys.exit("cloud_render: timed out waiting for the render workflow")

    run_id, concl, url = wait_completed(None)

    # A shard that hangs on GitHub's side blows its job's timeout-minutes, and GitHub reports a
    # timed-out job — and therefore the whole run — as 'cancelled'. That is what happened on
    # 2026-08-17 and 08-18: an `apt-get update` stalled on a dead Ubuntu mirror in 4-5 randomly
    # chosen shards, the run came back 'cancelled', this function exited non-zero, and the Mac
    # fell through to a local render it has ~5.7 GiB of disk for. Two dark nights.
    #
    # 'cancelled' is an infrastructure verdict, not a verdict on the episode, so retry it —
    # `rerun-failed-jobs` re-runs ONLY the jobs that did not succeed and keeps the artifacts of
    # the ones that did, so a 4-shard flake costs one shard-length plus a stitch, not a whole
    # re-render. A 'failure' conclusion is NOT retried: that means a step genuinely failed (the
    # gate, a bad asset) and is deterministic, so re-running it would only cost an hour before
    # reporting the same thing.
    attempt = 0
    while concl == "cancelled" and attempt < MAX_RERUNS:
        attempt += 1
        print(f"cloud_render: run {run_id} was CANCELLED (a job hit its timeout) — re-running just "
              f"its failed jobs, attempt {attempt}/{MAX_RERUNS}; {url}")
        try:
            api(cfg, "POST", f"{base}/actions/runs/{run_id}/rerun-failed-jobs")
        except urllib.error.HTTPError as e:
            sys.exit(f"cloud_render: cannot re-run the failed jobs of {run_id} "
                     f"({e.code}: {e.read().decode()[:200]}) — see {url}")
        run_id, concl, url = wait_completed(run_id, require_restart=True)
    if concl != "success":
        sys.exit(f"cloud_render: workflow concluded '{concl}'"
                 + (f" after {attempt} re-run attempt(s)" if attempt else "")
                 + f" — see {url}")

    # 4) download the artifact -> out/
    arts, _ = api(cfg, "GET", f"{base}/actions/runs/{run_id}/artifacts")
    art = next((a for a in arts.get("artifacts", []) if a["name"] == f"render-{topic}"), None) \
        or next(iter(arts.get("artifacts", [])), None)
    if not art:
        sys.exit("cloud_render: no artifact found on the completed run")
    # Download the zip. Primary path is urllib (add_unredirected_header keeps the token off the
    # Azure redirect). Belt-and-suspenders: if urllib fails OR yields a non-zip blob, fall back to
    # `curl -sL` (drops auth on cross-host redirects by default). A download hiccup here must NOT be
    # allowed to fail the whole step — that is what silently dropped a GOOD render to a doomed local
    # render for 5 days. Retry a couple of times before giving up.
    dl_url = art["archive_download_url"]
    blob = None
    for attempt in range(3):
        try:
            blob, _ = api(cfg, "GET", dl_url, raw=True)
            zipfile.ZipFile(io.BytesIO(blob))  # validate it's really a zip
            break
        except Exception as e:
            print(f"cloud_render: urllib download attempt {attempt+1} failed ({e}); trying curl")
            cur = subprocess.run(["curl", "-sL", "-H", f"Authorization: Bearer {cfg['GH_TOKEN']}", dl_url],
                                 capture_output=True)
            try:
                zipfile.ZipFile(io.BytesIO(cur.stdout)); blob = cur.stdout; break
            except Exception as e2:
                print(f"cloud_render: curl download attempt {attempt+1} failed ({e2})")
                blob = None
    if blob is None:
        sys.exit("cloud_render: could not download a valid artifact zip after retries")
    # the artifact zip preserves repo-relative paths (out/episode.mp4, src/timeline.json, ...),
    # so extract at the repo ROOT — NOT into out/ (that would nest as out/out/episode.mp4)
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    with zipfile.ZipFile(io.BytesIO(blob)) as z:
        z.extractall(ROOT)
    ep = os.path.join(ROOT, "out", "episode.mp4")
    if not (os.path.exists(ep) and os.path.getsize(ep) > 50_000_000):
        sys.exit("cloud_render: artifact missing a valid out/episode.mp4")
    print(f"cloud_render: downloaded render -> out/ ({os.path.getsize(ep)//1_000_000} MB episode.mp4)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
