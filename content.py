#!/usr/bin/env python3
"""Your Life as a Hitman at Every Level (You Don't Retire) — POV doodle build, ~12.5 min.
Grounded in docs/research/hitman.md. RANK format: level labels LEVEL 0N · THE [RANK]. Second-person
present-tense POV: broke, a mother's hospital debt hanging over you, you're pulled into contract
killing by the men who hold that debt — and climb a real documented ladder (novice -> journeyman ->
specialist -> the desk) until the thing that promoted you (killing your own mentor) is also the thing
that proves there is no clean exit from this life. DRAMATIZED CAUTIONARY POV about organized crime —
NEVER a how-to, no methods, no tradecraft detail; the point is the trap closing, not the killing.

REAL/VERIFIED mechanics woven in (see research doc; flags there): Birmingham City University's David
Wilson study of 27 UK contract killings (1974-2013) found an AVERAGE FEE OF ~£15,000 (~$20,000) — about
the price of a used car — with real fees ranging as low as £200 and up to £100,000; the real four-tier
taxonomy is NOVICE -> DILETTANTE -> JOURNEYMAN -> MASTER; the youngest documented UK contract killer was
15; most real hits are unglamorous (the study's grim signature line: "walking the dog"), and MOST
attempted contract killings are solved, often via undercover stings. The FBI works 70-90 murder-for-hire
cases a year, and the "professional" a first-time civilian finds online is, more often than not, a cop
or informant (the share-worthy "wait, that's real?" beat, t13). Real organized-crime enforcers are often
UNPAID for a first killing — it buys standing, not cash — and bosses/handlers take a CUT of jobs under
them rather than pulling triggers themselves, which is why the L7 overlay flips from a $ fee to a %
cut. Numbers serve the story; never listed as a lecture.

SPINE (the escalating fee, then its flip — the price ON you):
$0 (you owe $18,000) -> $5,000 -> $25,000 -> $60,000 -> $250,000 -> $1,000,000 -> 12% (your cut, no
more trigger fee) -> $2,000,000 (the price on YOUR name).

STORY: RUTH — your mother, a diner counter shift, whose $18,000 second surgery is the debt that opens
every door in this life; the reason you climb and the person the life keeps you from being honest with.
EMIL — the old journeyman who recruits and trains you (t04 dialogue: "There's no last job. Only a last
name you don't come back from."); the MIDPOINT REVERSAL (t15) is the organization ordering you to kill
him, paid off in the same fenced training yard where he taught you (t16, callback). VOSS — a hungrier
young journeyman and rival, introduced early (t09) without dialogue, who taunts you once you've crossed
the line he hasn't (t18 dialogue) and later tries to take your spot outright (t22). MARCH — the
lawyer-broker / fixer (shared-universe character) who hands out every name after Emil's death; his line
just before the loop close (t27) plants the UNRESOLVED universe thread: "the Dutchman," who holds the
real book and is never seen. SENSORY ANCHOR (body-based, per the trillionaire/ocean lesson — no undrawn
prop): your own steady hands / resting pulse ("your hands don't shake; they never have"), re-triggered
at t04/t07/t14/t17/t22/t25/t28/t29 — the ONE time it breaks is the Emil kill itself (t16), and the final
image is a new, frightened recruit's hands shaking where yours never did (t28). Secondary sensory: gun
oil and cold coffee smell; brass counted off a concrete floor by sound alone. Master open loop: the
COLD OPEN (t00 — mid-action, an alley, a trigger that has never trembled, cut away before the shot)
resolves at t25 — the same alley, a different, younger shooter's hands doing the part yours used to.

PROMISE -> PAYOFF LEDGER:
  * t00 cold-open mid-action (the alley, the un-fired trigger)          -> t25 (the same alley, someone else's hands now)
  * t01 promise/cost line ("the trigger is easy, retiring kills you")   -> t26/t27/t29 (the price on you; no exit)
  * anchor: steady hands / resting pulse (re-triggered)                 -> t04/t07/t14/t17/t22/t25/t28/t29 (breaks once at t16; contrasted at t28)
  * RUTH + the $18,000 debt (t02)                                       -> t07 (paid down), t20/t29 (the diner, the door you never walk back through)
  * EMIL planted + his warning (t04)                                    -> t15/t16/t17 (the midpoint order and its cost)
  * VOSS planted (t09)                                                  -> t18 (taunt), t22 (the betrayal attempt, foiled)
  * MARCH planted (t11)                                                 -> t21/t23 (the desk offer), t26/t27 (the price on you; the Dutchman line)
  * t13 share beat: FBI stings / "the professional is often a cop"      -> paid immediately (a delivered fact)
  * t08 share beat: real average fee ~$20K, most killers caught          -> paid immediately (a delivered fact)
  * t24 THE BOOK (every name, decades of them, not March's to own)      -> t27 (the Dutchman — left UNRESOLVED on purpose)

Templates: composed ENTIRELY from the existing MAFIA + SPY + UNIVERSAL/GENERIC packs — NO new stage.tsx
art. backAlley (MAFIA) is the reused master-loop anchor (t00 cold open / t03 confrontation / t25
payoff — never adjacent); tradecraft (SPY, "the Farm," fenced training ground) doubles as Emil's range
AND the callback where you kill him (t04/t16); streetCorner (t02/t29) bends the final image back to the
opening block. STRUCTURAL VARIATION vs last 2 (ocean = mid-action cold open/fall-then-rise/one-door-
open; trillionaire = flash-forward cold open/divergent-rise/trapped-gilded-cage): this cold open is
MID-ACTION like ocean's, but the act-2 shape is RISE-WITH-MOUNTING-GUILT (status only ever climbs;
conscience is what erodes, not fortune), and the ending is A DOOR LEFT OPEN, NOT CYCLICAL-MIRROR — you
watch the loop repeat on someone else rather than replaying your own start.
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — mid-action, cut away before the shot (the master loop) ----
    dict(id="t00", level=None, template="backAlley", gap=0.7, rate="+10%",
         narration=("Rain needles a bulb over a caged door in an alley that smells like wet brick and "
                    "gun oil. Forty feet down, a man laughs into his phone, three drinks past careful. "
                    "Two fingers rest on a trigger that has never once trembled — not tonight, not any "
                    "night. Don't blink. Count his steps. The laugh cuts off mid-word."),
         overlay=None),
    dict(id="t01", level=None, template="deskSilhouette",
         narration=("You want out of this life before you're even properly in it. You don't know yet "
                    "that out isn't a door. Down here there's a rule nobody says out loud until it's "
                    "too late to matter: the trigger is the easy part. It's the retiring that kills "
                    "you."),
         overlay=None),

    # ---- LEVEL 01 -- THE DEBT ----
    dict(id="t02", level="LEVEL 01  ·  THE DEBT", template="streetCorner",
         narration=("Your mother Ruth works the counter at Dino's, eleven-hour shifts, a name tag gone "
                    "grey at the edges that still says RUTH in gold thread. Eighteen thousand dollars "
                    "bought her second surgery. You borrowed it from men who round the interest up "
                    "every month like a hobby. Four hundred a week just to keep the number from "
                    "growing. That's the whole plan. It isn't working."),
         overlay=dict(big="$0", sub="YOU OWE $18,000 · TO MEN WHO DON'T FORGET")),
    dict(id="t03", level=None, template="backAlley",
         narration=("The vig comes due on a Tuesday, and so does a man named Costa, built like a "
                    "refrigerator, patient in the specific way that means he isn't worried. He doesn't "
                    "raise his voice. He tells you the number that ends this — pay it, or start earning "
                    "it a different way. Behind him, unbothered, an old man in a canvas coat has been "
                    "listening the whole time."),
         overlay=None),
    dict(id="t04", level=None, template="tradecraft",
         narration=("But the old man's name is Emil. He doesn't ask if you've done this before — he "
                    "already knows you haven't. He walks you to a fenced yard behind a scrapyard, paper "
                    "targets, a stopwatch, patience worn into every line of his face. He teaches you to "
                    "count brass off concrete by the sound alone. Your hands don't shake. They never "
                    "have. He notices that first."),
         overlay=None,
         dialogue=dict(text="There's no last job. Only a last name you don't come back from.")),

    # ---- LEVEL 02 -- THE FIRST NAME (minute-3 delivered spectacle) ----
    dict(id="t05", level="LEVEL 02  ·  THE FIRST NAME", template="safehouse",
         narration=("Emil hands you a folder, one photograph clipped to a name: a bookie skimming from "
                    "men who don't get skimmed. You pin it to a corkboard and study it the way you'd "
                    "study a locked door — angles, hours, the smell of his cigar through a cracked "
                    "window. The number in your head isn't the five thousand dollars. It's the eighteen "
                    "you still owe, shrinking for the first time in a year."),
         overlay=dict(big="$5,000", sub="THE FIRST ONE NEVER LEAVES YOU")),
    dict(id="t06", level=None, template="waterfront",
         narration=("So the docks at 2 a.m. smell like diesel and low tide. He comes out of the "
                    "warehouse office counting bills he thinks are his. You don't say his name. You "
                    "don't let him finish turning around. One shot, the gulls scatter, his cigar still "
                    "smoking in an ashtray nobody will ever find. Walk. Don't run. Count the boats "
                    "until your pulse remembers how to slow down."),
         overlay=None),
    dict(id="t07", level=None, template="countRoom",
         narration=("Emil counts the five thousand into your palm under a bulb that swings when the "
                    "door shuts. Brass off concrete, bills off a thumb — the same rhythm, he says, the "
                    "same steady count. You keep four hundred for the vig and mail the rest to Ruth's "
                    "account with no note. She calls to ask where it came from. You let it ring. Your "
                    "hands, counting the bills back, still don't shake."),
         overlay=None),

    # ---- LEVEL 03 -- THE JOURNEYMAN ----
    dict(id="t08", level="LEVEL 03  ·  THE JOURNEYMAN", template="surveillance",
         narration=("You're a regular now, tailing men down wet streets for a week before you ever "
                    "touch a weapon, learning which doorways hide you and which ones don't. Emil says "
                    "most of this life is patience, not shooting — a rehearsal for a moment that never "
                    "quite arrives. Most killers get caught. Most botch it. Don't be most."),
         overlay=dict(big="$25,000", sub="THE GOING RATE · ABOUT THE PRICE OF A USED CAR")),
    dict(id="t08b", level=None, template="socialClub",
         narration=("The other journeymen drink at a social club two blocks off the water, and the "
                    "talk turns, the way it always does, to a British study Emil quotes like scripture: "
                    "the average real contract killing pays about twenty thousand dollars, most killers "
                    "are ordinary men in their late thirties, and the youngest ever caught for one was "
                    "fifteen. Nobody at the bar laughs. The romance of this life is a rumor. The math "
                    "isn't."),
         overlay=None),
    dict(id="t09", level=None, template="redSauce",
         narration=("A journeyman named Voss buys you a dinner you didn't ask for, red sauce and a "
                    "bottle he opens without asking. He's younger, hungrier, keeps score of whose name "
                    "gets called first. He smiles the whole meal like it costs him nothing. Word is he "
                    "flinched on his second job and has lied about it since. You don't mention that. "
                    "Not yet. Some debts you save."),
         overlay=None),
    dict(id="t10", level=None, template="wiretap",
         narration=("A witness half-remembers a jacket, a height, a walk. Feds set up in a rented room "
                    "two blocks from the last job, reels turning, a wall of photographs that almost has "
                    "your face on it. It doesn't. You changed your coat, your gait, the hand you carry "
                    "with. Close is not the same as caught. Close just means the next one has to be "
                    "cleaner than this one was."),
         overlay=None),
    dict(id="t11", level=None, template="debrief",
         narration=("So a lawyer named March finds you after, unbothered, unhurried, a man who has "
                    "never once raised his voice about anything. He doesn't work one family — he "
                    "brokers for whoever can pay, a cut-out so clean no chain traces back through him. "
                    "He slides a card across a bare table, no name on it, just a number. The family was "
                    "small. The work, starting now, is not."),
         overlay=None),

    # ---- LEVEL 04 -- THE CLEANER ----
    dict(id="t12", level="LEVEL 04  ·  THE CLEANER", template="deadDrop",
         narration=("March's jobs don't come with names anymore, just coordinates and a photograph left "
                    "under a park bench at dawn. You're not the muscle now — you're the cleanup, the "
                    "version of you that leaves nothing: no brass on a floor, no thumbprint on a bulb, "
                    "no thread to pull. Sixty thousand dollars for a silence so total the client never "
                    "has to ask what happened."),
         overlay=dict(big="$60,000", sub="NO WITNESSES · NO TRACES · NO QUESTIONS")),
    dict(id="t13", level=None, template="fileWall",
         narration=("Here's the part civilians get wrong. The FBI runs seventy to ninety of these cases "
                    "a year, and the 'professional' most people find online is a retired cop logging an "
                    "IP address for a few hundred dollars. Real work doesn't advertise. Real work finds "
                    "you, the way March found you, and hands you a folder across a car seat, telling "
                    "you, once, not to open it here."),
         overlay=None),

    # ---- LEVEL 05 -- THE SPECIALIST (the midpoint reversal) ----
    dict(id="t14", level="LEVEL 05  ·  THE SPECIALIST", template="window", gap=1.4,
         narration=("Two hundred fifty thousand dollars — the highest number of your life, for a name "
                    "March says is guarded, valuable, dangerous to the wrong people. The folder rides "
                    "the passenger seat like something that might wake up. Rain starts. The wipers count "
                    "time you don't have. Your hands, on the wheel, are perfectly steady. For once in "
                    "your life, you wish they weren't."),
         overlay=dict(big="$250,000", sub="THE FEE FOR A NAME YOU DON'T KNOW YET")),
    dict(id="t15", level=None, template="deskClose",
         narration=("You open the folder at a red light. One photograph. The face looking back is the "
                    "one that taught you to count brass off concrete by the sound alone. Emil talked, "
                    "or Emil tried to leave — March never says which, and it stops mattering the second "
                    "you understand the assignment has your own teacher's name typed at the top of the "
                    "page, in the same font as all the others."),
         overlay=None),
    dict(id="t16", level=None, template="tradecraft", gap=0.7, rate="-10%",
         narration=("But the fenced yard behind the scrapyard hasn't changed — same paper targets, same "
                    "stopwatch rusted at ten past four. Emil is waiting like he already knew, hands "
                    "loose at his sides, and says only that he always figured it would be you, and that "
                    "he's glad, in a way, that it is. Count the brass, he told you once. You do. For the "
                    "first time in your life, your hands are not steady at all."),
         overlay=None),
    dict(id="t17", level=None, template="emptyChair",
         narration=("So the money lands the same day, clean, exactly as promised, and it is the first "
                    "payment that has ever felt like a theft instead of a wage. Emil's stool at the "
                    "diner counter sits empty now; Ruth still fills his coffee out of habit and asks, "
                    "once, out loud, where the old man's gotten to. You tell her you don't know. Your "
                    "hands go back to steady by morning. That's the part that should scare you."),
         overlay=dict(big="$250,000", sub="PAID IN FULL · THE ONE DEBT THAT DOESN'T CLEAR")),

    # ---- LEVEL 06 -- THE GHOST ----
    dict(id="t18", level="LEVEL 06  ·  THE GHOST", template="jet",
         narration=("March's next call comes from a client who doesn't do paperwork, doesn't do names, "
                    "doesn't exist on any form you've ever filled out — a million dollars, wired in "
                    "three pieces, for a man who will never again be a problem to people who don't get "
                    "to have problems. You fly out on a passport with a name that isn't yours. Voss "
                    "finds out, and can't hide how it eats at him."),
         overlay=dict(big="$1,000,000", sub="ONE NAME · A PASSPORT YOU DIDN'T HAVE LAST YEAR"),
         dialogue=dict(text="You'll flinch eventually. Everyone flinches once. I only did.")),
    dict(id="t19", level=None, template="donOffice",
         narration=("But the client's office smells like cedar and old paper, no photographs on the "
                    "walls, no clock. A man in a good suit explains, without ever using a verb that "
                    "means killing, exactly what needs to stop happening. You've learned the language by "
                    "now — the water is a leak, the man is a fire, and you are, without a word ever said "
                    "to that effect, the fix for both. It is a job title nobody prints on a card."),
         overlay=None),
    dict(id="t20", level=None, template="tower",
         narration=("From forty floors up a foreign city, the streetlights look like brass scattered on "
                    "a dark floor, more of it than you could ever count. You used to know exactly how "
                    "many names sat between you and the eighteen thousand dollars that started this. "
                    "You've lost count completely. Somewhere below, a woman named Ruth is refilling a "
                    "coffee cup for a stool nobody sits at anymore."),
         overlay=None),
    dict(id="t20b", level=None, template="prisonCell",
         narration=("Some nights the fear isn't the next job — it's a cell you've never occupied, "
                    "imagined so often it feels like a memory already. Wiretaps, informants, a jacket "
                    "that doesn't fit the description just well enough. Emil never went inside once in "
                    "thirty years, and Emil is dead by your own hand, which means the cage was never "
                    "the real danger in this life at all."),
         overlay=None),

    # ---- LEVEL 07 -- THE HANDLER ----
    dict(id="t21", level="LEVEL 07  ·  THE HANDLER", template="commission",
         narration=("So March sits you down with men older than Emil ever got to be, faces you've only "
                    "heard described. They offer you the desk — stop pulling triggers, start assigning "
                    "them, twelve percent of every contract that runs through your name instead of your "
                    "hand. It is called retiring. Nobody at the table laughs when they say it, which is "
                    "exactly how you know it isn't true."),
         overlay=dict(big="12%", sub="YOUR CUT OF EVERY NAME YOU HAND OUT NOW")),
    dict(id="t22", level=None, template="cardGame",
         narration=("Voss wants the desk himself, and he's done waiting his turn behind a man who got "
                    "there by killing his own teacher. He comes at you in a back room over a card table "
                    "that stops being a card table fast — a chair thrown, a blade that catches "
                    "lamplight, a mistake he makes exactly once. Your hands, through all of it, do not "
                    "shake. Voss's do, at the end. That's new."),
         overlay=None),
    dict(id="t23", level=None, template="signing", gap=0.7,
         narration=("So you sign the one page March slides over, and the trigger part of your life ends "
                    "on a Tuesday with a pen instead of a gun. You are the desk now. Every name that "
                    "goes out carries your percentage and none of your fingerprints. It is the closest "
                    "thing this life offers to daylight. It is not daylight. You just stopped standing "
                    "where the shadow falls."),
         overlay=None),

    # ---- LEVEL 08 -- THE OPEN CONTRACT (apex twist, loop begins to close) ----
    dict(id="t24", level="LEVEL 08  ·  THE OPEN CONTRACT", template="mobTable",
         narration=("The ledger March finally shows you is thicker than you expected and older than you "
                    "are — decades of names, fees, dates, cities, none of it in his handwriting. He "
                    "didn't build this. He services it, the way you service a small piece of it now. "
                    "Above every desk, it turns out, is another desk. You ask, for the first time, who "
                    "actually owns the book. He doesn't answer. The silence that follows is the longest "
                    "one he's ever let stand between you."),
         overlay=dict(big="THE BOOK", sub="EVERY NAME EVER RUN THROUGH THIS LIFE")),
    dict(id="t25", level=None, template="backAlley",
         narration=("Rain needles a bulb over a caged door in an alley that smells like wet brick and "
                    "gun oil — the same alley, you'd swear, though it can't be. Forty feet down, a man "
                    "laughs into his phone, three drinks past careful. This name came from your own "
                    "desk, assigned to a shooter you trained yourself. From the mouth of the alley, his "
                    "hands do the part yours used to. Yours, for once, have nothing to do."),
         overlay=None),
    dict(id="t26", level=None, template="warRoom", gap=0.7,
         narration=("But March finds you the next morning with a folder he doesn't want to hand over. "
                    "Two million dollars, wired in three pieces, for a man who has run this desk too "
                    "long and knows too much to be trusted with retiring. You don't get a pension. You "
                    "don't get a gold watch. You don't get to just stop — you get a price, same as "
                    "everyone before you, typed in the same font."),
         overlay=dict(big="$2,000,000", sub="THE PRICE ON YOUR OWN NAME")),
    dict(id="t27", level=None, template="redSauceAlone",
         narration=("You sit at the restaurant table where Voss once bought you a dinner you didn't ask "
                    "for, and the chair across from you stays empty on purpose now. March orders for "
                    "one. He tells you, gently, the way you'd tell a patient the worst news last, that "
                    "the real book — the one that actually matters — was never his to show you."),
         overlay=None,
         dialogue=dict(text="The Dutchman keeps the true book. Nobody's ever seen him. Best you don't start now.")),

    # ---- LOOP CLOSE — a door left open, not a mirror ----
    dict(id="t28", level=None, template="lobby",
         narration=("Across town, in a diner that still takes cash, a broke kid folds a past-due notice "
                    "under a coffee mug and does the math on eighteen thousand dollars for the tenth "
                    "time that week. An old man in a canvas coat sits down uninvited, unhurried, patient "
                    "in the way that means he isn't worried. The kid's hands, wrapped around a cheap "
                    "cup, are shaking. Nobody warns him that's the part that fixes itself."),
         overlay=None),
    dict(id="t29", level=None, template="streetCorner", rate="-8%",
         narration=("From a car across the street, the exchange plays out exactly the way yours did, "
                    "years back, and you don't get out. Ruth's name tag still hangs by a door you paid "
                    "off years ago and never once walked back through. Your hands rest on the wheel, "
                    "steady, the way they've always been — the one part of you this life never managed "
                    "to touch. There was never a door out. There was only ever the next name."),
         overlay=None),
]
