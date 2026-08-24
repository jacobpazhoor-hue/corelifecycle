#!/usr/bin/env python3
"""PRE-PUBLISH AUDIT — the full sweep that must pass before anything reaches YouTube.

WHY THIS EXISTS (2026-08-24)
----------------------------
Two things nearly shipped this month, and only one of them was stopped by a rule.

  1. 2026-08-17 — a render the reviewer had REJECTED went public because a human ran
     `yt_upload.py --privacy public` by hand against out/episode.mp4 mid-revision. That one is
     closed by scripts/upload_guard.py, which binds an approval to the render's sha256.

  2. 2026-08-24 — scene `t169` asserted that Gary Wang and Nishad Singh were "still waiting on
     their own sentences". Both were sentenced in late 2024, and docs/research/ftx.md never said
     anything of the kind. NOTHING in this pipeline checked that claim. It was caught because the
     reviewer happened to look. A false statement about two named living people was one approval
     away from a public video, and the only thing between it and the channel was a judgement call.

The second is the dangerous one, and this file is the answer to it: the reviewer's diligence is
now backed by a rule that runs every night whether anyone remembers it or not.

WHAT IT IS NOT
--------------
This is NOT a fact checker. It cannot know whether a sentence is true. It checks something
narrower, mechanical and therefore reliable: **is this claim traceable to the research file the
writer was required to produce?** docs/AUTOPILOT_PROMPT.txt step 2 already says every date, figure,
quotation and named person must come from docs/research/<slug>.md and that "anything still
unverified when you write must be CUT, not softened". Until now that instruction had no enforcement
at all. Now the clear violations HALT and the judgement calls are printed for a human.

The failure this is built around is UNTRACEABILITY, not falsity — and untraceability is the actual
risk surface. The 2026-08-24 reviewer found three more claims in the same episode that are TRUE in
reality but not supported anywhere in docs/research/ftx.md: Brady/Bündchen/Curry vouching for FTX,
a Forbes superlative, and a quotation staged at the wrong hearing. Every one of them is a claim
about a named real person that nobody could check against the sources the episode itself cites.

FAIL vs WARN — THE RULE THIS FILE OBEYS
---------------------------------------
This channel has lost eight days this month to guards firing on conditions nobody told the writer
about, so a check without a matching rule in docs/AUTOPILOT_PROMPT.txt is a recurring outage, not a
safety net. Every FAIL here has a corresponding rule written into that prompt (see §"THE PUBLISH
AUDIT" there). Where a false positive is plausible — heuristic name extraction, spelled-out number
parsing, fuzzy quote matching — the finding is a WARN that names the scene and asks for judgement,
not a HALT. The FAIL/WARN split for every check is stated in the CHECKS table below and was chosen
by MEASURING each heuristic against the shipping ftx episode, not by guessing.

CHECKS, cheapest first (milliseconds before the 267MB hash)
-----------------------------------------------------------
  A  INPUTS      every file the publish path reads exists, is non-empty and parses      FAIL
  B  PACKAGING   kit title/tags/playlist == ops/episode_meta.json; description carries
                 hook+body; YouTube's hard limits (title 100, description 4900 — the
                 uploader TRUNCATES silently at 4900 and the chapter block lives in the
                 tail); kit["video"] is the video being audited                          FAIL
     B'          the title has shipped before (out/uploads.json / produced_topics.json)   WARN
  C  CHAPTERS    the kit description's timestamped chapter list == the chapter CARDS in
                 src/timeline.json, name for name and second for second                   FAIL
  D  THUMBNAIL   out/thumbnail.png exists, is a real PNG, >= 1280 wide, 16:9, under
                 YouTube's 2MB limit; thumb_check.check() passes; thumbnail copy is
                 ASCII-only (the vendored Montserrat is a LATIN SUBSET)                   FAIL
     D'          a number drawn on the thumbnail that appears nowhere in the script       WARN
  E  TIMELINE    src/timeline.json scene ids == content.SCENES ids, BOTH directions, and
                 each scene's narration matches                                           FAIL
  F  CLAIMS      traceability against docs/research/<topic>.md — see below
  G  RENDER      the mp4's own mvhd duration matches src/timeline.json's runtime; sha256
                 of the render + of every source file, recorded for upload_guard.py       FAIL

  F, in detail (all measured against the shipping ftx episode before the level was chosen):
    F1  a PENDING/ONGOING legal status ("still waiting on", "is serving", "awaiting
        sentencing", "yet to be tried", "remains in custody") asserted about a named
        person, where docs/research/<slug>.md carries no pending-status statement about
        that person.  THIS IS THE t169 CHECK.                                             FAIL
    F2  a four-digit YEAR in the narration, on-screen text, title or description that
        appears nowhere in the research file.  Measured: 0 false positives on ftx.        FAIL
    F3  a quotation of >= 6 words whose best fuzzy match anywhere in the research file
        is below 0.55.  Measured on ftx: real quotes score 0.93; a card that CONDENSES a
        sourced quote scores 0.70 (hence the WARN band).                                  FAIL
    F3' a quotation scoring 0.55-0.85 — sourced but reworded on screen.                   WARN
    F4  a resolved legal-status claim (convicted/sentenced/charged/pleaded/testified/
        acquitted/pardoned/sued/fined) about a named person, where the research file
        carries no status statement about that person at all.                             WARN
    F5  a name that looks like a person and appears NOWHERE in the research file.
        THIS IS THE BRADY/BÜNDCHEN/CURRY CHECK. Regex name extraction cannot tell a
        person from a company or a place, so it warns and says so.                        WARN
    F6  a dollar figure that does not appear in the research file. Spelled-out number
        parsing ("a hundred and thirty-five million") is genuinely unreliable, so this
        surfaces for judgement rather than halting.                                       WARN
    F7  a superlative ("richest", "biggest", "first", "the only") attached to a named
        person, where that superlative stem appears nowhere in the research file.
        THIS IS THE FORBES CHECK.                                                         WARN

Usage
-----
    python3 scripts/prepublish_audit.py                  # sweep the script; no render needed
    python3 scripts/prepublish_audit.py out/episode.mp4  # + bind the verdict to those exact bytes

Writes out/review/prepublish_audit.json. Exit 0 = clear to publish, 1 = HALT, 2 = the audit itself
could not run (which is also a HALT — see upload_guard.py; an audit that could not run is not a
pass). scripts/upload_guard.py refuses to publish without a PASSING record whose recorded source
hashes still match the files on disk, so editing content.py after the audit invalidates it exactly
the way re-rendering invalidates the reviewer's approval.
"""
import os
import sys
import re
import json
import hashlib
import struct
import difflib
import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

