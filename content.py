#!/usr/bin/env python3
"""How Sam Bankman-Fried Actually Lost Eight Billion Dollars — CRAYON-format explainer, ~15-17 min.

FORMAT: third-person past-tense explainer about a REAL subject (docs/BIBLE.md §1). Every date, figure
and quote is verified in docs/research/ftx.md with a source; anything unverifiable to that standard is
absent here. Register: straight and noirish, held throughout — a villain biography, not a systemic
comedy (Bankman-Fried is a person with a birthplace-equivalent origin: MIT, 2014), closer to the
reference's Wolf of Wall Street register than its Great Depression one.

STRUCTURAL VARIATION vs the last two PRODUCED crayon-format episodes (theranos, madoff): theranos used
the classic five-step thesis hook and closed on an UNANSWERED QUESTION + QUOTE. madoff used the classic
thesis hook and closed on REFLECTION + COMPLICIT "WE" + QUOTE CALLBACK + a FORWARD TEASE. This script
opens on the classic thesis hook too (a person, not a systemic subject, so the question-thesis variant
does not apply), but closes on REFLECTION + COMPLICIT "WE" + a QUOTE CALLBACK, with NO forward tease and
NO unanswered question — the one ending shape neither of the last two produced episodes used. Five
chapters, shaped rise -> mechanism -> reversal -> collapse -> reckoning (the reference's default
villain-biography spine), distinct from madoff's "a whistleblower had to go looking" exposure and
wework's "the firm's own paperwork exposed it" — here a RIVAL'S leak and a competitor's tweet are what
turn the machine on its builder.

MOTIF: two through-lines. THE EPITHET ("the King of Crypto") — planted as a press nickname in Ch1,
paid off in Ch4 when the prosecutor's own indictment announcement uses the same words to describe the
scheme he's charged with running. THE BACKDOOR (a trapdoor built into FTX's own code, letting one
account — Alameda's — sidestep the rule that protects every customer) — planted at the end of Ch1 as a
"private ledger," defined plainly with a casino analogy in Ch2, and paid off in Ch3 when a leaked
balance sheet proves the door was propped open with a coin FTX had printed itself.

CHAPTERS (§1, `Evocative Noun: Plain Explanation`, emitted as card=dict(kind="chapter", ...) and used
verbatim in the description timestamps):
  1 The Golden Boy : A Trader Who Never Seemed to Lose
  2 The Backdoor   : A Trapdoor Built Into the Code
  3 The Leak       : A Balance Sheet Nobody Was Meant to Read
  4 The Fall       : Eight Billion Dollars That Wasn't There
  5 The Verdict    : Twenty-Five Years for the King of Crypto

PROMISE -> PAYOFF LEDGER:
  * Hook promise: backers who studied his firm for months never found the hole -> tested in Ch2 (the
    backdoor taught, plainly, with a casino analogy) -> paid off at the MIDPOINT REVERSAL (Ch3) when a
    leaked balance sheet shows the hole in public for the first time.
  * "The King of Crypto" epithet planted Ch1 (a press nickname) -> paid off Ch4 when U.S. Attorney
    Damian Williams's own indictment line uses the identical words to describe the fraud itself.
  * The J.P. Morgan comparison planted Ch1 (press framing) -> undercut by the ending: the man they
    compared to a banker who saved a panic instead caused one.
  * The Larry David Super Bowl line ("I don't think so. And I'm never wrong about this stuff.") planted
    Ch1 as marketing -> paid off in the closing reflection as dramatic irony.
  * "A private ledger almost no one else was allowed to see" (end of Ch1) -> the backdoor, defined Ch2,
    is that ledger.
  * FTX/Alameda's shared walls, sold to backers as separate (Ch1) -> proven false by the leaked balance
    sheet (Ch3) -> the mechanism the whole indictment turns on (Ch4/5).
  * Gary Wang, Caroline Ellison and Nishad Singh's guilty pleas planted Ch4 -> Ellison's trial testimony
    pays it off directly in Ch5 as the case's central evidence.
  * MIDPOINT REVERSAL (§5, "the moment the subject's own machine turns on them"): a rival exchange's
    leaked document, then a single tweet from a competitor, triggers the bank run that FTX's own hidden
    backdoor could not survive. gap=1.4 immediately before.
  * share-worthy beat #1: a Canadian teachers' pension fund invested ninety-five million dollars and
    wrote the whole position down to zero.
  * share-worthy beat #2: FTX bought nineteen years of naming rights on a Miami arena; the name lasted
    about a year and a half.

factoryFloor is NOT used anywhere in this script — ops/improvements.json
(factoryfloor-machine-shade-fractional-seed-bug, high impact, confirmed on the wework 09-01 build) shows
it HALTs any real render via a shade()-on-fractional-seed crash in src/explainer.tsx's shared `Machine`
component. That fix is out of writer scope, so this episode is written entirely from the other twelve
explainer rooms.

Per BIBLE §6 and ops/improvements.json (no-invented-dialogue-for-post-2015-or-living-subjects): every
named person in this story is alive and several are still under sentence, so no `dialogue=`/`bubbles=`
line is an invented exchange — every one voices or floats a quotation already verbatim in
docs/research/ftx.md, with its speaker and occasion.

Numbers, sentence lengths and WPM are self-checked against docs/BIBLE.md §3 before build; vocabulary is
kept short (Anglo-Saxon over Latinate: "firm" over "company", "users" over "customers", "the government"
or "lawyers" over "prosecutors", "help" over "cooperate", "watchdogs" over "regulators", "backup" over
"collateral", "took the stand"/"said" over "testified", "shut down"/"wiped out" over "liquidated") to
hit the syllables-per-word band the WPM gate requires — checked with scripts/wpm_predict.py before
build.
"""

