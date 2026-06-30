# CoreLifecycle Packaging Playbook — Thumbnails, Titles, Descriptions

Genre: faceless cinematic "Every Level of a [Profession]" (money / power / ambition).
House style: white stick figure, dark moody skyline, grey-blue + one accent. Mobile-first.
(Note: written from established YouTube best practices + genre analysis; refresh with live
CTR data once the channel has views — see the Learning section.)

## THUMBNAILS  (1280×720, <2MB, sRGB)
Design rules:
- MOBILE-FIRST. It must read at ~120px wide. Shrink it and squint before approving.
- ONE idea. Max 3–5 words of text. Huge, heavy, condensed font (Anton / Archivo Black).
- Extreme contrast: dark scene + ONE bright focal (white figure, glowing number). Pops against
  YouTube's UI.
- Curiosity gap + stakes. Show extremes (bottom vs top, $0 vs $millions).
- Emotion: use the figure's expressive face (exhausted vs smug) — emotion drives clicks even on a
  stick figure.
- ONE accent color = money. Use gold (#f2c14e) for the number/arrow; keep everything else cold.
- Consistent TEMPLATE every video → instant brand recognition in the feed (compounds CTR + subs).
- Avoid: full sentences, tiny text, clutter, low contrast, repeating the title verbatim.

Three reusable templates:
- **A — The Ladder:** tiny white figure bottom-left, glowing apex top-right; giant text
  "EVERY LEVEL OF A LAWYER". (signature look)
- **B — Two-State Contrast:** left = exhausted figure + "$225K"; right = smug figure + "$8M";
  gold arrow between. Sells transformation.
- **C — Big Number:** single white figure + huge gold "$3,000,000" + profession word. Sells stakes.

## TITLES  (front-load; ~50–60 chars ideal, <70 to avoid truncation)
- Core format: `Every Level of a [Profession] — From [Bottom] to [Top]`
- Levers: curiosity + specificity + stakes + numbers/extremes.
- Power phrases: "What It Really Costs", "What Nobody Tells You", "From $0 to …", "The Brutal Truth About".
- Complement the thumbnail; don't duplicate its words.
- Generate 2–3 options per video; pick by gut now, by CTR later.
Examples:
- Every Level of a Lawyer — From Associate to Architect
- Every Level of a Surgeon (and What It Really Costs)
- The 8 Levels of Power in Finance, Explained

## DESCRIPTIONS  (~200–300 words; first 150 chars are everything)
1. **Hook** (1–2 sentences, the premise) — visible above "…more", keyword-rich.
2. **Expansion** paragraph (keywords: every level, [profession], career, salary, power, money).
3. **Chapters / timestamps** `0:00 …` per level — auto-generated from timeline.json. Boosts
   retention + SEO + adds a clickable contents.
4. **CTA:** "Subscribe to climb. New stories regularly."
5. **Hashtags** (3–5): #everylevel #[profession] #finance #career #money
6. **Boilerplate + disclaimer:** one-line channel blurb; "Dramatization for educational/
   entertainment purposes."

## CONSISTENCY = COMPOUNDING
Same thumbnail template, font, gold accent, and title format on EVERY video. Recognition in the
feed is a growth multiplier; resist the urge to redesign per video.

## LEARNING (once there's data)
- Track per video: **CTR** (early target 4–6%, great >8%), **avg % viewed**, **30-sec retention**.
- Weekly: pull analytics (yt_analytics.py) → log winners/losers into improvements.json →
  the packager favors high-CTR thumbnail/title patterns next runs. A/B by alternating templates.
