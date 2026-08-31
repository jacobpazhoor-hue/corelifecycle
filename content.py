#!/usr/bin/env python3
"""How Sam Bankman-Fried Actually Lost $8 Billion — CRAYON-format explainer, ~15-17 min.

FORMAT: third-person past-tense explainer about a REAL subject (docs/BIBLE.md §1). Every date, figure
and quote is verified in docs/research/ftx.md with a source; anything unverifiable to that standard is
in that file's CUT list and is absent here. Register: straight and noirish, held throughout (§2) — a
million real depositors lost real money and two of Bankman-Fried's own colleagues went to prison, so a
comic register would read as callous, same reasoning as lehman_brothers, theranos and madoff.

STRUCTURAL VARIATION vs the last two PRODUCED crayon-format episodes (theranos 08-16, madoff 08-30):
  * theranos opened on the classic five-step THESIS hook and closed on an UNANSWERED QUESTION + QUOTE,
    four chapters. madoff also opened on the classic thesis hook (a person-subject requires it, never
    the question-thesis reserved for systemic subjects with no birthplace — BIBLE §4) but closed on
    REFLECTION + COMPLICIT "WE" + QUOTE CALLBACK + a FORWARD TEASE, five chapters shaped rise ->
    mechanism -> exposure attempt -> reversal -> reckoning. This script opens on the classic thesis
    hook too (person-subject), but closes on REFLECTION + COMPLICIT "WE" + a direct QUOTE, with NO
    forward tease — the shape neither of the last two produced episodes used. Five chapters shaped
    rise -> mechanism -> reversal -> collapse -> reckoning, distinct from madoff's "exposure attempt"
    beat (this subject was never confronted before the collapse; a leaked balance sheet did the
    confronting for everyone, all at once).
  * MOTIF: theranos ran "one drop of blood"; madoff ran "ten percent, every year" + "the floor below".
    This one runs TWO interlocking through-lines: THE CROWN ("the King of Crypto" — planted in Ch1 as
    a press epithet he never had to earn, defined as a joke in the reflection, then WEAPONIZED in Ch4
    when the prosecutor uses the exact phrase to open the indictment) and THE BACKDOOR (one line of
    code giving Alameda a blank check — planted as a tease at the end of Ch1, defined mechanically in
    Ch2 with a poker-table analogy, and paid off as the exact hole exposed by the Ch3 balance-sheet
    leak).
  * CALLBACK OBJECT: the Larry David Super Bowl ad ("And I'm never wrong about this stuff") — planted
    in Ch1 as a joke, read back in the closing reflection as the line that aged worse than any joke in
    the whole story.

CHAPTERS (§1, `Evocative Noun: Plain Explanation`, emitted as card=dict(kind="chapter", ...) and used
verbatim in the description timestamps):
  1 The Boy King : Built an Empire From One Apartment
  2 The Backdoor : How Alameda Got a Blank Check
  3 The Leak     : One Balance Sheet Brings It Down
  4 The Fall     : Bankruptcy, Handcuffs, and an Indictment
  5 The Verdict  : A Trial, a Conviction, Two Sentences

PROMISE -> PAYOFF LEDGER:
  * Hook promise: "he says he never meant to steal a cent" -> tested against the mechanism in Ch2
    (a backdoor built on purpose) -> read back in the closing reflection as the story everyone,
    including him, needed to believe.
  * "The King of Crypto" epithet planted Ch1 (press framing, sourced) -> paid off Ch4 when U.S.
    Attorney Damian Williams uses the identical phrase to open the federal indictment -> paid off
    again in the closing reflection as the thing "we" handed him before anyone charged him with it.
  * The backdoor / blank check planted end of Ch1 ("somebody had to hide that it didn't work") ->
    Ch2's entire subject, taught with a poker-table analogy -> paid off as the exact hole the Ch3
    balance-sheet leak exposes.
  * FTX-as-neutral-exchange planted Ch1 ("a casino isn't supposed to be a player") -> paid off Ch2
    ("FTX was supposed to be neutral ground. It was not.").
  * Ontario Teachers' Pension Plan ($95M) planted Ch1 (a name on the investor list) -> paid off Ch3
    implicitly (every dollar in Alameda's collateral, including that money, traced back to FTT).
  * The Miami arena naming deal planted Ch1 ($135M, 19 years) -> paid off with its own short epilogue
    inside Ch1 (the deal outlives the money by about a year and a half, then a judge ends it too).
  * The Super Bowl ad / Larry David planted Ch1 (verbatim quote) -> paid off in the closing reflection
    as the joke that aged worst of anything in the whole story.
  * Gary Wang, Caroline Ellison and Nishad Singh planted Ch1 (the founding team) -> paid off Ch4
    (all three plead guilty and cooperate) -> paid off again Ch5 (Ellison's and Singh's testimony,
    then Ellison's own sentence).
  * MIDPOINT REVERSAL (§5, "the moment the subject's own machine turns on them"): Binance's CEO reads
    the leaked balance sheet and announces he is dumping FTX's own token — the coin FTX itself
    printed turns out to be the thing that kills it. gap=1.4 on the scene immediately before that line.
  * share-worthy beat #1: the exchange's own most trusted collateral was a currency it had invented
    for itself, with nothing behind it but the exchange's own good name.
  * share-worthy beat #2: two of his three co-founders had to testify against him to avoid prison
    themselves, and the third pleaded guilty anyway.

Numbers, sentence lengths and WPM are self-checked against docs/BIBLE.md §3 before build; see the
tail of this file for the narration-rate stamp. Vocabulary is deliberately short (Anglo-Saxon over
Latinate: "help" not "cooperate", "shut down" not "liquidated", "watchdog" not "regulatory agency",
"lawyers"/"the government" not "prosecutors", "bets" not "investments") to hit the syllables-per-word
band the WPM gate requires (docs/BIBLE.md §3a "THE WPM RULE IS A RULE ABOUT WORD LENGTH") — checked
with scripts/wpm_predict.py before build.
"""

