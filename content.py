#!/usr/bin/env python3
"""Could You Survive Alone in the Middle of the Ocean? — POV doodle build, ~13 min, template-driven.
Grounded in docs/research/could_you_survive_ocean.md. SURVIVAL format: the levels are a MONOTONIC
TIME/THREAT ladder (HOUR 0 -> HOUR 1 -> HOUR 6 -> DAY 2 -> DAY 4 -> DAY 9 -> WEEK 2 -> WEEK 4 ->
DAY 54); the gold "$" overlay becomes a SURVIVAL STAT at each stage (a countdown time, a body temp,
a distance, a day count) while the sub-caption tracks the collapsing resource / rising threat. The
color grade escalates by each level-start's POSITION, so the mixed units are fine — the ladder just
keeps moving forward. Second-person present-tense POV: you are delivering a 40-foot sailboat across
the open Pacific with one friend (RAF); a late storm dismasts and holes the boat 1,200 miles from
land; the ocean spends fifty-four days taking everything — heat, then water, then hope, then Raf —
before it decides whether to set you down. DRAMATIZED cautionary survival POV, not a how-to.

REAL/VERIFIED mechanics woven in (see research doc; FLAGS there): the 1-10-1 cold-water rule (~1 min
cold-shock gasp reflex, ~10 min before your hands quit, ~1 hr to unconsciousness); hypothermia below
95F, and the tell that the SHIVERING STOPS; the rule of threes (~3 days without water, FLAGGED as a
heuristic); DRINKING SEAWATER KILLS YOU FASTER (hypernatremia — the counter-intuitive share beat);
solar still + rain catch for fresh water; a raft is a fish-aggregating shade that feeds you (mahi) AND
draws sharks; a low orange raft is nearly invisible from a ship's bridge (no one watches astern);
hallucination + the "third man" felt-presence at the end of endurance. Share beat #2: Jose Salvador
Alvarenga drifted the Pacific ~438 days and lived (the documented record).

SPINE (survival stat overlay — the number is what the sea is charging you at each stage):
1,200 MI -> 45 SEC -> 10 MIN -> 95F -> 3 DAYS -> 0 DROPS -> 600 M -> DAY 9 -> 6 GAL -> DAY 14 ->
438 DAYS -> DAY 31 -> 1 FLARE -> DAY 54.

STORY: RAF (Rafael) — your friend + delivery crewmate, the one other body in the raft; the MIDPOINT
DEATH at t18 ("you don't get to stop just because I did"). ISLA — your 7-year-old daughter on land,
the reason-to-live anchor ("Dad, don't be late"). YOUR FATHER — a dead commercial fisherman whose
RULE ("the sea gives nothing back — don't chase it; wait, and it sets you down") is the mentor
dialogue (t02), the thing that keeps you rationing and still (t12), and the rule you break exactly
once (t24). Sensory anchor motif (body-based, per the trillionaire lesson — no undrawn prop): THIRST
+ the taste of salt in your cracked, splitting lips, re-triggered at every stage; secondary the
raft's slow HISS (a leak = a clock, t21) and the father's brass knife notching the days into the tube
(t20). Master open loop: the MID-ACTION cold open (t00 — night, day 54, the container ship's lit hull
sliding past, your last flare) pays off at t24-t25. Universe thread (deliberate, left OPEN): the
SANTA ELENA (t15) — a half-swamped panga with a cooler of water and a child's sandal and no bodies;
you take the water and never learn what happened to them.

PROMISE->PAYOFF LEDGER:
  * t00 cold open (night ship, last flare, does the light turn?)          -> t24/t25 (the same night, from the start)
  * t01 want: $8,000 to save your dead father's boat + Isla's promise     -> t27 (you keep the boat; Isla is home; the money means nothing)
  * anchor: thirst + salt in split lips (re-triggered)                    -> t03/t08/t16/t19/t27 (salt "in a split that healed months ago")
  * t02 father's rule: "don't chase it — wait, it sets you down"          -> t12 (you obey and live), t24 (you break it exactly once)
  * t01/t02 RAF planted                                                    -> t18 (the midpoint death; his charge)
  * t02 Isla's promise "Dad, don't be late"                               -> t19 (you talk to her for days), t27 (home)
  * t05 the beacon (does anyone hear it?)                                  -> t26 (the search was called off day 9 — a passing ship found you, not the search)
  * t09 seawater kills faster (the "wait, that's real?" share beat)        -> paid immediately (a delivered fact)
  * SANTA ELENA (t15) — the universe thread                               -> left UNRESOLVED on purpose (you never learn who they were)

Templates: NEW OCEAN/SURVIVAL pack in src/stage.tsx (oceanCapsize/raftDay/raftNight/glassCalm/
horizonShip/finWater/driftPanga/openSwell/shipNight/makeLandfall) + reuse of DYNASTY seaDeck (the boat
still whole) + universal dinner (a land-memory) + window (the haunted-survivor loop close on land).
shipNight is the reused master-loop anchor (t00 cold open / t24 payoff); raftDay/raftNight/finWater/
openSwell each reused as the drift's base, NEVER on adjacent scenes. STRUCTURAL VARIATION vs last 2
(mexican_cartel = aftermath cold open, rise-then-fall, cyclical; trillionaire = flash-forward,
rise-then-fall, cyclical): this cold open is MID-ACTION (dropped into the night-ship peak, present),
the act-2 shape is FALL-THEN-RISE (a continuous decline, then the rescue rises), and the ending is
ONE-DOOR-OPEN / haunted-survivor (the sea "keeps a part"; the Santa Elena stays open) — not cyclical.
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — mid-action at the peak (the master loop): the night ship, the last flare ----
    dict(id="t00", level=None, template="shipNight", gap=0.7,
         narration=("Black water, the middle of the night, the middle of nowhere. A wall of steel slides past "
                    "close enough to smell the diesel — a container ship, lit like a city, ten thousand people's "
                    "cargo aboard and not one of them awake. Your last flare is a wet stick in your fist. Strike "
                    "it, and the light up on that bridge either turns or it doesn't. Fifty-four days of ocean have "
                    "taken everything else you had. Your hands are steady. That's the only thing left to spend."),
         overlay=dict(big="DAY 54", sub="ONE FLARE LEFT · AND THE SHIP HASN'T TURNED")),

    # ---- LEVEL 1 — HOUR 0 · THE CROSSING (comfort + want) ----
    dict(id="t01", level="HOUR 0  ·  THE CROSSING", template="boatDeck",
         narration=("Six weeks earlier the boat is whole and the sea is kind. You and Raf are running a rich "
                    "man's forty-foot sloop across the Pacific — eight thousand dollars to deliver it, enough to "
                    "keep your dead father's fishing boat off the auction block one more year. On land your "
                    "daughter Isla is seven and made you promise, hard, hands on your face. Twelve hundred miles "
                    "of open water to the nearest anything. Nobody expects you for weeks."),
         overlay=dict(big="1,200 MI", sub="TO THE NEAREST LAND · NO ONE EXPECTS YOU FOR WEEKS")),
    dict(id="t02", level=None, template="dinner",
         narration=("That night Raf grills the day's catch in the cockpit and you split the last cold beer two "
                    "ways. He's the best sailor you know, laughing at something Isla sent before you lost signal — "
                    "Dad, don't be late. You tell him your father's one rule, the rule of every fisherman who died "
                    "in bed instead of in the water. Raf just grins and taps the rail like the sea's an old dog. "
                    "The rule stays with you. Remember it."),
         overlay=None,
         dialogue=dict(text="The sea gives nothing back. Don't chase it. Wait — and it sets you down.")),

    # ---- LEVEL 2 — HOUR 1 · COLD SHOCK ----
    dict(id="t03", level="HOUR 1  ·  COLD SHOCK", template="oceanCapsize", gap=0.7, rate="+10%",
         narration=("The storm isn't forecast. It just arrives — a black wall at three in the morning, the mast "
                    "screaming, and then a wave the size of a house lays the sloop flat and won't let it up. The "
                    "cold comes through the hull like a fist. Salt floods your mouth, your nose, your whole skull. "
                    "Grab the ditch bag. Cut the raft free. Forty-five seconds — and the sea is already inside the "
                    "boat, taking it down by the bow."),
         overlay=dict(big="45 SEC", sub="TO GET OFF A BOAT THAT'S ALREADY GONE")),
    dict(id="t04", level=None, template="openSwell",
         narration=("The first breath in cold water is a scream your body takes without asking — the gasp reflex, "
                    "and if your head is under when it fires, you drown right there. One minute of that. Then maybe "
                    "ten before your arms turn to wood and stop answering. Raf is a dark dot twenty feet off, going "
                    "quiet. You swim for the orange scrap of raft dragging a friend who has already stopped obeying "
                    "his own hands."),
         overlay=dict(big="10 MIN", sub="1-10-1 · BEFORE YOUR HANDS STOP OBEYING YOU")),
    dict(id="t05", level=None, template="raftDay",
         narration=("You haul Raf over the tube and fall in after him, both of you shaking so hard the raft hums. "
                    "The boat is gone — a slick of fuel and one floating cushion where a hundred grand of yacht "
                    "used to be. You claw the emergency beacon out of the ditch bag, press it, and watch the little "
                    "light blink into a sky that doesn't blink back. Somewhere, maybe, a screen lights up. Maybe no "
                    "one is looking at it."),
         overlay=dict(big="1 BEACON", sub="PRESSED · NO WAY TO KNOW IF ANYONE HEARD IT")),

    # ---- LEVEL 3 — HOUR 6 · THE FIRST NIGHT ----
    dict(id="t06", level="HOUR 6  ·  THE FIRST NIGHT", template="raftNight",
         narration=("The dark comes down like a lid. You're soaked, the wind is up, and the raft is a cold puddle "
                    "you share with a man whose lips are going grey. Shivering is good. Shivering is your body "
                    "still fighting to hold ninety-five degrees. It's when the shaking stops that you should be "
                    "afraid. So you hold Raf against your chest and count his breaths, and yours, and the stars — "
                    "which are beautiful, and do not care."),
         overlay=dict(big="95°F", sub="CORE TEMP FALLING · WHEN THE SHIVERING STOPS, WORRY")),
    dict(id="t07", level=None, template="raftDay",
         narration=("Dawn is a grey line, then a gold one, and no ship on it. Raf's color creeps back with the "
                    "sun. You empty the ditch bag onto your knees and count what stands between you and the whole "
                    "Pacific: three pints of water, a hand line, a signal mirror, two flares, a solar still sealed "
                    "in its wrapper. You do the math. The math is bad. But you are both alive, and the sea is "
                    "flat, and that is a mercy that will not last."),
         overlay=None),

    # ---- LEVEL 4 — DAY 2 · THIRST ----
    dict(id="t08", level="DAY 2  ·  THIRST", template="glassCalm",
         narration=("By the second day the sun stops being warmth and becomes a weight that leans on you. Your "
                    "tongue is a dry stone. Your lips split, and the salt gets down into the splits and stays "
                    "there, burning. You ration water by the capful — one at dawn, one at dark — against a number "
                    "you cannot argue with: three days, maybe four, before the body starts closing doors. The sea "
                    "is everywhere. Not one drop of it will help you."),
         overlay=dict(big="3 DAYS", sub="WHAT YOU HAVE WITHOUT WATER · THE RULE OF THREES")),
    dict(id="t09", level=None, template="raftNight", gap=0.7,
         narration=("The thirst talks to you at night. Drink me, says the whole ocean, all around you, warm and "
                    "close. Here is the cruelty nobody tells you: drink the seawater and you die faster than if "
                    "you drank nothing at all. It is saltier than your blood — your kidneys burn fresh water you "
                    "don't have just to flush it, and the thirst comes back doubled, then the madness. Men have "
                    "drunk the sea and been dead by morning. So you don't. You listen to it, and you don't."),
         overlay=dict(big="0 DROPS", sub="DRINK THE SEA AND YOU DIE FASTER · YES, REALLY")),
    dict(id="t10", level=None, template="raftDay",
         narration=("Therefore you build water instead of stealing it. You rig the solar still and it sweats a "
                    "thimble of fresh into the cup, an hour at a time, and you learn to call a thimble a victory. "
                    "Hunger arrives behind the thirst, quieter, patient. You drop the hand line over the side into "
                    "two miles of nothing and wait, because your father taught you that waiting is a skill, and "
                    "out here it is the only one that keeps you alive."),
         overlay=None),

    # ---- LEVEL 5 — DAY 4 · THE SHIP ----
    dict(id="t11", level="DAY 4  ·  THE SHIP", template="horizonShip",
         narration=("Day four, Raf sees it first — a ship, low and grey and close, close enough to count the "
                    "containers stacked on her back. You are both on your knees in the raft screaming, flashing "
                    "the mirror, and you burn one of your two flares into the daylight where it barely shows. It "
                    "climbs, arcs, dies. The ship never changes course. Six hundred meters — and no one on a "
                    "bridge that size ever watches the water behind them."),
         overlay=dict(big="600 M", sub="A MILE OFF · AND NO ONE WATCHES THE WATER ASTERN")),
    dict(id="t12", level=None, template="raftDay",
         narration=("After a ship passes you, the ocean is louder. Raf punches the tube and swears and then goes "
                    "silent, and the silence is worse than the swearing. In it you hear your father: don't chase "
                    "it. A raft with a scrap of sea-anchor holds the current that carries you toward land; a "
                    "swimmer chasing a hull dies exhausted a mile from where the sea would have set him down. So "
                    "you sit on your hands. You wait. Waiting is the hardest work there is."),
         overlay=None),
    dict(id="t13", level=None, template="rainSquall",
         narration=("On the sixth day the sky darkens and for once you are glad of it. A squall rolls over, warm "
                    "and grey, and you rip the canopy flat and turn your face up and open your mouth like a child. "
                    "Rain. Real rain, and you catch what you can in the folds and the cup and your own two hands, "
                    "gulping until your stomach cramps. Ten minutes of weather buys you two more days of life. "
                    "Then the sky closes its hand, and the sun comes back for what it's owed."),
         overlay=dict(big="+2 DAYS", sub="THE SQUALL GIVES · THE SUN COMES BACK TO COLLECT")),

    # ---- LEVEL 6 — DAY 9 · WHAT'S BELOW ----
    dict(id="t14", level="DAY 9  ·  WHAT'S BELOW", template="finWater",
         narration=("By the ninth day the raft has grown a world beneath it. Fish gather in its one shadow — "
                    "mahi, gold and electric, the only shade for a thousand miles. You spear one with the gaff and "
                    "eat it raw and weep at how good it is. But the same shade calls the other thing. A fin, "
                    "unhurried, taller than your spread hand, begins to circle, and bumps the floor beneath you "
                    "once — testing whether you're soft."),
         overlay=dict(big="DAY 9", sub="THE SHADE FEEDS YOU · AND DRAWS WHAT EATS YOU")),
    dict(id="t15", level=None, template="driftPanga", gap=0.7,
         narration=("On the tenth night you drift down onto a wreck. A little fishing panga, half under, tilting "
                    "in the swell, a name flaking off the bow: Santa Elena. Inside her, a sealed cooler — six "
                    "gallons of fresh water — and a child's pink sandal, and no one. No bodies. No note. You take "
                    "the water, because Isla is why your heart still bothers and these strangers are past caring. "
                    "You never learn what took them. You still don't."),
         overlay=dict(big="6 GAL", sub="A DEAD BOAT'S WATER · AND A CHILD'S SANDAL, NO CHILD")),
    dict(id="t16", level=None, template="finWater",
         narration=("The fin comes back with company. Two of them work the raft the way you'd shake a tree — a "
                    "shove, a wait, a harder shove — and a tooth catches the fabric and lets a slow line of "
                    "bubbles up along your spine. You jab the gaff at a hide like wet stone and it does nothing. "
                    "The salt is in your lips, in the tear, in everything. You bail, and jab, and hold Raf's arm, "
                    "and the sea keeps its long, patient count."),
         overlay=None),
    dict(id="t17", level=None, template="raftDay", gap=1.4,
         narration=("The stolen water buys days it cannot buy Raf. His salt sores go deep, his fever climbs, and "
                    "somewhere past the second week he stops being able to sit up on his own. You tip water into "
                    "his mouth and it runs out the side. He knows before you do. On the fourteenth night he comes "
                    "clear for a minute — the way the sea goes flat and glassy right before the worst of it — and "
                    "he spends the whole minute on you."),
         overlay=None),

    # ---- LEVEL 7 — WEEK 2 · ALONE  (the midpoint reversal) ----
    dict(id="t18", level="WEEK 2  ·  ALONE", template="raftNight", gap=0.7,
         narration=("He tells you to get the eight thousand to his wife if you make it. He tells you to tell Isla "
                    "he's sorry he ate her dad's coffee. Then he tells you the thing you carry the rest of your "
                    "life, and makes you say it back. By first light he's gone. You hold him until the cold makes "
                    "it unbearable, and then you do the only thing the sea allows — you let him over the side — "
                    "and the raft rides higher without his weight, and you hate it for that."),
         overlay=dict(big="DAY 14", sub="THE RAFT HOLDS ONE NOW"),
         dialogue=dict(text="You keep going. You don't get to stop just because I did.")),
    dict(id="t19", level=None, template="openSwell",
         narration=("Alone is a different ocean. No one to split the watch, no one to say a ship's name out loud "
                    "so it stays real. So you talk to Isla — out loud, hour on hour, until your split lips bleed "
                    "into the salt. And you hold one fact like a plank in a flood: a fisherman named Alvarenga "
                    "drifted this same Pacific four hundred and thirty-eight days and walked out the far side of "
                    "it alive. If he could, you can. You say it until you believe it. Then you say it more."),
         overlay=dict(big="438 DAYS", sub="A MAN ONCE DID THIS ALONE, AND LIVED · REAL")),
    dict(id="t20", level=None, template="raftDay",
         narration=("You keep the raft's nose to the current the way your father kept his boat's nose to the "
                    "swell. Every dawn you cut one more notch into the tube with his brass knife — a whole life "
                    "measured in scars on rubber. You catch fish. You drink the sweat of the still. You bail. You "
                    "are down to a body and a reason, and the reason is a seven-year-old's voice telling you not "
                    "to be late. So you refuse, one more dawn, to be late."),
         overlay=None),

    # ---- LEVEL 8 — WEEK 4 · THE STORM ----
    dict(id="t21", level="WEEK 4  ·  THE STORM", template="oceanCapsize", gap=0.7, rate="+8%",
         narration=("The second storm finds you on the thirty-first day, and it means it. A wave folds the raft "
                    "and a shark-bumped seam lets go with a hiss you feel in your teeth. The sea pours in. You "
                    "bail with a shoe, with your cupped hands, with your mouth, screaming at a sky that answers "
                    "only in more water. You cram the patch from the raft's little kit into the tear and it "
                    "half-holds — and the hiss never fully stops. Now the leak is a clock, and it is running."),
         overlay=dict(big="DAY 31", sub="THE TUBE TEARS · YOU BAIL WITH A SHOE")),
    dict(id="t22", level=None, template="glassCalm",
         narration=("The storm passes and leaves you flatter than before, in every way. Then a bird — a small, "
                    "brown, ordinary bird — drops out of nowhere and lands on the sagging tube and folds its wings "
                    "and just looks at you. Birds mean land. Somewhere out there, land. It sits an hour, closer "
                    "than a wild thing should ever come, as if it too is only tired. Then it lifts and goes, and "
                    "you turn the raft, with the very last of you, to follow where it went."),
         overlay=dict(big="1 BIRD", sub="BIRDS MEAN LAND · SOMEWHERE, LAND")),
    dict(id="t23", level=None, template="openSwell",
         narration=("Somewhere in the fifth week the mind lets go of its edges. Your father sits on the far tube "
                    "mending a net that isn't there. Isla's laugh comes clean off the flat water. A city you could "
                    "walk to shimmers up on the horizon and dissolves the moment you paddle for it. Survivors have "
                    "a name for the company that arrives at the end of yourself — the third man. You let him stay. "
                    "You are too tired to be alone and too stubborn to be dead."),
         overlay=None),

    # ---- LEVEL 9 — DAY 54 · THE LIGHT  (cold-open payoff, rescue at cost, loop close) ----
    dict(id="t24", level="DAY 54  ·  THE LIGHT", template="shipNight", gap=0.7,
         narration=("Fifty-four days in, at night, the wall of steel comes back — a container ship, lit like a "
                    "city, close enough again to smell the diesel. Here is where the cold open began. Your last "
                    "flare, one wet stick, one strike, one prayer, and no voice left to spend on screaming. And "
                    "you think of your father's one rule — don't chase it — and for the first and only time, you "
                    "break it. This once, you chase. You tear the cap and grind the striker and beg the wet powder "
                    "to catch."),
         overlay=dict(big="1 FLARE", sub="THE LAST ONE · AND THE LIGHT HASN'T TURNED")),
    dict(id="t25", level=None, template="raftNight",
         narration=("It catches. Red light, blood-bright, roaring off the black water — the first real color in a "
                    "colorless world. You hold it up until it scorches your fingers and you do not let go. For "
                    "three long seconds the ship is only a wall of indifference sliding by. Then, far up on the "
                    "dark bridge, a light swings toward you. The hull begins, impossibly, slowly, to turn. The "
                    "ocean that gives nothing back is about to be made, this once, to give back you."),
         overlay=None),
    dict(id="t26", level=None, template="makeLandfall",
         narration=("They haul you up the hull in a cargo net like a catch. A sailor wraps you in foil and stares "
                    "the way you'd stare at a ghost — because to the world you are one. The search was called off "
                    "on day nine; your beacon died in the storm; no one was still looking. Land comes three days "
                    "later, green and impossible, smelling of dirt and diesel and every living thing at once. Your "
                    "legs have forgotten it. You crawl the last of the way."),
         overlay=dict(big="DAY 54", sub="THEY STOPPED LOOKING DAY 9 · AND FOUND YOU ANYWAY"),
         dialogue=dict(text="You're the one they stopped looking for.")),
    dict(id="t27", level=None, template="window", gap=0.7, rate="-8%",
         narration=("Isla hits you at the knees so hard it nearly puts you down, and you stay down, on the ground, "
                    "holding on. You keep your father's boat; the eight thousand means nothing against her weight "
                    "on your chest. But you sleep with the window cracked to hear water. Some nights your tongue "
                    "finds the ghost of salt in a split that healed months ago, and your hand closes on a brass "
                    "knife that isn't there. The sea gave you back. It kept a part. It always keeps a part."),
         overlay=None),
]
