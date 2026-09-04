#!/usr/bin/env python3
"""How Sam Bankman-Fried Actually Lost $8 Billion — CRAYON-format explainer, ~16 min.

FORMAT: third-person past-tense explainer about a REAL subject (docs/BIBLE.md §1). Every date, figure
and quote is verified in docs/research/ftx.md with a source; anything unverifiable to that standard is
in that file's CUT list and is absent here (no single "peak net worth" number; the commonly-repeated
ad paraphrase; Michael Lewis's book). Register: straight and noirish, held throughout (§2) — a million
real customers lost real money, so a comic register would read as callous, same reasoning as
lehman_brothers, theranos and madoff.

R1 SAFETY NOTE: docs/research/ftx.md explicitly does not state an open/current legal status for Gary
Wang or Nishad Singh beyond their Dec 2022 guilty pleas (dated, resolved facts). This script makes no
claim about their sentencing status — it only says they pleaded guilty and testified, which the file
supports.

STRUCTURAL VARIATION vs the last two PRODUCED crayon-format episodes (theranos 08-16, madoff 08-30 —
lehman_brothers is three back and volkswagen_dieselgate never published): theranos opened on the
classic five-step THESIS hook and closed on an UNANSWERED QUESTION + QUOTE, four chapters. madoff also
opened on the five-step THESIS hook (required for a person-subject — BIBLE §4 reserves the
question-thesis variant for systemic subjects with no birthplace) and closed on REFLECTION + COMPLICIT
"WE" + QUOTE CALLBACK + a FORWARD TEASE, five chapters. This script also opens on the five-step thesis
hook, but closes on REFLECTION + COMPLICIT "WE" + QUOTE CALLBACK with NO forward tease — the one
closing shape neither prior produced episode used — and shapes its five chapters as
rise -> mechanism -> reversal -> collapse -> verdict, distinct from madoff's
rise -> mechanism -> whistleblower -> confession -> reckoning (this subject has no nine-year
whistleblower arc; the reversal here is external and sudden, not a slow-built warning).

CHAPTERS (§1, `Evocative Noun: Plain Explanation`, emitted as card=dict(kind="chapter", ...) and used
verbatim in the description timestamps):
  1 The Wunderkind : A Trader Who Never Lost
  2 The Backdoor   : One Line of Code, No Rules
  3 The Leak       : A Balance Sheet Nobody Was Supposed to See
  4 The Confession : Five Days That Ended an Empire
  5 The Verdict    : Twenty-Five Years for the King of Crypto

PROMISE -> PAYOFF LEDGER:
  * Hook promise: a $26B fortune that existed mostly "on paper" -> mechanism Ch2 defines exactly how
    (the $65B invented credit line, also "on paper") -> proven hollow Ch3 (the CoinDesk leak, the FTT
    collapse) -> read back in the closing reflection as the fantasy everyone wanted to believe.
  * Larry David's Super Bowl line ("I don't think so. And I'm never wrong about this stuff.") planted
    Ch1 as the joke everyone laughed at -> paid off Ch3 (nobody's laughing anymore) -> paid off again
    as the final CLOSING QUOTE CALLBACK: he was right, and it wasn't a joke.
  * The Miami Heat arena naming deal (19 years, $135M) planted Ch1 as a status symbol -> paid off Ch4
    (the letters come down within months, one of the shortest spent of the original 19 years).
  * Celebrity marketing (Larry David, Tom Brady/Gisele Bündchen, Steph Curry) planted Ch1, explicitly
    as PAID FACES who never audited anything -> nothing more is claimed of them (per the research
    file's class-action caveat: the script never says they knew about or vouched for the fraud).
  * Forbes's "richest under 30" ranking planted Ch1, attributed to Forbes by name -> read back Ch5 as
    part of the closing irony.
  * Gary Wang (wrote the backdoor) and Caroline Ellison (ran Alameda) planted Ch1/Ch2 as co-founders
    -> paid off Ch4 (guilty pleas) -> paid off again Ch5 (their trial testimony against him). Nishad
    Singh planted Ch1 -> paid off Ch4 (guilty plea) -> Ch5 (his own testimony, "blindsided").
  * The $65B invented "credit line" (Ch2) vs the real $8B hole customers were actually owed (hook,
    Ch2, Ch5 forfeiture) -> the share-worthy "two very different numbers" beat, read back at
    sentencing when the $11B forfeiture splits along those exact lines.
  * MIDPOINT REVERSAL (§5, "the moment the subject's own machine turns on them"): Binance's CZ — an
    early investor who took FTT as payment for his own equity stake — announces he will liquidate it,
    turning FTX's own invented token against the company that printed it. gap=1.4 on the scene
    immediately before that line lands.
  * John J. Ray III's Enron comparison, planted Ch4 (he ran Enron's bankruptcy before this one) — the
    "complete failure of corporate controls" line is the chapter's own payoff, no further use needed.
  * share-worthy beat #1: a $65 billion line of credit that existed because of one line of code, and
    nothing else.
  * share-worthy beat #2: FTX's own trading arm was backed by a token FTX itself had printed —
    "picture printing your own poker chips, then borrowing against them."
  * share-worthy beat #3: the press once compared him to J.P. Morgan, the banker who personally
    bailed out Wall Street in 1907 — that same framing became, almost word for word, the charge
    against him.

Numbers, sentence lengths and WPM are self-checked against docs/BIBLE.md §3 before build. Vocabulary is
deliberately short (Anglo-Saxon over Latinate: "watchdogs" not "regulators", "help" not "cooperation",
"took the stand" not "testified", "backup" not "collateral") to hit the syllables-per-word band the WPM
gate requires (docs/BIBLE.md §3a "THE WPM RULE IS A RULE ABOUT WORD LENGTH") — the crypto/finance swap
list there was validated on this exact subject (ftx, 08-23) before.
"""

