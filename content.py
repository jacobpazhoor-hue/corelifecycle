#!/usr/bin/env python3
"""Your Life in the Bratva at Every Rank — POV doodle build, ~12 min.
Grounded in docs/research/bratva.md. Rank format (per topic_queue.json: "Your Life in the Russian
Bratva at Every Rank"). Second-person present-tense POV: the viewer IS a composite Russian
organized-crime figure climbing the REAL, documented vory v zakone hierarchy (VERIFIED this session
via web search: Wikipedia "Russian mafia"/"Thief in law", Grokipedia "Obshchak"/"Solntsevskaya
Bratva", RBTH, Jamestown Foundation, corrections1.com) -- Patsan (prospect) -> Boyevik (soldier) ->
Brigadir (crew leader) -> Avtoritet (a made authority w/ a legit front) -> Smotryashchiy (district
overseer) -> Vor v Zakone via koronatsiya (the crowning, code-bound: no marriage/no state job/no
property) -> a foreign cell (grounded in the real 1992 Solntsevskaya dispatch of Vyacheslav "Yaponchik"
Ivankov to Brighton Beach -- background texture, NOT a claim this protagonist IS Ivankov) -> Pakhan
(the boss, nominal control of an obshchak he can never personally spend). Real mechanics woven in:
prison tattoos as a coded resume (stars = never kneel to police, epaulettes = rank, cathedral domes =
sentences served -- VERIFIED corrections1.com/RBTH); the obshchak's real 5-20% profit levy (VERIFIED
Grokipedia); the real, Yeltsin-era-reported krysha (protection) racket covering 70-90% of Russian
businesses at 10-20% of turnover in the mid-1990s (VERIFIED, Jamestown Foundation -- this episode's
share-worthy "wait, that's real?" beat); the historical suchya voyna ("bitch wars") code-purge
referenced only as general unsourced-casualty background texture, per research doc flag, never as a
literal blow-by-blow retelling. Ded Grisha (mentor) and Zoloto (rival) are a FICTIONAL COMPOSITE.

SPINE: WHAT THE CODE COSTS vs. WHAT IT PAYS -- every promotion is measured in two numbers: the money
passing through your hands (rubles/dollars, escalating) and what the code has taken from you in
return. The overlay INVERTS at the koronatsiya (Level 6): the crowning strips your personal money to
literal $0, surrendered to the obshchak, even as the organization's flow around you is at its widest
-- the money was never yours, and the higher you climb the truer that gets.

STRUCTURAL VARIATION vs the last 2 produced (fbi_undercover = MID-ACTION cold open / likable-target
moral-erosion / CYCLICAL ending; gladiator = AFTERMATH cold open / rise-then-reversal-then-rise-again
/ CYCLICAL-blended ending): this cold open is MID-ACTION (kneeling in a fogged banya, a razor at your
knuckle, a loyalty test already underway, cut away before the verdict) -- distinct from gladiator's
AFTERMATH open. Act two's shape is RISE-THEN-FALL-THEN-COLDER-RISE: status and money climb almost
every level, but the emotional floor drops out at the midpoint (Ded Grisha's death) and never fully
recovers -- by the apex you're powerful and almost entirely alone. The ending is ONE-DOOR-LEFT-OPEN
(distinct from both recent CYCLICAL endings): the cold-open loop (the razor, "did you talk") gets
explicitly RESOLVED via narration at t30, but the FINAL image does not bend back to the cold open --
it opens a new, deliberately unresolved universe thread instead (Sasha).

PROMISE -> PAYOFF LEDGER:
  * t01 cold open (the razor at your knuckle, "did you talk")      -> RESOLVED at t30 ("you never talked... that's the only reason you're sitting here")
  * t02 promise/cost-line (Valya's dead stove, "you don't know the price") -> the stove itself PAYS OFF at t24 (bought back in cash); the deeper price is understood by t28 ($60M obshchak, still not yours)
  * sensory anchor: the tattoo needle / ink smell                    -> t05 (first dot) -> t09 (the knee star) -> t13 (the epaulette) -> t23 (an unearned cathedral dome) -> t31 (the final callback, a new patsan's first mark)
  * Katya, the named want                                           -> introduced t03 -> t16 (finds the club, "do you love any of this") -> t22 (the ring left on the windowsill, koronatsiya ends it) -> her ABSENCE becomes the setup for the t32 unresolved thread
  * Ded Grisha, the named mentor (introduced t04/t05)                -> vouches for you t17 -> the frame closes in t18 (silence beat, gap=1.4) -> HIS DEATH t19 (the midpoint reversal) -> paid off at t30 (the reason you're pakhan)
  * Zoloto, the named rival (introduced t12)                         -> taunts you at the midpoint t20 ("somebody had to clean house") -> PAYS OFF at t27 (his own name circled in red two years later, the fund disposing of its own)
  * the krysha share-worthy fact (9 in 10 businesses paying a "roof") -> planted t12
  * the $0 koronatsiya inversion overlay                             -> plants the spine's thesis explicitly at t21
  * SASHA (Katya's daughter, a name on the back of an unmarked envelope) -> the ONE deliberate UNRESOLVED UNIVERSE THREAD, opened at t32, left for a future episode
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — MID-ACTION, cut away before the verdict ----
    dict(id="t01", level=None, template="banyaSitDown", gap=0.7,
         narration=("Steam so thick the door disappears. A straight razor lies flat along your "
                    "knuckles, not yours, not moving. Ded Grisha's voice comes from somewhere in the "
                    "white: did you talk. Water hisses off hot stone behind you, cedar smoke and wet "
                    "salt thick enough to chew, the only other sound in the room. Answer wrong and the "
                    "razor decides for you, not him. Don't blink first."),
         overlay=dict(big="ONE ANSWER", sub="THE RAZOR HASN'T MOVED YET")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="streetCorner",
         narration=("None of this exists two years ago — not the steam, not the razor, not the name "
                    "the block will start using instead of yours. An eleventh-floor elevator broken "
                    "since before you were born. Your mother, Valya, boiling water on a hot plate "
                    "because the stove died in March. You want it fixed. You don't know yet that "
                    "fixing anything here has a price nobody prints on a receipt."),
         overlay=None),

    # ---- LEVEL 01 · PATSAN ----
    dict(id="t03", level="LEVEL 01  ·  PATSAN", template="courtyardBlock",
         narration=("Eleven flights of stairs, laundry frozen stiff on the line above you, Katya "
                    "waiting by the broken swing because it's the only bench left with both chairs. "
                    "She wants out of this courtyard. So do you. An older boy named Tolik offers five "
                    "hundred rubles to carry a bag three blocks and not look inside it. Your hands say "
                    "yes before your mouth does."),
         overlay=dict(big="500 RUBLES", sub="DON'T LOOK INSIDE THE BAG")),
    dict(id="t04", level=None, template="backAlley",
         narration=("The bag is heavier than five hundred rubles should feel. Two men stop you at the "
                    "alley's mouth, patting you down hard enough to bruise, deciding whether you're "
                    "worth the trouble of hurting. An old man watches from a doorway the whole time and "
                    "says nothing — until he does. One sentence, and both men step back like he's cold "
                    "water. You don't know his name yet."),
         overlay=None),
    dict(id="t05", level=None, template="tattooCell",
         narration=("Ded Grisha runs a coil-and-needle rig older than you are, ink smell thick enough "
                    "to taste, iodine under it. One dot, he says, for the first job carried without "
                    "flinching — earned, not given. The buzz climbs up through your jaw while he works "
                    "in silence, unhurried, like the needle has all the time the razor didn't. Your "
                    "hand doesn't move once."),
         overlay=None,
         dialogue=dict(text="Ink doesn't come off. Neither does what it means.")),

    # ---- LEVEL 02 · BOYEVIK ----
    dict(id="t06", level="LEVEL 02  ·  BOYEVIK", template="shopKrysha",
         narration=("Two years chalk up fast once Tolik stops being the one giving orders. A grated "
                    "counter window, a shopkeeper's hand shaking around a folded stack of bills, your "
                    "own voice flat and bored on purpose because bored is scarier than angry ever "
                    "sounds. Two hundred twenty dollars a week, yours to skim a little off the top — "
                    "the rest gone before you've finished counting it, into pockets you'll never see."),
         overlay=dict(big="$220/WEEK", sub="MOST NEVER TOUCHES YOUR HAND")),
    dict(id="t07", level=None, template="courtroom",
         narration=("A patrol car takes you in for nothing provable, a detective sliding Ded Grisha's "
                    "photo across a scarred metal table like it's a kindness, a favor between two "
                    "reasonable men. Give him up, easy, go home tonight. Your hands stay flat on the "
                    "table. Steady. That's the part that scares you — not the fear, the absence of it, "
                    "like some other version of you already decided the answer weeks ago."),
         overlay=None),
    dict(id="t08", level=None, template="backAlley",
         narration=("A man three weeks behind on the roof payment gets found in this same alley, and "
                    "tonight it's your hands doing the finding. Bone against brick, copper and wet "
                    "concrete in the air, a smell that doesn't wash out with soap no matter how long you "
                    "stand under the shower after. He pays double by morning. Nobody in the brigade "
                    "calls it a promotion. Everybody treats you like you got one anyway."),
         overlay=None),
    dict(id="t09", level=None, template="tattooCell",
         narration=("Ded Grisha starts the star on your left knee this time — the classic mark, the "
                    "one that means something specific and non-negotiable. You kneel to no one wearing "
                    "the uniform, not ever, not for a lighter sentence, not for a shorter stay, not for "
                    "anything. Stars on the chest come later, he says, for men who've earned the right "
                    "to be seen from further away."),
         overlay=None),

    # ---- LEVEL 03 · BRIGADIR ----
    dict(id="t10", level="LEVEL 03  ·  BRIGADIR", template="banyaSitDown",
         narration=("Steam again, the same wood-planked room, but this time you're the one Ded Grisha "
                    "vouches for at the low table. A brigade of your own — six men, three blocks, a "
                    "route that used to be Tolik's before Tolik stopped being useful to anyone. The "
                    "stove hisses the same way it did the night of the razor, cedar and salt again. You "
                    "notice. You say nothing about it."),
         overlay=None),
    dict(id="t11", level=None, template="countRoom",
         narration=("A banded stack under a bare bulb, fourteen thousand dollars this month across the "
                    "brigade, and eleven percent of every bill peels off before it's yours to call "
                    "anything. The obshchak, Ded Grisha calls it — the common fund, older than the "
                    "Soviet Union's fall, feeding lawyers and widows and men still doing time upstate. "
                    "It was never built to make you rich."),
         overlay=dict(big="$14,000/MONTH", sub="11% GONE BEFORE YOU COUNT IT")),
    dict(id="t12", level=None, template="revolvingDoor",
         narration=("A police captain takes an envelope through a service door that isn't on any "
                    "building plan, counts it without looking up, mentions — almost friendly — that "
                    "nine in ten businesses in this city still pay someone's roof, government report or "
                    "not. Zoloto's crew moved into the next district without asking anyone first. Gold "
                    "rings, gold watch, a laugh too loud for a man who's never done a day of real time."),
         overlay=None),
    dict(id="t13", level=None, template="tattooCell",
         narration=("An epaulette starts across your right shoulder, rank stitched into skin the way "
                    "soldiers stitch it into cloth — except this uniform answers to nobody's "
                    "government and never will. Grisha's hands have slowed this year, a tremor he hides "
                    "by keeping them working. Three more sessions, he says. Then people stop asking who "
                    "you belong to and start asking who belongs to you."),
         overlay=None),

    # ---- LEVEL 04 · AVTORITET ----
    dict(id="t14", level="LEVEL 04  ·  AVTORITET", template="boardroomNotes",
         narration=("A nightclub with your name nowhere on the deed and your money in every wall of it "
                    "— liquor licenses, payroll, an accountant paid well to ask nothing worth "
                    "answering. Avtoritet, the others call you now, a rank you didn't climb so much as "
                    "buy your way sideways into, no post, no needle, no vote from the circle. Real vory "
                    "built their names on the wood post and the wire. You built yours on spreadsheets."),
         overlay=None),
    dict(id="t15", level=None, template="signing",
         narration=("A stack of laundering paperwork, invoices for liquor that never arrived, a "
                    "signature attached to a business that technically doesn't exist either. Three "
                    "hundred eighty thousand a year moves through the club's books now, most of it "
                    "going right back out the other side, cleaner than it came in. Clean money still "
                    "smells like the alley it started in, if you're close enough to remember."),
         overlay=dict(big="$380,000/YEAR", sub="THROUGH YOUR HANDS, NEVER YOURS")),
    dict(id="t16", level=None, template="window",
         narration=("Katya finds the club by accident, recognizes your voice through an office door "
                    "before she sees your face behind the desk full of paperwork she was never meant to "
                    "read. She doesn't yell. That's worse. She asks one question — do you love any of "
                    "this — and you don't answer fast enough for the answer to be no. The city looks "
                    "smaller from up here than it did from the courtyard. It isn't. You are."),
         overlay=None),

    # ---- LEVEL 05 · SMOTRYASHCHIY (midpoint zone) ----
    dict(id="t17", level="LEVEL 05  ·  SMOTRYASHCHIY", template="commission",
         narration=("A round table of men older and colder than you, deciding who watches the whole "
                    "district now that the last smotryashchiy retired to a prison hospital bed. Ded "
                    "Grisha puts your name forward before you can stop him. Every route in six blocks "
                    "answers to you by morning — and every problem in six blocks is now yours to solve, "
                    "starting with whichever one Zoloto starts first."),
         overlay=None),
    dict(id="t18", level=None, template="wiretap", gap=1.4,
         narration=("A reel spins behind a wall of surveillance photos nobody in this room should know "
                    "about, and one photo has Ded Grisha's face circled in red marker that isn't yours "
                    "and never was. Somebody's been talking to the state — the one sin the code doesn't "
                    "forgive, doesn't negotiate, doesn't wait on. The stove-hiss quiet of the room "
                    "presses in on your ears. Zoloto isn't in this photo. Notice that."),
         overlay=None),
    dict(id="t19", level=None, template="backAlley",
         narration=("Ded Grisha never touched a wire in forty years of never touching one, and it "
                    "doesn't matter — the circle decides before dawn, and the circle doesn't ask you to "
                    "vote so much as watch. One old man's whole life folded into a single sentence, "
                    "delivered in the same alley you bled in as a patsan. Somewhere behind you, a stove "
                    "is hissing, or maybe that's just your own breath now."),
         overlay=None),
    dict(id="t20", level=None, template="emptyChair",
         narration=("The low table by the stove stays empty for a week — nobody brave enough to sit "
                    "where Ded Grisha always sat, not even to eat there. Zoloto finds you there anyway, "
                    "uninvited, cologne cutting through the cold, almost bored, like he's discussing "
                    "dust instead of a man who trained you. The star on your knee has never itched "
                    "more."),
         overlay=None,
         dialogue=dict(text="Somebody had to clean house.")),

    # ---- LEVEL 06 · VOR V ZAKONE ----
    dict(id="t21", level="LEVEL 06  ·  VOR V ZAKONE", template="koronatsiyaRite",
         narration=("A ring of vory older than the country's current borders, candlelight instead of "
                    "the stove's bare bulb, a folded prison blanket and a glass of tea in a metal "
                    "holder on the floor in front of you. The code survived a war of its own once — "
                    "thieves killing thieves over who'd broken faith with the state. Nobody says so out "
                    "loud tonight. Koronatsiya: no marriage, no state job, no property with your name "
                    "on a deed, ever again. You kneel. You say yes before the question finishes."),
         overlay=dict(big="$0", sub="EVERYTHING SURRENDERED TO THE FUND")),
    dict(id="t22", level=None, template="window",
         narration=("Katya's name isn't on any deed either, not anymore, not after tonight. You tell "
                    "her the truth for once — what koronatsiya actually costs, the rule about family "
                    "that isn't a metaphor and never was. She doesn't cry, doesn't raise her voice, "
                    "doesn't ask you to choose. She leaves the ring you never technically gave her on "
                    "the windowsill, small and gold and completely unwanted now, the last object in the "
                    "apartment that was ever really yours."),
         overlay=None),
    dict(id="t23", level=None, template="tattooCell",
         narration=("Ded Grisha isn't the one holding the needle anymore, obviously, and the man who "
                    "replaces him works faster, colder, less like a ritual and more like paperwork. A "
                    "cathedral dome goes on your chest tonight — one dome, one sentence, except you "
                    "haven't served one yet. Some men earn the mark first. You're wearing a debt on "
                    "credit the fund extends to almost no one else."),
         overlay=None),
    dict(id="t24", level=None, template="dinner",
         narration=("Valya sets a table for two that used to be three, doesn't ask where Katya went, "
                    "has mostly stopped asking things this year. A new stove, finally, paid for in cash "
                    "nobody questions out loud. She touches the star tattoo on your knee once, silent, "
                    "the way you'd touch a scar on someone you still love. An unmarked car idles outside "
                    "for exactly four minutes, then leaves. Neither of you mentions it."),
         overlay=None),

    # ---- LEVEL 07 · THE EXPORT ----
    dict(id="t25", level="LEVEL 07  ·  THE EXPORT", template="jet",
         narration=("A pakhan two levels up decides the network needs eyes on the other side of an "
                    "ocean, the same way one real vor got sent to Brighton Beach in 1992 because he'd "
                    "gotten too loud at home. You don't ask if it's an honor or a sentence. Both answers "
                    "cost the same ticket. Valya's new stove is the last warm thing you touch before the "
                    "jet."),
         overlay=dict(big="1 TICKET", sub="ONE WAY, NO RETURN DATE PRINTED")),
    dict(id="t26", level=None, template="brightonPier",
         narration=("Gulls over a boardwalk in a language you're still learning, salt air instead of "
                    "cedar smoke, a Ferris wheel turning gold against a skyline that isn't yours either "
                    "and never will be. The network here runs the same shakedowns in a different accent "
                    "— nail salons instead of kiosks, insurance fraud instead of krysha, but the same "
                    "eleven percent peeling off the top before it reaches home. Distance doesn't change "
                    "the math. It changes the view while you do it."),
         overlay=None),
    dict(id="t27", level=None, template="warRoom",
         narration=("Coordinates come in from three cities at once now, a network bigger than any "
                    "single obshchak was ever built to hold alone. Zoloto's name turns up circled in "
                    "red on somebody else's wall two years later — the same fund that raised you "
                    "disposing of its own, exactly the way it disposed of Ded Grisha. The star on your "
                    "knee still means what it meant on the courtyard swing. Everyone else was always "
                    "negotiable."),
         overlay=None),

    # ---- LEVEL 08 · PAKHAN ----
    dict(id="t28", level="LEVEL 08  ·  PAKHAN", template="pakhanApex", gap=0.7,
         narration=("The old pakhan dies quietly of a heart nobody bothered to check on, and the round "
                    "table doesn't debate long before your name gets said out loud. A samovar hisses on "
                    "the side table exactly like the banya stove used to. A wall map behind the desk, "
                    "pins in six cities. Sixty million dollars move through this office in a normal "
                    "year. None of it, technically, legally, actually, is yours."),
         overlay=dict(big="$60M OBSHCHAK", sub="STILL NOT YOURS TO SPEND")),
    dict(id="t29", level=None, template="countRoom",
         narration=("A courier counts bills into bands at 3 a.m. under the same kind of bare bulb that "
                    "lit the very first stack you ever watched get counted, twelve years and a whole "
                    "ocean removed from that first one. Ded Grisha used to say the fund outlives "
                    "everyone who feeds it. You believed him the way you believe gravity — abstractly, "
                    "until the day you're the one falling toward it."),
         overlay=None),
    dict(id="t30", level=None, template="emptyChair",
         narration=("Men wait outside your office now the way you once waited outside Ded Grisha's, "
                    "hoping for five minutes and a nod they may not get. Somewhere back at the start, in "
                    "the steam, a razor stopped cold against your knuckle, waiting on one answer. You "
                    "never talked — not that night, not once since, not for any price anyone's offered "
                    "— and that single unbroken silence is the only reason you're the one sitting here "
                    "instead of him."),
         overlay=None),
    dict(id="t31", level=None, template="tattooCell",
         narration=("A young patsan gets brought in for his first mark, some errand boy who reminds you "
                    "of a version of yourself from a courtyard eleven flights up and one ocean away. He "
                    "asks, nervous, if it hurts. You could tell him about the razor, the stove, the "
                    "star, the dome you wore before you'd earned it. Instead you say nothing, and the "
                    "needle starts anyway."),
         overlay=None,
         dialogue=dict(text="Everything after the first one hurts less. That's the problem.")),

    # ---- LOOP CLOSE — one door left open, not cyclical ----
    dict(id="t32", level=None, template="window",
         narration=("An envelope arrives with no return address, postmarked from the old district, one "
                    "photograph inside — a girl, maybe ten, Katya's exact chin, a name written on the "
                    "back you don't recognize: Sasha. You don't call the number scrawled beneath it. You "
                    "don't burn the photo either. It goes in the drawer with everything else the code "
                    "decided wasn't yours to keep, and the drawer, for now, stays shut."),
         overlay=None),
]
