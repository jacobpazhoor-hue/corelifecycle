#!/usr/bin/env python3
"""Upload a CoreLifecycle video to YouTube (headless once authorized).

Usage:
  python3 scripts/yt_upload.py <video.mp4> [--title "..."] [--desc-file FILE]
        [--tags "a,b,c"] [--thumb thumb.png] [--privacy private|unlisted|public]
        [--category 27] [--playlist "Every Level"] [--force]

Defaults can also live in out/upload_kit.json:
  {"video":"out/lawyer_pilot_v6.mp4","title":"...","description":"...","tags":[...],
   "thumbnail":"out/thumb.png","privacy":"private","categoryId":"27","playlist":"Every Level"}

Privacy defaults to PRIVATE (safe) unless you pass --privacy public or set it in the kit.
NOT made for kids. Writes results to out/uploads.json.

REVIEW GUARD: this script refuses to publish a render the reviewer has not approved — see
scripts/upload_guard.py. Approval is bound to the render's sha256, so re-rendering after an
approve invalidates it. To publish anyway (rare, deliberate, and logged loudly):
  --publish-without-review-approval --override-reason "..."
"""
import os, sys, json, argparse
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import upload_guard  # noqa: E402  (review guard — see the block at the top of main())

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRETS = os.path.join(ROOT, "secrets")
TOKEN = os.path.join(SECRETS, "token.json")
KIT = os.path.join(ROOT, "out", "upload_kit.json")
UPLOADS = os.path.join(ROOT, "out", "uploads.json")
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]


def die(m, c=1):
    print(m); sys.exit(c)


def get_service():
    if not os.path.exists(TOKEN):
        die(f"NOT AUTHORIZED — missing {TOKEN}\nRun once:  python3 scripts/yt_auth.py", 2)
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    creds = Credentials.from_authorized_user_file(TOKEN, SCOPES)
    if not creds.valid and creds.refresh_token:
        creds.refresh(Request()); open(TOKEN, "w").write(creds.to_json())
    return build("youtube", "v3", credentials=creds)


def load_kit(path=KIT):
    return json.load(open(path)) if os.path.exists(path) else {}


def title_live(yt, title):
    try:
        ch = yt.channels().list(part="contentDetails", mine=True).execute()["items"][0]
        up = ch["contentDetails"]["relatedPlaylists"]["uploads"]
        items = yt.playlistItems().list(part="snippet", playlistId=up, maxResults=25).execute()["items"]
        return any(i["snippet"]["title"].strip() == title.strip() for i in items)
    except Exception:
        return False


def ensure_playlist(yt, name):
    if not name:
        return None
    r = yt.playlists().list(part="id,snippet", mine=True, maxResults=50).execute()
    for it in r.get("items", []):
        if it["snippet"]["title"] == name:
            return it["id"]
    r = yt.playlists().insert(part="snippet,status",
        body={"snippet": {"title": name}, "status": {"privacyStatus": "public"}}).execute()
    return r["id"]


