#!/usr/bin/env python3
"""One-time YouTube OAuth for the CoreLifecycle channel.
Run ONCE:  python3 scripts/yt_auth.py

Opens a browser. Sign in with the Google account that owns CoreLifecycle and,
if asked to choose a channel/brand account, PICK CoreLifecycle. Saves a refresh
token to secrets/token.json. After this, yt_upload.py runs headless (no browser).
"""
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRETS = os.path.join(ROOT, "secrets")
CLIENT = os.path.join(SECRETS, "client_secret.json")
TOKEN = os.path.join(SECRETS, "token.json")
SCOPES = ["https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtube"]


def main():
    if not os.path.exists(CLIENT):
        print(f"MISSING {CLIENT}"); sys.exit(1)
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        print("Run: pip3 install --user google-api-python-client google-auth-oauthlib google-auth-httplib2"); sys.exit(1)
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT, SCOPES)
    creds = flow.run_local_server(port=0, prompt="consent")
    os.makedirs(SECRETS, exist_ok=True)
    with open(TOKEN, "w") as f:
        f.write(creds.to_json())
    # confirm which channel was authorized
    try:
        from googleapiclient.discovery import build
        yt = build("youtube", "v3", credentials=creds)
        ch = yt.channels().list(part="snippet,statistics", mine=True).execute()["items"][0]
        print(f"\n✅ Authorized channel: {ch['snippet']['title']}  "
              f"(subs: {ch['statistics'].get('subscriberCount','?')})")
        print("If this is NOT CoreLifecycle, delete secrets/token.json and re-run, choosing the right channel.")
    except Exception as e:
        print("Saved token, but channel check failed:", e)
    print(f"\nSaved {TOKEN}. Uploads now work headless.")


if __name__ == "__main__":
    main()
