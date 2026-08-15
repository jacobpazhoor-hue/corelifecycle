#!/usr/bin/env python3
"""Packaging step: builds title + description + auto chapters + tags into out/upload_kit.json
(read by scripts/yt_upload.py), per docs/PACKAGING_PLAYBOOK.md.

DATA-DRIVEN: all per-video copy comes from ops/episode_meta.json (the creative agent edits THAT
JSON, never this file). Chapters are auto-generated from src/timeline.json so timestamps are exact.
"""
import os, json, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
META_PATH = os.path.join(ROOT, "ops", "episode_meta.json")
meta = json.load(open(META_PATH))
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

def ts_pad(frame):
    """MM:SS with a ZERO-PADDED minute (H:MM:SS past the hour).

    The description's in-BODY chapter list has always used the padded form ("00:32"), and
    scripts/review_facts.py matches it with `^(\\d{2}:\\d{2})\\s`. Emitting the unpadded ts() there
    would silently blind that checker, so the rewrite below keeps the padded convention.
    """
    s = int(frame / fps)
    return f"{s//3600}:{(s%3600)//60:02d}:{s%60:02d}" if s >= 3600 else f"{s//60:02d}:{s%60:02d}"

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

# ==================================================================================================
# CHAPTERS — ONE SOURCE OF TRUTH: THE CHAPTER CARDS THAT ARE ACTUALLY DRAWN ON SCREEN
# ==================================================================================================
# THE DEFECT (found by scripts/review_facts.py on its first run against the published Lehman
# episode, 2026-08-15): every one of the five description chapter names differed from the card the
# viewer sees. Description "The Machine: How Lehman Turned Houses Into Money" vs card "The Machine:
# How Houses Became Money"; "…Hid Fifty Billion Dollars" vs "…Hid Billions"; "Three Days at the
# Federal Reserve" vs "Three Days at the New York Fed"; and so on for all five. Timestamps were
# fine (0.4s worst drift). It was the NAMES that forked.
#
# THE ROOT CAUSE is structural, not a typo. WO-32 asked the writer to put its own chapter list
# inside ops/episode_meta.json's `body` (so YouTube reads the writer's list, not a duplicate one
# appended underneath). From that moment the chapter names existed in TWO independent places:
#   1. content.py           card=dict(kind="chapter", title=…, subtitle=…)   <- what is DRAWN
#   2. ops/episode_meta.json  body: "03:14 The Machine: How Lehman Turned…"  <- what is PUBLISHED
# and gen_packaging.py, seeing a writer-supplied list, simply suppressed its own card-derived block
# and published the hand-typed copy verbatim. Two copies kept in sync by hand always drift, and the
# very first live episode proved it: 5 of 5 wrong.
#
# THE FIX: the writer no longer gets to NAME the chapters in the description. The cards win, always.
# The block below REWRITES the writer's in-body chapter list from the rendered timeline — exact
# names, exact timestamps — and writes the reconciled body back to ops/episode_meta.json so every
# downstream consumer (the description, review_facts.py, the reviewer, tomorrow's writer) sees the
# same single list. The writer's prose is untouched; only the timestamp lines are replaced.
#
# WHAT CAN STILL GO WRONG, AND WHY IT HALTS: if the writer's list has a different NUMBER of chapter
# entries than the episode has chapter cards, the two cannot be aligned and a silent guess would
# publish wrong markers. That is a real authoring defect (an invented or dropped chapter), so it
# HALTs loudly instead. daily_autopilot.sh treats a non-zero exit here as a hard stop.

# chapters: 0:00 intro, then each scene that starts a new chapter/level
CARD_CHAPTERS = [(sc["startFrame"], chapter_name(sc)) for sc in tl["scenes"] if sc.get("level")]
chapters = ["0:00 Intro"] + [f"{ts(f)} {n}" for f, n in CARD_CHAPTERS]

# A timestamped chapter line: "03:14 The Machine: How Houses Became Money" (or H:MM:SS past an hour)
_TS_LINE = re.compile(r"^[ \t]*(\d{1,2}):(\d{2})(?::(\d{2}))?[ \t]+(\S.*?)[ \t]*$")

def _parse_ts_line(line):
    m = _TS_LINE.match(line)
    if not m:
        return None
    a, b, c = m.group(1), m.group(2), m.group(3)
    sec = int(a) * 3600 + int(b) * 60 + int(c) if c else int(a) * 60 + int(b)
    return sec, m.group(4)

def _find_chapter_block(lines):
    """(start, end) of the contiguous run of timestamp lines that opens at 0:00 — the writer's list.

    YouTube only recognises a chapter list whose first entry is 00:00, which is exactly what
    _has_own_chapters keys off, so that is what we look for here too.
    """
    for i, line in enumerate(lines):
        p = _parse_ts_line(line)
        if p and p[0] == 0:
            j = i
            while j < len(lines) and _parse_ts_line(lines[j]):
                j += 1
            return i, j
    return None