AUDIT_PATH = os.path.join(ROOT, "out", "review", "prepublish_audit.json")

# The files whose bytes this verdict speaks for. upload_guard.py re-hashes every one of them at
# upload time; if any has moved, the audit no longer describes what is about to be published.
SOURCE_FILES = ["content.py", "src/timeline.json", "ops/episode_meta.json", "out/upload_kit.json"]

# YouTube's own hard limits. The uploader posts description[:4900] with no warning (yt_upload.py),
# and the chapter block sits at the END of the description, so silent truncation eats the chapters.
YT_TITLE_MAX = 100
YT_DESC_MAX = 4900
YT_TAGS_MAX = 50
YT_THUMB_BYTES = 2 * 1024 * 1024
THUMB_MIN_W = 1280


class AuditError(Exception):
    """The audit could not be performed. NOT the same as 'the episode failed the audit'."""


# ==================================================================================================
# text extraction
# ==================================================================================================

# PROSE vs DISPLAY. Everything here is audited for dates, figures and quotations. Only PROSE is
# audited for NAMED PEOPLE, and the reason is measured: card titles are Title Case ("A Trader's Bet
# on Crypto") and labels/overlays are ALL CAPS ("ALL SEVEN COUNTS", "POLITICAL DONATIONS"), so a
# capitalised-run name detector reads both as names. Run on the display copy it produced 20 warnings
# on the shipping ftx episode and every single one was a false positive — a warning list nobody can
# act on is the same as no check at all, and this project has already lost days to guards that fired
# without being actionable. Dates and figures have no such problem, so they stay on everything.
PROSE_FIELDS = ("narration", "card.text", "dialogue.text", "hook", "body")


def is_prose(field):
    return field in PROSE_FIELDS or field.startswith("bubbles[")


def scene_texts(scene):
    """[(field, text)] — every string in a scene a viewer can READ or HEAR.

    On-screen copy is audited for dates, figures and quotations exactly as hard as narration:
    t073's `labels=["THE NEW J.P. MORGAN"]` contradicted its own narration and was caught by a
    human, not by a check.
    """
    out = [("narration", scene.get("narration") or "")]
    card = scene.get("card")
    if isinstance(card, dict):
        for k in ("title", "subtitle", "text", "kicker"):
            if card.get(k):
                out.append((f"card.{k}", str(card[k])))
    ov = scene.get("overlay")
    if isinstance(ov, dict):
        for k in ("big", "sub"):
            if ov.get(k):
                out.append((f"overlay.{k}", str(ov[k])))
    dlg = scene.get("dialogue")
    if isinstance(dlg, dict) and dlg.get("text"):
        out.append(("dialogue.text", str(dlg["text"])))
    for i, b in enumerate(scene.get("bubbles") or []):
        if isinstance(b, dict) and b.get("text"):
            out.append((f"bubbles[{i}].text", str(b["text"])))
    for i, lab in enumerate(scene.get("labels") or []):
        if lab:
            out.append((f"labels[{i}]", str(lab)))
    return [(f, t) for f, t in out if t.strip()]


# The description is not prose all the way down: it carries the chapter list (Title Case, one line
# per chapter) and a SOURCES paragraph stuffed with case names and outlet names. Scanning those for
# people produced "Cold Open", "Years SOURCES" and "Fried Actually Lost". Keep the paragraphs.
_TS_ONLY = re.compile(r"^[ \t]*\d{1,2}:\d{2}(?::\d{2})?[ \t]+\S")


def body_prose(body):
    """The writer's prose paragraphs from a description — no chapter list, no SOURCES block."""
    kept = []
    for line in (body or "").split("\n"):
        if _TS_ONLY.match(line):
            continue
        if re.match(r"^\s*(CHAPTERS|SOURCES|TIMESTAMPS)\b", line, re.I):
            continue
        kept.append(line)
    return "\n".join(kept)


def normalize(text):
    """Lowercase, de-hyphenate, strip punctuation — the form both sides of a comparison use."""
    text = re.sub(r"[‐-―−-]", " ", text)
    text = text.lower()
    text = re.sub(r"[^a-z0-9 ]+", " ", text)
    return " ".join(text.split())


# ==================================================================================================
# F1/F4/F5 — named people and their legal status
# ==================================================================================================

# A run of two or more capitalised tokens. Deliberately crude: this is the input to WARNINGS, and
# the one FAIL it feeds (F1) additionally requires pending-status language in the same sentence.
_NAME_TOKEN = r"[A-Z][A-Za-z'À-ɏ]+|[A-Z]\."
NAME_RE = re.compile(r"(?:%s)(?:\s+(?:%s))+" % (_NAME_TOKEN, _NAME_TOKEN))

# Sentence-opening words that are capitalised by grammar, not because they are names. Measured
# against the ftx script: without this list "And Ray", "By January", "But FTX", "Then Binance's",
# "Inside FTX" and "The Bahamas" all present as names.
LEADING_NON_NAMES = {
    "a", "an", "the", "and", "but", "so", "then", "now", "if", "as", "at", "by", "in", "on", "for",
    "from", "with", "within", "under", "over", "inside", "outside", "after", "before", "when",
    "while", "that", "this", "these", "those", "he", "she", "it", "they", "we", "you", "his",
    "her", "its", "their", "our", "your", "no", "not", "nobody", "everyone", "every", "each",
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "there",
    "here", "what", "who", "why", "how", "because", "since", "until", "against", "between",
    "behind", "beyond", "without", "into", "onto", "about", "across", "around", "back", "later",
    "meanwhile", "instead", "still", "even", "only", "just", "both", "another", "some", "most",
}

SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")

# Capitalised phrases that are places, institutions or events, not people. The name detector cannot
# tell them apart and the F5 warning says so, but the ones this format uses every week are worth
# suppressing outright: a warning a writer must skip past every night trains them to skip past all
# of them.
NOT_PEOPLE = {
    "wall street", "main street", "silicon valley", "new york", "united states", "supreme court",
    "white house", "super bowl", "capitol hill", "the bahamas", "hong kong", "south florida",
    "san francisco", "los angeles", "las vegas", "great depression", "world war", "federal reserve",
    "justice department", "new jersey", "united kingdom", "middle east", "east coast", "west coast",
}

