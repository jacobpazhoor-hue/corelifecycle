#!/usr/bin/env python3
"""How Sam Bankman-Fried Actually Lost $8 Billion — CRAYON-format explainer, ~16-18 min.

FORMAT: third-person past-tense explainer about a REAL subject (docs/BIBLE.md §1). Every date, figure
and quote is verified in docs/research/ftx.md with a source; anything unverifiable to that standard is
in that file's CUT list and is absent here. Register: straight and noirish, held throughout (§2) — real
users lost real money, so a comic register would read as callous, same reasoning as lehman_brothers,
theranos and the unshipped madoff draft this episode replaces.

STRUCTURAL VARIATION vs the last two PRODUCED crayon-format episodes (lehman_brothers 08-15,
theranos 08-16 — the topic 'madoff' sitting on disk at the start of this run was never published and
is not counted as produced; this episode replaces it with a new subject):
  * lehman opened DEATH-FIRST and closed on REFLECTION + COMPLICIT "WE" + CALLBACK, no forward tease,
    five chapters. theranos opened on the classic five-step THESIS hook and closed on an UNANSWERED
    QUESTION + QUOTE, four chapters. This script also opens on the classic five-step THESIS hook (a
    person-subject requires the thesis variant, never the question-thesis reserved for systemic
    subjects with no birthplace — the hook SHAPE necessarily echoes theranos; its CONTENT does not),
    but closes on REFLECTION + COMPLICIT "WE" + CALLBACK + a FORWARD TEASE — the one ending shape
    neither prior produced episode used in full — and runs FIVE chapters shaped as a clean rise ->
    mechanism -> peak -> reversal -> reckoning escalation, distinct from theranos's four-part shape.
  * MOTIF: theranos ran "one drop of blood"; lehman ran "the thing nobody could pay for, sold on".
    This one runs TWO interlocking through-lines: THE BACK DOOR (a literal secret exception in FTX's
    own code, planted as an unseen "second business" in Ch1, defined mechanically in Ch2, referenced
    at the Ch3 peak, and triggering the Ch4 collapse) and THE EPITHET ("the King of Crypto", coined by
    the press at the Ch3 peak, read back as the government's own description of the fraud at the Ch5
    verdict).
  * WARDROBE CALLBACK: the rumpled T-shirt and cargo shorts, planted at the Ch3 peak as a trust signal,
    paid off in the closing hold as the uniform of "the next kid" already raising money on the same
    promise.

CHAPTERS (§1, `Evocative Noun: Plain Explanation`, emitted as card=dict(kind="chapter", ...) and used
verbatim in the description timestamps):
  1 The Prodigy        : A Trader's Bet on Crypto
  2 The Backdoor       : How the Money Actually Moved
  3 The King of Crypto : Buying Trust in Bulk
  4 The Run            : Ten Days That Ended It
  5 The Reckoning      : Seven Counts, Twenty-Five Years

PROMISE -> PAYOFF LEDGER:
  * Hook promise: "a back door into every user's account" -> mechanism PAID in Ch2 (Gary Wang's code
    exception, the $65B uncapped line, no margin calls for Alameda).
  * "Second business, nobody outside a small circle knew about it" planted Ch1 close -> paid off as
    Ch2's entire subject.
  * EPITHET: "the King of Crypto" coined by the press, planted Ch3 -> read back as Damian Williams's
    own description of the fraud at the Ch5 verdict.
  * WARDROBE MOTIF: T-shirt/cargo shorts as trust signal, planted Ch3 -> paid off in the final hold.
  * Larry David's Super Bowl line, "I don't think so. And I'm never wrong about this stuff," planted
    Ch3 -> re-triggered as unintentionally correct in the closing reflection -> a SECOND payoff in Ch5
    (the government cites the same ad in court as evidence FTX.US was never really kept separate).
  * Congress testimony SCHEDULED for Dec 13 planted Ch3 -> paid off Ch4 (arrested the night before).
  * share-worthy beat #1: the hidden credit line regulators later sized at $65 billion.
  * share-worthy beat #2: FTX bought 19 years of naming rights on a Miami arena and kept the name for
    about eighteen months of it.
  * share-worthy beat #3: the man who took over as CEO to clean up the wreckage had done the same job
    for Enron, and said on the record he'd never seen anything this bad.
  * MIDPOINT REVERSAL (§5, "the moment the subject's own machine turns on them"): Nov 6 2022, CZ —
    the rival Bankman-Fried had once done a deal with — announces Binance will dump its FTT holdings.
    gap=1.4 on the scene immediately before that line.

Numbers, sentence lengths and WPM are self-checked against docs/BIBLE.md §3 before build; see the
tail of this file for the narration-rate stamp. Vocabulary is deliberately short (Anglo-Saxon over
Latinate: "help" not "cooperation", "shut down" not "liquidated", "linked firms" not "affiliated
companies", "back door" not "mechanism") to hit the syllables-per-word band the WPM gate requires
(docs/BIBLE.md §3a "THE WPM RULE IS A RULE ABOUT WORD LENGTH") — checked with scripts/wpm_predict.py
before every build.
"""

