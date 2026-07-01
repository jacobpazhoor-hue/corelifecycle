# Engagement / Short-Attention Plan (2026-06-30)
Research-backed changes to keep short-attention viewers watching. 3 parallel research streams
(voice/pacing, retention-editing/story-timing/motion, thumbnail-intrigue). Sources in the streams.

## North-star (unchanged): ≥70% retention @0:30, 40–55% avg-%-viewed. The decision happens in ~8s;
~55% of viewers leave by 0:60; the 50% mark is the 2nd-biggest drop. Keeping >65% past minute 1
→ ~58% higher AVD for the whole rest. So: faster feel + no dead beats + re-hooks.

## 1. VOICE & TIMING  (gen_voice_edge.py)  — the biggest "feels faster" win is cutting dead air
- edge-tts **RATE `+0%` → `+10%`** (~150→~165 WPM; the retention sweet spot, well under the ~180 cliff).
- **GAP `0.5s` → `0.25s`** default, with a **per-scene override** (`gap=0.6–0.8`) ONLY on dramatic
  reveal/cliffhanger beats — contrast makes the fast parts feel faster.
- **LEAD `0.2s` → `0.1s`**.
- **Trim leading/trailing silence** off each TTS clip (kills accumulated breaths/tails).
- Net: ~0.35s dead air removed per scene (~20–30s across a video) + 10% faster delivery.
- Hard stop: never exceed +15% / ~180 WPM (comprehension cliff; prosody flattens).

## 2. STORY & TIMING  (AUTOPILOT_PROMPT.txt + BIBLE)
- **One complete beat per 60–90s; each SCENE 20–40s; ≤~70 narration words/scene.** Too-slow script
  pacing is the #1 faceless-retention killer (even at high WPM).
- **Front-load every scene on tension/a question, not exposition.** No dead beats: every line raises
  or pays off tension ("make everything necessary, not shorter").
- **Re-hooks at the 25% / 50% / 75% marks** (change the pattern: escalate, twist, or a direct 2nd-person
  question "Would you have run?"). The 50% mark is the biggest mid-video drop.
- **Verbal re-hook connectives between levels** — not "next level" but "but reaching level 4 means
  nothing if you can't survive level 5." Never plant a loop you don't pay off.
- **Intro hotter:** first ~3 min = shortest scenes, fastest cadence; the hook (0–15s) pays the
  title/thumbnail promise instantly.

## 3. ANIMATION / MOTION  (director.tsx + Video2.tsx)  — never a dead frame
- **Cap any single shot at ~8s** (target ~6s); something must visibly change every 5–8s. Split long
  shots in the planner.
- **Punch-in** (quick scale pop) on the count-up number / level reveal — a dopamine micro-hit.
- **Continuous micro-drift** on every shot so a frame is never static (on top of the expo push).
- **Speed-ramp + whoosh on level transitions** (whoosh already added in Phase 2).
- **On-screen text = rhythmic, not constant:** keep the level label (chapter heading) + ONE number/
  keyword pop per scene; quiet beats between. (Long-form wants chapter headings, NOT karaoke captions.)
- **Restraint:** whip-pans / burst rapid-cuts ONLY at climaxes/level-changes (1–2 per video) — constant
  effects read as noise. (MrBeast pivoted 38→23 cuts/min in 2024: pacing serves story, not the reverse.)

## 4. THUMBNAIL INTRIGUE  (thumbs.tsx)  — build each around ONE withheld question
The cliché "yellow bg + red arrow at nothing + fake-shock face" is FATIGUED. New intrigue recipes
(all SVG/CSS doodle, keep warm-paper/gold series branding):
- **scaleterror** — tiny hero dwarfed by a huge looming threat silhouette ("how does he survive THAT?").
- **freeze** — hero frozen mid-disaster (sword at neck / over a trapdoor), result withheld + motion lines.
- **redacted** — block the key element (marker bar / torn rip / giant "?") so the brain must resolve it
  (~+43% CTR from obscuring ~27% of the image).
- **eyeline** — hero's gaze + the curved arrow aimed at a PARTLY-shown mystery (fixes "arrow at nothing").
- **beforeafter** (have it) — ambiguous glory-or-ruin transformation (+35% vs finished-state-only).
- Emotion w/o faces = **body language** (arms up, buckling, fleeing) + exaggerated eyes/brows + sweat/!?
- **≤3 words**, ONE red keyword, fat marker font + outline, 120px-legible; arrow only at a withheld thing.

## Rollout
Implement all 4 now, validate on the freed Mac (voice WPM check + a segment render + thumbnail contact
sheet), update BIBLE + AUTOPILOT_PROMPT so the NEXT autopilot episode inherits everything. Cloud render
(GitHub Actions) remains the reliability fix for the render itself.
