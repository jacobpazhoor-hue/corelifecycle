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

def chapter_name(sc):
    """The two-part `Evocative Noun: Plain Explanation` name this chapter is DRAWN with.

    WO-32: the old code ran every level label through pretty(), whose regex only understands the
    retired POV ladder's "LEVEL 01 · SOMETHING". The crayon format labels a chapter scene
    `level="CH n"` and carries the real name in its chapter CARD, so pretty() was minting a chapter
    list that read "Ch 1 … Ch 5" — YouTube chapters with no names in them. Read the card first and
    keep pretty() only as the legacy fallback.
    """
    card = sc.get("card") or {}
    if isinstance(card, dict) and card.get("kind") == "chapter" and card.get("title"):
        title, sub = str(card["title"]).strip(), str(card.get("subtitle", "")).strip()
        return f"{title}: {sub}" if sub else title
    return pretty(sc["level"])

# chapters: 0:00 intro, then each scene that starts a new chapter/level
chapters = ["0:00 Intro"]
for sc in tl["scenes"]:
    if sc.get("level"):
        chapters.append(f"{ts(sc['startFrame'])} {chapter_name(sc)}")

# WO-32: the writer now puts its own chapter timestamps inside BODY (docs/AUTOPILOT_PROMPT.txt step
# 4 asks for them, using the exact two-part names). Appending this block on top of that published a
# SECOND, duplicate list. YouTube reads the first list that starts at 0:00, so the writer's wins and
# ours was pure noise in the description. Append only when BODY has no timestamp list of its own.
_has_own_chapters = bool(re.search(r"(?m)^\s*0?0:00\b", BODY))
_chapter_block = "" if _has_own_chapters else "⏱ Chapters\n" + "\n".join(chapters) + "\n\n"

description = (
    f"{HOOK}\n\n{BODY}\n\n"
    f"{_chapter_block}"
    # WO-32: the two lines that used to sit here — "Watch the whole series — every life, every
    # level" and "Subscribe to climb — a new life every episode" — were POV-ladder copy. They
    # promised a series of lives to a channel that now explains real companies, and BIBLE.md/
    # AUTOPILOT_PROMPT.txt explicitly ban the binge line. Replaced with a format-neutral link.
    "▶ More explainers: https://www.youtube.com/@corelifecycle\n\n"
    f"{HASHTAGS}\n\n"
    "Dramatization for educational and entertainment purposes."
)

# GROWTH OPS (Step 6): a debate PINNED COMMENT (comments are an active-engagement ranking signal;
# challenge-style pins get ~37% more replies) + a "which life next?" COMMUNITY POLL suggestion. The
# creative agent may set meta["pinned"] / meta["poll"]; else derive sensible defaults from the title.
# WO-32: the old defaults asked "would you have made it past Level 1?" and "which life should you
# live next?" — both POV-ladder questions with no meaning on a third-person explainer about a real
# company. The creative agent normally sets meta["pinned"]/meta["poll"]; these are the fallbacks.
_ch = next((sc for sc in tl["scenes"] if sc.get("level")), None)
_ch1 = chapter_name(_ch).split(":")[0] if _ch else "the first chapter"
pinned = meta.get("pinned") or (
    f"Which part of this did you not know before — and which number did you have to re-read? "
    f"Start from \"{_ch1}\". 👇 (reply, don't just like)")
poll = meta.get("poll") or "Which subject should we explain next? (drop it below — top comment gets made)"

# --- non-fatal packaging lint (Phase 1: title/thumbnail CTR rules; warns only, never HALTs) ---
STOP = {"a","an","the","at","of","to","in","as","is","you","your","every","level","life",
        "and","or","for","on","it","be"}
def _words(s): return {w for w in re.findall(r"[a-z0-9]+", (s or "").lower()) if w not in STOP and len(w) > 2}
_warn = []
_n = len(TITLE)
# WO-32: the crayon canon's title band is 36–64 chars (CRAYON_BIBLE §9, measured on 28 reference
# titles) and it BANS the stakes parenthetical the old POV lint used to demand — a lint that told
# the log to add "(Most Die at Level 4)" to a third-person explainer title.
if _n < 36 or _n > 64:
    _warn.append(f"title is {_n} chars (crayon band 36–64 — CRAYON_BIBLE §9)")
if "(" in TITLE or "[" in TITLE:
    _warn.append("title carries a parenthetical — the crayon canon has no stakes parenthetical")
# "Explained Like You're 5" IS the dominant formula, so only the POV-ladder phrasings are flagged.
if re.search(r"\bEvery Level\b|\bYour Life\b|\bAt Every\b", TITLE, re.I):
    _warn.append("title uses retired POV-ladder wording ('Every Level' / 'Your Life as…')")
# WO-32: when the writer supplies its own chapter list, those timestamps are computed BY HAND and
# nothing has ever checked them against the render. Measured on the 2026-08-12 Lehman build they were
# up to 2m05s out (00:58 written vs 0:32 rendered), which publishes wrong YouTube chapter markers.
# Warn per chapter; the reviewer is told to treat a drift as a real defect.
if _has_own_chapters:
    _own = re.findall(r"(?m)^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s", BODY)
    _real = [sc["startFrame"] / fps for sc in tl["scenes"] if sc.get("level")]
    _own_s = [int(a) * 3600 + int(b) * 60 + int(c) if c else int(a) * 60 + int(b) for a, b, c in _own]
    for i, real in enumerate(_real, start=1):   # entry 0 is the 0:00 cold open
        if i < len(_own_s) and abs(_own_s[i] - real) > 5:
            _warn.append(f"description chapter {i} is written at {_own_s[i]//60}:{_own_s[i]%60:02d} "
                         f"but renders at {int(real)//60}:{int(real)%60:02d} — wrong YouTube chapter marker")
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