FPS = 30

NARRATION_RATE = "-5%"   # matches the current channel-wide retune (docs/BIBLE.md §3)

SCENES = [
    # ================= HOOK =================
    dict(id='t001', level=None, overlay=None, template='closeUpPortrait',
         narration='By twenty-nine, he was worth twenty-six billion dollars.'),

    dict(id='t002', level=None, overlay=None, template='chartBoard', chart='down', card={'kind': 'word', 'word': 'Paper.'},
         narration='On paper only.'),

    dict(id='t003', level=None, overlay=None, template='newsMontage',
         narration='Within a week, all of it was gone.'),

    dict(id='t004', level=None, overlay=None, template='crowdQueue', mood='grim',
         narration='Along with eight billion in cash that was never his.'),

    dict(id='t005', level=None, overlay=None, template='bankExterior',
         narration='And the backers who studied his firm for months never once found the hole.'),

    dict(id='t006', level=None, overlay=None, template='officeFloor',
         narration="This is the story of Sam Bankman-Fried, the boy genius who built the world's most trusted crypto exchange, and robbed it blind from the inside."),

    dict(id='t007', level=None, overlay=None, template='cityStreet',
         narration='Cambridge, Massachusetts. 2014.'),

    # ================= CH 1: The Golden Boy =================
    dict(id='t008', level='CH 1', overlay=None, template='boardroom', breath=True,
         card={'kind': 'chapter', 'title': 'The Golden Boy', 'subtitle': 'A Trader Who Never Seemed to Lose', 'hold': 2.4},
         narration='A math prodigy graduated MIT that year, with a degree in physics.'),

    dict(id='t009', level=None, overlay=None, template='officeFloor',
         narration='He took a trading job at Jane Street, in New York, a firm known for speed.'),

    dict(id='t010', level=None, overlay=None, template='chartBoard', chart='up',
         narration='Jane Street traded stocks and bonds by the millisecond, for tiny, near-certain profit.'),

    dict(id='tA01', level=None, overlay=None, template='officeFloor',
         narration='Traders there rarely explained their edge. He was one of the few who tried to.'),

    dict(id='tA02', level=None, overlay=None, template='chartBoard', chart='up', card={'kind': 'objects', 'items': ['coinStack', 'laptop']},
         narration='By the time he left, he understood how thin an edge could be, and still work.'),

    dict(id='t011', level=None, overlay=None, template='domesticInterior',
         narration='Three years in, he quit, and did not look back.'),

    dict(id='t012', level=None, overlay=None, template='cityStreet',
         narration='He moved to Berkeley, and rented a small apartment.'),

    dict(id='t013', level=None, overlay=None, template='officeFloor', card={'kind': 'word', 'word': 'Alameda.'},
         narration='In 2017, out of that apartment, he built a trading firm, and called it Alameda Research.'),

    dict(id='t014', level=None, overlay=None, template='exchangeFloor',
         narration='It bet on tiny price gaps between crypto markets no one else was watching closely.'),

    dict(id='t015', level=None, overlay=None, template='chartBoard', chart='up',
         narration='The bets paid off, fast, and kept paying off.'),

    dict(id='tA03', level=None, overlay=None, template='exchangeFloor',
         narration='It made real cash trading the tiny price gap between crypto exchanges.'),

    dict(id='tA04', level=None, overlay=None, template='boardroom', foreground={'kind': 'overShoulder', 'side': 'right'},
         narration='It was slow, boring, and it worked.'),

    dict(id='t016', level=None, overlay=None, template='officeFloor',
         narration='Two years later, he built something bigger: his own exchange.'),

    dict(id='t017', level=None, overlay=None, template='newsMontage',
         narration='He called it FTX, and it grew fast.'),

    dict(id='t018', level=None, overlay=None, template='bankExterior',
         narration='Headquarters first in Hong Kong, later the Bahamas.'),

    dict(id='t019', level=None, overlay=None, template='closeUpPortrait',
         narration='An MIT classmate, Gary Wang, joined him as co-founder.'),

    dict(id='t020', level=None, overlay=None, template='officeFloor',
         narration="Wang had left Google to write FTX's own code."),

    dict(id='t021', level=None, overlay=None, template='domesticInterior',
         narration='A former Jane Street trader, Caroline Ellison, took over running Alameda.'),

    dict(id='t022', level=None, overlay=None, template='officeFloor',
         narration="A young engineer, Nishad Singh, joined too, to build the exchange's own guts."),

    dict(id='t023', level=None, overlay=None, template='exchangeFloor', breath=True,
         narration="All in their twenties, they told backers FTX was different — a clean exchange, kept safely walled off from Alameda, the trading firm sitting on the other side of those very same walls."),

    dict(id='t024', level=None, overlay=None, template='chartBoard', chart='up',
         narration='Money believed them, and so did the press.'),

    dict(id='tA05', level=None, overlay=None, template='officeFloor',
         narration="You don't build a thirty-two billion dollar firm by being wrong about money."),

    dict(id='tA06', level=None, overlay=None, template='exchangeFloor',
         narration='You build it by being right, over and over, in public.'),

    dict(id='t025', level=None, overlay=None, template='boardroom',
         narration='January 2022. A four hundred million dollar round valued FTX at thirty-two billion.'),

    dict(id='t026', level=None, overlay=None, template='newsMontage',
         narration='Sequoia. SoftBank. Temasek. Some of the biggest names in finance signed on.'),

    dict(id='t027', level=None, template='closeUpPortrait', overlay=dict(big='$26B', sub='ESTIMATED PEAK NET WORTH'),
         narration='Forbes put his own worth at as much as twenty-six billion.'),

    dict(id='t028', level=None, overlay=None, template='newsMontage',
         narration='Forbes ranked him the wealthiest person under thirty in the country.'),

    dict(id='t029', level=None, overlay=None, template='exchangeFloor',
         narration='The crypto world had a new golden boy, and everyone bought in.'),

    dict(id='tA07', level=None, overlay=None, template='boardroom', panels={'variant': 'v2', 'cells': [{'template': 'officeFloor'}, {'template': 'exchangeFloor'}]},
         narration='Two firms, one founder, one shared set of walls.'),

    dict(id='t030', level=None, overlay=None, template='bankExterior',
         narration='FTX ran two exchanges under one name — a big global one, and a smaller one, built for U.S. users.'),

    dict(id='tG01', level=None, overlay=None, template='officeFloor', card={'kind': 'word', 'word': 'Two.'},
         narration='Two exchanges. One name.'),

    dict(id='t031', level=None, overlay=None, template='newsMontage',
         narration='Few outside the firm asked how cleanly the two were actually kept apart.'),

    dict(id='t032', level=None, overlay=None, template='broadcastDesk', mood='bright',
         narration='Then came the Super Bowl.'),

    dict(id='t033', level=None, overlay=None, template='closeUpPortrait', mood='bright',
         bubbles=[{'kind': 'float', 'text': '"I don\'t think so. And I\'m never wrong about this stuff."'}],
         narration='February 2022. Comedian Larry David starred in an FTX commercial, dismissing the wheel, the toilet, and coffee — then FTX itself, in one line.'),

    dict(id='t034', level=None, overlay=None, template='newsMontage',
         narration='The line would not age well, not even close.'),

    dict(id='t035', level=None, overlay=None, template='crowdQueue', mood='bright',
         narration='Tom Brady. Gisele Bündchen. Steph Curry. All signed on as the faces of the brand.'),

    dict(id='t036', level=None, overlay=None, template='chartBoard', chart='up',
         narration='New users signed up by the millions.'),

    dict(id='t037', level=None, template='exchangeFloor', overlay=dict(big='$10B', sub='PEAK DAILY TRADING VOLUME'),
         narration='Daily trading topped ten billion at its peak.'),

    dict(id='t038', level=None, overlay=None, template='officeFloor',
         narration='Money moved so fast almost no one stopped to ask one simple question.'),

    dict(id='t039', level=None, overlay=None, template='broadcastDesk',
         narration='Where, exactly, did FTX end, and Alameda begin?'),

    dict(id='t040', level=None, overlay=None, template='boardroom',
         narration='In the 2022 election alone, he gave nearly forty million to campaigns.'),

    dict(id='t041', level=None, overlay=None, template='newsMontage',
         narration='Second only to George Soros, among that cycle’s Democratic donors.'),

    dict(id='t042', level=None, overlay=None, template='courtHearing',
         narration='FTX insiders quietly funded the other side too, through groups no one traced back to them.'),

    dict(id='t043', level=None, overlay=None, template='broadcastDesk',
         narration='Senators took meetings with him. Watchdogs praised his ideas.'),

    dict(id='t044', level=None, overlay=None, template='newsMontage',
         narration='Reporters started calling him the King of Crypto.'),

    dict(id='t045', level=None, overlay=None, template='boardroom',
         narration='Some compared him to J.P. Morgan — the banker who once personally bailed out a panic.'),

    dict(id='t046', level=None, overlay=None, template='closeUpPortrait',
         narration='The comparison flattered him. It was not close to true.'),

    dict(id='tA08', level=None, overlay=None, template='newsMontage',
         narration='J.P. Morgan had used his own money, once, to stop a panic.'),

    dict(id='tA09', level=None, overlay=None, template='closeUpPortrait',
         narration='This one, it would turn out, was spending someone else’s.'),

    dict(id='tA10', level=None, overlay=None, template='boardroom',
         narration='No one reading the headlines yet knew the difference.'),

    dict(id='t047', level=None, overlay=None, template='officeFloor',
         card={'kind': 'narration', 'text': 'Behind the image\nsat a private ledger.'},
         narration='Behind the image sat a private ledger almost no one else was allowed to see.'),

    dict(id='t048', level=None, overlay=None, template='exchangeFloor',
         narration='It explained how the money really moved.'),

    # ================= CH 2: The Backdoor =================
    dict(id='t049', level='CH 2', overlay=None, template='officeFloor', breath=True,
         card={'kind': 'chapter', 'title': 'The Backdoor', 'subtitle': 'A Trapdoor Built Into the Code', 'hold': 2.4},
         narration='Every exchange makes the same promise: your money sits in your own account, waiting.'),

    dict(id='t050', level=None, overlay=None, template='exchangeFloor',
         narration='Trade badly enough, and the exchange sells your assets, to cover the loss.'),

    dict(id='t051', level=None, overlay=None, template='chartBoard', chart='flat',
         narration="That rule is what keeps one trader's collapse from becoming everyone's problem."),

    dict(id='t052', level=None, overlay=None, template='officeFloor',
         narration="FTX had exactly one account the rule didn't apply to."),

    dict(id='t053', level=None, overlay=None, template='exchangeFloor', card={'kind': 'word', 'word': "Alameda's."},
         narration="Alameda's."),

    dict(id='tB01', level=None, overlay=None, template='bankExterior',
         narration='It is the one rule that makes an exchange safe to use at all.'),

    dict(id='tB02', level=None, overlay=None, template='officeFloor',
         narration='You trust it without ever reading it.'),

    dict(id='t054', level=None, overlay=None, template='boardroom',
         narration='At his direction, Gary Wang built a quiet exception into the code itself.'),

    dict(id='t055', level=None, overlay=None, template='chartBoard', chart='down',
         narration='It could run a negative balance no other account was ever allowed to carry.'),

    dict(id='t056', level=None, template='exchangeFloor', overlay=dict(big='$65B', sub="ALAMEDA'S HIDDEN CREDIT LINE"),
         narration='Roughly sixty-five billion of hidden credit, on paper.'),

    dict(id='t057', level=None, overlay=None, template='officeFloor', breath=True,
         narration="Picture a casino where each player's chips get counted at the end of the night — except one player, whose losses simply vanish from the count, because the house itself owns his table."),

    dict(id='t058', level=None, overlay=None, template='chartBoard', chart='down',
         narration='Through that door, user deposits moved straight into it.'),

    dict(id='t059', level=None, overlay=None, template='domesticInterior',
         narration='Money users believed sat untouched, in their own accounts.'),

    dict(id='t060', level=None, template='exchangeFloor', overlay=dict(big='$10B', sub='MOVED FROM FTX TO ALAMEDA'),
         narration='About ten billion crossed over, in total.'),

    dict(id='tB03', level=None, overlay=None, template='domesticInterior', card={'kind': 'objects', 'items': ['safe', 'filingCabinet']},
         narration='The safe everyone thought was locked had a second door, in the back.'),

    dict(id='t061', level=None, overlay=None, template='officeFloor',
         narration="It covered the firm's own trading losses, month after month."),

    dict(id='t062', level=None, overlay=None, template='domesticInterior', foreground={'kind': 'overShoulder', 'side': 'left'},
         narration='Bahamas real estate alone ran past thirty million — a penthouse, paid for with cash that was never his to spend.'),

    dict(id='t063', level=None, overlay=None, template='boardroom',
         narration='It funded venture bets across the whole crypto world.'),

    dict(id='t064', level=None, overlay=None, template='newsMontage',
         narration='It paid the campaign bills too.'),

    dict(id='t065', level=None, overlay=None, template='chartBoard', chart='flat',
         narration='None of it showed up as a loan on any public filing.'),

    dict(id='t066', level=None, overlay=None, template='exchangeFloor',
         narration='The whole structure needed one more prop, to look solid.'),

    dict(id='t067', level=None, overlay=None, template='chartBoard', chart='up',
         narration="FTX's own token, called FTT."),

    dict(id='tB04', level=None, overlay=None, template='exchangeFloor', chart='flat',
         narration='On paper, the books still balanced.'),

    dict(id='t068', level=None, overlay=None, template='officeFloor',
         narration='FTX had simply created it, and could create more, at will.'),

    dict(id='t069', level=None, overlay=None, template='exchangeFloor',
         narration="Its balance sheet was papered thick with it."),

    dict(id='t070', level=None, overlay=None, template='chartBoard', chart='flat',
         narration='Backup, in other words, that FTX had printed.'),

    dict(id='t071', level=None, overlay=None, template='boardroom',
         narration='A number standing in for money, backing a debt owed in real money.'),

    dict(id='t072', level=None, overlay=None, template='closeUpPortrait',
         narration='As long as no one looked closely, the number held its shape.'),

    dict(id='t073', level=None, overlay=None, template='newsMontage',
         narration='For most of 2021 and 2022, no one did.'),

    dict(id='tB05', level=None, overlay=None, template='exchangeFloor',
         narration='You cannot audit a number a firm is free to invent.'),

    dict(id='t074', level=None, overlay=None, template='crowdQueue', mood='bright',
         narration='Users kept depositing, right up to the end.'),

    dict(id='t075', level=None, overlay=None, template='chartBoard', chart='up',
         narration='The exchange kept growing.'),

    dict(id='t076', level=None, overlay=None, template='exchangeFloor',
         narration='About twenty-five million a day moved through Alameda’s earliest trades alone.'),

    dict(id='tG02', level=None, overlay=None, template='chartBoard', card={'kind': 'word', 'word': 'One.'},
         narration='One door. One key.'),

    dict(id='t077', level=None, overlay=None, template='boardroom',
         narration='Four people held the door, and the key.'),

    dict(id='t078', level=None, overlay=None, template='domesticInterior', card={'kind': 'word', 'word': 'Four.'},
         narration='Bankman-Fried. Wang. Ellison. Singh.'),

    dict(id='tB06', level=None, overlay=None, template='chartBoard', chart='up',
         narration='By 2022, that one trading firm was worth billions, on its own.'),

    dict(id='t079', level=None, overlay=None, template='closeUpPortrait',
         narration='Almost no one else at the firm knew the account even existed.'),

    dict(id='t080', level=None, overlay=None, template='courtHearing',
         narration='It stayed that way for years.'),

    dict(id='t081', level=None, overlay=None, template='newsMontage',
         narration='Then someone found a document no one was ever meant to publish.'),

    # ================= CH 3: The Leak =================
    dict(id='tB07', level=None, overlay=None, template='courtHearing', foreground={'kind': 'overShoulder', 'side': 'right'},
         narration="Auditors signed off on FTX's books without ever being shown that account."),

    dict(id='tB08', level=None, overlay=None, template='closeUpPortrait', card={'kind': 'word', 'word': 'Almost.'},
         narration='Almost no one outside the four of them ever saw it.'),

    dict(id='t082', level='CH 3', overlay=None, template='newsMontage', breath=True,
         card={'kind': 'chapter', 'title': 'The Leak', 'subtitle': 'A Balance Sheet Nobody Was Meant to Read', 'hold': 2.4},
         narration="November 2nd, 2022. A crypto news site, CoinDesk, published Alameda's own balance sheet."),

    dict(id='t083', level=None, overlay=None, template='chartBoard', chart='down',
         narration='Fourteen point six billion dollars in listed assets.'),

    dict(id='t084', level=None, template='exchangeFloor', overlay=dict(big='$3.66B', sub="SAT IN FTX'S OWN TOKEN"),
         narration="Three point six six billion of it sat in FTT — the token FTX had printed."),

    dict(id='t085', level=None, overlay=None, template='closeUpPortrait',
         narration="Its core holdings were largely a coin its own sister firm had made up."),

    dict(id='t086', level=None, overlay=None, template='newsMontage',
         narration='Reporters read it as what it was. Nothing more.'),

    dict(id='t087', level=None, overlay=None, template='boardroom', card={'kind': 'word', 'word': 'Air.'},
         narration='A fortune built on a number with nothing solid underneath it.'),

    dict(id='t088', level=None, overlay=None, template='broadcastDesk',
         narration='The story reached one reader within days.'),

    dict(id='t089', level=None, overlay=None, template='exchangeFloor',
         narration="Changpeng Zhao — CZ — ran FTX's biggest rival, Binance."),

    dict(id='tC01', level=None, overlay=None, template='boardroom',
         narration="The leak proved those shared walls were thinner than anyone had been told."),

    dict(id='t090', level=None, overlay=None, template='officeFloor',
         narration="Binance still held its own stash of FTT, from an earlier buyout."),

    dict(id='t091', level=None, overlay=None, template='closeUpPortrait', gap=1.4,
         narration='On November 6th, CZ posted a single tweet.'),

    dict(id='tC02', level=None, overlay=None, template='exchangeFloor',
         narration='For months, CZ had said nothing about any of it, in public.'),

    dict(id='t092', level=None, overlay=None, template='broadcastDesk', mood='grim', breath=True,
         dialogue=dict(text='Due to recent revelations.'),
         bubbles=[{'kind': 'float', 'text': '"...due to recent revelations..."'}],
         narration='Binance would sell off each FTT token it held, "due to recent revelations," he wrote — three words that told the whole market Alameda’s books might be built on air.'),

    dict(id='tG03', level=None, overlay=None, template='newsMontage',
         narration='Three words. One panic.'),

    dict(id='t093', level=None, overlay=None, template='crowdQueue', mood='grim', placards=['MY MONEY', 'WHERE IS IT', 'GIVE IT BACK'],
         narration="Users didn't wait to find out if he was right."),

    dict(id='t094', level=None, overlay=None, template='newsMontage',
         narration='They started pulling their money out, all at once.'),

    dict(id='t095', level=None, template='chartBoard', chart='down', overlay=dict(big='$6B', sub='WITHDRAWN IN 72 HOURS'),
         narration='Six billion in withdrawal requests hit FTX in three days.'),

    dict(id='tC03', level=None, overlay=None, template='crowdQueue', mood='grim',
         narration='Lines formed that had no physical line to stand in — just a login screen, refreshing.'),

    dict(id='t096', level=None, overlay=None, template='exchangeFloor', card={'kind': 'word', 'word': 'Frozen.'},
         narration='November 8th. FTX froze all withdrawals.'),

    dict(id='t097', level=None, overlay=None, template='boardroom',
         narration='That same day, Binance signed a letter to buy the whole exchange.'),

    dict(id='t098', level=None, overlay=None, template='officeFloor',
         narration='A rescue, on paper. Not in the vault.'),

    dict(id='t099', level=None, overlay=None, template='closeUpPortrait',
         narration="Binance's own accountants got one look inside FTX's real books."),

    dict(id='t100', level=None, overlay=None, template='courtHearing',
         narration='By November 9th, they walked away, for good.'),

    dict(id='t101', level=None, overlay=None, template='newsMontage',
         narration='No deal. No rescue. No buyer left standing.'),

    dict(id='t102', level=None, overlay=None, template='chartBoard', chart='down',
         narration='Crypto prices across the board fell with it.'),

    dict(id='tC04', level=None, overlay=None, template='closeUpPortrait', mood='grim',
         narration='The firm that called itself safer than the rest of crypto had no one left to save it.'),

    dict(id='tC05', level=None, overlay=None, template='chartBoard', chart='down',
         narration='Firms that had lent money to Alameda started asking for it back, all at once.'),

    dict(id='t103', level=None, overlay=None, template='domesticInterior',
         narration='A Canadian teachers’ pension fund had put in ninety-five million.'),

    dict(id='t104', level=None, overlay=None, template='closeUpPortrait', mood='grim',
         narration='It would write the whole position down to zero.'),

    dict(id='tC06', level=None, overlay=None, template='domesticInterior',
         narration='It was one of dozens of institutions that had trusted the same balance sheet.'),

    dict(id='tC07', level=None, overlay=None, template='newsMontage',
         narration='So did thousands of ordinary depositors, in far smaller amounts, all at once.'),

    dict(id='t105', level=None, overlay=None, template='crowdQueue', mood='grim',
         narration='Now everyone was asking the same question.'),

    dict(id='t106', level=None, overlay=None, template='bankExterior',
         narration='Where had eight billion of other people’s cash actually gone?'),

    # ================= CH 4: The Fall =================
    dict(id='tC08', level=None, overlay=None, template='crowdQueue',
         narration='No one outside four people had ever really known.'),

    dict(id='t107', level='CH 4', overlay=None, template='bankExterior', breath=True,
         card={'kind': 'chapter', 'title': 'The Fall', 'subtitle': "Eight Billion Dollars That Wasn't There", 'hold': 2.4},
         narration="November 10th. Bahamian watchdogs froze FTX's local arm."),

    dict(id='t108', level=None, overlay=None, template='closeUpPortrait',
         narration='Bankman-Fried announced Alameda was winding down, in public.'),

    dict(id='tD01', level=None, overlay=None, template='newsMontage',
         narration='By then, six billion had already left the exchange.'),

    dict(id='t109', level=None, overlay=None, template='domesticInterior', mood='grim',
         dialogue=dict(text="I'm sorry. That's the biggest thing."),
         bubbles=[{'kind': 'float', 'text': '"I\'m sorry. That\'s the biggest thing."'}],
         narration='He posted it in a thread of twenty-two tweets.'),

    dict(id='t110', level=None, overlay=None, template='newsMontage',
         narration='It did not undo six billion in withdrawals.'),

    dict(id='tD02', level=None, overlay=None, template='chartBoard',
         narration='You cannot apologize eight billion back into existence.'),

    dict(id='tG04', level=None, overlay=None, template='closeUpPortrait',
         narration='Twenty-two tweets. One sorry note.'),

    dict(id='t111', level=None, overlay=None, template='courtHearing', panels={'variant': 'v2', 'cells': [{'template': 'courtHearing'}, {'template': 'bankExterior'}]},
         narration='November 11th. FTX, Alameda, and roughly a hundred thirty linked firms filed for bankruptcy, in Delaware.'),

    dict(id='t112', level=None, overlay=None, template='boardroom',
         narration='Bankman-Fried resigned as chief executive that same day.'),

    dict(id='t113', level=None, overlay=None, template='closeUpPortrait',
         narration='The new one had done this before.'),

    dict(id='tD03', level=None, overlay=None, template='officeFloor', card={'kind': 'objects', 'items': ['filingCabinet', 'briefcase']},
         narration="A specialist, by then, in cleaning up other people's disasters."),

    dict(id='t114', level=None, overlay=None, template='courtHearing',
         narration='John J. Ray the Third had wound down Enron, after its own collapse two decades earlier.'),

    dict(id='t115', level=None, overlay=None, template='broadcastDesk', mood='grim',
         bubbles=[{'kind': 'float', 'text': '"...such a complete failure of corporate controls..."'}],
         narration='Forty years in the job, he wrote in a court filing. He had never seen worse.'),

    dict(id='t116', level=None, template='newsMontage', overlay=dict(big='1 MILLION+', sub='CREDITORS LISTED AT FILING'),
         narration='The bankruptcy papers listed more than a million creditors, in total.'),

    dict(id='t117', level=None, overlay=None, template='cityStreet', card={'kind': 'word', 'word': 'Silence.'},
         narration='A month passed.'),

    dict(id='t118', level=None, overlay=None, template='exchangeFloor',
         narration='Then a knock.'),

    dict(id='t119', level=None, overlay=None, template='bankExterior', breath=True,
         narration='December 12th. He was arrested in Nassau, the Bahamas — the night before he was due to testify to Congress.'),

    dict(id='t120', level=None, overlay=None, template='courtHearing',
         narration='The next day, the government unsealed an eight-count indictment.'),

    dict(id='tD04', level=None, overlay=None, template='newsMontage',
         narration='Wire fraud. Securities fraud. Conspiracy, count after count.'),

    dict(id='t121', level=None, overlay=None, template='broadcastDesk', mood='grim',
         bubbles=[{'kind': 'float', 'text': '"...one of the biggest financial frauds in American history."'}],
         narration='U.S. Attorney Damian Williams called it one of the biggest fraud cases in American history.'),

    dict(id='t122', level=None, overlay=None, template='newsMontage',
         narration='A scheme built, he said, to make one man the King of Crypto.'),

    dict(id='t123', level=None, overlay=None, template='closeUpPortrait',
         narration='The nickname the press had given him. Read back, in a courtroom.'),

    dict(id='tD05', level=None, overlay=None, template='newsMontage',
         narration='The word "king" had stopped sounding like a compliment.'),

    dict(id='t124', level=None, overlay=None, template='courtHearing',
         narration='That December, Gary Wang pleaded guilty, first of all of them.'),

    dict(id='t125', level=None, overlay=None, template='closeUpPortrait',
         narration='So did Caroline Ellison, soon after.'),

    dict(id='t126', level=None, overlay=None, template='boardroom',
         narration="Both agreed to help the government's case."),

    dict(id='tD06', level=None, overlay=None, template='newsMontage',
         narration='Three insiders, three plea deals, in the space of one month.'),

    dict(id='t127', level=None, overlay=None, template='courtHearing',
         narration='Nishad Singh pleaded guilty soon after, and agreed to help too.'),

    dict(id='t128', level=None, overlay=None, template='closeUpPortrait', mood='grim',
         narration="Singh later said that learning the size of the hole made him feel physically sick — “blindsided,” in his own word."),

    dict(id='tD07', level=None, overlay=None, template='boardroom',
         narration="None of them had built the backdoor alone."),

    dict(id='t129', level=None, overlay=None, template='domesticInterior',
         narration='Four founders.'),

    dict(id='t130', level=None, overlay=None, template='courtHearing', card={'kind': 'word', 'word': 'Three.'},
         narration='Three of them were now working for the other side.'),

    dict(id='tD08', level=None, overlay=None, template='closeUpPortrait',
         narration='The government had its witnesses.'),

    dict(id='t131', level=None, overlay=None, template='newsMontage',
         narration='One name was left to face a jury alone.'),

    # ================= CH 5: The Verdict =================
    dict(id='t132', level='CH 5', overlay=None, template='courtHearing', breath=True,
         card={'kind': 'chapter', 'title': 'The Verdict', 'subtitle': 'Twenty-Five Years for the King of Crypto', 'hold': 2.4},
         narration='October 3rd, 2023. His trial opened in a federal court in Manhattan.'),

    dict(id='t133', level=None, overlay=None, template='closeUpPortrait',
         narration='Judge Lewis Kaplan presided, in a packed room.'),

    dict(id='tE01', level=None, overlay=None, template='courtHearing',
         panels={'variant': 'v2', 'cells': [{'template': 'courtHearing'}, {'template': 'newsMontage'}]},
         narration='The trial ran a full month, start to finish.'),

    dict(id='t134', level=None, overlay=None, template='closeUpPortrait',
         narration='Caroline Ellison took the stand against him.'),

    dict(id='t135', level=None, overlay=None, template='courtHearing', breath=True,
         narration="She said he told her to use user money — to cover the firm's losses, fund investments, buy property, and pay the campaign bills."),

    dict(id='t136', level=None, overlay=None, template='closeUpPortrait',
         dialogue=dict(text="Didn't have to lie anymore."),
         bubbles=[{'kind': 'float', 'text': '"...didn\'t have to lie anymore."'}],
         narration='She said the collapse itself came almost as relief — she didn’t have to lie anymore.'),

    dict(id='t137', level=None, overlay=None, template='newsMontage',
         narration='November 2nd, 2023. The jury needed less than five hours.'),

    dict(id='tE02', level=None, overlay=None, template='closeUpPortrait', mood='grim',
         narration="Less time than the trial's opening statement had taken."),

    dict(id='t138', level=None, overlay=None, template='courtHearing', mood='grim', card={'kind': 'word', 'word': 'Guilty.'},
         narration='Guilty. On all seven counts.'),

    dict(id='t139', level=None, overlay=None, template='chartBoard', chart='flat',
         narration='Wire fraud, twice over. Conspiracy, four separate ways. Money laundering.'),

    dict(id='tE03', level=None, overlay=None, template='newsMontage', chart='flat',
         narration='Seven counts. Seven convictions. Not one acquittal.'),

    dict(id='t140', level=None, overlay=None, template='closeUpPortrait',
         narration='March 28th, 2024. Sentencing day.'),

    dict(id='t141', level=None, template='courtHearing', mood='grim', overlay=dict(big='25 YEARS', sub='FEDERAL PRISON'),
         narration='Judge Kaplan handed down twenty-five years in federal prison.'),

    dict(id='t142', level=None, template='chartBoard', chart='down', overlay=dict(big='$11B', sub='ORDERED PAID BACK'),
         narration='Plus eleven billion, ordered paid back.'),

    dict(id='t143', level=None, overlay=None, template='newsMontage',
         narration='Eight billion of it tied to the users he had defrauded directly.'),

    dict(id='t144', level=None, overlay=None, template='boardroom',
         narration='One billion, seven hundred million more, to backers misled by the pitch.'),

    dict(id='t145', level=None, overlay=None, template='exchangeFloor',
         narration="One billion, three hundred million on top of that, owed to Alameda's own lenders."),

    dict(id='tE04', level=None, overlay=None, template='chartBoard',
         narration='Eleven billion, on a scheme that once called itself worth thirty-two.'),

    dict(id='t146', level=None, overlay=None, template='closeUpPortrait',
         narration='September 24th, 2024. Caroline Ellison was sentenced too.'),

    dict(id='t147', level=None, template='courtHearing', overlay=dict(big='2 YEARS', sub='CREDITED FOR HELPING THE CASE'),
         narration='Two years, not twenty-five — credited for what the judge called “very, very substantial” help.'),

    dict(id='t148', level=None, overlay=None, template='crowdQueue',
         narration='FTX had once bought naming rights to Miami’s basketball arena.'),

    dict(id='t149', level=None, overlay=None, template='bankExterior',
         narration='Nineteen years, a hundred thirty-five million dollars.'),

    dict(id='t150', level=None, overlay=None, template='cityStreet', card={'kind': 'word', 'word': 'Eighteen.'},
         narration='The name lasted about eighteen months.'),

    dict(id='t151', level=None, overlay=None, template='courtHearing',
         narration='Lawyers tore it down within weeks of the bankruptcy filing.'),

    dict(id='tE05', level=None, overlay=None, template='newsMontage',
         narration='By January 2023, a bankruptcy judge ended the deal for good.'),

    dict(id='tE06', level=None, overlay=None, template='chartBoard', chart='down',
         narration='Thirty-two billion, once. Then nothing.'),

    dict(id='t152', level=None, overlay=None, template='domesticInterior',
         narration='Users who’d trusted FTX with their cash waited more than two years to see any of it again.'),

    # ================= ENDING =================
    dict(id='t153', level=None, overlay=None, template='boardroom', breath=True,
         narration='Every backer who wired money into FTX had months to look at its books first.'),

    dict(id='t154', level=None, overlay=None, template='newsMontage',
         narration='Sequoia. SoftBank. A Canadian teachers’ pension. All of them missed the same hole.'),

    dict(id='tF01', level=None, overlay=None, template='chartBoard', chart='down',
         narration="Money that thorough, that experienced, missed a coin its own target had printed."),

    dict(id='t155', level=None, overlay=None, template='crowdQueue',
         narration='We didn’t just miss it either. Not even close.'),

    dict(id='t156', level=None, overlay=None, template='closeUpPortrait', breath=True,
         narration='We watched the ad. We cheered the donations. We called him the next J.P. Morgan, ourselves.'),

    dict(id='tF02', level=None, overlay=None, template='newsMontage', breath=True,
         narration="You don't need a genius to build a fraud that big. You need an audience willing to believe one."),

    dict(id='t157', level=None, overlay=None, template='broadcastDesk',
         bubbles=[{'kind': 'float', 'text': '"And I\'m never wrong about this stuff."'}],
         narration='"And I\'m never wrong about this stuff," the ad had said.'),

    dict(id='tG05', level=None, overlay=None, template='chartBoard', chart='down',
         narration='Twenty-six billion. Then nothing.'),

    dict(id='t158', level=None, overlay=None, template='closeUpPortrait', breath=True,
         narration='For once, someone finally was.'),
]
