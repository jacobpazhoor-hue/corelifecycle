#!/usr/bin/env python3
"""CoreLifecycle pre-publish QUALITY GATE.  exit 0 = PASS (safe to publish), nonzero = HALT.
The autopilot runs this after building/rendering and MUST NOT upload on failure.

Checks: timeline integrity · every scene id maps to a component · every scene has clean 48k
audio (present, right rate, not silent, not clipping) · runtime inside routine.minMinutes..maxMinutes ·
narration rate inside the CRAYON band · flat fill + camera lock on sampled rendered frames ·
(optional) rendered video exists.  Usage: python3 gate.py [out/video.mp4]

Set GATE_STYLE_FRAMES=0 to skip the two checks that render frames (see step 4). They cost ~13s and are
ON by default; skipping them is announced as a WARN, never silently.
"""
import json, os, re, subprocess, sys
import soundfile as sf
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
routine = json.load(open(os.path.join(ROOT, "ops", "routine.json")))
MIN_MIN = routine.get("minMinutes", 10)
MAX_MIN = routine.get("maxMinutes", 21)          # CRAYON canon runtime band is 13-21 min, two-sided
# Narration rate (docs/CRAYON_BIBLE.md §2): reference AGGREGATE 148.5 WPM, which stays the target
# the writer and gen_voice_edge.RATE are tuned to. THE GATE BAND IS WIDER THAN THE TARGET ON PURPOSE:
# the reference's own PER-VIDEO spread is 139.2-152.9, so pinning the gate to the aggregate's 145-152
# would make it stricter than the channel it copies, and a false HALT blocks publishing outright —
# strictly worse than shipping an episode a couple of WPM off. 143-154 tolerates that spread while
# still catching a real rate regression (the pre-crayon pipeline ran 180.7 WPM).
# THE METRIC IS RUNTIME-INCLUSIVE — transcript words / total video minutes, counting pauses, gaps and
# dialogue beats — NOT speech-only WPM, which runs ~3 WPM higher on the same audio. gen_voice_edge.py
# prints both ("~X WPM speech / Y WPM runtime"); this asserts Y, recomputed here from the same two
# numbers it used (content narration words, timeline totalFrames).
#
# CEILING RAISED 154.0 -> 157.0 (WO-31, 2026-08-15) — ON THE OWNER'S INSTRUCTION, AND IT IS A
# DEPARTURE FROM THE REFERENCE RATHER THAN A MATCH TO IT.
# The owner asked a second time for a faster voice, which took gen_voice_edge.RATE from -7% to -5%
# and the measured runtime figure from 152.5 to 155.6 WPM. 155.6 is ABOVE the reference channel's
# fastest single video (its per-video range is 139.2-152.9, aggregate 148.5) by 2.7 WPM, so this band
# no longer describes "what the reference does" at its top end — it describes what the owner asked
# for. Anyone re-deriving this from the reference measurements will get 154 back; don't, without
# asking the owner first.
# 157.0 is chosen to leave 155.6 a real 1.4 WPM of margin — outside the 1.0 band-edge WARN below, so
# the episode is not sitting on the edge — and NOT to be the largest defensible number.
# WHAT THIS COSTS, stated because it is a genuine loss: the old 154.0 ceiling also caught the scene-
# granularity DEAD ZONE documented in docs/BIBLE.md §3a, where an edit with a ~6.5-7.5s mean scene
# pushes runtime WPM through the ceiling (the 141-scene draft measured 154.2 and HALTed here). At
# 157.0 that draft would now PASS this check. The dead zone is therefore no longer guarded by the WPM
# band; it is guarded only by the §3a rhythm tests. If you widen this band any further you are
# removing the last cheap check on it.
#
# FLOOR LOWERED 143.0 -> 139.0 (QA_WATCH 2026-08-17). THIS IS A CORRECTION, NOT A WIDENING.
# The paragraph at the top of this block states the design rule — "the reference's own PER-VIDEO
# spread is 139.2-152.9, so pinning the gate to the aggregate would make it stricter than the channel
# it copies, and a false HALT blocks publishing outright" — and then the floor never honoured it.
# 143.0 is 3.8 WPM STRICTER than the slowest video the reference channel has ever published. The
# ceiling was argued from the reference's extremes and then moved further out on owner instruction;
# the floor was left at a number nothing measured.
#
# THE COST OF THAT ASYMMETRY IS NOW MEASURED, NOT HYPOTHETICAL. The last two episodes built by this
# pipeline both landed ON the floor, not near the middle of the band:
#     madoff   (2026-08-17, shipping)   2355 words / 16.42 min = 143.4 WPM   margin 0.4
#     theranos (2026-08-16, shipped)    2149 words / 14.87 min = 144.5 WPM   margin 1.5
# Both fired the band-edge WARN below. docs/BIBLE.md §3a said "the floor is only reachable by
# extrapolation somewhere under a ~3s mean scene, which no other rule here would let you write
# anyway" — that is false: it is reachable by writing ordinary sentences with slightly longer words.
# Runtime WPM at a fixed synth rate is set by SYLLABLES PER WORD (§3a: WPM ~= K / syll-per-word), and
# the two episodes above measure 1.484 and 1.465 syll/word. A 143.0 floor caps the writer at 1.483
# syll/word — a limit the shipping script is already 0.001 inside. The next slightly more Latinate
# script HALTs the build, at night, with nobody watching, and the channel goes dark for a day.
#
# 139.0 is the reference channel's own slowest published video (139.2), rounded down to a round
# number. It is therefore the loosest floor that is still defensible as "no stricter than the channel
# this format copies", and it gives the writer 1.53 syll/word to work in instead of 1.483.
# WHAT THIS STILL CATCHES: the pre-crayon rate regression ran 180.7 WPM — the wrong side of the band
# entirely, caught by the ceiling. On this side, the failure a floor exists to catch is narration
# that has slowed to a crawl (a RATE misconfiguration, or gap arithmetic that has run away). 139.0
# still HALTs all of those; what it stops doing is HALTing on a script that is merely wordier than
# the last one. A slightly slow episode is cheap. A dark channel is not.
# BEFORE SPENDING THIS MARGIN: scripts/wpm_predict.py now predicts this quotient from content.py
# BEFORE synthesis (validated to 0.5 WPM on both episodes above), so a rate problem is now catchable
# while it is still a cheap rewrite instead of a HALTed nightly build. Use that, not more band.
WPM_LO, WPM_HI = 139.0, 157.0
tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))

