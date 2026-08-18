#!/usr/bin/env python3
"""The Madoff Ponzi Scheme Explained Like You're 5 — CRAYON-format explainer, ~16-17 min.

FORMAT: third-person past-tense explainer about a REAL subject (docs/BIBLE.md §1). Every date, figure
and quote is verified in docs/research/madoff.md with a source; anything I could not verify to that
standard is in that file's CUT list and is absent here. Register: straight and noirish, held throughout
(§2) — real charities and retirees lost real money, so a comic register would read as callous, the
same reasoning as lehman_brothers and theranos.

STRUCTURAL VARIATION vs the last two crayon-format episodes (lehman_brothers, theranos): the hook must
still use the five-step THESIS shape (docs/BIBLE.md §4) because the subject is a person, not a system —
the question-thesis variant is explicitly reserved for systemic subjects with no single birthplace, and
never for a person. So the hook SHAPE repeats by necessity; its CONTENT does not. What varies:
  * FIVE chapters (matching lehman's count, not theranos's four) but shaped as a clean chronological
    escalation — Chairman -> Room -> Warning -> Crash -> Reckoning — rather than lehman's
    mechanism-then-trick-then-climax shape.
  * ENDING shape: reflection + complicit "we" + a DIRECT VERIFIED QUOTE, closing with no forward tease
    and no unanswered question. lehman closed on reflection alone (no attributed quote at the very
    end); theranos closed on an unanswered question + quote. This episode is the only one of the three
    to end on the Wolf-of-Wall-Street shape in full: reflection, "we", quote, full stop.
  * MOTIF: theranos ran "one drop of blood" as its through-line; lehman ran "take the thing nobody can
    pay for, sell it on"; this one runs THE NUMBER — the promised, unmoving ~10% annual return, planted
    in the hook, defined as a decision rather than a result in Ch2, and inverted in the last line: the
    one number he could never talk down was his own sentence, 150 years.

CHAPTERS (§1, `Evocative Noun: Plain Explanation`, emitted as card=dict(kind="chapter", ...) and used
verbatim in the description timestamps):
  1 The Chairman  : A Lifeguard's $5,000 Start
  2 The Room      : Where the Trades Never Happened
  3 The Warning   : A Decade the SEC Wouldn't Listen
  4 The Crash     : When the Money Stopped Coming In
  5 The Reckoning : Eleven Counts, 150 Years

PROMISE -> PAYOFF LEDGER:
  * Hook promise: "paid old investors with money that was never actually invested" -> mechanism PAID
    in Ch2 (the 17th floor, DiPascali's fabricated statements, no real custodian).
  * MOTIF: THE NUMBER (~10% a year, "up markets, down markets") planted in the hook and Ch1 t018/t019
    -> Ch2 t042 reveals it was chosen, not earned -> Ch3 t074 (Markopolos: a return that smooth isn't
    a strategy) -> Ch4 t096 (the number that never dropped, dropping) -> ending payoff t160/t161: the
    one number that could never be adjusted was his own sentence.
  * EPITHET: "chaired NASDAQ three times" / "the most trusted man on Wall Street" planted in the hook
    and Ch1 t011-t013 -> re-triggered ironically in Ch3 t087-t089 (why the SEC never really checked)
    -> paid off in the ending t155 ("an entire industry made him its own watchdog").
  * FLOOR CALLBACK: 19th floor (real business) vs 17th floor (the fraud) planted Ch1 t015-t017 -> paid
    off Ch5 t139 (neither son was ever charged — they worked the honest floor).
  * PLANT -> PAYOFF: Elie Wiesel Foundation invests almost its whole endowment (Ch1 t029) -> loses
    almost all of it (Ch4 t117). Fairfield Greenwich funnels in $7.2B (Ch1 t027) -> loses it with
    everyone else (Ch4 t118).
  * share-worthy beat #1: the man running the fraud had chaired the NASDAQ stock exchange three times.
  * share-worthy beat #2: the whistleblower's own 2005 memo to the SEC was titled, without irony,
    "The World's Largest Hedge Fund Is a Fraud" — three years before anyone believed him.
  * share-worthy beat #3: the SEC's own later review found it had examined the firm eight separate
    times over sixteen years and never once called an outside bank to check a trade.
  * MIDPOINT REVERSAL (§5, "the moment the subject's own machine turns on them"): the 2008 crash
    triggers ~$7B in redemption requests the scheme cannot cover, and for the first time in nearly
    fifty years, more money is trying to leave than is arriving. gap=1.4 on the scene immediately
    before Madoff's confession to his sons.

Numbers, sentence lengths and WPM are self-checked against docs/BIBLE.md §3 before build; see the tail
of this file for the narration-rate stamp.
"""

FPS = 30

NARRATION_RATE = "-5%"   # matches the current channel-wide retune (docs/BIBLE.md §3), unchanged here

