#!/usr/bin/env python3
"""The Office Company That Burned $47 Billion — CRAYON-format explainer, ~16-17 min.

FORMAT: third-person past-tense explainer about a REAL subject (docs/BIBLE.md §1). Every date, figure
and quote is verified in docs/research/wework.md with a source; anything unverifiable to that standard
is in that file's CUT list and is absent here (no WeGrow enrollment numbers, no "fired" framing, no
paraphrased Neumann quote about money, no post-2024 operating status). Register: wry and comic-adjacent
for the business absurdity (the mission statement, "Community Adjusted EBITDA"), sober on the layoffs
(mood="grim") — no criminal fraud and no victims who lost their life savings here, so a harder noir
register would overstate the story; a callous one on the 2,400 layoffs would understate it.

R1/R4 SAFETY NOTE: docs/research/wework.md states explicitly that nobody in this story was criminally
charged, convicted or sentenced — this is a governance/business-failure story. The script makes no
claim of that kind about any named person: Neumann "resigned," "gave the money back," "walked away"
from a bid — never "convicted," "pleaded," or "sentenced." Rebekah Neumann and Miguel McKelvey appear
only with the roles the research file documents (co-founder/chief brand officer; co-founder/architect
of the shared design), no legal claims attached.

STRUCTURAL VARIATION vs the last two PRODUCED crayon-format episodes (madoff 08-30, ftx 09-04 — the
two directly before this one in ops/produced_topics.json): both opened on the classic five-step
THESIS hook ("This is the story of...") naming a person, and both closed on REFLECTION + COMPLICIT
"WE" + QUOTE CALLBACK (madoff added a forward tease, ftx did not). This script instead opens on the
BIBLE §4 documented QUESTION-THESIS variant reserved for a systemic/company subject with no single
birthplace ("So how does forty billion dollars just vanish in six weeks? Rewind to 2010.") and closes
on a QUOTE CALLBACK + FORWARD TEASE with no complicit "we" — the one closing shape neither prior
episode used. Five chapters shaped rise -> mechanism -> reversal -> collapse -> reckoning, distinct
from ftx's rise -> mechanism -> reversal -> collapse -> verdict (there is no criminal verdict here;
the last chapter is a slow financial reckoning spanning years, not a single sentencing day).

CHAPTERS (§1, `Evocative Noun: Plain Explanation`, emitted as card=dict(kind="chapter", ...) and used
verbatim in the description timestamps):
  1 The Believer   : A Startup That Sold a Feeling
  2 The Ledger     : Rented Long, Sold Short
  3 The Filing     : The Document That Broke Itself
  4 The Withdrawal : Six Weeks, Forty Billion Gone
  5 The Reckoning  : Forty-Seven Billion to Bankruptcy

PROMISE -> PAYOFF LEDGER:
  * Hook promise: a $47B company that "didn't own a single building" and lost $40B in six weeks ->
    mechanism Ch2 defines exactly how (a 15-year lease sold as a 1-month membership) -> proven real
    Ch3-4 (the S-1 reversal, the withdrawn IPO, the SoftBank rescue) -> read back in Ch5 as the same
    mismatch that finally forced the 2023 bankruptcy.
  * Masayoshi Son's "smart guy or crazy guy" quote and Neumann's "Crazy guy" answer, planted Ch1 as
    the founding myth -> paid off Ch5 (Son's own "I was wrong" reckoning) -> paid off again as the
    CLOSING QUOTE CALLBACK ("The crazy guy," Neumann had answered) -> turned into the FORWARD TEASE
    (a16z's $350M bet on Flow proves the same pitch still works on someone).
  * "Our mission is to elevate the world's consciousness," planted Ch1 as the company's own words ->
    read back Ch3 verbatim, now inside the S-1 that helped sink the IPO.
  * The $5.9M "We" trademark payment to a Neumann-controlled entity, planted Ch3 as the governance
    red flag -> paid off same chapter (he gave it back; too late).
  * The 20-votes-per-share stock, planted Ch3 -> paid off same chapter (cut to 10, still didn't help)
    -> read back Ch4 as one more reason the $47B number stopped being believed.
  * Neumann's up-to-$1.7B exit package (shares + consulting fee + loan credit), planted Ch4, is the
    "wait — that's real?" share beat, set directly against the 2,400 employees laid off two months
    later with nothing.
  * The 15-year-lease-vs-1-month-membership mismatch, defined Ch2 as a mortgage-and-Airbnb analogy ->
    read back Ch5 ("the mismatch chapter two described finally ran out of guests to cover it") as the
    actual mechanical cause of the 2023 Chapter 11 filing, distinct from the 2019 IPO collapse.
  * MIDPOINT REVERSAL (§5, "the moment the subject's own machine turns on them"): the S-1 filing
    itself — the document written to sell the IPO — is read by the investors it was written for, and
    turns the $47B number into a warning instead of a price. gap=1.4 on the scene immediately before
    that line lands.
  * share-worthy beat #1: a company paid $5.9 million to its own founder for the rights to its own
    name.
  * share-worthy beat #2: "Community Adjusted EBITDA" — a company invented its own profit metric that
    added back marketing, building costs, and the losses on desks nobody had even rented yet.
  * share-worthy beat #3: the man who cost the company $40 billion left the wreckage richer than he
    started, and two years later a venture firm handed him $350 million to do something similar again.

Numbers, sentence lengths and WPM are self-checked against docs/BIBLE.md §3 before build. Vocabulary is
deliberately short (Anglo-Saxon over Latinate) to hit the syllables-per-word band the WPM gate requires
(docs/BIBLE.md §3a "THE WPM RULE IS A RULE ABOUT WORD LENGTH").
"""

