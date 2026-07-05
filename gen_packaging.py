#!/usr/bin/env python3
"""Packaging step: builds title + description + auto chapters + tags into out/upload_kit.json
(read by scripts/yt_upload.py), per docs/PACKAGING_PLAYBOOK.md.

DATA-DRIVEN: all per-video copy comes from ops/episode_meta.json (the creative agent edits THAT
JSON, never this file). Chapters are auto-generated from src/timeline.json so timestamps are exact.
"""
import os, json, re

ROOT = os.path.dirname(os.path.abspath(__file__))
meta = json.load(open(os.path.join(ROOT, "ops", "episode_meta.json")))
tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
fps = tl["fps"]

VIDEO = "out/episode.mp4"          # standardized output name (the daily runner renders to this)
TITLE = meta["title"]             # <70 chars, front-loaded
HOOK = meta["hook"]
BODY = meta["body"]
TAGS = meta["tags"]
HASHTAGS = meta.get("hashtags", "#everylevel")
PLAYLIST = meta.get("playlist", "Every Level")
PRIVACY = meta.get("privacy", "private")   # runner overrides to public on publish

def ts(frame):
    s = int(frame / fps); return (f"{s//3600}:{(s%3600)//60:02d}:{s%60:02d}" if s >= 3600 else f"{s//60}:{s%60:02d}")

def pretty(label):
    m = re.match(r"LEVEL\s*0?(\d+)\s*·\s*(.+)", label)
    return f"Level {m.group(1)}: {m.group(2).title()}" if m else label.title()

# chapters: 0:00 intro, then each scene that starts a new level
chapters = ["0:00 Intro"]
for sc in tl["scenes"]:
    if sc.get("level"):
        chapters.append(f"{ts(sc['startFrame'])} {pretty(sc['level'])}")

description = (
    f"{HOOK}\n\n{BODY}\n\n"
    "⏱ Chapters\n" + "\n".join(chapters) + "\n\n"
    "▶ Watch the whole series — every life, every level: https://www.youtube.com/@corelifecycle\n"
    "Subscribe to climb — a new life every episode.\n\n"
    f"{HASHTAGS}\n\n"
    "Dramatization for educational and entertainment purposes."
)

# GROWTH OPS (Step 6): a debate PINNED COMMENT (comments are an active-engagement ranking signal;
# challenge-style pins get ~37% more replies) + a "which life next?" COMMUNITY POLL suggestion. The
# creative agent may set meta["pinned"] / meta["poll"]; else derive sensible defaults from the title.
_lvl = next((sc["level"] for sc in tl["scenes"] if sc.get("level")), None)
pinned = meta.get("pinned") or (
    f"Be honest — would you have made it past {pretty(_lvl).split(':')[0] if _lvl else 'Level 1'}? "
    "And which was the point of no return? 👇 (reply, don't just like)")
poll = meta.get("poll") or "Which life should you live next? (drop it below — top comment gets made)"

# --- non-fatal packaging lint (Phase 1: title/thumbnail CTR rules; warns only, never HALTs) ---
STOP = {"a","an","the","at","of","to","in","as","is","you","your","every","level","life",
        "and","or","for","on","it","be"}
def _words(s): return {w for w in re.findall(r"[a-z0-9]+", (s or "").lower()) if w not in STOP and len(w) > 2}
_warn = []
_n = len(TITLE)
if _n < 40 or _n > 65:
    _warn.append(f"title is {_n} chars (ideal 40–65; hook should sit in the first ~40)")
if "(" not in TITLE and "[" not in TITLE:
    _warn.append("title has no stakes parenthetical — '(Most Die at Level 4)'-style raises CTR ~15–20%")
if re.search(r"\bArchitect\b", TITLE):
    _warn.append("title uses the banned generic word 'Architect'")
_thumb = meta.get("thumb", {}) or {}
_tw = _words(" ".join(str(_thumb.get(k, "")) for k in ("keyword", "povline", "line1", "line2", "question")))
_overlap = _tw & _words(TITLE)
if _overlap:
    _warn.append(f"thumbnail repeats title word(s) {sorted(_overlap)} — SYNERGY RULE: thumbnail should add NEW tension, not echo the title")
for w in _warn:
    print("  ⚠ packaging:", w)

kit = {"video": VIDEO, "title": TITLE, "description": description, "tags": TAGS,
       "thumbnail": "out/thumbnail.png", "playlist": PLAYLIST, "privacy": PRIVACY, "categoryId": "27",
       "pinned_comment": pinned, "community_poll": poll}
out = os.path.join(ROOT, "out", "upload_kit.json")
os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump(kit, open(out, "w"), indent=2)
print("TITLE:", TITLE, f"({len(TITLE)} chars)")
print("\nDESCRIPTION:\n" + description)
print("\nwrote", out)
