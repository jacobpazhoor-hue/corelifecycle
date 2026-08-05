#!/usr/bin/env python3
"""Your Life as an Astronaut at Every Level — POV doodle build, ~12 min.
Grounded in docs/research/astronaut.md (web-verified Aug 2026: NASA.gov, NASA OIG reports,
SpacePolicyOnline, Space.com, the NASA Mishap Investigation Board's Parmitano coverage). Rank format
(per topic_queue.json: "Your Life as an Astronaut at Every Level"). Second-person present-tense POV:
the viewer IS a composite civilian-engineer-turned-astronaut climbing the REAL NASA ladder — Applicant
(VERIFIED: 8,000+ applied to the 2024 cycle, 10 chosen) -> Astronaut Candidate/ASCAN (2 years at
Johnson Space Center: T-38 jets, the Neutral Buoyancy Lab, GS-12 base pay $100,287/yr) -> Astronaut
(unassigned, a real 5-10+ year wait, some never fly) -> First flight/ISS crew member (a Crew Dragon
seat costs NASA ~$55M) -> Veteran/EVA specialist (the midpoint reversal is grounded in the REAL July
16, 2013 Parmitano helmet water-intrusion incident -- 1-1.5+ liters, NASA's own Mishap Investigation
Board findings -- happening here to a FICTIONAL COMPOSITE protagonist, not a Parmitano biography) ->
Expedition Commander (the ISS program runs partner nations an estimated ~$150B) -> Chief Astronaut
Office (decides who flies, grounds people for medical reasons -- the moral-cost beat with no villain)
-> an Artemis-era lunar commander, the apex (grounded in the real, repeatedly-slipped Artemis program:
Artemis II's real crewed lunar FLYBY, April 2026; NASA's own current plan pushes an actual crewed
LANDING to Artemis III/IV-V, 2027-2028; no human has stood on the Moon since Apollo 17, Dec 1972 --
this protagonist's landing is an explicitly LATER, still-hypothetical mission, not a claim this has
already happened). Real mechanics woven in: the T-38 supersonic-jet fatality risk astronaut candidates
train under (VERIFIED historical type of risk, e.g. the 1966 Elliot See/Charles Bassett crash --
referenced only as general background texture, never attributed to this episode's fictional mentor as
if he were a specific real astronaut); the real post-EVA "hot metal/gunpowder" ozone smell (NASA's own
explanation, Dec 2021); the real Apollo-astronaut-reported "spent gunpowder" smell of lunar dust
(Aldrin, Schmitt, Duke). Voss (mentor), Sable Chen (rival), Mara and Junie (family), and Petrova (the
unresolved thread) are a FICTIONAL COMPOSITE -- no real astronaut is depicted as this protagonist.

SPINE: THE INVERTED SPINE, ASTRONAUT-FLAVORED (grounded, per research, already validated on
soldier/spy -- see [[inverted-spine-validated]] in ops/improvements.json). Personal pay stays a fixed,
capped federal GS salary literally the whole career (~$100K at ASCAN, ~$152,258/yr as a veteran and
still at the apex) while the PROGRAM dollars moving around the astronaut explode at every level: a
single seat ($55M) -> the station program (~$150B) -> a single Artemis launch (~$4.2B, NASA
OIG-verified) -> the whole Artemis campaign (~$93B through FY2025, NASA OIG's own headline figure).
The joke lands literally at the apex overlay: $93B moving around you, and your paycheck is still a
number the federal schedule sets, not you.

STRUCTURAL VARIATION vs the last 2 produced (gladiator = AFTERMATH cold open / rise-then-reversal-
then-rise-again / CYCLICAL-BLENDED ending; bratva = MID-ACTION cold open / rise-then-fall-then-colder-
rise / ONE-DOOR-LEFT-OPEN ending): this cold open is FLASH-FORWARD -- the literal last chronological
moment of the story (a boot about to touch lunar dust), cut away before the line gets said, then
"None of this exists yet" rewinds to the actual beginning. Act two's shape is a DUAL-TRACK DIVERGENCE,
not a fall: STATUS keeps climbing almost every level while PRESENCE (time actually spent with Mara and
Junie) keeps falling in the opposite direction -- no single betrayal collapses the climb, the two lines
just quietly cross. The ending is PURE CYCLICAL: the final scene is the literal same shot as the cold
open, completed rather than reframed -- distinct from both recent endings.

PROMISE -> PAYOFF LEDGER (ids below match the final relabeled t01-t33 sequence):
  * t01 cold open (a boot about to touch the Moon, cut away before the first words)  -> RESOLVED at t33 (the boot lands, the words come)
  * t02 promise/cost-line ("nobody warns you what wanting it costs the people who love you") -> paid across t11/t14/t17 (Mara + Junie's costs), explicitly named again at t33
  * sensory anchor: the suit glove's wrist-lock click + the post-EVA "hot metal" smell -> introduced t07 (the click) -> first real payoff t22 (the smell, post-emergency) -> maximal payoff t33 (the same smell, now lunar dust, described without restating "smell" -- the callback engine)
  * Mara, the named want/cost                                    -> introduced t03 -> her own sacrifice t11 -> the quarantine goodbye t14 -> present in t33's "house" line
  * Junie, the named person                                       -> introduced t03 (age 5) -> the missed birthday t17 (age 9) -> the patched-through question t32 (age 17) -> ANSWERED implicitly at t33
  * Commander Voss, the named mentor                               -> warns you t06 -> ages visibly t19 -> you ground him yourself t28 (the loss payoff, institutional, not a death)
  * Sable Chen, the named rival                                    -> introduced t07 -> gets the first flight before you t13 -> taunts you at the midpoint t22 -> reunites as your ISS crewmate t25 -> becomes your Capcom, gives you the go, at the apex t31 (full-circle payoff)
  * share-worthy facts: 8,000+ applicants/10 chosen (t04), the $55M seat (t15), the 1.5L of water (t21), 50+ years since a human last stood on the Moon (t32)
  * PETROVA, the redacted flight-list file                         -> the ONE deliberate UNRESOLVED UNIVERSE THREAD, planted and left explicitly unresolved at t29, for a future episode
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — FLASH-FORWARD, cut away before the words ----
    dict(id="t01", level=None, template="moonSurface", gap=0.7,
         narration=("Boot touches dust that hasn't felt one in over fifty years. Black sky, no wind "
                    "to carry the ringing in your ears, though your chest tightens anyway — the old "
                    "animal kind of fear that doesn't care how many checklists you passed. Houston's "
                    "voice crackles, waiting on the first words history gets to keep. Behind the "
                    "visor, your mouth is already open. Don't say it yet."),
         overlay=dict(big="ONE STEP", sub="MOON HASN'T HEARD YOU YET")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="desk",
         narration=("None of this exists yet. Right now you're an aerospace engineer at a folding "
                    "desk, running failure analysis on somebody else's rocket, sending applications "
                    "into a silence that answers maybe one time in eight thousand. You want this so "
                    "badly it embarrasses you. Nobody warns you what wanting it costs the people who "
                    "love you."),
         overlay=None),

    # ---- LEVEL 01 · APPLICANT ----
    dict(id="t03", level="LEVEL 01  ·  APPLICANT", template="dinner",
         narration=("Mara clears two plates while Junie draws rockets in crayon at the table's edge, "
                    "five years old and already certain you work at NASA. You don't correct her. The "
                    "application sits open on a laptop you close every night before dinner, like "
                    "closing it makes the odds better. Eight thousand people want your seat. You "
                    "haven't told her that part."),
         overlay=None),
    dict(id="t04", level=None, template="fileWall",
         narration=("Boxes of physicals, essays, flight logs, psych evaluations stacked floor to "
                    "ceiling in a records office that smells like toner and old carpet. Somewhere in "
                    "this pile is your file, one of more than eight thousand. NASA will choose ten. "
                    "Lower odds than any university on earth, and nobody in this building is grading "
                    "on a curve."),
         overlay=dict(big="8,000+", sub="APPLICANTS. TEN GET IN.")),
    dict(id="t05", level=None, template="podiumScene",
         narration=("A phone call at 6 a.m., a NASA area code, and your hands shake too hard to "
                    "answer on the first ring. Congratulations. Class of ten. Mara screams before you "
                    "even hang up. Junie draws a rocket with your actual name on the side this time. "
                    "You don't sleep that night — not from joy. From the sudden, physical weight of "
                    "eight thousand people who didn't get this call."),
         overlay=None),

    # ---- LEVEL 02 · ASTRONAUT CANDIDATE (ASCAN) ----
    dict(id="t06", level="LEVEL 02  ·  ASTRONAUT CANDIDATE (ASCAN)", template="jetTrain",
         narration=("Commander Alden Voss straps in behind you, a T-38's canopy sealing out Houston's "
                    "heat. Two years of this before NASA calls you anything but a candidate — "
                    "supersonic flight, robotics, Russian, survival school. Base pay: about what a "
                    "mid-level engineer makes, less than you made building someone else's rocket. Voss "
                    "keys the intercom before the runway."),
         overlay=dict(big="$100,287/YR", sub="2 YRS BEFORE YOU QUALIFY"),
         dialogue=dict(text="The airplane doesn't care how bad you want this. Fly it like it doesn't.")),
    dict(id="t07", level=None, template="poolTrain",
         narration=("Forty feet down in the Neutral Buoyancy Lab, a mockup station module drowned on "
                    "purpose so your body can learn zero-g the hard way. The suit's gloves lock at the "
                    "wrist with a click you'll feel in your sleep for the next two years. A sharp-eyed "
                    "classmate named Sable Chen beats your dive time by four minutes and doesn't "
                    "apologize for it once."),
         overlay=None),
    dict(id="t08", level=None, template="controlRoom",
         narration=("A simulator klaxon screams through a mock Mission Control, an instructor calling "
                    "a launch-abort scenario nobody survives on paper. Voss doesn't flinch, doesn't "
                    "raise his voice, just reads the checklist in the same flat tone he'd use for "
                    "coffee orders. Two astronauts died in a T-38 crash decades before you were born. "
                    "Nobody mentions it out loud. Everybody in this room already knows."),
         overlay=None),
    dict(id="t09", level=None, template="emptyChair",
         narration=("A chair in the simulator bay stays empty by Friday — a classmate washed out this "
                    "week, medically disqualified on a heart-rhythm flag nobody saw coming, gone "
                    "without a goodbye anyone gets to properly say. Voss tells the eight of you still "
                    "standing that finishing ASCAN guarantees exactly nothing. Some candidates in this "
                    "room will wait a decade for a seat. Some, statistically, never fly at all."),
         overlay=None),

    # ---- LEVEL 03 · ASTRONAUT (UNASSIGNED) ----
    dict(id="t10", level="LEVEL 03  ·  ASTRONAUT (UNASSIGNED)", template="window",
         narration=("You pass the boards. NASA drops the word candidate from your title and adds "
                    "nothing else. No mission. No date. Just a window office looking out at a launch "
                    "pad you're not scheduled to stand near for years, maybe ever. The wait, it turns "
                    "out, is its own kind of training — for patience nobody warned you was the actual "
                    "job."),
         overlay=dict(big="5–10 YRS", sub="SOME NEVER FLY AT ALL")),
    dict(id="t11", level=None, template="dinner",
         narration=("Mara turns down a promotion of her own that year — somebody has to be flexible "
                    "enough to move to Houston on six weeks' notice if your number ever comes up, and "
                    "it still hasn't. She never says she resents it. You've learned to hear the "
                    "difference between what Mara says and what Mara means, mostly from the silences "
                    "now, not the words."),
         overlay=None),
    dict(id="t12", level=None, template="podiumScene",
         narration=("NASA sends unassigned astronauts out for school visits and the occasional "
                    "Congressional budget hearing in the meantime, and you get good at both — "
                    "practiced, warm, endlessly patient with the same question from every auditorium. "
                    "A ten-year-old in the third row asks when you're actually going to space. You "
                    "give her the honest answer for once: you don't know yet. She looks disappointed "
                    "for you, not in you, which somehow lands worse than either."),
         overlay=None),
    dict(id="t13", level=None, template="boardroomNotes",
         narration=("A flight director reads the next crew roster off a printed sheet in a room too "
                    "small for the tension packed into it. Sable Chen's name comes first — six "
                    "months, ISS, eight weeks out. Yours doesn't come at all, not this cycle, maybe "
                    "not the next one either. She squeezes your shoulder on the way out, genuinely "
                    "sorry, which somehow makes it worse than if she wasn't."),
         overlay=None),

    # ---- LEVEL 04 · FIRST FLIGHT — ISS CREW MEMBER ----
    dict(id="t14", level="LEVEL 04  ·  FIRST FLIGHT", template="window",
         narration=("Eleven months after Sable's crew leaves, your name finally clears — backup moved "
                    "to prime after a medical scratch you try hard not to feel grateful for. "
                    "Quarantine starts two weeks out, glass between you and Mara, glass between you "
                    "and an eight-year-old palm pressed flat against it like she can push straight "
                    "through if she leans hard enough. Nobody warned you goodbye would have a pane of "
                    "glass in it."),
         overlay=None),
    dict(id="t15", level=None, template="launchSeat", gap=0.7,
         narration=("Harness straps cinch tight enough to bruise, checklist chatter clipped and fast "
                    "in your ear, a countdown you've heard in your sleep for a decade finally counting "
                    "down for real. The capsule shudders once, twice, then the whole world turns to "
                    "noise and gold-white flame filling the porthole. Something braced tight in your "
                    "chest for ten years finally, violently, lets go somewhere around eight and a half "
                    "minutes."),
         overlay=dict(big="$55,000,000", sub="ONE SEAT. NOT YOUR SALARY.")),
    dict(id="t16", level=None, template="cupolaView",
         narration=("The Cupola's seven windows fill with a blue curve no photograph prepared you "
                    "for, the whole argued-over planet turning silent and borderless underneath, no "
                    "line drawn anywhere you can find. Somewhere down there Junie is asleep. You don't "
                    "cry — astronauts don't, not on comm, not with the whole crew listening — but your "
                    "throat does something it's never done before."),
         overlay=dict(big="250 MI", sub="NO BORDERS FROM UP HERE")),
    dict(id="t17", level=None, template="stationCommand",
         narration=("Junie's ninth birthday happens two hundred fifty miles below a scheduled "
                    "ten-minute call that gets bumped twice for an antenna realignment nobody can "
                    "reschedule around a kid's cake. She's polite about it on the delayed line, too "
                    "polite, the specific forgiving kind that costs a nine-year-old more than it "
                    "should ever cost anyone. You float in an equipment rack afterward and don't move "
                    "for a long while."),
         overlay=None),
    dict(id="t18", level=None, template="controlRoom",
         narration=("Splashdown, quarantine again, a debrief room in Houston where a flight surgeon "
                    "asks questions about your body you've never had to answer before — bone density, "
                    "balance, a heart that quietly reshaped itself in microgravity without asking "
                    "permission. Six months up, and you made it back whole. Voss is waiting outside "
                    "with two words that don't sound like a reward at all: EVA-qualified."),
         overlay=None),

    # ---- LEVEL 05 · VETERAN / EVA SPECIALIST (midpoint zone) ----
    dict(id="t19", level="LEVEL 05  ·  VETERAN / EVA SPECIALIST", template="poolTrain",
         narration=("Three years and two flights later, EVA-qualified finally means the real thing — "
                    "one more cert dive first, same pool, same drowned mockup module, except Sable's "
                    "timing you from the surface now, and neither of you needs to prove anything to "
                    "the other anymore. Voss watches from the gallery, slower on the stairs than he "
                    "used to be, a fact you file away and say nothing about."),
         overlay=None),
    dict(id="t20", level=None, template="evaWalk", gap=1.4,
         narration=("Two hundred fifty miles up, the airlock cycles open onto absolute black. Your "
                    "gloves find the handrail exactly where training put it a hundred times before "
                    "today. Wind doesn't exist out here to move anything, but the tether does, a slow "
                    "gold arc against the Earth's blue curve below. Houston's voice goes quiet on comm "
                    "for a stretch that feels longer than it actually is."),
         overlay=None),
    dict(id="t21", level=None, template="evaEmergency",
         narration=("Cold spreads across the back of your neck first, then your ears, then your eyes "
                    "— water, inside the helmet, no gravity to pull it anywhere but wherever it wants "
                    "to go next. Houston's voice sharpens into instructions delivered too calmly to be "
                    "reassuring. One and a half liters, they'll tell you after, pooling around your "
                    "face while you count handholds back to the airlock blind, one at a time."),
         overlay=dict(big="1.5L", sub="WATER, INSIDE YOUR HELMET")),
    dict(id="t22", level=None, template="stationCommand",
         narration=("The helmet comes off in the airlock to a smell like a gun just fired inside a "
                    "furnace — hot metal, seared and sharp, atomic oxygen reacting the second real air "
                    "hits the suit again after hours in vacuum. You're shaking, badly, trying hard to "
                    "hide it under a level voice. Sable isn't buying the performance for a second."),
         overlay=None,
         dialogue=dict(text="You scared everyone but yourself out there. Don't do that again.")),

    # ---- LEVEL 06 · MISSION / EXPEDITION COMMANDER ----
    dict(id="t23", level="LEVEL 06  ·  MISSION / EXPEDITION COMMANDER", template="cupolaView",
         narration=("Two more flights and a promotion nobody throws a party for: Expedition "
                    "Commander, responsible for five other lives and a station that's cost its "
                    "partner nations something like a hundred fifty billion dollars to keep in orbit "
                    "this long. The Cupola view hasn't changed one window of it in all these years. "
                    "You have. It reads less like awe now, more like inventory."),
         overlay=dict(big="$150B", sub="THE STATION IS YOURS NOW")),
    dict(id="t24", level=None, template="boardroomNotes",
         narration=("A crewmate's blood pressure crashes mid-checkup, three days from real help by "
                    "any honest measure out here. You run the emergency protocol from memory, voice "
                    "flat, hands steady — steady in a way that would have scared you seven years ago, "
                    "back when steady was still something you were faking every single day. Command, "
                    "it turns out, is just fear rehearsed until it stops looking like fear."),
         overlay=None),
    dict(id="t25", level=None, template="dinner",
         narration=("Sable rotates up eight months into your command, and the two of you eat "
                    "rehydrated lasagna out of foil pouches like it's the best meal either of you has "
                    "had all year — which, this far from a real kitchen, it honestly might be. She "
                    "doesn't mention the water incident. Neither do you. Some things a crew learns to "
                    "carry instead of saying out loud, year after year, flight after flight."),
         overlay=None),

    # ---- LEVEL 07 · CHIEF ASTRONAUT OFFICE ----
    dict(id="t26", level="LEVEL 07  ·  CHIEF ASTRONAUT OFFICE", template="controlRoom",
         narration=("Back on the ground for good this time, a desk with your name on the door and a "
                    "title that decides who flies next: Chief Astronaut Office. A single Artemis "
                    "launch runs the program something like four point two billion dollars. You don't "
                    "sign off on the money. You sign off on the people it's spent on, and that's by "
                    "far the heavier signature to put your name to."),
         overlay=dict(big="$4.2B", sub="ONE LAUNCH, NOT YOURS")),
    dict(id="t27", level=None, template="podiumScene",
         narration=("Part of the job nobody mentions when they hand you the title: you make the 6 "
                    "a.m. calls now, the ones that turn an overnight of waiting into a career that "
                    "actually starts. Ten names get called this cycle, out of another eight thousand "
                    "who don't. You remember exactly how your own call sounded on the other end of "
                    "that line, and you try, every time, to sound like that — not like the desk you're "
                    "calling from."),
         overlay=None),
    dict(id="t28", level=None, template="emptyChair",
         narration=("Voss's flight physical flags a heart irregularity nobody, including him, saw "
                    "coming. The decision sits on your desk needing exactly one signature — yours, no "
                    "villain anywhere in the paperwork, just a number on a printout ending a "
                    "thirty-year career before it's ready to end. He shakes your hand after. Doesn't "
                    "argue. That's somehow the part you can't stop replaying at night."),
         overlay=dict(big="GROUNDED", sub="MEDICALLY, NOT BY CHOICE")),
    dict(id="t29", level=None, template="fileWall",
         narration=("A file marked Petrova sits in the corner of your desk for a week before you "
                    "finally open it — a candidate quietly pulled from the flight list eighteen "
                    "months ago, reason redacted even to you, the office's highest-ranking astronaut. "
                    "Nobody above your pay grade will explain it. You close the file, unresolved, and "
                    "put it back exactly where you found it, same corner, same silence."),
         overlay=None),

    # ---- LEVEL 08 · ARTEMIS-ERA COMMANDER (apex) ----
    dict(id="t30", level="LEVEL 08  ·  ARTEMIS-ERA COMMANDER", template="launchSeat", gap=0.7,
         narration=("NASA offers you the seat nobody in the office thought they'd actually give you: "
                    "commander, the next Artemis crew, an actual lunar landing this time, not another "
                    "flyby. The whole campaign will run something like ninety-three billion dollars by "
                    "the time it's finished, spread across a decade of hardware and delays. Your own "
                    "paycheck stays exactly where the federal pay schedule says it should. Some "
                    "inversions never stop being funny."),
         overlay=dict(big="$93B", sub="STILL $152,258 A YEAR")),
    dict(id="t31", level=None, template="controlRoom",
         narration=("Sable's voice is the one on comm now, Capcom for this launch, the two of you "
                    "circling all the way back to where a pool and a stopwatch first put you against "
                    "each other twenty years ago. She reads the final go/no-go poll the way she used "
                    "to read a dive time — flat, fast, no room left for doubt of any kind."),
         overlay=None,
         dialogue=dict(text="Go for landing. Don't waste it.")),
    dict(id="t32", level=None, template="launchSeat",
         narration=("The lander shudders through final descent, alarms chirping status instead of "
                    "danger this time, Houston counting steady in your ear the whole way down. A "
                    "patched-through call breaks protocol for exactly eleven seconds — Junie, "
                    "seventeen now, asking the exact question she asked at five, in the exact same "
                    "voice. The connection cuts before you can answer. Some questions get their answer "
                    "a few minutes late, not never."),
         overlay=dict(big="50+ YEARS", sub="SINCE ANYONE STOOD HERE"),
         dialogue=dict(text="Dad, can you see our house?")),

    # ---- LOOP CLOSE — pure cyclical, the cold open completed ----
    dict(id="t33", level=None, template="moonSurface",
         narration=("Boot touches dust that hasn't felt one in over fifty years. The words finally "
                    "come, plain, nothing like what you rehearsed in a mirror for a decade. The fear "
                    "that got you here goes quiet — but the birthdays watched on delay, Voss's "
                    "grounded signature, a redacted file you never got to close, none of it un-costs "
                    "itself just because the boots finally landed. You can't see your house from up "
                    "here. You know exactly what it cost to leave it."),
         overlay=dict(big="ONE STEP", sub="TAKEN.")),
]
