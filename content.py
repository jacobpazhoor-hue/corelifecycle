#!/usr/bin/env python3
"""POV: You're the World's First Trillionaire — POV doodle build, ~12 min, template-driven.
Grounded in docs/research/trillionaire.md. SCENARIO format: the levels are escalating MONEY
milestones, not job ranks ($0 -> $1M -> $100M -> $1B -> $100B -> $1T -> you can't sell it -> the
appetite above money). Second-person present-tense POV: the viewer IS a broke kid whose card
declines for a $4.50 coffee and who climbs, milestone by milestone, to become the world's first
trillionaire — and learns that a trillion-dollar fortune is not money you can spend but a stock
position that only exists while you never touch it; that above even the richest human sits an
appetite that prices you and never learns your name; and that the one call worth answering is the
one the number can't buy back.

NEAR-FUTURE / PROJECTED: no trillionaire exists yet (2026); Oxfam projects the first in the ~2030s.
The wealth mechanics and the two big share-numbers are REAL and VERIFIED (see research doc):
  * a million seconds = 12 days; a billion = 31.7 years; a TRILLION seconds = ~31,700 years.
  * spend $1,000,000 a DAY since the birth of Christ and today you'd have spent ~$740B — still not $1T.
  * mega-fortunes are unrealized STOCK, not cash; selling a large stake collapses the price ("buy,
    borrow, die" — you borrow against shares, realize no taxable income); Musk's wealth grew >$1M/min
    (Oxfam 2025); five richest men $405B -> $869B, 2020-2024, while ~5B people got poorer.

SPINE (gold $ escalation — the money climbs while what you can actually SPEND falls to nothing):
$0 (card declined) -> $1M (on paper) -> $100M (IPO) -> $1B (the cost) -> $100B (you move markets) ->
$1T (the world's first) -> YOU CAN'T SELL IT (the number owns you) -> THE APPETITE (demand, above money).

STORY: mentor HALVORSEN (first investor; the warning "the number grows faster than you can stay
yourself"; the one who hands you the billion-dollar deal that costs you Sam); co-founder + best friend
SAM (built it with you; the MIDPOINT betrayal at t13 — you gut her half + close the town's plant to
cross into billionaire; "I'm sad you're not even sorry"); rival billionaire ROURKE (the taunt "a
billion buys people; you'll trade up"); the recurring fixer KEELE, a family-office banker (shared-
universe character planted t15, dialogue t22, left UNRESOLVED — "I already manage whoever holds it
next"). Sensory anchor motif: DANI'S 19-SECOND VOICEMAIL — your little sister's laugh, "eat
something, call me back" — the one recording you never delete: saved t02, replayed t16, she calls
LIVE at the trillion moment and you let it ring t18, replayed one last time at the loop-close t25.
Secondary texture: burnt $4.50 gas-station coffee (t01/t04/t12/t25) — the one thing the money never
upgrades about you. Master open loop: the FLASH-FORWARD cold open (t00 — the glass room, the trillion
crossing, Dani calling live, the hand that turns you away) pays off at t18; the through-line "you want
the number; you don't know it wants you back" pays off t20-t27.

PROMISE->PAYOFF LEDGER:
  * t00 cold open (glass room, trillion crosses, Dani calls LIVE, you let it ring)  -> t18 (the same morning, from inside)
  * t01 want: "get us both out" + the $4.50 declined coffee                          -> t20/t24 (you can't sell it / can't buy that Tuesday back); t26 (a new kid, same want)
  * anchor: Dani's 19-second voicemail                                               -> t02 saved, t16 replayed, t18 she calls live, t25 replayed last
  * t02 mentor Halvorsen's warning "faster than you can stay yourself"               -> t13 (you lose the race — Sam)
  * t02/t05 co-founder Sam                                                            -> t13 (the midpoint betrayal)
  * t09 rival Rourke's taunt "a billion buys people; you'll trade up"                -> t10-t13 (you do exactly that)
  * t10 the paper mechanic (net worth isn't cash)                                     -> t15/t20/t21 (buy-borrow-die; you can't sell it; it's a claim not a vault)
  * t15 the fixer Keele                                                               -> t22 (his line); left UNRESOLVED (he already manages whoever's next) = universe thread
  * UNRESOLVED universe thread (deliberate): KEELE, the family-office fixer           -> already works for the next holder; never leaves the money (open)

Templates: STARTUP pack (garageStart/startupGrow/serverScale/ipoBell) + FINANCE (tradingFloor/pnlWall)
+ DYNASTY (galaBallroom/yachtDeck/familyVault) + generic (podiumScene) + universal (warRoom/deskSilhouette/
desk/window/dinner/boardroomHead/signing/layoffs/emptyChair/atrium/jet/lobby). NO new pack needed
(keeps the local render safe). warRoom is reused twice on purpose as the master-loop anchor (t00 cold
open / t17 the trillion) — the glass room the whole life is built to reach. No two adjacent scenes
share a template. STRUCTURAL VARIATION vs last 2 (special_forces = mid-action breach, rise-into-rot,
cyclical; mexican_cartel = AFTERMATH cold open, rise-then-fall, cyclical): this cold open is a
FLASH-FORWARD (the future moment, then rewind); act-2 shape is RISE-THEN-FALL (you get the number and
it turns out to be a cage); ending is cyclical (a new kid, same declined card) with one door left open
(Keele / the appetite that never sleeps).
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — flash-forward (the master loop): the trillion, and the call you let ring ----
    dict(id="t00", level=None, template="warRoom", gap=0.7,
         narration=("A glass room at the top of the world, every screen on the wall running the same number "
                    "upward. Finance ministers wait on your nod. The number crosses one trillion dollars, and "
                    "the room stands and applauds a thing it believes is you. Your phone burns in your pocket. "
                    "DANI. Your little sister, calling for the first time in three years — now, this second. A "
                    "hand settles on your shoulder and turns you toward the podium. Let it ring, the hand "
                    "means. So you let it ring. You will spend what's left of your life wishing you hadn't."),
         overlay=dict(big="$1 TRILLION", sub="THE WORLD'S FIRST · AND YOU LET IT RING")),

    # ---- LEVEL 1 — $0 (the card declines) ----
    dict(id="t01", level="LEVEL 01  ·  $0  (NOTHING)", template="deskSilhouette",
         narration=("Rewind eleven years. A gas station at one in the morning, and your card declines for a "
                    "four-dollar-fifty coffee. The clerk doesn't look up. You put the cup back on the warmer. "
                    "Out in the car your sister Dani sleeps against the window — nineteen, broke because you're "
                    "broke, and on Tuesday she gave you her last forty dollars and swore she didn't need it. On "
                    "the seat sits a cracked laptop with an idea on it and eleven dollars to your name. Your "
                    "whole prayer is four words wide: get us both out."),
         overlay=dict(big="$0", sub="CARD DECLINED · ONE IDEA ON A CRACKED LAPTOP")),
    dict(id="t02", level=None, template="garageStart",
         narration=("You build it in a rented garage that smells of cut grass and hot solder, shoulder to "
                    "shoulder with Sam — your best friend since ninth grade, who writes in one night what takes "
                    "you a week. No money in it yet, only instant coffee and a space heater and the two of you. "
                    "The day the thing goes live, Dani leaves a voicemail: nineteen seconds of her laughing, "
                    "telling you she saw it, telling you to eat something, telling you to call her back. You "
                    "save it. You will never delete it. Remember that number. Nineteen seconds."),
         overlay=None),
    dict(id="t03", level=None, template="desk",
         narration=("Six weeks in, it catches — not slowly, like a match dropped in dry grass. A man named "
                    "Halvorsen, who has funded nine companies and buried three, drives out to the garage in a "
                    "car worth more than the building. On its hood he writes you a check for two hundred fifty "
                    "thousand dollars — the first real money your family has touched in three generations. Your "
                    "hands don't shake taking it. That should worry you more than it does. Then he tells you "
                    "the one thing that turns out to be true."),
         overlay=None,
         dialogue=dict(text="The number will grow faster than you can stay yourself. Most men lose that race.")),

    # ---- LEVEL 2 — $1 MILLION (on paper) ----
    dict(id="t04", level="LEVEL 02  ·  $1 MILLION", template="startupGrow",
         narration=("A year on, the office has walls and a door and eleven people who say your first name like "
                    "it's worth something. On paper you're a millionaire. But you've never held a million "
                    "dollars — it isn't cash in a bank, it's a line on a cap table, a promise strangers made "
                    "about your future. Still, a million is a million. You buy Dani a used car so her card "
                    "never declines the way yours did. And you keep drinking the same burnt gas-station coffee, "
                    "because some animal part of you is afraid of what you'll become the day you stop."),
         overlay=dict(big="$1 MILLION", sub="NOT CASH · A PROMISE, ON PAPER, ABOUT YOUR FUTURE")),
    dict(id="t05", level=None, template="serverScale",
         narration=("Therefore it goes vertical. Rented servers become owned servers become buildings full of "
                    "them, humming like a held breath. Users double, double again, then stop being a number you "
                    "can picture. A competitor named Rourke — older, three exits behind him — offers forty "
                    "million to swallow you whole, and you say no, and Sam stares at you like you've cracked. "
                    "But Halvorsen's gravity has you now. The number pulls, and you lean into the pull, and you "
                    "tell yourself the whole time that you're the one steering."),
         overlay=None),
    dict(id="t06", level=None, template="tradingFloor",
         narration=("The money stops behaving like money and starts behaving like weather. On the best week of "
                    "the run your net worth climbs faster than you could spend in a lifetime — the richest men "
                    "alive have grown by more than a million dollars a minute, and now you understand how, "
                    "because it isn't work, it's a number other people keep voting up. Sam still packs a lunch. "
                    "You still taste that burnt coffee. Neither of those small facts survives what's coming."),
         overlay=dict(big="$1M / MINUTE", sub="AT THE TOP, WEALTH GROWS FASTER THAN YOU CAN SPEND IT")),

    # ---- LEVEL 3 — $100 MILLION (the IPO) ----
    dict(id="t07", level="LEVEL 03  ·  $100 MILLION", template="ipoBell", gap=0.7,
         narration=("You take it public on a cold Tuesday, ring a bell on a balcony above a trading floor, and "
                    "before the bell stops ringing the market says you're worth a hundred million dollars. A "
                    "hundred million. The kid who put the coffee back on the warmer. But here is the part no one "
                    "warns you about: from this morning on, your worth is set every second by strangers who "
                    "will never meet you. You don't own the number. You are exposed to it, the way a coastline "
                    "is exposed to weather."),
         overlay=dict(big="$100 MILLION", sub="STRANGERS SET YOUR WORTH NOW · EVERY SECOND, ALL DAY")),
    dict(id="t08", level=None, template="window",
         narration=("A hundred million rewrites every room you enter. People laugh a half-second early at your "
                    "jokes. Old friends call with an ask folded inside the hello. Money buys the good table. "
                    "Money buys the yes. Money buys a version of you that everyone suddenly likes — and buries "
                    "the version Dani knew. She calls less. When you talk, she asks how you are and you answer "
                    "with a number, and the line goes quiet, because a number was never an answer, and you've "
                    "forgotten there was a difference."),
         overlay=None),
    dict(id="t09", level=None, template="galaBallroom",
         narration=("They put you on a stage at a gala under a chandelier the size of your first apartment, and "
                    "every hand in the room wants five minutes. Rourke finds you by the bar, warm as a knife, "
                    "three exits and one divorce ahead of you on this road. He lifts his glass to your hundred "
                    "million like it's pocket change — because to him it is — and tells you the thing that "
                    "keeps you up for a week."),
         overlay=None,
         dialogue=dict(text="A hundred million buys a nice life, kid. A billion buys people. You'll trade up. They always do.")),

    # ---- LEVEL 4 — $1 BILLION (the cost) + MIDPOINT betrayal ----
    dict(id="t10", level="LEVEL 04  ·  $1 BILLION", template="dinner",
         narration=("Halvorsen takes you to a room with no menu and no prices, and lays out the deal that turns "
                    "a hundred million into a billion: a merger, a restructuring, a clean and beautiful "
                    "machine. There is one cost, and he names it the way rich men name the expensive part — "
                    "lightly. You gut Sam's half of the company. You close the plant in the town that raised "
                    "you and put four hundred people, who know your mother's name, out of work. He lets it sit. "
                    "Then he tells you what a billion dollars actually is."),
         overlay=dict(big="$1 BILLION", sub="THE PRICE ISN'T MONEY · THE PRICE IS WHO YOU CLOSE"),
         dialogue=dict(text="The billion isn't your reward for building it. It's your reward for being willing to.")),
    dict(id="t11", level=None, template="boardroomHead",
         narration=("You sit at the head of a table and the machine explains itself to you in graphs. Every "
                    "arrow says the same thing: sign, and you become the youngest billionaire on the continent; "
                    "refuse, and Rourke buys the whole thing at a discount and closes the same plant anyway, and "
                    "you get nothing and Sam still loses. That's the trap they build for you. Not a temptation — "
                    "a math problem with one clean answer, and every clean answer in this life costs a person."),
         overlay=None),
    dict(id="t12", level=None, template="signing", gap=1.4,
         narration=("So it comes down to a single page and a pen at two in the morning, alone, the office "
                    "empty, the burnt coffee gone cold at your elbow. Sam doesn't know yet. Dani doesn't know "
                    "yet. Your own hand is steady over the line — steadier than it was at the gas station, "
                    "steadier than at the check on the car hood. For eleven years you told yourself you'd never "
                    "become the man who could do this. You sign anyway."),
         overlay=None),
    dict(id="t13", level=None, template="layoffs", gap=0.7,
         narration=("Sam finds out from a press release. She clears her desk into one cardboard box, and at the "
                    "door she doesn't shout — she just holds you in a long, level look, the way you'd hold a "
                    "stranger standing too close. Four hundred people lose their jobs by Friday. And the thing "
                    "lands, cold and total: you didn't buy your way out of becoming the man you feared. You "
                    "paid a billion dollars for the privilege of being him."),
         overlay=dict(big="THE COST", sub="YOU DIDN'T ESCAPE HIM · YOU PAID TO BECOME HIM"),
         dialogue=dict(text="I'm not sad you did it. I'm sad you're not even sorry.")),

    # ---- LEVEL 5 — $100 BILLION (you move markets) ----
    dict(id="t14", level="LEVEL 05  ·  $100 BILLION", template="pnlWall",
         narration=("After that the climb is easy, because nothing's holding you back anymore — not a person, "
                    "not a rule, not the animal that used to flinch. A hundred billion dollars. You don't run a "
                    "company now; you run a weather system. A sentence from you moves a currency. A rumor that "
                    "you're unhappy erases the savings of people you'll never meet. You wanted the number so it "
                    "would stop being able to hurt you. It can hurt everyone but you now — and it still isn't "
                    "enough."),
         overlay=dict(big="$100 BILLION", sub="ONE SENTENCE FROM YOU MOVES A CURRENCY")),
    dict(id="t15", level=None, template="familyVault",
         narration=("You never sell a share, because selling is admitting the number could end. A soft man "
                    "named Keele runs your family office — a vault of deed boxes and holding companies, a mind "
                    "like a cold clean ledger. He shows you the trick the very rich all know: you don't spend "
                    "your money, you borrow against it. The bank hands you billions in cash, you never earn a "
                    "taxable dollar, and you never touch the stock. You are worth a hundred billion and you "
                    "have, in the way that word used to mean, nothing you can spend. Only a number you must "
                    "never move."),
         overlay=dict(big="YOU NEVER SELL", sub="YOU BORROW AGAINST IT · THE STOCK CAN NEVER MOVE")),
    dict(id="t16", level=None, template="yachtDeck",
         narration=("On a deck the length of a city block, in the middle of an ocean, ringed by people paid to "
                    "be delighted, you take out your phone and play the only recording you never delete. "
                    "Nineteen seconds. Dani laughing. Telling you to eat something. Telling you to call her "
                    "back. You didn't call her back — not that week, not the next year, not once the number got "
                    "big enough to answer for you. The sea is enormous and quiet. You are the richest passenger "
                    "on it, and the loneliest, and those turn out to be the same fact."),
         overlay=None),

    # ---- LEVEL 6 — $1 TRILLION (the world's first) + cold-open payoff ----
    dict(id="t17", level="LEVEL 06  ·  $1 TRILLION", template="warRoom", gap=0.7,
         narration=("Then one ordinary morning the number crosses a line no human being has ever crossed. One "
                    "trillion dollars. Here is what the word hides: spend a million dollars a day, every single "
                    "day, since the birth of Christ, and today you would still not have spent your first "
                    "trillion. You are worth more than most nations on the map. You are the world's first "
                    "trillionaire — and the phrase means nothing in your mouth, because the number stopped "
                    "being about you somewhere back around the plant you closed."),
         overlay=dict(big="$1 TRILLION", sub="A MILLION A DAY SINCE CHRIST · STILL NOT A TRILLION")),
    dict(id="t18", level=None, template="podiumScene", gap=0.7,
         narration=("The world puts you behind a podium and applauds a thing it believes is you — and this is "
                    "the morning from the very start, the glass room, the climbing screens. Your phone lights "
                    "in your pocket. DANI. Live. The first time in three years, right now. A hand lands on your "
                    "shoulder and turns you to the microphones. Let it ring, the hand means. So you let it "
                    "ring. An hour later there's no voicemail this time. She didn't leave one. She was calling "
                    "to say something out loud, and you were being applauded, and now you'll never know what."),
         overlay=dict(big="SHE CALLED", sub="FIRST TIME IN 3 YEARS · YOU LET IT RING")),
    dict(id="t19", level=None, template="emptyChair",
         narration=("Count it out, because scale is the whole trick they never let you hold. A million seconds "
                    "is twelve days. A billion seconds is thirty-two years. A trillion seconds is thirty-one "
                    "thousand years — before farming, before writing, before the wheel. That is the distance "
                    "you crossed. And somewhere in it you stopped being a person and became a position: a chair "
                    "the market keeps warm, a name on the org chart of the whole world that anyone could fill "
                    "and no one would miss for a single day."),
         overlay=dict(big="31,700 YEARS", sub="A TRILLION SECONDS · YOU BECAME A POSITION, NOT A PERSON")),

    # ---- LEVEL 7 — YOU CAN'T SELL IT (the number owns you) ----
    dict(id="t20", level="LEVEL 07  ·  YOU CAN'T SELL IT", template="window",
         narration=("So test it. Try to be free of it. Try to sell — cash it in, walk away, buy a small house "
                    "near Dani and a decent cup of coffee. You can't. Sell a tenth of your stock and the price "
                    "buckles under its own weight; the trillion evaporates faster than you can sign the order, "
                    "and you take the whole market down on your way out the door. The money was never a door "
                    "you could walk through. It's a wall you built so high you can't climb back over it."),
         overlay=dict(big="YOU CAN'T SELL IT", sub="CASH OUT AND THE NUMBER DIES IN YOUR HAND")),
    dict(id="t21", level=None, template="pnlWall",
         narration=("Because the trillion was never in a vault. It's a claim — a bet millions of strangers make "
                    "every second the market breathes, that tomorrow you'll be worth even more. The instant "
                    "they stop believing, the number dies, and you with it. Five men doubled their fortunes in "
                    "four years while five billion people got poorer, and not one of them can spend the score "
                    "at face value. You don't own the wealth. You are the collateral the wealth is borrowed "
                    "against. You are the thing that must never, ever flinch."),
         overlay=dict(big="A CLAIM, NOT A VAULT", sub="YOU'RE THE COLLATERAL · YOU MUST NEVER FLINCH")),
    dict(id="t22", level=None, template="familyVault",
         narration=("Keele comes to see you the way he came to see the two men before you — the ones whose "
                    "portraits he now manages for their heirs. He never raises his voice. He lays your holdings "
                    "out like a hand of cards and tells you the true shape of the thing, and then he says the "
                    "sentence that has been true since the gas station, since the garage, since the nineteen "
                    "seconds you never answered."),
         overlay=None,
         dialogue=dict(text="You were never the owner, sir. You're the custodian. And I already manage whoever holds it next.")),

    # ---- LEVEL 8 — THE APPETITE (above money) + LOOP CLOSE ----
    dict(id="t23", level="LEVEL 08  ·  THE APPETITE", template="atrium", gap=0.7,
         narration=("So who is above the trillionaire? Climb one more floor and there's no man there — only the "
                    "appetite. A billion small wants in a billion ordinary people: the next thing, the newer "
                    "thing, the yes at the checkout. That hunger built you, priced you, and it will price "
                    "whoever comes after, and it does not know your name and never once needed it. You spent "
                    "your life climbing toward the center of the world. There is no center. There is only "
                    "demand, breathing in the dark, hungry again by morning."),
         overlay=dict(big="THE APPETITE", sub="NO ONE'S ABOVE YOU · ONLY THE HUNGER THAT MADE YOU")),
    dict(id="t24", level=None, template="jet",
         narration=("You have the plane that goes anywhere and nowhere to go. You have a house on every coast "
                    "and you sleep in a different one each week for reasons your security won't explain. You "
                    "can buy an island, an election, a man's silence, a company before lunch. You can buy "
                    "anything on earth except the one Tuesday when Dani gave you forty dollars and meant it, and "
                    "the one call you let ring, and a single hour of being a person that a number couldn't "
                    "answer for."),
         overlay=None),
    dict(id="t25", level=None, template="deskSilhouette",
         narration=("So here you are. One in the morning, alone at a desk above a city you own most of, a cup "
                    "of gas-station coffee gone cold because you sent the good stuff back. You take out the "
                    "phone that can move a currency and play the only thing on it that ever mattered. Nineteen "
                    "seconds. Dani, laughing, telling you to eat something, telling you to call her back. Play "
                    "it again. That clip is the whole trillion. It's the only part you actually got to keep — "
                    "and you can't spend it, and you'd give the rest away to have answered it in time."),
         overlay=dict(big="19 SECONDS", sub="THE ONLY PART OF THE TRILLION YOU GOT TO KEEP")),
    dict(id="t26", level=None, template="lobby",
         narration=("A thousand miles away, in a town like the one you closed, a kid of nineteen sits in a car "
                    "outside a gas station because a card just declined for a four-dollar coffee. There's a "
                    "cracked laptop on the seat and an idea on it and a sister asleep against the window. The "
                    "kid's whole prayer is four words wide: get us both out. Somewhere a man like Halvorsen is "
                    "already driving out to find them. The road out runs straight to the horizon. It always "
                    "did. It was never a way out."),
         overlay=dict(big="A NEW KID · SAME CAR", sub="THE ROAD OUT WAS NEVER A WAY OUT")),
    dict(id="t27", level=None, template="emptyChair",
         narration=("And the number keeps climbing without you, the way it always would. Somewhere a market "
                    "opens and prices a chair you used to fill. Somewhere a phone rings and no one answers in "
                    "time. The hunger that made you is hungry again this morning, the same as every morning, "
                    "and it will make someone new and spend them and never learn their name — and it will "
                    "never, not once, learn yours. You wanted the number. You got it. It just never wanted you "
                    "back."),
         overlay=dict(big="IT NEVER WANTED YOU BACK", sub="THE HUNGER IS AWAKE AGAIN · SAME AS EVERY MORNING")),
]
