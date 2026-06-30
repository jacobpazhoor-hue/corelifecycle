# Free Cloud Render (GitHub Actions)

**Why:** the 8GB Mac kept thrashing on the local render (swap death → stalled/failed publishes). This moves
ONLY the memory-heavy render to a free 16GB GitHub-hosted runner. Everything else stays local.

## Architecture
```
LOCAL (Mac, low memory)                  CLOUD (GitHub Actions, 16GB, free)
  analytics + creative agent
  build.py  (validate: gate/runtime/smoke)
  scripts/cloud_render.py <topic>:
    ├─ git push  (source only — .gitignore  ──▶  npm ci + pip + apt chromium libs
    │   keeps audio/video/secrets out)           build.py  (REGENERATE audio: edge-tts+numpy)
    ├─ trigger `render` workflow (REST API)       remotion render EveryLevelLawyer
    ├─ poll until complete                        audio_master -> -14 LUFS
    └─ download artifact ──────────────◀──────    cut+render Short
  LLM reviewer on the REAL frames                 upload-artifact (mp4s + kits + timeline)
  yt_upload (local OAuth) + Short + mark produced
```
The cloud **never touches YouTube** → no OAuth/secrets in GitHub. The Mac downloads the finished MP4,
runs the existing reviewer on real frames, and publishes via the local token. Render is the only thing
that left the Mac.

## One-time setup (you)
1. **Create a GitHub repo** (private is fine), e.g. `corelifecycle`.
2. **Add the remote + push** (from /Users/jacobpazhoor/CoreLifecycle):
   ```
   git remote add origin https://github.com/<you>/corelifecycle.git
   git push -u origin main
   ```
   (Claude has already run `git init` + the first commit. `.gitignore` keeps audio/video/node_modules/secrets out.)
3. **Create `secrets/gh.env`** (gitignored — stays on the Mac):
   ```
   GH_OWNER=<your-github-username>
   GH_REPO=corelifecycle
   GH_TOKEN=<a PAT with 'repo' + 'workflow' scopes>
   ```
   (You already have a GitHub PAT; make sure it has the `workflow` scope so it can trigger Actions.)

That's it — **no GitHub secrets to configure**, because uploading stays local.

## Test it
```
git push                                    # push latest source
python3 scripts/cloud_render.py spy         # triggers the Action, waits, downloads to out/
```
Watch the run at github.com/<you>/corelifecycle/actions. On success you'll get `out/episode.mp4` locally.

## How the nightly uses it
`daily_autopilot.sh` calls `scripts/cloud_render.py <topic>` instead of the local `render()`. If the
cloud render fails/times out, it falls back to the local chunked render (so a GitHub outage can't fully
block a night). Free-tier note: private-repo Actions = 2000 min/month (a render is ~15–20 min on the
16GB runner → ~daily fits easily); a public repo is unlimited.
```
