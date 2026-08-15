#!/usr/bin/env python3
"""Precompute the deterministic statistics the REVIEWER re-derives by hand every night.

WHY THIS EXISTS (token audit 2026-08-15, docs/TOKEN_AUDIT.md §5.2 / §7 S7). One measured review
session (`37d14fd5`) spent **39 Bash turns** re-discovering the repo and re-computing, with ad-hoc
python one-liners written fresh each night, the scene count, the shot distribution, the template
histogram, the chapter timestamps, the title length and the archetype history. All of it is
deterministic and computable in well under a second. At ~133k tokens of resident context per turn,
that is ~2.6M context tokens re-spent nightly on arithmetic the machine can do once.

THIS FILE ADDS INFORMATION, IT REMOVES NONE. The reviewer keeps every frame and every file it reads
today. It is explicitly still free — and told, in REVIEW_PROMPT.txt — to re-measure anything it
doubts. The goal is to stop it re-deriving arithmetic, not to stop it checking.

Every number here is derived from the SAME sources the reviewer would use:
  src/timeline.json      — the timeline that will be (was) rendered: durations, order, templates
  content.py             — the writer's source: narration, per-scene devices
  ops/episode_meta.json  — the packaging copy (title, description/chapters, thumbnail)
  git history of ops/episode_meta.json — the previously-shipped thumbnail archetypes

The WPM quotient is computed with gate.py's exact definition (content.py words / timeline minutes,
runtime-inclusive) so the two files can never disagree about the constant the build HALTs on.

Usage:  python3 scripts/review_facts.py [outfile=out/review/facts.json]
Exits non-zero, loudly, if it cannot produce the file. The caller (daily_autopilot.sh) treats that
as non-fatal: a missing facts.json simply puts the reviewer back to deriving by hand, which is
exactly the behaviour before this script existed.
"""
import os, sys, json, re, subprocess, datetime, statistics as stats
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "out", "review", "facts.json")

# Syllable counting is a heuristic, not a dictionary lookup — it is labelled as such in the output.
# It exists because BIBLE §3a's WPM predictor (WPM ~= 215 / syllables-per-word) is the single most
# useful number for diagnosing a rate problem, and the reviewer currently estimates it by eye.
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


