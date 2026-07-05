# CoreLifecycle — Weekly Growth Ops (human-in-Studio checklist)

The nightly autopilot handles **produce → review → publish**. These are the growth levers the 2026 data
says matter that are **NOT reliably automatable** (they need YouTube Studio UI or judgment). Do the per-
upload ones on each video; the weekly ones once a week. Full rationale: NEXT_LEVEL_PLAN.md Phase 5.

## Per upload (2 min each)
- [ ] **Test & Compare** — add the 3 alt thumbnails (autopilot renders `ThumbAll` variants) AND up to
  3 alt titles. Winner is chosen by watch-time share in ~2 weeks. Run it on EVERY upload. (Studio →
  video → Test & Compare.) This is the single highest-leverage packaging lever.
- [ ] **Pin the debate comment** — paste `pinned_comment` from `out/upload_kit.json` and pin it.
  Challenge-style pins get ~37% more replies; comments are an active-engagement ranking signal.
- [ ] **End screen → next-best video** — point it at the ONE video ≥70% of viewers would want next
  (usually the same format/universe). End-screen clickers watch ~2× longer sessions.
- [ ] **Add to the right playlist** — Crime Ladders / Empires / Survival / Scenarios (binge design;
  playlists lift session time 10–30%). Create the playlist once, then reuse.

## First 6–12 hours after publish (the engagement window)
- [ ] **Reply + heart hard** — commenters are still on-platform; replies multiply. Prioritize the
  first 6–12h. Answer real questions (thread depth > emoji count as a signal).

## Weekly
- [ ] **Community poll** — post the `community_poll` from the kit ("which life next?"). 1.5–6× the
  engagement of other post types AND doubles as free topic validation — feed winners into
  `ops/topic_queue.json`.
- [ ] **Retro-package the losers** — any video with high impressions + **CTR < 3% after 14 days** gets
  a NEW thumbnail/title from a DIFFERENT archetype (Vevo-style revival). Change on evidence, wait 24h+.
- [ ] **Shorts funnel** — post 2–4 same-universe cliffhanger Shorts/week (autopilot cuts one per
  episode) WITH the related-video link set to the long. Keep Shorts ≤ ~40% of uploads (18k-channel
  study: above ~55% Shorts, long-form thins).

## KPI dashboard (check weekly; targets from the research)
| Metric | Target | Why |
|---|---|---|
| Retention @ 0:30 | **≥70%** | the core ranking input; the cold open earns it |
| Avg % viewed (12-min) | **40–55%** (50%+ = 3× recommendation odds) | +10pt ≈ +25% impressions |
| Browse/suggested CTR | **6–8%+** (retro-package below 3%) | packaging is ~½ the click |
| End-screen CTR | **≥5.5%** | session contribution — the top 2026 long-form signal |

## Cadence decision (yours — see ops/routine.json `_cadence`)
The 18,000-channel data says **3–4 longs/week out-earns daily per video** (and YouTube caps
notifications at 3/day). Recommended: **4 longs/week (Mon/Wed/Fri/Sun) + 2–3 Shorts/week**, reinvesting
the freed compute into quality. To switch: change `ops/com.corelifecycle.daily.plist` from a daily
`StartCalendarInterval` to those weekdays and `launchctl unload/load` it. Keep daily only if you prefer
volume lottery tickets. (Left as daily until you decide.)

## Later (≥20K subs)
- Sister-channel collab-credit seeding (the MasterPOVs×Fletch play). · Spanish localization
  (docs/bibles/LOCALIZATION_PLAN.md). · Compilation "Part 1/2" megacuts from existing renders (zero
  marginal render cost — pure ffmpeg concat once you have 20+ episodes).