# ============================================================================
# TEMPLATE REGISTRY — derived by FOLLOWING THE SPREADS out of src/scenes.tsx's `TEMPLATES`, which is
# the object director.tsx/Video2.tsx actually index into.
#
# It used to be a pair of hardcoded file scans (scenes.tsx `name: S<digit>` + stage.tsx `name: () =>`).
# That silently stopped describing the registry the moment a THIRD module started contributing to it:
# WO-8f put the six restyled explainer templates in src/explainer.tsx and spread them in at
# scenes.tsx's `...EXPLAINER_TEMPLATES`, and because nothing here read that file, every scene of the
# WO-13 sample episode failed `template not in registry` — 39 false HALTs on templates the very same
# gate run then rendered successfully in step 4. Adding explainer.tsx as a third hardcoded path would
# only move the trap one file along, so the file list is no longer written down at all: it is read off
# the spreads, and an unresolvable spread HALTs instead of quietly shrinking the registry.
#
# Deliberately NOT a whole-file scan of the contributing modules. stage.tsx's backdrop and prop maps
# use the same `name: () =>` shape as its templates, so the old heuristic also admitted `plain`,
# `none` and `wasteTruck` — three backdrops/props that are not templates and would not have rendered.
# Only the object literals reachable from TEMPLATES are read, so the registry is exactly the map.
# ============================================================================
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

def _object_body(src, name, path):
    """The text inside `const NAME ... = ... { ... }`."""
    m = re.search(r"\bconst\s+" + re.escape(name) + r"\b", src)
    if not m:
        raise SystemExit(f"GATE: HALT ❌ — template map `{name}` is spread into TEMPLATES but there is "
                         f"no `const {name}` in {os.path.relpath(path, ROOT)}")
    i = src.find("{", m.end())
    j = _match_brackets(src, i, "{", "}") if i >= 0 else -1
    if j < 0:
        raise SystemExit(f"GATE: HALT ❌ — `const {name}` in {os.path.relpath(path, ROOT)} has no "
                         f"balanced object literal, so its template names cannot be read")
    return src[i + 1:j]

