#!/usr/bin/env python3
"""Your Life as Startup Employee #1 at Every Level (Unicorn or $0) — POV doodle build, ~12.5 min.
Grounded in docs/research/startup_unicorn.md. RANK format: this is the COMPANY's valuation ladder, not
the founder's (founder.md already told that story) — the protagonist is a composite EARLY EMPLOYEE
(hire #1, engineer) riding common stock/options through real, verified funding stages: pre-seed -> seed
-> Series A -> Series B/C -> a down round -> unicorn -> a tender offer -> IPO -> the lock-up. Second-
person present-tense POV. The company, the specific dollar path through each round, and every named
person are a FICTIONAL COMPOSITE; the STAGE VALUATIONS reuse founder.md's verified Carta medians
(pre-seed ~$6M, seed ~$15M, Series A ~$78M), the EQUITY-BY-HIRE-ORDER curve and dilution-per-round %s
are real (Carta 2024-2025 hire-order data; founder.md dilution data), and the MECHANICS — vesting
cliff, 409A, liquidation preference, down-round cram-down, tender offers, ISO/AMT, 180-day lock-up,
lock-up-expiry price pressure — are all real, verified, and documented (see research doc; flags there).

REAL/VERIFIED mechanics woven in: hire-#1 median initial grant 1.5% of fully diluted shares, dropping
steeply by hire order [VERIFIED, Carta "State of Startup Compensation" 2024-2025]; 4-year vest/1-year
cliff [VERIFIED, industry standard]; per-round dilution ~19.5% seed / 18% Series A / 14% Series B / 10%
Series C [VERIFIED, Carta, reused from founder.md]; the 1x liquidation preference that pays new
investors before any common stockholder in a sale [VERIFIED, standard VC term]; down-round cram-downs
and 409A strike-price resets [VERIFIED, standard mechanics]; company-run tender offers letting
employees sell a capped slice of VESTED shares for cash before an IPO [VERIFIED, real, common practice
at late-stage unicorns]; the ISO/AMT "phantom gain" tax bomb on exercised-and-held options [VERIFIED,
Secfi/NCEO/Kitces]; the standard 180-day post-IPO lock-up and the well-documented selling-pressure/
price-drop pattern when lock-ups expire [VERIFIED]; and the ~75% VC-backed-startup failure rate plus
the ~3.2% odds a seed-stage company ever exits for $100M+ [VERIFIED, Shikhar Ghosh/HBS, widely cited].

SPINE (company valuation = the big number; the employee's OWN stake = the sub-caption, and the two
numbers deliberately do NOT move together): $6,000,000 (pre-seed, hire #1's 1.5%) -> $15,000,000 (seed)
-> 3.2% (the odds stat, minute-3 spectacle) -> $78,000,000 (Series A, "the paper million") ->
$400,000,000 (Series B/C, growth-at-all-costs) -> [RUMORED $1,000,000,000 -> the down round, $420M,
your stake now $0 on paper — the reversal] -> $1,000,000,000+ (the real unicorn crossing, recovered) ->
$628,000 (the tender offer — first REAL cash) -> $8,000,000,000 (IPO market cap, still locked) ->
180 DAYS (the lock-up) -> $19,000,000 (the real, after-tax number, the apex).

STORY: REYNA — your younger sister, whose exact $2,140 tuition bill on the fridge (t02) is the concrete
want; you pay it off in person with the tender-offer wire at t24, an echo/answer to t02. PRIYA — the
founder who hires you in the garage (t01), whose lottery-ticket warning is this episode's mentor
dialogue (t04); she is also, later, the person who signs off on the post-IPO layoffs from a boardroom
instead of a garage (t28 dialogue) — the mentor becomes the system. MARCUS — hire #2, introduced
casually at t06, delivers the midpoint taunt the morning the down round prints (t19 dialogue), then
exits with better math and less history (t20) — no further resolution; he doesn't reappear, which is
deliberate (not every rival gets a bow). SENSORY ANCHOR: the folded equity/grant letter — crisp ink
smell at t01/t04, checked and re-folded at level-ups (t09, t13), the paper that means nothing the
morning of the down round (t19), and a brand-new copy you fold for someone else at t30. Body-dread motif
(fact, not feeling): "your hands don't shake" — first at t04 (signing, unremarkable), worst at t19 (the
reversal, signing an acknowledgment that your stake is worth $0) and t15 (reading a layoff list aloud).
Master open loop: the COLD OPEN (t00 — the aftermath of a layoff round, two folded papers in your hand,
one a severance list, one your own equity letter) is deliberately unplaced in time; it resolves at t28
as the POST-IPO "cost discipline" round, ordered by Priya from a boardroom, the same two folded papers
back in your hand — full circle on the papers, not on the room.

PROMISE -> PAYOFF LEDGER:
  * t00 cold-open (two folded papers: a severance list + your own equity letter, unplaced in time) -> t28 (resolved: it's the post-IPO layoff round; same two papers, same hand)
  * t01 the folded grant letter, ink-fresh, 1.5% of $6M                    -> t04 (first fold, the crease that starts) -> t09/t13 (re-checked at each level-up) -> t19 (means nothing) -> t30 (a new copy, someone else's now)
  * t02 Reyna's $2,140 tuition bill on the fridge (the concrete want)      -> t12 (paper vs. real money, told to her directly) -> t24 (paid off in person with real, wired cash)
  * PRIYA planted (t01) + her warning dialogue (t04)                      -> t11 (her tell in board meetings) -> t28 dialogue (she orders the layoffs; the mentor becomes the system) -> t31 (texting about "a new garage," unresolved)
  * MARCUS planted (t06)                                                   -> t19 dialogue (his midpoint taunt, the down round) -> t20 (exits; UNRESOLVED — no further appearance, deliberate)
  * t07 share beat: the real 3.2%-odds statistic                          -> paid immediately; sets the stakes under everything that follows
  * t19 share beat + REVERSAL: the real liquidation-preference mechanic    -> paid immediately; drives t20-t22
  * t27/t29 share beat: the real ISO/AMT tax bomb + lock-up price pressure -> paid immediately; produces the final, real, after-tax number
  * t30 dialogue (you, echoing Priya's exact t04 line to a new hire)       -> t31 (the loop's real answer: the garage keeps finding someone new)

Templates: no new SVG art — composes ENTIRELY from existing packs (see docs/TEMPLATES.md): STARTUP's
garageStart / startupGrow / serverScale / ipoBell, HEDGEFUND's tradingFloor / pnlWall, GEN's
lectureHallScene / podiumScene, and universal deskSilhouette / desk / deskClose / fileWall / tower /
window / signing / boardroomNotes / boardroomHead / atrium / dinner / layoffs / revolvingDoor / warRoom
/ emptyChair / lobby / jet. No two adjacent scenes share a template. STRUCTURAL VARIATION vs the last 2
(black_market_surgeon = flash-forward cold open / fall-then-rise act two / role-mirroring loop close;
north_korea = mid-action cold open / straight rise / literal image-repeat loop close): this cold open is
an AFTERMATH (the wreckage first, unplaced in time, cut before it's explained); act two is a genuine
RISE-THEN-FALL-THEN-RISE (zero to $3M paper, crashed to $0 by a down round, rebuilt to $19M real); the
ending is TORCH-PASSING (you become Priya, a new hire gets the folded letter) plus a deliberately
SEPARATE literal-detail payoff (the two folded papers from t00 resolve at t28, not at the very end) —
neither a place-echo nor a single repeated image, on purpose.
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — the aftermath, unplaced in time (the master loop) ----
    dict(id="t00", level=None, template="layoffs", gap=0.7, rate="-10%",
         narration=("Nine desks sit empty this morning, keyboards still plugged in, one coffee mug "
                    "never emptied. Two folded papers sit in your hand: a severance list you wrote the "
                    "names on yourself, and a grant letter with your own name on it, worth more than "
                    "the whole floor combined. A phone keeps ringing somewhere down the hall. Nobody "
                    "answers it. You don't know yet how you got here. You will."),
         overlay=None),

    # ---- LEVEL 01 · THE GARAGE HIRE — Priya, the offer, the first fold ----
    dict(id="t01", level="LEVEL 01  ·  THE GARAGE HIRE", template="garageStart",
         narration=("Rewind fourteen months. None of that exists yet. A garage on a dead-end street "
                    "smells like solder and old coffee, and Priya — the founder, twenty-nine, already "
                    "on her second company — slides one sheet across a folding table. Hire number one. "
                    "One and a half percent of a company worth six million dollars today. Zero dollars "
                    "if it's worth nothing in four years. Sign here."),
         overlay=dict(big="$6,000,000", sub="THE COMPANY'S WORTH — YOUR SLICE: 1.5%")),
    dict(id="t02", level=None, template="deskSilhouette",
         narration=("Your one-bedroom holds a fridge with exactly one thing taped to it: your sister "
                    "Reyna's tuition bill, two thousand one hundred forty dollars, due the first. The "
                    "radiator clanks through the wall like something arguing with itself. You've never "
                    "signed anything that mattered before tonight. Don't think about the safe job "
                    "you're about to quit. Think about the number on the fridge instead."),
         overlay=None),
    dict(id="t03", level=None, template="desk",
         narration=("Your current job pays steady, unglamorous money — enough for Reyna's tuition, "
                    "never more than survival dressed up as a paycheck. But the offer letter sits open "
                    "on your laptop, and it says a word your salary never has: OWNERSHIP. Your manager "
                    "asks if you're sure. You've never been less sure of anything and more certain "
                    "you're doing it anyway. Two weeks' notice, typed in nine minutes."),
         overlay=None),
    dict(id="t04", level=None, template="signing",
         narration=("Priya's pen is the same one she used to sign her last company's death certificate, "
                    "she mentions, like a joke. It isn't. The equity letter creases exactly once as you "
                    "fold it into your pocket — the fold you'll run a thumb over for years without "
                    "meaning to. Ink smell still on the paper. Your hand doesn't shake signing it. "
                    "That's the part that surprises you."),
         overlay=None,
         dialogue=dict(text="Sign here. It's not a job. It's a lottery ticket with a vesting schedule — and the drawing takes four years.")),

    # ---- LEVEL 02 · THE SEED CREW — dilution, Marcus, the 3.2% spectacle ----
    dict(id="t05", level="LEVEL 02  ·  THE SEED CREW", template="startupGrow",
         narration=("But five months in, five desks, a seed round closes at fifteen million dollars "
                    "post-money. Your slice dilutes to just over one percent overnight — a number that "
                    "sounds smaller and somehow means more. Whiteboards multiply faster than chairs. "
                    "Someone orders an espresso machine nobody asked for. Growth first, Priya keeps "
                    "saying, everything else later. You haven't learned yet what later costs."),
         overlay=dict(big="$15,000,000", sub="THE SEED ROUND — YOUR SLICE DILUTES TO ~1.2%")),
    dict(id="t06", level=None, template="fileWall",
         narration=("A cap table lands in your inbox for the first time — a spreadsheet listing exactly "
                    "who owns what, and in what order they get paid. Common stock, yours, sits at the "
                    "bottom of the page. Preferred stock, the investors', sits at the top, first in line "
                    "if anything ever goes wrong. Marcus, hire number two, leans over your shoulder and "
                    "whistles low at the gap between them."),
         overlay=None),
    dict(id="t07", level=None, template="podiumScene",
         narration=("Priya calls an all-hands, stands on a milk crate because the company still can't "
                    "afford a stage. A statistic flashes behind her: a seed-stage startup has roughly a "
                    "three-point-two percent chance of ever exiting for a hundred million dollars or "
                    "more. She doesn't flinch reading it out loud. Therefore the room goes quiet, then "
                    "loud, then quiet again — the sound of thirty people deciding to stay anyway."),
         overlay=dict(big="3.2%", sub="THE ODDS A SEED-STAGE STARTUP EVER EXITS FOR $100M+")),
    dict(id="t08", level=None, template="deskClose",
         narration=("The term sheet for a bigger round runs eleven pages. You read page one. You sign "
                    "page eleven. Somewhere in the middle sits a clause about liquidation preferences "
                    "you don't fully understand and don't stop to ask about — the first time you trade "
                    "understanding for speed. Your hand doesn't hesitate on the signature line. That's "
                    "the part that will bother you later. Not now."),
         overlay=None),

    # ---- LEVEL 03 · THE PAPER MILLION — Series A, the climb, Reyna's math ----
    dict(id="t09", level="LEVEL 03  ·  THE PAPER MILLION", template="tower",
         narration=("Series A closes at seventy-eight million dollars, and somebody frames the term "
                    "sheet like a diploma. Your one percent prices out near seven hundred seventy "
                    "thousand dollars this afternoon — on paper, the only place it currently exists. "
                    "The tower you're climbing gets taller. The ground underneath it gets further away, "
                    "and considerably less solid, every single month."),
         overlay=dict(big="$78,000,000", sub="SERIES A — YOUR SLICE: ~1% ≈ $770,000 (ON PAPER)")),
    dict(id="t10", level=None, template="serverScale",
         narration=("New hires arrive weekly now — twenty, then forty, then sixty — each one diluting "
                    "the slice you were promised a little further down. Server racks hum louder than "
                    "the office ever does; growth means infrastructure, infrastructure means burn, burn "
                    "means the next round is never optional. Somebody in finance does the dilution math "
                    "for you now. That should feel like relief."),
         overlay=None),
    dict(id="t11", level=None, template="boardroomNotes",
         narration=("You're invited into board meetings now, technically — a chair at the far end, no "
                    "vote, coffee poured by someone younger than you were at hire number one. Investors "
                    "talk about \"runway\" and \"burn multiple\" like weather. Priya's jaw stays tight "
                    "through the whole meeting, a tell you've learned to read after five years in the "
                    "same rooms as her."),
         overlay=None),
    dict(id="t12", level=None, template="dinner",
         narration=("Reyna asks, over dinner, what \"worth seven hundred seventy thousand dollars\" "
                    "actually means. You try to explain paper wealth while her face does the math "
                    "faster than yours ever did. Paper doesn't pay rent. Paper doesn't pay tuition. "
                    "Paper buys nothing at all until somebody with real money agrees, in writing, that "
                    "it's real. Neither of you says \"someday\" out loud."),
         overlay=None),

    # ---- LEVEL 04 · THE SCALE-UP — power, the first cuts, the hook into the fall ----
    dict(id="t13", level="LEVEL 04  ·  THE SCALE-UP", template="boardroomHead",
         narration=("Series B, then C, twelve months apart, until the company sits at four hundred "
                    "million dollars and you sit at the head of an actual department. Your slice, "
                    "diluted twice more, lands near seven-tenths of one percent — call it three million "
                    "dollars, still entirely on paper. Growth at all costs stops being a slogan on a "
                    "whiteboard. It's your entire job description now."),
         overlay=dict(big="$400,000,000", sub="SERIES B/C — YOUR SLICE: ~0.77% ≈ $3,000,000 (STILL PAPER)")),
    dict(id="t14", level=None, template="revolvingDoor",
         narration=("Promotion means a title, a bigger paycheck, and a door you hadn't noticed before: "
                    "the one between the people who make decisions and the people who live with them. "
                    "Priya calls it operating discipline. The board calls it efficiency. Nobody in "
                    "either room uses the word for what's about to happen to fourteen people whose "
                    "names you're currently typing into a spreadsheet."),
         overlay=None),
    dict(id="t15", level=None, template="layoffs", rate="+12%",
         narration=("The list is yours to build this time, not somebody else's. Fourteen names, people "
                    "you personally recruited off job boards two years ago, people who trusted the same "
                    "folded letter you're still carrying. Don't soften the language in the meeting. Say "
                    "the real words. Your voice doesn't crack once delivering it. That's the part that "
                    "will cost you, eventually, more than any number on any spreadsheet."),
         overlay=None),
    dict(id="t16", level=None, template="emptyChair",
         narration=("An investor you've never met calls Priya from a number with no name attached, "
                    "talks forty minutes about \"market conditions\" and \"a path to a billion.\" The "
                    "chair he'd sit in, if he ever showed his face, stays empty at every meeting after. "
                    "But the billion-dollar number he's dangling is about to cost this company something "
                    "nobody in the room has priced yet."),
         overlay=None),

    # ---- LEVEL 05 · THE DOWN ROUND — the silence, the reversal, Marcus's taunt ----
    dict(id="t17", level="LEVEL 05  ·  THE DOWN ROUND", template="tradingFloor",
         narration=("The term sheet on Priya's screen says a rumored billion dollars, and for exactly "
                    "nine days the company spends like it's already true — new hires, a bigger office, "
                    "a launch party with somebody else's name on the open bar. Ticker screens outside "
                    "run red that same week, a correction nobody in this building is watching closely "
                    "enough. Therefore the number is about to change."),
         overlay=dict(big="RUMORED $1,000,000,000", sub="THE TERM SHEET EVERYONE'S ALREADY SPENDING")),
    dict(id="t18", level=None, template="pnlWall", gap=1.4,
         narration=("The office empties by eight. Screens keep running red with nobody left to read "
                    "them. Priya's light stays on two floors up, alone, the door half shut. Nobody sends "
                    "the calendar invite for tomorrow's all-hands. Nobody has to. The quiet in this "
                    "building tonight is its own kind of announcement, and everyone who's stayed long "
                    "enough already knows how to read it."),
         overlay=None),
    dict(id="t19", level=None, template="signing",
         narration=("The number that finally prints is four hundred twenty million — a real haircut "
                    "off the rumored billion — riding in with a new clause: a straight liquidation "
                    "preference, the new investors paid first, before a single dollar of common stock "
                    "sees daylight. Your three million dollars still sits on the cap table. It is also, "
                    "this morning, worth nothing at all. Your hands don't shake signing the "
                    "acknowledgment. That's exactly the problem."),
         overlay=dict(big="$420,000,000", sub="THE DOWN ROUND — YOUR $3,000,000 STAKE, ON PAPER, IS NOW $0"),
         dialogue=dict(text="Congratulations. You survived a company worth four hundred twenty million dollars. You, personally, are worth exactly what you started with.")),

    # ---- LEVEL 06 · THE REBUILD — Marcus exits, the slow refill, crossing $1B for real ----
    dict(id="t20", level="LEVEL 06  ·  THE REBUILD", template="window",
         narration=("Marcus clears his desk into a single box by lunch, an offer already signed "
                    "somewhere with better math and less history attached. He doesn't say goodbye to "
                    "Priya. He does, on his way out, hand you the badge he's carried since hire number "
                    "two, like it might matter to somebody now. It doesn't, not anymore. But staying, "
                    "this particular week, doesn't feel like winning either."),
         overlay=None),
    dict(id="t21", level=None, template="atrium",
         narration=("Half the desks refill slower than they emptied, but they refill. New hires ask "
                    "about \"the culture\" in interviews, and you give an answer that's true in every "
                    "word and still, somehow, incomplete. The company rebuilds the way scar tissue does "
                    "— functional, load-bearing, never quite the same texture as before. Priya stops "
                    "saying the word \"billion\" in meetings for exactly one year."),
         overlay=None),
    dict(id="t22", level=None, template="warRoom",
         narration=("Eighteen months of rebuilding later, a term sheet lands that actually closes: one "
                    "billion one hundred million dollars, post-money, no rumor attached this time. Your "
                    "slice, cram-down dilution included, sits near six-tenths of one percent — six "
                    "million dollars, on paper again, still behind the preference stack that ate the "
                    "last round whole. The number keeps growing. Your percentage keeps shrinking. Both "
                    "are true at once."),
         overlay=dict(big="$1,100,000,000", sub="UNICORN — YOUR SLICE: ~0.6% ≈ $6,000,000 (STILL PAPER)")),

    # ---- LEVEL 07 · THE TENDER — the first real cash, Reyna paid off in person ----
    dict(id="t23", level="LEVEL 07  ·  THE TENDER", template="lectureHallScene",
         narration=("Priya announces the company's first tender offer in a packed all-hands: employees "
                    "can sell up to ten percent of their VESTED shares, for real cash, before any IPO. "
                    "The room goes silent the way it did the morning of the down round — silent for a "
                    "different reason this time, because everyone is doing the same math at once, and "
                    "for once, the math is good."),
         overlay=dict(big="10%", sub="OF VESTED SHARES — THE FIRST CHANCE TO SELL FOR CASH")),
    dict(id="t24", level=None, template="jet",
         narration=("Six hundred twenty-eight thousand dollars lands in an account with your name on "
                    "it — wired, not promised, not printed on a cap table anyone can rewrite. You fly "
                    "out that same week and pay off the rest of Reyna's tuition in person, in one "
                    "sitting, at a folding table not unlike the one Priya once slid a letter across. She "
                    "asks what this cost you. This time, finally, you actually answer."),
         overlay=dict(big="$628,000", sub="REAL. WIRED. NOT PAPER.")),
    dict(id="t25", level=None, template="deskClose",
         narration=("Back at your desk Monday, the rest of your stake is still exactly what it's always "
                    "been — a number on a screen nobody's agreed to pay for yet. Don't mistake one good "
                    "wire for the whole story. The company owes you nothing until it decides otherwise, "
                    "and every year you stay costs you a version of yourself the offer letter never once "
                    "mentioned."),
         overlay=None),

    # ---- LEVEL 08 · THE LOCK-UP — the bell, the tax bomb, the cold-open resolved ----
    dict(id="t26", level="LEVEL 08  ·  THE LOCK-UP", template="ipoBell", gap=0.7,
         narration=("The bell rings on a trading floor eleven time zones from the garage, and the "
                    "screen says the company is worth eight billion dollars before lunch. Your slice, on "
                    "paper, prices out near forty million dollars. Confetti, cameras, a text from Reyna "
                    "with four exclamation points. Nobody in the room mentions, out loud, the part that "
                    "comes next."),
         overlay=dict(big="$8,000,000,000", sub="MARKET CAP — YOUR SLICE: ~$40,000,000 (STILL LOCKED)")),
    dict(id="t27", level=None, template="fileWall",
         narration=("A hundred eighty days, the underwriters' agreement states, in language nobody "
                    "reads twice until it applies to them personally. That's how long every insider, "
                    "you included, is legally barred from selling one share — no matter what the number "
                    "does, no matter how many mornings you refresh the price before coffee. Forty "
                    "million dollars. Not one dollar of it spendable yet."),
         overlay=dict(big="180 DAYS", sub="THE LOCK-UP — YOU CAN'T SELL A SINGLE SHARE")),
    dict(id="t28", level=None, template="layoffs", gap=0.7,
         narration=("The lock-up hasn't even expired when the board orders \"cost discipline\" — nine "
                    "desks, names you personally hired starting at Level One, cut before the next "
                    "earnings call. Priya delivers the order from a boardroom now, not a garage. Two "
                    "folded papers sit in your hand afterward: the severance list you just read aloud, "
                    "and your own equity letter, worth more than the whole floor combined. This is the "
                    "morning you started at."),
         overlay=None,
         dialogue=dict(text="The market doesn't care how the garage felt. It never did. It just took us this long to believe it.")),
    dict(id="t29", level=None, template="window",
         narration=("The lock-up finally lifts on a morning the stock has already dropped nine percent "
                    "— lock-up expirations do that, a flood of newly sellable shares hitting a market "
                    "never quite ready for the supply. You exercise, you sell, you pay the tax bomb "
                    "nobody warned you about at Level One. What's actually left, after all of it, is "
                    "nineteen million dollars."),
         overlay=dict(big="$19,000,000", sub="AFTER THE LOCK-UP, AFTER THE TAXES — THE REAL NUMBER")),

    # ---- LOOP CLOSE — the new hire, Priya's line, the garage again ----
    dict(id="t30", level=None, template="lobby",
         narration=("A twenty-four-year-old engineer sits across a folding table in a garage half the "
                    "size of Priya's — your own, funded quietly, three blocks from where this all "
                    "started. You slide one sheet across. Hire number one. She asks if it's a good deal. "
                    "Ink smell on new paper. You fold your own copy once, out of old habit, before you "
                    "even answer."),
         overlay=None,
         dialogue=dict(text="Sign here. It's not a job. It's a lottery ticket with a vesting schedule — and the drawing takes four years.")),
    dict(id="t31", level=None, template="garageStart", rate="-10%",
         narration=("Priya texts that same week about \"a new idea, obviously, a new garage\" — three "
                    "dots, no details, exactly the way she pitched you fourteen years and one bell ring "
                    "ago. You don't answer yet. The solder smell in this garage isn't yours, technically "
                    "— you're just the one holding the folding table steady. Somewhere behind your ribs, "
                    "hire number one is still signing his name. So, it turns out, are you."),
         overlay=None),
]