# "Staff called him the smartest boss they'd ever had." A collective nobody can look up is not a
# source. The Forbes check is about NAMED outlets, agencies and courts — the ones a viewer could go
# and check — so generic attributors are dropped rather than warned about.
GENERIC_ATTRIBUTORS = {
    "congress", "staff", "magazines", "newspapers", "papers", "reporters", "journalists",
    "prosecutors", "regulators", "investors", "customers", "employees", "executives", "analysts",
    "critics", "lawyers", "media", "press", "friends", "colleagues", "everyone", "people",
    "others", "insiders", "traders", "investigators", "witnesses", "banks", "markets", "courts",
    "senators", "lawmakers", "officials", "supporters", "rivals", "fans", "viewers", "readers",
    "jurors", "auditors", "accountants", "engineers", "developers", "customers", "clients",
}

# UNRESOLVED legal status. This is the highest-value target in the whole audit: it is about real
# people, it goes stale on its own without anyone editing the file, and it is exactly what nearly
# shipped as t169 ("...are still waiting on their own sentences").
PENDING_STATUS = re.compile(r"""(?ix)
  \b(?: still\s+(?:waiting|awaits?|awaiting|faces?|face|faced|fighting)
      | (?:is|are|was|were|remains?|remain)\s+(?:still\s+)?(?:awaiting|serving|appealing|facing|fighting)
      | await(?:s|ed|ing)?\s+(?:\w+\s+){0,2}?(?:sentenc\w*|trial|extradition|verdict|ruling|appeal|charges?)
      | (?:has|have|had)\s+(?:not\s+)?yet\s+to\s+be\b
      | yet\s+to\s+be\s+(?:sentenc\w*|tried|charged|convicted)
      | (?:has|have|had)\s+not\s+(?:yet\s+)?been\s+(?:sentenc\w*|tried|charged|convicted)
      | pending\s+(?:sentenc\w*|trial|appeal|charges?)
      | (?:remains?|stayed|stays)\s+(?:in\s+(?:custody|prison|jail)|behind\s+bars|at\s+large|free)
      | no\s+(?:sentencing\s+)?date\s+(?:has\s+been\s+)?set
      | (?:waiting|wait)\s+on\s+(?:\w+\s+){0,3}?sentenc\w*
      | (?:has|have)\s+(?:never|not)\s+(?:been\s+)?(?:charged|tried|convicted|sentenced)
  )\b""")

# RESOLVED legal status — real, dated events. Weaker signal than PENDING, so F4 only WARNs.
# This is the TRIGGER pattern: it fires on the script, so it is kept narrow and literal.
RESOLVED_STATUS = re.compile(
    r"(?i)\b(?:convicted|conviction|sentenced|sentencing|indicted|indictment|charged|charges|"
    r"pleaded|pled|acquitted|arrested|extradited|paroled|pardoned|testified|"
    r"testimony|sued|settled|fined|disbarred|imprisoned|jailed|deported)\b")

# The EVIDENCE pattern, used only to ask "does the research file say anything about this person's
# legal situation". Deliberately WIDER than the trigger, and stem-based: research files are written
# in the present tense ("Nishad Singh ... later also pleads guilty and cooperates") while the script
# is past tense ("had both pleaded guilty"), so a literal word list finds no evidence for a person
# the file plainly covers and fires a warning at the writer for being right. Strict trigger,
# generous evidence — the asymmetry is the point.
RESEARCH_STATUS = re.compile(
    r"(?i)\b(?:convict\w*|sentenc\w*|indict\w*|charg\w*|plead\w*|pled|plea|guilty|acquit\w*|"
    r"arrest\w*|extradit\w*|parol\w*|pardon\w*|testif\w*|testimon\w*|sue[ds]?|suing|settl\w*|"
    r"fine[ds]|imprison\w*|jail\w*|deport\w*|prosecut\w*|cooperat\w*|trial|custody|prison|"
    r"count[s]?\b|verdict|forfeit\w*)\b")

# SUPERLATIVES. The generic "most/least <word>" branch was dropped after measuring it: it fired on
# ordinary prose ("the most secretive firm on Wall Street", "crypto's most trusted face") where
# nothing factual is being asserted about a person. What is left is the shape that actually goes
# wrong — a ranked, checkable claim.
SUPERLATIVE = re.compile(
    r"(?i)\b(?:richest|biggest|largest|smallest|youngest|oldest|fastest|worst|greatest|"
    r"wealthiest|highest|lowest|poorest|longest|shortest|first|only|last)\b")

# "Forbes called him the richest self-made man alive under thirty." The claim is not the writer's,
# it is ATTRIBUTED to a named source — and docs/research/ftx.md has never heard of Forbes. An
# attribution to an outlet, agency or court that the research file does not cite is unverifiable by
# anyone downstream, which is exactly the gap the 2026-08-24 reviewer found by hand.
ATTRIBUTION = re.compile(
    r"\b([A-Z][A-Za-z&.\u2019\']+(?:\s+[A-Z][A-Za-z&.\u2019\']+){0,2})\s+"
    r"(called|said|reported|estimated|ranked|named|described|wrote|argued|claimed|found|"
    r"declared|valued|listed|crowned|dubbed)\b")


def name_candidates(text):
    """[(name, char_offset)] — capitalised runs, with grammar-capitalised leads stripped."""
    out = []
    for m in NAME_RE.finditer(text):
        toks = m.group(0).split()
        while toks and toks[0].strip(".").lower() in LEADING_NON_NAMES:
            toks = toks[1:]
        if len(toks) >= 2:
            out.append((" ".join(toks), m.start()))
    return out


def research_words(research):
    return set(re.findall(r"[A-Za-z'À-ɏ]+", research))


# str.rstrip("\'s") strips EVERY trailing character in that set, so it turns "Williams" into
# "William" and "Soros" into "Soro" — which made the audit report the U.S. Attorney and George
# Soros as people the research file had never heard of. Strip the possessive as a SUFFIX, once.
_POSSESSIVE = re.compile(r"[\u2019\']s?$")


