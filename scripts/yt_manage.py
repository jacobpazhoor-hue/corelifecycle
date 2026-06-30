#!/usr/bin/env python3
"""Manage already-published CoreLifecycle videos: delete a video, or retitle it.
Reuses the existing OAuth (secrets/token.json; scope includes youtube).

Usage:
  python3 scripts/yt_manage.py delete  <videoId>
  python3 scripts/yt_manage.py retitle <videoId> "New Title"
  python3 scripts/yt_manage.py list
"""
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN = os.path.join(ROOT, "secrets", "token.json")
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]


def svc():
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    creds = Credentials.from_authorized_user_file(TOKEN, SCOPES)
    if not creds.valid and creds.refresh_token:
        creds.refresh(Request()); open(TOKEN, "w").write(creds.to_json())
    return build("youtube", "v3", credentials=creds)


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    yt = svc(); cmd = sys.argv[1]
    if cmd == "delete":
        vid = sys.argv[2]
        yt.videos().delete(id=vid).execute()
        print("deleted", vid)
    elif cmd == "retitle":
        vid, new = sys.argv[2], sys.argv[3]
        v = yt.videos().list(part="snippet", id=vid).execute()["items"][0]["snippet"]
        v["title"] = new[:100]
        yt.videos().update(part="snippet", body={"id": vid, "snippet": v}).execute()
        print("retitled", vid, "->", new)
    elif cmd == "list":
        ch = yt.channels().list(part="contentDetails", mine=True).execute()["items"][0]
        up = ch["contentDetails"]["relatedPlaylists"]["uploads"]
        items = yt.playlistItems().list(part="snippet", playlistId=up, maxResults=50).execute()["items"]
        for it in items:
            s = it["snippet"]
            print(s["resourceId"]["videoId"], "|", s["title"])
    else:
        print(__doc__); sys.exit(1)


if __name__ == "__main__":
    main()
