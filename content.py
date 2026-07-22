#!/usr/bin/env python3
"""Could You Survive a Zombie Apocalypse? — POV doodle build, ~12.5 min.
Grounded in docs/research/zombie_apocalypse.md. SURVIVAL format: the "levels" are a monotonic TIME/
THREAT ladder (HOUR 1 -> DAY 1 -> DAY 3 -> WEEK 1 -> WEEK 3 -> MONTH 2 -> YEAR 1), not a job rank. The
outbreak itself is FICTIONAL (its real-world inspiration is rabies — a real bite-transmitted, ~100%
fatal-once-symptomatic pathogen [VERIFIED, CDC/WHO]); everything built around that premise — grid-
failure timelines, water/supply-chain math, martial-law/triage doctrine, and two real institutional/
academic artifacts about this exact scenario — is REAL and sourced in the research doc, flagged there.
Second-person present-tense POV: a fictional composite suburban parent (spouse MARA, son DEC, 8) living
an ordinary Tuesday when the outbreak reaches the street.

REAL/VERIFIED mechanics woven in (see research doc; flags there): the CDC's actual 2011 "Preparedness
101: Zombie Apocalypse" public-health campaign [VERIFIED, still archived]; the ~3-day just-in-time
grocery-supply-chain rule of thumb behind FEMA's own "72-hour kit" guidance [REAL, widely cited];
Hurricane Rita's real 100+-mile, 20+-hour evacuation gridlock (2005) [VERIFIED]; the Hurricane Katrina
Superdome/Convention Center social-breakdown timeline, roughly 3-4 days [VERIFIED, general timeline;
specific claims from initial reporting were disputed]; FEMA/CDC's real 1-gallon-of-water-per-person-
per-day guidance, and the real 8.34 lb/gallon weight math [VERIFIED]; the real START/SALT mass-casualty
"black tag" triage protocol (1983, Hoag Hospital/Newport Beach Fire Dept), still standard in U.S. EMS
today [VERIFIED]; the real legal machinery (Insurrection Act / state emergency powers) that lets a
governor deploy the National Guard for domestic checkpoints and curfews, as actually happened after
Katrina and the 1992 LA riots [VERIFIED]; approximate biointensive subsistence-farming land math (~1/4
to 1 acre per person) [FLAGGED, order-of-magnitude estimate]; and the closing share-beat — a REAL,
peer-reviewed 2009 University of Ottawa/Carleton paper, "When Zombies Attack!," which used real
epidemiological modeling to conclude that only immediate, overwhelming response prevents an outbreak
from mathematically overwhelming civilization [VERIFIED, peer-reviewed, still cited/taught]. Also real:
Romero's 1968 "Night of the Living Dead" established the SLOW zombie on purpose (inevitability over
speed); sprinting zombies are a later invention (28 Days Later, 2002) [VERIFIED film history].

SPINE (a survival stat each stage, not a salary — see research doc "Numbers that appear on screen"):
0.4 MI at cold-open dread -> "1 BITE" (Hour 1) -> "3 DAYS" (Day 1, grocery supply-chain) -> "72 HRS"
(Day 3, the social-breakdown window) -> "1 GAL" (Week 1, water per person per day) -> "12 HRS" (Week 3
midpoint, the dramatized incubation countdown) -> "1 IN 4" (Month 2, checkpoint screening) -> "40 ACRES"
(Year 1, the camp's self-sufficient land limit) -> [2009 — the real math paper, the closing fact].

STORY: MARA — your spouse; her door-knock code ("two, a pause, one — so we know it's you," t02
dialogue, the mentor's act-1 warning) is the sensory-anchor RITUAL, re-triggered at every stage (t14
Cole's wrong knock, t15/t18 Cole's mocking echo of it, t30 you teaching it to a new family's kid — the
loop-close payoff). She's bitten at the WEEK 3 midpoint reversal (t18) and black-tagged (t19) — the
episode's real cost. DEC — your 8-year-old son; his asthma inhaler (a real, ordinary object made
suddenly precious) is the concrete want, planted t02, critical at t16 ("four days left"), resolved at
t26 (a real pharmacy shelf, three camps over). COLE — a rival survivor; refused water at the barricade
(t14), foreshadows his own taunt (t15), delivers the midpoint dialogue taunt through the boarded window
at the exact moment Mara's bite is found (t18), and reappears — infected, unrecognizable except for the
jacket and the knock he never learned to soften — pressing the checkpoint fence six weeks later (t22),
a loop the story resolves, not leaves open. SGT. REYES — the checkpoint's National Guard sergeant
(t20/t21 dialogue, the authority who says the quiet part about the fence's math out loud); recurs at
Year 1 running the camp's council (t25) — the checkpoint's cost becomes the camp's structure. BODY-
DREAD MOTIF (fact, not feeling): "your hands are steady" — first at the cold open (t00), tightening to
"your hands have stopped shaking a long time ago. That's the part that scares you most" by the Year 1
apex (t24), then exactly repeated at the flash-forward's payoff (t28) — the through-line the ending
answers. UNRESOLVED UNIVERSE THREAD (deliberate): "LIGHTHOUSE," a CB-radio callsign reading coordinates
on a loop, first heard at the barricade (t13), mentioned again at the very end (t29) and never explained
— planted for a future episode to pick up.

Master open loop: the COLD OPEN (t00) is a FLASH-FORWARD to Year 1 — the camp wall's alarm, the fence
coming down, unplaced and cut away before it resolves — then the story rewinds (t01) to Hour 1 and
climbs back up to that exact moment, which resolves almost verbatim at t28 ("the wall holds. Barely.
Not everyone's does.") before the true loop-close (t30) bends the ending back to Mara's original ritual,
now taught to someone else's kid.

Templates: 7 new bespoke settings in a ZOMBIE pack (hordeStreet/suburbSiege/highwayJam/storeRaid/
bunkerSiege/checkpointTriage/campWall — see docs/TEMPLATES.md), composed with heavy reuse from MILITARY
(frontline/commandPost/barracksLife), MED (erTrauma/consult), MAFIA (prisonCell), SAMURAI (riceField,
re-purposed as the epilogue's replanted field), and universal (window/dinner/deskSilhouette/fileWall/
lobby/emptyChair). No two adjacent scenes share a template. STRUCTURAL VARIATION vs the last 2
(north_korea = MID-ACTION cold open / a straight rise that curdles at the midpoint / a literal
image-repeat ending; startup_unicorn = AFTERMATH cold open / rise-then-fall-then-rise act two /
torch-passing ending): this cold open is a FLASH-FORWARD (a specific later moment, not yet explained,
cut away before it resolves — distinct from dropping into ongoing action or opening on wreckage
already past); act two never "rises" at all — it's a COMPOUNDING DESCENT WITH A FALSE PLATEAU (the
barricade is the one temporary safety point, and it fails too); the ending COMBINES a literal flash-
forward payoff (t28, the exact same alarm and the exact same line) with a torch-passing ritual (t30,
the door code taught to a new child) — neither pure image-repeat nor pure torch-passing alone.

PROMISE -> PAYOFF LEDGER:
  * t00 flash-forward cold open (the Year 1 wall alarm, unplaced in time)   -> t28 (resolved: the exact same alarm, one year later in the telling)
  * t02 the door-knock code (dialogue, Mara's act-1 warning)                -> t14 (Cole's wrong knock) -> t15/t18 (Cole mocks it) -> t30 (loop close: you teach it to a new family's kid)
  * t02/t03 Dec's inhaler, days remaining (the concrete want)               -> t16 ("four days left") -> t26 (resolved: a real pharmacy shelf, three camps over)
  * COLE planted (t14)                                                      -> t15 (foreshadow line) -> t18 dialogue (the midpoint taunt) -> t22 (resolved: infected, at the fence, unrecognized by Reyes)
  * t13 the CB radio callsign "LIGHTHOUSE"                                  -> t29 (mentioned again — UNRESOLVED, deliberate, the one universe thread)
  * REYES planted (t20) + dialogue (t21)                                    -> t25 (recurring: now runs the camp's council, a year later)
  * t08 share beat: the real 2011 CDC "Zombie Apocalypse" preparedness guide -> paid immediately
  * t18/t19 share beat + REVERSAL: the real 1983 START "black tag" triage protocol -> paid immediately, drives t19
  * t29 share beat + closing fact: the real 2009 University of Ottawa zombie-outbreak math paper -> paid at the very end
  * body-dread motif "your hands are steady" (t00)                          -> "hands have stopped shaking" (t24, the hardening arc) -> repeated verbatim (t28, the payoff)
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — flash-forward to Year 1, unplaced in time (the master loop) ----
    dict(id="t00", level=None, template="campWall", gap=0.7, rate="-8%",
         narration=("A klaxon splits the dark over the camp wall. Somewhere past the containers the "
                    "fence is coming down — chain-link screaming, a hundred throats that don't breathe "
                    "right. Dec is behind you, close enough to grab. Your hands are steady on the bar "
                    "you're holding. That's the part that scares you. You don't know yet if the wall "
                    "holds. Not for another year."),
         overlay=dict(big="YEAR 1", sub="THE WALL HAS NEVER BROKEN. UNTIL TONIGHT.")),

    # ---- REWIND — the promise + cost-line ----
    dict(id="t01", level=None, template="window",
         narration=("None of that exists yet. Rewind three hundred sixty-four days and there's no wall, "
                    "no klaxon, no camp — only a Tuesday, a kitchen, and a rule your family made as a "
                    "joke before it became the only rule that mattered. You want to believe the first "
                    "sign would be obvious. It isn't. Nobody's ever is."),
         overlay=None),

    # ---- LEVEL 01 · HOUR 1 · THE DOOR CODE — Mara, Dec, the ritual, the concrete want ----
    dict(id="t02", level="LEVEL 01  ·  HOUR 1  ·  THE DOOR CODE", template="suburbSiege",
         narration=("Mara meets you at the door with two knocks, a pause, one — the code you made up as "
                    "a joke the week Dec was born, so you'd always know it was family. Dec's inhaler has "
                    "eleven days left in it and no refill until payday. An ordinary Tuesday. You have no "
                    "idea it's the last one."),
         overlay=dict(big="1 BITE", sub="THAT'S ALL IT TAKES"),
         dialogue=dict(text="Two knocks. A pause. One. If it's not that — it's not us.")),
    dict(id="t03", level=None, template="dinner",
         narration=("Dinner is grilled cheese because it's Tuesday and Tuesday is grilled cheese, and "
                    "Dec narrates his whole day around a mouthful of it. The kitchen smells like butter "
                    "and burnt crust. Somewhere two blocks over, a car alarm won't stop. Nobody looks "
                    "up. Car alarms are Tuesday too, until they aren't."),
         overlay=None),
    dict(id="t04", level=None, template="deskSilhouette",
         narration=("The ten o'clock news runs a thirty-second clip — a 'disturbance,' three dead, a "
                    "neighborhood two counties over, gone before the weather segment. You mute it "
                    "halfway through. This isn't the kind of thing that reaches a street like yours. "
                    "Every family on this block will say that exact sentence tomorrow, and none of them "
                    "will mean it as a warning."),
         overlay=None),
    dict(id="t05", level=None, template="window",
         narration=("Through the blinds, Mr. Alvarez stands in his own driveway at midnight, not "
                    "moving, facing the wrong direction. Don't call it strange. Call it the porch light. "
                    "Call it anything but what it is. Your hand is already on the deadbolt before you "
                    "decide to lock it — the first honest thing your body has done all night."),
         overlay=None),

    # ---- LEVEL 02 · DAY 1 · THE ROAD OUT — the minute-3 spectacle, first real horror delivered ----
    dict(id="t06", level="LEVEL 02  ·  DAY 1  ·  THE ROAD OUT", template="hordeStreet", rate="+10%",
         narration=("Mr. Alvarez comes through his own front door at 4 a.m. — through it, not out of "
                    "it, wood and hinge and all — and the sound he makes isn't a scream. It's wrong in a "
                    "way your body understands half a second before your mind does. Grab Dec. Grab "
                    "Mara. Don't grab anything else. The car keys are already in your hand; you don't "
                    "remember picking them up."),
         overlay=dict(big="3 DAYS", sub="IS ALL THE SUPPLY CHAIN EVER HAD")),
    dict(id="t07", level=None, template="highwayJam",
         narration=("The highway is a parking lot by six, three lanes of brake lights pointed at a "
                    "horizon nobody reaches. A hundred thousand people had this exact idea at the exact "
                    "same time. A forty-minute drive takes most of the day, if it ends at all. Dec asks "
                    "if this is like the hurricane drill from school. You tell him yes. You lie."),
         overlay=None),
    dict(id="t08", level=None, template="fileWall",
         narration=("A gas station TV loops the same four minutes on every channel. A man in a "
                    "government blazer keeps saying 'containment' like it still means something. Here's "
                    "the part almost nobody remembers: years before tonight, the CDC published an "
                    "actual public preparedness guide for exactly this — a real government document, "
                    "filed under Zombie Apocalypse, meant half as a joke and half as a drill nobody "
                    "ran. You didn't run it either."),
         overlay=dict(big="2011", sub="THE REAL CDC DRILL NOBODY RAN")),

    # ---- LEVEL 03 · DAY 3 · THE LAST AISLE — scarcity, first violence ----
    dict(id="t09", level="LEVEL 03  ·  DAY 3  ·  THE LAST AISLE", template="storeRaid",
         narration=("By the third day the grocery store has exactly what three days of empty shelves "
                    "and no trucks always leaves: nothing in cereal, nothing in water, one dented can of "
                    "green beans nobody wanted Monday. Take it anyway. The store doesn't restock because "
                    "the people who restock it aren't coming. Nobody built this system to survive itself "
                    "for even a week."),
         overlay=dict(big="72 HRS", sub="IS HOW LONG BEFORE THE FIGHTING STARTS")),
    dict(id="t10", level=None, template="erTrauma",
         narration=("A man twice your size wants the can more than you do, and for four seconds in a "
                    "parking lot you learn exactly how far 'more than you do' goes. He walks away with "
                    "it. You walk away with a torn sleeve and a stranger pressing a shirt to your arm, "
                    "saying the wound isn't deep, saying it twice, like saying it makes it true."),
         overlay=None),
    dict(id="t11", level=None, template="frontline",
         narration=("The parking lot empties out wrong — too fast, too quiet, then not quiet at all. "
                    "Don't look back. Count the exits instead. The car is four rows away and every one "
                    "of those rows has something moving in it that used to be a person doing ordinary "
                    "Tuesday things. Run the ordinary distance like it's the only thing that has ever "
                    "mattered."),
         overlay=None),

    dict(id="t11b", level=None, template="highwayJam",
         narration=("The drive home is the same empty highway backward, no traffic now because there's "
                    "nowhere left worth driving to. Dec asks, quietly, if Mr. Alvarez is going to be "
                    "okay. Don't answer that one directly. Answer the one underneath it instead — yes, "
                    "you're going to be okay, yes, all three of you, and you say it like a fact instead "
                    "of a hope because right now he needs the fact more."),
         overlay=None),

    # ---- LEVEL 04 · WEEK 1 · THE BARRICADE — the false plateau, Cole, the radio thread ----
    dict(id="t12", level="LEVEL 04  ·  WEEK 1  ·  THE BARRICADE", template="bunkerSiege",
         narration=("Nail the boards yourself, cross-braced, because a boarded window slows a body down "
                    "and a locked door barely does. A gallon of water a person, a day — that's the real "
                    "number, and four people times fourteen days is water you don't have and can't "
                    "carry. Ration it like it's the only currency left. It is."),
         overlay=dict(big="1 GAL", sub="PER PERSON. PER DAY. YOU DON'T HAVE IT.")),
    dict(id="t13", level=None, template="deskSilhouette",
         narration=("The CB radio catches a voice at 2 a.m., faint under the static: a callsign, "
                    "'Lighthouse,' reading coordinates on a loop like a lullaby, promising walls and "
                    "lights and a working well. Mara wants to believe it. You want to believe it more. "
                    "Neither of you writes the coordinates down, and neither of you says why."),
         overlay=None),
    dict(id="t14", level=None, template="lobby",
         narration=("A man named Cole knocks on the boarded door — three fast knocks, no pause, wrong "
                    "on purpose or wrong from panic, you can't tell which. He says he has nothing, says "
                    "it twice, says he'll take anything you can spare. You slide half a case of water "
                    "through the gap in the boards and don't open the door. Cole remembers that."),
         overlay=None),
    dict(id="t15", level=None, template="window",
         narration=("Cole doesn't leave quietly. He stands in the yard a full minute after the water's "
                    "gone, staring at the boarded door like he's already found where the gaps are. "
                    "'Everyone opens it eventually,' he says, mostly to himself — not yet the line "
                    "you'll hear again in three weeks. You don't know that yet. Mara pulls you back from "
                    "the window. Your eyes stay on him until the street swallows him."),
         overlay=None),
    dict(id="t16", level=None, template="barracksLife",
         narration=("Sleep happens in shifts now, one of you always upright, always listening for two "
                    "knocks and a pause and one. Dec's inhaler is down to four days. Mara hasn't said "
                    "the word 'when' out loud yet, but you can hear her building up to it, the way you "
                    "build up to a cold plunge. Your hands are steady, buttoning his coat in the dark. "
                    "That's the part that scares you."),
         overlay=None),

    # ---- LEVEL 05 · WEEK 3 · WHAT'S INSIDE — the midpoint reversal ----
    dict(id="t17", level="LEVEL 05  ·  WEEK 3  ·  WHAT'S INSIDE", template="bunkerSiege", gap=1.4,
         narration=("Mara stops eating on the ninth day of the third week and says it's nothing. She "
                    "favors her left arm carrying the water buckets and says it's nothing. The boarded "
                    "room smells like wet plywood and the kerosene lamp, and under it, faint, something "
                    "new — something you don't have a word for yet and don't want one. Ask her to roll "
                    "up her sleeve. Ask her twice."),
         overlay=dict(big="12 HRS", sub="TO SYMPTOMS. THEN NOTHING.")),
    dict(id="t18", level=None, template="consult", rate="-10%",
         narration=("The bite is small, already going dark at the edges, hidden three days under a "
                    "sleeve because she didn't want this exact silence in this exact room. Nobody says "
                    "anything for a while that has no clock on it. Outside, muffled through the boards, "
                    "Cole is still out there — you didn't know he'd come back — and his voice finds the "
                    "gap in the wood like it's looking for it."),
         overlay=None,
         dialogue=dict(text="You really think that door holds forever? Everyone opens it eventually. She already did.")),
    dict(id="t19", level=None, template="prisonCell",
         narration=("Emergency crews have had a name for this decision since 1983, for choosing who "
                    "gets saved when saving everyone isn't on the table: they tag it black, and they "
                    "move on, because the alternative costs the people who can still be saved. You don't "
                    "have a colored tag. You have a spare room and a deadbolt on the wrong side of the "
                    "door, and you use it anyway."),
         overlay=None),

    # ---- LEVEL 06 · MONTH 2 · THE CHECKPOINT — Reyes, the fence's math ----
    dict(id="t20", level="LEVEL 06  ·  MONTH 2  ·  THE CHECKPOINT", template="checkpointTriage",
         narration=("The checkpoint runs everyone through the same gate: a light on your eyes, a look "
                    "at your arms, a form with boxes for bitten, exposed, and clean. A National Guard "
                    "sergeant named Reyes runs the line like he's done it four thousand times, because "
                    "he has. One in four who reach this fence don't make it through it. You make it "
                    "through. Dec makes it through. You don't ask what happens to the fourth."),
         overlay=dict(big="1 IN 4", sub="DOESN'T MAKE IT THROUGH THE FENCE")),
    dict(id="t21", level=None, template="commandPost",
         narration=("Reyes runs the sector out of a tent with a state flag and a stack of orders signed "
                    "under emergency powers that let a governor call soldiers into their own streets. He "
                    "didn't write the rules. He just enforces the version of them that keeps two hundred "
                    "people fed on a truck built for eighty. You want to hate him for the fence. You "
                    "mostly can't."),
         overlay=None,
         dialogue=dict(text="Everyone in this camp lost someone at that fence. You get to grieve on your own time — not on my clock.")),
    dict(id="t22", level=None, template="hordeStreet",
         narration=("Six weeks later, on fence duty, you find Cole — what's left of deciding it's Cole, "
                    "the same jacket, the same knock he never learned to soften. He's on the wrong side "
                    "of the wire now, in the crowd pressing the fence at 3 a.m., one face in a hundred "
                    "that used to be someone's front door. You do the job. You don't tell Reyes whose "
                    "face it was."),
         overlay=None),
    dict(id="t23", level=None, template="emptyChair",
         narration=("There's an empty folding chair at the communal table now where Mara should be, and "
                    "nobody moves it, and nobody says her name at dinner, and Dec eats faster than he "
                    "used to so he can leave the table first. Grief doesn't get a schedule here. It gets "
                    "whatever's left after water duty and fence duty and the next thing, and the next."),
         overlay=None),

    # ---- LEVEL 07 · YEAR 1 · THE WALL — the apex, at cost, the loops close ----
    dict(id="t24", level="LEVEL 07  ·  YEAR 1  ·  THE WALL", template="campWall",
         narration=("A year in, the camp holds on forty fenced acres — containers, a garden grid, a "
                    "well, just enough land to almost feed everyone on it, which is the whole design and "
                    "the whole limit both. You have a job now: night watch, west wall, the shift nobody "
                    "wants. Your hands have stopped shaking a long time ago. That's the part that scares "
                    "you most."),
         overlay=dict(big="40 ACRES", sub="IS ALL YOU GET TO KEEP")),
    dict(id="t25", level=None, template="commandPost",
         narration=("Reyes runs the camp council now, the same clipped voice, the same four-thousand-"
                    "times calm, except the orders aren't only about who gets through the fence anymore "
                    "— they're about seed rotation, watch rotation, who teaches the kids their letters. "
                    "The rules that kept you alive at the checkpoint are the same rules keeping you fed "
                    "a year later. You still don't fully forgive him for the fence. You still stand his "
                    "watch."),
         overlay=None),
    dict(id="t26", level=None, template="riceField",
         narration=("Dec is nine now and has a real inhaler again, from a real pharmacy shelf someone's "
                    "supply run cleared out three camps over, and he kneels in the garden rows some "
                    "mornings just to watch things grow on purpose. The dirt under your own nails isn't "
                    "ash or plaster dust anymore. It's just dirt. You'd forgotten what that felt like."),
         overlay=None),
    dict(id="t27", level=None, template="dinner",
         narration=("A new family came through the gate last month — a woman, a boy about Dec's age, a "
                    "father who didn't make it as far as the fence. Dinner is canned stew and real "
                    "bread, and for the first time in a year the table has more voices at it than "
                    "silences. The boy watches Dec the way Dec once watched other kids on your old "
                    "street. Ordinary, almost."),
         overlay=None),
    dict(id="t28", level=None, template="campWall", gap=0.7,
         narration=("The klaxon splits the dark over the wall. Somewhere past the containers the fence "
                    "is coming down — chain-link screaming, a hundred throats that don't breathe right, "
                    "exactly the way you always knew it eventually would. Dec is behind you, close "
                    "enough to grab. Your hands are steady on the bar you're holding. That's the part "
                    "that scares you. The wall holds. Barely. Not everyone's does."),
         overlay=None),
    dict(id="t29", level=None, template="window",
         narration=("Somewhere out past the tree line, if you still had the radio, Lighthouse would "
                    "still be reading its coordinates on a loop — you never found out if it was real, "
                    "and some nights you still think about driving out to check. Here's the true thing "
                    "under all of it: a real math paper once modeled exactly this, outbreak against "
                    "response time, and the numbers said the same thing every time. Fast, or not at "
                    "all."),
         overlay=dict(big="2009", sub="THE REAL MATH PAPER THAT SAID YOU'D LOSE")),

    # ---- LOOP CLOSE — the new boy, the ritual passed on ----
    dict(id="t30", level=None, template="lobby", gap=0.7,
         narration=("Teach the new boy the knock at the gate — two, a pause, one — the same rule Mara "
                    "made up as a joke before it became the only rule that mattered. He asks what it's "
                    "for. Tell him the truth: it's how you know who's still you. The wall holds today. "
                    "Tomorrow makes its own rules."),
         overlay=None,
         dialogue=dict(text="Two knocks. A pause. One. Now you know who's still you.")),
]