def bare_token(tok):
    """A name token reduced to the word a research file would contain: no dot, no possessive."""
    return _POSSESSIVE.sub("", tok.strip("."))


def name_is_known(name, rwords):
    """True when EVERY token of the name appears as a word in the research file.

    Token-wise, not substring: the script writes "John Ray" where docs/research/ftx.md writes
    "John J. Ray III", and "Changpeng Zhao" where the research writes 'Changpeng "CZ" Zhao'.
    Both are the same person and a substring test would call both untraceable.
    """
    for tok in name.split():
        t = bare_token(tok)
        if not t:
            continue
        if t not in rwords:
            return False
    return True


def research_units(research):
    """The research file split into the units a claim gets checked against: bullets and sentences.

    A markdown bullet is one fact with its date and its sources attached, which is exactly the
    granularity "does this file say X about this person" needs.
    """
    units, cur = [], []
    for line in research.split("\n"):
        if re.match(r"^\s*[-*]\s+", line) or re.match(r"^\s*\d+\.\s+", line) or not line.strip():
            if cur:
                units.append(" ".join(cur))
            cur = [line.strip()] if line.strip() else []
        else:
            cur.append(line.strip())
    if cur:
        units.append(" ".join(cur))
    out = []
    for u in units:
        out.extend(p for p in SENTENCE_SPLIT.split(u) if p.strip())
    return out


def units_mentioning(units, name):
    """Research units that name this person — matched on the surname plus one other token."""
    toks = [bare_token(t) for t in name.split()]
    toks = [t for t in toks if len(t) > 1]
    if not toks:
        return []
    surname = toks[-1]
    return [u for u in units if surname in u and any(t in u for t in toks[:-1] or [surname])]


# ==================================================================================================
# F2/F6 — dates and figures
# ==================================================================================================

YEAR_RE = re.compile(r"\b(1[5-9]\d{2}|20\d{2})\b")

_ONES = {"zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7,
         "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13,
         "fourteen": 14, "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
         "nineteen": 19, "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60,
         "seventy": 70, "eighty": 80, "ninety": 90}
_MULT = {"thousand": 1e3, "million": 1e6, "billion": 1e9, "trillion": 1e12,
         "k": 1e3, "m": 1e6, "b": 1e9, "t": 1e12}


def _words_to_number(words):
    """'a hundred and thirty five' -> 135; 'fourteen point six' -> 14.6. None if unparseable."""
    total, cur, frac = 0, 0, None
    seen = False
    for w in words:
        w = w.strip(",").lower()
        if not w or w == "and":
            continue
        if w in ("a", "an"):
            cur, seen = 1, True
        elif w == "point":
            frac = []
        elif frac is not None:
            if w in _ONES and _ONES[w] < 10:
                frac.append(str(_ONES[w]))
            else:
                break
        elif w == "hundred":
            cur = (cur or 1) * 100
            seen = True
        elif w in _ONES:
            cur += _ONES[w]
            seen = True
        else:
            return None
    if not seen:
        return None
    total += cur
    if frac:
        return float(f"{total}.{''.join(frac)}")
    return float(total)


def money_amounts(text):
    """Every dollar figure in `text`, as a float number of dollars.

    Both notations, because this script narrates most figures in words ("thirty-two billion
    dollars") and puts the digits on screen ("$32B").
    """
    out = set()
    for m in re.finditer(r"\$\s?([\d,]+(?:\.\d+)?)\s*(thousand|million|billion|trillion|k|m|b|t)?\b",
                         text, re.I):
        val = float(m.group(1).replace(",", ""))
        out.add(val * _MULT.get((m.group(2) or "").lower(), 1))
    for m in re.finditer(r"((?:[A-Za-z]+[\s\-]+){1,7}?)(thousand|million|billion|trillion)\s+dollars",
                         text, re.I):
        n = _words_to_number(re.split(r"[\s\-]+", m.group(1).strip()))
        if n is not None:
            out.add(n * _MULT[m.group(2).lower()])
    return out


def _close(a, b):
    """Same figure, allowing for rounding on screen ($64.8B narrated, $65B on the thumbnail)."""
    if a == b:
        return True
    hi = max(abs(a), abs(b))
    return hi > 0 and abs(a - b) / hi <= 0.02


# ==================================================================================================
# F3 — quotations
# ==================================================================================================

DOUBLE_QUOTE = re.compile(r"[\"“]([^\"“”]{8,400}?)[\"”]")
SINGLE_QUOTE = re.compile(r"(?:(?<=\s)|(?<=^)|(?<=\())'([^']{12,400}?)'(?=[\s.,;:!?)]|$)", re.M)


def quote_score(quote, research_tokens):
    """Best similarity between this quote and any equal-length window of the research file."""
    qt = normalize(quote).split()
    if not qt:
        return 0.0
    win = len(qt) + 4
    best = 0.0
    matcher = difflib.SequenceMatcher(None, qt, [], autojunk=False)
    for i in range(0, max(1, len(research_tokens) - len(qt) + 1)):
        matcher.set_seq2(research_tokens[i:i + win])
        r = matcher.quick_ratio()
        if r <= best:
            continue
        r = matcher.ratio()
        if r > best:
            best = r
        if best > 0.98:
            break
    return best


# ==================================================================================================
# G — the rendered file
# ==================================================================================================

def sha256_file(path, chunk=4 * 1024 * 1024):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for blk in iter(lambda: fh.read(chunk), b""):
            h.update(blk)
    return h.hexdigest()


def mp4_duration_seconds(path):
    """Duration from the mp4's own mvhd atom. Pure stdlib on purpose.

    There is no ffprobe on this machine (only the imageio_ffmpeg wheel's ffmpeg), and shelling out
    to parse stderr is a dependency this check does not need. mvhd is 100 bytes near the front or
    back of the file and gives the timescale and duration directly.
    """
    with open(path, "rb") as fh:
        def walk(end, depth=0):
            while fh.tell() < end and depth < 6:
                head = fh.tell()
                hdr = fh.read(8)
                if len(hdr) < 8:
                    return None
                size, kind = struct.unpack(">I4s", hdr)
                if size == 1:
                    size = struct.unpack(">Q", fh.read(8))[0]
                elif size == 0:
                    size = end - head
                if size < 8:
                    return None
                if kind == b"mvhd":
                    ver = fh.read(1)[0]
                    fh.read(3)
                    if ver == 1:
                        fh.read(16)
                        ts, dur = struct.unpack(">IQ", fh.read(12))
                    else:
                        fh.read(8)
                        ts, dur = struct.unpack(">II", fh.read(8))
                    return dur / ts if ts else None
                if kind in (b"moov", b"trak", b"mdia"):
                    got = walk(head + size, depth + 1)
                    if got is not None:
                        return got
                fh.seek(head + size)
            return None
        return walk(os.path.getsize(path))


