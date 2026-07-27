#!/usr/bin/env python3
"""POV: You Found a Crypto Startup (Billion or Zero) — POV doodle build, ~12.5 min.
Grounded in docs/research/crypto_founder.md. SCENARIO format: the levels are an escalating DAY/MARKET-
CAP ladder, not a job rank — one founder, one company, one token, from a $4,200 checking-account
balance to a $1.4B paper peak to a federal settlement and back out the other side. Second-person
present-tense POV: the viewer IS a first-time founder.

REAL/VERIFIED mechanics woven in (see research doc; flags there): crypto seed rounds raising $2-5M at
$20-30M FDV via a SAFT, with 5-10% seed allocations and 6mo-cliff/24mo-vest terms [VERIFIED]; the
"gold standard" 4yr/1yr-cliff team-token vesting and the >5%-TGE-unlock sell-pressure red flag
[VERIFIED]; the real 2025 base rate that only 3 of 56 VC-backed tokens that launched crossed a $1B FDV
[VERIFIED, AInvest — the title's "billion or zero" mechanic AND this episode's share-worthy beat]; the
real March-2022 Ronin/Axie Infinity bridge hack ($625M, compromised multisig keys, later attributed to
the Lazarus Group) [VERIFIED] as the mechanical model for this episode's (fictional) treasury exploit;
the real May-2022 Terra/Luna collapse (~$40-45B erased in about three days, Terraform Labs burning its
$1.5B BTC reserve trying to defend the peg) [VERIFIED] as the model for this episode's own defend-the-
peg moral compromise; Do Kwon's real December-2025 15-year sentence for that collapse [VERIFIED,
Bloomberg/CNN/DOJ — referenced by name as the episode's "wait, that's real?" gut-punch, eight months
before this episode's air date]; SBF/FTX's real 94%-in-a-day wealth collapse [VERIFIED] referenced
without naming him; the real SEC "Wells notice" procedure [VERIFIED, standard mechanism] behind this
episode's FLAGGED fictional settlement. The company, the token, the specific dollar path, and every
named character are a fictional composite — no real founder or firm is depicted as fact.

SPINE: the big gold number is MARKET CAP / TREASURY, not personal net worth — $4,200 (Day 1, all of it)
-> $2.8M (seed) -> $140K (first real personal dollar) -> $780M (TGE launch day) -> $1.4B (the peak, "3
of 56") -> -$620M (the exploit) -> -91% (the crash) -> $4.1M (legal fees) -> $2.1M (what's actually left
after restitution). The gap between the market cap everyone watches and the money that's real is the
whole drama, same inverted-spine family as venture_capitalist/hedge_fund_manager, but here the gap
doesn't just lag — it inverts violently, once, at the midpoint.

STORY: NAOMI — your co-founder, the one who understands the treasury better than you do; her act-1
warning about the 2-of-3 multisig (t04 dialogue) is the theme stated early, paid off literally at the
exploit (t19) and again in her resignation call (t20 dialogue) — she is the one person in the episode
who is right the whole time and gets nothing for it. KELLAN — a rival founder; his first jab lands as a
setup at t14 (dialogue), his harder one lands right after the crash (t22, folded into narration to keep
the episode's in-world dialogue count at 4 per the BIBLE's 2-4 ceiling) — the show never resolves
whether he had any idea what was coming, and doesn't need to. PRIYA — a one-scene cameo (t06): the
garage founder from `startup_unicorn.md`'s ending, later an LP in `venture_capitalist.md`, now an angel
writing your seed check — the third episode in a row to touch her arc, always from a different side of
the table. UNRESOLVED UNIVERSE THREAD (deliberate): the exploit wallet, tagged only `ghost.eth`,
laundered through six mixers by noon (t20) and still an open FBI case (Special Agent Ruiz's card, t28)
— never identified, planted for a future episode (fbi_undercover is next in the queue) to pick up.
SENSORY ANCHOR: a steel cold-storage hardware wallet on a lanyard — empty in a drawer at t03, worn for
the first time at t06, heavier at every level-up through the peak, surrendered to lawyers as evidence
at t26, returned empty at t30 and worn anyway, out of habit. BODY-DREAD MOTIF (fact, not feeling):
"your voice doesn't shake" first at t08 (a promise you can't back up yet) -> "your voice shakes for the
first time in four hundred days" at the reversal (t19) -> "your voice doesn't shake anymore... that's
the part that should worry you" at the apex (t30), echoed once more, colder, at the very end.

Templates: composed almost ENTIRELY from EXISTING packs, extending the `vc-composed-no-new-pack-
cross-genre` precedent to a startup-flavored topic, plus ONE new universal template. Universal
(deskSilhouette/deskClose/window/fileWall/signing/boardroomNotes/boardroomHead/atrium/layoffs/
revolvingDoor/emptyChair/lobby/warRoom/dinner) + generic `podiumScene` + STARTUP (garageStart/
startupGrow/serverScale/ipoBell, here reused straight-up from the founder's own POV instead of a
check-writer's) + HEDGEFUND (tradingFloor/pnlWall, re-purposed from a trading desk to a token's live
chart) + REAL ESTATE's `rooftopEmpire` (the apex reflection) + MAFIA's `courtroom` (re-narrated from a
RICO trial to an SEC proceeding — same bench-and-seal setting, a different kind of case). New:
`raidScene` (t01 cold open only) — agents carrying servers out in evidence boxes, the desk's monitor
still glowing — added because reusing deskSilhouette (t18's plain late-night desk shot) undersold the
episode's single highest-leverage beat (reviewer defect). No two adjacent scenes repeat.

STRUCTURAL VARIATION vs the last 2 (venture_capitalist = MID-ACTION cold open / FLAT-THEN-SPIKE act two
/ ONE-DOOR-LEFT-OPEN ending; zombie_apocalypse = FLASH-FORWARD cold open / compounding-descent act two /
torch-passing ending): this cold open is AFTERMATH (agents already carrying the servers out, the wallet
already frozen, before rewinding to Day 1 — last used 3 episodes back by startup_unicorn, not
consecutively); act two is BOOM-BUST-BOOM — a full peak delivered BEFORE the midpoint (the $1.4B high
at ~45%), then the reversal inverts it violently, rather than a slow climb or a flat-then-spike; the
ending is COMPLICIT SILENCE, not torch-passing (no warm handoff, no wisdom offered) and not one-door-
left-open (not passive avoidance) — you recognize the exact mistake in a stranger, choose not to warn
her, and know precisely why not.

PROMISE -> PAYOFF LEDGER:
  * t01 cold open (agents, the frozen $1,412,000,000 wallet)             -> t27 (resolved: it unfreezes, most of it routed to restitution)
  * t02 promise/cost-line ("the number and the cost... the same number") -> t32 (echoed almost verbatim, the loop close)
  * t03 the cold-storage brick, empty in a drawer                        -> t06 (worn first) -> t26 (surrendered) -> t30 (returned empty, worn anyway)
  * t04 Naomi's dialogue warning (the 2-of-3 multisig)                   -> t19 (the exploit exploits exactly that) -> t20 (her resignation call)
  * t05 nine funds pass on the deck ("interesting, not now")             -> t32 (mirrored: your own thumb over someone else's "not now")
  * t08 "your voice doesn't shake" (a promise you can't back up)         -> t19 ("shakes for the first time in four hundred days") -> t30/t32 (restored, colder)
  * t14 Kellan's first jab (setup, dialogue)                             -> t22 (paid off, harder, the day it craters — narration)
  * t16 the "3 of 56" stat / "billion or zero" as literal math           -> t21 (paid off: the crash is the other side of that same math)
  * t20 the exploit wallet `ghost.eth`, unidentified                     -> t28 (FBI card, still open) -> UNRESOLVED, deliberate universe thread
  * t24 Do Kwon named, 15 years, the same defend-the-peg move            -> paid off structurally: you made the same call at t17/t19 and knew it
  * share beat: "3 of 56 tokens ever cross $1B" (t16)                    -> woven as the episode's literal title mechanic, paid off the whole runtime
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — aftermath, the frozen wallet, before the rewind ----
    dict(id="t01", level=None, template="raidScene", gap=0.7,
         narration=("Federal agents in windbreakers carry your servers out in evidence bags, one at a "
                    "time, down the same stairs you carried them up nine months ago. A monitor nobody's "
                    "unplugged yet still glows on the desk behind them. Don't ask which number is worse "
                    "— the one that's frozen, or the one that isn't. Cardboard tape ripping off the "
                    "roll, zip ties cinching, the smell of cold coffee nobody finished drinking."),
         overlay=dict(big="$1,412,000,000", sub="WALLET FROZEN")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="window",
         narration=("Three hundred forty days ago none of this exists — not the wallet, not the "
                    "number, not the word defendant clipped to a case file with your name on it, not "
                    "even the office you'll lose. You want one thing: to build something real before "
                    "anyone tells you no again. You don't know yet that the number and the cost are "
                    "going to turn out to be exactly the same number."),
         overlay=None),

    # ---- LEVEL 01 · DAY 1 · THE GARAGE ----
    dict(id="t03", level="LEVEL 01  ·  DAY 1  ·  $4,200", template="garageStart",
         narration=("Four thousand two hundred dollars sits in checking, all of it, the day you quit. "
                    "The garage smells like WD-40 and cold concrete; a space heater hums against your "
                    "ankle while you type. A steel cold-storage brick sits empty in a drawer, waiting "
                    "for keys that don't exist yet. You've told exactly one person the real number — "
                    "Naomi, who studied cryptography before she studied you."),
         overlay=dict(big="$4,200", sub="ALL OF IT. DAY 1.")),
    dict(id="t04", level=None, template="deskClose",
         narration=("Naomi draws the treasury architecture in dry-erase orange — three keys, two "
                    "required to move anything, a diagram that takes up the whole whiteboard. Two is "
                    "fast. Two is also, she says, exactly one compromised laptop away from everything "
                    "the two of you have built. Marker squeaks. You nod like you're listening. Mostly "
                    "you're thinking about launch day."),
         overlay=None,
         dialogue=dict(text="The day you need three signatures is the day you needed them yesterday.")),
    dict(id="t05", level=None, template="fileWall",
         narration=("Nine funds pass on the deck in eleven days, each rejection politer than the last "
                    "and somehow worse for it. A tenth writes back a single line — interesting, not "
                    "now — and you read it four times looking for the part where it means yes. It "
                    "doesn't. Therefore you stop waiting on permission. Rent is due in six days, and "
                    "self-belief doesn't clear at the bank."),
         overlay=None),

    # ---- LEVEL 02 · DAY 40 · THE SEED ----
    dict(id="t06", level="LEVEL 02  ·  DAY 40  ·  $2,800,000 SEED", template="signing",
         narration=("Priya signs the SAFT before she finishes her coffee — two point eight million "
                    "dollars for eighteen percent of a token that doesn't exist yet, a name you "
                    "recognize from a deck that made the rounds years before yours, back when she was "
                    "the one pitching in a garage. Four-year vest, one-year cliff, nothing unlocks for a "
                    "full year. You loop the cold-storage lanyard over your head for the first time — a "
                    "small steel weight, cool against your sternum, exactly where a badge used to hang."),
         overlay=dict(big="$2,800,000", sub="SEED · 18% TO THE TEAM")),
    dict(id="t07", level=None, template="startupGrow",
         narration=("Six hires in ten weeks, a testnet, a Discord server that never sleeps, a whiteboard "
                    "wall of tickets nobody can close fast enough. Naomi wants a third key-holder before "
                    "mainnet. There's no time, and worse, there's no one you trust that much yet. You "
                    "promise her — soon — the way you'll later promise a lot of people a lot of things, "
                    "meaning it every single time."),
         overlay=None),
    dict(id="t08", level=None, template="deskClose",
         narration=("You announce a mainnet date onstage before the code is ready, because a date is "
                    "the only thing that makes people believe you're real. Your voice doesn't shake "
                    "when you say it. Therefore the team works nineteen-hour days for six weeks "
                    "straight. The multisig stays at two of three. Nobody decides that. It just never "
                    "becomes the emergency it should have been."),
         overlay=None),

    # ---- LEVEL 03 · DAY 150 · THE FIRST REAL DOLLAR ----
    dict(id="t09", level="LEVEL 03  ·  DAY 150  ·  $140,000", template="boardroomNotes",
         narration=("A market maker wires the first real money that's ever touched your personal "
                    "account — one hundred forty thousand dollars, vested, yours, taxable, actual, "
                    "sitting in an app on your phone instead of a whiteboard projection. You stare at "
                    "the number longer than you'd admit to anyone. It's the most money you've ever had. "
                    "It's also, you don't know yet, a rounding error on what's coming."),
         overlay=dict(big="$140,000", sub="THE FIRST REAL DOLLAR")),
    dict(id="t10", level=None, template="podiumScene",
         narration=("Onstage under conference lighting, three hundred people hold their phones up like "
                    "lighters at a show you didn't know you were headlining. Sweat under the collar, the "
                    "hum of the crowd mic. A journalist asks what the token is actually for. Your answer "
                    "gets a laugh and, more usefully, a headline by morning. The room believes you "
                    "before the code does."),
         overlay=None),
    dict(id="t11", level=None, template="serverScale",
         narration=("Testnet load-testing breaks twice in one week under traffic nobody modeled for, "
                    "fans screaming in the server closet at 4 a.m. Fix it fast. Fix it quiet. Don't tell "
                    "the group chat which server actually caught fire. But the fixes hold, barely, and "
                    "mainnet goes green four hours before the launch stream starts."),
         overlay=None),

    # ---- LEVEL 04 · DAY 300 · LAUNCH DAY ----
    dict(id="t12", level="LEVEL 04  ·  DAY 300  ·  $780,000,000 MARKET CAP", template="ipoBell",
         narration=("Token generation event, ten a.m., a countdown clock the whole internet is "
                    "watching, the office packed shoulder to shoulder around three monitors. The listing "
                    "goes live and the chart doesn't dip once — straight up, a green wall, seven hundred "
                    "eighty million dollars of market cap by lunch. Somewhere a bell would ring if this "
                    "business had bells. Instead there's just your own pulse, loud, in your ears, and "
                    "the cold-storage brick suddenly heavier against your chest than it was this "
                    "morning."),
         overlay=dict(big="$780,000,000", sub="MARKET CAP · LAUNCH DAY")),
    dict(id="t13", level=None, template="tradingFloor",
         narration=("By evening the chart is a wall of green candles stacked so tight they read as a "
                    "single line, the office phones buzzing nonstop with numbers nobody bothers to "
                    "answer anymore. Strangers you've never met are up six figures because of a "
                    "decision you made in a garage. Naomi watches the same screen from across the room "
                    "and doesn't say anything, which is its own kind of sentence."),
         overlay=None),
    dict(id="t14", level=None, template="dinner",
         narration=("Kellan, building a rival chain two blocks over, buys you a drink you didn't ask "
                    "for, ice clinking against the glass. He leans in over the bar noise, close enough "
                    "that you smell the whiskey before the question lands."),
         overlay=None,
         dialogue=dict(text="Cute number. Who's actually got the keys to that treasury?")),
    dict(id="t15", level=None, template="window",
         narration=("Your name returns four hundred search results overnight, most of them wrong, a "
                    "few of them cruel, one a photo you don't remember anyone taking. The glow of the "
                    "screen at 3 a.m. is the only light in the apartment. On paper you're worth more "
                    "than your parents' house times a thousand. In your actual bank account: one "
                    "hundred forty thousand dollars, unchanged, still vesting, still not real."),
         overlay=None),

    # ---- LEVEL 05 · DAY 340 · THE PEAK ----
    dict(id="t16", level="LEVEL 05  ·  DAY 340  ·  $1,400,000,000 MARKET CAP", template="pnlWall",
         narration=("Fifty-six venture-backed tokens launched this cycle. Three crossed a billion "
                    "dollars in market cap. Yours just became the third — one point four billion "
                    "dollars — a club so small the other two members text you within the hour. Billion "
                    "or zero was never a slogan. It was the actual math. Today the math goes your way."),
         overlay=dict(big="$1,400,000,000", sub="MARKET CAP · 3 OF 56 EVER GET HERE")),
    dict(id="t17", level=None, template="atrium",
         narration=("The new office has a name on the glass door and a coffee machine nobody had to "
                    "fight for, the smell of fresh paint still faint in the hallway. Twenty-two "
                    "employees now, real payroll, an HR department that didn't exist eight months ago. "
                    "The number on every screen keeps climbing. Nobody in the building asks, out loud, "
                    "who still holds the only two keys that move it."),
         overlay=None),
    dict(id="t18", level=None, template="deskSilhouette", gap=1.4,
         narration=("Two a.m., the office empty, the ticker's green glow the only light in the room, "
                    "the building's HVAC ticking down the hall. Naomi's third-key proposal is still "
                    "sitting, unanswered, in a channel nobody's opened in four months. Your phone is "
                    "face down on the desk. It hasn't buzzed all night."),
         overlay=None),

    # ---- LEVEL 06 · DAY 402 · THE EXPLOIT ----
    dict(id="t19", level="LEVEL 06  ·  DAY 402  ·  -$620,000,000 DRAINED", template="warRoom",
         narration=("The alert hits at 6:14 a.m. — a withdrawal from the treasury multisig, then "
                    "another, both signed with keys that were never supposed to sit on the same laptop "
                    "Naomi warned you about a year ago. The kitchen still smells like the coffee you "
                    "started brewing before you saw the screen. Six hundred twenty million dollars, "
                    "gone, in the eleven minutes it takes coffee to brew. Your voice shakes for the "
                    "first time in four hundred days."),
         overlay=dict(big="-$620,000,000", sub="TREASURY DRAINED · 6:14 AM")),
    dict(id="t20", level=None, template="fileWall",
         narration=("Forensics traces the exploit to a wallet tagged only ghost.eth, laundered through "
                    "six mixers by noon, gone before anyone can freeze it. Naomi's resignation email "
                    "lands at nine, four sentences, cc'ing legal. She calls once, after, just to say the "
                    "one thing she's been saying for a year, her voice flat in a way you've never heard "
                    "it before."),
         overlay=None,
         dialogue=dict(text="I asked for a third key for four hundred days. You had every one of them.")),
    dict(id="t21", level=None, template="tradingFloor",
         narration=("The chart that took ten months to build erases itself in eleven hours, the sell "
                    "wall so thick the app lags trying to render it. Panic-selling meets confirmed-hack "
                    "meets a headline with your name in it, and the three feed each other until the "
                    "candle is just red, straight down, off the bottom of the screen. One point four "
                    "billion becomes one hundred twenty-six million before the exchanges halt trading."),
         overlay=dict(big="-91%", sub="MARKET CAP · 11 HOURS")),
    dict(id="t22", level=None, template="layoffs",
         narration=("Twenty-two people become six by Friday, severance you fund personally because the "
                    "treasury that's supposed to cover it is the treasury that's gone. Boxes stacked by "
                    "the elevator, the badge readers already deactivated. Kellan calls, ostensibly to "
                    "check in — 'billion or zero,' he says, and now you both know which one you built."),
         overlay=None),

    # ---- LEVEL 07 · DAY 460 · THE WELLS NOTICE ----
    dict(id="t23", level="LEVEL 07  ·  DAY 460  ·  SEC WELLS NOTICE", template="revolvingDoor",
         narration=("A courier hands you an envelope with a government seal instead of a knock on the "
                    "door, the paper heavier than it should be for four pages. Inside: a Wells notice, "
                    "the SEC's polite word for we're about to charge you, and a phone number for a "
                    "securities lawyer you'll come to know better than your own family by spring."),
         overlay=dict(big="SEC WELLS NOTICE", sub="DAY 460")),
    dict(id="t24", level=None, template="courtroom",
         narration=("Depositions run six hours a day for three weeks, fluorescent light, the recorder's "
                    "little red dot always on. The lawyer's binder has a tab for a name that isn't yours "
                    "— Do Kwon, fifteen years, sentenced eight months ago for defending a different "
                    "collapsing peg with money that wasn't his to spend. You spent treasury reserves "
                    "buying back your own token during the panic too, telling yourself, at the time, "
                    "that it was temporary."),
         overlay=None),
    dict(id="t25", level=None, template="fileWall",
         narration=("The number buys lawyers, three of them, billing by the six-minute increment. The "
                    "number buys silence — an NDA for every employee who left angry. The number buys a "
                    "settlement instead of a trial, which your lawyer calls a win. Nobody else in the "
                    "room calls it that."),
         overlay=None),
    dict(id="t26", level=None, template="boardroomHead",
         narration=("Four million one hundred thousand dollars in legal fees later, the SEC agrees to "
                    "settle: no admission, a restitution fund for the drained wallets, a five-year "
                    "officer-and-director bar. The cold-storage brick gets bagged as evidence somewhere "
                    "in week two, tagged and sealed in a manila envelope. The collar of every shirt sits "
                    "wrong for months before you place why."),
         overlay=dict(big="$4,100,000", sub="LEGAL FEES · THE SETTLEMENT")),

    # ---- LEVEL 08 · DAY 640 · WHAT'S LEFT ----
    dict(id="t27", level="LEVEL 08  ·  DAY 640  ·  $2,100,000 AFTER RESTITUTION", template="signing",
         narration=("You sign the restitution agreement with the same hand that once signed a SAFT in "
                    "a garage, the pen a courthouse pen, chained to the counter. The frozen wallet "
                    "unlocks in stages, most of it routed straight to the fund for people who lost real "
                    "money over a decision made at 2 a.m. What's left, after everything: two million "
                    "one hundred thousand dollars. Less than you'd have made staying at the old job and "
                    "never quitting at all."),
         overlay=dict(big="$2,100,000", sub="AFTER RESTITUTION + LEGAL")),
    dict(id="t28", level=None, template="emptyChair",
         narration=("The restitution fund pays out to eleven thousand wallets you'll never meet, in "
                    "amounts that don't undo anyone's year. Special Agent Ruiz's card is still in your "
                    "desk drawer — a case number for ghost.eth that was never closed, not yours to "
                    "solve anymore. The chair across from yours, the one that used to be Naomi's, stays "
                    "empty in every meeting from here on, by nobody's decision but somehow everybody's."),
         overlay=None),
    dict(id="t29", level=None, template="serverScale",
         narration=("A v2 token launches eight months later, smaller, three signers required for "
                    "anything above ten thousand dollars, an audit firm on retainer nobody argues about "
                    "anymore, the new office half the size of the old one. It's the company you should "
                    "have built the first time. Fewer people notice it exists. That, it turns out, might "
                    "be the actual point."),
         overlay=None),

    # ---- LEVEL 09 · DAY 900 · THE OTHER SIDE OF THE TABLE ----
    dict(id="t30", level="LEVEL 09  ·  DAY 900  ·  THE DECK YOU DON'T OPEN", template="rooftopEmpire",
         narration=("The new apartment has a better view and a cold-storage brick returned by the "
                    "lawyers, empty now — the coins moved to the restitution fund months ago. You still "
                    "loop the lanyard over your head most mornings, out of habit. Your voice doesn't "
                    "shake anymore, in meetings, in interviews, in rooms that used to make it shake. "
                    "That's the part that should worry you."),
         overlay=None),
    dict(id="t31", level=None, template="lobby",
         narration=("A twenty-four-year-old walks into your actual lobby with a deck under one arm and "
                    "the exact posture you had in the garage — sure the number is going to change "
                    "everything, not yet sure what the number is going to cost. Rain on the glass "
                    "behind her. She pitches for eleven minutes without a single breath that sounds "
                    "like doubt."),
         overlay=None,
         dialogue=dict(text="Billion or zero. I know how that sounds.")),

    # ---- LOOP CLOSE — complicit silence, not a handoff ----
    dict(id="t32", level=None, template="deskClose", gap=0.7,
         narration=("You've read four hundred decks like this since the settlement. This one you "
                    "actually like. Your thumb hovers over reply exactly the way a stranger's once "
                    "hovered over yours, nine funds and one expensive lesson ago. You close the laptop "
                    "instead. Somewhere in a garage tonight, someone is telling themselves the number "
                    "and the cost aren't going to turn out to be the same number. They're wrong too. "
                    "You already know it. You don't say so."),
         overlay=None),
]
