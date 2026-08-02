#!/usr/bin/env python3
"""Your Life as an Undercover Agent at Every Level — POV doodle build, ~12 min.
Grounded in docs/research/fbi_undercover.md. RANK format: New Agent Trainee (Quantico) -> Special
Agent, First Office of Assignment -> Certified Undercover Employee (first Group I op) -> Deep cover
(embedded in Sal's crew) -> Case agent (the wire, the takedown) -> Supervisory Special Agent -> ASAC/
SAC -> the Bureau above you. Second-person present-tense POV: the viewer IS a composite FBI agent
who rises through the real, documented Bureau ladder: 21-week Quantico training (VERIFIED-standard),
the Certified Undercover Employee designation + DOJ's Group I/Group II Attorney General's Guidelines
(VERIFIED, real policy), the GS pay scale + 25% Law Enforcement Availability Pay (VERIFIED via search),
and the statutory mandatory retirement age of 57 for federal law-enforcement officers (VERIFIED, 5
U.S.C. §8335). Real background grounding: Joseph D. Pistone/"Donnie Brasco"'s six-year (1976-1981)
infiltration of the Bonanno crime family, referenced only for the genre's documented real stakes
(a reported bounty, a marriage lost to the double life) -- never depicted as this episode's literal
protagonist. Sal Trapani, Dominic Farro, Frank Delgado, Mara, and Nicky are a FICTIONAL COMPOSITE.

SPINE: EVIDENCE vs PAYCHECK -- a new dual-track flavor (see research doc + ops/improvements.json).
The big gold overlay is money that moves through your hands as EVIDENCE ($12,000 buy money -> $80,000
skim -> $1.2M ledger -> $9M seizure warrant -> $40M forfeited across your squad's cases -> $300M/yr
your office seizes -> $4B+ nationwide) and is never legally yours; the paycheck track (sub-caption/
overlay) stays capped by statute regardless of danger ($41,860 trainee -> ... -> $180,000 SAC -> a
fixed pension at mandatory age-57 retirement) -- the one number in the whole climb the Bureau controls
completely instead of you. Distinct from the six prior spine flavors already catalogued (valuation-
vs-personal, inverted power-vs-pay, control-vs-own, scenario pure-money, dual-track-valuation,
unbroken-climb-moral-only-reversal).

STRUCTURAL VARIATION vs the last 2 produced (yakuza = AFTERMATH cold open / unbroken-climb-moral-
only-reversal / TORCH-PASSING ending; mongol_empire = FLASH-FORWARD cold open / rise-then-fracture /
ONE-DOOR-LEFT-OPEN ending): this cold open is MID-ACTION (a real, documented mob loyalty-test moment
-- any suspicion of being a federal agent could mean summary execution, per organized-crime literature
including Pistone's own account); act two's shape is LIKABLE-TARGET MORAL EROSION (the evidence number
only ever climbs -- the true cost is affection for the man you're building a case against, not a
financial dip); the ending is CYCLICAL -- forced retirement at 57, guest-teaching a new trainee in the
same Quantico classroom the story opened in, almost answering to the wrong name.

PROMISE -> PAYOFF LEDGER:
  * t01 cold open (Dominic's gun, "you a cop")                    -> t32 (the file: Sal knew, and stopped Dominic anyway)
  * t02 promise/cost-line (Delgado's photo of a younger stranger)  -> paid off across t22/t26/t30 (Delgado's own divorce/retirement, Mara leaving) and t33 (your own fixed pension)
  * sensory anchor: the wedding ring                               -> worn t03 -> ordered off t11 -> a shape in your pocket t18 -> reached for, absent, t30/t33 -> back on, worn smooth, t35
  * t03 the $41,860 vs. $190,000 named want                        -> paid off at t27's $180,000 ("the first number that's actually yours")
  * t10 Delgado's mentor line ("most don't come all the way back") -> tested at t22 -> paid off at t34/t35
  * t16 Nicky, Sal's son, "Uncle Ray"                               -> UNRESOLVED UNIVERSE THREAD (deliberate) -> referenced again at t23, never fully closed
  * t17 Dominic's suspicion                                        -> the midpoint dock scene t19 -> resolved only at t32
  * t18 silence beat (gap=1.4)                                     -> t19 THE REVERSAL (the dock, the gun, Dominic's taunt)
  * t29 the $300M share-worthy figure                               -> undercut immediately by t30's domestic cost, echoed at t31's $4B+ apex
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — MID-ACTION, cut away before it resolves ----
    dict(id="t01", level=None, template="backAlley", gap=0.7,
         narration=("The gun's muzzle is still warm against your temple — fired recently, just not at "
                    "you, not yet. Dominic Farro's hand doesn't shake. 'You a cop,' he says, 'tell me "
                    "now, or God tells you later.' Four words, wrong ones, and this alley keeps your "
                    "body. Say nothing. Count the trash-can lids. Don't blink first."),
         overlay=dict(big="4 WORDS", sub="THE WRONG ONES END YOU")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="desk",
         narration=("Rewind three years. None of this exists yet — not Dominic, not the alley, not the "
                    "name you'll answer to more than your own. Frank Delgado, the agent who recruited "
                    "you, keeps a photo pinned above his desk: himself at thirty, thinner, a stranger's "
                    "face. You want his job one day. He wants you to understand the price tag first."),
         overlay=None),

    # ---- LEVEL 01 · NEW AGENT TRAINEE ----
    dict(id="t03", level="LEVEL 01  ·  NEW AGENT TRAINEE", template="lectureHallScene",
         narration=("Twenty-one weeks at Quantico, and the instructor says evidentiary chain like a "
                    "prayer. Your law-school roommate just signed for $190,000 at a downtown firm. Your "
                    "trainee pay: $41,860, before tax, before Mara stops mentioning it out loud. You "
                    "didn't come here for the money. You keep telling yourself that helps."),
         overlay=dict(big="$41,860", sub="YOUR FIRST-YEAR TRAINEE PAY")),
    dict(id="t04", level=None, template="signing",
         narration=("Right hand raised in a hallway that still smells of new carpet, the Oath of Office "
                    "recited alongside forty strangers who scatter to forty field offices by Friday. "
                    "'Support and defend' sounds simple out loud, in a building where your photo is "
                    "already filed under a badge number instead of a name. You call Mara after. Not before."),
         overlay=dict(big="BADGE #", sub="A NUMBER BEFORE A NAME")),
    dict(id="t05", level=None, template="tradecraft",
         narration=("Hogan's Alley: a fake town built only to shoot at you, actors playing bank robbers "
                    "who scream real enough to chill your hands. Your instructor calls hesitation before "
                    "the first shot the thing that gets agents killed. You clear the scenario under the "
                    "max. Nobody claps. Nobody here is supposed to."),
         overlay=None),
    dict(id="t06", level=None, template="barracksLife",
         narration=("The dorm smells of gun oil and instant coffee, forty trainees down the hall "
                    "pretending the same thing you are: that a wedding ring means the same thing here it "
                    "did at home. Mara's voice on the phone gets thinner every Sunday, not sadder, just "
                    "further away. You spin the ring off, on, off. Delgado, passing, doesn't say stop."),
         overlay=None),

    # ---- LEVEL 02 · SPECIAL AGENT · FIELD OFFICE (minute-3 spectacle) ----
    dict(id="t07", level="LEVEL 02  ·  SPECIAL AGENT  ·  FIELD OFFICE", template="surveillance",
         gap=0.7,
         narration=("First office of assignment, a stakeout van that smells worse than the dorm ever "
                    "did. The target stares dead at the van — at you — one full second before deciding a "
                    "parked car isn't worth the trouble. Delgado exhales like he'd been holding it the "
                    "whole time. Your own heartbeat wasn't there a second ago. It's back now, loud."),
         overlay=dict(big="1 SECOND", sub="HE ALMOST MADE THE VAN")),
    dict(id="t08", level=None, template="fileWall",
         narration=("Weeks of logs, plates, a name that means nothing yet: Sal Trapani. Delgado slides "
                    "your first review across without looking up. 'Unusually comfortable lying,' he "
                    "writes, and means it as the highest compliment the Bureau has. You're not sure yet "
                    "whether to be proud of that sentence."),
         overlay=None),
    dict(id="t09", level=None, template="boardroomNotes",
         narration=("Delgado pitches you to the undercover review board like a defense attorney — a "
                    "psych workup, a marriage he doesn't mention, six years of his own case as the only "
                    "qualification he thinks he needs to cite. Three senior agents ask if you can lie to "
                    "someone's face for years without it costing you anything. You answer the question "
                    "they didn't ask instead."),
         overlay=dict(big="3 AGENTS", sub="DECIDE IF YOU'RE FIT FOR THIS")),
    dict(id="t10", level=None, template="debrief",
         narration=("Delgado picks the undercover-certification applicants himself, and picks you over "
                    "three agents with twice your seniority. He ran six years under someone else's name "
                    "once, divorced twice, remarried never. He doesn't warn you about bullets. He warns "
                    "you about something slower."),
         overlay=None,
         dialogue=dict(text="You don't play a man. You become him till the job ends. Most don't come all the way back.")),

    # ---- LEVEL 03 · CERTIFIED UNDERCOVER EMPLOYEE · FIRST OP ----
    dict(id="t11", level="LEVEL 03  ·  CERTIFIED UNDERCOVER EMPLOYEE", template="station",
         narration=("Certified Undercover Employee: a file at Headquarters that has to clear before "
                    "you're legally allowed to become someone else. Group I, they call Sal Trapani's "
                    "crew — sensitive enough Washington signs off before you do. Take off the ring, "
                    "Delgado says, before you even ask why. Ray Cole doesn't wear one."),
         overlay=dict(big="RAY COLE", sub="THE NAME ON EVERYTHING NOW")),
    dict(id="t12", level=None, template="consult",
         narration=("Six hours with a Bureau psychologist who isn't looking for weakness, exactly — "
                    "she's looking for the specific kind of person who can hold two names in one head "
                    "without one of them winning. Family strain gets its own section in her report, "
                    "longer than the section on danger. You answer honestly. Some answers surprise you "
                    "on the way out."),
         overlay=None),
    dict(id="t13", level=None, template="tradecraft",
         narration=("You learn Sal's whole world by rote before you ever shake his hand — his dead "
                    "wife's name, his son's Little League batting average, the diner he's superstitious "
                    "about, the exact sugar in his espresso. Cover-story drilling, Delgado calls it. Ray "
                    "Cole's biography gets more real, some weeks, than your own does."),
         overlay=None),
    dict(id="t14", level=None, template="deadDrop",
         narration=("Twelve thousand dollars, marked, photographed, counted twice before it leaves the "
                    "Bureau's hands and once more once Sal's crew counts it themselves. None of it is "
                    "yours — evidence wearing the shape of cash. Your real paycheck posts the same "
                    "Friday it always does: sixty-three thousand, untouched by any of this."),
         overlay=dict(big="$12,000", sub="EVIDENCE. NONE OF IT YOURS.")),

    # ---- LEVEL 04 · DEEP COVER · SAL'S CREW ----
    dict(id="t15", level="LEVEL 04  ·  DEEP COVER  ·  SAL'S CREW", template="cardGame",
         narration=("Sal Trapani deals you into a back-room game like you've always been there, and "
                    "three hands in, it feels true. Fifty-eight, funny, generous with the wrong kind of "
                    "money, genuinely glad you're around. Nobody warned you the hardest part of this job "
                    "is liking the man you're built to destroy."),
         overlay=dict(big="$80,000", sub="COUNTED. STILL NOT YOURS.")),
    dict(id="t16", level=None, template="redSauce",
         narration=("Sal's son Nicky turns nine at a back-table birthday dinner and calls you Uncle Ray "
                    "without anyone teaching him to. Sal toasts you like family, a hand heavy on your "
                    "shoulder the way your own father never managed. You laugh at all the right moments. "
                    "Ray Cole is good at this. That's the part that scares you."),
         overlay=None),
    dict(id="t17", level=None, template="socialClub",
         narration=("The crew's rules are simpler than the Bureau's: never talk business on a phone, "
                    "never bring a stranger to the club, never ask where the money that isn't yours "
                    "actually goes. A junior associate named Dominic Farro watches you a beat too long "
                    "every time you walk in. Sal waves it off. You don't."),
         overlay=dict(big="$1.2M", sub="A LEDGER YOU COPIED, NOT KEPT")),
    dict(id="t18", level=None, template="dinner", gap=1.4,
         narration=("Three missed calls from Mara, cold fries on the seat of a car registered to nobody "
                    "you actually are. The ring is a shape in your jacket pocket you've stopped reaching "
                    "for without noticing. The dashboard clock reads 3:14 a.m. and you don't remember "
                    "driving here. Some nights, woken fast, you can't say which name would come out first."),
         overlay=None),

    # ---- MIDPOINT REVERSAL — the dock, the gun handed to you ----
    dict(id="t19", level="LEVEL 05  ·  THE WIRE  ·  CASE AGENT", template="waterfront",
         narration=("Dominic drags a suspected rat onto the dock at 2 a.m. and hands you the gun, calm "
                    "as a favor between friends. You can't stop it without ending yourself, the case, and "
                    "every agent whose future rides on it. Sal watches you hesitate and, for the first "
                    "time, looks almost afraid for you."),
         overlay=dict(big="$9M", sub="SEIZED THE SAME NIGHT"),
         dialogue=dict(text="Family bleeds together, Ray, or family doesn't trust you.")),
    dict(id="t20", level=None, template="wiretap",
         narration=("The recorder taped under your ribs catches every word that will convict Sal, "
                    "including the ones where he calls you his own son's godfather. The tape doesn't lie "
                    "the way you do. It just listens. Delgado calls it the cleanest case of his career. "
                    "You call it something you don't have a word for yet, and don't go looking for one."),
         overlay=None),
    dict(id="t21", level=None, template="prisonCell",
         narration=("A courier two rungs below Dominic gets picked up on an unrelated gun charge and, "
                    "given the math, decides cooperating beats a decade upstate. He doesn't know your "
                    "real name either — nobody outside the Bureau does anymore. His statement corroborates "
                    "six months of your own recordings in one afternoon, cheaper than anything you risked "
                    "to get them yourself."),
         overlay=dict(big="6 MONTHS", sub="CONFIRMED IN ONE AFTERNOON")),
    dict(id="t22", level=None, template="safehouse",
         narration=("The target wall pins Sal's photo dead center, red string running to Dominic, to the "
                    "ledger, to eleven other names you've eaten dinner with. Delgado asks if you can "
                    "still do the job. You say yes before you've decided it's true. Ray Cole would say "
                    "yes. Some days you're not sure who's answering."),
         overlay=None),

    # ---- LEVEL 06 · SUPERVISORY SPECIAL AGENT · RUNNING OTHERS ----
    dict(id="t23", level="LEVEL 06  ·  SUPERVISORY SPECIAL AGENT", template="boardroomHead",
         narration=("Sal takes eleven years, Dominic fourteen. Nicky is nineteen the last time you "
                    "check, quietly, a habit you can't quite break. Supervisory Special Agent now — a "
                    "desk, a squad of certified undercover employees, none paid one extra dollar for the "
                    "specific danger of becoming someone else. Same GS scale as the analyst three doors down."),
         overlay=dict(big="$40M", sub="FORFEITED ACROSS YOUR CASES")),
    dict(id="t24", level=None, template="commandPost",
         narration=("You brief a twenty-six-year-old agent on her first Group I op the way Delgado once "
                    "briefed you — the file, the cover, the family she's about to be adopted into and "
                    "eventually betray. She asks if it gets easier. You give her the true answer instead "
                    "of the comforting one. You don't tell her about the ring."),
         overlay=None),
    dict(id="t25", level=None, template="warRoom",
         narration=("Six cases running at once now across three field offices, a wall of screens instead "
                    "of one target wall, your own name on the authorization line instead of the case file. "
                    "The scale is bigger. The stakes, somehow, read smaller from up here — numbers on a "
                    "screen instead of a hand heavy on your shoulder at a birthday dinner."),
         overlay=None),
    dict(id="t26", level=None, template="debrief",
         narration=("Her case runs four years, cleaner than yours. Delgado retires the year she gets "
                    "certified — a pension, a fishing boat, silence where a family used to be. You send a "
                    "card. He doesn't write back. Some costs get paid quietly, off to the side, where the "
                    "story doesn't usually look."),
         overlay=None),

    # ---- LEVEL 07 · ASAC / SAC · FIELD OFFICE ----
    dict(id="t27", level="LEVEL 07  ·  ASAC / SAC  ·  FIELD OFFICE", template="atrium",
         narration=("Assistant Special Agent in Charge, then Special Agent in Charge of the whole field "
                    "office — budget lines, press liaisons, a corner office with a window Ray Cole never "
                    "once stood behind. A hundred and eighty thousand dollars a year: the first number in "
                    "this entire climb that's actually, legally, yours to spend."),
         overlay=dict(big="$180,000", sub="THE FIRST NUMBER THAT'S YOURS")),
    dict(id="t28", level=None, template="revolvingDoor",
         narration=("DOJ liaisons, Congressional staffers, a Senator's aide who wants the forfeiture "
                    "numbers dressed up before he'll release your office's budget. The Bureau's real "
                    "currency was never cash or convictions. It's the story told about both, and you're "
                    "still good at building a story someone else believes completely."),
         overlay=None),
    dict(id="t29", level=None, template="podiumScene",
         narration=("A press conference: three hundred million dollars in assets seized under your office "
                    "this year, cameras on your good side, a reporter asking how it feels. You give the "
                    "line Delgado gave you a decade back — 'like justice' — smoother than it should come, "
                    "considering you still don't fully believe it."),
         overlay=dict(big="$300M", sub="SEIZED BY YOUR OFFICE")),
    dict(id="t30", level=None, template="window",
         narration=("Mara left in year six, not out of anger, just exhaustion at competing with a man who "
                    "wasn't legally real. Neither of you calls it anyone's fault out loud. You wear the "
                    "ring most days now, out of habit more than meaning. Some nights you still reach for "
                    "it in a jacket pocket that stopped existing fifteen years ago."),
         overlay=None),

    # ---- LEVEL 08 · THE BUREAU ABOVE YOU ----
    dict(id="t31", level="LEVEL 08  ·  THE BUREAU ABOVE YOU", template="courtroom",
         narration=("A closed-door hearing, DOJ oversight counsel across the table, asking about a "
                    "nationwide forfeiture total running past four billion dollars a year, every field "
                    "office, every year. Nobody in the room asks what it cost the agents who actually "
                    "walked into those rooms wearing someone else's name. You don't volunteer it."),
         overlay=dict(big="$4B+", sub="SEIZED NATIONWIDE, EVERY YEAR")),
    dict(id="t32", level=None, template="backAlley", gap=0.7,
         narration=("Twenty years later you learn, secondhand, what happened after the alley: Dominic "
                    "never pulled the trigger, because Sal — already half-suspecting, the file confirms "
                    "— put a hand on his arm and said let it go, we need him tonight. Sal knew. Sal let "
                    "you live anyway. You read that page three times before you can close the file."),
         overlay=dict(big="THE FILE", sub="SAL KNEW. HE LET YOU LIVE.")),
    dict(id="t33", level=None, template="emptyChair",
         narration=("Fifty-seven. Federal law retires you whether you're ready or not — the same statute "
                    "for every agent who ever wore the badge, SAC or trainee, no exceptions bought or "
                    "earned. Your pension: forty percent of your best three years, fixed, final — the one "
                    "number in this whole climb the Bureau controls instead of you."),
         overlay=dict(big="AGE 57", sub="MANDATORY. NO EXCEPTIONS.")),

    # ---- LOOP CLOSE — cyclical, resolving the cold open's tension, one thread left open ----
    dict(id="t34", level=None, template="lobby",
         narration=("A guest lecture at Quantico, twenty-one weeks into some stranger's twenty-one weeks "
                    "— a trainee the age you were the day Delgado first watched you lie convincingly. She "
                    "asks if it gets easier. You almost answer as Ray Cole before you catch it, the wrong "
                    "name right on the edge of your mouth, twenty years later."),
         overlay=None,
         dialogue=dict(text="It gets easier to do. It never gets easier to undo.")),
    dict(id="t35", level=None, template="lectureHallScene",
         narration=("The classroom smells the same as it did twenty years ago — chalk, gun oil, someone's "
                    "nervous coffee. Your ring is back on, worn smooth now at the spot the old callus "
                    "never got the chance to form. Ray Cole doesn't officially exist anymore. Reaching for "
                    "your own name first, some nights, you're not entirely sure that's true."),
         overlay=None),
]
