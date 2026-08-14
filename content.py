#!/usr/bin/env python3
"""Your Life as an F1 Driver at Every Level — POV doodle build, ~12 min.
Grounded in docs/research/f1_driver.md (all comp figures web-verified Aug 2026): the real,
documented FIA single-seater pathway, uniquely defined by an INVERTED early economics that no prior
CoreLifecycle topic has used — the family PAYS for roughly the first third of the ladder, not the
driver. VERIFIED: karting $50-100K/yr -> Formula 4 ~$500K/season -> Formula 3 ~$1M/season -> Formula 2
$2-3M/season, two seasons ~$6M cumulative, total spend before F1 itself often >$10M -> the FIA
superlicence (40 points across 3 seasons, VERIFIED) -> only ~20-22 F1 seats exist worldwide, odds
estimated at roughly 1 in over 1,000,000 (VERIFIED estimate, flagged as such) -> F1 rookie minimum
~$500K-$1M (VERIFIED, 2026 grid) -> mid-grid pay $2-20M (VERIFIED) -> elite pay: Verstappen ~$70M,
Hamilton ~$60-70M (VERIFIED, 2026 reported) -> the 2026 team cost cap, $215M (VERIFIED) -> the FIA
superlicence FEE irony, a base ~€11,842 + ~€2,392/point, >€1M/~$1.1M for a champion's points tally
(VERIFIED). F1's last on-track fatality, Jules Bianchi (2014 crash, died 2015), the sport's first
since Ayrton Senna in 1994 (VERIFIED, both cited as real historical fact, NOT depicted as characters).
You, Robert, Silvio Conti, and Théo Rambert are a FICTIONAL COMPOSITE; no real, named F1 driver is
depicted as this episode's protagonist or rival. New MOTORSPORT template pack added to src/stage.tsx
(kartTrack/paddockGarage/gridWalk/pitWall/cockpitClose/podiumSpray/crashBarrier) per docs/TEMPLATES.md
— this is the first single-seater-racing topic; the rest composes from universal signing/dinner/
boardroomNotes/window/fileWall/deskClose/layoffs (here, layoffs is re-narrated as a sponsor-funded
seat "reevaluation").

STRUCTURAL VARIATION vs the last 2 produced (pirate = AFTERMATH cold open / rise-then-fall-then-rise
DUAL crash / one-door-left-open ending; basketball_player = FLASH-FORWARD cold open / single clean
rise-crash-harder-rise / pure cyclical fully-resolved ending): this cold open is MID-ACTION — strapped
into the cockpit mid-corner on a title-deciding final lap, cut away before the corner resolves. Act
two's shape is a steady RISE THROUGH FOUR PAID JUNIOR RUNGS, a MIDPOINT TRAGEDY (a death, not a
betrayal or a crash of the protagonist's own), a PLATEAU (reserve-seat limbo, a struggling backmarker
team), then a second RISE to the apex — distinct from both prior dual/single-crash shapes. The ending
is CYCLICAL BUT HAUNTED: the loop bends fully back to the cold-open corner, now resolved and won, but
the grief thread (Théo) is explicitly never resolved, only carried — distinct from basketball's fully
"understood" resolution and pirate's literal open door.

PROMISE -> PAYOFF LEDGER (ids match the final t01-t32 sequence):
  * t01 cold open (strapped in, mid-corner, side-by-side, cut before the corner resolves)         -> RESOLVED at t27 (the identical corner, now held and won)
  * t02 promise/cost-line ("you don't know yet what gets sold to buy it")                          -> paid across t06 (the Aston sold), t13 (the $6M cumulative), t28-t30
  * sensory anchor: the five-point harness, clicking tighter at every level-up                     -> introduced t01/t03 -> re-triggered t13/t18/t20/t26/t27 -> final payoff t32 (unclipped for good)
  * Robert, the named person/want (a mechanic's hands, the restored Aston)                         -> introduced t02/t03 -> the Aston sold t06 (PAID OFF) -> present at the title t26 -> the dialogue line + the offer to rebuild it t31
  * Silvio Conti, the named mentor                                                                 -> introduced t07 (the dialogue warning) -> the private warning t12 -> no false redemption arc, just present in the title-race math t26
  * Théo Rambert, the named rival/friend                                                           -> introduced t04 -> beats you on test days t09 -> the wildcard setup t14 -> the dialogue line t15 -> DIES t16 (the midpoint reversal) -> named again in the reckoning t30
  * share-worthy fact #1: VERIFIED junior-ladder cost escalation ($75K -> $500K -> $1M -> $6M)      -> planted t03/t06/t08/t10/t13
  * share-worthy fact #2: VERIFIED odds (roughly 1 in 1,000,000+ karters ever reach an F1 seat)     -> planted t04, paid off again t30 ("most never had the money")
  * share-worthy fact #3: VERIFIED superlicence fee irony (>$1M just for the LICENSE to keep racing) -> the coda beat, t29
  * THE ONE DELIBERATE UNRESOLVED UNIVERSE THREAD: a small unmarked gold pin on two different team principals' lapels, no logo either time -> planted t25, reappears t30, never explained
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — MID-ACTION, cut before it resolves ----
    dict(id="t01", level=None, template="cockpitClose", gap=0.7,
         narration=("Five buckles click in the exact order they always do — lap belt, shoulders, "
                    "then the crotch strap last, tight enough to bruise. Last lap. Last corner. A "
                    "car's front wing sits six inches off your rear tire at two hundred miles an "
                    "hour, and neither of you lifts. Don't check the mirror. Whatever the radio is "
                    "about to say, you won't hear the end of it."),
         overlay=dict(big="LAP 58", sub="LAST CORNER")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="fileWall",
         narration=("Rewind. None of it exists yet — not the harness, not the two hundred miles an "
                    "hour, not the corner. Somewhere your father Robert is under a car that isn't "
                    "yours, wrench in hand, radio on low. You want a kart with an engine that doesn't "
                    "cough on the straight. You don't know yet what gets sold to buy one, or how many "
                    "more things after that."),
         overlay=None),

    # ---- LEVEL 01 · THE GRID ----
    dict(id="t03", level="LEVEL 01  ·  THE GRID", template="kartTrack",
         narration=("Robert is a mechanic, forty-four, hands stained past the second knuckle and "
                    "permanently that way now. Your kart runs last year's tires — everyone else on "
                    "the grid is on this year's compound, four tenths a lap faster before anyone even "
                    "presses the pedal. The harness is an adult one, cinched down three extra notches, "
                    "hanging off your shoulders like a hand-me-down coat. You win anyway, on tires "
                    "nobody else would race."),
         overlay=None),
    dict(id="t04", level=None, template="dinner",
         narration=("Dinner is whatever Robert can make between shifts, eaten standing at the counter "
                    "half the time. Théo Rambert, eleven, same grid every weekend, faster in a "
                    "straight line and sloppier under braking — your best friend, and the one name "
                    "every scout in the paddock already knows. Something like one in a million karting "
                    "kids ever sees a real Formula 1 grid. Neither of you says that part out loud."),
         overlay=dict(big="1 IN 1,000,000", sub="EVER REACH THIS SEAT")),
    dict(id="t05", level=None, template="kartTrack",
         narration=("Regional final, wet track, Théo half a second up going into the last chicane. "
                    "You brake later than the tires should reasonably allow, the back end stepping out "
                    "just enough to scare you and not quite enough to spin. First place, by two "
                    "hundredths of a second. Théo shakes your hand through the window net before "
                    "either helmet comes off — the last season winning ever feels this simple."),
         overlay=None),
    dict(id="t06", level=None, template="window",
         narration=("The Aston in the garage was Robert's, restored over eleven winters, the one "
                    "thing that was ever just his. He sells it for an engine upgrade you never asked "
                    "for and can't say no to. Money buys the compound tires. Money buys the extra "
                    "practice day. Money, it turns out, is most of what actually separates you from "
                    "the eleven-year-old who beat you last spring."),
         overlay=dict(big="THE ASTON", sub="SOLD FOR AN ENGINE")),

    # ---- LEVEL 02 · FORMULA 4 ----
    dict(id="t07", level="LEVEL 02  ·  FORMULA 4", template="paddockGarage",
         narration=("Formula 4, age fifteen, and the number changes shape entirely — five hundred "
                    "thousand dollars for one season, more than Robert makes in six years combined. "
                    "Silvio Conti runs the junior academy, forty years of drivers through his cramped "
                    "garage, most of them watched quietly disappearing by twenty. He doesn't smile "
                    "when he signs you. He checks that the sponsor patches are stitched on straight."),
         overlay=None,
         dialogue=dict(text="Talent gets you noticed. Money gets you to the grid. Don't confuse the two.")),
    dict(id="t08", level=None, template="signing",
         narration=("You sign the F4 contract in Silvio's cramped office, sponsor logos already "
                    "printed on a suit that isn't made yet — a regional tire shop, Robert's own "
                    "garage, three hundred dollars from a family friend who insists it's a loan, not a "
                    "gift. Every patch is a small mortgage on a season that hasn't happened. The pen "
                    "shakes a little in your hand. Nobody mentions that part."),
         overlay=dict(big="$500,000", sub="ONE F4 SEASON")),
    dict(id="t09", level=None, template="gridWalk",
         narration=("Race weekend, sponsor banners overhead, a grid you still don't quite believe "
                    "you're standing on. Théo's team books forty extra test days this season; yours "
                    "books six, because six is what's left after everything else gets paid for. He "
                    "learns the car's real limits on a private track in April, quietly, with nobody "
                    "watching the clock. You learn them live, under lights, in front of judges, in "
                    "July, with everybody watching it."),
         overlay=dict(big="+40 TEST DAYS", sub="WHAT MONEY BUYS")),

    # ---- LEVEL 03 · FORMULA 3 ----
    dict(id="t10", level="LEVEL 03  ·  FORMULA 3", template="paddockGarage",
         narration=("Formula 3 doubles the number again — a million dollars a season, and Robert "
                    "picks up night shifts at a second garage across town so you never actually see "
                    "the invoice arrive. Your hands know this car better than the last one. Your bank "
                    "account does not know it at all. But strong results start a phone ringing that "
                    "never rang before: an F1 team's junior program, asking your name."),
         overlay=None),
    dict(id="t11", level=None, template="boardroomNotes",
         narration=("A junior-program scout sits across a folding table with a laptop and a stopwatch "
                    "app, unimpressed by anything except lap deltas measured to the thousandth. He "
                    "doesn't ask about Robert's second job or the sponsor patches held together with "
                    "safety pins. He asks one question: can you do that exact lap again, on worse "
                    "tires, in the rain, tomorrow morning. You can. That's the entire interview, start "
                    "to finish."),
         overlay=dict(big="$1,000,000", sub="THE DEBT KEEPS CLIMBING")),
    dict(id="t12", level=None, template="deskClose",
         narration=("Silvio pulls you aside before the junior-program paperwork gets signed, voice "
                    "low enough that nobody else in the paddock hears it over the compressors. He's "
                    "watched drivers with twice your talent get outspent into ordinary jobs by "
                    "twenty-two — not beaten on track, never once, just outlasted financially by a "
                    "richer kid's father. There's a second kind of driver he's watched disappear too. "
                    "He doesn't finish that sentence."),
         overlay=None),

    # ---- LEVEL 04 · FORMULA 2 ----
    dict(id="t13", level="LEVEL 04  ·  FORMULA 2", template="paddockGarage",
         narration=("Formula 2, the last rung before F1 itself — two to three million dollars a "
                    "season, most drivers paying the team rather than the other way around. Two "
                    "seasons here is normal, six million dollars total, stacked on everything already "
                    "spent. The harness is real FIA spec now, five-point, a proper click instead of a "
                    "loose adult buckle. It is tighter across your chest than it has ever been."),
         overlay=dict(big="$6,000,000", sub="TWO SEASONS OF F2")),
    dict(id="t14", level=None, template="gridWalk",
         narration=("Théo's family runs out of runway before yours does — no sponsor left to cover a "
                    "second F2 season, the seat going instead to a driver whose father owns part of "
                    "the team. He gets one shot in its place: a single wildcard weekend, a borrowed "
                    "car, everything he has left riding on one race. He grins about it in the paddock "
                    "like it's still just karting. You don't grin back."),
         overlay=None),
    dict(id="t15", level=None, template="window", gap=1.4,
         narration=("The night before his wildcard race, Théo finds you by the transporter trucks, "
                    "both of you still half in your race suits, sleeves tied off at the waist. He "
                    "doesn't talk about the car at all. He talks about the go-kart track back home, "
                    "the wet chicane, the two hundredths of a second that started all of this in the "
                    "first place."),
         overlay=None,
         dialogue=dict(text="Whoever gets there first buys the coffee.")),

    # ---- MIDPOINT REVERSAL ----
    dict(id="t16", level=None, template="crashBarrier", gap=0.7,
         narration=("Lap eleven, a wet patch nobody flagged in time, the barrier taking the full hit "
                    "at an angle the car was never built to survive. The radio goes quiet in a way "
                    "that has its own specific silence, different from ordinary static. Three days "
                    "later the paddock stands for a minute that runs much longer than sixty seconds. "
                    "Théo Rambert never gets a Formula 1 seat. Neither does the money that would have "
                    "bought him one."),
         overlay=dict(big="THÉO", sub="GONE")),
    dict(id="t17", level=None, template="fileWall",
         narration=("Robert doesn't say anything useful, because there isn't anything useful to say — "
                    "he just sits with you in the kitchen until the light outside changes color "
                    "completely, then makes coffee neither of you drinks. You keep racing, because "
                    "stopping feels like agreeing his money was the only reason you're still around to "
                    "quit. It's not a comfortable thought. It doesn't go away, either, no matter how "
                    "many seasons pass."),
         overlay=None),

    # ---- LEVEL 05 · THE RESERVE SEAT ----
    dict(id="t18", level="LEVEL 05  ·  THE RESERVE SEAT", template="cockpitClose",
         narration=("Forty points, three seasons, the FIA superlicence finally clears — the number "
                    "that says you're legally allowed to sit in a Formula 1 car at all. The seat isn't "
                    "a race seat yet, just reserve, simulator hours logged in a windowless room, a "
                    "halo bar over your head for the first time in real life. The harness clicks five "
                    "times now instead of three. It is heavier than it looks."),
         overlay=dict(big="40 POINTS", sub="THE SUPERLICENCE, EARNED")),
    dict(id="t19", level=None, template="pitWall",
         narration=("Reserve driver means showing up to every single race and racing none of them — a "
                    "headset, a laptop, lap times scrolling past for a car you're not sitting in. The "
                    "team is polite about it, always, in the exact same rehearsed way. The team is "
                    "also not obligated to ever put you in that car. You watch a driver two years "
                    "younger than you get the call instead, and clap on camera, because that's the job "
                    "too, apparently."),
         overlay=None),

    # ---- LEVEL 06 · THE RACE SEAT ----
    dict(id="t20", level="LEVEL 06  ·  THE RACE SEAT", template="gridWalk",
         narration=("The call comes at 6 a.m. — a driver injured, a seat open two races before the "
                    "deadline, a fireproof suit with your actual name printed on it for the first "
                    "time. Grid walk, sponsor banners overhead, a crowd loud enough to erase your own "
                    "pulse. The anthem plays. Your hands are steady clipping into the harness. That's "
                    "the part that scares you."),
         overlay=dict(big="$750,000", sub="F1 ROOKIE MINIMUM")),
    dict(id="t21", level=None, template="crashBarrier",
         narration=("Backmarker team, a car built for reliability over raw speed, and a first-lap "
                    "pileup that puts you into the tire wall anyway, at a hundred and ten miles an "
                    "hour, metal folding somewhere behind your seat. The halo does exactly what it's "
                    "designed to do. You climb out under your own power, wave at the marshals so the "
                    "broadcast can move on, and throw up quietly behind the barrier where the cameras "
                    "can't quite reach."),
         overlay=None),
    dict(id="t22", level=None, template="layoffs",
         narration=("The team principal calls you into a trailer that smells like reheated coffee and "
                    "explains, gently, that the sponsor funding your seat is being reevaluated — the "
                    "sport's polite word for a driver quietly disappearing at season's end without a "
                    "press release. Nineteen other people want this exact seat, on paper, this week "
                    "alone. Robert has just enough saved to cover precisely none of what keeping it "
                    "would actually cost."),
         overlay=None),

    # ---- LEVEL 07 · THE PODIUM ----
    dict(id="t23", level="LEVEL 07  ·  THE PODIUM", template="pitWall",
         narration=("A stronger team calls instead — a real shot, a car actually built to win rather "
                    "than merely survive. Your engineer's voice on the radio becomes a second "
                    "heartbeat: box this lap, undercut now, the gap is closing fast. Strategy decided "
                    "in real time by people who've done this a hundred times and are betting a very "
                    "large amount of money that you haven't."),
         overlay=None),
    dict(id="t24", level=None, template="podiumSpray",
         narration=("Podium, first time, champagne stinging your eyes worse than any pit-lane fuel "
                    "ever did, running down the inside of a collar that still smells faintly of "
                    "rubber. Somewhere below the podium steps, a version of you at seven is still four "
                    "tenths off the pace on last year's tires. The contract that follows this single "
                    "win is worth more than everything Robert ever spent on you, combined, in one "
                    "signature."),
         overlay=dict(big="$12,000,000", sub="NEW CONTRACT AFTER P1")),
    dict(id="t25", level=None, template="boardroomNotes",
         narration=("The team principal wears a small gold pin on his lapel through the whole contract "
                    "renewal, catching the light every time he leans forward — no team logo, no "
                    "sponsor mark, nothing you recognize from any paddock wall you've ever stood "
                    "against. He notices you noticing it and moves the conversation along without "
                    "answering the question you didn't quite ask out loud."),
         overlay=None),

    # ---- LEVEL 08 · WORLD CHAMPION (apex cost, resolves the cold open) ----
    dict(id="t26", level="LEVEL 08  ·  WORLD CHAMPION", template="gridWalk",
         narration=("Final round, title on the line, the exact math Silvio once explained from a "
                    "folding chair years ago finally sitting in front of you for real: finish ahead by "
                    "eight points or don't finish champion at all. The grid is louder than it's ever "
                    "been. Somewhere in the stands, Robert wears a team shirt that still smells "
                    "faintly of engine oil from a car he sold a long time ago."),
         overlay=None),
    dict(id="t27", level=None, template="cockpitClose", gap=0.7,
         narration=("Five buckles, the exact same order they've always clicked in. Last lap. Last "
                    "corner. A front wing sits six inches off your rear tire at two hundred miles an "
                    "hour, and this time you already know exactly whose it is. Don't lift. Hold the "
                    "line through the apex, foot flat, the barrier close enough to read the sponsor "
                    "decals on it. The radio finally says your name."),
         overlay=dict(big="LAP 58", sub="LAST CORNER")),
    dict(id="t28", level=None, template="podiumSpray",
         narration=("World champion, twenty-nine years old, a number on a contract that would have "
                    "covered Robert's entire life twice over, paid to you for one season of driving a "
                    "car. Somewhere a bigger name than yours will eventually turn a single season into "
                    "a hundred million dollars and a legacy deal nobody's grandchildren outlive — the "
                    "fantasy this whole ladder actually sells, one driver in a generation."),
         overlay=dict(big="$70,000,000", sub="WORLD CHAMPION")),
    dict(id="t29", level=None, template="pitWall",
         narration=("The bill for next season's FIA superlicence arrives at the team's office, not "
                    "yours — a base fee plus a surcharge for every point you just won, over a million "
                    "dollars for the paperwork that lets you legally race again. Behind it sits the "
                    "real number: two hundred fifteen million dollars, the cap the whole team operates "
                    "under, the actual machine that just won a championship with your name on it."),
         overlay=dict(big="$1.1M", sub="JUST FOR THE LICENSE")),
    dict(id="t30", level=None, template="boardroomNotes",
         narration=("A different team principal, a different boardroom, the exact same small gold pin "
                    "on his lapel — nobody explains it, and at this point you've stopped asking. "
                    "Something like one in a million karting kids ever sits where you're sitting. Most "
                    "of the ones who didn't make it had exactly your talent and none of what Robert "
                    "sold to get you here. Théo Rambert had more talent than either of you."),
         overlay=dict(big="1 IN 1,000,000", sub="MOST NEVER HAD THE MONEY")),

    # ---- LOOP CLOSE — cyclical but haunted ----
    dict(id="t31", level=None, template="dinner",
         narration=("Retirement announcement, fourteen seasons, more crashes walked away from than "
                    "most drivers ever get to count. Robert is seventy-one now, still fixing cars he "
                    "doesn't strictly need to fix, hands stained past the same second knuckle they "
                    "always were, radio still on low in the background. He doesn't ask what's next. He "
                    "asks if you still remember the Aston."),
         overlay=None,
         dialogue=dict(text="The garage has room for it again, if you ever want to build it back.")),
    dict(id="t32", level=None, template="cockpitClose",
         narration=("One last cockpit, an exhibition lap, no title on the line and no wet chicane "
                    "waiting anywhere ahead of you. Five buckles, unclipped in the exact reverse order "
                    "they always clicked shut — lap belt last, the strap that first sat on an "
                    "eleven-year-old's shoulders twenty-two years and one dead best friend ago. "
                    "Whatever happens after this lap, you already know the end of it."),
         overlay=dict(big="RETIRED", sub="THE HARNESS COMES OFF")),
]
