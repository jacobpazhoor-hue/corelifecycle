#!/usr/bin/env python3
"""PREDICT the gate's narration rate from content.py, BEFORE a single second of voice is synthesised.

WHY THIS EXISTS. `gate.py` asserts runtime-inclusive WPM, and it can only do that after
`gen_voice_edge.py` has synthesised every scene and written `src/timeline.json` — i.e. after the
expensive part of the night. When that assert fails the autopilot HALTs, nothing uploads, and the
channel is dark until someone looks. The two most recent episodes both landed inside 1.5 WPM of the
band floor (madoff 143.4, theranos 144.5, floor then 143.0), so this is not a distant risk: the
writer has been walking the edge without any way to see the edge.

The number IS predictable. At a fixed synth rate the voice speaks at a near-constant SYLLABLE rate,
so runtime WPM is set by how long the writer's WORDS are and by nothing else:

    WPM_runtime  ~=  K / (syllables per word)

K absorbs everything that is not the writer's vocabulary — the per-scene lead-in, the inter-scene
gaps, the dialogue beats — all of which are near-constant per minute across episodes of this format.
That is why K is calibrated against FINISHED BUILDS rather than derived: see the table below.

WHAT THIS IS NOT. It does not re-implement the timeline. It cannot see a gap change, a scene-count
change, or a RATE change, and it will be wrong (in the direction of the change) if you make one.
It is a cheap early warning on the one variable the writer actually controls, not a second gate.
`gate.py` remains the authority, and this script never gates anything.

Usage:  python3 scripts/wpm_predict.py [content.py]
Exit 0 = predicted inside the band.  Exit 3 = predicted OUTSIDE it — REWRITE NOW, while it is still
a cheap edit, rather than after the build HALTs. Exit 1 = could not measure (loudly; never silently
"fine").
"""
import os, re, sys, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Syllable counting is a heuristic, not a dictionary lookup, and it is labelled as such everywhere it
# surfaces. It MOVED HERE from scripts/review_facts.py (which now imports it) so that there is
# exactly one counter in the repo: K below is calibrated against this function's output, so a second
# copy that drifted by one vowel rule would silently invalidate the constant.
_VOWELS = "aeiouy"


def syllables(word):
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w:
        return 0
    n, prev_vowel = 0, False
    for ch in w:
        is_vowel = ch in _VOWELS
        if is_vowel and not prev_vowel:
            n += 1
        prev_vowel = is_vowel
    if w.endswith("e") and not w.endswith(("le", "ee", "ye")) and n > 1:
        n -= 1
    return max(1, n)

# ---------------------------------------------------------------------------------------------
# K — CALIBRATED, NOT DERIVED. Measured as (runtime WPM x syllables-per-word) on finished builds,
# with syllables counted by review_facts.syllables above and words counted exactly as gate.py counts
# them (content.py narration, split on whitespace, summed over the timeline's scenes).
#
#   episode   date        words  syll/word  measured WPM   implied K
#   madoff    2026-08-17   2355    1.4594      143.44        209.35
#   theranos  2026-08-16   2149    1.4588      144.49        210.79
#   ------------------------------------------------------------------ K = 210.0 (used here)
#   lehman    2026-08-15   2467    1.4220      155.66        221.34   <- SEE THE WARNING BELOW
#
# K = 210.0 predicts both current-pipeline episodes to within 0.6 WPM (143.9 vs 143.4, 143.9 vs
# 144.5), which is the accuracy claim this file makes and the only one it makes.
#
# THE LEHMAN DIVERGENCE IS UNEXPLAINED AND IS WRITTEN DOWN RATHER THAN AVERAGED AWAY. That build ran
# at the same nominal RATE ("-5%" in both gen_voice_edge.py and its content.py) yet speaks ~5% faster
# by every measure taken off its own timeline (4.17 syllables/sec vs 3.96, 12.87 chars/sec vs 12.24).
# No commit to gen_voice_edge.py, audio_master.py or the gap constants sits between it and theranos.
# 221.3 is ALSO the constant quoted in gen_voice_edge.py's -5% note and in docs/BIBLE.md, because
# both were written from that one build — and the two episodes actually produced since then say 210.
# K is set from the two most recent builds because they are what this pipeline currently does.
# IF YOU CHANGE gen_voice_edge.RATE, THIS CONSTANT IS STALE. Re-measure it on the next finished
# build (the formula is one line: runtime WPM x syllables-per-word) instead of trusting it.
K = 210.0
K_TOLERANCE = 0.6      # WPM; the worst residual across the two calibration episodes
# ---------------------------------------------------------------------------------------------


