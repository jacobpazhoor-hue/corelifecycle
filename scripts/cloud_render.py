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
MAX_WAIT = 50 * 60  # 50 min hard cap


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
    req.add_header("Authorization", f"Bearer {cfg['GH_TOKEN']}")
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
    git("add", "-A")
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
    run_id = None
    deadline = time.time() + MAX_WAIT
    while time.time() < deadline:
        time.sleep(POLL_SECS)
        runs, _ = api(cfg, "GET", f"{base}/actions/workflows/{WORKFLOW}/runs?event=workflow_dispatch&per_page=10")
        for r in runs.get("workflow_runs", []):
            if r.get("head_sha") == sha:
                run_id = r["id"]; status = r["status"]; concl = r.get("conclusion")
                break
        else:
            print("cloud_render: waiting for run to appear...")
            continue
        print(f"cloud_render: run {run_id} status={status} conclusion={concl}")
        if status == "completed":
            if concl != "success":
                sys.exit(f"cloud_render: workflow concluded '{concl}' — see {r.get('html_url')}")
            break
    else:
        sys.exit("cloud_render: timed out waiting for the render workflow")

    # 4) download the artifact -> out/
    arts, _ = api(cfg, "GET", f"{base}/actions/runs/{run_id}/artifacts")
    art = next((a for a in arts.get("artifacts", []) if a["name"] == f"render-{topic}"), None) \
        or next(iter(arts.get("artifacts", [])), None)
    if not art:
        sys.exit("cloud_render: no artifact found on the completed run")
    blob, _ = api(cfg, "GET", art["archive_download_url"], raw=True)
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