def _halt(msg):
    print("\n  ✖ PACKAGING HALT:", msg, file=sys.stderr)
    print("    The description's chapter list could not be reconciled with the chapter cards that "
          "are drawn on screen.\n    Fix the chapter list in ops/episode_meta.json 'body' (one line "
          "per chapter card, plus the 0:00 cold open)\n    or fix the chapter cards in content.py, "
          "then re-run. Nothing was written.", file=sys.stderr)
    raise SystemExit(1)

_body_lines = BODY.split("\n")
_span = _find_chapter_block(_body_lines)
_chapter_fixes = []

if _span:
    _i, _j = _span
    _writer = [_parse_ts_line(l) for l in _body_lines[_i:_j]]
    # A cold open sits at 0:00 with no card of its own; the card list starts later. If a card DOES
    # start at frame 0 the lists align 1:1 and there is no cold-open entry to preserve.
    _lead = 0 if (CARD_CHAPTERS and CARD_CHAPTERS[0][0] == 0) else 1
    _expected = len(CARD_CHAPTERS) + _lead
    if len(_writer) != _expected:
        _halt(f"the description lists {len(_writer)} timestamped entries but the episode draws "
              f"{len(CARD_CHAPTERS)} chapter cards (expected {_expected} lines: "
              f"{_lead} cold open + {len(CARD_CHAPTERS)} chapters).")

    _new = []
    if _lead:
        # The cold open has no card, so nothing can contradict its name — keep the writer's wording,
        # normalised to 0:00.
        _new.append(f"{ts_pad(0)} {_writer[0][1]}")
    for (frame, name), (osec, oname) in zip(CARD_CHAPTERS, _writer[_lead:]):
        _new.append(f"{ts_pad(frame)} {name}")
        if oname != name:
            _chapter_fixes.append(f"name @{ts_pad(frame)}: description said {oname!r} — card says {name!r}")
        if abs(osec - frame / fps) > 5:
            _chapter_fixes.append(
                f"time for {name!r}: description said {osec//60:02d}:{osec%60:02d} — renders at {ts_pad(frame)}")

    _body_lines[_i:_j] = _new
    BODY = "\n".join(_body_lines)

    # HARD VERIFY — re-read what we just built and prove, line by line, that the published chapter
    # names are byte-identical to the drawn card names. A mismatch here means the rewrite itself is
    # broken, and a broken rewrite must never reach YouTube.
    _check = _find_chapter_block(BODY.split("\n"))
    _got = [_parse_ts_line(l) for l in BODY.split("\n")[_check[0]:_check[1]]] if _check else []
    _got_names = [n for _, n in _got[_lead:]]
    _want_names = [n for _, n in CARD_CHAPTERS]
    if _got_names != _want_names:
        _halt(f"post-rewrite verification failed — published {_got_names} but the cards say {_want_names}.")

    if _chapter_fixes:
        print("  ⚠ packaging: chapter list did not match the chapter cards — REWRITTEN from the "
              "rendered timeline (the cards are the single source of truth):")
        for f in _chapter_fixes:
            print("      ·", f)
        meta["body"] = BODY
        json.dump(meta, open(META_PATH, "w"), indent=2, ensure_ascii=False)
        print("      → reconciled ops/episode_meta.json 'body' so every consumer reads one list")
    else:
        print(f"  ✓ packaging: description chapter names match all {len(CARD_CHAPTERS)} chapter cards exactly")

# WO-32: the writer now puts its own chapter timestamps inside BODY (docs/AUTOPILOT_PROMPT.txt step
# 4 asks for them, using the exact two-part names). Appending this block on top of that published a
# SECOND, duplicate list. YouTube reads the first list that starts at 0:00, so the writer's wins and
# ours was pure noise in the description. Append only when BODY has no timestamp list of its own.
_has_own_chapters = _span is not None
_chapter_block = "" if _has_own_chapters else "⏱ Chapters\n" + "\n".join(chapters) + "\n\n"
if not _has_own_chapters:
    print(f"  ✓ packaging: no writer chapter list — appended the card-derived one "
          f"({len(CARD_CHAPTERS)} chapters)")

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
# WO-32 measured the writer's hand-typed timestamps up to 2m05s out (00:58 written vs 0:32
# rendered), which published wrong YouTube chapter markers. Those are now REWRITTEN from the
# timeline above rather than warned about, so the drift cannot survive to YouTube — but the
# reviewer is still told what the writer got wrong, because a writer that mistimes or misnames its
# own chapters is a signal worth reading. (The per-chapter detail is printed above; this is the one
# line that lands in the warning stream the reviewer scans.)
if _chapter_fixes:
    _warn.append(f"{len(_chapter_fixes)} chapter list defect(s) corrected from the rendered timeline "
                 f"— the writer's description did not match the chapter cards (detail above)")
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