# ==================================================================================================
# the audit
# ==================================================================================================

def audit(root=ROOT, video=None):
    """(fails, warns, record). Raises AuditError when the audit itself cannot be performed."""
    fails, warns = [], []

    def rel(p):
        return os.path.relpath(p, root)

    # --- A: INPUTS (microseconds) -----------------------------------------------------------
    def load_json(relpath, required=True):
        path = os.path.join(root, relpath)
        if not os.path.exists(path):
            if required:
                raise AuditError(f"{relpath} does not exist — the publish path reads it, so this "
                                 f"audit cannot speak for what would be published")
            return None
        if os.path.getsize(path) == 0:
            raise AuditError(f"{relpath} is ZERO BYTES — a truncated write (out of disk?). "
                             f"Regenerate it; do not publish against it")
        try:
            with open(path) as fh:
                return json.load(fh)
        except ValueError as e:
            raise AuditError(f"{relpath} is not valid JSON ({e}) — a truncated or half-written "
                             f"file. Regenerate it; do not publish against it")

    meta = load_json("ops/episode_meta.json")
    kit = load_json("out/upload_kit.json")
    tl = load_json("src/timeline.json")

    topic = (meta.get("topic") or "").strip()
    if not topic:
        raise AuditError("ops/episode_meta.json has no 'topic' — the research file that every "
                         "factual claim is checked against is docs/research/<topic>.md, so with no "
                         "topic there is nothing to check against")

    research_path = os.path.join(root, "docs", "research", f"{topic}.md")
    if not os.path.exists(research_path):
        raise AuditError(
            f"docs/research/{topic}.md does not exist — ops/episode_meta.json names topic "
            f"{topic!r} and docs/AUTOPILOT_PROMPT.txt step 2 requires the research file to be "
            f"written BEFORE a line of script. Without it not one claim in this episode is "
            f"checkable, so it does not publish")
    with open(research_path) as fh:
        research = fh.read()
    if len(research.strip()) < 500:
        fails.append(f"docs/research/{topic}.md is only {len(research.strip())} characters — that "
                     f"is not a sourced research file (AUTOPILOT_PROMPT step 2: timeline, figures, "
                     f"named people, mechanism, 2-4 quotations). Write it, then re-run")

    try:
        import content
    except Exception as e:
        raise AuditError(f"content.py could not be imported ({e}) — nothing can be audited")
    scenes = content.SCENES

    # --- B: PACKAGING (milliseconds) --------------------------------------------------------
    title = meta.get("title") or ""
    if kit.get("title") != title:
        fails.append(f"packaging title: out/upload_kit.json says {str(kit.get('title'))[:60]!r} but "
                     f"ops/episode_meta.json says {title[:60]!r} — the kit is what YouTube gets, so "
                     f"this publishes the wrong title. Re-run `python3 gen_packaging.py`")
    if list(kit.get("tags") or []) != list(meta.get("tags") or []):
        fails.append("packaging tags: out/upload_kit.json's tags differ from ops/episode_meta.json's "
                     "— the kit is stale. Re-run `python3 gen_packaging.py`")
    if kit.get("playlist") != meta.get("playlist"):
        fails.append(f"packaging playlist: kit says {kit.get('playlist')!r}, meta says "
                     f"{meta.get('playlist')!r} — re-run `python3 gen_packaging.py`")
    kit_video = (kit.get("video") or "").strip()
    if kit_video != "out/episode.mp4":
        fails.append(f"out/upload_kit.json points at {kit_video!r}, not 'out/episode.mp4' — the kit "
                     f"describes a different render than the one this pipeline builds")
    if video and os.path.basename(kit_video) != os.path.basename(video):
        fails.append(f"out/upload_kit.json describes {os.path.basename(kit_video)!r} but the audit "
                     f"was pointed at {os.path.basename(video)!r} — the packaging does not belong "
                     f"to this render")

    desc = kit.get("description") or ""
    body = meta.get("body") or ""
    if body.strip() and body.strip() not in desc:
        fails.append("packaging description: ops/episode_meta.json's 'body' is NOT inside "
                     "out/upload_kit.json's description — the kit predates the current copy "
                     "(this is how last night's chapters reach tonight's video). Re-run "
                     "`python3 gen_packaging.py`")
    if len(title) > YT_TITLE_MAX:
        fails.append(f"title is {len(title)} characters — YouTube's limit is {YT_TITLE_MAX} and "
                     f"scripts/yt_upload.py truncates it silently. Shorten it in "
                     f"ops/episode_meta.json 'title'")
    if len(desc) > YT_DESC_MAX:
        fails.append(f"description is {len(desc)} characters — scripts/yt_upload.py posts only the "
                     f"first {YT_DESC_MAX} with NO warning, and the CHAPTER BLOCK sits in the tail, "
                     f"so the chapters would be cut off the published video. Shorten "
                     f"ops/episode_meta.json 'body' by {len(desc) - YT_DESC_MAX} characters")
    tags = kit.get("tags") or []
    if len(tags) > YT_TAGS_MAX:
        fails.append(f"{len(tags)} tags — YouTube accepts {YT_TAGS_MAX} and yt_upload.py drops the "
                     f"rest silently. Trim ops/episode_meta.json 'tags'")
    if not tags:
        warns.append("no tags — the kit will publish with an empty tag list")

    # B' duplicate title. WARN, not FAIL: out/uploads.json is known to diverge from what is
    # actually live on the channel, and yt_upload.py's title_live() is the authoritative check
    # (it asks YouTube). A false positive here would take the channel dark over a bookkeeping file.
    norm_title = normalize(title)
    prior_titles = []
    for relpath, key in (("out/uploads.json", "title"), ("ops/produced_topics.json", "title")):
        try:
            with open(os.path.join(root, relpath)) as fh:
                data = json.load(fh)
            rows = data.get("produced", data) if isinstance(data, dict) else data
            prior_titles += [(r.get(key) or "", relpath) for r in rows if isinstance(r, dict)]
        except (OSError, ValueError):
            pass
    for prior, src in prior_titles:
        if prior and normalize(prior) == norm_title:
            warns.append(f"title {title[:60]!r} already appears in {src} — this may be a re-upload "
                         f"of an episode that is already live. yt_upload.py's duplicate guard will "
                         f"refuse it unless --force is passed")
            break

    # --- C: CHAPTERS vs the chapter CARDS in the timeline ------------------------------------
    fps = tl.get("fps") or 30

    def ts_pad(frame):
        s = int(frame / fps)
        return f"{s//3600}:{(s%3600)//60:02d}:{s%60:02d}" if s >= 3600 else f"{s//60:02d}:{s%60:02d}"

    def card_name(sc):
        card = sc.get("card") or {}
        if isinstance(card, dict) and card.get("kind") == "chapter" and card.get("title"):
            t, sub = str(card["title"]).strip(), str(card.get("subtitle", "")).strip()
            return f"{t}: {sub}" if sub else t
        return None

    drawn = [(sc["startFrame"], card_name(sc)) for sc in tl["scenes"] if sc.get("level")]
    drawn = [(f, n) for f, n in drawn if n]
    ts_line = re.compile(r"^[ \t]*(\d{1,2}):(\d{2})(?::(\d{2}))?[ \t]+(\S.*?)[ \t]*$")
    published = []
    for line in desc.split("\n"):
        m = ts_line.match(line)
        if m:
            sec = (int(m.group(1)) * 3600 + int(m.group(2)) * 60 + int(m.group(3))
                   if m.group(3) else int(m.group(1)) * 60 + int(m.group(2)))
            published.append((sec, m.group(4)))
        elif published:
            break
    lead = 1 if (published and published[0][0] == 0 and (not drawn or drawn[0][0] != 0)) else 0
    if drawn and not published:
        fails.append(f"the description has NO chapter list but the episode draws {len(drawn)} "
                     f"chapter cards — YouTube would publish no chapter markers at all. Re-run "
                     f"`python3 gen_packaging.py`")
    elif len(published) - lead != len(drawn):
        fails.append(f"chapters: the description lists {len(published) - lead} chapters but the "
                     f"episode draws {len(drawn)} chapter cards — the published markers do not "
                     f"describe this render. Re-run `python3 gen_packaging.py`")
    else:
        for (frame, name), (sec, pub_name) in zip(drawn, published[lead:]):
            if pub_name.strip() != name.strip():
                fails.append(f"chapter @{ts_pad(frame)}: the description publishes {pub_name!r} but "
                             f"the card on screen reads {name!r} — the cards are the source of "
                             f"truth (gen_packaging.py). Re-run `python3 gen_packaging.py`")
            if abs(sec - frame / fps) > 2:
                fails.append(f"chapter {name!r}: the description says "
                             f"{sec//60:02d}:{sec%60:02d} but it renders at {ts_pad(frame)} "
                             f"({abs(sec - frame / fps):.0f}s out) — viewers land in the wrong "
                             f"place. Re-run `python3 gen_packaging.py`")
    runtime_sec = tl.get("totalFrames", 0) / fps
    for sec, name in published:
        if sec > runtime_sec:
            fails.append(f"chapter {name!r} is timestamped at {sec//60:02d}:{sec%60:02d}, past the "
                         f"{int(runtime_sec)//60:02d}:{int(runtime_sec)%60:02d} end of the episode")

    # --- D: THUMBNAIL -------------------------------------------------------------------------
    thumb_path = os.path.join(root, kit.get("thumbnail") or "out/thumbnail.png")
    if not os.path.exists(thumb_path) or os.path.getsize(thumb_path) == 0:
        fails.append(f"{rel(thumb_path)} is missing or empty — yt_upload.py swallows a thumbnail "
                     f"failure in a bare except and publishes anyway, so this would ship with "
                     f"YouTube's auto-generated frame. Re-run "
                     f"`npx remotion still Thumbnail out/thumbnail.png`")
    else:
        size = os.path.getsize(thumb_path)
        if size > YT_THUMB_BYTES:
            fails.append(f"{rel(thumb_path)} is {size/1e6:.1f}MB — YouTube rejects thumbnails over "
                         f"2MB, and yt_upload.py catches that rejection and publishes without one")
        with open(thumb_path, "rb") as fh:
            head = fh.read(33)
        if head[:8] != b"\x89PNG\r\n\x1a\n":
            fails.append(f"{rel(thumb_path)} is not a PNG (magic bytes {head[:8]!r}) — the still "
                         f"render did not produce an image")
        else:
            w, h = struct.unpack(">II", head[16:24])
            if w < THUMB_MIN_W:
                fails.append(f"{rel(thumb_path)} is {w}x{h} — YouTube wants at least "
                             f"{THUMB_MIN_W}px wide")
            elif abs(w / h - 16 / 9) > 0.02:
                fails.append(f"{rel(thumb_path)} is {w}x{h}, not 16:9 — it will be letterboxed or "
                             f"cropped in the feed")

    thumb = meta.get("thumb") or {}
    # PRESERVED FROM THE ESTABLISHED RULE: the thumbnail is set in a vendored Montserrat ExtraBold
    # LATIN SUBSET. A non-ASCII character has no glyph and draws as a blank box on the single most
    # visible artifact this channel produces.
    for k, v in thumb.items():
        if isinstance(v, str) and not v.isascii():
            bad = [c for c in v if not c.isascii()]
            fails.append(f"thumb.{k} contains non-ASCII {bad!r} — the thumbnail font is a vendored "
                         f"Montserrat LATIN SUBSET with no glyph for it, so it draws as a blank "
                         f"box. Use ASCII only in thumbnail copy (e.g. 'Bundchen', not 'Bündchen')")
    try:
        import thumb_check
        t_fails, t_warns = thumb_check.check(meta)
        fails += t_fails
        warns += t_warns
    except Exception as e:                       # noqa: BLE001 - reported, never swallowed
        fails.append(f"thumb_check could not run ({e}) — the archetype/kicker combination that "
                     f"HALTS the Thumbnail render is UNVERIFIED")

    # D' numbers drawn on the thumbnail that the episode never says. WARN: the thumbnail rounds
    # on purpose ($64.8B narrated, "$65B" on the card), so _close() tolerates 2% and anything
    # further out is a judgement call, not a certainty.
    script_money = set()
    for sc in scenes:
        for _f, t in scene_texts(sc):
            script_money |= money_amounts(t)
    script_money |= money_amounts(title) | money_amounts(body)
    for k in ("kicker", "line1", "line2", "tag", "big", "before", "after", "word"):
        v = thumb.get(k)
        if not isinstance(v, str):
            continue
        for amt in money_amounts(v):
            if not any(_close(amt, s) for s in script_money):
                warns.append(f"thumb.{k} shows {v!r} but no figure like that is said anywhere in "
                             f"the episode or its description — a thumbnail that promises a number "
                             f"the video never says is the defect QA_WATCH item 17 recorded")

    # --- E: TIMELINE identity -----------------------------------------------------------------
    tl_ids = [s["id"] for s in tl["scenes"]]
    sc_ids = [s["id"] for s in scenes]
    only_tl = [i for i in tl_ids if i not in set(sc_ids)]
    only_sc = [i for i in sc_ids if i not in set(tl_ids)]
    if only_tl:
        fails.append(f"src/timeline.json renders scenes content.py no longer has: "
                     f"{', '.join(only_tl[:8])} — the timeline is from an older build. Re-run "
                     f"`scripts/build_capped.sh`")
    if only_sc:
        fails.append(f"content.py has scenes the timeline does not render: "
                     f"{', '.join(only_sc[:8])} — the render is missing {len(only_sc)} scene(s) of "
                     f"the script. Re-run `scripts/build_capped.sh`")
    by_id = {s["id"]: s for s in scenes}
    drifted = [s["id"] for s in tl["scenes"]
               if s["id"] in by_id and s.get("narration") is not None
               and normalize(s["narration"]) != normalize(by_id[s["id"]]["narration"])]
    if drifted:
        fails.append(f"the narration in src/timeline.json differs from content.py at "
                     f"{', '.join(drifted[:8])} — content.py was edited after the build, so the "
                     f"audio and the render are of the OLD words. Re-run `scripts/build_capped.sh`")

    # --- F: CLAIM TRACEABILITY ----------------------------------------------------------------
    rwords = research_words(research)
    runits = research_units(research)
    rtokens = normalize(research).split()
    research_norm = " ".join(rtokens)
    research_money = money_amounts(research)
    research_years = set(YEAR_RE.findall(research))
    seen_names = {}

    corpus = []                                   # (where, field, text)
    for sc in scenes:
        for field, text in scene_texts(sc):
            corpus.append((sc["id"], field, text))
    corpus.append(("packaging", "title", title))
    corpus.append(("packaging", "hook", meta.get("hook") or ""))
    corpus.append(("packaging", "body", body_prose(body)))

    for where, field, text in corpus:
        # F2 — years. Measured 0 false positives on the shipping ftx episode, so this HALTs.
        for year in sorted(set(YEAR_RE.findall(text))):
            if year not in research_years:
                fails.append(f"{where} {field}: the year {year} appears nowhere in "
                             f"docs/research/{topic}.md. Every date must be traceable to the "
                             f"research file (AUTOPILOT_PROMPT step 2) — either source it there "
                             f"or cut it from the script")
        # F6 — dollar figures. WARN: spelled-out number parsing is genuinely unreliable.
        for amt in sorted(money_amounts(text)):
            if not any(_close(amt, r) for r in research_money):
                warns.append(f"{where} {field}: the figure ${amt:,.0f} is not in "
                             f"docs/research/{topic}.md. Source it there or cut it "
                             f"(spelled-out numbers can parse wrong — verify before acting)")

        # F1/F4/F5/F7 — claims about named people. PROSE ONLY: see PROSE_FIELDS above for the
        # measurement that says why display copy is excluded from name detection.
        if not is_prose(field):
            continue

        # F7' — a claim attributed to a source the research file never cites.
        for m in ATTRIBUTION.finditer(text):
            source = m.group(1).strip()
            head = bare_token(source.split()[0])
            if head.lower() in LEADING_NON_NAMES or head in rwords:
                continue
            if normalize(source) in GENERIC_ATTRIBUTORS or head.lower() in GENERIC_ATTRIBUTORS:
                continue
            warns.append(
                f"{where} {field}: attributes a claim to {source!r} ({source} "
                f"{m.group(2)}...), and docs/research/{topic}.md never cites {source}. An "
                f"attribution nobody downstream can check is the Forbes gap the 2026-08-24 "
                f"reviewer found by hand — add the source to the research file or drop the "
                f"attribution")

        for sentence in SENTENCE_SPLIT.split(text):
            cands = name_candidates(sentence)
            for name, _off in cands:
                key = " ".join(bare_token(t) for t in name.split())
                if normalize(key) in NOT_PEOPLE:
                    continue
                seen_names.setdefault(key, (where, field))
            known = [n for n, _ in cands if name_is_known(n, rwords)]
            unknown = [n for n, _ in cands if not name_is_known(n, rwords)]

            pending = PENDING_STATUS.search(sentence)
            resolved = RESOLVED_STATUS.search(sentence)

            if pending and cands:
                phrase = pending.group(0)
                for name in known:
                    if not any(PENDING_STATUS.search(u) for u in units_mentioning(runits, name)):
                        fails.append(
                            f"{where} {field}: says {name} \"{phrase}\" — docs/research/{topic}.md "
                            f"records no UNRESOLVED legal status for {name}. A claim that a real "
                            f"person's legal situation is still open goes stale on its own, with "
                            f"nobody editing the file, and it is the exact defect that nearly "
                            f"shipped as t169 (\"Gary Wang and Nishad Singh are still waiting on "
                            f"their own sentences\" — both were sentenced in late 2024). Either "
                            f"source the pending status in the research file WITH A DATE, or say "
                            f"only what the file supports")
                for name in unknown:
                    fails.append(
                        f"{where} {field}: says {name} \"{phrase}\" — {name} does not appear in "
                        f"docs/research/{topic}.md at all. An unresolved legal-status claim about "
                        f"a person the research file never mentions cannot be checked by anyone. "
                        f"Research it into the file or cut the claim")
            elif resolved and cands:
                verb = resolved.group(0)
                for name in known:
                    units = units_mentioning(runits, name)
                    if units and not any(RESEARCH_STATUS.search(u) for u in units):
                        warns.append(
                            f"{where} {field}: says {name} was {verb!r}, but "
                            f"docs/research/{topic}.md mentions {name} without any charge, plea, "
                            f"trial or sentence. Confirm it against the sources and write the "
                            f"status into the research file")
                for name in unknown:
                    fails.append(
                        f"{where} {field}: says {name} was {verb!r} — {name} appears nowhere in "
                        f"docs/research/{topic}.md. A legal claim about a named person who is not "
                        f"in the research file is unverifiable. Research it into the file or cut "
                        f"the claim")

            # F7 — a ranked, checkable superlative whose wording the research file does not carry.
            # No name is required: the Forbes line ranks "him", the episode's subject, by pronoun.
            sup = SUPERLATIVE.search(sentence)
            if sup and normalize(sup.group(0)) not in research_norm:
                subject = known[0] if known else "the subject"
                warns.append(
                    f"{where} {field}: ranks {subject} as the {sup.group(0)!r} "
                    f"(\"{sentence.strip()[:70]}...\") and that word appears nowhere in "
                    f"docs/research/{topic}.md. A superlative about a real person is exactly what "
                    f"a viewer fact-checks — source it there or soften it to what the file says")

    # F5 — names that appear nowhere in the research file, reported once each.
    for name, (where, field) in sorted(seen_names.items()):
        if not name_is_known(name, rwords):
            warns.append(
                f"{where} {field}: {name!r} appears nowhere in docs/research/{topic}.md. If that "
                f"is a PERSON, the episode is making a claim about a real named individual with "
                f"nothing behind it — this is the Brady/Bundchen/Curry gap. If it is a company or "
                f"a place, ignore this line (the name detector cannot tell them apart)")

    # F3 — quotations.
    for where, field, text in corpus:
        for rx in (DOUBLE_QUOTE, SINGLE_QUOTE):
            for m in rx.finditer(text):
                quote = m.group(1)
                if len(normalize(quote).split()) < 6:
                    continue
                score = quote_score(quote, rtokens)
                if score < 0.55:
                    fails.append(
                        f"{where} {field}: the quotation \"{quote.strip()[:70]}...\" does not "
                        f"appear in docs/research/{topic}.md (best match {score:.2f}). Putting "
                        f"words in a real person's mouth that the research file does not carry is "
                        f"not a device, it is a fabrication. Quote the verified wording or cut it")
                elif score < 0.85:
                    warns.append(
                        f"{where} {field}: the quotation \"{quote.strip()[:70]}...\" is a REWORDING "
                        f"of the research file, not the verified wording (match {score:.2f}). "
                        f"On-screen condensation is allowed; check it does not change the meaning "
                        f"or the speaker")

    # --- G: THE RENDER (the only expensive step — last) ---------------------------------------
    record = {
        "_what_this_is": "The pre-publish audit verdict for ONE render and ONE set of source files. "
                         "scripts/upload_guard.py refuses to publish without a passing record whose "
                         "recorded hashes still match what is on disk.",
        "generatedAt": datetime.datetime.now().isoformat(timespec="seconds"),
        "topic": topic,
        "title": title,
        "video": None,
        "sha256": None,
        "size": None,
        "sources": {},
    }
    for relpath in SOURCE_FILES + [f"docs/research/{topic}.md"]:
        path = os.path.join(root, relpath)
        if os.path.exists(path):
            record["sources"][relpath] = sha256_file(path)

    if video:
        if not os.path.exists(video):
            fails.append(f"the video does not exist: {video}")
        else:
            record["video"] = os.path.basename(video)
            record["size"] = os.path.getsize(video)
            try:
                dur = mp4_duration_seconds(video)
            except (OSError, struct.error) as e:
                dur = None
                fails.append(f"{rel(video)}: could not read the mp4's own duration ({e}) — the "
                             f"file may be truncated")
            if dur is None:
                fails.append(f"{rel(video)} has no readable mvhd duration — it is not a complete "
                             f"mp4. Re-render")
            elif abs(dur - runtime_sec) > 2.0:
                fails.append(
                    f"{rel(video)} is {dur/60:.2f} min but src/timeline.json describes "
                    f"{runtime_sec/60:.2f} min ({abs(dur - runtime_sec):.0f}s out) — the render on "
                    f"disk is NOT this script. Everything downstream (chapters, packaging, the "
                    f"reviewer's frames) is describing a different video. Re-render")
            record["sha256"] = sha256_file(video)
            # Source-newer-than-render. WARN, not FAIL: mtimes are not content, and a cloud
            # artifact's extraction timestamps are set by GitHub, not by us. The FAIL that
            # actually closes this hole is upload_guard.py's source-hash comparison, which is
            # content-addressed and cannot be fooled by a touch.
            v_mtime = os.path.getmtime(video)
            for relpath in ("content.py", "src/timeline.json"):
                p = os.path.join(root, relpath)
                if os.path.exists(p) and os.path.getmtime(p) > v_mtime + 1:
                    warns.append(
                        f"{relpath} was modified AFTER {rel(video)} was written — the render may "
                        f"not contain the current script. If a re-render is in flight, this render "
                        f"is not the one to publish")

    record["verdict"] = "fail" if fails else "pass"
    record["fails"] = fails
    record["warns"] = warns
    return fails, warns, record


def write_record(record, path=AUDIT_PATH):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w") as fh:
        json.dump(record, fh, indent=2)
        fh.flush()
        os.fsync(fh.fileno())
    os.replace(tmp, path)
    return path


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    video = argv[0] if argv else None
    try:
        fails, warns, record = audit(video=video)
    except AuditError as e:
        # An audit that could not run is not a pass. Say so, write nothing, and exit 2 so the
        # caller can tell "this episode failed" from "this check is broken".
        print(f"AUDIT: CANNOT RUN ❌ — {e}")
        return 2
    write_record(record)
    print(f"pre-publish audit: topic {record['topic']!r} | "
          f"{'render ' + record['sha256'][:12] + '…' if record['sha256'] else 'no render bound'} "
          f"| warnings: {len(warns)} | failures: {len(fails)}")
    for w in warns:
        print("  WARN:", w)
    for f in fails:
        print("  FAIL:", f)
    print("AUDIT: PASS ✅" if not fails else "AUDIT: HALT ❌ — do not publish")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