def _unwrap_calls(body):
    """`...keyedTemplates({a: A})` contributes its argument's keys directly to the map, so drop the
    wrapper call and keep the literal — which lifts those keys to the map's own top level."""
    while True:
        m = re.search(r"\.\.\.\s*\w+\s*\(", body)
        if not m:
            return body
        j = _match_brackets(body, m.end() - 1, "(", ")")
        if j < 0:
            raise SystemExit("GATE: HALT ❌ — unbalanced call inside a template map")
        inner = body[m.end():j].strip()
        if inner.startswith("{") and _match_brackets(inner, 0, "{", "}") == len(inner) - 1:
            inner = inner[1:-1]
        body = body[:m.start()] + inner + body[j + 1:]

_MAP_TOKEN = re.compile(r"[{\[(]|[}\])]|\.\.\.\s*(\w+)|(\w+)\s*:")

def _top_level(body):
    """(keys, spreads) at depth 0 of an object literal — anything nested is a prop of a template's
    own JSX, not a template name."""
    keys, spreads, depth = [], [], 0
    for m in _MAP_TOKEN.finditer(body):
        if m.group(1) is not None:
            if depth == 0:
                spreads.append(m.group(1))
        elif m.group(2) is not None:
            if depth == 0:
                keys.append(m.group(2))
        elif m.group(0)[0] in "{[(":
            depth += 1
        else:
            depth -= 1
    return keys, spreads

def _imported_from(src):
    out = {}
    for m in re.finditer(r"import\s*\{([^}]*)\}\s*from\s*['\"]([^'\"]+)['\"]", src):
        for part in m.group(1).split(","):
            nm = part.strip().split(" as ")[-1].strip()
            if nm:
                out[nm] = m.group(2)
    return out

def _collect_templates(path, name, seen, keys):
    if (path, name) in seen:
        return
    seen.add((path, name))
    src = _strip_comments(open(path).read())
    body = _unwrap_calls(_object_body(src, name, path))
    ks, spreads = _top_level(body)
    keys.update(ks)
    imports = _imported_from(src)
    for ident in spreads:
        if ident in imports:
            spec = imports[ident]
            if not spec.startswith("."):
                raise SystemExit(f"GATE: HALT ❌ — TEMPLATES spreads `{ident}` from the non-relative "
                                 f"module '{spec}'; the gate can only follow project source files")
            base = os.path.normpath(os.path.join(os.path.dirname(path), spec))
            target = next((base + e for e in (".tsx", ".ts") if os.path.exists(base + e)), None)
            if not target:
                raise SystemExit(f"GATE: HALT ❌ — cannot resolve '{spec}' (spread as `{ident}` from "
                                 f"{os.path.relpath(path, ROOT)}) to a source file")
            _collect_templates(target, ident, seen, keys)
        else:
            _collect_templates(path, ident, seen, keys)   # a map local to the same module

tmpl_keys = set()
_collect_templates(os.path.join(ROOT, "src", "scenes.tsx"), "TEMPLATES", set(), tmpl_keys)
if not tmpl_keys:
    raise SystemExit("GATE: HALT ❌ — the template registry derived from src/scenes.tsx is EMPTY; "
                     "every scene would fail below, so this is a gate bug, not an episode defect")
# variety: collect templates in order to flag adjacent repeats
prev_tmpl = None

fails, warns = [], []

# 1) timeline integrity
if sum(s["durationInFrames"] for s in tl["scenes"]) != tl["totalFrames"]:
    fails.append("timeline frames do not reconcile")

# 2) runtime — two-sided. The band is the reference channel's own (13-21 min); an episode that
#    overshoots it is off-format in exactly the way a short one is.
runtime_min = tl["totalFrames"] / tl["fps"] / 60
if runtime_min < MIN_MIN:
    fails.append(f"runtime {runtime_min:.1f}min < required {MIN_MIN}min")
if runtime_min > MAX_MIN:
    fails.append(f"runtime {runtime_min:.1f}min > allowed {MAX_MIN}min (CRAYON canon runtime band is {MIN_MIN}-{MAX_MIN}min)")

# 2b) NARRATION RATE — runtime-inclusive WPM (see WPM_LO/WPM_HI above).
# Words come from content.py (the writer's source), minutes from the timeline that will be rendered,
# so this is the same quotient gen_voice_edge.py prints as "WPM runtime". The two files must describe
# the same episode for that quotient to mean anything, so a timeline that has drifted out of sync with
# content.py is a hard failure here rather than a silently wrong rate.
try:
    sys.path.insert(0, ROOT)
    from content import SCENES as _CONTENT_SCENES
except Exception as e:
    raise SystemExit(f"GATE: HALT ❌ — cannot import content.py to measure narration rate: {e}")
