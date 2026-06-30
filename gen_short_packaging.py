#!/usr/bin/env python3
"""Build the upload kit for the auto-cut Short -> out/short_kit.json (read by yt_upload --kit).
Data-driven from ops/episode_meta.json; links back to the full video (latest out/uploads.json).
"""
import os, json

ROOT = os.path.dirname(os.path.abspath(__file__))
meta = json.load(open(os.path.join(ROOT, "ops", "episode_meta.json")))
thumb = meta.get("thumb", {})

profession = " ".join(w for w in [thumb.get("line1", ""), thumb.get("line2", "")] if w).title().strip() \
    or meta.get("topic", "").replace("_", " ").title()

# link to the full video (most recent upload), if known
full_url = ""
up = os.path.join(ROOT, "out", "uploads.json")
if os.path.exists(up):
    ups = json.load(open(up))
    if ups:
        full_url = ups[-1].get("url", "")

title = f"Every Level of a{'n' if profession[:1] in 'AEIOU' else ''} {profession} 💰 #shorts"[:100]
hook = meta.get("hook", "")
tag = thumb.get("tag", "")
desc = (f"{hook}\n\n{tag}\n\n"
        + (f"▶ Watch the full climb: {full_url}\n\n" if full_url else "")
        + "#shorts #everylevel " + meta.get("hashtags", "").replace("#everylevel", "").strip()
        + "\n\nDramatization for educational and entertainment purposes.")
tags = (meta.get("tags", []) + ["shorts", "every level", f"every level of a {profession.lower()}"])[:40]

kit = {"video": "out/short.mp4", "title": title, "description": desc[:4900], "tags": tags,
       "privacy": "public", "playlist": "Shorts", "categoryId": "27"}
out = os.path.join(ROOT, "out", "short_kit.json")
json.dump(kit, open(out, "w"), indent=2)
print("SHORT TITLE:", title)
print("links to:", full_url or "(full video URL not yet known)")
print("wrote", out)
