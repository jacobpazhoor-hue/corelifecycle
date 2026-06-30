#!/usr/bin/env python3
"""Pull CoreLifecycle's published-video performance into ops/analytics.json so the showrunner can
LEARN (favor topics/titles that land). Uses the YouTube Data API with the EXISTING upload OAuth
(no re-auth): per-video views/likes/comments. Run before each autopilot cycle (cheap) or weekly.

NOTE: CTR + audience-retention curves require the YouTube *Analytics* API (scope
youtube.analytics.readonly), which the current token does NOT have. Adding that = a one-time
re-consent. Until then we learn from views/engagement, which is enough to favor winning topics.
"""
import os, sys, json, re
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRETS = os.path.join(ROOT, "secrets")
TOKEN = os.path.join(SECRETS, "token.json")
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]
OUT = os.path.join(ROOT, "ops", "analytics.json")


def get_service():
    if not os.path.exists(TOKEN):
        print(f"NOT AUTHORIZED — missing {TOKEN}; skipping analytics."); sys.exit(0)
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    creds = Credentials.from_authorized_user_file(TOKEN, SCOPES)
    if not creds.valid and creds.refresh_token:
        creds.refresh(Request()); open(TOKEN, "w").write(creds.to_json())
    return build("youtube", "v3", credentials=creds)


def vid_id(url):
    m = re.search(r"(?:youtu\.be/|v=)([\w-]{11})", url or "")
    return m.group(1) if m else None


def main():
    try:
        yt = get_service()
        # topic map from produced_topics
        pt = json.load(open(os.path.join(ROOT, "ops", "produced_topics.json"))).get("produced", [])
        topic_by_id = {vid_id(p.get("url")): p.get("topic") for p in pt if vid_id(p.get("url"))}

        ch = yt.channels().list(part="contentDetails,statistics", mine=True).execute()["items"][0]
        uploads = ch["contentDetails"]["relatedPlaylists"]["uploads"]
        chstat = ch["statistics"]

        ids, token = [], None
        while True:
            r = yt.playlistItems().list(part="contentDetails", playlistId=uploads, maxResults=50,
                                        pageToken=token).execute()
            ids += [it["contentDetails"]["videoId"] for it in r["items"]]
            token = r.get("nextPageToken")
            if not token:
                break

        videos = []
        for i in range(0, len(ids), 50):
            r = yt.videos().list(part="snippet,statistics,contentDetails", id=",".join(ids[i:i+50])).execute()
            for v in r["items"]:
                s = v.get("statistics", {})
                videos.append(dict(
                    id=v["id"], topic=topic_by_id.get(v["id"]),
                    title=v["snippet"]["title"], published=v["snippet"]["publishedAt"],
                    views=int(s.get("viewCount", 0)), likes=int(s.get("likeCount", 0)),
                    comments=int(s.get("commentCount", 0)), duration=v["contentDetails"]["duration"]))
        videos.sort(key=lambda x: x["views"], reverse=True)

        insights = []
        if videos:
            best = videos[0]
            insights.append(f"Best so far: '{best['title']}' ({best['views']} views).")
            if len(videos) > 1:
                insights.append("Lean into the patterns of the top performers (topic + title shape).")
        else:
            insights.append("No view data yet — too early; revisit after a few videos accrue views.")

        report = dict(updated=datetime.now(timezone.utc).isoformat(),
                      channel=dict(videos=int(chstat.get("videoCount", 0)),
                                   views=int(chstat.get("viewCount", 0)),
                                   subscribers=int(chstat.get("subscriberCount", 0))),
                      videos=videos, insights=insights,
                      note="CTR/retention need the Analytics API (re-auth); these are Data-API stats.")
        json.dump(report, open(OUT, "w"), indent=2)
        print(f"analytics: {len(videos)} videos, {report['channel']['views']} total views -> {OUT}")
        for v in videos[:5]:
            print(f"  {v['views']:>6} views  {v.get('topic') or '?':<18} {v['title'][:48]}")
    except Exception as e:
        print(f"analytics skipped (non-fatal): {e}")
        sys.exit(0)


if __name__ == "__main__":
    main()