def mmss(seconds):
    seconds = int(round(seconds))
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def main():
    tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
    meta = json.load(open(os.path.join(ROOT, "ops", "episode_meta.json")))
    sys.path.insert(0, ROOT)
    from content import SCENES  # same import gate.py makes; the writer's source of truth

    fps = tl["fps"]
    tl_scenes = tl["scenes"]
    by_id = {s["id"]: s for s in SCENES}

    runtime_sec = tl["totalFrames"] / fps
    runtime_min = runtime_sec / 60

    # ---- shot distribution (BIBLE §3a — the DISTRIBUTION matters more than the mean) -------------
    durs = [s["durationInFrames"] / fps for s in tl_scenes]
    ranked = sorted(
        ({"id": s["id"], "sec": round(s["durationInFrames"] / fps, 2), "template": s["template"]}
         for s in tl_scenes), key=lambda d: d["sec"])
    shot = {
        "count": len(durs),
        "mean_sec": round(stats.mean(durs), 2),
        "median_sec": round(stats.median(durs), 2),
        "min_sec": round(min(durs), 2),
        "max_sec": round(max(durs), 2),
        "stdev_sec_sample": round(stats.stdev(durs), 2),
        "stdev_sec_population": round(stats.pstdev(durs), 2),
        "median_below_mean": stats.median(durs) < stats.mean(durs),
        "n_ge_12s": sum(1 for d in durs if d >= 12),
        "n_le_2p5s": sum(1 for d in durs if d <= 2.5),
        "longest_5": list(reversed(ranked[-5:])),
        "shortest_5": ranked[:5],
        "cuts_per_min": round(len(durs) / runtime_min, 2),
    }

    # ---- template histogram + separation ---------------------------------------------------------
    seq = [s["template"] for s in tl_scenes]
    hist = Counter(seq)
    adjacent = [{"i": i, "template": seq[i], "ids": [tl_scenes[i]["id"], tl_scenes[i + 1]["id"]]}
                for i in range(len(seq) - 1) if seq[i] == seq[i + 1]]
    last_seen, separations = {}, []
    for i, t in enumerate(seq):
        if t in last_seen:
            separations.append({"template": t, "gap_scenes": i - last_seen[t],
                                "ids": [tl_scenes[last_seen[t]]["id"], tl_scenes[i]["id"]]})
        last_seen[t] = i
    min_sep = min((s["gap_scenes"] for s in separations), default=None)
    # "no room used much more than once per 10 scenes" -> the per-10-scene budget for this length
    per10_budget = round(len(seq) / 10.0, 1)
    templates = {
        "histogram": dict(hist.most_common()),
        "distinct_used": len(hist),
        "adjacent_repeats": adjacent,
        "min_separation_scenes": min_sep,
        "pairs_at_min_separation": [s for s in separations if s["gap_scenes"] == min_sep][:10],
        "pairs_closer_than_3": [s for s in separations if s["gap_scenes"] < 3],
        "per_10_scene_budget": per10_budget,
        "over_budget": {t: c for t, c in hist.items() if c > per10_budget},
        "order": seq,
    }

    # ---- device inventory (the reviewer's "DEVICE VARIETY" rubric item) --------------------------
    card_kinds = Counter()
    devices = Counter()
    for s in SCENES:
        c = s.get("card")
        if isinstance(c, dict):
            card_kinds[c.get("kind", "?")] += 1
            devices["card"] += 1
        for k in ("bubbles", "panels", "foreground", "dialogue", "breath", "period", "overlay", "gap"):
            if s.get(k):
                devices[k] += 1
    device_block = {
        "scenes_total": len(SCENES),
        "card_total": devices.get("card", 0),
        "card_kinds": dict(card_kinds),
        "bubbles": devices.get("bubbles", 0),
        "panels": devices.get("panels", 0),
        "foreground": devices.get("foreground", 0),
        "dialogue": devices.get("dialogue", 0),
        "breath": devices.get("breath", 0),
        "period_marked": devices.get("period", 0),
        "overlay": devices.get("overlay", 0),
        "explicit_gap": devices.get("gap", 0),
        "scenes_with_no_device": sum(
            1 for s in SCENES
            if not any(s.get(k) for k in ("card", "bubbles", "panels", "foreground", "dialogue", "overlay"))),
    }

    # ---- chapters: card timestamps vs the description's, MEASURED off the timeline ---------------
    # The reviewer's rubric calls this out specifically: "the writer computes them by hand and they
    # have been measured up to TWO MINUTES out, which publishes wrong YouTube chapter markers."
    chapter_scenes = []
    for s in tl_scenes:
        card = (by_id.get(s["id"]) or {}).get("card")
        if isinstance(card, dict) and card.get("kind") == "chapter":
            title, sub = card.get("title", ""), card.get("subtitle", "")
            chapter_scenes.append({
                "id": s["id"], "level": s.get("level"),
                "start_frame": s["startFrame"],
                "start_sec": round(s["startFrame"] / fps, 2),
                "start_mmss": mmss(s["startFrame"] / fps),
                "title": title, "subtitle": sub,
                "two_part_name": f"{title}: {sub}",
                "subtitle_chars": len(sub),
                "subtitle_over_36": len(sub) > 36,
            })
    described = [{"mmss": m, "sec": int(m[:2]) * 60 + int(m[3:5]), "name": n.strip()}
                 for m, n in re.findall(r"^(\d{2}:\d{2})\s+(.+)$", meta.get("body", ""), re.M)]
    # The description carries a leading "00:00 Cold Open" that has no chapter card; align by
    # dropping description entries whose timestamp precedes the first chapter card.
    aligned = []
    cand = [d for d in described if chapter_scenes and d["sec"] >= 0]
    offset = len(cand) - len(chapter_scenes)
    if offset >= 0:
        for d, c in zip(cand[offset:], chapter_scenes):
            aligned.append({
                "described": d["mmss"], "described_name": d["name"],
                "actual": c["start_mmss"], "actual_name": c["two_part_name"],
                "drift_sec": round(c["start_sec"] - d["sec"], 1),
                "drift_over_5s": abs(c["start_sec"] - d["sec"]) > 5,
                "name_matches": d["name"].strip().lower() == c["two_part_name"].strip().lower(),
            })
    chapters = {
        "count": len(chapter_scenes),
        "cards": chapter_scenes,
        "described_in_meta_body": described,
        "alignment": aligned,
        "timestamps_worst_drift_sec": max((abs(a["drift_sec"]) for a in aligned), default=None),
        "any_drift_over_5s": any(a["drift_over_5s"] for a in aligned),
        "any_name_mismatch": any(not a["name_matches"] for a in aligned),
        "_alignment_note": "description entries before the first chapter card (e.g. '00:00 Cold Open') "
                           "are dropped before pairing; if the counts do not line up, alignment is empty "
                           "and you should pair them by eye.",
    }

    # ---- narration: the sentence bands + the WPM the gate asserts --------------------------------
    # Words are counted exactly as gate.py counts them (content.py narration, split on whitespace,
    # summed over the TIMELINE's scenes) so this quotient is the same one the build gated on.
    missing = [s["id"] for s in tl_scenes if s["id"] not in by_id]
    words_total = sum(len(by_id[s["id"]]["narration"].split()) for s in tl_scenes if s["id"] in by_id)
    text = " ".join(by_id[s["id"]]["narration"] for s in tl_scenes if s["id"] in by_id)
    sentences = [x.strip() for x in re.split(r"[.!?]+", text) if x.strip()]
    slen = [len(x.split()) for x in sentences]
    all_words = text.split()
    syl_total = sum(syllables(w) for w in all_words)
    digit_numbers = re.findall(r"(?<![\w$])\$?\d[\d,.]*%?", text)
    spelled = re.findall(
        r"\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|"
        r"fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|"
        r"ninety|hundred|thousand|million|billion|trillion)\b", text, re.I)
    you_hits = re.findall(r"\b(?:you|your|yours|you're|yourself)\b", text, re.I)
    narration = {
        "timeline_stale_vs_content": missing,
        "words_total": words_total,
        "sentences": len(sentences),
        "sentence_words_mean": round(stats.mean(slen), 2) if slen else None,
        "sentence_words_median": round(stats.median(slen), 1) if slen else None,
        "pct_sentences_under_8_words": round(100 * sum(1 for n in slen if n < 8) / len(slen), 1) if slen else None,
        "band_reminder": "BIBLE §3: mean 7.5-10.6, median 6-9, 40-59% under 8 words",
        "syllables_per_word_heuristic": round(syl_total / len(all_words), 3) if all_words else None,
        "wpm_predicted_from_syllables": round(215 / (syl_total / len(all_words)), 1) if all_words else None,
        "wpm_runtime_inclusive": round(words_total / runtime_min, 1) if runtime_min else None,
        "wpm_gate_band": [143.0, 154.0],
        "_wpm_note": "wpm_runtime_inclusive is gate.py's exact quotient (content.py words / timeline "
                     "minutes). wpm_predicted_from_syllables is BIBLE §3a's predictor and uses a "
                     "HEURISTIC syllable counter — treat a disagreement between the two as noise in "
                     "the heuristic, not as a gate failure.",
        "numbers_digit_form": len(digit_numbers),
        "numbers_spelled_out": len(spelled),
        "_numbers_note": "this script narrates most figures in words, so 'numbers_spelled_out' is the "
                         "one that maps to BIBLE's 29-68 explicit numbers; both counts are given "
                         "because the boundary is a judgement call. Spelled counts each number WORD, "
                         "so a single figure ('six hundred and thirty-nine billion') counts 4.",
        "you_forms": len(you_hits),
        "you_per_1000_words": round(1000 * len(you_hits) / words_total, 2) if words_total else None,
        "you_band_reminder": "BIBLE: 2.6-13.4 per 1000 words, seasoning only, never the frame",
    }

    # ---- packaging: title length + the archetype history the feed-variety rule needs -------------
    title = meta.get("title", "")
    thumb = meta.get("thumb") or {}
    prior = []
    try:
        shas = subprocess.check_output(
            ["git", "log", "-n", "40", "--format=%H", "--", "ops/episode_meta.json"],
            cwd=ROOT, stderr=subprocess.DEVNULL).decode().split()
        seen_topics = set()
        for sha in shas:
            try:
                d = json.loads(subprocess.check_output(
                    ["git", "show", f"{sha}:ops/episode_meta.json"], cwd=ROOT,
                    stderr=subprocess.DEVNULL).decode())
            except Exception:
                continue
            t = d.get("topic")
            if not t or t in seen_topics or t == meta.get("topic"):
                continue
            seen_topics.add(t)
            prior.append({"topic": t, "archetype": (d.get("thumb") or {}).get("archetype"),
                          "title": d.get("title")})
            if len(prior) >= 3:
                break
        archetype_note = None
    except Exception as e:
        archetype_note = f"git history unavailable ({e}) — check the last 3 archetypes by hand"
    packaging = {
        "title": title,
        "title_chars": len(title),
        "title_band": [36, 64],
        "title_in_band": 36 <= len(title) <= 64,
        "thumb_archetype": thumb.get("archetype"),
        "last_3_produced_archetypes": [p["archetype"] for p in prior],
        "archetype_repeats_recent": thumb.get("archetype") in [p["archetype"] for p in prior],
        "prior_episodes": prior,
        "_archetype_note": archetype_note or "read from the git history of ops/episode_meta.json, most "
                                             "recent 3 DISTINCT topics before this one",
        "thumb_non_ascii": {k: v for k, v in thumb.items()
                            if isinstance(v, str) and not v.isascii()},
        "description_chars": len(meta.get("body", "")),
        "hook_first_150": (meta.get("hook") or "")[:150],
    }

    facts = {
        "_what_this_is": "Deterministic statistics for THIS episode, precomputed so the reviewer does "
                         "not have to re-derive them with ad-hoc one-liners. Generated by "
                         "scripts/review_facts.py from src/timeline.json, content.py and "
                         "ops/episode_meta.json — the same files you can read yourself.",
        "_trust": "These are arithmetic, not judgement. Every band reminder quoted here is a pointer "
                  "to the canon, not a verdict. If any number here looks wrong, RE-MEASURE IT — "
                  "you are not required to take this file's word for anything.",
        "generated_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "topic": meta.get("topic"),
        "runtime": {
            "total_frames": tl["totalFrames"], "fps": fps,
            "seconds": round(runtime_sec, 1), "minutes": round(runtime_min, 2),
            "mmss": mmss(runtime_sec), "band_minutes": [13, 21],
        },
        "shot_distribution": shot,
        "templates": templates,
        "devices": device_block,
        "chapters": chapters,
        "narration": narration,
        "packaging": packaging,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(facts, open(OUT, "w"), indent=2)
    print(f"review_facts: {os.path.relpath(OUT, ROOT)} — {shot['count']} scenes, "
          f"{facts['runtime']['mmss']} runtime, {narration['wpm_runtime_inclusive']} WPM runtime, "
          f"{shot['cuts_per_min']} cuts/min, {chapters['count']} chapters, "
          f"worst chapter drift {chapters['timestamps_worst_drift_sec']}s")


if __name__ == "__main__":
    main()
