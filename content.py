#!/usr/bin/env python3
"""Your Life as a Pro Basketball Player at Every Level — POV doodle build, ~12 min.
Grounded in docs/research/basketball_player.md (all comp figures web-verified Aug 2026): the real,
documented NBA pathway and pay ladder — high school hopeful (VERIFIED: ~0.03% of HS players ever
reach the NBA) -> Division I college roster (VERIFIED: ~1% of all NCAA players are ever drafted;
NIL money is real but wildly uneven) -> undrafted / G League ($40,500/season, VERIFIED) / two-way
contract ($578,577, VERIFIED: 2025-26 NBA two-way salary, its own separate pay scale) -> drafted
rookie (VERIFIED: $1,361,969 2025-26 rookie minimum; VERIFIED: average NBA career is only 4.5
years) -> veteran
comeback on a real 10-day contract (VERIFIED CBA mechanic) -> All-Star -> supermax superstar
(VERIFIED: Jayson Tatum's real 2025 5-year, $313,933,410 deal) -> the global-brand apex (referenced,
not named, via the real scale of a $1B+ lifetime shoe deal) -> THE RECKONING, retirement, and the
episode's share-worthy coda fact: VERIFIED, an estimated 60% of former NBA players are broke within
five years of retirement (Sports Illustrated's 2009 investigation, reconfirmed by later reporting).
You, Denise, Coach Ellis, Marcus, and Priya Osei are a FICTIONAL COMPOSITE; no real, named NBA player
is depicted as this episode's protagonist. New BASKETBALL template pack added to src/stage.tsx
(drivewayHoop/highSchoolGym/gLeagueBus/arenaCourt/iceBathRoom/rafterRetirement) per docs/TEMPLATES.md
— the existing generic SPORTS pack's stadiumField (soccer-coded) and medalPodium (Olympic-coded)
don't fit an NBA ladder; the rest composes from universal signing/dinner/boardroomNotes/tower/jet/
window/fileWall/layoffs and the MEDICAL pack's erTrauma (re-narrated: the on-court injury cart-off).

STRUCTURAL VARIATION vs the last 2 produced (ottoman_empire = MID-ACTION cold open / rise-then-
fracture / cyclical-but-deliberately-unresolved ending; pirate = AFTERMATH cold open / rise-then-
fall-then-rise with a DUAL crash / one-door-left-open ending): this cold open is FLASH-FORWARD — a
jersey-retirement ceremony whose meaning (triumph or ending?) is deliberately ambiguous, cut away
before it resolves. Act two's shape is a SINGLE clean rise, ONE catastrophic midpoint crash (a torn
ACL, not a betrayal), and a harder-won rise past the old peak — distinct from pirate's two-crash
spine. The ending is PURE CYCLICAL: the loop bends fully back to the opening ceremony, now completely
understood, resolving (not leaving open) the cold-open loop — distinct from both of the last two.

PROMISE -> PAYOFF LEDGER (ids match the final t01-t32 sequence):
  * t01 cold open (the banner, the empty arena, ambiguous meaning, cut before it's explained)   -> RESOLVED at t30-t32 (the same banner, now fully understood)
  * t02 promise/cost-line ("you don't know yet what they take down to put a banner up")          -> paid across t16 (the house), t29 (four visits a year), t31/t32
  * sensory anchor: ice (a bag of frozen peas -> a training tub, bigger/colder every level)       -> introduced t05 -> re-triggered t14/t17/t20/t23/t31 -> maximal payoff t32 ("ice waits in a tub nobody hands you anymore")
  * Denise, the named person/want (an elevator that doesn't work)                                -> introduced t03 -> t04/t06/t12/t16 (the house, PAID OFF) -> her own cost (the limp, missed years) t24/t29 -> the dialogue line t31
  * Coach Ellis, the named mentor                                                                -> introduced t12 (the dialogue warning) -> the comeback t21 -> no false redemption arc, just present
  * Marcus, the named rival                                                                      -> introduced t10 -> drafted instead of you t11 -> the taunt/dialogue line t19 -> never resolved further (a deliberate loose thread — most rivalries don't get a final scene either)
  * share-worthy fact #1: VERIFIED odds (0.03% HS-to-NBA, 1% NCAA-to-drafted)                     -> planted t06/t09
  * share-worthy fact #2: VERIFIED average NBA career length (4.5 years)                          -> planted t18 (the injury), paid off again t22 ("outlasted the average career by six months")
  * share-worthy fact #3: VERIFIED 60% of former players broke within 5 years of retirement       -> the coda, t31
  * THE ONE DELIBERATE UNRESOLVED UNIVERSE THREAD: a second Apex Management card, a different name under Priya Osei's, an office in a city never visited -> planted t10, reappears t27, never explained
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — FLASH-FORWARD, ambiguous, cut before it resolves ----
    dict(id="t01", level=None, template="rafterRetirement", gap=0.7,
         narration=("One spotlight left on in an empty arena, aimed at a banner with your number "
                    "stitched into it in gold nobody asked your opinion about. Twenty thousand seats, "
                    "all empty. A suit, not a jersey. A voice behind you starts the word retirement and "
                    "stops, unsure that's actually what this is. Don't check the exits. There isn't "
                    "time to find one before the lights come up."),
         overlay=dict(big="14 SEASONS", sub="ONE BANNER")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="fileWall",
         narration=("Rewind. None of it exists yet — not the banner, not the gold thread, not the "
                    "suit. Somewhere your mother clocks out of a double shift nobody thanks her for by "
                    "name. You want the banner. You want it bad enough to build a whole life around a "
                    "hoop bolted to a garage. You don't know yet what they take down to put a banner "
                    "up."),
         overlay=None),

    # ---- LEVEL 01 · THE DRIVEWAY ----
    dict(id="t03", level="LEVEL 01  ·  THE DRIVEWAY", template="drivewayHoop",
         narration=("Your mother is Denise, forty-one, on her feet ten hours at Prescott General before "
                    "this shift even started. The hoop above the garage door sits two degrees off true; "
                    "you've never once fixed it because you know exactly how it plays now. Cracked "
                    "concrete. One good pair of shoes, resoled twice. Six hundred makes before dinner, "
                    "every single night, whether anyone's watching or not."),
         overlay=None),
    dict(id="t04", level=None, template="dinner",
         narration=("Supper is whatever's on sale, split without anyone saying so out loud. Denise asks "
                    "about school first, basketball second, same order every night, like the order "
                    "itself is a kind of prayer. She's saved four hundred dollars toward an elevator "
                    "repair the landlord keeps promising and never starts. You tell her someday you'll "
                    "just buy the building. She laughs like it's a joke. You don't."),
         overlay=None),
    dict(id="t05", level=None, template="highSchoolGym",
         narration=("State semifinal, four seconds left, down one — the gym loud enough that the "
                    "buzzer barely cuts through it. Catch. Turn. Release. The ball rolls the rim twice "
                    "before it decides. A man in a windbreaker two rows up writes something down "
                    "without clapping, which somehow says more than the whole gym screaming does. Your "
                    "ankle rolls landing. Ice, for the first time, actually matters."),
         overlay=None),
    dict(id="t06", level=None, template="boardroomNotes",
         narration=("Recruiters call the house phone before your ankle's even done swelling, offering "
                    "trips, gear, promises that don't survive a signature. A guidance counselor pulls "
                    "the odds up on a laptop, unprompted, like a warning label. But the man in the "
                    "windbreaker calls back a second time. Denise takes the message on the back of an "
                    "electric bill. Nobody offers to fix the elevator."),
         overlay=dict(big="0.03%", sub="EVER REACH THE NBA")),

    # ---- LEVEL 02 · THE ROSTER ----
    dict(id="t07", level="LEVEL 02  ·  THE ROSTER", template="lectureHallScene",
         narration=("Division I, a full ride, a jersey with your actual name across the back for the "
                    "first time in your life. Class at eight, lift at eleven, film at two — the "
                    "schedule owns you the way the driveway never did. NIL money is real now, "
                    "technically; a teammate three lockers down signs a deal worth more than Denise "
                    "makes in a year. Yours is worth a free sandwich."),
         overlay=None),
    dict(id="t08", level=None, template="arenaCourt",
         narration=("Nationally televised, March, a shot clock winding down against the tournament's "
                    "number-one seed. You pull up from twenty-six feet with a hand in your face — the "
                    "kind of shot Coach would bench you for in practice — and it drops clean through a "
                    "net gone silent for one full second before the building comes apart. Nine million "
                    "replays rack up by morning, a season's worth of driveway reps compressed into six "
                    "seconds of footage. Nobody can spell your name yet."),
         overlay=None),
    dict(id="t09", level=None, template="window",
         narration=("A highlight doesn't pay an elevator repair. Your own shot loops on a phone screen "
                    "at 2 a.m., counting shares like they're dollars, which they aren't. Draft boards "
                    "rank you anywhere from the mid-first round to not ranked at all, depending which "
                    "website gets checked that week. One percent of every college player in the "
                    "country ever hears their name called on draft night."),
         overlay=dict(big="1%", sub="OF NCAA PLAYERS GET DRAFTED")),
    dict(id="t10", level=None, template="boardroomNotes",
         narration=("An agent named Priya Osei leaves a card that says Apex Management and a number "
                    "that answers on the first ring, always. So does Marcus's agent — Marcus, your "
                    "best friend since fifth grade, same driveway, same six hundred makes a night for "
                    "years. His mock-draft grade climbs every week. Yours holds steady, then quietly "
                    "drops four spots the week of your ankle MRI."),
         overlay=None),

    # ---- LEVEL 03 · UNDRAFTED ----
    dict(id="t11", level="LEVEL 03  ·  UNDRAFTED", template="signing",
         narration=("Draft night, sixty names called across two rounds, and yours isn't one of them — "
                    "Marcus goes twenty-second, hugging his mother live on national television while "
                    "Denise sits with you in the next room, waiting on a phone that stays dark. Two "
                    "hours later a G League team offers a deal so far under what you pictured your "
                    "whole life that the number gets read twice before you sign it anyway."),
         overlay=dict(big="$40,500", sub="G LEAGUE, FIVE MONTHS")),
    dict(id="t12", level=None, template="gLeagueBus",
         narration=("The bus leaves at 1 a.m. for a nine-hour drive nobody in the NBA ever has to "
                    "make, engine rattling loud enough to drown out the radio. Coach Ellis, forty years "
                    "in gyms nobody remembers the names of anymore, takes the seat across from you "
                    "without asking permission. He's watched a hundred kids exactly this good disappear "
                    "by twenty-five, quietly. Denise still has four hundred dollars saved."),
         overlay=None,
         dialogue=dict(text="Everybody on this bus was the best player in their gym once.")),
    dict(id="t13", level=None, template="signing",
         narration=("Six weeks in, a two-way contract lands — its own separate pay scale, a locker in two "
                    "different buildings, a life split exactly down the middle between the league "
                    "you're chasing and the one that's actually paying you. You sign it in a hallway "
                    "between drills, no ceremony, no cameras. It's still the best number you've ever "
                    "seen with your own name attached to it."),
         overlay=dict(big="$578,577", sub="NBA TWO-WAY SALARY")),
    dict(id="t14", level=None, template="iceBathRoom",
         narration=("Ice, every night now, both ankles instead of one, a training-room tub that never "
                    "quite gets cold enough to stop hurting by the count of sixty. Ice fixes the "
                    "swelling. Ice fixes tomorrow's practice. Ice does not fix the part of you that "
                    "still checks a phone at 1 a.m. for a call-up that hasn't come, over and over, "
                    "screen light the only thing awake in the room. The water numbs faster than the "
                    "waiting does."),
         overlay=None),

    # ---- LEVEL 04 · THE CALL-UP ----
    dict(id="t15", level="LEVEL 04  ·  THE CALL-UP", template="arenaCourt",
         narration=("The call comes at 6 a.m. — a roster injury two states away, a flight booked "
                    "already, a jersey with your name spelled right on the first try for once. "
                    "Warmups under lights bright enough to erase the crowd behind them. The anthem. "
                    "Your legs remember every driveway rep without being asked to. Somewhere in the "
                    "stands, Denise is on a flight you paid for."),
         overlay=dict(big="$1,361,969", sub="NBA ROOKIE MINIMUM")),
    dict(id="t16", level=None, template="tower",
         narration=("First paycheck bigger than anything either of you has ever seen on paper, and the "
                    "first call isn't to a car dealership — it's to a realtor, for a one-story house "
                    "with an elevator that isn't a metaphor because there isn't a second floor left to "
                    "need one. Denise cries on the phone for a reason that has nothing to do with "
                    "basketball. You did the thing you said you'd do."),
         overlay=None),
    dict(id="t17", level=None, template="arenaCourt", gap=1.4,
         narration=("Twelve games into a real NBA rotation, minutes climbing every single week, a body "
                    "that still does exactly what's asked of it without one word of complaint. Your "
                    "legs are steady under you tonight, steadier than they've been in years, the crowd "
                    "noise settling into something almost like comfort. That's the part that scares "
                    "you. Nothing has gone wrong yet. Ice waits in the tub behind the tunnel, patient, "
                    "right on schedule."),
         overlay=None),

    # ---- MIDPOINT REVERSAL ----
    dict(id="t18", level=None, template="erTrauma", gap=0.7,
         narration=("Your knee buckles on a landing identical to six hundred others you've made this "
                    "year, and the sound it makes carries over the crowd noise before the pain does. "
                    "Carts, a tunnel, a doctor's face already decided on something it hasn't said out "
                    "loud yet. An MRI confirms it before sunrise: the ACL, fully torn. Average NBA "
                    "career, four and a half years. You're two seasons in."),
         overlay=dict(big="ACL TORN", sub="AVG CAREER: 4.5 YEARS")),
    dict(id="t19", level=None, template="layoffs",
         narration=("The team's option on your contract expires quietly, no press conference, no "
                    "ceremony — a locker cleared out by somebody else while you're still in a leg "
                    "brace three states away, learning to walk on crutches nobody photographs. Marcus "
                    "texts a highlight from his own breakout season instead of checking in on yours. "
                    "You call him anyway, out of habit more than hope. He picks up mid-workout, already "
                    "somewhere else entirely."),
         overlay=None,
         dialogue=dict(text="Ice doesn't fix everything, man. Some of us just heal different.")),
    dict(id="t20", level=None, template="iceBathRoom",
         narration=("Rehab is six hours a day for a body that used to do this for free. The ice is "
                    "colder now, or it just feels that way with nothing guaranteed on the other side of "
                    "it. A therapist tracks your range of motion in a notebook like it's a stock chart "
                    "trending the wrong direction, week over week, in handwriting too neat to argue "
                    "with. Denise doesn't mention the house payment. You do the math anyway, every "
                    "night."),
         overlay=None),

    # ---- LEVEL 05 · THE COMEBACK ----
    dict(id="t21", level="LEVEL 05  ·  THE COMEBACK", template="gLeagueBus",
         narration=("Nine months of rehab earns you exactly one thing: a G League assignment again, "
                    "the same bus, a different Coach Ellis quote every single week, the same worn seat "
                    "across the aisle. He doesn't say I told you so. He doesn't have to — the silence "
                    "does it for him. Your knee holds through a crossover for the first time since the "
                    "tear, and something locked since the MRI finally, quietly, unclenches."),
         overlay=None),
    dict(id="t22", level=None, template="arenaCourt",
         narration=("A ten-day contract lands — non-guaranteed past day ten, no security, no ceremony, "
                    "the exact opposite of the deal you signed at twenty-two. You play the best "
                    "basketball of your career anyway, out of something closer to fear than joy, "
                    "sprinting back on defense on a knee that used to just do it automatically. Day "
                    "nine, the team extends it for the rest of the season. You've now outlasted the "
                    "average NBA career by six full months."),
         overlay=dict(big="10-DAY DEAL", sub="NO GUARANTEE PAST DAY 10")),
    dict(id="t23", level=None, template="iceBathRoom",
         narration=("Both knees in the tub now instead of one, plus a shoulder that started clicking on "
                    "cold mornings nobody warned you about at twenty-two. Ice fixes the swelling. Ice "
                    "fixes whatever shows up clean on a scan. Ice does not fix the four years you can't "
                    "get back, or the two full seasons Denise spent watching game film on a bad couch "
                    "instead of seeing a doctor about her own knees."),
         overlay=None),
    dict(id="t24", level=None, template="dinner",
         narration=("Denise is fifty-one now, still working, because retiring on your rookie money felt "
                    "too much like admitting the injury won. The limp she's had a year without "
                    "mentioning is there again tonight. She catches you staring and changes the subject "
                    "to your next game instead. Some things get bought outright. Some things you just "
                    "find out later you should've asked about sooner."),
         overlay=None),

    # ---- LEVEL 06 · ALL-STAR ----
    dict(id="t25", level="LEVEL 06  ·  ALL-STAR", template="arenaCourt",
         narration=("Three seasons after a torn ACL was supposed to end things quietly, your name gets "
                    "read on national television as an All-Star reserve — the gym behind your eyes "
                    "flashing back to a bent rim and six hundred makes a night before the broadcast "
                    "even cuts to commercial. Denise is courtside this time, an actual ticket, not a "
                    "flight you booked her on a hunch."),
         overlay=None),
    dict(id="t26", level=None, template="boardroomNotes",
         narration=("A shoe company that wouldn't return your agent's calls three years ago now wants a "
                    "signature line with your actual name stitched across the box. Priya Osei "
                    "negotiates it across a conference table you couldn't have pictured from a G League "
                    "bus seat at 1 a.m., every clause read aloud twice before either of you signs "
                    "anything. Seven figures a year, guaranteed, the first money in your entire life "
                    "that shows up whether you play one minute of it or not."),
         overlay=None),
    dict(id="t27", level=None, template="podiumScene",
         narration=("All-Star weekend media day: forty reporters, a backdrop with your name on repeat, "
                    "a question about the injury answered the same careful way every single time. "
                    "Somewhere in the stack of interview requests is a second card from Apex "
                    "Management — a different name under Priya's, an office address in a city you've "
                    "never been to. Nobody explains it. You pocket it anyway."),
         overlay=None),

    # ---- LEVEL 07 · SUPERMAX ----
    dict(id="t28", level="LEVEL 07  ·  SUPERMAX", template="signing",
         narration=("The supermax offer arrives on your twenty-eighth birthday: five full years, every "
                    "dollar guaranteed no matter what your knees decide to do next season or the one "
                    "after. You sign it at a table with more cameras pointed at it than your entire "
                    "rookie season combined — the largest number either you or Denise has ever seen "
                    "written next to a human being's actual name."),
         overlay=dict(big="$313.9M", sub="5-YEAR SUPERMAX DEAL")),
    dict(id="t29", level=None, template="jet",
         narration=("The private jet is real, the endorsement portfolio is real, a net worth with more "
                    "zeros than the elevator repair ever needed, multiplied a thousand times over. "
                    "Somewhere a bigger name than yours turned playing basketball into a billion actual "
                    "dollars and a lifetime shoe deal nobody's grandchildren will outlive — the fantasy "
                    "this entire ladder actually sells, one in a whole generation. All of it sits on "
                    "paper, owned outright. Four visits to Denise, this whole year — that's the actual "
                    "count."),
         overlay=None),

    # ---- LEVEL 08 · THE RECKONING (apex cost, resolves the cold open) ----
    dict(id="t30", level="LEVEL 08  ·  THE RECKONING", template="rafterRetirement", gap=0.7,
         narration=("Fourteen seasons, two more knee surgeries, and a front office that finally says, "
                    "gently, that this year should be the last one — not a cut, not a trade, just math "
                    "nobody in the building argues with anymore. The team plans a ceremony. A banner. "
                    "Your actual number, stitched in gold you never once asked anyone's opinion about. "
                    "You already know exactly how this particular night ends before it starts."),
         overlay=dict(big="14 SEASONS", sub="3X THE AVG CAREER")),
    dict(id="t31", level=None, template="iceBathRoom",
         narration=("Sixty percent of players who make it this far are broke within five years of "
                    "their last game — a real number, the one nobody puts on a banner. You're not one "
                    "of them, technically; the house is paid off, the shoe deal outlives the knees. "
                    "Denise sits in the tunnel with you before the ceremony starts, quiet, the way she "
                    "used to be at the kitchen table."),
         overlay=dict(big="60%", sub="BROKE WITHIN 5 YEARS"),
         dialogue=dict(text="The banner doesn't hand anybody back the years, baby. Just so you know that.")),

    # ---- LOOP CLOSE — pure cyclical, fully resolved ----
    dict(id="t32", level=None, template="rafterRetirement",
         narration=("One spotlight left on in an arena about to fill with twenty thousand people who "
                    "paid to watch this exact moment. The banner rises. Your number, gold thread, no "
                    "longer a suit you're guessing at the meaning of — a jersey, retired, a whole "
                    "life's worth of six-hundred-makes-a-night finally spelled out above a court you'll "
                    "never play on again. Ice waits in a tub nobody hands you anymore."),
         overlay=dict(big="RETIRED", sub="THE ICE STOPS COMING")),
]