def main():
    pre = argparse.ArgumentParser(add_help=False)
    pre.add_argument("--kit", default=KIT, help="path to an upload kit json (default out/upload_kit.json)")
    known, _ = pre.parse_known_args()
    kit = load_kit(known.kit)
    ap = argparse.ArgumentParser(parents=[pre])
    ap.add_argument("video", nargs="?", default=kit.get("video"))
    ap.add_argument("--title", default=kit.get("title"))
    ap.add_argument("--desc-file")
    ap.add_argument("--tags", default=",".join(kit.get("tags", [])))
    ap.add_argument("--thumb", default=kit.get("thumbnail"))
    ap.add_argument("--privacy", default=kit.get("privacy", "private"))
    ap.add_argument("--category", default=kit.get("categoryId", "27"))
    ap.add_argument("--playlist", default=kit.get("playlist"))
    ap.add_argument("--force", action="store_true")
    # --force only bypasses the DUPLICATE-TITLE guard. It has never had anything to do with the
    # reviewer, and must not: the override below is the only way past a missing approval.
    ap.add_argument(upload_guard.OVERRIDE_FLAG, dest="override_review", action="store_true",
                    help="publish a render the reviewer did NOT approve (logs loudly; needs --override-reason)")
    ap.add_argument("--override-reason", default=None,
                    help=f"why you are using {upload_guard.OVERRIDE_FLAG} — required with it")
    a = ap.parse_args()

    if not a.video or not os.path.exists(a.video):
        die(f"video not found: {a.video}")

    # --- REVIEW GUARD (2026-08-17) ---------------------------------------------------------------
    # BEFORE authorizing, before touching the network: this process must not be able to publish a
    # render the reviewer refused. The 2026-08-17 incident was a hand-run `--privacy public` against
    # an episode the reviewer had REJECTED for four factual errors while the revision agent was still
    # fixing them. Approval is tied to the render's sha256, so a stale approve cannot bless newer
    # bytes. The autopilot's own upload runs after its reviewer approves and passes untouched.
    try:
        upload_guard.assert_publishable(a.video, override=a.override_review, reason=a.override_reason)
    except upload_guard.GuardError as e:
        die(str(e), 3)
    # ---------------------------------------------------------------------------------------------
    title = (a.title or os.path.basename(a.video))[:100]
    if a.desc_file and os.path.exists(a.desc_file):
        description = open(a.desc_file).read()
    else:
        description = kit.get("description", "")
    tags = [t.strip() for t in a.tags.split(",") if t.strip()][:50]

    yt = get_service()
    if title_live(yt, title) and not a.force:
        die(f"SKIP: a video titled '{title[:50]}' is already live (dup guard). Use --force to override.", 0)

    from googleapiclient.http import MediaFileUpload
    body = {
        "snippet": {"title": title, "description": description[:4900], "tags": tags, "categoryId": a.category},
        "status": {"privacyStatus": a.privacy, "selfDeclaredMadeForKids": False},
    }
    print(f"uploading: {title}  [{a.privacy}]")
    # 2026-07-20: chunksize=-1 sent the whole ~370MB in ONE request, so `resumable=True` bought us
    # nothing — a single network blip lost the entire upload. That is exactly how the 07-20 03:16
    # and 07:16 runs died (TimeoutError: the write operation timed out) with a built, REVIEW-APPROVED
    # episode already on disk. Chunk it for real, and retry transient failures with backoff so one
    # bad packet no longer costs a whole day of the channel.
    import time as _time, socket as _socket, ssl as _ssl, random as _random
    from googleapiclient.errors import HttpError as _HttpError
    CHUNK = 16 * 1024 * 1024          # must be a multiple of 256KB
    MAX_TRIES = 6
    media = MediaFileUpload(a.video, chunksize=CHUNK, resumable=True, mimetype="video/mp4")
    req = yt.videos().insert(part="snippet,status", body=body, media_body=media)
    resp = None
    tries = 0
    while resp is None:
        try:
            status, resp = req.next_chunk()
            if status:
                print(f"  upload {int(status.progress() * 100)}%", flush=True)
            tries = 0                  # a chunk landed — reset the failure budget
        except _HttpError as e:
            if e.resp.status not in (500, 502, 503, 504, 429):
                raise                  # a real API error (quota/auth/bad request) — do NOT mask it
            tries += 1
            if tries >= MAX_TRIES:
                raise
            back = min(60, 2 ** tries) + _random.random()
            print(f"  transient HTTP {e.resp.status} — retry {tries}/{MAX_TRIES} in {back:.1f}s", flush=True)
            _time.sleep(back)
        except (TimeoutError, _socket.timeout, _ssl.SSLError, ConnectionError, OSError) as e:
            tries += 1
            if tries >= MAX_TRIES:
                raise                  # give up loudly rather than pretend it published
            back = min(60, 2 ** tries) + _random.random()
            print(f"  transient network error ({type(e).__name__}: {e}) — retry {tries}/{MAX_TRIES} in {back:.1f}s", flush=True)
            _time.sleep(back)
    vid = resp["id"]
    url = f"https://youtu.be/{vid}"
    print("  uploaded:", url)

    if a.thumb and os.path.exists(a.thumb):
        try:
            yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(a.thumb)).execute()
            print("  thumbnail set")
        except Exception as e:
            print("  thumbnail skipped (channel may need phone verification):", e)

    pid = ensure_playlist(yt, a.playlist)
    if pid:
        try:
            yt.playlistItems().insert(part="snippet", body={"snippet": {"playlistId": pid,
                "resourceId": {"kind": "youtube#video", "videoId": vid}}}).execute()
            print("  added to playlist:", a.playlist)
        except Exception as e:
            print("  playlist skipped:", e)

    store = json.load(open(UPLOADS)) if os.path.exists(UPLOADS) else []
    store.append({"id": vid, "url": url, "title": title, "privacy": a.privacy,
                  "video": os.path.basename(a.video), "uploadedAt": datetime.now().isoformat(timespec="seconds")})
    os.makedirs(os.path.dirname(UPLOADS), exist_ok=True)
    json.dump(store, open(UPLOADS, "w"), indent=2)
    print("done.", url)


if __name__ == "__main__":
    main()
