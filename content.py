#!/usr/bin/env python3
"""Your Life From $0 to Billionaire at Every Level (What It Costs) — POV doodle build, ~12 min.
Grounded in docs/research/self_made_billionaire.md. RANK format: the levels are a NET WORTH ladder
(not a single job title) — one founder, one waste-hauling roll-up, from -$52,000 in debt for a used
truck to a $2.6 billion public company, twenty-four years later. Second-person present-tense POV: the
viewer IS a first-time small-business owner who builds a blue-collar empire, not a tech founder — a
deliberate departure from founder/startup_unicorn/crypto_founder (all software) and venture_capitalist/
hedge_fund_manager (finance), per ops/analytics.json's finding that BUILDER aspiration wins (founder =
41% of all channel views) while passive/institutional-finance ladders flop.

REAL/VERIFIED mechanics woven in (see research doc; flags there): the real shape of H. Wayne Huizenga's
1962 start — $5,000 borrowed from a father-in-law, one used garbage truck, 20 commercial accounts
[VERIFIED, inflation-adjusted here to a modern -$52,000 debt] — as the historical MODEL for this
episode's fictional protagonist, not a biography; real 2025-2026 waste-hauling roll-up acquisition
multiples (3.0-5.5x SDE for owner-operators, up to 9.5-11.0x EBITDA once a permitted landfill is owned)
[VERIFIED, CT Acquisitions/Kingdom Broker]; the real 2024 US average landfill tipping fee (~$62/ton)
[VERIFIED, EREF]; the real, current OSHA maximum per-violation penalty for willful/repeat violations
($165,514, 2025-2026, no inflation adjustment for 2026) [VERIFIED, DOL/OSHA]; and the episode's central
share-worthy fact — refuse and recyclable material collection's real BLS fatality rate (37.4 deaths per
100,000 full-time workers in 2024, the 5th deadliest US occupation, ahead of most police work; 4th
deadliest in 2023 at 41.4/100,000) [VERIFIED, BLS National Census of Fatal Occupational Injuries] — the
real mechanism behind this episode's midpoint reversal. The protagonist, company, driver, rival, and
dealmaker are a FICTIONAL COMPOSITE; no real founder or company is depicted as fact.

SPINE: the big gold number is NET WORTH (not company revenue) — -$52,000 (Year 1, all debt) -> $140,000
(Year 3) -> $1,400,000 (Year 6, the first million) -> $14,000,000 (Year 9, owning disposal) ->
$68,000,000 (Year 12, the PE offer) -> -1 (Year 13, the reversal — a name, not a dollar) ->
$410,000,000 (Year 16) -> $1,200,000,000 (Year 20, the first billion) -> $2,600,000,000 (Year 24, the
apex). The sub-caption never carries a second dollar figure — trucks, counties, a body count — so the
gap between "what you're worth" and "what it cost" stays legible without competing with the gold number.

STORY: ROY — your father-in-law, cosigns the first loan, his act-1 warning (t04 dialogue) that the
truck doesn't care about your letterhead is the theme stated early, paid off structurally (never
literally repeated) by the moral turn at t16 and the reversal at t18. DENNY KOWALSKI — a rival hauler
undercutting on illegal dumping, his taunt at t11 ("guess which of us learns that's a mistake first")
is answered, bitterly, by you being the one who learns it. MARCUS ODELL — planted by name at t07 (an
orientation session that states the real BLS fatality stat while he laughs it off), warmed at t10, killed
at the reversal t18 on the exact mechanism the stat describes (a backing accident, no spotter camera —
the line item cut at t16 to protect a PE recap's multiple). GRANT ASHFORD — the PE dealmaker, introduced
at t15, whose t23 dialogue plants the UNRESOLVED UNIVERSE THREAD (deliberate): his fund is already
circling another distressed regional hauler two states over, never named, for a future episode to pick
up. SENSORY ANCHOR: a $19 digital watch, alarm fixed at 2:00 a.m. since Year 1 — re-triggered at every
level-up (t03, t06, t08, t17, t27) and finally noticed BY someone else (your daughter Ellie, t29 dialogue)
before its last beep closes the loop (t30). BODY-DREAD MOTIF (fact, not feeling): "your hands don't
shake" first at t09 (signing the first roll-up) -> inverted at the reversal t18 ("your hands shake...
the first time in longer than you can place") -> restored, colder, at the apex t27 and the OSHA
citation's echo at t24.

Templates: 5 NEW (a small waste-hauling roll-up pack in src/stage.tsx — cemetery/dawnRoute/truckYard/
landfillView/routeAftermath, the last reusing SPY's existing `nightStreet` backdrop re-staged rather
than authoring a second night-street asset) + universal (window/dinner/fileWall/boardroomNotes/
revolvingDoor/deskClose/emptyChair/signing/atrium/podiumScene/foundationScene) + STARTUP's `ipoBell` (reused straight
from its own pack) + MAFIA's `courtroom` (re-narrated from a RICO trial to an OSHA administrative
hearing, same bench-and-seal reuse crypto_founder validated for an SEC proceeding) + REAL ESTATE's
`rooftopEmpire` (the apex reflection). No two adjacent scenes repeat a template.

STRUCTURAL VARIATION vs the last 2 (venture_capitalist = MID-ACTION cold open / FLAT-THEN-SPIKE act
two / ONE-DOOR-LEFT-OPEN ending; crypto_founder = AFTERMATH cold open / BOOM-BUST-BOOM act two /
COMPLICIT-SILENCE ending): this cold open is FLASH-FORWARD (a funeral years into the arc, cut away
before you reach the grave, then rewind to Year 1 — last used 3 episodes back by zombie_apocalypse, not
consecutively); act two is a STEADY CLIMB WITH ONE VERTICAL DROP — no boom-bust cycling, no flat plateau,
just an uninterrupted rise across levels 1-5 until the single, clean midpoint reversal; the ending is
RETURN-AND-PARTIAL-REPAIR — no mentorship handoff (not torch-passing), nothing left ambiguous for the
protagonist (not one-door-left-open), no mirrored silent choice with a new stranger (not complicit
silence) — instead the loop-close scene shows you finally doing the one small, costly, non-triumphant
thing you didn't do at the original funeral: walking all the way to the stone.

PROMISE -> PAYOFF LEDGER:
  * t01 cold open ("you paid for the flowers," "don't move yet")          -> t30 (this time you walk to the stone)
  * t02 promise/cost-line (the number and the debt trade places)          -> paid off across the arc; echoed at t30's closing line
  * t03 the $19 watch, alarm fixed at 2:00 a.m.                           -> t06/t08/t17/t27 (re-triggered) -> t29 (Ellie notices) -> t30 (the last beep)
  * t04 Roy's dialogue warning (the truck doesn't care about letterhead) -> paid off structurally at t16 (the moral turn) and t18 (the reversal)
  * t07 Marcus planted by name + the real BLS fatality stat               -> t18 (killed on exactly that mechanism) -> t19/t25/t28 (his absence/legacy)
  * t08 the county contract win / Denny's undercutting rumor              -> t11 (Denny's taunt) -> t18-20 (you're the one who learns the lesson)
  * t11 Denny's taunt ("guess which of us learns that first")             -> answered bitterly: you do, not him
  * t15/t16 the safety-budget line cut for the PE recap                   -> t17 (silence) -> t18 (the reversal exploits exactly that cut)
  * t20 the OSHA citation figure ($496,542)                               -> t24 (echoed: "nobody on this floor knows that number. You do.")
  * t23 Grant's mention of another distressed hauler two states over      -> UNRESOLVED, deliberate universe thread for a future episode
  * t29 Ellie notices the watch-check                                     -> t30 (the watch's last beep, acknowledged, not fixed)
  * share beat: the real BLS "37.4 per 100,000" stat (t07)                -> paid off literally as the mechanism of the reversal (t18)
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — flash-forward, a funeral years into the arc, cut away before it resolves ----
    dict(id="t01", level=None, template="graveside", gap=0.7,
         narration=("The suit costs eleven thousand dollars, more than Marcus made in three months "
                    "back when three months was still something anyone here tracked. You stand at the "
                    "edge of the plot, not the front, close enough to hear the pastor's voice go thin "
                    "at the end of a sentence he doesn't finish. Diesel and cut grass. A woman in a "
                    "black coat glances back once. Your phone buzzes once in your pocket — a board "
                    "member, a wire transfer, something that can't actually wait. Don't move yet."),
         overlay=dict(big="$2,600,000,000", sub="YOU PAID FOR THE FLOWERS")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="window",
         narration=("Twelve years earlier none of this exists — not the suit, not the funeral, not a "
                    "name you'll spend the rest of your life trying not to think about out loud. You "
                    "want one thing: to stop owing anyone money by Friday, the way the collection "
                    "notices keep phrasing it, politely, like it's a request. You don't know yet that "
                    "the number and the debt are going to trade places, then trade back, then cost you "
                    "someone else's name entirely."),
         overlay=None),

    # ---- LEVEL 01 · YEAR 1 · -$52,000 ----
    dict(id="t03", level="LEVEL 01  ·  YEAR 1  ·  -$52,000", template="dawnRoute",
         narration=("Fifty-two thousand dollars, borrowed from Roy, your wife's father, buys one used "
                    "truck and twenty stops nobody else wants — a diner, a dry cleaner, eighteen houses "
                    "on a route the last owner couldn't be bothered to finish. WD-40 and last night's "
                    "coffee on your hands by five a.m. A nineteen-dollar digital watch on your wrist "
                    "beeps at 2:00 — the only alarm you own, the only one you'll ever need. You've told "
                    "exactly one person the real number. Roy asked for it in writing."),
         overlay=dict(big="-$52,000", sub="ONE TRUCK · 20 STOPS")),
    dict(id="t04", level=None, template="dinner",
         narration=("Roy's kitchen smells like burnt coffee and the same WD-40 already in your "
                    "knuckles. He drove a truck himself for eleven years before his knees gave out, and "
                    "he never once asks for the loan back out loud. He signed it without reading the "
                    "terms twice; he watches you eat like he's deciding something. Sunday dinner, same "
                    "stool at the counter, same warning every week, worded a little differently each "
                    "time so it doesn't wear out."),
         overlay=None,
         dialogue=dict(text="The truck doesn't care what letters end up after your name. Don't ever let it forget that.")),
    dict(id="t05", level=None, template="fileWall",
         narration=("Three banks say no in nine days, each letter using politer language than the last "
                    "for the same word. A route sheet with twenty stops on it doesn't impress a loan "
                    "committee, no matter how neatly you've typed it. Therefore you stop asking "
                    "permission. You knock on twenty more doors yourself; on the eleventh, a diner "
                    "owner named Frank says yes before you finish the pitch, cash up front, no "
                    "contract. That's the whole strategy for a year."),
         overlay=None),

    # ---- LEVEL 02 · YEAR 3 · $140,000 ----
    dict(id="t06", level="LEVEL 02  ·  YEAR 3  ·  $140,000", template="truckYard",
         narration=("Seven trucks now, parked nose-to-tail behind a fence you own the lock to. Tar and "
                    "hot metal at six p.m., cicadas loud enough to cover the dispatch radio most "
                    "nights. A hundred forty thousand dollars sits in an account that isn't overdrawn "
                    "for the first time in three years — actual number, actual bank, no asterisk next "
                    "to it. The watch still beeps at 2:00. You still get up."),
         overlay=dict(big="$140,000", sub="SEVEN TRUCKS")),
    dict(id="t07", level=None, template="lectureHallScene",
         narration=("Orientation, folding chairs, a trainer's laser pointer lands on a government "
                    "statistic nobody in the room expected: refuse collection kills more workers per "
                    "capita than police work does, more than construction, more than half the jobs "
                    "people call dangerous out loud. Marcus Odell, new hire, twenty-six, laughs it off "
                    "in the back row — the wrong kind of quiet for a fact like that. Write his name "
                    "down. You'll need it later."),
         overlay=dict(big="37.4 PER 100,000", sub="DEADLIER THAN POLICE WORK")),
    dict(id="t08", level=None, template="deskClose",
         narration=("The county contract is worth more than your first four years combined, and it's "
                    "yours by one bid, four percent under the next number — Denny Kowalski's number, "
                    "you'll learn later, the same week he starts skipping the dump fees nobody's "
                    "checking. Late at night, alone, the spreadsheet finally balances for the first "
                    "time since you started. The watch beeps at 2:00 anyway. You never reset it. You "
                    "don't know why yet."),
         overlay=None),

    # ---- LEVEL 03 · YEAR 6 · $1,400,000 ----
    dict(id="t09", level="LEVEL 03  ·  YEAR 6  ·  $1,400,000", template="signing",
         narration=("Three tiny haulers sign over their routes for a fraction of what they're worth, "
                    "seller financing on the rest — thirty-one trucks, three counties, thirty-one "
                    "accents at your table when you're being generous about calling it a company. Two "
                    "of the three owners tear up signing away thirty years each; the third only asks "
                    "if the trucks keep their names painted on the doors. One point four million "
                    "dollars, the first million multiplied. The pen doesn't shake. Yours never has."),
         overlay=dict(big="$1,400,000", sub="31 TRUCKS · THREE COUNTIES")),
    dict(id="t10", level=None, template="dawnRoute",
         narration=("Marcus rides the footboard on your old original route now, the one you drove "
                    "yourself for four straight years. Same porch lights. Same dog at 1409 that still "
                    "hates the truck at exactly the same pitch it did back then — loyalty, maybe, or "
                    "just a lack of imagination. He says the job's easy money if you don't think about "
                    "it too hard. Don't correct him. He's not wrong yet."),
         overlay=None),
    dict(id="t11", level=None, template="atrium",
         narration=("An industry mixer, a hotel atrium, a signature cocktail nobody asked for. Denny "
                    "finds you by the window, ice clinking, a grin that's spent money on dental work "
                    "you haven't gotten around to yet. You could tell him what the real margin on the "
                    "county contract actually is. You don't. Some numbers are worth more unsaid than "
                    "said."),
         overlay=None,
         dialogue=dict(text="Cheaper trucks, cheaper dumps, cheaper everything. Guess which one of us learns that's a mistake first.")),

    # ---- LEVEL 04 · YEAR 9 · $14,000,000 ----
    dict(id="t12", level="LEVEL 04  ·  YEAR 9  ·  $14,000,000", template="landfillView",
         narration=("A transfer station, then half a landfill — the actual dirt, the actual permit, "
                    "the thing that turns a hauling company into an owner of disposal itself. Methane "
                    "flares off a stack in the distance, gulls circling like they're paid to work the "
                    "tipping face. Fourteen million dollars, and the multiple on the business triples "
                    "overnight, because you stopped renting the ending of your own supply chain from "
                    "somebody else."),
         overlay=dict(big="$14,000,000", sub="THE LANDFILL YOU NOW OWN")),
    dict(id="t13", level=None, template="boardroomNotes",
         narration=("A real board now, five chairs, a CFO who talks in EBITDA the way Roy talks in "
                    "engine trouble. Nine and a half times earnings, they say, once you own the "
                    "disposal asset outright — an actual number, on an actual slide, for what your "
                    "name is worth on paper before anyone's actually paid it. You nod like you "
                    "understand every word of it. Mostly you do."),
         overlay=None),
    dict(id="t14", level=None, template="window",
         narration=("Twenty-six years old feels like a story about someone else now. The skyline from "
                    "this floor is new; the coffee is better; the smell under your fingernails is "
                    "exactly the same no matter how many people you pay to keep it off you. A courier "
                    "delivers a card with a fund's name embossed on heavier paper than anything you "
                    "own. You don't call back yet."),
         overlay=None),

    # ---- LEVEL 05 · YEAR 12 · $68,000,000 ----
    dict(id="t15", level="LEVEL 05  ·  YEAR 12  ·  $68,000,000", template="revolvingDoor",
         narration=("Grant Ashford's office has a view and no personality, the way money that's tired "
                    "of being noticed always looks. His fund wants sixty percent, a board seat, and a "
                    "number with your name on it that used to be a rounding error: sixty-eight million "
                    "dollars, wired in stages, contingent on the numbers holding. Therefore the due "
                    "diligence begins — a hundred-line spreadsheet of everything the business spends "
                    "money on that it technically doesn't have to."),
         overlay=dict(big="$68,000,000", sub="A BUYOUT OFFER")),
    dict(id="t16", level=None, template="deskClose",
         narration=("Line 44 of a hundred: camera-and-spotter upgrades for the whole fleet, four "
                    "hundred sixty thousand dollars, marked optional pending recap timeline. You've "
                    "read this line eleven times tonight, alone, the office dark around the one lit "
                    "screen. Your hand doesn't shake signing off on cutting it — that's the part that "
                    "should worry you, not the number. Six weeks, you tell yourself. We'll circle back "
                    "after the deal closes."),
         overlay=None),
    dict(id="t17", level=None, template="dawnRoute", gap=1.4,
         narration=("Five a.m., the yard radio quieter than usual, one truck already out on the old "
                    "original route before the sun's up. The watch on your wrist reads 2:03 and you "
                    "don't remember hearing it go off. Cold coffee. No wind."),
         overlay=None),

    # ---- LEVEL 06 · YEAR 13 · -1 — THE REVERSAL ----
    dict(id="t18", level="LEVEL 06  ·  YEAR 13  ·  -1", template="routeAftermath", rate="-10%",
         narration=("The radio call comes in flat, procedural, the way bad news always tries to sound "
                    "smaller than it is: backed over on the old route, the one without a spotter "
                    "camera, the one that was supposed to get one in six weeks. Marcus Odell. Fourteen "
                    "years on the trucks, two kids, a wife who still calls dispatch by his old radio "
                    "number out of habit. Your hands shake signing the incident report — the first "
                    "time in longer than you can actually place."),
         overlay=dict(big="-1", sub="MARCUS ODELL · 14 YEARS ON THE TRUCKS")),
    dict(id="t19", level=None, template="emptyChair",
         narration=("His seat at the dispatch table stays empty for a month before anyone can bring "
                    "themselves to fill it, a coffee ring on the desk nobody wipes away. Someone leaves "
                    "his time card on the seat, uncashed, like a place setting nobody wants to clear. "
                    "Twenty-six accounts send flowers, more than you got for the county contract win. "
                    "Nobody says the words safety budget out loud. Everybody's doing the math anyway."),
         overlay=None),
    dict(id="t20", level=None, template="fileWall",
         narration=("OSHA's file runs sixty pages: a willful citation, the maximum penalty on the books "
                    "— a hundred sixty-five thousand five hundred fourteen dollars, times three, "
                    "because the finding wasn't isolated to one truck or one route. The inspector's "
                    "report uses the word foreseeable four times in six pages. You count them. The "
                    "number is a rounding error against sixty-eight million. That's exactly the problem "
                    "with the number."),
         overlay=dict(big="$496,542", sub="OSHA · WILLFUL CITATION")),

    # ---- LEVEL 07 · YEAR 16 · $410,000,000 ----
    dict(id="t21", level="LEVEL 07  ·  YEAR 16  ·  $410,000,000", template="courtroom",
         narration=("A hearing room, fluorescent light, a government seal behind a bench that isn't a "
                    "judge's — an administrative law judge, technically, though it doesn't feel like a "
                    "technicality from the defense table. The citation stands. The fine gets paid "
                    "inside a week, wired same-day, the way you'd pay for anything you wanted gone that "
                    "fast, that quietly. The recap closes anyway, four months later, right on "
                    "schedule."),
         overlay=dict(big="$410,000,000", sub="THE SALE CLOSES ANYWAY")),
    dict(id="t22", level=None, template="signing",
         narration=("Grant's fund takes sixty percent for two hundred forty-six million dollars, cash, "
                    "wired in three tranches — the largest number that's ever landed in an account "
                    "that's actually yours. The pen you sign with is the same model as the one from "
                    "the very first loan, twelve years old, still working, ink a little dry at the "
                    "cap. Small detail. You don't mention it to anyone."),
         overlay=None),
    dict(id="t23", level=None, template="dinner",
         narration=("Grant orders wine that costs more than Roy's first loan and doesn't check the "
                    "label before it's poured, raising a glass to the deal, to the multiple, never once "
                    "to Marcus, whose name he's never once said out loud in your presence. He mentions, "
                    "almost in passing, a distressed regional hauler two states over his fund's already "
                    "circling — a name that doesn't mean anything to you yet, and won't, for a long "
                    "time."),
         overlay=None,
         dialogue=dict(text="The fine's a rounding error. The multiple's the multiple. That's the whole business, if you're honest about it.")),

    # ---- LEVEL 08 · YEAR 20 · $1,200,000,000 ----
    dict(id="t24", level="LEVEL 08  ·  YEAR 20  ·  $1,200,000,000", template="ipoBell",
         narration=("The bell isn't a real bell — a button on a screen, a countdown, a national "
                    "platform absorbing your company into a ticker symbol that isn't your name "
                    "anymore. One point two billion dollars, the first billion, official, audited, "
                    "real. Somewhere underneath it sits a number OSHA already priced at four hundred "
                    "ninety-six thousand five hundred forty-two. Nobody on this floor knows that "
                    "number. You do."),
         overlay=dict(big="$1,200,000,000", sub="THE FIRST BILLION")),
    dict(id="t25", level=None, template="atrium",
         narration=("Four thousand employees now, most of whom will never learn the name behind the "
                    "internal memo that quietly renamed a safety line item nobody questions at "
                    "orientation anymore. The atrium has a company timeline on the wall — one truck, "
                    "one route, a fence you didn't own yet, a photograph of a smile that's easy to "
                    "mistake for uncomplicated. Marcus isn't on it. Nobody built a plaque for a policy "
                    "that used to be optional."),
         overlay=None),
    dict(id="t26", level=None, template="podiumScene",
         narration=("An industry association hands you an award shaped like a truck, gold-plated, "
                    "absurd, heavier than it looks. The word self-made gets used four times in six "
                    "minutes by someone who wasn't there for any of the twenty years it actually took. "
                    "Your reflection in the trophy's chrome is stretched wide enough that you don't "
                    "recognize the smile on it. Cameras flash. Smile the way you've practiced. Don't "
                    "mention the fence, the fine, or the funeral."),
         overlay=None),

    # ---- LEVEL 09 · YEAR 24 · $2,600,000,000 ----
    dict(id="t27", level="LEVEL 09  ·  YEAR 24  ·  $2,600,000,000", template="rooftopEmpire",
         narration=("Two point six billion dollars, audited, diversified, boring in the way real "
                    "wealth eventually gets. The watch on your wrist cost nineteen dollars twenty-three "
                    "years ago and is somehow still running, still set for 2:00, still the only alarm "
                    "in a penthouse with four others you've never learned to use. Your hands don't "
                    "shake anymore, signing anything, of any size, in any room. That's the part that "
                    "should worry you."),
         overlay=dict(big="$2,600,000,000", sub="THE ALARM STILL GOES OFF")),
    dict(id="t28", level=None, template="foundationScene",
         narration=("A hospital wing, a safety-research chair at a state university, a foundation with "
                    "your name and a mission statement that never once uses the word truck. The plaque "
                    "behind you lists twelve founding donors; yours is the only name with a number this "
                    "size attached to it. Ribbon, scissors, applause. A reporter asks what you're "
                    "proudest of. The real answer has fourteen years and a route number in it. You "
                    "give the other one instead."),
         overlay=None),
    dict(id="t29", level=None, template="window",
         narration=("Your daughter Ellie is nineteen and home for a weekend that took four calendar "
                    "invites to schedule. She asks, not unkindly, when you're going to slow down, the "
                    "way people ask questions they already know the honest answer to. You don't have "
                    "an answer that isn't a number. The window behind her holds the same skyline as "
                    "every other window you've stood at for a decade, and for the first time you can't "
                    "tell which floor you're actually on."),
         overlay=None,
         dialogue=dict(text="Dad. You've checked your watch four times since I got here. It's not even 2 a.m.")),

    # ---- LOOP CLOSE — return-and-partial-repair, not a handoff ----
    dict(id="t30", level=None, template="gravesideReturn", gap=0.7,
         narration=("The visits cost less to make once the company went public — a car, a driver, no "
                    "calendar conflict left to blame, no excuse that holds up under its own weight "
                    "anymore. This time you walk all the way to the stone, not the edge of the plot. "
                    "Diesel and cut grass, same as the funeral, eleven years on. The watch beeps at "
                    "2:00. You get up. You always do. That was never going to be the part that "
                    "changed."),
         overlay=None),
]