FPS = 30

NARRATION_RATE = "-5%"   # matches the current channel-wide retune (docs/BIBLE.md §3), unchanged here

SCENES = [
    # ================= HOOK — five steps, first ~30s =================
    dict(id="t001", level=None, template="cityStreet",
         narration=("He ran a crypto exchange worth thirty-two billion dollars."),
         overlay=None),

    dict(id="t002", level=None, template="officeFloor",
         narration=("And gave himself a back door into every user's cash."),
         overlay=None),

    dict(id="t003", level=None, template="bankExterior",
         narration=("Eight billion dollars of it. Gone in ten days."),
         overlay=None),

    dict(id="t004", level=None, template="crowdQueue",
         narration=("A million people, still waiting on money that was never there."),
         overlay=None),

    dict(id="t005", level=None, template="domesticInterior",
         narration=("He gave forty million dollars to politicians."),
         overlay=None),

    dict(id="t006", level=None, template="newsMontage",
         narration=("Congress called him to testify. He got arrested instead."),
         overlay=None,
         card=dict(kind="narration", text="A hearing he\nnever reached.")),

    dict(id="t007", level=None, template="boardroom",
         narration=("This is the story of Sam Bankman-Fried — the boy genius they crowned the King "
                    "of Crypto."),
         overlay=None),

    dict(id="t008", level=None, template="closeUpPortrait",
         narration=("Rumpled shirt. Cargo shorts."),
         overlay=None),

    dict(id="t008b", level=None, template="domesticInterior",
         narration=("The most trusted man in crypto."),
         overlay=None),

    dict(id="t009", level=None, template="cityStreet",
         narration=("Berkeley, California. 2017."),
         overlay=None),

    # ================= CHAPTER 1 — The Prodigy =================
    dict(id="t010", level="CH 1", template="officeFloor", breath=True,
         narration=("Before all this, he was just a physics major at MIT."),
         overlay=None,
         card=dict(kind="chapter", title="The Prodigy", subtitle="A Trader's Bet on Crypto", hold=2.4)),

    dict(id="t011", level=None, template="closeUpPortrait",
         narration=("Both parents taught law at Stanford."),
         overlay=None),

    dict(id="t012", level=None, template="domesticInterior",
         narration=("He grew up arguing ethics at the dinner table."),
         overlay=None),

    dict(id="t013", level=None, template="officeFloor",
         narration=("After school, he took a job at Jane Street — one of Wall Street's most "
                    "secretive firms."),
         overlay=None),

    dict(id="t014", level=None, template="chartBoard", chart="up",
         narration=("He learned to price risk fast, and never flinch."),
         overlay=None),

    dict(id="t015", level=None, template="domesticInterior",
         narration=("He believed in something called effective altruism."),
         overlay=None,
         bubbles=[dict(text="Why give away everything you make?", speaker="left"),
                  dict(text="A dollar does more good out there than in my pocket.", speaker="right", at=2.2)]),

    dict(id="t016", level=None, template="closeUpPortrait",
         narration=("Earn a fortune. Give away nearly all of it."),
         overlay=None),

    dict(id="t017", level=None, template="cityStreet",
         narration=("In 2017, he quit Jane Street."),
         overlay=None),

    dict(id="t018", level=None, template="closeUpPortrait",
         narration=("He chased a new idea instead: crypto arbitrage."),
         overlay=None),

    dict(id="t019", level=None, template="exchangeFloor",
         narration=("Bitcoin traded for different prices on different sites."),
         overlay=None),

    dict(id="t020", level=None, template="chartBoard", chart="up",
         narration=("Sometimes ten percent apart, on the same coin."),
         overlay=None),

    dict(id="t021", level=None, template="officeFloor",
         narration=("Buy it low in Japan. Sell it high in the U.S."),
         overlay=None),

    dict(id="t022", level=None, template="exchangeFloor",
         narration=("You didn't need Wall Street to see that gap. That gap alone was the whole "
                    "business."),
         overlay=None),

    dict(id="t023", level=None, template="officeFloor",
         narration=("He named the firm Alameda Research, run out of an apartment in Berkeley."),
         overlay=None),

    dict(id="t024", level=None, template="closeUpPortrait",
         narration=("Within a year, it moved twenty-five million dollars a day."),
         overlay=None),

    dict(id="t025", level=None, template="domesticInterior",
         narration=("He hired from his own world: old classmates, fellow traders."),
         overlay=None),

    dict(id="t026", level=None, template="officeFloor", cast=1,
         narration=("One was Caroline Ellison, a Jane Street alum."),
         overlay=None),

    dict(id="t027", level=None, template="closeUpPortrait", cast=2,
         narration=("Another was Gary Wang, a coder since he was a teen."),
         overlay=None),

    dict(id="t028", level=None, template="cityStreet",
         narration=("In 2019, he and Wang built something bigger."),
         overlay=None),

    dict(id="t029", level=None, template="newsMontage", labels=["FTX"],
         narration=("An exchange of their own. They called it FTX."),
         overlay=None),

    dict(id="t030", level=None, template="exchangeFloor",
         narration=("A place to trade the bets nobody else would touch. Complex bets, dozens of "
                    "coins, huge leverage."),
         overlay=None),

    dict(id="t031", level=None, template="boardroom",
         narration=("2021 was crypto's best year ever, and bitcoin kept setting new records."),
         overlay=None),

    dict(id="t032", level=None, template="closeUpPortrait",
         narration=("Within two years, FTX moved ten billion dollars a day."),
         overlay=None),

    dict(id="t033", level=None, template="officeFloor",
         narration=("Investors lined up: Sequoia, SoftBank, a piece of Singapore's own wealth fund."),
         overlay=None),

    dict(id="t034", level=None, template="closeUpPortrait",
         narration=("Staff called him the smartest boss they'd ever had."),
         overlay=None),

    dict(id="t035", level=None, template="boardroom",
         narration=("But nobody outside a small circle knew about the second business."),
         overlay=None),

    dict(id="t036", level=None, template="cityStreet",
         narration=("Its own floor. Its own staff."),
         overlay=None),

    dict(id="t036b", level=None, template="closeUpPortrait",
         narration=("Almost no one let in."),
         overlay=None),

    # ================= CHAPTER 2 — The Backdoor =================
    dict(id="t037", level="CH 2", template="exchangeFloor", breath=True,
         narration=("That second business was Alameda Research. It wasn't like any other account on "
                    "FTX."),
         overlay=None,
         card=dict(kind="chapter", title="The Backdoor", subtitle="How the Money Actually Moved", hold=2.4)),

    dict(id="t038", level=None, template="officeFloor", cast=2,
         narration=("Gary Wang built it a secret exception in FTX's own code."),
         overlay=None),

    dict(id="t039", level=None, template="closeUpPortrait",
         narration=("Here's the trick, in one line: Alameda's balance could go negative. No limit. "
                    "No warning."),
         overlay=None),

    dict(id="t040", level=None, template="chartBoard", chart="flat",
         narration=("Every other user who overdrew got shut down fast."),
         overlay=None),

    dict(id="t040b", level=None, template="officeFloor",
         narration=("Alameda never did."),
         overlay=None),

    dict(id="t041", level=None, template="bankExterior", overlay=dict(big="$65B", sub="ALAMEDA'S HIDDEN CREDIT LINE"),
         narration=("Regulators later sized that hidden line at sixty-five billion dollars."),
         ),

    dict(id="t042", level=None, template="officeFloor",
         narration=("In plain terms: user cash and Alameda's trading pot were one pool of money."),
         overlay=None),

    dict(id="t043", level=None, template="domesticInterior",
         card=dict(kind="word", word="Same."),
         narration=("Same."),
         overlay=None),

    dict(id="t044", level=None, template="exchangeFloor",
         narration=("About ten billion dollars moved from FTX users into Alameda."),
         overlay=None),

    dict(id="t045", level=None, template="chartBoard", chart="down",
         narration=("Alameda spent it to cover trading losses nobody else saw."),
         overlay=None),

    dict(id="t046", level=None, template="bankExterior",
         narration=("Some bought Bahamas real estate, homes tied to staff."),
         overlay=None),

    dict(id="t047", level=None, template="boardroom",
         narration=("Some funded side bets: sports teams, AI firms, a stake in a bank."),
         overlay=None),

    dict(id="t048", level=None, template="crowdQueue",
         narration=("Some of it — you already know this — the forty million in donations."),
         overlay=None),

    dict(id="t049", level=None, template="exchangeFloor",
         narration=("And one thing held the whole structure up: FTX's own coin, FTT."),
         overlay=None),

    dict(id="t050", level=None, template="chartBoard", chart="up",
         narration=("FTX had simply made FTT up."),
         overlay=None),

    dict(id="t051", level=None, template="officeFloor",
         narration=("Alameda held billions of it as backup — backup that FTX itself set the price "
                    "of."),
         overlay=None),

    # §3a RHYTHM — HOLD, 12-16s, one of the budgeted 4-6 holds (the mechanism reveal).
    dict(id="t052", level=None, template="closeUpPortrait", breath=True,
         narration=("Picture a bank that owns the only press that prints its own money — a press "
                    "only it is allowed to run. That's what Alameda's books actually were: numbers on "
                    "a page, not real money in a vault."),
         overlay=None),

    dict(id="t053", level=None, template="bankExterior",
         narration=("On paper, none of it looked like a crime. It looked like a very good trading "
                    "firm, run by people everyone already trusted."),
         overlay=None),

    dict(id="t054", level=None, template="domesticInterior",
         narration=("Users checking their FTX balance saw a normal number, sitting there, ready to "
                    "pull out."),
         overlay=None),

    dict(id="t055", level=None, template="crowdQueue",
         narration=("It wasn't ready. It had already left the building."),
         overlay=None),

    dict(id="t056", level=None, template="newsMontage",
         narration=("Auditors signed off. Investors wired in more cash. Nobody asked where Alameda's "
                    "side of the books actually went, or why one firm never got checked the same "
                    "way."),
         overlay=None),

    dict(id="t057", level=None, template="boardroom",
         narration=("Even inside FTX, only a few people knew how deep the hole went."),
         overlay=None),

    dict(id="t058", level=None, template="officeFloor",
         narration=("Nishad Singh, the head engineer, later said the real numbers made him sick."),
         overlay=None),

    dict(id="t059", level=None, template="closeUpPortrait", cast=1,
         narration=("Caroline Ellison ran Alameda day to day, and answered, in the end, to one man."),
         overlay=None),

    dict(id="t060", level=None, template="boardroom", cast=1,
         narration=("The answer to every shortfall was always the same."),
         overlay=None,
         dialogue=dict(text="The numbers don't work. We're short.")),

    dict(id="t061", level=None, template="closeUpPortrait", cast=1,
         narration=("Borrow more against the back door. Keep moving."),
         overlay=None,
         dialogue=dict(text="Use the FTX line. It's always been fine.")),

    dict(id="t062", level=None, template="chartBoard", chart="up",
         narration=("From outside, the machine looked unstoppable."),
         overlay=None),

    dict(id="t063", level=None, template="crowdQueue",
         narration=("New users signed up by the millions, chasing what everyone called the safest "
                    "name in crypto."),
         overlay=None),

    dict(id="t064", level=None, template="newsMontage",
         narration=("Magazines called him the next J.P. Morgan — the man who would finally clean the "
                    "whole industry up, the same way Morgan once had."),
         overlay=None),

    dict(id="t065", level=None, template="closeUpPortrait",
         narration=("The joke: his own firm was the dirtiest book in it."),
         overlay=None),

    dict(id="t066", level=None, template="exchangeFloor",
         narration=("For three years, the back door held. Then, in the fall of 2022, somebody outside "
                    "the firm finally opened the real books, line by line."),
         overlay=None),

    # ================= CHAPTER 3 — The King of Crypto =================
    dict(id="t067", level="CH 3", template="boardroom", breath=True,
         narration=("By January 2022, FTX was worth thirty-two billion dollars."),
         overlay=None,
         card=dict(kind="chapter", title="The King of Crypto", subtitle="Buying Trust in Bulk", hold=2.4)),

    dict(id="t068", level=None, template="chartBoard", chart="up", overlay=dict(big="$32B", sub="JANUARY 2022 VALUATION"),
         narration=("Sequoia. SoftBank. Even a Canadian teachers' pension fund."),
         ),

    dict(id="t069", level=None, template="bankExterior",
         narration=("On paper, Bankman-Fried himself was worth up to twenty-six billion."),
         overlay=None),

    dict(id="t069b", level=None, template="closeUpPortrait",
         narration=("Twenty-nine years old."),
         overlay=None),

    dict(id="t070", level=None, template="crowdQueue",
         narration=("Forbes called him the richest self-made man alive under thirty."),
         overlay=None),

    dict(id="t071", level=None, template="domesticInterior",
         narration=("He didn't dress like it. Same rumpled shirt. Same cargo shorts. Same wild "
                    "hair."),
         overlay=None),

    dict(id="t072", level=None, template="broadcastDesk",
         narration=("Reporters loved that. It made him look like the one billionaire who hadn't "
                    "changed."),
         overlay=None),

    dict(id="t073", level=None, template="newsMontage", labels=["THE NEW J.P. MORGAN"],
         narration=("The press even had a nickname ready: the King of Crypto."),
         overlay=None),

    dict(id="t074", level=None, template="boardroom",
         narration=("But FTX had almost no real board — no outside directors asking hard questions."),
         overlay=None),

    dict(id="t075", level=None, template="officeFloor",
         narration=("No one really minding the books, either."),
         overlay=None),

    dict(id="t076", level=None, template="closeUpPortrait", breath=True,
         narration=("A firm moving billions a day was run less like a bank, more like a dorm — a "
                    "tight circle of friends who trusted each other completely, and answered to "
                    "almost no one else."),
         overlay=None),

    dict(id="t077", level=None, template="domesticInterior",
         narration=("Most of that circle lived together, in one Bahamas penthouse worth tens of "
                    "millions."),
         overlay=None),

    dict(id="t078", level=None, template="crowdQueue",
         narration=("The Bahamas gave FTX low taxes and a friendly regulator."),
         overlay=None),

    dict(id="t079", level=None, template="bankExterior",
         narration=("In 2021, FTX bought nineteen years of naming rights on a Miami arena."),
         overlay=None),

    dict(id="t080", level=None, template="chartBoard", chart="up",
         narration=("A hundred and thirty-five million dollars, just to put its name on the door."),
         overlay=None),

    dict(id="t081", level=None, template="broadcastDesk",
         narration=("Then came the Super Bowl."),
         overlay=None),

    dict(id="t082", level=None, template="newsMontage", foreground=dict(kind="overShoulder", side="left"),
         narration=("FTX bought a national ad starring Larry David."),
         overlay=None),

    dict(id="t083", level=None, template="broadcastDesk",
         narration=("David spent the whole minute mocking history's best ideas — the wheel, the "
                    "toilet, coffee."),
         overlay=None),

    dict(id="t084", level=None, template="closeUpPortrait", breath=True,
         narration=("Then he looks at FTX, and says the line: 'I don't think so. And I'm never wrong "
                    "about this stuff.' It's now the most quoted line in the whole disaster."),
         overlay=None),

    dict(id="t085", level=None, template="crowdQueue",
         narration=("Tom Brady. Gisele Bündchen. Steph Curry."),
         overlay=None),

    dict(id="t085b", level=None, template="closeUpPortrait",
         narration=("All vouching for him."),
         overlay=None),

    dict(id="t086", level=None, template="exchangeFloor", overlay=dict(big="$40M", sub="POLITICAL DONATIONS, 2022"),
         narration=("That year, he gave away about forty million dollars in donations."),
         ),

    dict(id="t087", level=None, template="newsMontage",
         narration=("Second-biggest donor to Democrats in the whole country, behind only George "
                    "Soros."),
         overlay=None),

    dict(id="t088", level=None, template="boardroom",
         narration=("He testified to Congress about crypto rules. Lawmakers treated him like the one "
                    "adult in a room full of people who didn't understand the technology."),
         overlay=None),

    dict(id="t089", level=None, template="closeUpPortrait",
         narration=("He was booked to testify again that December."),
         overlay=None),

    dict(id="t090", level=None, template="officeFloor",
         card=dict(kind="objects", items=["cashStack", "houseModel", "laptop"]),
         narration=("Real estate. Startup stakes. New gear in every office."),
         overlay=None),

    dict(id="t091", level=None, template="chartBoard", chart="up",
         narration=("You didn't need a finance degree to see the number climb."),
         overlay=None),

    dict(id="t092", level=None, template="bankExterior",
         narration=("You just had to trust the T-shirt."),
         overlay=None),

    dict(id="t092b", level=None, template="closeUpPortrait",
         narration=("It wasn't real."),
         overlay=None),

    dict(id="t093", level=None, template="chartBoard", chart="up",
         narration=("It was a number on a screen, propped up by a coin FTX made itself."),
         overlay=None),

    dict(id="t094", level=None, template="crowdQueue",
         narration=("Nobody lining up to invest could see that part."),
         overlay=None),

    dict(id="t095", level=None, template="exchangeFloor",
         narration=("The valuation, the net worth, the naming rights — all of it sat on the same "
                    "hollow floor."),
         overlay=None),

    dict(id="t096", level=None, template="closeUpPortrait",
         narration=("And that floor was about to be tested by the one thing crypto can never fake."),
         overlay=None),

    dict(id="t097", level=None, template="boardroom",
         narration=("A wave of people wanting their money back, all at once."),
         overlay=None),

    # ================= CHAPTER 4 — The Run =================
    dict(id="t098", level="CH 4", template="exchangeFloor", breath=True,
         narration=("November 2nd, 2022. A crypto news site published a leak — Alameda's own balance "
                    "sheet."),
         overlay=None,
         card=dict(kind="chapter", title="The Run", subtitle="Ten Days That Ended It", hold=2.4)),

    dict(id="t099", level=None, template="officeFloor",
         narration=("Fourteen point six billion dollars in assets, the leak said."),
         overlay=None),

    dict(id="t100", level=None, template="closeUpPortrait", breath=True,
         narration=("But the single biggest piece, over three and a half billion, was FTT — the coin "
                    "FTX had made up itself."),
         overlay=None),

    dict(id="t101", level=None, template="exchangeFloor",
         narration=("Alameda's cushion was mostly a coin only its own exchange could price."),
         overlay=None),

    dict(id="t102", level=None, template="newsMontage", labels=["ALAMEDA'S BOOKS"],
         narration=("The story spread across crypto Twitter within hours."),
         overlay=None),

    dict(id="t103", level=None, template="bankExterior",
         narration=("One reader was watching very closely."),
         overlay=None),

    dict(id="t103b", level=None, template="officeFloor",
         narration=("He ran FTX's biggest rival."),
         overlay=None),

    dict(id="t104", level=None, template="closeUpPortrait", cast=2,
         narration=("Changpeng Zhao — everyone called him CZ — ran Binance, the largest crypto "
                    "exchange on Earth."),
         overlay=None),

    dict(id="t105", level=None, template="boardroom",
         narration=("Years earlier, Binance sold its own FTX stake back to Bankman-Fried."),
         overlay=None),

    dict(id="t105b", level=None, template="exchangeFloor",
         narration=("Paid in FTT."),
         overlay=None),

    dict(id="t106", level=None, template="domesticInterior",
         narration=("Binance was still sitting on billions of that same coin."),
         overlay=None),

    # §3a RHYTHM — the gap before the reversal. gap=1.4 is the ONE licensed use per episode.
    dict(id="t107", level=None, template="chartBoard", chart="down", gap=1.4,
         narration=("For four days, CZ said nothing in public."),
         overlay=None),

    # MIDPOINT REVERSAL — the subject's own machine (his rival, his own token) turns on him.
    dict(id="t108", level=None, template="broadcastDesk",
         narration=("Then, on November 6th, he posted one tweet: Binance would sell every FTT token "
                    "it held."),
         overlay=None),

    dict(id="t109", level=None, template="closeUpPortrait",
         narration=("The man he'd once done a deal with had just declared war."),
         overlay=None),

    dict(id="t110", level=None, template="chartBoard", chart="down",
         narration=("FTT's price started falling within minutes."),
         overlay=None),

    dict(id="t111", level=None, template="exchangeFloor",
         narration=("Down ten percent. Then twenty. Then more."),
         overlay=None),

    dict(id="t112", level=None, template="crowdQueue", foreground=dict(kind="overShoulder", side="right"),
         narration=("You could watch the number fall, live, in an app."),
         overlay=None),

    dict(id="t113", level=None, template="cityStreet",
         narration=("Users did the only sane thing: they tried to get their money out."),
         overlay=None),

    dict(id="t114", level=None, template="bankExterior",
         narration=("A bank run — on a bank that swore it could never have one."),
         overlay=None),

    dict(id="t115", level=None, template="newsMontage", overlay=dict(big="$6B", sub="WITHDRAWALS IN 72 HOURS"),
         narration=("Withdrawal requests hit six billion dollars in seventy-two hours."),
         ),

    dict(id="t116", level=None, template="officeFloor",
         narration=("Inside FTX, staff found the money wasn't there to give back."),
         overlay=None),

    dict(id="t117", level=None, template="domesticInterior",
         narration=("The gap between what users were owed, and what FTX held, was huge."),
         overlay=None,
         bubbles=[dict(text="How much can we actually cover?", speaker="left"),
                  dict(text="Maybe a few hundred million. Not six billion.", speaker="right", at=2.0)]),

    dict(id="t118", level=None, template="boardroom",
         narration=("November 8th. FTX froze withdrawals completely."),
         overlay=None),

    dict(id="t119", level=None, template="bankExterior",
         narration=("That same day, Binance agreed to buy the whole company."),
         overlay=None),

    dict(id="t120", level=None, template="closeUpPortrait",
         narration=("For about a day, it looked like a rescue."),
         overlay=None),

    dict(id="t121", level=None, template="newsMontage",
         narration=("Then Binance's own accountants opened the books."),
         overlay=None),

    dict(id="t122", level=None, template="chartBoard", chart="down", breath=True,
         narration=("What they found, people close to it said, was a hole running into the billions. "
                    "Money that should have sat untouched. It simply wasn't there. Binance walked "
                    "away the next day."),
         overlay=None),

    dict(id="t122b", level=None, template="closeUpPortrait",
         narration=("November 9th."),
         overlay=None),

    dict(id="t123", level=None, template="crowdQueue",
         narration=("The deal was dead, and so, most assumed, was FTX."),
         overlay=None),

    dict(id="t123b", level=None, template="officeFloor",
         narration=("November 10th."),
         overlay=None),

    dict(id="t124", level=None, template="bankExterior",
         narration=("The Bahamas froze what was left of FTX's local assets."),
         overlay=None),

    dict(id="t125", level=None, template="domesticInterior",
         narration=("That same day, Bankman-Fried posted the first of twenty-two tweets."),
         overlay=None),

    dict(id="t126", level=None, template="closeUpPortrait",
         card=dict(kind="narration", text="\"I'm sorry.\""),
         narration=("He opened with two words."),
         overlay=None),

    dict(id="t127", level=None, template="domesticInterior",
         card=dict(kind="narration", text="\"I f---ed up,\nshould've done better.\""),
         narration=("Then he admitted, in his own words, that he'd messed up."),
         overlay=None),

    dict(id="t128", level=None, template="newsMontage",
         narration=("November 11th. FTX, Alameda, and about a hundred and thirty linked firms filed "
                    "for bankruptcy."),
         overlay=None),

    dict(id="t129", level=None, template="boardroom",
         narration=("Bankman-Fried resigned as CEO that same day."),
         overlay=None),

    dict(id="t130", level=None, template="officeFloor",
         narration=("His replacement had one very specific résumé line."),
         overlay=None),

    dict(id="t131", level=None, template="closeUpPortrait", cast=2,
         narration=("John Ray had spent his career cleaning up wrecks."),
         overlay=None),

    dict(id="t131b", level=None, template="officeFloor", cast=2,
         narration=("Including one called Enron."),
         overlay=None),

    # §3a RHYTHM — HOLD, 14-16s, one of the budgeted 4-6 holds.
    dict(id="t132", level=None, template="bankExterior", breath=True,
         narration=("Ray filed a court statement: 'Never in my career have I seen such a complete "
                    "failure of corporate controls and such a complete absence of trustworthy "
                    "financial information as occurred here.' And Ray had cleaned up Enron once "
                    "already."),
         overlay=None),

    dict(id="t133", level=None, template="crowdQueue", mood="grim",
         narration=("A million people were suddenly owed money nobody could find."),
         overlay=None),

    dict(id="t134", level=None, template="officeFloor",
         card=dict(kind="objects", items=["safe", "laptop"]),
         narration=("Behind the clean app, there was supposed to be a vault."),
         overlay=None),

    dict(id="t134b", level=None, template="closeUpPortrait",
         narration=("There wasn't."),
         overlay=None),

    dict(id="t135", level=None, template="newsMontage",
         panels=dict(variant="grid4", cells=[dict(template="chartBoard"), dict(template="crowdQueue"),
                                             dict(template="bankExterior"), dict(template="boardroom")]),
         narration=("Every headline that week said some version of the same thing: the money is not "
                    "there."),
         overlay=None),

    dict(id="t136", level=None, template="cityStreet",
         narration=("December 12th, 2022. Nassau, the Bahamas."),
         overlay=None),

    dict(id="t137", level=None, template="bankExterior",
         narration=("The next morning, he was set to testify before Congress, about exactly what had "
                    "gone wrong."),
         overlay=None),

    dict(id="t138", level=None, template="closeUpPortrait",
         narration=("He never got the chance."),
         overlay=None),

    dict(id="t139", level=None, template="newsMontage",
         narration=("That night, Bahamian police arrested him, on a U.S. request."),
         overlay=None),

    dict(id="t140", level=None, template="crowdQueue",
         narration=("The hearing happened without him."),
         overlay=None),

    dict(id="t140b", level=None, template="closeUpPortrait",
         narration=("The next conversation would be in a courtroom."),
         overlay=None),

    # ================= CHAPTER 5 — The Reckoning =================
    dict(id="t141", level="CH 5", template="courtHearing", breath=True,
         narration=("Within weeks, the people closest to him started talking."),
         overlay=None,
         card=dict(kind="chapter", title="The Reckoning", subtitle="Seven Counts, Twenty-Five Years", hold=2.4)),

    dict(id="t142", level=None, template="closeUpPortrait", cast=2,
         narration=("Gary Wang, who wrote the original code, pleaded guilty, and agreed to help the "
                    "government."),
         overlay=None),

    dict(id="t143", level=None, template="courtHearing", cast=1,
         narration=("So did Caroline Ellison, who'd run the numbers herself."),
         overlay=None),

    dict(id="t144", level=None, template="officeFloor",
         narration=("Nishad Singh, the engineer the real numbers made sick, pleaded guilty too."),
         overlay=None),

    dict(id="t144b", level=None, template="closeUpPortrait",
         narration=("Three of his closest people."),
         overlay=None),

    dict(id="t145", level=None, template="courtHearing",
         narration=("Testifying against him, before the trial had even started."),
         overlay=None),

    dict(id="t146", level=None, template="newsMontage",
         narration=("October 3rd, 2023. His criminal trial opened in Manhattan."),
         overlay=None),

    dict(id="t147", level=None, template="courtHearing",
         narration=("The case was simple, they said: he took users' money, and spent it like his "
                    "own."),
         overlay=None),

    dict(id="t148", level=None, template="closeUpPortrait", cast=1, breath=True,
         narration=("Caroline Ellison spent nearly three days on the stand. She said he'd told her to "
                    "use user funds for Alameda's losses, for investments, for real estate, for the "
                    "donations."),
         overlay=None),

    dict(id="t149", level=None, template="courtHearing", cast=1,
         narration=("When it all fell apart, part of her felt relief."),
         overlay=None),

    dict(id="t150", level=None, template="closeUpPortrait", cast=1,
         narration=("She didn't have to lie anymore."),
         overlay=None),

    dict(id="t151", level=None, template="courtHearing",
         narration=("Bankman-Fried took the stand himself — a risky move, in his own defense."),
         overlay=None,
         dialogue=dict(text="I never meant to steal from anyone.")),

    dict(id="t152", level=None, template="closeUpPortrait",
         narration=("His lawyers said he never meant to steal anything, just to move fast, in a "
                    "business that moved fast."),
         overlay=None,
         dialogue=dict(text="You spent it like it was already yours.")),

    dict(id="t153", level=None, template="newsMontage",
         narration=("They even used the Super Bowl ad against him."),
         overlay=None),

    dict(id="t154", level=None, template="broadcastDesk",
         narration=("Proof, they argued, that FTX never really kept its U.S. users separate."),
         overlay=None),

    dict(id="t155", level=None, template="closeUpPortrait",
         narration=("If you sat in that jury box, the T-shirt wasn't the point anymore."),
         overlay=None),

    dict(id="t156", level=None, template="newsMontage",
         narration=("The jury did not agree."),
         overlay=None),

    dict(id="t157", level=None, template="courtHearing", overlay=dict(big="GUILTY", sub="ALL SEVEN COUNTS"),
         narration=("November 2nd, 2023. Guilty, on all seven counts."),
         ),

    dict(id="t158", level=None, template="newsMontage", labels=["GUILTY"],
         narration=("Wire fraud. Conspiracy. Securities fraud. Money laundering."),
         overlay=None),

    dict(id="t159", level=None, template="broadcastDesk",
         narration=("U.S. Attorney Damian Williams stepped up to the microphones."),
         overlay=None),

    dict(id="t160", level=None, template="closeUpPortrait", breath=True,
         narration=("He said: 'Sam Bankman-Fried perpetrated one of the biggest financial frauds in "
                    "American history — a multibillion-dollar scheme designed to make him the King of "
                    "Crypto.'"),
         overlay=None),

    dict(id="t161", level=None, template="newsMontage",
         narration=("The nickname the magazines gave him, read back as a charge sheet."),
         overlay=None),

    dict(id="t162", level=None, template="bankExterior",
         narration=("March 28th, 2024. Sentencing day."),
         overlay=None),

    dict(id="t163", level=None, template="courtHearing", overlay=dict(big="25 YEARS", sub="FEDERAL PRISON"),
         narration=("Judge Lewis Kaplan gave him twenty-five years."),
         ),

    dict(id="t164", level=None, template="officeFloor", overlay=dict(big="$11B", sub="ORDERED FORFEITURE"),
         narration=("And ordered him to pay back eleven billion dollars."),
         ),

    dict(id="t165", level=None, template="chartBoard", chart="down",
         narration=("Eight billion of it tied to the users who lost their cash."),
         overlay=None),

    dict(id="t166", level=None, template="crowdQueue", mood="grim",
         narration=("The rest: money raised on false promises, and debts owed to Alameda's own "
                    "lenders."),
         overlay=None),

    dict(id="t167", level=None, template="closeUpPortrait", cast=1,
         narration=("Caroline Ellison was sentenced separately, that September."),
         overlay=None),

    dict(id="t167b", level=None, template="bankExterior",
         narration=("To two years."),
         overlay=None),

    dict(id="t168", level=None, template="officeFloor",
         narration=("The judge called her help 'very, very substantial,' and drew a hard line between "
                    "her and him."),
         overlay=None),

    dict(id="t169", level=None, template="bankExterior",
         narration=("Gary Wang and Nishad Singh are still waiting on their own sentences."),
         overlay=None),

    dict(id="t170", level=None, template="courtHearing", mood="grim",
         narration=("The company is still being unwound, one claim at a time."),
         overlay=None),

    dict(id="t171", level=None, template="closeUpPortrait",
         narration=("None of it un-froze the accounts that stayed frozen two straight years."),
         overlay=None),

    dict(id="t172", level=None, template="cityStreet",
         narration=("The boy genius who was going to save crypto from itself is now just another "
                    "name on a very long list."),
         overlay=None),

    # ================= ENDING — reflection + complicit "we" + callback + forward tease =================
    dict(id="t173", level=None, template="domesticInterior",
         narration=("For a while, almost everyone believed the story."),
         overlay=None),

    dict(id="t174", level=None, template="broadcastDesk",
         narration=("The regulators who let him testify like an expert."),
         overlay=None),

    dict(id="t174b", level=None, template="newsMontage",
         narration=("The reporters who loved the T-shirt."),
         overlay=None),

    dict(id="t174c", level=None, template="closeUpPortrait",
         narration=("The politicians who cashed his checks."),
         overlay=None),

    dict(id="t175", level=None, template="crowdQueue",
         narration=("We wanted a genius who could make crypto safe."),
         overlay=None),

    dict(id="t176", level=None, template="newsMontage",
         narration=("We got a fraud who made it look safe instead."),
         overlay=None),

    dict(id="t177", level=None, template="closeUpPortrait",
         narration=("Even the ad got it right, by accident."),
         overlay=None),

    dict(id="t178", level=None, template="broadcastDesk",
         narration=("'I don't think so. And I'm never wrong about this stuff.'"),
         overlay=None),

    dict(id="t179", level=None, template="newsMontage",
         narration=("The one man whose whole job was to say no, said yes, and got paid for a Super "
                    "Bowl ad to prove it."),
         overlay=None),

    dict(id="t180", level=None, template="bankExterior",
         narration=("The back door that made him rich is gone now, deleted along with the company."),
         overlay=None),

    dict(id="t181", level=None, template="officeFloor",
         narration=("But the shape of it — trust me, don't check the books — never really goes "
                    "away."),
         overlay=None),

    dict(id="t182", level=None, template="closeUpPortrait",
         narration=("He built a business on being the one guy you never had to double-check."),
         overlay=None),

    # §3a RHYTHM — LAST SHOT, the longest hold, callback to the opening image AND a forward tease.
    dict(id="t183", level=None, template="cityStreet", breath=True,
         narration=("It started in a Berkeley apartment, on a bet that the numbers would hold. It "
                    "ended in a cell, twenty-five years long. Somewhere tonight, another kid in cargo "
                    "shorts is raising a round on that very same promise."),
         overlay=None),
]

# Apply the measured narration rate to every scene. `gen_voice_edge.py` reads `sc.get("rate", RATE)`,
# so this is the writer-side field the pipeline already documents (docs/BIBLE.md §8) — nothing in
# gen_voice_edge.py is edited. A scene that wants its own prosody can still set `rate=` explicitly in
# its own dict above; setdefault leaves that alone.
for _s in SCENES:
    _s.setdefault("rate", NARRATION_RATE)
