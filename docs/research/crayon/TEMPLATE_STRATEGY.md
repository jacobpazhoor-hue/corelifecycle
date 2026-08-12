# Template strategy — measured, 2026-08-11

Data source: **31 distinct episodes** recovered from `git log -- content.py`, **958 scene-slots**,
**184 distinct templates** actually used (~31 scenes/episode).

## The distribution is flat — there is no top tier to rebuild

| coverage of all historical scene-slots | templates required |
|---|---|
| 50% | 33 |
| 60% | 46 |
| 70% | 63 |
| 80% | **85** |
| 90% | **119** |
| 95% | 143 |

The most-used template (`window`) accounts for just **4.7%** of scene-slots. **35 templates (19%) were
used exactly once.** This is a long tail, not a power law.

## Per-episode coverage kills the "rebuild the top tier" plan

If we rebuild the top N templates, this is how much of a *typical* episode is covered:

| rebuilt | median episode | **worst episode** | best |
|---|---|---|---|
| top-20 | 37.5% | **0.0%** | 71.9% |
| top-40 | 55.2% | **7.1%** | 87.9% |
| top-60 | 70.0% | **7.1%** | 100% |
| top-80 | 80.0% | **28.6%** | 100% |
| top-100 | 86.7% | **42.9%** | 100% |
| top-120 | 93.8% | 53.6% | 100% |

The **worst** column is decisive. Even after rebuilding **100** templates, some episode still renders
with **57% of its scenes un-restyled** — more than half its frames visibly wrong.

The cause is structural: episodes are topic-locked to packs (`ROMAN`, `CARTEL`, `SAMURAI`, `MONGOL`,
`GLADIATOR`, `PIRATE`, `SPACE`, `YAKUZA`, …). A Rome episode draws almost entirely on Rome templates,
which are nowhere near the global top tier. **For any given episode, the long tail *is* the episode.**

## The format swap dissolves the problem

The 184-template sprawl is a direct consequence of the *old* format: fictional POV ladders across exotic,
high-variance settings (gladiator pits, cartel tunnels, Mongol steppe, deep space).

The Crayon format is **finance/business explainers about real subjects**. The seven autopsied videos —
Wolf of Wall Street, Enron, 2008, Great Depression, Rockefeller, Bezos, Singapore — run almost entirely on
a narrow, repeating environment set:

> office / cubicle floor · boardroom · trading floor · bank or institutional exterior · street ·
> domestic interior · courtroom or hearing · factory / industrial · newspaper & document montage ·
> broadcast or news frame · crowd or queue · character close-up · chart & diagram · multi-panel split ·
> full-screen text card

That is on the order of **20–30 templates**, reused heavily across every episode, which is exactly what
the reference channel does — and exactly why their frames can be dense: a small set gets the investment.

## Decision

**Do not restyle the 358-template library, and do not rebuild a "top tier" of it.** Both are defeated by
the coverage maths above.

Instead, **build a new, small, dense template set for the explainer format** (~20–30), on top of:
- `src/setdressing.tsx` — the 13-component shared library (WO-8d)
- the environment **kits** idea — one-line presets composing 4–6 library components per archetype
- `shade()` local-tone variety (WO-8e)

The existing 358 templates stay in the registry, unrestyled, unused by the new format. They are not
deleted — the old format still renders if anyone wants it.

### Consequence for the plan
WO-8's "restyle ~358 templates across 27 packs" is **cancelled** and replaced by:
- **WO-8f** — define the explainer template set + environment kits
- **WO-8g…** — build them at reference density (the WO-8d loop: compose, render, look, fix staging)

This is the difference between ~250–350 hours of agent time plus a human eye on every one of 358 frames,
and roughly 25 templates built properly.