FPS = 30

NARRATION_RATE = "-5%"   # matches the current channel-wide retune (docs/BIBLE.md §3), unchanged here

SCENES = [
    # ================= HOOK =================
    dict(id='t001', level=None, template='closeUpPortrait', narration='At thirty years old, Sam Bankman-Fried was worth twenty-six billion dollars.', overlay=None),

    dict(id='t002', level=None, template='chartBoard', chart='down', narration='A year later, he was worth nothing.', overlay=None),

    dict(id='t003', level=None, template='crowdQueue', narration='A million people lost money right alongside him.', overlay=None),

    dict(id='t004', level=None, template='newsMontage', narration='Eight billion dollars. Just... gone.', overlay=None, card={'kind': 'word', 'word': 'Gone.'}),

    dict(id='t005', level=None, template='closeUpPortrait', narration='And the strangest part? He still says he never meant to steal it.', overlay=None),

    dict(id='t006', level=None, template='officeFloor', narration='This is the story of Sam Bankman-Fried, the physicist who called himself the future of money.', overlay=None),

    dict(id='t007', level=None, template='domesticInterior', narration="And spent other people's cash trying to prove it.", overlay=None),

    # ================= CH 1 =================
    dict(id='t008', level='CH 1', template='cityStreet', breath=True, narration='Cambridge, Massachusetts. 2014.', overlay=None, card={'kind': 'chapter', 'title': 'The Boy King', 'subtitle': 'Built an Empire From One Apartment', 'hold': 2.4}),

    dict(id='t009', level=None, template='officeFloor', narration='He graduated MIT with a degree in physics, and Jane Street, a quant trading firm, hired him — and hired him to trade sharp.', overlay=None),

    dict(id='t011', level=None, template='cityStreet', narration='Three years in, he walked away.', overlay=None),

    dict(id='t012', level=None, template='domesticInterior', narration='In 2017, he founded Alameda Research — out of an apartment in Berkeley.', overlay=None),

    dict(id='t013', level=None, template='exchangeFloor', narration='A crypto trading firm, small and hungry.', overlay=None),

    dict(id='t014', level=None, template='chartBoard', chart='up', narration='Early on, it was trading twenty-five million dollars a day.', overlay=None),

    dict(id='t015', level=None, template='newsMontage', narration='Other traders called it the fastest-growing firm they had ever seen.', overlay=None),

    dict(id='t016', level=None, template='officeFloor', narration='An exchange is just a matchmaker: it connects buyers and sellers, and takes a small cut.', overlay=None),

    dict(id='t017', level=None, template='exchangeFloor', narration="It is not supposed to bet with its own customers' money. That is the one rule.", overlay=None),

    dict(id='t018', level=None, template='officeFloor', panels={'variant': 'v2', 'cells': [{'template': 'domesticInterior'}, {'template': 'officeFloor'}]}, narration='Two years later, he built something bigger still.', overlay=None),

    dict(id='t018b', level=None, template='bankExterior', narration='A separate arm, FTX.US, was built to look safer for U.S. customers.', overlay=None),

    dict(id='t019', level=None, template='exchangeFloor', narration='In 2019, FTX opened its doors — a cryptocurrency exchange of its own.', overlay=None),

    dict(id='t020', level=None, template='boardroom', cast=2, narration='His co-founder, Gary Wang, was an MIT classmate — and a former Google engineer.', overlay=None),

    dict(id='t021', level=None, template='closeUpPortrait', cast=1, narration='Caroline Ellison, another Jane Street alum, came in to run Alameda for him.', overlay=None),

    dict(id='t022', level=None, template='officeFloor', narration="Nishad Singh signed on to run FTX's engineering.", overlay=None),

    dict(id='t023', level=None, template='cityStreet', narration='First Hong Kong. Later, the Bahamas.', overlay=None),

    dict(id='t023b', level=None, template='broadcastDesk', narration='Lighter rules, and he moved his whole business there.', overlay=None),

    dict(id='t024', level=None, template='chartBoard', chart='up', narration='At its peak, ten billion dollars moved through the exchange in a single day.', overlay=None),

    dict(id='t024b', level=None, template='courtHearing', narration='Watchdogs, in most places, were still years behind an industry moving this fast.', overlay=None),

    dict(id='t024c', level=None, template='boardroom', narration='Nobody stopped to ask why.', overlay=None),

    dict(id='t025', level=None, template='exchangeFloor', narration='Nearly every crypto trader kept an account there.', overlay=None),

    dict(id='t026', level=None, template='newsMontage', narration="FTX also printed its own currency to go with it: a token called FTT.", overlay=None),

    dict(id='t027', level=None, template='closeUpPortrait', foreground={'kind': 'overShoulder', 'side': 'right'}, narration='A neutral exchange, in theory. A casino is not supposed to be a player.', overlay=None),

    dict(id='t028', level=None, template='crowdQueue', mood='bright', narration='New users signed up by the millions.', overlay=None),

    dict(id='t029', level=None, template='domesticInterior', narration='People got the app from their living rooms, and signed up in minutes.', overlay=None),

    dict(id='t030', level=None, template='boardroom', narration='Money poured in from the biggest names in venture capital.', overlay=None),

    dict(id='t031', level=None, template='chartBoard', breath=True, narration="By January 2022, a single funding round valued FTX at thirty-two billion dollars — four hundred million dollars from backers like Sequoia Capital, SoftBank, and Temasek, all betting on a three-year-old firm built by a young physics grad.", overlay=None),

    dict(id='t032', level=None, template='bankExterior', narration='Banks and payment firms started treating FTX like any other blue-chip name.', overlay=None),

    dict(id='t033', level=None, template='chartBoard', chart='up', narration='To them, it looked like the safest bet in crypto.', overlay=None),

    dict(id='t034', level=None, template='bankExterior', narration='He was twenty-nine years old.', overlay=None),

    dict(id='t035', level=None, template='exchangeFloor', foreground={'kind': 'overShoulder', 'side': 'left'}, narration='His own wealth was put as high as twenty-six billion dollars.', overlay=None),

    dict(id='t036', level=None, template='newsMontage', narration='Business profiles compared him to J.P. Morgan, the banker who once bailed out Wall Street himself.', overlay=None),

    dict(id='t037', level=None, template='broadcastDesk', narration='Financial networks put him on air, again and again, to explain crypto to the country.', overlay=None),

    dict(id='t038', level=None, template='newsMontage', narration='February 13th, 2022.', overlay=None),

    dict(id='t039', level=None, template='broadcastDesk', bubbles=[{'kind': 'float', 'text': '"I don\'t think so. And I\'m never wrong about this stuff."'}], narration='FTX bought a Super Bowl ad. It dismissed the wheel, the toilet, coffee — and then FTX. Forty million people watched him say it.', overlay=None),

    dict(id='t041', level=None, template='domesticInterior', narration='Off screen, the marketing kept going.', overlay=None),

    dict(id='t042', level=None, template='broadcastDesk', narration='Tom Brady and Gisele Bündchen signed on as the faces of FTX. So did Steph Curry. None of them ran the firm — they just sold it.', overlay=None),

    dict(id='t045', level=None, template='newsMontage', narration="Forbes put him on its 2021 list of the world's richest people — the wealthiest, by its own count, under thirty.", overlay=None),

    dict(id='t046', level=None, template='boardroom', narration="The press called it disruption. Investors called it a bargain.", overlay=None),

    dict(id='t047', level=None, template='chartBoard', narration="In 2021, FTX signed a nineteen-year naming deal with Miami's arena — one hundred thirty-five million dollars, for a building.", overlay=None),

    dict(id='t049', level=None, template='cityStreet', narration='Fans called it FTX Arena, for a while.', overlay=None),

    dict(id='t050', level=None, template='courtHearing', narration='After the bankruptcy, Miami-Dade moved to end the deal right away.', overlay=None),

    dict(id='t051', level=None, template='bankExterior', narration='By January 2023, a judge formally tore up the contract.', overlay=None),

    dict(id='t052', level=None, template='chartBoard', narration="A stadium's name is supposed to outlast a company. This one did not.", overlay=None),

    dict(id='t053', level=None, template='boardroom', narration='In the 2022 election, he gave nearly forty million dollars to campaigns.', overlay=None),

    dict(id='t054', level=None, template='domesticInterior', narration='Second only to George Soros, on the Democratic side.', overlay=None),

    dict(id='t055', level=None, template='boardroom', narration='His colleagues quietly funded the other side too.', overlay=None),

    dict(id='t056', level=None, template='chartBoard', chart='up', narration="Ontario's own teachers' pension fund put in ninety-five million dollars.", overlay=None),

    dict(id='t057', level=None, template='domesticInterior', narration='Retirement money, betting on a firm three years old.', overlay=None),

    dict(id='t058', level=None, template='crowdQueue', mood='bright', narration='Sign-ups kept climbing, even as the backdoor sat there, unnoticed.', overlay=None),

    dict(id='t059', level=None, template='officeFloor', card={'kind': 'objects', 'items': ['laptop', 'coinStack', 'cashStack']}, narration='On paper, it looked like the future of finance.', overlay=None),

    dict(id='t060', level=None, template='exchangeFloor', narration="But a crypto exchange doesn't print money by magic.", overlay=None),

    dict(id='t061', level=None, template='closeUpPortrait', narration='You trust an exchange the same way you trust a bank: by never checking what is actually in the vault.', overlay=None),

    dict(id='t062', level=None, template='officeFloor', narration='Somewhere, the math had to work. Or somebody had to hide that it did not.', overlay=None),

    dict(id='t063', level=None, template='boardroom', panels={'variant': 'v2', 'cells': [{'template': 'exchangeFloor'}, {'template': 'boardroom'}]}, narration='Two companies. One founder. Soon, one bank account.', overlay=None),

    # ================= CH 2 =================
    dict(id='t064', level='CH 2', template='officeFloor', narration='The answer started with one line of code.', overlay=None, card={'kind': 'chapter', 'title': 'The Backdoor', 'subtitle': 'How Alameda Got a Blank Check', 'hold': 2.4}),

    dict(id='t064b', level=None, template='exchangeFloor', narration='One line. That was all it took.', overlay=None),

    dict(id='t065', level=None, template='closeUpPortrait', breath=True, narration="The backdoor was buried in FTX's own software, and Bankman-Fried told Gary Wang to write it. It let Alameda spend money no other user account on the exchange was ever allowed to touch.", overlay=None),

    dict(id='t066', level=None, template='chartBoard', narration='No margin call. No forced exit. No limit anyone outside the company could see.', overlay=None),

    dict(id='t067', level=None, template='exchangeFloor', narration='In effect, a sixty-five billion dollar line of credit.', overlay=None),

    dict(id='t068', level=None, template='closeUpPortrait', narration='Picture a poker table where one player never runs out of chips, and the house never asks why.', overlay=None),

    dict(id='t069', level=None, template='boardroom', narration='That player was Alameda. The house was FTX. Same owner, both seats.', overlay=None),

    dict(id='t070', level=None, template='exchangeFloor', narration='Other traders on the exchange played by different rules.', overlay=None),

    dict(id='t071', level=None, template='domesticInterior', narration='Users thought their money sat untouched, in their own accounts.', overlay=None),

    dict(id='t071b', level=None, template='crowdQueue', narration="None of FTX's million-plus users could see any of this.", overlay=None),

    dict(id='t071c', level=None, template='bankExterior', narration='To them, FTX just felt like any other banking app.', overlay=None),

    dict(id='t072', level=None, template='officeFloor', narration='It did not.', overlay=None, card={'kind': 'word', 'word': "It didn't."}),

    dict(id='t073', level=None, template='exchangeFloor', narration='Roughly ten billion dollars of it moved to Alameda instead.', overlay=None),

    dict(id='t074', level=None, template='chartBoard', chart='down', narration="Used to cover Alameda's losses.", overlay=None),

    dict(id='t075', level=None, template='boardroom', narration='Used to fund venture bets.', overlay=None),

    dict(id='t076', level=None, template='bankExterior', narration='Used to buy real estate in the Bahamas.', overlay=None),

    dict(id='t077', level=None, template='boardroom', narration='Used for the political donations, too.', overlay=None),

    dict(id='t078', level=None, template='chartBoard', narration='Four different uses. One pile of user money.', overlay=None),

    dict(id='t079', level=None, template='closeUpPortrait', narration="And underneath the whole structure sat FTX's own token: FTT.", overlay=None),

    dict(id='t080', level=None, template='exchangeFloor', narration='A coin FTX had simply printed for itself.', overlay=None),

    dict(id='t081', level=None, template='boardroom', narration="Alameda's own balance sheet was stuffed with it.", overlay=None),

    dict(id='t082', level=None, template='chartBoard', narration='Collateral that was, in the end, just a number FTX had made up.', overlay=None),

    dict(id='t083', level=None, template='exchangeFloor', narration='FTT was not rare. It was not backed by anything but confidence.', overlay=None),

    dict(id='t084', level=None, template='chartBoard', card={'kind': 'narration', 'text': 'Confidence\nis not collateral.'}, narration='Confidence, it turns out, is not collateral.', overlay=None),

    dict(id='t085', level=None, template='domesticInterior', foreground={'kind': 'overShoulder', 'side': 'right'}, narration='In the Bahamas, he lived in a thirty-million-dollar penthouse.', overlay=None),

    dict(id='t086', level=None, template='cityStreet', narration='At the Albany resort, with the rest of the inner circle.', overlay=None),

    dict(id='t087', level=None, template='closeUpPortrait', narration='FTX was supposed to be neutral ground.', overlay=None),

    dict(id='t088', level=None, template='exchangeFloor', narration='It was not.', overlay=None),

    dict(id='t089', level=None, template='officeFloor', breath=True, narration="The same backdoor that moved user money also hid it — from investors, from auditors, and from FTX's own senior staff.", overlay=None),

    dict(id='t089b', level=None, template='closeUpPortrait', narration='No outside auditor ever caught it.', overlay=None),

    dict(id='t090', level=None, template='domesticInterior', narration='You clicked one button. You trusted the rest to code you never saw.', overlay=None),

    dict(id='t091', level=None, template='bankExterior', narration='The money did not vanish all at once. It leaked out, deal by deal.', overlay=None),

    dict(id='t092', level=None, template='newsMontage', narration='One reporter would eventually find it.', overlay=None),

    # ================= CH 3 =================
    dict(id='t093', level='CH 3', template='chartBoard', narration='On November 2nd, 2022, CoinDesk published a story.', overlay=None, card={'kind': 'chapter', 'title': 'The Leak', 'subtitle': 'One Balance Sheet Brings It Down', 'hold': 2.4}),

    dict(id='t094', level=None, template='newsMontage', narration="CoinDesk was a small crypto news site. Nobody expected it to end an empire — with a leaked look at Alameda's own balance sheet.", overlay=None),

    dict(id='t096', level=None, template='chartBoard', chart='down', narration='Fourteen point six billion dollars in assets.', overlay=None),

    dict(id='t097', level=None, template='boardroom', narration="Most of it FTT — the coin FTX had printed for itself.", overlay=None),

    dict(id='t098', level=None, template='chartBoard', chart='down', narration='Three point six six billion dollars of it, completely unlocked.', overlay=None),

    dict(id='t099', level=None, template='closeUpPortrait', card={'kind': 'narration', 'text': "A receipt\nfor its own IOU."}, narration="In other words: Alameda's fortune was mostly a receipt for its own IOU.", overlay=None),

    dict(id='t100', level=None, template='chartBoard', narration='The math in the story was simple enough for anyone to check.', overlay=None),

    dict(id='t101', level=None, template='newsMontage', narration='One reader, in particular, took notice.', overlay=None),

    dict(id='t102', level=None, template='closeUpPortrait', gap=1.4, narration="Binance's CEO, Changpeng Zhao — known as CZ — read it that morning.", overlay=None),

    dict(id='t103', level=None, template='broadcastDesk', breath=True, mood='grim', narration='On November 6th, CZ announced Binance would dump every FTT token it held, citing what he called "recent revelations" — a warning that FTX\'s own coin, the collateral behind its biggest trading firm, was worthless.', overlay=None),

    dict(id='t104', level=None, template='crowdQueue', mood='grim', placards=['GIVE IT BACK', 'WHERE IS IT'], narration='People panicked, and rushed to pull their money out.', overlay=None),

    dict(id='t105', level=None, template='chartBoard', chart='down', narration='Six billion dollars, in withdrawal requests. In seventy-two hours.', overlay=None),

    dict(id='t106', level=None, template='officeFloor', mood='grim', narration='November 8th. FTX froze user withdrawals.', overlay=None),

    dict(id='t106b', level=None, template='crowdQueue', mood='grim', narration='Fast. Then faster. Then gone.', overlay=None),

    dict(id='t107', level=None, template='boardroom', narration='Binance signed a letter of intent to buy the whole firm.', overlay=None),

    dict(id='t108', level=None, template='newsMontage', mood='grim', narration='One day later, Binance walked away.', overlay=None),

    dict(id='t109', level=None, template='officeFloor', narration="They had looked at the real books.", overlay=None),

    dict(id='t109b', level=None, template='bankExterior', mood='grim', narration='Every outside bank still working with FTX started asking questions.', overlay=None),

    dict(id='t110', level=None, template='newsMontage', mood='grim', narration="November 10th. The Bahamas froze what was left of FTX's local assets.", overlay=None),

    dict(id='t111', level=None, template='closeUpPortrait', mood='grim', narration='Alameda Research was done. He said so himself.', overlay=None),

    dict(id='t112', level=None, template='domesticInterior', mood='grim', breath=True, bubbles=[{'kind': 'float', 'text': '"I\'m sorry. That\'s the biggest thing. I f---ed up, and should have done better."', 'at': 0}, {'kind': 'float', 'text': '"...at a very high level, I f---ed up twice."', 'at': 3.2}], narration='He posted a public apology. Twenty-two tweets long.', overlay=None),

    dict(id='t113', level=None, template='crowdQueue', mood='grim', placards=['PAY US', 'ANSWERS NOW'], narration='Outside, the line to get money out only grew longer.', overlay=None),

    dict(id='t114', level=None, template='newsMontage', mood='grim', narration='The story was everywhere within a day.', overlay=None),

    dict(id='t114b', level=None, template='domesticInterior', mood='grim', narration='Anchors who had once praised him now used words like collapse, and fraud.', overlay=None),

    dict(id='t114c', level=None, template='cityStreet', mood='grim', narration='News crews set up outside the Bahamas office.', overlay=None),

    dict(id='t115', level=None, template='officeFloor', mood='grim', narration='Inside FTX, employees learned the firm was dying from the same headlines everyone else read.', overlay=None),

    dict(id='t116', level=None, template='newsMontage', mood='grim', narration='An exchange valued at thirty-two billion dollars was worth nothing. It took nine days.', overlay=None),

    dict(id='t117', level=None, template='closeUpPortrait', narration="The firm he had built from an apartment had five days left.", overlay=None),

    # ================= CH 4 =================
    dict(id='t118', level='CH 4', template='boardroom', narration='November 11th, 2022.', overlay=None, card={'kind': 'chapter', 'title': 'The Fall', 'subtitle': 'Bankruptcy, Handcuffs, and an Indictment', 'hold': 2.4}),

    dict(id='t119', level=None, template='courtHearing', narration='FTX filed for Chapter 11 bankruptcy in Delaware. Alameda went down with it, and so did roughly a hundred thirty other firms.', overlay=None),

    dict(id='t121', level=None, template='chartBoard', narration='More than a million creditors, in the filing.', overlay=None),

    dict(id='t122', level=None, template='boardroom', mood='grim', narration='He resigned as CEO that same day.', overlay=None),

    dict(id='t123', level=None, template='newsMontage', foreground={'kind': 'overShoulder', 'side': 'right'}, narration='The new CEO had done this kind of cleanup before.', overlay=None),

    dict(id='t124', level=None, template='boardroom', narration='John J. Ray the Third once ran the Enron liquidation.', overlay=None),

    dict(id='t125', level=None, template='chartBoard', narration='Now he was running this one.', overlay=None),

    dict(id='t126', level=None, template='closeUpPortrait', breath=True, card={'kind': 'narration', 'text': '"A complete failure\nof corporate controls."'}, narration="In a bankruptcy filing, Ray wrote that in forty years he had never seen such a complete failure of corporate controls, or such an absence of trustworthy financial information.", overlay=None),

    dict(id='t127', level=None, template='boardroom', narration='Forty years in the business. Nothing like this.', overlay=None),

    dict(id='t128', level=None, template='cityStreet', narration='December 12th, 2022. Nassau, the Bahamas.', overlay=None),

    dict(id='t129', level=None, template='closeUpPortrait', mood='grim', foreground={'kind': 'overShoulder', 'side': 'left'}, narration='He was arrested that evening.', overlay=None),

    dict(id='t129b', level=None, template='newsMontage', mood='grim', narration='No more headlines. Just handcuffs.', overlay=None),

    dict(id='t130', level=None, template='cityStreet', narration="Nassau's airport was the last place he was a free man.", overlay=None),

    dict(id='t130b', level=None, template='bankExterior', mood='grim', narration='Every account tied to him was frozen, one by one.', overlay=None),

    dict(id='t130c', level=None, template='broadcastDesk', mood='grim', narration='Cable news ran the arrest story on a loop for days.', overlay=None),

    dict(id='t131', level=None, template='courtHearing', mood='grim', narration='The night before he was set to testify before Congress.', overlay=None),

    dict(id='t132', level=None, template='newsMontage', narration='The next day, the government charged him with eight counts, and U.S. Attorney Damian Williams stood up and named it.', overlay=None),

    dict(id='t134', level=None, template='closeUpPortrait', mood='grim', breath=True, bubbles=[{'kind': 'float', 'text': '"...one of the biggest financial frauds in American history — a multibillion-dollar scheme designed to make him the King of Crypto."'}], narration='One of the biggest frauds in American history, he called it.', overlay=None),

    dict(id='t135', level=None, template='newsMontage', narration='Designed, in his own words, to make him the King of Crypto.', overlay=None),

    dict(id='t136', level=None, template='courtHearing', cast=2, narration='Gary Wang pleaded guilty that same December.', overlay=None),

    dict(id='t137', level=None, template='closeUpPortrait', cast=1, narration='So did Caroline Ellison.', overlay=None),

    dict(id='t138', level=None, template='courtHearing', narration="Both agreed to help the government's case.", overlay=None),

    dict(id='t139', level=None, template='closeUpPortrait', cast=2, narration='Nishad Singh pleaded guilty not long after. He cooperated too.', overlay=None),

    dict(id='t140', level=None, template='boardroom', mood='grim', narration='Three of the four founders, now working with the government against the fourth.', overlay=None),

    dict(id='t140b', level=None, template='officeFloor', mood='grim', narration="FTX's old headquarters sat empty within weeks.", overlay=None),

    dict(id='t140c', level=None, template='crowdQueue', mood='grim', narration='Former employees waited, just as unsure as everyone else.', overlay=None),

    dict(id='t141', level=None, template='newsMontage', narration='Front pages ran his photo next to the same three words: biggest fraud ever.', overlay=None),

    dict(id='t142', level=None, template='cityStreet', narration='Eventually, he was brought to New York to face the charges.', overlay=None),

    dict(id='t143', level=None, template='newsMontage', narration='Only one of them would stand trial.', overlay=None),

    # ================= CH 5 =================
    dict(id='t144', level='CH 5', template='courtHearing', narration='October 3rd, 2023. A courtroom in Manhattan.', overlay=None, card={'kind': 'chapter', 'title': 'The Verdict', 'subtitle': 'A Trial, a Conviction, Two Sentences', 'hold': 2.4}),

    dict(id='t145', level=None, template='closeUpPortrait', narration='Judge Lewis Kaplan presiding.', overlay=None),

    dict(id='t145b', level=None, template='newsMontage', narration='The trial ran for about a month.', overlay=None),

    dict(id='t146', level=None, template='courtHearing', cast=1, breath=True, narration="Caroline Ellison told the jury that he had told her to use customer funds to cover Alameda's losses, fund venture bets, buy Bahamas real estate, and pay for the donations that made him famous.", overlay=None),

    dict(id='t147', level=None, template='closeUpPortrait', cast=1, bubbles=[{'kind': 'float', 'text': '"...didn\'t have to lie anymore."'}], narration='She said she felt relief when the firm finally collapsed.', overlay=None),

    dict(id='t148', level=None, template='newsMontage', cast=2, narration='Nishad Singh testified too.', overlay=None),

    dict(id='t149', level=None, template='courtHearing', narration='He said the scale of it made him physically sick.', overlay=None),

    dict(id='t150', level=None, template='closeUpPortrait', cast=2, bubbles=[{'kind': 'float', 'text': '"blindsided"'}], narration='He used one word for how it felt: blindsided.', overlay=None),

    dict(id='t151', level=None, template='courtHearing', mood='grim', narration='November 2nd, 2023. The jury came back.', overlay=None),

    dict(id='t152', level=None, template='closeUpPortrait', mood='grim', narration='Guilty. On all seven counts.', overlay=None, card={'kind': 'word', 'word': 'Guilty.'}),

    dict(id='t152b', level=None, template='boardroom', mood='grim', narration='Guilty was the easy part.', overlay=None),

    dict(id='t153', level=None, template='chartBoard', narration='Two counts of wire fraud. Two counts of conspiracy to commit wire fraud.', overlay=None),

    dict(id='t154', level=None, template='courtHearing', narration='One count of conspiracy to commit securities fraud. One count of conspiracy to commit commodities fraud. And one count of conspiracy to commit money laundering.', overlay=None),

    dict(id='t156b', level=None, template='chartBoard', narration='Two years earlier, he had been worth twenty-six billion dollars. Now he was going to prison.', overlay=None),

    dict(id='t157', level=None, template='closeUpPortrait', mood='grim', narration='March 28th, 2024. Sentencing day.', overlay=None),

    dict(id='t158', level=None, template='courtHearing', mood='grim', breath=True, narration='Judge Kaplan handed down twenty-five years.', overlay=None),

    dict(id='t158b', level=None, template='crowdQueue', mood='grim', narration='News of the sentence ran on every big outlet the next morning.', overlay=None),

    dict(id='t159', level=None, template='chartBoard', chart='down', narration='Eleven billion dollars, ordered paid back.', overlay=None),

    dict(id='t159b', level=None, template='officeFloor', narration='On paper, still owed. In real life, long spent.', overlay=None),

    dict(id='t160', level=None, template='exchangeFloor', mood='grim', narration="Eight billion of it tied to the users he had defrauded.", overlay=None),

    dict(id='t161', level=None, template='chartBoard', chart='down', narration='One point seven two billion, raised from backers on false pretenses.', overlay=None),

    dict(id='t162', level=None, template='closeUpPortrait', narration="One point three billion owed to Alameda's own lenders.", overlay=None),

    dict(id='t163', level=None, template='courtHearing', cast=1, foreground={'kind': 'overShoulder', 'side': 'left'}, narration='Six months later, Caroline Ellison was sentenced too.', overlay=None),

    dict(id='t164', level=None, template='closeUpPortrait', cast=1, narration="Two years. Credit given for helping the government's case.", overlay=None),

    dict(id='t165', level=None, template='crowdQueue', mood='grim', narration="Users' accounts stayed frozen through the whole bankruptcy.", overlay=None),

    dict(id='t166', level=None, template='chartBoard', chart='up', narration='The first real payouts did not start until 2024.', overlay=None),

    dict(id='t167', level=None, template='domesticInterior', narration='Frozen the whole time, for money that was supposed to be untouchable.', overlay=None),

    # ================= ENDING =================
    dict(id='t168', level=None, template='closeUpPortrait', breath=True, narration="Maybe the strangest part is not the backdoor, or the missing billions.", overlay=None),

    dict(id='t169', level=None, template='newsMontage', card={'kind': 'narration', 'text': 'How badly\nwe wanted it true.'}, narration="It's how badly we wanted the story to be true.", overlay=None),

    dict(id='t170', level=None, template='boardroom', narration='We put him on magazine covers. We called him the King of Crypto before anyone charged him with being one.', overlay=None),

    dict(id='t171', level=None, template='broadcastDesk', bubbles=[{'kind': 'float', 'text': '"...I\'m never wrong about this stuff."'}], narration='Forty million of us watched that ad, and laughed along.', overlay=None),

    dict(id='t172', level=None, template='closeUpPortrait', mood='grim', narration='He was not wrong to dismiss the wheel. He was wrong about this.', overlay=None),

    dict(id='t173', level=None, template='domesticInterior', narration='The apartment in Berkeley is still just an apartment.', overlay=None),

    dict(id='t174', level=None, template='crowdQueue', mood='grim', narration='The queue that started as a bank run ended up inside a bankruptcy filing cabinet.', overlay=None),

    dict(id='t175', level=None, template='boardroom', panels={'variant': 'v2', 'cells': [{'template': 'boardroom'}, {'template': 'courtHearing'}]}, narration='Thirty-two billion dollars, once. Now, exactly nothing.', overlay=None),

    dict(id='t176', level=None, template='domesticInterior', narration='You do not need a robber if the vault just hands you the combination.', overlay=None),

    dict(id='t176b', level=None, template='closeUpPortrait', narration='Maybe that is the only mechanism this story ever needed.', overlay=None),

    dict(id='t177', level=None, template='courtHearing', mood='grim', breath=True, narration='Caroline Ellison put it more simply than anyone in a courtroom ever did.', overlay=None),

    dict(id='t178', level=None, template='closeUpPortrait', mood='grim', breath=True, bubbles=[{'kind': 'float', 'text': '"...didn\'t have to lie anymore."'}], narration="When it all finally came down, she said, she felt relief — because, for the first time in years, she did not have to lie anymore. It might be the one honest thing anyone in this whole story said under oath.", overlay=None),
]