_narr = {s["id"]: s["narration"] for s in _CONTENT_SCENES}
_missing = [s["id"] for s in tl["scenes"] if s["id"] not in _narr]
runtime_wpm = None
if _missing:
    fails.append(f"timeline is stale vs content.py — {len(_missing)} scene id(s) have no narration "
                 f"({', '.join(_missing[:5])}); re-run gen_voice_edge.py")
else:
    words = sum(len(_narr[s["id"]].split()) for s in tl["scenes"])
    runtime_wpm = words / runtime_min if runtime_min else 0.0
    if not (WPM_LO <= runtime_wpm <= WPM_HI):
        fails.append(f"narration {runtime_wpm:.1f} WPM runtime-inclusive ({words} words / {runtime_min:.2f} min) "
                     f"outside {WPM_LO:.0f}-{WPM_HI:.0f} — retune gen_voice_edge.RATE or the script length")
    elif min(runtime_wpm - WPM_LO, WPM_HI - runtime_wpm) < 1.0:
        warns.append(f"narration {runtime_wpm:.1f} WPM runtime-inclusive is within 1.0 of the "
                     f"{WPM_LO:.0f}-{WPM_HI:.0f} band edge — one more gap change will HALT the build")

# 3) per-scene: component + audio
for s in tl["scenes"]:
    tmpl = s.get("template")
    if tmpl not in tmpl_keys:
        fails.append(f"{s['id']}: template '{tmpl}' not in registry")
    if tmpl and tmpl == prev_tmpl:
        warns.append(f"{s['id']}: same template '{tmpl}' as previous scene (variety)")
    prev_tmpl = tmpl
    wav = os.path.join(ROOT, "public", s["audio"])
    if not os.path.exists(wav):
        fails.append(f"{s['id']}: missing audio"); continue
    info = sf.info(wav)
    if info.samplerate != 48000:
        warns.append(f"{s['id']}: audio {info.samplerate}Hz (expected 48000)")
    y, _ = sf.read(wav, dtype="float32")
    if y.ndim > 1: y = y.mean(axis=1)
    rms = float(np.sqrt(np.mean(y ** 2)))
    peak = float(np.max(np.abs(y)))
    if rms < 0.01: fails.append(f"{s['id']}: audio silent (rms {rms:.4f})")
    if peak >= 0.999: fails.append(f"{s['id']}: audio clipping (peak {peak:.3f})")

# ============================================================================
# 3b) STAGING DRIFT — director.tsx's head anchors vs explainer.tsx's figure call sites.
#
# STAGING is a hand-measured registry, and the three layers that read it (balloon placement + tail,
# the number note's corner, a panel's re-centre) cannot see the frame. So when a template moves a
# figure the anchor goes stale SILENTLY — which is how two men ended up decapitated by their own
# balloons in a shipped episode with every check on this page passing. `staging_check.py` re-derives
# each anchor from the figure rig and HALTS when they disagree; it found `closeUpPortrait` already
# stale by 182 units the first time it ran. See that file's header for what it cannot check and what
# a full fix (a template publishing its own anchors) would take.
#
# It parses source, renders nothing and costs milliseconds, so it runs unconditionally — it is not
# behind GATE_STYLE_FRAMES.
# ============================================================================
import staging_check
try:
    _sfails, _swarns = staging_check.check()
except staging_check.StagingParseError as e:
    _sfails, _swarns = [f"staging drift check could not read the sources it guards: {e}"], []
fails += _sfails
warns += _swarns

# ============================================================================
# 3c) THUMBNAIL FIELD COMBINATION — `thumb.kicker` against the archetype that will draw it.
#
# src/thumbs.tsx THROWS when a kicker is set on an archetype whose layout has no kicker slot, and
# that throw is right: the alternative it replaced was silently dropping the writer's copy. But it
# fires in the RENDERER, which is the ~40-minute cloud job at the end of the night — the `ftx`
# episode lost three consecutive nights (runs 32681047721 / 32697183054 / 32710038527) to a pair
# that was readable off ops/episode_meta.json before a frame existed. thumb_check.py derives both
# archetype sets from src/thumbs.tsx itself so they cannot drift, and ports pickName()'s topic-hash
# fallback so a typo'd archetype name that hashes onto a kickerless layout is caught too.
#
# Parses source, renders nothing, costs milliseconds — so like 3b it runs unconditionally, not
# behind GATE_STYLE_FRAMES.
# ============================================================================
import thumb_check
try:
    _tfails, _twarns = thumb_check.check()
