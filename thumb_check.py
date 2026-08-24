#!/usr/bin/env python3
"""THUMBNAIL FIELD-COMBINATION CHECK — catches, in milliseconds, the one `ops/episode_meta.json`
combination that HALTS the Thumbnail render.  Run by gate.py and by build.py; also runnable alone:

    python3 thumb_check.py            # prints what it derived + what it checked, exits 1 on a fail

WHY THIS EXISTS.  `src/thumbs.tsx` THROWS when `thumb.kicker` is non-empty and the chosen archetype
has no kicker slot (`wordmark`, `beforeafter`).  That throw is correct and deliberate — it replaced a
SILENT DROP of writer copy that the QA watch caught — but it fires inside the renderer, and the
renderer is the last and most expensive step of the night.  The nightly run dispatches a cloud render
that takes ~40 minutes and only then draws the thumbnail, so an unrenderable pair costs a whole
night's upload:

    runs 32681047721, 32697183054, 32710038527 (the `ftx` episode) all died the same way, three
    consecutive nights, on `beforeafter` + kicker "$32 BILLION" — a combination knowable from
    ops/episode_meta.json alone, before a single frame was rendered.

The creative agent picks `thumb.archetype` and writes `thumb.kicker` independently (docs/
AUTOPILOT_PROMPT.txt now states the constraint), so the pair can still come out wrong; this makes it
wrong CHEAPLY, in the gate, seconds after the build starts.

WHY IT PARSES THE TSX INSTEAD OF LISTING THE NAMES.  A second hardcoded copy of `ARCHES` /
`KICKERLESS_ARCHES` would drift out of sync with the renderer the way this project's staging anchors
did (see staging_check.py's header for what that cost).  Both sets are read straight out of
`src/thumbs.tsx`, so adding a tenth archetype, or giving `wordmark` a kicker slot, updates this check
in the same edit.  A source file this cannot parse is a HARD FAILURE, never a skipped check.

WHAT IT REPLICATES.  `pickName()` in src/thumbs.tsx resolves the archetype in two steps, and the
SECOND one matters here: an archetype name that is not a key of ARCHES is ignored and the dispatcher
falls back to a deterministic hash of the topic — which can itself land on `wordmark`/`beforeafter`.
So checking `thumb.archetype` alone would miss the case where a typo'd name hashes onto a kickerless
layout.  `resolve_archetype()` below is a line-for-line port of `pickName()`, hash included.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
THUMBS = os.path.join(ROOT, "src", "thumbs.tsx")
META = os.path.join(ROOT, "ops", "episode_meta.json")


class ThumbParseError(Exception):
    """src/thumbs.tsx could not be read for the sets this check is built on."""


_BLOCK_COMMENT = re.compile(r"/\*.*?\*/", re.S)
_LINE_COMMENT = re.compile(r"(?<![:\w])//[^\n]*")


def _strip_comments(s):
    return _LINE_COMMENT.sub("", _BLOCK_COMMENT.sub("", s))


def _match_brackets(s, i, open_c, close_c):
    """Index of the bracket closing the one at `i`, or -1."""
    depth = 0
    while i < len(s):
        if s[i] == open_c:
            depth += 1
        elif s[i] == close_c:
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1


def _arches_order(src):
    """The keys of `const ARCHES = {...}`, IN SOURCE ORDER — `ORDER` in thumbs.tsx is
    `Object.keys(ARCHES)`, and the hash fallback indexes into it, so the order is load-bearing."""
    m = re.search(r"\bconst\s+ARCHES\b", src)
    if not m:
        raise ThumbParseError(f"no `const ARCHES` in {os.path.relpath(THUMBS, ROOT)}")
    i = src.find("{", m.end())
    j = _match_brackets(src, i, "{", "}") if i >= 0 else -1
    if j < 0:
        raise ThumbParseError(f"`const ARCHES` in {os.path.relpath(THUMBS, ROOT)} has no balanced "
                              f"object literal, so the archetype names cannot be read")
    body = src[i + 1:j]
    keys, depth = [], 0
    for tok in re.finditer(r"[{\[(]|[}\])]|(\w+)\s*:", body):
        if tok.group(1) is not None:
            if depth == 0:
                keys.append(tok.group(1))
        elif tok.group(0)[0] in "{[(":
            depth += 1
        else:
            depth -= 1
    if not keys:
        raise ThumbParseError("`const ARCHES` parsed as EMPTY — checker bug, not an episode defect")
    return keys


def _kickerless(src, order):
    """The names in `const KICKERLESS_ARCHES = new Set([...])`."""
    m = re.search(r"\bconst\s+KICKERLESS_ARCHES\b[^\[]*\[", src)
    if not m:
        raise ThumbParseError(f"no `const KICKERLESS_ARCHES = new Set([...])` in "
                              f"{os.path.relpath(THUMBS, ROOT)}")
    j = _match_brackets(src, m.end() - 1, "[", "]")
    if j < 0:
        raise ThumbParseError("`const KICKERLESS_ARCHES` has no balanced array literal")
    names = re.findall(r"['\"]([^'\"]+)['\"]", src[m.end():j])
    if not names:
        raise ThumbParseError("`const KICKERLESS_ARCHES` parsed as EMPTY — if the renderer really "
                              "has no kickerless layouts any more, delete this check")
    unknown = [n for n in names if n not in order]
    if unknown:
        raise ThumbParseError(f"KICKERLESS_ARCHES names {unknown} that are not keys of ARCHES")
    return set(names)


def arch_sets():
    """(archetype names in ARCHES order, set of the ones with no kicker slot) — read from thumbs.tsx."""
    try:
        with open(THUMBS) as f:
            src = _strip_comments(f.read())
    except OSError as e:
        raise ThumbParseError(f"cannot read {os.path.relpath(THUMBS, ROOT)}: {e}")
    order = _arches_order(src)
    return order, _kickerless(src, order)


def resolve_archetype(meta, order):
    """The archetype the renderer will ACTUALLY draw — a line-for-line port of `pickName()` in
    src/thumbs.tsx, including the topic-hash fallback taken when `thumb.archetype` is missing or is
    not a key of ARCHES."""
    t = meta.get("thumb") or {}
    name = t.get("archetype")
    if name and name in order:
        return name, False
    topic = meta.get("topic") or (t.get("line1") or "").upper() or "x"
    h = 0
    for c in topic:
        h = (h * 31 + ord(c)) & 0xFFFFFFFF          # JS: (h * 31 + c.charCodeAt(0)) >>> 0
    return order[h % len(order)], True


def check(meta=None):
    """(fails, warns) in gate.py's shape. Raises ThumbParseError if thumbs.tsx cannot be read."""
    order, kickerless = arch_sets()
    if meta is None:
        with open(META) as f:
            meta = json.load(f)
    t = meta.get("thumb") or {}
    fails, warns = [], []

    name, hashed = resolve_archetype(meta, order)
    declared = t.get("archetype")
    if declared and hashed:
        warns.append(f"thumb.archetype '{declared}' is not a src/thumbs.tsx archetype — the "
                     f"dispatcher is falling back to the topic hash and will draw '{name}' instead, "
                     f"which breaks the no-repeat-in-last-3 rotation. Valid names: "
                     f"{', '.join(order)}")

    kicker = (t.get("kicker") or "").strip()
    if kicker and name in kickerless:
        via = f" (hashed from topic, because thumb.archetype '{declared}' is unknown)" if hashed else ""
        fails.append(
            f"thumb.kicker \"{kicker}\" cannot be drawn by the \"{name}\" archetype{via} — its "
            f"layout has no kicker slot, so src/thumbs.tsx THROWS and the render dies. Either clear "
            f"thumb.kicker (keeps the rotation's chosen archetype — the right fix when the rotation "
            f"lands here), or pick an archetype that carries one: "
            f"{', '.join(k for k in order if k not in kickerless)}")
    return fails, warns


if __name__ == "__main__":
    try:
        _order, _kl = arch_sets()
    except ThumbParseError as e:
        print("THUMB: HALT ❌ —", e)
        sys.exit(1)
    print(f"archetypes ({len(_order)}): {', '.join(_order)}")
    print(f"no kicker slot: {', '.join(sorted(_kl))}")
    _meta = json.load(open(META))
    _name, _hashed = resolve_archetype(_meta, _order)
    print(f"episode '{_meta.get('topic', '?')}' -> archetype '{_name}'"
          f"{' (topic hash)' if _hashed else ''}, kicker "
          f"{json.dumps((_meta.get('thumb') or {}).get('kicker', ''))}")
    _fails, _warns = check(_meta)
    for w in _warns:
        print("  WARN:", w)
    for f in _fails:
        print("  FAIL:", f)
    print("THUMB: PASS ✅" if not _fails else "THUMB: HALT ❌")
    sys.exit(1 if _fails else 0)
