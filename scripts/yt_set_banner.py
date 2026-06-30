#!/usr/bin/env python3
"""Set the CoreLifecycle channel banner. Usage: yt_set_banner.py [image_path]
Uploads via channelBanners.insert, then points brandingSettings at it. Uses the same token."""
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN = os.path.join(ROOT, "secrets", "token.json")
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]


def main(img):
    if not os.path.exists(TOKEN):
        print("NOT AUTHORIZED — run scripts/yt_auth.py first"); sys.exit(2)
    if not os.path.exists(img):
        print("missing image", img); sys.exit(1)
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

    creds = Credentials.from_authorized_user_file(TOKEN, SCOPES)
    if not creds.valid and creds.refresh_token:
        creds.refresh(Request()); open(TOKEN, "w").write(creds.to_json())
    yt = build("youtube", "v3", credentials=creds)

    print("uploading banner image…")
    up = yt.channelBanners().insert(media_body=MediaFileUpload(img)).execute()
    url = up["url"]
    print("  banner url:", url)
    ch = yt.channels().list(part="id,brandingSettings", mine=True).execute()["items"][0]
    branding = ch.get("brandingSettings", {})
    branding.setdefault("image", {})["bannerExternalUrl"] = url
    yt.channels().update(part="brandingSettings", body={"id": ch["id"], "brandingSettings": branding}).execute()
    print("done — banner set on channel", ch["id"])


if __name__ == "__main__":
    img = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "out", "brand_banner.png")
    main(img)