except thumb_check.ThumbParseError as e:
    _tfails, _twarns = [f"thumbnail field check could not read src/thumbs.tsx: {e}"], []
except (OSError, ValueError) as e:
    _tfails, _twarns = [f"thumbnail field check could not read ops/episode_meta.json: {e}"], []
fails += _tfails
warns += _twarns

# ============================================================================
# 4) CRAYON STYLE on RENDERED FRAMES — flat fill (bible §5) and camera lock (bible §3).
#
# RESOLUTION IS PART OF THE ASSERTION. Flat fill counts pixels exactly equal to their right
# neighbour, so it is dominated by edge length per row and the SAME artwork reads ~6.5 points
# HIGHER at 1920 than at 1280. The reference band 74-92% (mean ~84%) was measured on NATIVE
# 1280x720 frames, so this renders NATIVE 1280x720 (--scale=0.6666667 off the 1920 composition)
# and refuses to measure a frame of any other size. NEVER downscale a 1920 render to get here:
# LANCZOS / BILINEAR / BOX resamples of one and the same frame score 76% / 84% / 89%, i.e. the
# resampler alone spans the whole band.
#
# The band is TWO-SIDED. Under 74% means texture/noise/gradients have crept back into the art;
# over 92% means the frame is EMPTY, not clean — a solid ground with a single prop measured 99.6%
# at 1920 (~93% at 1280) while a template rebuilt to reference density measured 85.7% at 1280.
#
# NOT gated: rich-colour / distinct-colour counts. That metric is palette-bound, not density-bound
# — a scene keyed grey has only a handful of grey tokens and can never approach the reference's
# count however dense it is (a `boardroom` frame scores 36 while sitting mid flat-fill band), so
# gating on it would HALT every grey scene by construction. Same for cuts/min: measuring it needs
# dense frame sampling across the episode (WO-4 sampled 287s to get it), which is far too slow to
# run nightly, and the shot plan that produces it is already asserted in-composition by planShots'
# 1..MAX_SHOT invariant.
# ============================================================================
COMP = "EveryLevelLawyer"        # the one composition build.py renders (see build.py smoke render)
GATE_W, GATE_H = 1280, 720       # the resolution the reference band was measured at
STILL_SCALE = "0.6666667"        # 1920 * 0.6666667 = 1280 — a NATIVE render, not a downscale
FLAT_LO, FLAT_HI = 74.0, 92.0    # reference per-frame range @1280x720 (f@140 84.4 · f@505 92.2 · f@870 74.4)
LOCK_CELLS = 35                  # of an 8x6 = 48 grid, cells at EXACTLY 0.0 mean |Δluma|
PAIR_GAP = 10                    # frames between the two frames of a camera-lock pair
# 34/44 frames into a scene: past Beat's 8-frame opacity fade and the overlay's 28-frame rise, and
# inside the scene's FIRST shot with ≥4 frames of clearance from ShotFade's ramps — planShots gives
# shot 0 roughly TARGET_SHOT(144) * minWeight(0.55) / meanWeight(~1.0) ≈ 73+ frames whatever the
# scene length (measured minimum across the current timeline: 73 frames).
SAMPLE_AT = 34
MIN_SAMPLE_DUR = 150             # frames; shorter scenes have no comfortably-interior first shot
N_SAMPLES = 4                    # 2 renders each = 8 stills ≈ 13s. Deterministic, evenly spaced.

def still(frame, path):
    """Render ONE frame of the real composition at native GATE_W x GATE_H and return it as RGB."""
    r = subprocess.run(["npx", "remotion", "still", COMP, path, f"--frame={frame}",
                        f"--scale={STILL_SCALE}", "--timeout=120000"],
                       cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"remotion still --frame={frame} failed (rc={r.returncode}):\n"
                           f"{(r.stderr or r.stdout or '')[-800:]}")
    im = Image.open(path).convert("RGB")
    if im.size != (GATE_W, GATE_H):
        raise RuntimeError(f"still is {im.size[0]}x{im.size[1]}, expected {GATE_W}x{GATE_H} — the "
                           f"flat-fill band is resolution-dependent, so this frame cannot be measured "
                           f"against it (do NOT downscale a 1920 frame to fix this; fix the scale)")
    return np.asarray(im)

def flat_pct(a):
    """% of pixels exactly equal to their right neighbour — the bible's flat-fill metric."""
    return float((a[:, 1:, :] == a[:, :-1, :]).all(axis=2).mean() * 100)

