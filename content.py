#!/usr/bin/env python3
"""Your Life as a Venture Capitalist at Every Level — POV doodle build, ~12 min.
Grounded in docs/research/venture_capitalist.md. RANK format: analyst -> associate -> principal ->
partner -> general partner -> your own fund -> a mega-platform -> the LPs above every fund. Second-
person present-tense POV; the viewer IS a venture capitalist.

SPINE: the on-screen big number is CAPITAL YOU CAN DEPLOY (check authority, then fund size, then
industry AUM) — power, not personal wealth. The sub-caption carries personal pay/carry, which stays
small and mostly UNREALIZED for most of the runtime (carry doesn't pay until portfolio companies
exit, years later, if ever). The drama is the gap between the money you move and the money that's
real — same "inverted spine" family as soldier/spy, applied to venture instead of the military/agency.

REAL/VERIFIED mechanics woven in (see research doc; flags there): the Correlation Ventures power-law
dataset (~65% of VC deals return <1x, <4% return 10x+, top 0.4% return 50x+) [VERIFIED]; Bessemer
Venture Partners' real, public "Anti-Portfolio" (David Cowan passing on Google in a garage, 1999-2000;
also Apple, Facebook, Airbnb) [VERIFIED, bvp.com/anti-portfolio]; real 2025-2026 comp bands by level
(analyst/associate/principal/partner, carry-by-level) [VERIFIED, multiple 2025 salary surveys]; real
GP-commit norms (~1.5-1.7% median) [VERIFIED]; real AUM figures — a16z + Sequoia ~$90B each (Jan 2026),
US VC industry ~$1.25T (NVCA 2025), global VC ~$3.5T (2026, up from ~$500B in 2008) [VERIFIED]. The
specific check-authority dollar figures per level, the Fund I size, and the protagonist's portfolio
company are FLAGGED as illustrative composites (research doc has the full breakdown).

STORY: DANA — the partner who recruits you at Level 1; her one-line warning ("nine hundred no's for
every yes that counts") is the theme stated early, paid off almost verbatim in her final text at t32.
She is quietly pushed out at Level 5 when her own fund's LPs don't re-up — the cost beat that proves
no rank in this business is safe. MARCUS — a rival principal/partner; needles you at the height of your
first championed deal (t11) and again, harder, the day it implodes (t18) — the betrayal is professional,
not personal, and the show never resolves whether he was right. RENATA — the founder whose seed deck
you fall for as an analyst but can't fund (t05); a rival fund backs her instead; you reclaim the deal
at Principal (t10); her company turns out to be built on inflated numbers and implodes at the midpoint
(t17); years later, at Level 7, she's back with a second, real company, and the cold open's $40M wire
is you betting on her twice (t01/t28) — the fund-returning bet. PRIYA — a one-scene cameo (t22): the
garage founder from `startup_unicorn.md`'s ending, now an LP writing angel checks, closing that
episode's "already texting about a new idea" thread by showing up, years later, on the other side of
the table. UNRESOLVED UNIVERSE THREAD (deliberate): a crypto deck you pass on at t27 ("billion or
zero") — planted for a future `crypto_founder` episode to pick up; never resolved here. BODY-DREAD
MOTIF (fact, not feeling): "your hands are steady" at the cold open (t01) -> "your hands don't move for
a full ten seconds" at the reversal (t17) -> "your hands are steady again" at the payoff (t28) -> the
thumb hovering, then left face-down, at the loop close (t33). SOUND ANCHOR: the phone, face down on
the desk, that does or doesn't buzz — silent right before the reversal (t16), buzzing with the bad news
(t17), buzzing with the wire confirmation (t28), and left deliberately unanswered at the very end (t33).

Templates: composed ENTIRELY from EXISTING packs — no new template pack needed. Universal (deskClose/
deskSilhouette/fileWall/window/signing/boardroomNotes/boardroomHead/tower/dinner/layoffs/atrium/
warRoom/podiumScene/lobby/revolvingDoor/emptyChair/lectureHallScene) + STARTUP (garageStart/
startupGrow/serverScale/ipoBell — reused from the FOUNDER's-eye view to the VC's, the check-writer
watching from outside the cap table) + HEDGEFUND (tradingFloor/pnlWall) + REAL ESTATE (rooftopEmpire,
re-purposed for a wealthy VC's isolated apex reflection, per the "hedgefund-pack-reused-cross-genre"
and "relit-backdrop-new-template-pattern" precedents in improvements.json — packs built for one topic
reading cleanly on an unrelated one). No two adjacent scenes share a template.

STRUCTURAL VARIATION vs the last 2 (zombie_apocalypse = FLASH-FORWARD cold open / compounding descent
/ flash-forward-payoff + torch-passing ending; startup_unicorn = AFTERMATH cold open / rise-then-fall-
then-rise / torch-passing ending): this cold open is MID-ACTION (dropped straight into an unresolved,
present-tense decision, no rewind framing, no flash-forward label — the story simply cuts to Level 1
after); act two is FLAT-THEN-SPIKE, not a smooth rise or a descent — title/rank climbs on schedule
while personal money stays almost frozen for most of the runtime (echoing the "inverted-spine" pattern
but structural, not just numerical: nothing "escalates" personally until the single spike at t28); the
ending is ONE-DOOR-LEFT-OPEN, not torch-passing — no new hire, no ritual handed to a child; the last
image is a door deliberately NOT walked through.

PROMISE -> PAYOFF LEDGER:
  * t01 cold open ($40M wire, Renata's name, thumb over the button)      -> t28 (resolved: the wire clears)
  * t03 Dana's dialogue warning ("nine hundred no's...")                  -> t32 (echoed almost verbatim in her retirement text)
  * t04 Priya name-dropped in the deal-flow forwards                      -> t22 (payoff: she appears in person as an LP)
  * t05 Renata's seed deck, the deal you love but can't fund              -> t06 (passed) -> t08 (funded by a rival) -> t10 (reclaimed) -> t17 (implodes) -> t27 (her second company) -> t28 (the fund-returning bet)
  * t11 Marcus's first jab ("falling in love with your own deal...")      -> t18 (paid off, harsher, the day the deal implodes)
  * t14 "return the fund" phrase planted                                  -> t28 (paid off literally)
  * t19 Dana absent from the Monday meeting, her fund not renewed         -> t32 (her arc closes: retired, one last text)
  * t27 the crypto deck you pass on ("billion or zero")                   -> UNRESOLVED, deliberate universe thread (future crypto_founder episode)
  * body-dread motif "your hands are steady" (t01)                        -> "hands don't move" (t17, the reversal) -> "hands are steady again" (t28, the payoff)
  * sound anchor: the phone face-down, silent (t16) -> buzzing, bad news (t17) -> buzzing, the wire (t28) -> left face-down on purpose (t33)
  * share beat: Correlation Ventures power-law stats (t01/t28 framing)    -> paid off structurally, the whole episode
  * share beat: Bessemer's real Anti-Portfolio (Google/Cowan)             -> woven into t06's "wait, that's real?" beat
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — mid-action, the wire, the thumb that hasn't moved ----
    dict(id="t01", level=None, template="deskClose", gap=0.7,
         narration=("Forty million dollars sits queued in a wire-transfer window, Renata's company on "
                    "the recipient line, and your thumb hasn't moved in eleven seconds. Somewhere behind "
                    "you a hundred other bets already went to zero to get you to this one. One click "
                    "either returns the fund three times over or humiliates you in front of every LP "
                    "who ever trusted your name twice. Your hands are steady. That's the part that "
                    "scares you."),
         overlay=dict(big="$40,000,000", sub="ONE CLICK. RETURNS THE FUND — OR YOU.")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="deskSilhouette",
         narration=("None of this exists yet. Nine years back there's no wire, no fund with your name "
                    "stenciled on the door, only a kid with a finance degree, four hundred thousand "
                    "dollars of student debt, and a want so specific it embarrasses you to say out loud: "
                    "to be the person who says yes correctly, just once, before anyone important is "
                    "watching. Nobody warns you how many times you'll have to be right about someone "
                    "else's whole life first."),
         overlay=None),

    # ---- LEVEL 01 · ANALYST · THE INBOX ----
    dict(id="t03", level="LEVEL 01  ·  ANALYST  ·  THE INBOX", template="lectureHallScene",
         narration=("Analyst training runs eight weeks — spreadsheets, term sheets, the private "
                    "vocabulary of other people's ambition. Four hundred thousand dollars of debt "
                    "doesn't feel any smaller in a conference room with a view like this one. Dana, the "
                    "partner who plucked your resume off a pile of six hundred, pulls you aside on day "
                    "one. Her warning is the only lesson from the entire eight weeks that actually "
                    "sticks."),
         overlay=dict(big="$0", sub="CHECK AUTHORITY · ~$120K/YR"),
         dialogue=dict(text="You'll say no nine hundred times for every yes that counts. Get used to being wrong in public.")),
    dict(id="t04", level=None, template="fileWall",
         narration=("Three hundred pitch decks land in the shared inbox this week alone, the fan on "
                    "your laptop humming under the load. You get an opinion on every one of them and a "
                    "vote on none. One name keeps recurring in the forwarded threads: Priya, a garage "
                    "founder who rode her own company to a bell eight years back and writes angel "
                    "checks now. Everyone in the building wants five minutes with her."),
         overlay=None),
    dict(id="t05", level=None, template="garageStart",
         narration=("A cold email gets you into an actual garage — folding chairs, a whiteboard fogged "
                    "with a supply-chain diagram, the smell of solder and cold coffee gone bitter in a "
                    "paper cup. Renata talks with her hands like the idea might fly off if she stops "
                    "moving them. Two million dollars gets her to a real, sellable product. You believe "
                    "every word of it before she finishes the sentence — the first deal you'll ever "
                    "actually love."),
         overlay=dict(big="$2,000,000", sub="THE SEED ROUND YOU CAN'T FUND YET")),
    dict(id="t06", level=None, template="boardroomNotes",
         narration=("Your memo runs four pages, all conviction, footnoted like a legal brief. The "
                    "partner across the table reads two sentences of it and says 'too early, too weird' "
                    "before you've finished the pitch out loud. Somewhere a firm called Bessemer keeps "
                    "its own public list of exactly this mistake — they passed on meeting two Stanford "
                    "kids named Larry and Sergey in a garage in 1999. Belief isn't a vote. Therefore you "
                    "learn the real distance between loving a deal and being allowed to fund one."),
         overlay=None),

    # ---- LEVEL 02 · ASSOCIATE · THE SIGN-OFF ----
    dict(id="t07", level="LEVEL 02  ·  ASSOCIATE  ·  THE SIGN-OFF", template="desk",
         narration=("Promotion means a title, a signature line underneath a partner's, and actual check "
                    "authority for the first time — two hundred fifty thousand dollars, with sign-off "
                    "required above it. Your apartment still has a roommate in it and a mattress on the "
                    "floor; the business card in your wallet says something entirely different now. You "
                    "stop losing sleep over the decks you passed on. You start losing sleep, instead, "
                    "over the one you didn't get to fund."),
         overlay=dict(big="$250,000", sub="CHECK AUTHORITY (WITH SIGN-OFF) · ~$200K/YR")),
    dict(id="t08", level=None, template="startupGrow",
         narration=("Renata raised anyway — a rival fund wrote the check yours wouldn't — and her "
                    "company now fills an actual office, whiteboards multiplying, a product finally "
                    "shipping to real customers. The round announcement lands in your inbox like a "
                    "scoreboard update from a game you're not playing in yet. Fifteen million dollars, "
                    "and not one of them is your firm's."),
         overlay=dict(big="$15,000,000", sub="SOMEONE ELSE'S TERM SHEET")),
    dict(id="t09", level=None, template="window",
         narration=("But conviction has to start somewhere small. Your own sourced deal — a logistics "
                    "tool nobody else in the building had noticed — finally gets the sign-off: two "
                    "hundred fifty thousand dollars, your recommendation, your name quietly attached to "
                    "an outcome for the first time in your career. It closes clean inside a month. "
                    "Therefore the partners start asking your opinion before you offer it."),
         overlay=None),

    # ---- LEVEL 03 · PRINCIPAL · THE BOARD SEAT ----
    dict(id="t10", level="LEVEL 03  ·  PRINCIPAL  ·  THE BOARD SEAT", template="signing",
         narration=("Principal. Renata is raising again — the rival fund passed on her Series A, "
                    "spooked by one slow quarter — and this time the term sheet has your firm's name at "
                    "the top and yours on the signature line underneath it. Three million dollars. A "
                    "board OBSERVER seat: the closest you've ever sat to the table that actually decides "
                    "things."),
         overlay=dict(big="$3,000,000", sub="YOUR FIRST TERM SHEET · ~$300K/YR")),
    dict(id="t11", level=None, template="serverScale",
         narration=("Her servers multiply, her headcount doubles twice in a year, and the growth curve "
                    "on every board deck bends in exactly the direction the whole room is quietly "
                    "praying for. Marcus, a principal from the deal team down the hall, catches you at "
                    "the coffee machine — half joke, half warning, delivered with a smile that doesn't "
                    "reach anywhere near his eyes."),
         overlay=None,
         dialogue=dict(text="Careful. Falling in love with your own deal is how you blow up a portfolio.")),
    dict(id="t12", level=None, template="boardroomHead",
         narration=("But nobody in the room argues with a growth curve that steep, and your name starts "
                    "appearing, unprompted, in the partner-track memo circulating two floors up from "
                    "where you actually sit. Traction on a slide isn't the same thing as truth in a "
                    "filed financial statement — you don't know that yet, not really, and nobody in this "
                    "particular room says it out loud either, not even Dana."),
         overlay=None),

    # ---- LEVEL 04 · PARTNER · THE VOTE ----
    dict(id="t13", level="LEVEL 04  ·  PARTNER  ·  THE VOTE", template="tower",
         narration=("Partner. Full vote at Investment Committee, fifteen million dollars of check "
                    "authority, and a board seat that's a DIRECTOR seat now — real fiduciary duty, the "
                    "kind a lawyer can attach your actual name to if something goes wrong later. The "
                    "climb from here looks less like a ladder and more like a wire with no net stretched "
                    "under it."),
         overlay=dict(big="$15,000,000", sub="CHECK AUTHORITY · BOARD DIRECTOR NOW")),
    dict(id="t14", level=None, template="dinner",
         narration=("You lead Renata's growth round yourself now — fifteen million dollars, a candlelit "
                    "dinner with two co-investors angling politely for the exact same allocation you "
                    "want for your own firm. Somewhere between the second course and the signature page, "
                    "your partners start using a phrase about her company that you'll hear repeated, "
                    "with steadily less warmth in it, for years after tonight's dinner is over."),
         overlay=dict(big="RETURN THE FUND", sub="FOUR WORDS. INFINITE PRESSURE.")),
    dict(id="t15", level=None, template="fileWall",
         narration=("An LP due-diligence questionnaire lands the same week — forty pages asking, six "
                    "different ways, how concentrated your fund's return really is on companies exactly "
                    "like Renata's. You answer honestly. Page thirty reads: 'the fund's carry depends "
                    "materially on a small number of positions.' Your own handwriting looks unfamiliar "
                    "by the time you finish that sentence."),
         overlay=None),
    dict(id="t16", level=None, template="deskSilhouette", gap=1.4,
         narration=("The numbers on Renata's dashboard look almost too clean this particular quarter — "
                    "the kind of clean you'd flag immediately, on instinct, in anyone else's deal. Your "
                    "phone sits face down on the desk and doesn't buzz. It hasn't buzzed all afternoon, "
                    "not once. That particular kind of quiet used to mean nothing at all was wrong."),
         overlay=None),

    # ---- MIDPOINT REVERSAL ----
    dict(id="t17", level=None, template="pnlWall", rate="-8%",
         narration=("Then it buzzes. Renata's voice on the line is flatter than you've ever heard it — "
                    "the revenue in every board deck for six straight months was inflated, real numbers "
                    "a fraction of the reported ones, and not one of the other directors knew before you "
                    "did. Your hands don't move for a full ten seconds after the call ends. The company "
                    "you fell for first is worth, functionally, nothing."),
         overlay=dict(big="$0", sub="THE MARK-DOWN. RENATA'S CALL.")),
    dict(id="t18", level=None, template="layoffs",
         narration=("Forty people lose their jobs in a single Friday email you personally help draft, "
                    "your director's signature required at the bottom of the notice. Sign it anyway. "
                    "Fiduciary duty doesn't pause for what any of this costs to sit through. Marcus "
                    "finds you in the hallway afterward, not quite smiling, timing the line exactly "
                    "right."),
         overlay=dict(big="-40", sub="STAFF LET GO. YOU SIGN THE NOTICE."),
         dialogue=dict(text="I told you. You don't get points for loving the ones that die.")),

    # ---- LEVEL 05 · GENERAL PARTNER · THE COMMIT ----
    dict(id="t19", level="LEVEL 05  ·  GENERAL PARTNER  ·  THE COMMIT", template="atrium",
         narration=("But a blown-up board seat doesn't end a career here if you handle the wreckage "
                    "honestly, and somehow, barely, you do. General Partner. The fund is three hundred "
                    "million dollars now, and for the first time your own money is actually inside it — "
                    "four and a half million, real, locked up for a decade, yours to lose along with "
                    "everyone else's."),
         overlay=dict(big="$300,000,000", sub="THE FUND · $4.5M OF IT IS YOURS")),
    dict(id="t20", level=None, template="tradingFloor",
         narration=("GP means watching the whole portfolio at once — forty companies across one long "
                    "wall of monitors, a third climbing, a third flat, a handful quietly dying the way "
                    "Renata's first one did. Dana isn't at the Monday meeting. Her fifth fund's LPs "
                    "simply didn't re-up it. Nobody sends flowers for a fund that just stops. The seat "
                    "only opens because hers closed, and you're the one who fills it."),
         overlay=None),
    dict(id="t21", level=None, template="warRoom",
         narration=("Allocating across a fund you didn't build turns into driving a car with somebody "
                    "else's hands still resting on the wheel. Therefore, quietly, on weekends, you start "
                    "drafting the deck for something that would actually be yours — a fund with your own "
                    "name stenciled on the door, for better or for a full decade of worse."),
         overlay=None),

    # ---- LEVEL 06 · FOUND YOUR OWN FUND · THE NAME ----
    dict(id="t22", level="LEVEL 06  ·  FOUND YOUR OWN FUND  ·  THE NAME", template="podiumScene",
         narration=("One hundred fifty million dollars — Fund One, and your own name is the entire "
                    "pitch now, not your old firm's letterhead behind you. Every LP dinner is an "
                    "audition with a check at the end of it. Two and twenty: a two-percent management "
                    "fee, twenty percent of anything above an eight-percent floor. You explain the math "
                    "so many times this month it stops sounding like math at all."),
         overlay=dict(big="$150,000,000", sub="FUND I · 2 AND 20")),
    dict(id="t23", level=None, template="lobby",
         narration=("Priya walks into your firm's actual lobby to write a check as an LP — the same "
                    "name from the forwarded decks nine years back, garage to bell, now funding the fund "
                    "that once couldn't fund her friend's company. The room you built is smaller than "
                    "the one you imagined at Level One, with worse coffee than you promised yourself "
                    "it would have. It doesn't matter. She signs anyway."),
         overlay=None),
    dict(id="t24", level=None, template="signing",
         narration=("Closing Fund One costs three million dollars a year just to keep the lights on and "
                    "the two associates paid — the management fee, spent before a dollar of it is "
                    "actually earned. Therefore the first real check this fund ever writes has to be the "
                    "right one. You already know, before you'll admit it out loud to anyone, exactly "
                    "whose name is going on it."),
         overlay=dict(big="$3,000,000", sub="THE FEE. JUST TO KEEP THE LIGHTS ON")),

    # ---- LEVEL 07 · THE PLATFORM ----
    dict(id="t25", level="LEVEL 07  ·  THE PLATFORM", template="jet",
         narration=("Five years scale the fund toward the top of an industry where the two biggest "
                    "firms each manage roughly ninety billion dollars apiece — a single fundraise from "
                    "one of them last year alone equaled almost a fifth of everything the entire US "
                    "venture industry deployed. You are nowhere near that number yet. You fly toward it "
                    "anyway, every quarter, a little closer."),
         overlay=dict(big="$90,000,000,000", sub="WHAT THE TOP OF THIS INDUSTRY LOOKS LIKE")),
    dict(id="t26", level=None, template="revolvingDoor",
         narration=("Access compounds faster than carry ever does. Doors that used to need three warm "
                    "introductions now open because a fund with your name on it called ahead. But the "
                    "carry from Fund One still hasn't paid a single dollar — the portfolio companies "
                    "haven't exited, and won't, most of them, for years, if they ever do at all."),
         overlay=None),
    dict(id="t27", level=None, template="ipoBell",
         narration=("Renata pitches you again — a second company this time, real, built carefully out "
                    "of the wreckage of the first one — and asks you personally to lead the follow-on. "
                    "Another deck lands the same week, something about tokens, the summary line reading, "
                    "almost word for word: billion or zero. You pass on it without a second thought and "
                    "don't think about it again."),
         overlay=dict(big="BILLION OR ZERO", sub="THE DECK YOU PASS ON")),

    # ---- PAYOFF of the cold open ----
    dict(id="t28", level=None, template="deskClose",
         narration=("Forty million dollars, queued, Renata's name on the recipient line, your thumb "
                    "hovering exactly where it was nine years and one collapsed company ago. This time "
                    "you click. The wire clears in eleven seconds. Her company's next round prices at "
                    "four times the last one — the single check that returns three times the entire "
                    "fund. Your hands are steady again. Nobody claps. The machine already wants to know "
                    "what's next."),
         overlay=dict(big="$40,000,000", sub="THE WIRE CLEARS. NOBODY CLAPS.")),

    # ---- LEVEL 08 · THE ALLOCATORS (apex) ----
    dict(id="t29", level="LEVEL 08  ·  THE ALLOCATORS", template="emptyChair",
         narration=("You're rich now, by any ordinary measure, running one of the names LPs actually "
                    "chase instead of chasing. But above every fund — yours, the ninety-billion-dollar "
                    "ones, all of it — sit the pensions and endowments and sovereign funds who decide "
                    "who gets to raise a next one. The entire US venture industry moves one point two "
                    "five trillion dollars. You are not even one percent of it."),
         overlay=dict(big="$1,250,000,000,000", sub="US VC, TOTAL. YOU'RE NOT EVEN 1%.")),
    dict(id="t30", level=None, template="boardroomHead",
         narration=("Globally the number is three and a half trillion dollars, up from five hundred "
                    "billion less than twenty years ago, and every dollar of it answers to some "
                    "allocator's committee you will never personally sit on. The capital doesn't ask "
                    "what you built. It doesn't ask what you believed. It only asks, every single year, "
                    "what returned. That's the actual top of this ladder, and it has no office anywhere "
                    "with your name on the door."),
         overlay=dict(big="$3,500,000,000,000", sub="GLOBAL. THE PEOPLE WHO PICK THE PICKERS.")),
    dict(id="t31", level=None, template="rooftopEmpire",
         narration=("The apartment is bigger now, the view better, and most nights it's just you up "
                    "here with a glass you don't finish, running numbers on funds that aren't even yours "
                    "to run anymore. Marcus made partner somewhere else, married, two kids you hear "
                    "about secondhand. Dana always said the nine hundred no's cost something. Nobody "
                    "ever specifies, out loud, that the cost is usually this — the quiet, not the "
                    "money."),
         overlay=None),
    dict(id="t32", level=None, template="window",
         narration=("A text arrives from a number you haven't heard from in two years. Dana retired "
                    "quietly last spring, the firm's newsletter said, a single line nobody read twice. "
                    "Three words now, no context needed after nine years of the exact same lesson "
                    "repeated in a hundred different rooms."),
         overlay=None,
         dialogue=dict(text="Nine hundred no's. Then you get to find out if you were right about the one.")),

    # ---- LOOP CLOSE — the door left shut, on purpose ----
    dict(id="t33", level=None, template="deskClose", gap=0.7,
         narration=("A notification sits on your phone, face down on the desk, exactly the way it "
                    "always has — a second look at the deck you passed on, the founder asking, "
                    "politely, if you're sure. Your thumb hovers exactly the way it once hovered over "
                    "forty million dollars. This time you leave it face down. Some doors you get to "
                    "leave shut on purpose, and that, too, nine years in, still counts as a decision."),
         overlay=None),
]