FPS = 30

NARRATION_RATE = "-5%"   # matches the current channel-wide retune (docs/BIBLE.md §3), unchanged here

SCENES = [
    # ================= HOOK =================
    dict(id="t001", level=None, template="closeUpPortrait",
         narration="In January 2019, one firm was worth forty-seven billion dollars.", overlay=None),

    dict(id="t002", level=None, template="chartBoard", chart="up",
         narration="It didn't own a single building it worked out of.", overlay=None),

    dict(id="t003", level=None, template="officeFloor",
         narration="It just rented out desks, one at a time.", overlay=None),

    dict(id="t004", level=None, template="crowdQueue", mood="grim",
         narration="That same year, it lost nearly two billion dollars finding out that wasn't enough.", overlay=None),

    dict(id="t005", level=None, template="newsMontage",
         narration="Six weeks after it tried to go public, the forty-seven billion dollar number was simply gone.", overlay=None),

    dict(id="t006", level=None, template="chartBoard", chart="down",
         narration="Not shrunk. Gone.", overlay=None),

    dict(id="t007", level=None, template="courtHearing", breath=True,
         narration="The one filing that was supposed to prove the company right ended up proving it wrong, line by line.",
         overlay=None),

    dict(id="t008", level=None, template="domesticInterior", breath=True,
         narration="So how does forty billion dollars just vanish in six weeks? Rewind to 2010.",
         overlay=None, card=dict(kind="narration", text="A feeling.\nNot a business.")),

    # ================= CH 1: The Believer =================
    dict(id="t009", level="CH 1", template="cityStreet", breath=True,
         narration="Brooklyn, New York, 2010. Two men bet an office could sell a feeling, not just a desk.",
         overlay=None, card=dict(kind="chapter", title="The Believer", subtitle="A Startup That Sold a Feeling", hold=2.4)),

    dict(id="t010", level=None, template="officeFloor",
         narration="Adam Neumann and Miguel McKelvey had already tried something like it once.", overlay=None),

    dict(id="t011", level=None, template="domesticInterior",
         narration="In 2008, they'd run a small green coworking space in Brooklyn, called GreenDesk.", overlay=None),

    dict(id="t012", level=None, template="cityStreet",
         narration="They sold their stake in it, and started over.", overlay=None),

    dict(id="t013", level=None, template="officeFloor",
         narration="This time, they called it WeWork.", overlay=None),

    dict(id="t014", level=None, template="boardroom",
         narration="The first location opened in Manhattan's SoHo, backed by fifteen million dollars from an early investor.", overlay=None),

    dict(id="t015", level=None, template="domesticInterior",
         narration="Adam's wife, Rebekah Neumann, joined as a co-founder too, running its brand.", overlay=None),

    dict(id="t016", level=None, template="crowdQueue",
         narration="The pitch itself was simple: rent a desk by the month, and buy a community along with it.", overlay=None),

    dict(id="t017", level=None, template="domesticInterior",
         narration="Backers kept asking the same question.", overlay=None,
         bubbles=[dict(text="How is this different from a normal office lease?", speaker="left"),
                  dict(text="We're not selling a lease. We're selling a feeling.", speaker="right", at=2.0)]),

    dict(id="t018", level=None, template="chartBoard", chart="up",
         narration="Between 2014 and 2016, its worth climbed from one point four billion dollars to ten point five billion.",
         overlay=None),

    dict(id="t018b", level=None, template="closeUpPortrait",
         narration="You'd have called that a good bet, in 2016.", overlay=None),

    dict(id="t019", level=None, template="officeFloor",
         narration="Within a few years, it wasn't just a New York firm anymore.", overlay=None),

    dict(id="t020", level=None, template="cityStreet",
         narration="London. Tel Aviv. Shanghai. New cities, every few months.", overlay=None,
         panels=dict(variant="grid4", cells=[dict(template="cityStreet"), dict(template="officeFloor"),
                                              dict(template="boardroom"), dict(template="domesticInterior")])),

    dict(id="t021", level=None, template="boardroom",
         narration="Miguel McKelvey, the architect of the two, designed the look every location shared.", overlay=None),

    dict(id="t022", level=None, template="domesticInterior",
         narration="Glass walls. Reclaimed wood. A ping-pong table no one ever quite finished a game on.", overlay=None),

    dict(id="t023", level=None, template="boardroom",
         narration="In 2017, the world's biggest tech investor came calling.", overlay=None),

    dict(id="t024", level=None, template="closeUpPortrait",
         narration="SoftBank's Masayoshi Son visited WeWork's New York office.", overlay=None),

    dict(id="t025", level=None, template="domesticInterior", breath=True,
         narration="He stayed about thirty minutes.", overlay=None),

    dict(id="t026", level=None, template="boardroom",
         narration="Son asked him one question.", overlay=None,
         bubbles=[dict(text="In a fight, who wins -- the smart guy or the crazy guy?", speaker="left"),
                  dict(text="Crazy guy.", speaker="right", at=2.4)]),

    dict(id="t027", level=None, template="closeUpPortrait", breath=True,
         narration="Son didn't stop there. \"You are correct,\" he said, \"but you and Miguel are not crazy enough\" -- and backed the sentence with four point four billion dollars.",
         overlay=None, card=dict(kind="narration", text="\"Not crazy\nenough.\"")),

    dict(id="t028", level=None, template="chartBoard", chart="up",
         narration="Four point four billion dollars, through SoftBank's Vision Fund.",
         overlay=dict(big="$4.4B", sub="ONE MEETING, SOFTBANK")),

    dict(id="t029", level=None, template="officeFloor",
         narration="\"Crazy\" stopped being a warning. It became the business plan.", overlay=None),

    dict(id="t030", level=None, template="cityStreet",
         narration="New offices opened faster than most firms could staff them.", overlay=None),

    dict(id="t031", level=None, template="officeFloor",
         narration="Construction crews built out new floors nearly as fast as leases got signed.", overlay=None),

    dict(id="t032", level=None, template="domesticInterior",
         narration="Free beer on tap. Kombucha in the hallway. Team-building at ten on a Tuesday.", overlay=None),

    dict(id="t032b", level=None, template="crowdQueue",
         narration="You could believe almost anything, one free kombucha at a time.", overlay=None),

    dict(id="t033", level=None, template="officeFloor",
         narration="Former workers told the press Neumann sometimes walked the office barefoot.", overlay=None),

    dict(id="t034", level=None, template="chartBoard", chart="up",
         narration="None of it slowed the money down.", overlay=None),

    dict(id="t035", level=None, template="cityStreet",
         narration="By January 2019, it went by a bigger name: The We Company.", overlay=None),

    dict(id="t036", level=None, template="boardroom",
         narration="Another SoftBank-led round valued it at forty-seven billion dollars.",
         overlay=None, card=dict(kind="narration", text="$47 billion.")),

    dict(id="t037", level=None, template="closeUpPortrait",
         narration="Neumann's own stake was suddenly worth billions, on paper.", overlay=None),

    dict(id="t038", level=None, template="broadcastDesk",
         narration="\"Our mission,\" the firm would soon write, \"is to elevate the world's consciousness.\"",
         overlay=None, card=dict(kind="narration", text="\"Elevate the\nworld's consciousness.\"")),

    dict(id="t039", level=None, template="crowdQueue",
         narration="Underneath all of it, the business still just rented out desks.", overlay=None),

    dict(id="t040", level=None, template="officeFloor", breath=True,
         narration="Five hundred twenty-eight locations, and counting, by the middle of 2019.", overlay=None),

    dict(id="t041", level=None, template="domesticInterior",
         narration="Half its memberships now sat outside the United States.", overlay=None),

    dict(id="t042", level=None, template="bankExterior",
         narration="Forty percent of them were big firms now, not lone freelancers.", overlay=None),

    dict(id="t043", level=None, template="officeFloor",
         narration="On paper, it looked like it couldn't lose.", overlay=None),

    dict(id="t044", level=None, template="boardroom", breath=True,
         narration="But paper is exactly the word to watch.", overlay=None),

    # ================= CH 2: The Ledger =================
    dict(id="t045", level="CH 2", template="bankExterior", breath=True,
         narration="Here's the part almost no one outside WeWork understood.",
         overlay=None, card=dict(kind="chapter", title="The Ledger", subtitle="Rented Long, Sold Short", hold=2.4)),

    dict(id="t046", level=None, template="officeFloor",
         narration="WeWork's real business wasn't offices. It was a bet on time.", overlay=None),

    dict(id="t047", level=None, template="bankExterior",
         narration="A landlord signs a mortgage for thirty years. That's fixed.", overlay=None),

    dict(id="t048", level=None, template="chartBoard", chart="flat",
         narration="WeWork signed leases that ran about fifteen years, on average.", overlay=None),

    dict(id="t049", level=None, template="exchangeFloor", breath=True,
         narration="Picture a fifteen-year mortgage on a house, rented out room by room through an app where any guest can cancel with five days' notice. If the guests keep coming, it works beautifully. If they stop, the mortgage doesn't care.",
         overlay=None),

    dict(id="t050", level=None, template="officeFloor",
         narration="Average membership: about nineteen months.", overlay=None),

    dict(id="t051", level=None, template="domesticInterior",
         narration="Cancel with five days' notice, and walk.", overlay=None),

    dict(id="t051b", level=None, template="bankExterior",
         narration="You wouldn't sign a mortgage like that yourself. WeWork signed five hundred of them.", overlay=None),

    dict(id="t052", level=None, template="crowdQueue", mood="grim",
         narration="That was the whole flaw, sitting in plain sight.", overlay=None),

    dict(id="t053", level=None, template="chartBoard", chart="flat",
         narration="A dollar of rent going out, promised for fifteen years.", overlay=None),

    dict(id="t054", level=None, template="domesticInterior",
         narration="A dollar of membership coming in, promised for one month.", overlay=None),

    dict(id="t055", level=None, template="officeFloor",
         narration="Multiply that gap by five hundred buildings, and it stops being a rounding error.", overlay=None),

    dict(id="t056", level=None, template="crowdQueue",
         narration="It becomes the whole firm's weather.", overlay=None),

    dict(id="t057", level=None, template="chartBoard", chart="up",
         narration="For years, the guests kept coming.", overlay=None),

    dict(id="t057b", level=None, template="domesticInterior",
         narration="Money followed.", overlay=None),

    dict(id="t058", level=None, template="officeFloor",
         narration="Revenue climbed every year. So did the losses.", overlay=None),

    dict(id="t059", level=None, template="bankExterior",
         narration="In 2018, it brought in one point eight two billion dollars.",
         overlay=dict(big="$1.82B", sub="2018 REVENUE")),

    dict(id="t060", level=None, template="boardroom",
         narration="And lost one point nine three billion dollars doing it.",
         overlay=dict(big="-$1.93B", sub="2018 NET LOSS")),

    dict(id="t061", level=None, template="broadcastDesk",
         narration="Almost a dollar lost for every dollar earned.", overlay=None),

    dict(id="t062", level=None, template="boardroom",
         narration="By normal math, that's a firm on fire.", overlay=None),

    dict(id="t063", level=None, template="officeFloor",
         narration="WeWork didn't use normal accounting.", overlay=None),

    dict(id="t064", level=None, template="chartBoard", chart="flat",
         narration="It invented its own number instead: Community Adjusted EBITDA.",
         overlay=None, card=dict(kind="narration", text="\"Community\nAdjusted EBITDA.\"")),

    dict(id="t065", level=None, template="broadcastDesk",
         narration="A regular EBITDA adds back interest, taxes, and depreciation.", overlay=None),

    dict(id="t066", level=None, template="chartBoard", chart="flat", breath=True,
         narration="WeWork's version also added back marketing, building costs, and even the losses on desks no one had rented yet.",
         overlay=None),

    dict(id="t067", level=None, template="broadcastDesk",
         narration="Strip out everything expensive enough, and almost any firm can look like it's making money.", overlay=None),

    dict(id="t067b", level=None, template="officeFloor",
         narration="You don't need a finance degree to spot math this cooked.", overlay=None),

    dict(id="t068", level=None, template="closeUpPortrait", mood="grim",
         narration="Critics had a simpler name for it.", overlay=None),

    dict(id="t069", level=None, template="newsMontage",
         narration="Critics started calling it fantasy math.",
         overlay=None, card=dict(kind="word", word="FANTASY")),

    dict(id="t070", level=None, template="crowdQueue",
         narration="For now, almost no one outside finance was reading that closely.", overlay=None),

    dict(id="t071", level=None, template="officeFloor",
         narration="Five hundred twenty-eight locations, worldwide.",
         overlay=dict(big="528", sub="LOCATIONS WORLDWIDE")),

    dict(id="t072", level=None, template="exchangeFloor",
         narration="Big banks. Ad agencies. Even other startups. Enterprise clients moved in too.", overlay=None),

    dict(id="t073", level=None, template="bankExterior",
         narration="It looked, from a distance, like a normal landlord.", overlay=None),

    dict(id="t074", level=None, template="domesticInterior",
         narration="It wasn't. A normal landlord doesn't sell kombucha and a mission statement.", overlay=None),

    dict(id="t075", level=None, template="boardroom",
         narration="The pitch had grown up. The math hadn't.", overlay=None),

    dict(id="t076", level=None, template="cityStreet",
         narration="And in August of 2019, it finally had to show its math to everyone.", overlay=None),

    # ================= CH 3: The Filing =================
    dict(id="t077", level="CH 3", template="officeFloor", breath=True,
         narration="August 14th, 2019. The We Company filed to go public.",
         overlay=None, card=dict(kind="chapter", title="The Filing", subtitle="The Document That Broke Itself", hold=2.4)),

    dict(id="t078", level=None, template="courtHearing",
         narration="An S-1 is supposed to read like a phone book. This one didn't.", overlay=None),

    dict(id="t079", level=None, template="broadcastDesk",
         narration="It opened with that same mission statement -- to elevate the world's consciousness.",
         overlay=None, card=dict(kind="narration", text="\"Elevate the\nworld's consciousness.\"")),

    dict(id="t080", level=None, template="crowdQueue",
         narration="The press read the line out loud, and laughed.", overlay=None),

    dict(id="t081", level=None, template="newsMontage",
         narration="Then they found the numbers sitting underneath it.", overlay=None),

    dict(id="t082", level=None, template="chartBoard", chart="down",
         narration="Over nine hundred million dollars lost in the first six months of 2019 alone.",
         overlay=dict(big="-$900M", sub="FIRST HALF OF 2019")),

    dict(id="t083", level=None, template="boardroom",
         narration="On one point five four billion dollars of revenue.", overlay=None),

    dict(id="t084", level=None, template="broadcastDesk",
         narration="Then came the rules.", overlay=None),

    dict(id="t085", level=None, template="officeFloor",
         narration="It had paid five point nine million dollars for the rights to its own name.",
         overlay=None, card=dict(kind="objects", items=["safe", "coinStack"])),

    dict(id="t086", level=None, template="boardroom",
         narration="The trademark belonged to a firm Neumann controlled personally.", overlay=None,
         bubbles=[dict(text="Who actually owns the trademark on the word 'We'?", speaker="left"),
                  dict(text="Technically? Adam does. We bought it from him.", speaker="right", at=2.2)]),

    dict(id="t087", level=None, template="closeUpPortrait", mood="grim",
         narration="The backlash was immediate.", overlay=None),

    dict(id="t088", level=None, template="officeFloor",
         narration="He gave the money back.", overlay=None),

    dict(id="t089", level=None, template="boardroom",
         narration="By then, it was too late to fix the damage.", overlay=None),

    dict(id="t090", level=None, template="chartBoard", chart="flat",
         narration="Then there was the stock.", overlay=None),

    dict(id="t091", level=None, template="boardroom",
         narration="Neumann's own shares carried twenty votes each, against one for everyone else.",
         overlay=None, card=dict(kind="narration", text="20 votes.\nPer share.")),

    dict(id="t092", level=None, template="broadcastDesk",
         narration="No sunset. No end date. Just control, full stop.", overlay=None),

    dict(id="t093", level=None, template="boardroom",
         narration="Under pressure, the firm cut it down to ten votes a share.", overlay=None),

    dict(id="t094", level=None, template="crowdQueue", mood="grim",
         narration="It didn't help.", overlay=None),

    dict(id="t095", level=None, template="broadcastDesk",
         narration="Wall Street had seen firms lose money and still go public before.", overlay=None),

    dict(id="t096", level=None, template="boardroom",
         narration="It had rarely seen one explain its own math this strangely.", overlay=None),

    dict(id="t097", level=None, template="closeUpPortrait",
         narration="Analysts started asking a blunter question: was this a real-estate firm, or a story?", overlay=None),

    dict(id="t098", level=None, template="newsMontage",
         narration="One filing. A mission statement, a trademark payment, stock rules, and a nine-figure loss -- all in the same two hundred pages.",
         overlay=None,
         panels=dict(variant="grid4", cells=[dict(template="newsMontage"), dict(template="broadcastDesk"),
                                              dict(template="chartBoard"), dict(template="officeFloor")])),

    dict(id="t099", level=None, template="boardroom", breath=True, gap=1.4,
         narration="For six weeks, bankers had been telling backers it was worth forty-seven billion dollars.",
         overlay=None),

    dict(id="t100", level=None, template="closeUpPortrait", mood="grim", breath=True,
         narration="Then investors read the two hundred pages themselves -- the mission statement, the trademark, the twenty votes a share -- and forty-seven billion dollars stopped sounding like a price, and started sounding like a warning.",
         overlay=None),

    dict(id="t101", level=None, template="newsMontage",
         narration="The roadshow was supposed to confirm the price.", overlay=None),

    dict(id="t102", level=None, template="chartBoard", chart="down",
         narration="Instead, bankers started quietly cutting it.", overlay=None),

    dict(id="t103", level=None, template="bankExterior",
         narration="Guidance fell to somewhere between ten and twelve billion dollars.",
         overlay=None, card=dict(kind="narration", text="$47B ->\n$10-12B.")),

    dict(id="t104", level=None, template="broadcastDesk", mood="grim",
         narration="Less than a quarter of where it started, in the same six weeks.", overlay=None),

    dict(id="t105", level=None, template="boardroom", breath=True,
         narration="And it hadn't even gone public yet.", overlay=None),

    dict(id="t106", level=None, template="crowdQueue", mood="grim",
         narration="Two hundred pages. Forty billion dollars. One very bad six weeks.", overlay=None),

    # ================= CH 4: The Withdrawal =================
    dict(id="t107", level="CH 4", template="cityStreet", breath=True,
         narration="September 24th, 2019.",
         overlay=None, card=dict(kind="chapter", title="The Withdrawal", subtitle="Six Weeks, Forty Billion Gone", hold=2.4)),

    dict(id="t108", level=None, template="boardroom", mood="grim",
         narration="Under pressure from investors and his own board, Adam Neumann resigned as CEO.", overlay=None,
         foreground=dict(kind="overShoulder", side="left")),

    dict(id="t109", level=None, template="closeUpPortrait", mood="grim",
         narration="The man who built the company was no longer allowed to run it.", overlay=None),

    dict(id="t110", level=None, template="officeFloor",
         narration="Six days later, on September 30th, it withdrew its IPO filing entirely.", overlay=None),

    dict(id="t111", level=None, template="newsMontage",
         narration="Withdrawn.", overlay=None, card=dict(kind="word", word="WITHDRAWN")),

    dict(id="t112", level=None, template="crowdQueue", mood="grim",
         narration="No public shares. No trading day. No forty-seven billion dollars.", overlay=None),

    dict(id="t113", level=None, template="bankExterior",
         narration="By the time bankers finished the math on a rescue, the number on the table was closer to seven or eight billion.",
         overlay=None),

    dict(id="t114", level=None, template="chartBoard", chart="down",
         narration="Close to forty billion dollars, gone, in about six weeks.",
         overlay=dict(big="-$38B", sub="IN SIX WEEKS")),

    dict(id="t115", level=None, template="bankExterior",
         narration="SoftBank stepped in with a rescue package worth roughly nine and a half billion dollars.", overlay=None,
         foreground=dict(kind="overShoulder", side="right")),

    dict(id="t116", level=None, template="boardroom",
         narration="Part of the deal covered Neumann's own exit.", overlay=None,
         bubbles=[dict(text="What does Adam walk away with?", speaker="left"),
                  dict(text="Enough that nobody calls it a firing.", speaker="right", at=2.0)]),

    dict(id="t117", level=None, template="chartBoard", chart="up", breath=True,
         narration="Up to one point seven billion dollars, total: nine hundred seventy million for his shares, a hundred eighty-five million billed as a consulting fee, and five hundred million more in credit against his own loans.",
         overlay=None, card=dict(kind="narration", text="$1.7 billion.\nOn the way out.")),

    dict(id="t118", level=None, template="crowdQueue", mood="grim",
         narration="The man who lost the company forty billion dollars left richer than when he started.", overlay=None),

    dict(id="t118b", level=None, template="domesticInterior", mood="grim",
         narration="You don't get a severance like that. Neither did they.", overlay=None),

    dict(id="t119", level=None, template="officeFloor", mood="grim",
         narration="Two months later, the bill came due for everyone else.", overlay=None),

    dict(id="t120", level=None, template="boardroom", mood="grim",
         narration="Board meetings that used to run on excitement now ran on damage control.", overlay=None),

    dict(id="t121", level=None, template="crowdQueue", mood="grim",
         narration="November 21st, 2019. Twenty-four hundred employees were laid off.",
         overlay=dict(big="2,400", sub="LAID OFF -- 19% OF STAFF")),

    dict(id="t122", level=None, template="officeFloor", mood="grim",
         narration="About one in five people who worked there.", overlay=None),

    dict(id="t123", level=None, template="domesticInterior", mood="grim",
         narration="None of them got a consulting fee on the way out.", overlay=None),

    dict(id="t124", level=None, template="officeFloor", mood="grim",
         narration="Workers found out where the firm stood from the same headlines everyone else did.", overlay=None),

    dict(id="t125", level=None, template="bankExterior",
         narration="Landlords who'd signed those fifteen-year leases were suddenly paying very close attention.", overlay=None),

    dict(id="t126", level=None, template="broadcastDesk", mood="grim",
         narration="Neumann still owned a large piece of the firm he no longer ran.", overlay=None),

    dict(id="t127", level=None, template="newsMontage",
         narration="The press who'd once written the myth started unwriting it, line by line.", overlay=None),

    dict(id="t128", level=None, template="officeFloor", breath=True,
         narration="The crazy guy had been right about one thing all along: someone was always going to pay for the belief.",
         overlay=None),

    # ================= CH 5: The Reckoning =================
    dict(id="t129", level="CH 5", template="boardroom", breath=True,
         narration="May 2020. SoftBank held its own earnings call.",
         overlay=None, card=dict(kind="chapter", title="The Reckoning", subtitle="Forty-Seven Billion to Bankruptcy", hold=2.4)),

    dict(id="t130", level=None, template="closeUpPortrait", mood="grim",
         narration="Masayoshi Son, the man who'd handed Neumann four billion dollars after one meeting, had his own confession to make.",
         overlay=None, foreground=dict(kind="overShoulder", side="right")),

    dict(id="t131", level=None, template="broadcastDesk", mood="grim",
         narration="\"We made a failure on investing in WeWork,\" Son told investors, \"and I've been admitting that several times I was foolish.\"",
         overlay=None),

    dict(id="t132", level=None, template="newsMontage", mood="grim",
         narration="\"I was wrong,\" he said, separately, on the same call.",
         overlay=None, card=dict(kind="narration", text="\"I was\nwrong.\"")),

    dict(id="t133", level=None, template="chartBoard", chart="down",
         narration="SoftBank marked its own stake down to two point nine billion dollars.",
         overlay=dict(big="$2.9B", sub="SOFTBANK'S NEW PRICE TAG")),

    dict(id="t134", level=None, template="bankExterior",
         narration="Down from forty-seven billion, eighteen months earlier.", overlay=None),

    dict(id="t135", level=None, template="boardroom",
         narration="SoftBank had put in about eighteen and a half billion dollars, total, chasing that number.", overlay=None),

    dict(id="t136", level=None, template="crowdQueue",
         narration="For a while, it just kept running -- smaller, quieter, still renting desks.", overlay=None),

    dict(id="t137", level=None, template="officeFloor",
         narration="In March 2021, it found a second way onto the stock market.", overlay=None),

    dict(id="t138", level=None, template="exchangeFloor", chart="up",
         narration="A SPAC merger, pricing it at about nine billion dollars.", overlay=None),

    dict(id="t139", level=None, template="chartBoard", chart="up", mood="bright",
         narration="That October, shares jumped more than thirteen percent on their first day of trading.", overlay=None),

    dict(id="t140", level=None, template="broadcastDesk",
         narration="Nine billion still sounded like a comeback, next to nothing.", overlay=None),

    dict(id="t141", level=None, template="chartBoard", chart="down",
         narration="It also meant most of the peak was simply never coming back.", overlay=None),

    dict(id="t142", level=None, template="newsMontage",
         narration="Going public by SPAC skipped the roadshow that broke it the first time.", overlay=None),

    dict(id="t143", level=None, template="broadcastDesk",
         narration="No one read two hundred pages before this listing. There wasn't one to pick apart.", overlay=None),

    dict(id="t144", level=None, template="officeFloor",
         narration="For a moment, that felt like a fix.", overlay=None),

    dict(id="t145", level=None, template="chartBoard", chart="down",
         narration="It wasn't. The fifteen-year leases hadn't gone anywhere.", overlay=None),

    dict(id="t146", level=None, template="domesticInterior",
         narration="By then, Neumann had already moved on to his next idea.", overlay=None,
         card=dict(kind="objects", items=["houseModel", "briefcase"])),

    dict(id="t147", level=None, template="boardroom",
         narration="A housing startup, called Flow.", overlay=None),

    dict(id="t148", level=None, template="officeFloor",
         narration="One venture firm bet the pitch still worked.", overlay=None,
         bubbles=[dict(text="This is the guy who just lost forty billion dollars, right?", speaker="left"),
                  dict(text="And we're writing him our biggest check ever.", speaker="right", at=2.2)]),

    dict(id="t149", level=None, template="chartBoard", chart="up",
         narration="Three hundred fifty million dollars, before Flow had even launched.",
         overlay=dict(big="$350M", sub="INTO NEUMANN'S NEXT COMPANY")),

    dict(id="t150", level=None, template="broadcastDesk",
         narration="Valued at a billion dollars, on belief alone.", overlay=None),

    dict(id="t151", level=None, template="crowdQueue", mood="grim",
         narration="Meanwhile, the firm he'd built kept sinking.", overlay=None),

    dict(id="t152", level=None, template="officeFloor",
         narration="Office demand never fully came back to what those fifteen-year leases assumed.", overlay=None),

    dict(id="t153", level=None, template="crowdQueue", mood="grim",
         narration="The mismatch chapter two described finally ran out of guests to cover it.", overlay=None),

    dict(id="t154", level=None, template="chartBoard", chart="down",
         narration="By August 2023, it was worth around two hundred seventy million dollars.",
         overlay=dict(big="$270M", sub="vs $47B AT PEAK")),

    dict(id="t155", level=None, template="broadcastDesk", mood="grim",
         narration="It warned, in writing, that it might not survive.", overlay=None),

    dict(id="t156", level=None, template="crowdQueue", mood="grim",
         narration="The firm that once sold the future of work couldn't guarantee its own.", overlay=None),

    dict(id="t157", level=None, template="courtHearing", mood="grim", breath=True,
         narration="On November 6th, 2023, WeWork and five hundred seventeen linked firms filed for bankruptcy in New Jersey, listing eighteen point six billion dollars in debt against fifteen billion dollars in assets.",
         overlay=None),

    dict(id="t158", level=None, template="chartBoard", chart="flat",
         narration="Ninety percent of lenders agreed to trade three billion dollars of debt for equity instead.", overlay=None),

    dict(id="t159", level=None, template="courtHearing",
         narration="The filing didn't even reach the offices outside the U.S. and Canada.", overlay=None),

    dict(id="t160", level=None, template="closeUpPortrait", mood="grim",
         narration="The firm Adam Neumann built no longer belonged to people who believed in the mission.", overlay=None),

    dict(id="t161", level=None, template="bankExterior",
         narration="It belonged to whoever was owed money.", overlay=None),

    dict(id="t162", level=None, template="boardroom",
         narration="Neumann, backed by Flow, tried to buy it back.", overlay=None),

    dict(id="t163", level=None, template="chartBoard", chart="up",
         narration="A bid reported around five hundred million dollars.",
         overlay=None, card=dict(kind="narration", text="$500 million.\nTo buy it back.")),

    dict(id="t164", level=None, template="boardroom", mood="grim",
         narration="By spring of 2024, he'd walked away from that too.", overlay=None),

    dict(id="t165", level=None, template="closeUpPortrait",
         narration="\"Disappointing,\" was the word he used, in public, about the whole thing.", overlay=None),

    dict(id="t166", level=None, template="courtHearing", breath=True,
         narration="June 11th, 2024. It came out of bankruptcy, as a private firm.", overlay=None),

    dict(id="t167", level=None, template="chartBoard", chart="up",
         narration="More than four billion dollars of debt, erased.",
         overlay=dict(big="$4B+", sub="DEBT ERASED")),

    dict(id="t168", level=None, template="bankExterior",
         narration="Future lease payments, roughly cut in half.", overlay=None),

    dict(id="t169", level=None, template="chartBoard", chart="up",
         narration="About four hundred fifty million dollars in new money, raised to keep it running.", overlay=None),

    dict(id="t170", level=None, template="officeFloor",
         narration="It still rents out desks.", overlay=None),

    dict(id="t171", level=None, template="domesticInterior", breath=True,
         narration="Fourteen years after two men in Brooklyn bet an office could sell a feeling, it survived -- without the feeling, and without the man who sold it.",
         overlay=None,
         panels=dict(variant="v2", cells=[dict(template="cityStreet"), dict(template="officeFloor")])),

    # ================= ENDING =================
    dict(id="t172", level=None, template="closeUpPortrait",
         narration="Maybe the strangest part was never the forty-seven billion dollars.", overlay=None),

    dict(id="t172b", level=None, template="domesticInterior",
         narration="You'd have believed him too, once.", overlay=None),

    dict(id="t173", level=None, template="closeUpPortrait",
         narration="Numbers like that come and go. Belief is what's expensive.", overlay=None),

    dict(id="t174", level=None, template="boardroom",
         narration="Son had asked him once who wins a fight -- the smart guy, or the crazy guy.", overlay=None),

    dict(id="t175", level=None, template="closeUpPortrait",
         narration="\"Crazy guy,\" Neumann had answered.",
         overlay=None, card=dict(kind="narration", text="\"The crazy\nguy.\"")),

    dict(id="t176", level=None, template="broadcastDesk", mood="grim",
         narration="By 2020, crazy wasn't charming anymore. It was the whole post-mortem.", overlay=None),

    dict(id="t177", level=None, template="boardroom",
         narration="And yet, two years after his own firm went bankrupt, someone handed him three hundred fifty million dollars for a brand-new one.",
         overlay=None),

    dict(id="t178", level=None, template="closeUpPortrait", breath=True,
         narration="Same pitch. Same believer. A different name on the door.", overlay=None),

    dict(id="t179", level=None, template="domesticInterior",
         narration="Maybe that's the real lesson forty-seven billion dollars bought the rest of us.", overlay=None),

    dict(id="t180", level=None, template="closeUpPortrait", mood="grim",
         narration="Not that the crazy guy lost.", overlay=None),

    dict(id="t181", level=None, template="broadcastDesk", breath=True,
         narration="It's that somewhere, right now, with a straight face and someone else's money, the very same crazy guy is already making the very same pitch, to a brand new room full of believers.",
         overlay=None),
]