def zero_cells(a, b, gx=8, gy=6):
    """Cells of a gx*gy grid whose mean |Δluma| between two frames is EXACTLY 0.0 (locked camera).
    A moving camera makes every cell non-zero; the reference's locked shots leave 40/48 at 0.0."""
    la = a.astype(np.float64) @ [0.2126, 0.7152, 0.0722]
    lb = b.astype(np.float64) @ [0.2126, 0.7152, 0.0722]
    d = np.abs(la - lb)
    h, w = d.shape
    return sum(1 for j in range(gy) for i in range(gx)
               if float(d[j * h // gy:(j + 1) * h // gy, i * w // gx:(i + 1) * w // gx].mean()) == 0.0)

if os.environ.get("GATE_STYLE_FRAMES", "1") == "0":
    warns.append("style frame checks SKIPPED (GATE_STYLE_FRAMES=0) — flat fill and camera lock UNVERIFIED")
else:
    # A card scene paints an opaque full-screen text ground over the art, so it measures ~100% flat
    # and is not art: sample only scenes that actually render a shot.
    elig = [s for s in tl["scenes"] if not s.get("card") and s["durationInFrames"] >= MIN_SAMPLE_DUR]
    if not elig:
        fails.append(f"no scene without a full-screen card is >= {MIN_SAMPLE_DUR} frames — "
                     f"flat fill and camera lock cannot be measured on this episode")
    else:
        idx = sorted({int(len(elig) * (i + 0.5) / N_SAMPLES) for i in range(N_SAMPLES)})
        outdir = os.path.join(ROOT, "out", "_gate")
        os.makedirs(outdir, exist_ok=True)
        locks = []
        try:
            for i in idx:
                s = elig[i]
                f0 = s["startFrame"] + SAMPLE_AT
                a = still(f0, os.path.join(outdir, f"f{f0}.png"))
                b = still(f0 + PAIR_GAP, os.path.join(outdir, f"f{f0 + PAIR_GAP}.png"))
                fp, zc = flat_pct(a), zero_cells(a, b)
                locks.append((zc, s["id"], f0))
                print(f"  style {s['id']} f{f0} @{GATE_W}x{GATE_H}: flat fill {fp:5.2f}%  "
                      f"locked cells {zc}/48")
                if fp < FLAT_LO:
                    fails.append(f"{s['id']} f{f0}: flat fill {fp:.1f}% @{GATE_W}x{GATE_H} < {FLAT_LO:.0f}% — "
                                 f"texture/gradients/noise are back in the art (bible §5: flat vector, no texture)")
                elif fp > FLAT_HI:
                    fails.append(f"{s['id']} f{f0}: flat fill {fp:.1f}% @{GATE_W}x{GATE_H} > {FLAT_HI:.0f}% — "
                                 f"the frame is EMPTY, not clean; this template is below reference density")
        except Exception as e:
            fails.append(f"style frame checks could not run: {e}")
        if locks:
            best = max(locks)
            # The reference itself measures 2 locked shots in 3 (the third is a deliberate full-frame
            # motion beat), and some templates legitimately animate a vehicle across the whole frame,
            # so ONE sampled shot must be genuinely locked, not all of them. A camera regression (a
            # dolly push, a parallax sway, a drifting overlay) is global — it moves every shot — so it
            # cannot hide behind this: it drives every sample to near 0 locked cells.
            if best[0] < LOCK_CELLS:
                fails.append(f"camera not locked: best sampled shot {best[1]} f{best[2]} has only "
                             f"{best[0]}/48 cells at exactly 0.0 over {PAIR_GAP} frames (need >= {LOCK_CELLS}); "
                             f"all samples: " + ", ".join(f"{sid} {z}/48" for z, sid, _ in locks))

# 5) optional rendered video
if len(sys.argv) > 1:
    v = sys.argv[1]
    if not os.path.exists(v) or os.path.getsize(v) < 1_000_000:
        fails.append(f"video missing/too small: {v}")

_wpm = f" | narration: {runtime_wpm:.1f} WPM runtime" if runtime_wpm is not None else ""
print(f"runtime: {runtime_min:.1f} min{_wpm} | scenes: {len(tl['scenes'])} | warnings: {len(warns)} | failures: {len(fails)}")
for w in warns: print("  WARN:", w)
for f in fails: print("  FAIL:", f)
print("GATE: PASS ✅" if not fails else "GATE: HALT ❌ — do not publish")
sys.exit(1 if fails else 0)