FPS = 30

NARRATION_RATE = "-5%"   # matches the current channel-wide retune (docs/BIBLE.md §3), unchanged here

SCENES = [
    # ================= HOOK =================
    dict(id="t001", level=None, template="closeUpPortrait",
         narration="At twenty-nine, Sam Bankman-Fried was worth twenty-six billion dollars.", overlay=None),

    dict(id="t002", level=None, template="crowdQueue", mood="grim",
         narration="A year later, eight billion dollars of his customers' money was simply gone.", overlay=None),

    dict(id="t003", level=None, template="newsMontage",
         narration="A basketball arena scraped his firm's name off the wall.", overlay=None),

    dict(id="t004", level=None, template="courtHearing",
         narration="Congress hauled in his own staff to explain how.", overlay=None),

    dict(id="t005", level=None, template="broadcastDesk",
         narration="And right up until the end, almost everyone still believed him.", overlay=None),

    dict(id="t006", level=None, template="chartBoard", chart="up",
         narration="Backers. Watchdogs. Reporters.", overlay=None),

    dict(id="t007", level=None, template="cityStreet",
         narration="Even the people who lost everything.", overlay=None),

    dict(id="t008", level=None, template="domesticInterior", breath=True,
         narration="This is the story of Sam Bankman-Fried, the boy king of crypto, worth twenty-six billion dollars on paper, who lost eight billion of it that was never his to lose.",
         overlay=None, card=dict(kind="narration", text="The boy king\nof crypto.")),

    # ================= CH 1: The Wunderkind =================
    dict(id="t009", level="CH 1", template="cityStreet", breath=True,
         narration="Berkeley, California, 2017. A college dropout was about to reinvent Wall Street from a rented apartment.",
         overlay=None, card=dict(kind="chapter", title="The Wunderkind", subtitle="A Trader Who Never Lost", hold=2.4)),

    dict(id="t010", level=None, template="officeFloor",
         narration="He wasn't a Wall Street lifer. He was a physics major.", overlay=None),

    dict(id="t011", level=None, template="chartBoard", chart="up",
         narration="In 2014, he graduated MIT and joined Jane Street Capital, a trading firm built on speed.", overlay=None),

    dict(id="t012", level=None, template="exchangeFloor",
         narration="Jane Street taught him one lesson above all others.", overlay=None),

    dict(id="t013", level=None, template="bankExterior",
         narration="Find the gap. Trade it before anyone else notices.", overlay=None),

    dict(id="t014", level=None, template="chartBoard", chart="up",
         narration="By 2017, he'd found a gap the size of a country.", overlay=None),

    dict(id="t015", level=None, template="newsMontage",
         narration="Bitcoin traded for more in Japan than almost anywhere else on earth.", overlay=None),

    dict(id="t016", level=None, template="officeFloor",
         narration="Buy it cheap here. Sell it dear there. Pocket the gap.", overlay=None),

    dict(id="t017", level=None, template="domesticInterior",
         narration="He quit Jane Street and built the whole trade out of a rented Berkeley apartment.",
         overlay=None, card=dict(kind="narration", text="One apartment.\nOne trade.")),

    dict(id="t018", level=None, template="boardroom",
         narration="He called the new firm Alameda Research.", overlay=None),

    dict(id="t019", level=None, template="chartBoard", chart="up",
         narration="It worked. Money multiplied fast, and it kept multiplying.", overlay=None),

    dict(id="t020", level=None, template="officeFloor",
         narration="Two years later, in 2019, he built something bigger: his own exchange.", overlay=None),

    dict(id="t021", level=None, template="exchangeFloor",
         narration="FTX -- a place to trade crypto, built by traders who understood the gaps themselves.",
         overlay=None, card=dict(kind="objects", items=["laptop", "coinStack"])),

    dict(id="t022", level=None, template="officeFloor",
         narration="He didn't build it alone.", overlay=None),

    dict(id="t023", level=None, template="cityStreet",
         narration="Gary Wang, an MIT classmate and former Google engineer, wrote the code.", overlay=None),

    dict(id="t024", level=None, template="boardroom",
         narration="Caroline Ellison, also from Jane Street, ran Alameda.", overlay=None),

    dict(id="t025", level=None, template="officeFloor",
         narration="Nishad Singh led the engineering on the exchange itself.", overlay=None),

    dict(id="t025b", level=None, template="boardroom",
         narration="Around him, a small team came together fast.", overlay=None,
         panels=dict(variant="grid4", cells=[dict(template="officeFloor"), dict(template="boardroom"),
                                              dict(template="exchangeFloor"), dict(template="closeUpPortrait")])),

    dict(id="t026", level=None, template="domesticInterior",
         narration="The pitch was simple, and it worked.", overlay=None,
         bubbles=[dict(text="How is this different from every other exchange?", speaker="left"),
                  dict(text="Ours is built by the people who actually trade on it.", speaker="right", at=2.0)]),

    dict(id="t027", level=None, template="chartBoard", chart="up",
         narration="Money followed. By January 2022, one funding round valued FTX at thirty-two billion dollars.", overlay=None),

    dict(id="t028", level=None, template="boardroom",
         narration="Sequoia signed on. So did SoftBank. So did Temasek.", overlay=None),

    dict(id="t029", level=None, template="exchangeFloor",
         narration="Four hundred million dollars, from investors who do not usually get fooled.", overlay=None),

    dict(id="t030", level=None, template="closeUpPortrait",
         narration="His own stake, on paper, was worth as much as twenty-six billion dollars.", overlay=None),

    dict(id="t031", level=None, template="domesticInterior",
         narration="He still slept on a beanbag. Still wore the same wrinkled t-shirt.", overlay=None),

    dict(id="t032", level=None, template="newsMontage",
         narration="Forbes ranked him the richest person under thirty in America -- by its own count.",
         overlay=None, card=dict(kind="narration", text="Forbes called him\nrichest under 30.")),

    dict(id="t033", level=None, template="broadcastDesk",
         narration="Math genius. College dropout. Billionaire before thirty.", overlay=None),

    dict(id="t034", level=None, template="closeUpPortrait",
         narration="The myth wrote itself, and reporters kept writing it.", overlay=None),

    dict(id="t035", level=None, template="broadcastDesk",
         narration="February 2022. FTX bought a Super Bowl commercial.", overlay=None),

    dict(id="t036", level=None, template="closeUpPortrait",
         narration="Larry David's character dismissed the wheel. The toilet. Coffee. Then FTX -- and said the exact same thing: \"I don't think so. And I'm never wrong about this stuff.\"",
         overlay=None),

    dict(id="t037", level=None, template="broadcastDesk",
         narration="The joke was that skepticism made you look foolish.", overlay=None),

    dict(id="t038", level=None, template="crowdQueue",
         narration="Millions of viewers laughed along, and believed him anyway.", overlay=None),

    dict(id="t039", level=None, template="boardroom",
         narration="Tom Brady and Gisele Bündchen signed on as the faces of the brand.", overlay=None),

    dict(id="t040", level=None, template="broadcastDesk",
         narration="Steph Curry joined months later.", overlay=None),

    dict(id="t041", level=None, template="domesticInterior",
         narration="You'd have trusted the pitch too. Almost everyone who saw it did.", overlay=None,
         bubbles=[dict(text="You really trust this guy with your money?", speaker="left"),
                  dict(text="He's basically a genius. It's fine.", speaker="right", at=2.0)]),

    dict(id="t042", level=None, template="bankExterior",
         narration="None of them built the firm. None of them opened the books.", overlay=None),

    dict(id="t043", level=None, template="crowdQueue",
         narration="They were paid to be seen with him -- and it worked.", overlay=None),

    dict(id="t044", level=None, template="newsMontage",
         narration="That election cycle, he gave forty million dollars to political races.", overlay=None),

    dict(id="t045", level=None, template="boardroom",
         narration="Second only to George Soros, among the people funding Democrats.", overlay=None),

    dict(id="t046", level=None, template="officeFloor",
         narration="Quietly, his colleagues sent comparable money to the other side too.", overlay=None),

    dict(id="t047", level=None, template="broadcastDesk",
         narration="Washington took his calls. Watchdogs took his meetings.", overlay=None),

    dict(id="t048", level=None, template="courtHearing",
         narration="He even spoke to Congress -- calm, boyish, and credible.", overlay=None),

    dict(id="t049", level=None, template="chartBoard", chart="up",
         narration="At its peak, as much as ten billion dollars moved through FTX in a single day.", overlay=None),

    dict(id="t050", level=None, template="bankExterior",
         narration="He signed a nineteen-year deal on the Miami Heat's arena. A hundred thirty-five million dollars.",
         overlay=None, card=dict(kind="narration", text="19 years,\n$135 million.")),

    dict(id="t051", level=None, template="cityStreet",
         narration="FTX ARENA, the letters read, twelve stories tall.", overlay=None),

    dict(id="t052", level=None, template="domesticInterior",
         narration="A pension fund for teachers believed him too -- ninety-five million dollars, across two rounds.", overlay=None),

    dict(id="t053", level=None, template="closeUpPortrait",
         narration="He kept a penthouse in the Bahamas, worth about thirty million dollars.", overlay=None),

    dict(id="t054", level=None, template="broadcastDesk",
         narration="He looked, to almost everyone, like the answer -- not the question.", overlay=None),

    dict(id="t055", level=None, template="boardroom",
         narration="But nobody who met him asked the one question that actually mattered.", overlay=None),

    dict(id="t056", level=None, template="officeFloor",
         narration="Where, exactly, was all that money kept?", overlay=None),

    # ================= CH 2: The Backdoor =================
    dict(id="t057", level="CH 2", template="exchangeFloor", breath=True,
         narration="Two companies. One founder. FTX, the exchange -- and Alameda, the trading firm he'd started first.",
         overlay=None, card=dict(kind="chapter", title="The Backdoor", subtitle="One Line of Code, No Rules", hold=2.4)),

    dict(id="t058", level=None, template="boardroom",
         narration="On paper, a wall stood between them.", overlay=None),

    dict(id="t059", level=None, template="exchangeFloor",
         narration="User money was supposed to just sit there, waiting to be traded.", overlay=None),

    dict(id="t060", level=None, template="chartBoard", chart="flat",
         narration="Here's how a normal account works.", overlay=None),

    dict(id="t061", level=None, template="bankExterior",
         narration="Borrow too much, and the exchange calls you. You pay up, or you get shut out.", overlay=None),

    dict(id="t062", level=None, template="exchangeFloor",
         narration="Imagine an account that never gets that call, no matter how far you push it.", overlay=None),

    dict(id="t063", level=None, template="officeFloor",
         narration="Alameda's account was never normal.", overlay=None),

    dict(id="t064", level=None, template="boardroom",
         narration="Bankman-Fried told Gary Wang to write one exception into the code.", overlay=None,
         bubbles=[dict(text="How's the balance negative and nobody notices?", speaker="left"),
                  dict(text="Because nobody else is allowed to see it.", speaker="right", at=2.2)],
         foreground=dict(kind="overShoulder", side="left")),

    dict(id="t065", level=None, template="cityStreet",
         narration="One line.", overlay=None),

    dict(id="t066", level=None, template="chartBoard", chart="up",
         narration="It let Alameda run a negative balance -- with no floor, and no call, ever.", overlay=None),

    dict(id="t067", level=None, template="bankExterior", breath=True,
         narration="FTX called the arrangement a credit line -- sixty-five billion dollars of borrowing room, on paper. No bank on earth would ever hand out a line that size. FTX did it with a keystroke.",
         overlay=None),

    dict(id="t068", level=None, template="officeFloor",
         narration="The exchange's own risk team almost never flagged the account.", overlay=None),

    dict(id="t069", level=None, template="bankExterior",
         narration="Through that one backdoor, user deposits started moving -- to Alameda.", overlay=None),

    dict(id="t070", level=None, template="chartBoard", chart="up",
         narration="Roughly ten billion dollars crossed over, piece by piece, over three years.", overlay=None),

    dict(id="t071", level=None, template="exchangeFloor",
         narration="Alameda used it to trade. To invest in startups. To buy real estate.", overlay=None),

    dict(id="t072", level=None, template="boardroom",
         narration="Some of it funded the donations. Some of it funded the penthouse.", overlay=None),

    dict(id="t073", level=None, template="officeFloor",
         narration="And at the center of it all sat FTX's own invention: a token called FTT.",
         overlay=None, card=dict(kind="objects", items=["coinStack", "safe"])),

    dict(id="t074", level=None, template="chartBoard", chart="up",
         narration="FTX created FTT out of nothing, and handed a mountain of it to Alameda.", overlay=None),

    dict(id="t075", level=None, template="exchangeFloor",
         narration="Picture printing your own poker chips.", overlay=None),

    dict(id="t076", level=None, template="domesticInterior",
         narration="Then using the chips as backup for a loan.", overlay=None,
         dialogue=dict(text="What backs this loan?"),
         bubbles=[dict(kind="float", text="Chips. Ours. We printed them ourselves.", x=0.5, y=0.78, at=1.6)]),

    dict(id="t077", level=None, template="exchangeFloor",
         narration="As long as nobody tried to cash them in, they were worth whatever the print run said.", overlay=None),

    dict(id="t078", level=None, template="chartBoard", chart="up",
         narration="That was the balance sheet. Billions in assets FTX could print at will.", overlay=None),

    dict(id="t079", level=None, template="bankExterior", mood="grim", breath=True,
         narration="Somewhere under it all sat an eight-billion-dollar hole -- though almost nobody could see it yet.", overlay=None),

    dict(id="t080", level=None, template="officeFloor",
         narration="Barely a handful of people even knew the backdoor was there.", overlay=None),

    dict(id="t081", level=None, template="newsMontage",
         narration="Nobody outside it had any way to check.", overlay=None),

    dict(id="t082", level=None, template="courtHearing",
         narration="Neither firm kept the kind of audited books a real bank would demand.", overlay=None),

    dict(id="t083", level=None, template="broadcastDesk",
         narration="No outside auditor ever asked to see Alameda's real balance.", overlay=None),

    dict(id="t084", level=None, template="cityStreet",
         narration="Nobody asked, because nobody thought they had to.", overlay=None),

    dict(id="t085", level=None, template="chartBoard", chart="flat", breath=True,
         narration="Here's the whole trick in one sentence: he built a firm that lent itself its own users' money, on nobody's permission but his own.",
         overlay=None, panels=dict(variant="v2", cells=[dict(template="exchangeFloor"), dict(template="bankExterior")])),

    dict(id="t086", level=None, template="exchangeFloor",
         narration="For years, the trick held.", overlay=None),

    dict(id="t087", level=None, template="officeFloor",
         narration="The token kept its price. The line stayed hidden. The money kept moving.", overlay=None),

    dict(id="t088", level=None, template="closeUpPortrait", mood="grim",
         narration="Then, in the fall of 2022, somebody looked at the numbers who wasn't supposed to.", overlay=None),

    # ================= CH 3: The Leak =================
    dict(id="t089", level="CH 3", template="newsMontage", breath=True,
         narration="November 2nd, 2022. A crypto news site called CoinDesk published a leaked balance sheet.",
         overlay=None, card=dict(kind="chapter", title="The Leak", subtitle="A Balance Sheet Nobody Was Supposed to See", hold=2.4)),

    dict(id="t090", level=None, template="officeFloor",
         narration="Alameda's own numbers, laid out in black and white.", overlay=None),

    dict(id="t091", level=None, template="chartBoard", chart="down",
         narration="Fourteen point six billion dollars in assets, the sheet said.",
         overlay=dict(big="$14.6B", sub="ALAMEDA'S \"ASSETS\"")),

    dict(id="t092", level=None, template="exchangeFloor",
         narration="Three point six billion of it was FTT -- the token its own sister firm had printed.", overlay=None),

    dict(id="t093", level=None, template="newsMontage",
         narration="It wasn't cash. It wasn't even close to cash.", overlay=None),

    dict(id="t094", level=None, template="broadcastDesk",
         narration="It was a number, backed by another number, backed by nothing at all.", overlay=None),

    dict(id="t095", level=None, template="crowdQueue",
         narration="Traders started asking questions online.", overlay=None),

    dict(id="t096", level=None, template="exchangeFloor",
         narration="One trader was in a position to do more than ask.", overlay=None),

    dict(id="t097", level=None, template="boardroom",
         narration="Changpeng Zhao ran Binance, the largest crypto exchange on earth.", overlay=None),

    dict(id="t098", level=None, template="officeFloor",
         narration="Years earlier, Binance had sold its stake in FTX -- and taken payment in FTT.", overlay=None),

    dict(id="t099", level=None, template="bankExterior", gap=1.4,
         narration="For an early investor cashed out in his rival's own token, that was about to matter.", overlay=None),

    dict(id="t100", level=None, template="closeUpPortrait", breath=True,
         narration="On November 6th, Zhao posted a single tweet, citing what he called \"recent revelations,\" and said Binance would sell off every token of FTT it held. It was the moment the whole structure's own fuel supply turned against it.",
         overlay=None),

    dict(id="t101", level=None, template="chartBoard", chart="down",
         narration="The price of FTT started falling -- fast.", overlay=None),

    dict(id="t102", level=None, template="exchangeFloor",
         narration="Users who'd trusted FTX for years started asking for their money back.", overlay=None),

    dict(id="t103", level=None, template="crowdQueue", mood="grim",
         narration="All at once.", overlay=None,
         placards=["GIVE IT BACK", "WHERE IS IT", "WITHDRAW NOW"]),

    dict(id="t104", level=None, template="chartBoard", chart="down",
         narration="Six billion dollars in withdrawal asks landed in seventy-two hours.",
         overlay=dict(big="$6B", sub="IN 72 HOURS")),

    dict(id="t105", level=None, template="bankExterior", mood="grim",
         narration="FTX did not have six billion dollars sitting anywhere.", overlay=None),

    dict(id="t106", level=None, template="officeFloor",
         narration="November 8th. FTX froze all withdrawals.", overlay=None),

    dict(id="t107", level=None, template="boardroom",
         narration="Bankman-Fried called his biggest rival for help.", overlay=None,
         bubbles=[dict(text="Can Binance help us cover this?", speaker="left"),
                  dict(text="Let's talk. Send the numbers.", speaker="right", at=2.0)],
         foreground=dict(kind="overShoulder", side="right")),

    dict(id="t108", level=None, template="bankExterior",
         narration="Binance signed a non-binding letter of intent to buy the firm.", overlay=None),

    dict(id="t109", level=None, template="cityStreet",
         narration="One day. That's how long the rescue lasted.", overlay=None),

    dict(id="t110", level=None, template="officeFloor", mood="grim",
         narration="Binance's own people looked at FTX's books -- and walked away.", overlay=None),

    dict(id="t111", level=None, template="broadcastDesk",
         narration="November 9th. Nothing left to explain. They'd seen enough.", overlay=None),

    dict(id="t112", level=None, template="bankExterior", mood="grim",
         narration="Bahamas watchdogs froze the local arm's assets the next day.", overlay=None),

    dict(id="t113", level=None, template="crowdQueue", mood="grim",
         narration="A million customers, in over a hundred countries, watched their balances go dark.", overlay=None),

    dict(id="t114", level=None, template="exchangeFloor",
         narration="Alameda, the firm that started it all, began winding down.", overlay=None),

    dict(id="t115", level=None, template="closeUpPortrait", mood="grim",
         narration="The backdoor that had moved ten billion dollars quietly for years was suddenly the whole story.", overlay=None),

    dict(id="t116", level=None, template="newsMontage",
         narration="Every reporter who'd once written the myth was now unwriting it.", overlay=None),

    dict(id="t117", level=None, template="broadcastDesk",
         narration="The wheel. The toilet. Coffee.", overlay=None),

    dict(id="t118", level=None, template="closeUpPortrait",
         narration="Larry David had been right the whole time -- about FTX, at least.", overlay=None),

    dict(id="t119", level=None, template="crowdQueue",
         narration="Nobody was laughing at the joke anymore.", overlay=None),

    dict(id="t120", level=None, template="boardroom", mood="grim", breath=True,
         narration="The exchange was out of money. The trick was out in the open.", overlay=None),

    dict(id="t121", level=None, template="officeFloor", mood="grim",
         narration="All that was left was to admit it.", overlay=None),

    # ================= CH 4: The Confession =================
    dict(id="t122", level="CH 4", template="domesticInterior", breath=True,
         narration="November 10th, 2022. Bankman-Fried sat down and started typing.",
         overlay=None, card=dict(kind="chapter", title="The Confession", subtitle="Five Days That Ended an Empire", hold=2.4)),

    dict(id="t123", level=None, template="closeUpPortrait", mood="grim",
         narration="Twenty-two tweets. In a row.", overlay=None),

    dict(id="t124", level=None, template="broadcastDesk",
         narration="\"I'm sorry,\" he wrote. \"I f---ed up, and should have done better.\"", overlay=None),

    dict(id="t125", level=None, template="closeUpPortrait",
         narration="\"At a very high level,\" he added, \"I f---ed up twice.\"", overlay=None),

    dict(id="t126", level=None, template="crowdQueue", mood="grim",
         narration="Twice wasn't the number anyone believed anymore.", overlay=None),

    dict(id="t127", level=None, template="newsMontage",
         narration="The same day, he announced Alameda Research was winding down for good.", overlay=None),

    dict(id="t128", level=None, template="officeFloor", mood="grim",
         narration="The firm he'd started first -- gone.", overlay=None),

    dict(id="t129", level=None, template="chartBoard", chart="down",
         narration="November 11th. FTX, Alameda, and about a hundred thirty linked firms filed for bankruptcy.", overlay=None),

    dict(id="t130", level=None, template="courtHearing",
         narration="Delaware. Chapter 11. The largest filing crypto had ever seen.", overlay=None),

    dict(id="t131", level=None, template="cityStreet",
         narration="Bankman-Fried resigned as CEO, the same day.", overlay=None),

    dict(id="t132", level=None, template="boardroom",
         narration="In his place, the firm installed John J. Ray the Third.", overlay=None,
         foreground=dict(kind="overShoulder", side="left")),

    dict(id="t133", level=None, template="broadcastDesk",
         narration="Ray had spent his career cleaning up corporate wreckage.", overlay=None),

    dict(id="t134", level=None, template="bankExterior",
         narration="Including, once before, Enron's.", overlay=None),

    dict(id="t135", level=None, template="courtHearing",
         narration="A week later, Ray filed his own account of what he'd found.",
         overlay=None, card=dict(kind="narration", text="\"A complete\nfailure of controls.\"")),

    dict(id="t136", level=None, template="broadcastDesk",
         narration="\"Never in my career have I seen such a complete failure of corporate controls,\" he wrote -- in forty years of legal work.", overlay=None),

    dict(id="t137", level=None, template="crowdQueue", mood="grim",
         narration="Over a million creditors had a claim on money that no longer existed.", overlay=None),

    dict(id="t138", level=None, template="bankExterior", mood="grim",
         narration="The Miami arena deal -- nineteen years, a hundred thirty-five million dollars -- ended within months.", overlay=None),

    dict(id="t139", level=None, template="cityStreet",
         narration="The letters came down. FTX ARENA became something else.", overlay=None),

    dict(id="t140", level=None, template="domesticInterior",
         narration="A teachers' pension fund wrote off its ninety-five million dollars.", overlay=None),

    dict(id="t141", level=None, template="closeUpPortrait", mood="grim",
         narration="So did nearly everyone else who had trusted him.", overlay=None),

    dict(id="t142", level=None, template="boardroom",
         narration="For a month, Bankman-Fried stayed free -- in the Bahamas, giving interviews.", overlay=None),

    dict(id="t143", level=None, template="broadcastDesk",
         narration="Calm. Sorry. Still, somehow, likable on camera.", overlay=None),

    dict(id="t144", level=None, template="courtHearing", breath=True,
         narration="He was set to speak to Congress on December 13th.", overlay=None),

    dict(id="t145", level=None, template="closeUpPortrait", mood="grim",
         narration="He never made it to the hearing room.", overlay=None),

    dict(id="t146", level=None, template="cityStreet", mood="grim",
         narration="The night before, in Nassau, federal agents came for him.", overlay=None,
         dialogue=dict(text="Sam, federal agents are here for you.")),

    dict(id="t147", level=None, template="courtHearing", mood="grim",
         narration="December 12th, 2022. Arrested.",
         overlay=None, card=dict(kind="word", word="ARRESTED")),

    dict(id="t148", level=None, template="broadcastDesk",
         narration="The next day, the feds unsealed an eight-count indictment.", overlay=None),

    dict(id="t149", level=None, template="newsMontage",
         narration="U.S. Attorney Damian Williams put it in one sentence.", overlay=None),

    dict(id="t150", level=None, template="closeUpPortrait", mood="grim",
         narration="\"Sam Bankman-Fried perpetrated one of the biggest financial frauds in American history,\" Williams said, \"a scheme designed to make him the King of Crypto.\"",
         overlay=None),

    dict(id="t151", level=None, template="broadcastDesk",
         narration="The press had used that title before -- and meant it as a compliment.", overlay=None),

    dict(id="t152", level=None, template="newsMontage",
         narration="They'd even compared him to J.P. Morgan, the banker who once personally bailed out Wall Street.", overlay=None),

    dict(id="t153", level=None, template="bankExterior", mood="grim",
         narration="Now it read like an indictment on its own.", overlay=None),

    dict(id="t154", level=None, template="boardroom", mood="grim",
         narration="Within weeks, his own co-founders started talking.", overlay=None),

    dict(id="t155", level=None, template="courtHearing",
         narration="Gary Wang, who'd helped write the backdoor, pleaded guilty. So did Caroline Ellison.", overlay=None),

    dict(id="t156", level=None, template="closeUpPortrait",
         narration="Nishad Singh followed soon after. All three agreed to help the government's case.", overlay=None),

    # ================= CH 5: The Verdict =================
    dict(id="t157", level="CH 5", template="courtHearing", breath=True,
         narration="October 3rd, 2023. The trial opened in a federal courtroom in New York.",
         overlay=None, card=dict(kind="chapter", title="The Verdict", subtitle="Twenty-Five Years for the King of Crypto", hold=2.4)),

    dict(id="t158", level=None, template="closeUpPortrait",
         narration="Judge Lewis Kaplan presided.", overlay=None),

    dict(id="t159", level=None, template="broadcastDesk",
         narration="The government's star witness took the stand.", overlay=None),

    dict(id="t160", level=None, template="closeUpPortrait",
         narration="Caroline Ellison -- his own ex-girlfriend, the woman who'd run Alameda.", overlay=None),

    dict(id="t161", level=None, template="courtHearing",
         narration="She said, on the stand: he told her to cover Alameda's losses with user cash.", overlay=None),

    dict(id="t162", level=None, template="boardroom",
         narration="To fund venture bets. To buy real estate. To fund the political donations.", overlay=None),

    dict(id="t163", level=None, template="closeUpPortrait", mood="grim",
         narration="She said she felt relief when it all finally collapsed.", overlay=None),

    dict(id="t164", level=None, template="courtHearing",
         narration="\"I didn't have to lie anymore,\" she told the jury.", overlay=None),

    dict(id="t165", level=None, template="broadcastDesk",
         narration="Nishad Singh took the stand too.", overlay=None),

    dict(id="t166", level=None, template="closeUpPortrait",
         narration="He said learning the true size of the hole made him physically sick.", overlay=None),

    dict(id="t167", level=None, template="courtHearing",
         narration="\"Blindsided,\" he called it -- by his own company's math.", overlay=None),

    dict(id="t168", level=None, template="boardroom",
         narration="Gary Wang described the one line of code he'd written, at his boss's request.", overlay=None),

    dict(id="t169", level=None, template="courtHearing",
         narration="Bankman-Fried took the stand in his own defense.", overlay=None,
         foreground=dict(kind="overShoulder", side="right")),

    dict(id="t170", level=None, template="closeUpPortrait", mood="grim",
         narration="The jury did not believe him.", overlay=None),

    dict(id="t171", level=None, template="broadcastDesk", breath=True,
         narration="November 2nd, 2023. Guilty.", overlay=None),

    dict(id="t172", level=None, template="closeUpPortrait", mood="grim",
         narration="On all seven counts.",
         overlay=None, card=dict(kind="word", word="GUILTY")),

    dict(id="t173", level=None, template="newsMontage",
         narration="Wire fraud. Conspiracy to commit wire fraud. Securities fraud. Commodities fraud. Money laundering.", overlay=None),

    dict(id="t174", level=None, template="crowdQueue",
         narration="Outside the courthouse, reporters counted the charges on their fingers.", overlay=None),

    dict(id="t175", level=None, template="closeUpPortrait",
         narration="Sentencing came four months later.", overlay=None),

    dict(id="t176", level=None, template="courtHearing", mood="grim",
         narration="March 28th, 2024.", overlay=None),

    dict(id="t177", level=None, template="broadcastDesk", mood="grim",
         narration="Judge Kaplan handed down twenty-five years in federal prison.",
         overlay=None, card=dict(kind="word", word="25 YEARS")),

    dict(id="t178", level=None, template="chartBoard", chart="down",
         narration="And eleven billion dollars, ordered paid back.",
         overlay=dict(big="$11B", sub="ORDERED FORFEITED")),

    dict(id="t179", level=None, template="bankExterior", mood="grim",
         narration="Eight billion of it tied directly to the customers who never got their money back.", overlay=None),

    dict(id="t180", level=None, template="boardroom",
         narration="The rest split between the investors he lied to, and Alameda's lenders.", overlay=None),

    dict(id="t181", level=None, template="courtHearing",
         narration="Caroline Ellison was sentenced that September to two years -- credit for real help.", overlay=None),

    dict(id="t182", level=None, template="closeUpPortrait",
         narration="Gary Wang and Nishad Singh had pleaded guilty two years earlier and testified against him.", overlay=None),

    dict(id="t183", level=None, template="newsMontage",
         narration="Slowly, the wreckage got sorted.", overlay=None),

    dict(id="t184", level=None, template="crowdQueue",
         narration="Bankruptcy trustees spent years chasing down what was left.", overlay=None),

    dict(id="t185", level=None, template="chartBoard", chart="up",
         narration="Crypto prices, oddly, came back -- and that helped.", overlay=None),

    dict(id="t186", level=None, template="crowdQueue",
         narration="By 2024, most customers were promised close to everything back, in cash terms, years after the freeze.",
         overlay=None, panels=dict(variant="v2", cells=[dict(template="crowdQueue"), dict(template="chartBoard")])),

    dict(id="t187", level=None, template="closeUpPortrait", mood="grim",
         narration="Bankman-Fried never got any of it back himself.", overlay=None),

    dict(id="t188", level=None, template="courtHearing", mood="grim",
         narration="He wasn't the one it was ever for.", overlay=None),

    dict(id="t189", level=None, template="domesticInterior", breath=True,
         narration="Maybe the strangest part isn't that a twenty-nine-year-old built a fake fortune out of a rented apartment.", overlay=None),

    dict(id="t190", level=None, template="closeUpPortrait",
         narration="It's how many careful, serious people looked at the number and simply believed it.", overlay=None),

    dict(id="t191", level=None, template="broadcastDesk", breath=True,
         narration="Investors who do this for a living. A pension fund built to protect teachers. You, laughing along at a Super Bowl ad, in on a joke that turned out not to be one.",
         overlay=None),

    dict(id="t192", level=None, template="closeUpPortrait", mood="grim",
         narration="We laughed at the one man on television who said he didn't believe it.", overlay=None),

    dict(id="t193", level=None, template="domesticInterior",
         narration="\"I don't think so,\" he'd told the camera. \"And I'm never wrong about this stuff.\"", overlay=None),

    dict(id="t194", level=None, template="closeUpPortrait",
         narration="Turns out, on this one, Larry David never was.", overlay=None),
]