def gate_band():
    """WPM_LO/WPM_HI read out of gate.py's SOURCE, so this file can never disagree with the gate.

    Deliberately not `import gate` — gate.py runs its whole check suite at import time (it reads the
    timeline, opens every wav, and can render frames). Raises rather than falling back to a guess: a
    predictor quoting a band the gate does not use is worse than no predictor.
    """
    src = open(os.path.join(ROOT, "gate.py")).read()
    m = re.search(r"^WPM_LO,\s*WPM_HI\s*=\s*([\d.]+),\s*([\d.]+)", src, re.M)
    if not m:
        raise SystemExit("wpm_predict: cannot find `WPM_LO, WPM_HI = ...` in gate.py — "
                         "the band moved or was renamed; fix this parser rather than guessing.")
    return float(m.group(1)), float(m.group(2))


def load_scenes(path):
    spec = importlib.util.spec_from_file_location("content_for_wpm_predict", path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = mod
    spec.loader.exec_module(mod)
    if not getattr(mod, "SCENES", None):
        raise SystemExit(f"wpm_predict: {path} defines no SCENES")
    return mod.SCENES


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "content.py")
    scenes = load_scenes(path)
    lo, hi = gate_band()

    per_scene = []
    words_total = syl_total = 0
    for sc in scenes:
        w = sc["narration"].split()
        if not w:
            continue
        syl = sum(syllables(x) for x in w)
        words_total += len(w)
        syl_total += syl
        per_scene.append((syl / len(w), sc["id"], len(w)))
    if not words_total:
        raise SystemExit("wpm_predict: no narration words found")

    spw = syl_total / words_total
    wpm = K / spw
    runtime_min = words_total / wpm          # follows from the same relation; a cross-check, not news
    # The band expressed in the units the writer edits in.
    spw_max = K / lo                         # longer words than this and the build HALTs low
    spw_min = K / hi

    print(f"wpm_predict: {words_total} words, {syl_total} syllables, "
          f"{spw:.4f} syllables/word (heuristic counter)")
    print(f"  predicted runtime WPM  {wpm:.1f}  (+/- {K_TOLERANCE} measured; K={K})")
    print(f"  predicted runtime      {runtime_min:.2f} min")
    print(f"  gate band              {lo:.1f}-{hi:.1f}  ->  syllables/word must stay "
          f"{spw_min:.3f}-{spw_max:.3f}")

    if wpm < lo or wpm > hi:
        side = "BELOW" if wpm < lo else "ABOVE"
        print(f"  PREDICTED OUTSIDE THE BAND ({side}) — gate.py will HALT this build.")
        if wpm < lo:
            # The only lever that moves this number is word length. Adding words raises the word
            # count and the runtime together and barely moves the ratio (docs/BIBLE.md §3a).
            print("  FIX: use SHORTER WORDS — 'lab' not 'laboratory', 'about' not 'approximately',")
            print("       'he lied' not 'he misrepresented the situation'. Do NOT add words or scenes.")
            # Ranked by EXCESS SYLLABLES (syllables - spw_max x words), not by ratio: a one-word
            # scene at 2.0 syll/word is not the problem, a 40-word scene at 1.6 is.
            print("  Worst scenes by excess syllables over the band (rewrite these first):")
            worst = sorted(((r * nw - spw_max * nw, r, sid, nw) for r, sid, nw in per_scene),
                           reverse=True)[:10]
            for excess, r, sid, nw in worst:
                print(f"    {sid:>8s}  {r:.2f} syll/word over {nw:3d} words  (+{excess:.1f} syllables)")
        else:
            print("  FIX: split more scenes (docs/BIBLE.md §3a) — do NOT touch gen_voice_edge.RATE.")
        return 3

    margin = min(wpm - lo, hi - wpm)
    if margin < 2.0:
        print(f"  WARN: only {margin:.1f} WPM of margin, and this prediction carries "
              f"+/-{K_TOLERANCE}. Buy margin now, in the script, not later in the gate.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