SCENES = [
    # ================= HOOK — five steps, first ~30s =================
    dict(id="t001", level=None, template="cityStreet",
         narration=("For almost fifty years, a Wall Street legend paid old investors with money that "
                    "was never actually invested."),
         overlay=None),

    dict(id="t001b", level=None, template="bankExterior",
         narration=("Sixty-four billion dollars, on paper."),
         overlay=None),

    dict(id="t001c", level=None, template="crowdQueue",
         narration=("Charities, wiped out overnight."),
         overlay=None),

    dict(id="t001d", level=None, template="newsMontage",
         narration=("A warning, ignored for eight straight years."),
         overlay=None),

    dict(id="t002", level=None, template="boardroom",
         narration=("But the man running it had chaired the NASDAQ stock exchange. Three separate "
                    "times."),
         overlay=None,
         card=dict(kind="narration", text="A regulator by day.\nA fraud by night.")),

    dict(id="t003", level=None, template="exchangeFloor",
         narration=("This is the story of Bernie Madoff, the most trusted man on Wall Street, and the "
                    "machine he ran without a single real trade."),
         overlay=None),

    dict(id="t004", level=None, template="domesticInterior",
         narration=("It starts with a lifeguard's five thousand dollars. It ends with a sentence of a "
                    "hundred and fifty years."),
         overlay=None),

    dict(id="t005", level=None, template="cityStreet",
         narration=("Queens, New York. 1960."),
         overlay=None),

    # ================= CHAPTER 1 — The Chairman =================
    dict(id="t006", level="CH 1", template="officeFloor", breath=True, period="mid20c",
         narration=("A twenty-two-year-old named Bernie Madoff started a small trading firm that year."),
         overlay=None,
         card=dict(kind="chapter", title="The Chairman", subtitle="A Lifeguard's $5,000 Start", hold=2.4)),

    dict(id="t007", level=None, template="domesticInterior", period="mid20c",
         narration=("His stake: five thousand dollars, saved lifeguarding and installing sprinklers."),
         overlay=None),

    dict(id="t008", level=None, template="cityStreet",
         narration=("He built it into one of the busiest trading desks on Wall Street."),
         overlay=None),

    dict(id="t009", level=None, template="chartBoard", period="mid20c",
         narration=("He helped build the technology behind a brand-new stock exchange: NASDAQ."),
         overlay=None),

    dict(id="t010", level=None, template="cityStreet",
         narration=("Electronic trading. His idea, years ahead of its time."),
         overlay=None),

    dict(id="t011", level=None, template="boardroom",
         narration=("By 1990, NASDAQ's own board made him chairman."),
         overlay=None),

    dict(id="t012", level=None, template="newsMontage",
         narration=("Then again in '91. Then again in '93."),
         overlay=None),

    dict(id="t013", level=None, template="closeUpPortrait",
         narration=("Three times, the industry itself put him in charge of watching for fraud."),
         overlay=None),

    dict(id="t014", level=None, template="crowdQueue",
         narration=("That was the public Madoff — a regulator, a mentor, a name people trusted with "
                    "their life savings."),
         overlay=None),

    # §3a RHYTHM — HOLD #1, ~13-14s. The reveal that a second, hidden business existed.
    dict(id="t015", level=None, template="boardroom",
         narration=("But there was a second business, quieter than the first. An investment arm, run "
                    "out of the same firm, on a separate floor, with its own small staff, and almost "
                    "nobody outside it ever set foot inside."),
         overlay=None),

    dict(id="t016", level=None, template="officeFloor",
         narration=("Seventeenth floor. Real trading stayed upstairs, on nineteen."),
         overlay=None),

    dict(id="t017", level=None, template="domesticInterior",
         narration=("Twenty-four people worked on seventeen. That was the whole operation."),
         overlay=None),

    dict(id="t018", level=None, template="chartBoard",
         narration=("It promised something no honest fund can promise: about ten percent a year. Every "
                    "year. Rain or shine."),
         overlay=None),

    dict(id="t019", level=None, template="closeUpPortrait",
         narration=("Up markets. Down markets. Ten percent."),
         overlay=None),

    dict(id="t020", level=None, template="boardroom",
         narration=("The strategy had a name: split-strike conversion."),
         overlay=None,
         card=dict(kind="word", word="Split-Strike")),

    dict(id="t020b", level=None, template="closeUpPortrait",
         narration=("A strategy built from stock, options, and a promise."),
         overlay=None,
         card=dict(kind="objects", items=["laptop", "coinStack"])),

    dict(id="t021", level=None, template="chartBoard",
         narration=("Buy blue-chip stocks. Use options to cap the losses, and the gains."),
         overlay=None),

    dict(id="t022", level=None, template="newsMontage",
         narration=("On paper, a clever, careful strategy."),
         overlay=None),

    dict(id="t023", level=None, template="exchangeFloor",
         narration=("Money followed the number, not the method."),
         overlay=None),

    dict(id="t024", level=None, template="boardroom",
         narration=("New investors rarely asked how it worked. They asked when they could start."),
         overlay=None,
         bubbles=[dict(text="How do you get ten percent every year?", x=0.28, y=0.55, tail="right"),
                  dict(text="I don't discuss the strategy. Just the results.", x=0.72, y=0.25,
                       tail="left", at=2.0)]),

    dict(id="t025", level=None, template="crowdQueue",
         narration=("Word spread by referral only — a private club, hard to join."),
         overlay=None),

    dict(id="t026", level=None, template="bankExterior",
         narration=("Big banks and pension funds began asking to get in too."),
         overlay=None,
         foreground=dict(kind="overShoulder", side="right")),

    dict(id="t027", level=None, template="chartBoard",
         narration=("A firm named Fairfield Greenwich funneled in seven point two billion dollars of "
                    "other people's money."),
         overlay=dict(big="$7.2 BILLION", sub="FUNNELED IN BY ONE FEEDER FUND")),

    dict(id="t028", level=None, template="domesticInterior",
         narration=("Charities signed up too. Foundations. Retirement funds."),
         overlay=None),

    dict(id="t029", level=None, template="closeUpPortrait",
         narration=("The Elie Wiesel Foundation put in almost its entire endowment."),
         overlay=None),

    dict(id="t030", level=None, template="newsMontage",
         narration=("Nobody demanded to see the trades."),
         overlay=None),

    dict(id="t031", level=None, template="boardroom",
         narration=("Why would they? The chairman of NASDAQ was running it."),
         overlay=None),

    dict(id="t032", level=None, template="exchangeFloor",
         narration=("By the two-thousands, the advisory arm was managing tens of billions."),
         overlay=None),

    # §3a RHYTHM — long beat, ~9s.
    dict(id="t033", level=None, template="officeFloor", breath=True,
         narration=("Every single year, the number came back the same: about ten percent. Never wildly "
                    "high. Never a bad year. Just steady, reliable, boring."),
         overlay=None),

    dict(id="t034", level=None, template="chartBoard",
         narration=("Boring was the whole point. Boring is what nobody double-checks."),
         overlay=None),

    dict(id="t035", level=None, template="newsMontage",
         narration=("It looked less like a hedge fund and more like a bank statement."),
         overlay=None),

    dict(id="t036", level=None, template="crowdQueue",
         narration=("Some Wall Street pros quietly wondered how. Business was good, so nobody pressed "
                    "it."),
         overlay=None),

    dict(id="t037", level=None, template="closeUpPortrait",
         narration=("Nobody wanted to be the one who ruined a good thing."),
         overlay=None),

    dict(id="t038", level=None, template="bankExterior",
         narration=("By 2005, the seventeenth floor was managing money for thousands of people who had "
                    "never once seen it run."),
         overlay=None),

    # forward hook, end of chapter 1
    dict(id="t039", level=None, template="boardroom",
         narration=("The number never moved. What did it actually take to keep it from moving?"),
         overlay=None),

    # ================= CHAPTER 2 — The Room =================
    dict(id="t040", level="CH 2", template="officeFloor", breath=True,
         narration=("Behind the seventeenth floor's locked door, the machine worked differently than "
                    "anyone on the outside believed."),
         overlay=None,
         card=dict(kind="chapter", title="The Room", subtitle="Where the Trades Never Happened", hold=2.4)),

    dict(id="t041", level=None, template="courtHearing",
         narration=("There were no trades."),
         overlay=None),

    dict(id="t042", level=None, template="chartBoard",
         narration=("None. Not that year. Not most years."),
         overlay=None),

    # §3a RHYTHM — HOLD #2, mechanism definition, ~15s.
    dict(id="t043", level=None, template="domesticInterior",
         narration=("Here is what a Ponzi scheme actually is. Take a new investor's money. Use it to "
                    "pay an old investor what looks like a profit. It is somebody else's cash, moving "
                    "through your hands, on its way back out the door."),
         overlay=None),

    dict(id="t044", level=None, template="crowdQueue",
         narration=("It only works as long as new money keeps arriving faster than old money leaves."),
         overlay=None),

    dict(id="t044b", level=None, template="closeUpPortrait",
         narration=("You only find out it's fake on the one morning everybody wants their money "
                    "at once."),
         overlay=None),

    dict(id="t045", level=None, template="boardroom",
         narration=("The ten percent was never earned. It was chosen."),
         overlay=None,
         card=dict(kind="word", word="Chosen")),

    dict(id="t046", level=None, template="closeUpPortrait",
         narration=("Chosen, then worked backward into fake trade statements."),
         overlay=None),

    dict(id="t047", level=None, template="officeFloor",
         narration=("A small team on the seventeenth floor did that work by hand."),
         overlay=None),

    dict(id="t048", level=None, template="domesticInterior",
         narration=("Its chief was a man named Frank DiPascali."),
         overlay=None),

    dict(id="t049", level=None, template="newsMontage",
         narration=("He built the fake statements. Prices. Dates. Trade tickets. All of it invented."),
         overlay=None),

    dict(id="t050", level=None, template="officeFloor",
         narration=("Years later, DiPascali admitted it under oath."),
         overlay=None),

    dict(id="t051", level=None, template="courtHearing",
         narration=("He put it in two words."),
         overlay=None,
         dialogue=dict(text="It's all fake."),
         card=dict(kind="narration", text="\"It's all fake.\"")),

    dict(id="t052", level=None, template="chartBoard",
         narration=("That was the whole company, once you knew."),
         overlay=None),

    dict(id="t053", level=None, template="boardroom",
         narration=("So who checked the books?"),
         overlay=None),

    dict(id="t054", level=None, template="officeFloor",
         narration=("A three-person accounting firm, working out of a strip mall."),
         overlay=None),

    dict(id="t055", level=None, template="domesticInterior",
         narration=("Friehling and Horowitz. One of them was barely ever there."),
         overlay=None),

    # §3a RHYTHM — long, ~9s.
    dict(id="t056", level=None, template="closeUpPortrait",
         narration=("For over a decade, its rubber stamp was the only outside check on tens of billions "
                    "of dollars."),
         overlay=None),

    dict(id="t057", level=None, template="newsMontage",
         narration=("No custodian. No clearing house. No second set of eyes."),
         overlay=None,
         card=dict(kind="narration", text="No second set\nof eyes.")),

    dict(id="t058", level=None, template="boardroom",
         narration=("Real firms settle trades through outside custodians. Madoff's firm was its own "
                    "custodian."),
         overlay=None,
         foreground=dict(kind="overShoulder", side="right")),

    dict(id="t059", level=None, template="exchangeFloor",
         narration=("It held the cash. It held the statements. It graded its own homework."),
         overlay=None),

    dict(id="t060", level=None, template="chartBoard",
         narration=("So when the strategy needed a good month, the seventeenth floor simply wrote one."),
         overlay=None),

    dict(id="t061", level=None, template="closeUpPortrait",
         narration=("When it needed a mediocre month, to look believable, it wrote that too."),
         overlay=None),

    dict(id="t062", level=None, template="domesticInterior",
         narration=("The only real skill in that room was picking numbers nobody would question."),
         overlay=None),

    dict(id="t063", level=None, template="newsMontage",
         narration=("Statements went out on real letterhead, in real envelopes, on schedule, every "
                    "month."),
         overlay=None),

    dict(id="t063b", level=None, template="domesticInterior",
         narration=("One client's spouse asked, gently, if they should double-check them."),
         overlay=None,
         bubbles=[dict(text="Should we ask for the statements again?", x=0.28, y=0.55, tail="right"),
                  dict(text="Why? They always come.", x=0.72, y=0.25, tail="left", at=2.0)]),

    dict(id="t064", level=None, template="boardroom",
         narration=("A new hire once asked to see the actual trading floor for the advisory business."),
         overlay=None,
         bubbles=[dict(text="Where's the trading floor?", x=0.28, y=0.55, tail="right"),
                  dict(text="You're standing on it.", x=0.72, y=0.25, tail="left", at=1.8)]),

    dict(id="t065", level=None, template="closeUpPortrait",
         narration=("There wasn't one. There was a printer."),
         overlay=None),

    dict(id="t066", level=None, template="crowdQueue",
         narration=("By the two-thousands, that printer was standing in for tens of billions of dollars "
                    "in trades that never happened."),
         overlay=None),

    dict(id="t067", level=None, template="chartBoard",
         narration=("On paper, client balances kept climbing. In the real world, the cash was somewhere "
                    "else entirely."),
         overlay=None,
         panels=dict(variant="v2", cells=[dict(template="chartBoard"), dict(template="officeFloor")])),

    dict(id="t068", level=None, template="officeFloor",
         narration=("Some of it paid old investors' withdrawals."),
         overlay=None),

    dict(id="t069", level=None, template="domesticInterior",
         narration=("Some of it paid Madoff's own homes, boats, and staff."),
         overlay=None),

    dict(id="t070", level=None, template="newsMontage",
         narration=("Almost none of it was ever actually invested."),
         overlay=None),

    # §3a RHYTHM — long, ~9s.
    dict(id="t071", level=None, template="closeUpPortrait", breath=True,
         narration=("For the scheme to survive, one thing had to stay true forever: more money had to "
                    "walk in the door than walk out of it."),
         overlay=None),

    # forward hook, end of chapter 2
    dict(id="t072", level=None, template="boardroom",
         narration=("For most of three decades, that was exactly what happened. But somebody outside "
                    "the seventeenth floor had already started doing the math."),
         overlay=None),

    # ================= CHAPTER 3 — The Warning =================
    dict(id="t073", level="CH 3", template="chartBoard", breath=True,
         narration=("One man outside that seventeenth floor did the math Madoff's own investors never "
                    "bothered to do."),
         overlay=None,
         card=dict(kind="chapter", title="The Warning", subtitle="A Decade the SEC Wouldn't Listen", hold=2.4)),

    dict(id="t074", level=None, template="cityStreet",
         narration=("His name was Harry Markopolos."),
         overlay=None),

    dict(id="t075", level=None, template="officeFloor",
         narration=("A rival firm asked him to copy Madoff's strategy and match his returns."),
         overlay=None),

    dict(id="t076", level=None, template="chartBoard",
         narration=("He tried. He could not do it."),
         overlay=None),

    dict(id="t077", level=None, template="domesticInterior",
         narration=("Not close. Not for one single month."),
         overlay=None),

    # §3a RHYTHM — HOLD #3, ~13s.
    dict(id="t078", level=None, template="boardroom",
         narration=("That was the tell. A real strategy, run in a real market, has good months and bad "
                    "months. Madoff's had neither. It only ever had one month: a good one."),
         overlay=None),

    dict(id="t079", level=None, template="newsMontage",
         narration=("A return that smooth isn't a strategy. It's a decision, dressed up as one."),
         overlay=None),

    dict(id="t080", level=None, template="closeUpPortrait",
         narration=("Markopolos wrote it all down and sent it to the SEC."),
         overlay=None),

    dict(id="t081", level=None, template="exchangeFloor",
         narration=("In 1999."),
         overlay=None),

    dict(id="t082", level=None, template="chartBoard",
         narration=("Then 2000. Then 2001."),
         overlay=None),

    dict(id="t083", level=None, template="courtHearing",
         narration=("The SEC did not act."),
         overlay=None),

    dict(id="t084", level=None, template="officeFloor",
         narration=("In 2004, inspectors spent months inside the firm."),
         overlay=None),

    dict(id="t085", level=None, template="courtHearing",
         narration=("They still found nothing."),
         overlay=None),

    dict(id="t086", level=None, template="newsMontage",
         narration=("In 2005, Markopolos sent a nineteen-page memo, with a title that did not hide its "
                    "point."),
         overlay=None,
         card=dict(kind="narration", text="\"The World's Largest\nHedge Fund Is a Fraud.\"")),

    dict(id="t087", level=None, template="closeUpPortrait",
         narration=("Twenty-nine separate red flags. Numbered."),
         overlay=None),

    dict(id="t088", level=None, template="chartBoard",
         narration=("A fund that size should have moved prices when it traded. It never moved anything."),
         overlay=None),

    dict(id="t089", level=None, template="domesticInterior",
         narration=("He sent the warning again in 2007. Again in 2008."),
         overlay=None),

    dict(id="t090", level=None, template="crowdQueue",
         narration=("Nine years."),
         overlay=None),

    dict(id="t091", level=None, template="boardroom",
         narration=("Investigators finally sat down with Madoff himself and asked him directly."),
         overlay=None,
         bubbles=[dict(text="Are you running a Ponzi scheme?", x=0.28, y=0.55, tail="right"),
                  dict(text="No. Of course not.", x=0.72, y=0.25, tail="left", at=2.2)]),

    dict(id="t092", level=None, template="courtHearing",
         narration=("They believed him."),
         overlay=None),

    # §3a RHYTHM — HOLD #4, ~14s.
    dict(id="t093", level=None, template="chartBoard",
         narration=("The SEC's own later review found the failure almost simple: eight separate looks "
                    "at the firm over sixteen years, and nobody ever once called an outside bank to "
                    "check if a single trade was real."),
         overlay=None),

    dict(id="t094", level=None, template="boardroom",
         narration=("The chairman-of-NASDAQ story did the rest of the work by itself."),
         overlay=None),

    dict(id="t095", level=None, template="newsMontage",
         narration=("Why audit the man the industry put in charge of watching for fraud?"),
         overlay=None),

    dict(id="t096", level=None, template="closeUpPortrait",
         narration=("Nobody wanted to be the one who asked."),
         overlay=None,
         foreground=dict(kind="overShoulder", side="left")),

    dict(id="t097", level=None, template="crowdQueue",
         narration=("So the money kept arriving. More feeder funds. More retirement accounts. More "
                    "foundations."),
         overlay=None),

    dict(id="t098", level=None, template="exchangeFloor",
         narration=("By the mid two-thousands, statements showed tens of billions of dollars in client "
                    "balances."),
         overlay=None),

    dict(id="t099", level=None, template="chartBoard",
         narration=("Every one of those dollars existed only on the seventeenth floor's own paper."),
         overlay=None),

    dict(id="t100", level=None, template="domesticInterior",
         narration=("The real cash, sitting in real accounts, was far smaller."),
         overlay=None),

    # forward hook, end of chapter 3
    dict(id="t101", level=None, template="boardroom",
         narration=("The gap between the paper number and the real one only mattered on one specific "
                    "kind of day: the day too many people asked for their money at once."),
         overlay=None),

    # ================= CHAPTER 4 — The Crash =================
    dict(id="t102", level="CH 4", template="newsMontage", breath=True,
         narration=("2008. The whole market was falling, and for the first time, so was Madoff's oldest "
                    "advantage."),
         overlay=None,
         card=dict(kind="chapter", title="The Crash", subtitle="When the Money Stopped Coming In", hold=2.4)),

    dict(id="t103", level=None, template="exchangeFloor",
         narration=("For decades, his number never dropped. That was the entire pitch."),
         overlay=None),

    dict(id="t104", level=None, template="crowdQueue",
         narration=("Now everyone else's money was disappearing. Naturally, people wanted to check on "
                    "theirs."),
         overlay=None),

    dict(id="t104b", level=None, template="exchangeFloor",
         narration=("Ask for your money back at the wrong moment, and you find out fast what's "
                    "actually there."),
         overlay=None),

    dict(id="t105", level=None, template="chartBoard",
         narration=("Clients asked for roughly seven billion dollars back."),
         overlay=dict(big="$7 BILLION", sub="IN WITHDRAWAL REQUESTS, LATE 2008")),

    dict(id="t106", level=None, template="bankExterior",
         narration=("There was nowhere near that much real cash on hand."),
         overlay=None),

    dict(id="t107", level=None, template="officeFloor",
         narration=("There never had been."),
         overlay=None),

    dict(id="t107b", level=None, template="chartBoard",
         narration=("Two pictures of the same week: the statements, still climbing — and a line of "
                    "people asking for cash."),
         overlay=None,
         panels=dict(variant="v2", cells=[dict(template="chartBoard"), dict(template="crowdQueue")])),

    dict(id="t108", level=None, template="domesticInterior",
         narration=("For almost fifty years, the trick had one requirement: new money, arriving faster "
                    "than old money left."),
         overlay=None),

    dict(id="t109", level=None, template="closeUpPortrait",
         narration=("In December 2008, for the first time, that stopped being true."),
         overlay=None),

    # §3a RHYTHM — the quiet beat immediately before the reversal. gap=1.4 drops the mix to near-silence.
    dict(id="t110", level=None, template="domesticInterior",
         narration=("There was no more money coming in to cover it."),
         overlay=None,
         gap=1.4),

    # §3a RHYTHM — MIDPOINT REVERSAL, ~13-14s.
    dict(id="t111", level=None, template="newsMontage",
         narration=("Early December 2008. Bernie Madoff told his own sons the business was, in his "
                    "words, 'one big lie' — a Ponzi scheme, and there was no way to pay everyone back."),
         overlay=None),

    dict(id="t112", level=None, template="closeUpPortrait",
         narration=("His sons did what he had not expected."),
         overlay=None),

    dict(id="t113", level=None, template="courtHearing",
         narration=("They reported their own father to federal authorities. The next day."),
         overlay=dict(big="DEC 10, 2008", sub="HIS SONS REPORT HIM")),

    dict(id="t114", level=None, template="cityStreet",
         narration=("December 11th, 2008."),
         overlay=None),

    dict(id="t115", level=None, template="domesticInterior",
         narration=("FBI agents came to his Manhattan apartment that morning."),
         overlay=None,
         foreground=dict(kind="overShoulder", side="left")),

    dict(id="t116", level=None, template="closeUpPortrait",
         narration=("One agent asked if there was an innocent explanation for what his sons had "
                    "described."),
         overlay=None),

    dict(id="t117", level=None, template="domesticInterior",
         narration=("Madoff answered in one sentence."),
         overlay=None,
         dialogue=dict(text="There is no innocent explanation. I've been running a massive Ponzi "
                            "scheme.")),

    dict(id="t118", level=None, template="crowdQueue",
         narration=("That sentence ended it."),
         overlay=None),

    dict(id="t118b", level=None, template="cityStreet",
         narration=("One sentence. Fifty years of the number, over."),
         overlay=None),

    dict(id="t119", level=None, template="newsMontage",
         narration=("He was arrested within the hour."),
         overlay=None),

    dict(id="t120", level=None, template="broadcastDesk", mood="grim",
         narration=("The SEC's first public number, that week, was fifty billion dollars."),
         overlay=dict(big="$50 BILLION", sub="SEC'S FIRST ESTIMATE")),

    dict(id="t120b", level=None, template="boardroom",
         narration=("Just the opening estimate."),
         overlay=None),

    dict(id="t121", level=None, template="chartBoard",
         narration=("A fuller count later put the paper value of the fraud at sixty-four point eight "
                    "billion."),
         overlay=dict(big="$64.8 BILLION", sub="TOTAL FICTITIOUS VALUE")),

    # §3a RHYTHM — long, ~10s.
    dict(id="t122", level=None, template="boardroom",
         narration=("The real cash lost — money actually put in and never given back — was closer to "
                    "seventeen and a half billion."),
         overlay=dict(big="$17.5 BILLION", sub="ACTUAL CASH LOST")),

    dict(id="t123", level=None, template="exchangeFloor",
         narration=("Two different numbers. Both true. Both his."),
         overlay=None),

    dict(id="t124", level=None, template="crowdQueue",
         narration=("The Elie Wiesel Foundation lost almost its entire fifteen-million-dollar endowment."),
         overlay=None),

    dict(id="t125", level=None, template="newsMontage",
         narration=("Fairfield Greenwich's seven point two billion, gone with it."),
         overlay=None),

    dict(id="t125b", level=None, template="crowdQueue",
         narration=("People who trusted a name on a letterhead lost it all in a single week."),
         overlay=None),

    # forward hook, end of chapter 4
    dict(id="t126", level=None, template="boardroom",
         narration=("The confession took ten minutes. What it cost, and who would pay for it, took "
                    "years to work out."),
         overlay=None),

    # ================= CHAPTER 5 — The Reckoning =================
    dict(id="t127", level="CH 5", template="courtHearing", breath=True, mood="grim",
         narration=("There was no trial. On March 12th, 2009, Madoff pleaded guilty to all eleven "
                    "federal counts against him."),
         overlay=None,
         card=dict(kind="chapter", title="The Reckoning", subtitle="Eleven Counts, 150 Years", hold=2.4)),

    dict(id="t128", level=None, template="officeFloor",
         narration=("Securities fraud. Wire fraud. Money laundering. Perjury."),
         overlay=None),

    dict(id="t129", level=None, template="chartBoard",
         narration=("Eleven counts. Eleven guilty pleas. No trial needed at all."),
         overlay=dict(big="11 COUNTS", sub="GUILTY PLEA, MARCH 12, 2009")),

    dict(id="t129b", level=None, template="closeUpPortrait",
         narration=("Guilty."),
         overlay=None,
         card=dict(kind="word", word="Guilty")),

    dict(id="t130", level=None, template="boardroom",
         narration=("Three months later, he stood in front of a judge to hear his sentence."),
         overlay=None),

    dict(id="t131", level=None, template="courtHearing",
         narration=("June 29th, 2009."),
         overlay=None),

    dict(id="t132", level=None, template="closeUpPortrait",
         narration=("The maximum sentence on those eleven counts added up to one hundred and fifty "
                    "years."),
         overlay=None),

    dict(id="t133", level=None, template="domesticInterior",
         narration=("He apologized to the courtroom."),
         overlay=None,
         dialogue=dict(text="I am sorry. I know it will not help you.")),

    dict(id="t134", level=None, template="closeUpPortrait",
         narration=("Then he said one more thing."),
         overlay=None,
         dialogue=dict(text="I left a legacy of shame. It is something I will live with for the rest "
                            "of my life.")),

    # §3a RHYTHM — HOLD #5, the judge's own words, ~12s.
    dict(id="t135", level=None, template="courtHearing",
         narration=("The judge called the crimes 'extraordinarily evil,' and said this was not a "
                    "bloodless crime on paper — it was one that took, in his words, a staggering human "
                    "toll."),
         overlay=None),

    dict(id="t135b", level=None, template="closeUpPortrait",
         narration=("Say the same number enough years running, and people stop asking you to prove it."),
         overlay=None),

    dict(id="t136", level=None, template="boardroom",
         narration=("One hundred and fifty years. Not a symbolic number — the actual math of eleven "
                    "federal counts, stacked end to end."),
         overlay=None),

    dict(id="t137", level=None, template="crowdQueue",
         narration=("He was seventy-one. It was, in every way that matters, a life sentence."),
         overlay=None),

    dict(id="t138", level=None, template="broadcastDesk",
         narration=("But he was not the only Madoff who answered for it."),
         overlay=None),

    dict(id="t139", level=None, template="officeFloor",
         narration=("His brother Peter had been chief compliance officer — the man whose job was to "
                    "catch exactly this."),
         overlay=None),

    dict(id="t140", level=None, template="courtHearing",
         narration=("In 2012, Peter pleaded guilty too."),
         overlay=None),

    dict(id="t141", level=None, template="bankExterior",
         narration=("Ten years in federal prison."),
         overlay=dict(big="10 YEARS", sub="PETER MADOFF'S SENTENCE, 2012")),

    dict(id="t142", level=None, template="chartBoard",
         narration=("And an order to forfeit a symbolic one hundred forty-three billion dollars — a "
                    "number nobody expected him to ever actually pay."),
         overlay=None),

    dict(id="t143", level=None, template="domesticInterior", breath=True, mood="grim",
         narration=("Two years earlier, on the exact anniversary of his father's arrest, Mark Madoff "
                    "had taken his own life."),
         overlay=dict(big="DEC 11, 2010", sub="MARK MADOFF")),

    dict(id="t144", level=None, template="closeUpPortrait",
         narration=("December 11th. Two years to the day."),
         overlay=None),

    dict(id="t146", level=None, template="boardroom",
         narration=("Neither son was ever charged. Both had worked the honest side of the firm — the "
                    "nineteenth floor, not the seventeenth."),
         overlay=None,
         panels=dict(variant="v2", cells=[dict(template="officeFloor"), dict(template="domesticInterior")])),

    dict(id="t147", level=None, template="crowdQueue",
         narration=("So who actually got any money back?"),
         overlay=None),

    dict(id="t148", level=None, template="courtHearing",
         narration=("A court-appointed trustee named Irving Picard spent over a decade chasing it down."),
         overlay=None,
         foreground=dict(kind="overShoulder", side="right")),

    dict(id="t148b", level=None, template="closeUpPortrait",
         narration=("From outside, recovering it looked simple. It never was."),
         overlay=None),

    dict(id="t149", level=None, template="chartBoard",
         narration=("He sued the 'winners' — investors who had pulled out more than they ever put in — "
                    "to give it back."),
         overlay=None),

    dict(id="t149b", level=None, template="boardroom",
         narration=("One investor's lawyer asked the trustee's office, flatly, what was left."),
         overlay=None,
         bubbles=[dict(text="Will I get anything back?", x=0.28, y=0.55, tail="right"),
                  dict(text="More than you think. Less than you lost.", x=0.72, y=0.25,
                       tail="left", at=2.2)]),

    dict(id="t150", level=None, template="officeFloor",
         narration=("By the 2020s, combined recoveries reached roughly ninety-four percent of every "
                    "real dollar lost."),
         overlay=dict(big="94%", sub="OF REAL LOSSES EVENTUALLY RECOVERED")),

    dict(id="t151", level=None, template="exchangeFloor",
         narration=("Most of the real seventeen-billion-dollar hole was, eventually, actually filled "
                    "back in."),
         overlay=None),

    dict(id="t152", level=None, template="domesticInterior",
         narration=("The sixty-four-billion-dollar number, the one everyone remembers, never existed to "
                    "begin with."),
         overlay=None),

    dict(id="t152b", level=None, template="closeUpPortrait",
         narration=("Two numbers. Only one was ever real."),
         overlay=None),

    dict(id="t153", level=None, template="broadcastDesk", mood="grim",
         narration=("Frank DiPascali, the man who wrote the fake statements, died before his own "
                    "sentencing, in 2015."),
         overlay=None),

    dict(id="t154", level=None, template="courtHearing",
         narration=("The auditor, David Friehling, from the three-person firm in the strip mall, "
                    "pleaded guilty too."),
         overlay=None),

    dict(id="t155", level=None, template="officeFloor",
         narration=("Neither of them ever ran the machine again."),
         overlay=None),

    dict(id="t156", level=None, template="domesticInterior",
         narration=("In prison, Madoff's health failed. Stage-four kidney disease, by 2014."),
         overlay=None),

    dict(id="t157", level=None, template="cityStreet",
         narration=("April 14th, 2021."),
         overlay=None),

    dict(id="t158", level=None, template="closeUpPortrait",
         narration=("Bernie Madoff died in federal prison. He was eighty-two."),
         overlay=None,
         card=dict(kind="objects", items=["filingCabinet", "safe"])),

    dict(id="t159", level=None, template="chartBoard",
         narration=("One hundred and fifty years. He served twelve of them."),
         overlay=None),

    # ---- ENDING — reflection, complicit "we", a direct verified quote, no forward tease ----
    dict(id="t160", level=None, template="boardroom",
         narration=("Here is the part that is easy to forget: nobody forced anyone to hand him their "
                    "money."),
         overlay=None),

    dict(id="t161", level=None, template="crowdQueue",
         narration=("They handed it over because he was boring, and steady, and, above all, trusted."),
         overlay=None),

    dict(id="t161b", level=None, template="domesticInterior",
         narration=("You trust boring. That is exactly what boring is for."),
         overlay=None),

    dict(id="t162", level=None, template="closeUpPortrait",
         narration=("Three times, an entire industry made him its own watchdog."),
         overlay=None),

    dict(id="t163", level=None, template="newsMontage",
         narration=("We built the trust. He just never had to earn it twice."),
         overlay=None),

    # §3a RHYTHM — long, ~9-10s.
    dict(id="t164", level=None, template="domesticInterior", breath=True,
         narration=("We wanted a number that never went down. He gave us one, every year, for almost "
                    "fifty years — right up until the year everyone else's numbers did too."),
         overlay=None),

    # §3a RHYTHM — HOLD, quote callback, ~14s.
    dict(id="t165", level=None, template="courtHearing",
         narration=("At his sentencing, he told the room, 'I am sorry. I know it will not help you.' "
                    "It didn't. But it was, for once, the one sentence in fifty years that turned out "
                    "to be completely true."),
         overlay=None),

    dict(id="t166", level=None, template="chartBoard",
         narration=("Every other number he ever gave an investor could be adjusted."),
         overlay=None),

    dict(id="t167", level=None, template="closeUpPortrait",
         narration=("One hundred and fifty years could not."),
         overlay=None,
         card=dict(kind="word", word="150 Years")),

    # §3a RHYTHM — LAST SHOT, the longest hold, callback to the opening image (t001's cityStreet, the
    # lifeguard's $5,000, and the motif of the number that never moved).
    dict(id="t168", level=None, template="cityStreet", breath=True,
         narration=("It started with a lifeguard's five thousand dollars, and a promise that the number "
                    "would never go down. In the end, the only number that never moved again was the "
                    "one on his own sentence."),
         overlay=None),
]

# Apply the measured narration rate to every scene. `gen_voice_edge.py` reads `sc.get("rate", RATE)`,
# so this is the writer-side field the pipeline already documents (docs/BIBLE.md §8) — nothing in
# gen_voice_edge.py is edited. A scene that wants its own prosody can still set `rate=` explicitly in
# its own dict above; setdefault leaves that alone.
for _s in SCENES:
    _s.setdefault("rate", NARRATION_RATE)
