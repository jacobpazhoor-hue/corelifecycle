#!/usr/bin/env python3
"""The Madoff Ponzi Scheme Explained Like You're 5 — CRAYON-format explainer, ~16-18 min.

FORMAT: third-person past-tense explainer about a REAL subject (docs/BIBLE.md §1). Every date, figure
and quote is verified in docs/research/madoff.md with a source; anything unverifiable to that standard
is in that file's CUT list and is absent here. Register: straight and noirish, held throughout (§2) —
real retirees and real charities lost real money, so a comic register would read as callous, same
reasoning as lehman_brothers, theranos and ftx.

STRUCTURAL VARIATION vs the last two PRODUCED crayon-format episodes (lehman_brothers 08-15,
theranos 08-16 — ftx and an earlier madoff attempt both sat on disk unpublished between those and this
run and are not counted as produced):
  * lehman opened DEATH-FIRST and closed on REFLECTION + COMPLICIT "WE" + CALLBACK, no forward tease,
    five chapters. theranos opened on the classic five-step THESIS hook and closed on an UNANSWERED
    QUESTION + QUOTE, four chapters. This script also opens on the classic five-step THESIS hook (a
    person-subject requires the thesis variant, never the question-thesis reserved for systemic
    subjects with no birthplace — BIBLE §4 says so explicitly), but closes on REFLECTION + COMPLICIT
    "WE" + a direct QUOTE CALLBACK + a FORWARD TEASE — the one ending shape neither prior produced
    episode used in full — and runs FIVE chapters shaped as a clean rise -> mechanism -> exposure
    attempt -> reversal -> reckoning, distinct from theranos's four-part shape.
  * MOTIF: theranos ran "one drop of blood"; lehman ran "the thing nobody could pay for, sold on".
    This one runs TWO interlocking through-lines: THE PROMISE ("ten percent, every year, like
    clockwork" — planted in the hook, defined mechanically in Ch2, proven mathematically impossible in
    Ch3, read back in the closing reflection as the fantasy every investor secretly wants) and
    THE FLOOR BELOW (the walled-off 17th-floor unit — planted Ch1, is the whole subject of Ch2, and
    is read back as a share-worthy irony in Ch3: a former NASDAQ chairman running history's largest
    fraud one floor under his own legitimate firm).
  * CALLBACK OBJECT: the Elie Wiesel Foundation's endowment, planted in Ch1 as one of the trusting
    names on his client list, paid off in Ch5 as one of the accounts that lost every dollar.

CHAPTERS (§1, `Evocative Noun: Plain Explanation`, emitted as card=dict(kind="chapter", ...) and used
verbatim in the description timestamps):
  1 The Prophet      : Wall Street's Trusted Face
  2 The Split Floor  : How the Lie Worked
  3 The Whistleblower: Nine Years, No Answer
  4 The Confession   : Five Days in December
  5 The Reckoning    : 150 Years, No Trial

PROMISE -> PAYOFF LEDGER:
  * Hook promise: "ten percent, every year, like clockwork" -> mechanism PAID in Ch2 (split-strike
    conversion, no real trades, DiPascali's fabricated statements) -> proven impossible in Ch3
    (Markopolos's math) -> read back in the closing reflection as the fantasy every investor wants.
  * "One floor below" planted Ch1 (the 17th-floor unit) -> paid off as Ch2's entire subject -> a
    second payoff as Ch3's share-worthy irony (NASDAQ's own former chairman, one floor under himself).
  * Elie Wiesel Foundation planted Ch1 (a name on the client list) -> paid off Ch5 (lost its entire
    endowment, $15.2M).
  * Fairfield Greenwich / feeder-fund motif planted Ch1 ($7.2B funneled in for fees) -> paid off Ch4
    as one of the funds gutted in the run.
  * Markopolos's report title, "The World's Largest Hedge Fund Is a Fraud," planted Ch3 -> paid off
    Ch4 when the 2008 run proves him right nine years after he wrote it.
  * The sons, Mark and Andrew, planted Ch1 (they work in the real, legitimate business one floor up)
    -> paid off Ch4 (they are the ones who turn him in) -> paid off again, darker, Ch5 (Mark's death).
  * Peter Madoff, the brother and compliance officer, planted Ch1 -> paid off Ch5 (his own guilty
    plea and sentence).
  * MIDPOINT REVERSAL (§5, "the moment the subject's own machine turns on them"): the 2008 financial
    crisis triggers a wave of redemption requests Madoff cannot cover — his own scheme's fuel supply
    turns on him. gap=1.4 on the scene immediately before that line.
  * share-worthy beat #1: a former chairman of NASDAQ ran history's largest fraud one floor under his
    own real firm.
  * share-worthy beat #2: the fictitious value on client statements was $64.8B; the real cash that
    ever existed and vanished was about $17.5B — two very different "size of the fraud" numbers.
  * share-worthy beat #3: Mark Madoff died by his own hand exactly two years, to the day, after his
    father's arrest.

Numbers, sentence lengths and WPM are self-checked against docs/BIBLE.md §3 before build; see the
tail of this file for the narration-rate stamp. Vocabulary is deliberately short (Anglo-Saxon over
Latinate: "help" not "cooperation", "shut down" not "liquidated", "watchdog" not "regulatory agency",
"lawyers" not "prosecutors") to hit the syllables-per-word band the WPM gate requires (docs/BIBLE.md
§3a "THE WPM RULE IS A RULE ABOUT WORD LENGTH") — checked with scripts/wpm_predict.py before build.
"""

FPS = 30

NARRATION_RATE = "-5%"   # matches the current channel-wide retune (docs/BIBLE.md §3), unchanged here

SCENES = [
    dict(id='t001', level=None, template='domesticInterior', narration='He told investors their money grew ten percent a year, like clockwork, no matter what the market did.', overlay=None),

    dict(id='t002', level=None, template='crowdQueue', narration='Retirees lost pensions. Charities shut their doors for good.', overlay=None),

    dict(id='t003', level=None, template='officeFloor', narration='One man begged watchdogs to look. Nine years straight.', overlay=None),

    dict(id='t004', level=None, template='boardroom', narration='And every single time, nobody checked.', overlay=None, card={'kind': 'narration', 'text': 'Nobody\nchecked.'}),

    dict(id='t005', level=None, template='newsMontage', narration='This is the story of Bernie Madoff, the most trusted man on Wall Street, who built the largest fraud in its history.', overlay=None),

    dict(id='t006', level=None, template='bankExterior', narration='Sixty-four billion dollars, on paper. Almost none of it real.', overlay=None),

    dict(id='t007', level=None, template='broadcastDesk', narration='Chairman of NASDAQ. Advisor to thousands.', overlay=None),

    dict(id='t008', level=None, template='cityStreet', narration='Then, one December morning, the FBI came knocking.', overlay=None),

    dict(id='t009', level=None, template='closeUpPortrait', narration="You could have been one of his clients. You'd never have known.", overlay=None),

    dict(id='t009b', level=None, template='cityStreet', period='mid20c', narration='April 29th, 1938. Queens, New York.', overlay=None),

    # ================= CH 1 =================
    dict(id='t010', level='CH 1', template='domesticInterior', period='mid20c', breath=True, narration='A baby was born into an ordinary family, in an ordinary borough.', overlay=None, card={'kind': 'chapter', 'title': 'The Prophet', 'subtitle': "Wall Street's Trusted Face", 'hold': 2.4}),

    dict(id='t011', level=None, template='cityStreet', period='mid20c', narration='He earned his first money as a lifeguard, and installing lawn sprinklers.', overlay=None),

    dict(id='t012', level=None, template='chartBoard', chart='up', narration='By 1960, he had saved five thousand dollars.', overlay=None),

    dict(id='t013', level=None, template='officeFloor', period='mid20c', narration='At twenty-two, he used every dollar of it to start his own firm.', overlay=None),

    dict(id='t014', level=None, template='bankExterior', narration='Bernard L. Madoff Investment Securities.', overlay=None),

    dict(id='t015', level=None, template='exchangeFloor', narration='It grew into one of the busiest market makers on Wall Street.', overlay=None),

    dict(id='t016', level=None, template='boardroom', narration='Madoff helped build the technology behind a brand-new stock exchange.', overlay=None),

    dict(id='t017', level=None, template='chartBoard', chart='up', narration='NASDAQ. Still young. Still finding its feet.', overlay=None),

    dict(id='t018', level=None, template='broadcastDesk', narration='He sat on its board. He served as its chairman. Three separate years.', overlay=None, panels={'variant': 'v2', 'cells': [{'template': 'broadcastDesk'}, {'template': 'boardroom'}]}),

    dict(id='t019', level=None, template='cityStreet', narration='To the outside world, he was Wall Street royalty.', overlay=None),

    dict(id='t020', level=None, template='boardroom', mood='bright', narration='Trusted. Steady. Almost dull.', overlay=None),

    dict(id='t021', level=None, template='bankExterior', narration='His firm sat on the nineteenth floor of a Manhattan tower, nicknamed the Lipstick Building.', overlay=None),

    dict(id='t021b', level=None, template='cityStreet', narration='Within a decade, his firm was one of the most active traders on Wall Street.', overlay=None),

    dict(id='t021c', level=None, template='boardroom', narration='Watchdogs liked him. Rivals respected him. Almost nobody said a bad word.', overlay=None),

    dict(id='t021d', level=None, template='domesticInterior', narration='His wife, Ruth, stood beside him through all of it.', overlay=None),

    dict(id='t021e', level=None, template='officeFloor', narration='The two businesses shared a building. They never shared a set of books.', overlay=None),

    dict(id='t021f', level=None, template='cityStreet', narration='Clients rarely asked to see the trading floor for themselves.', overlay=None),

    dict(id='t021g', level=None, template='domesticInterior', narration='Why would they. The checks cleared. The statements arrived right on schedule.', overlay=None),

    dict(id='t021h', level=None, template='chartBoard', chart='flat', narration='Not one bad quarter ever showed up in the paperwork.', overlay=None),

    dict(id='t021i', level=None, template='boardroom', narration='That alone should have been the tell.', overlay=None),

    dict(id='t021j', level=None, template='newsMontage', narration='Instead, it became the whole sales pitch.', overlay=None),

    dict(id='t021k', level=None, template='crowdQueue', narration="People didn't just want to invest with him. They wanted to be seen investing with him.", overlay=None),

    dict(id='t022', level=None, template='officeFloor', narration='His sons, Mark and Andrew, worked there — trading real stocks, in real time.', overlay=None),

    dict(id='t023', level=None, template='domesticInterior', narration='His brother Peter ran compliance. The rules, on paper, looked airtight.', overlay=None),

    dict(id='t024', level=None, template='officeFloor', breath=True, narration='But one floor below, on floor seventeen, something else was happening.', overlay=None),

    dict(id='t025', level=None, template='newsMontage', narration='A separate unit. Walled off.', overlay=None),

    dict(id='t026', level=None, template='officeFloor', narration='No more than twenty-four employees. Its own doors. Its own rules.', overlay=None),

    dict(id='t027', level=None, template='cityStreet', narration='This was the money side — the part almost nobody outside a small circle ever saw.', overlay=None, card={'kind': 'narration', 'text': 'One floor\nbelow.'}),

    dict(id='t028', level=None, template='domesticInterior', narration='Clients here were told something simple.', overlay=None),

    dict(id='t029', level=None, template='chartBoard', chart='up', narration='Give Bernie your money, and it grows ten percent a year.', overlay=None),

    dict(id='t030', level=None, template='boardroom', narration='Not eight one year, fourteen the next.', overlay=None),

    dict(id='t031', level=None, template='chartBoard', chart='up', narration='Ten. Every year. Like clockwork.', overlay=None),

    dict(id='t032', level=None, template='domesticInterior', narration="It didn't matter if the market soared or crashed. The number never moved.", overlay=None),

    dict(id='t033', level=None, template='crowdQueue', narration='New investors begged to get in.', overlay=None),

    dict(id='t034', level=None, template='boardroom', narration='Being turned away only made it more exclusive.', overlay=None, bubbles=[{'text': 'How is it possible, ten percent, every single year?', 'speaker': 'left'}, {'text': "Bernie doesn't miss.", 'speaker': 'right', 'at': 2.2}], foreground={'kind': 'overShoulder', 'side': 'left'}),

    dict(id='t035', level=None, template='cityStreet', narration='Whole funds sprang up just to funnel money his way.', overlay=None),

    dict(id='t036', level=None, template='chartBoard', chart='up', narration='One firm alone, Fairfield Greenwich, sent him seven point two billion dollars.', overlay=None),

    dict(id='t037', level=None, template='cityStreet', narration='And collected hundreds of millions in fees, for doing almost nothing.', overlay=None),

    dict(id='t038', level=None, template='domesticInterior', narration="Even a foundation carrying Elie Wiesel's name trusted him with its entire endowment.", overlay=None),

    dict(id='t039', level=None, template='broadcastDesk', narration='Money magazines put him on their covers. A model of quiet, steady success.', overlay=None, bubbles=[{'text': "What's the secret?", 'speaker': 'left'}, {'text': "Consistency. That's all it is.", 'speaker': 'right', 'at': 2.0}]),

    dict(id='t040', level=None, template='cityStreet', narration='Everyone assumed someone, somewhere, was checking the math.', overlay=None),

    dict(id='t041', level=None, template='closeUpPortrait', mood='grim', breath=True, narration='Nobody was.', overlay=None, card={'kind': 'narration', 'text': 'Nobody\nwas.'}),

    # ================= CH 2 =================
    dict(id='t042', level='CH 2', template='officeFloor', breath=True, narration='Madoff called his strategy split-strike conversion.', overlay=None, card={'kind': 'chapter', 'title': 'The Split Floor', 'subtitle': 'How the Lie Worked', 'hold': 2.4}),

    dict(id='t043', level=None, template='chartBoard', chart='flat', narration='In plain terms: buy a basket of blue-chip stocks.', overlay=None),

    dict(id='t044', level=None, template='exchangeFloor', narration='Then buy options that cap both the gains and the losses.', overlay=None),

    dict(id='t044b', level=None, template='chartBoard', chart='flat', narration='A collar limits how far a stock can rise, and how far it can fall.', overlay=None),

    dict(id='t044c', level=None, template='exchangeFloor', narration='It trades away the big wins, to avoid the big losses.', overlay=None),

    dict(id='t044d', level=None, template='officeFloor', narration="Reasonable. Boring. Exactly the kind of strategy that shouldn't beat the market every single year.", overlay=None),

    dict(id='t044e', level=None, template='chartBoard', chart='up', narration="But Madoff's numbers beat it anyway. Every year. Without fail.", overlay=None),

    dict(id='t044f', level=None, template='officeFloor', narration='Nobody on the seventeenth floor was buying options. Nobody was buying stocks.', overlay=None),

    dict(id='t044g', level=None, template='closeUpPortrait', narration='They were buying time.', overlay=None),

    dict(id='t044h', level=None, template='officeFloor', narration='A handful of people generated years of fake trade confirmations, by hand.', overlay=None),

    dict(id='t044i', level=None, template='newsMontage', narration='Every one of them dated to look exactly like a normal trading day.', overlay=None),

    dict(id='t044j', level=None, template='exchangeFloor', narration='The lie had to hold up every single day the market was open.', overlay=None),

    dict(id='t044k', level=None, template='closeUpPortrait', narration='For decades, it was.', overlay=None),

    dict(id='t045', level=None, template='boardroom', narration="It's a real strategy. Funds still use it today.", overlay=None),

    dict(id='t046', level=None, template='officeFloor', breath=True, narration="There was just one problem. Madoff's version had no trades in it at all.", overlay=None),

    dict(id='t047', level=None, template='boardroom', mood='grim', narration='Not one.', overlay=None),

    dict(id='t048', level=None, template='officeFloor', narration='On the seventeenth floor, statements were typed up by hand.', overlay=None),

    dict(id='t049', level=None, template='chartBoard', chart='up', narration='Backdated. Made to look real.', overlay=None),

    dict(id='t050', level=None, template='bankExterior', narration="The firm's own numbers people built the entire paper trail, page by page.", overlay=None),

    dict(id='t051', level=None, template='officeFloor', narration='Frank DiPascali ran that floor. He was the money man in charge.', overlay=None),

    dict(id='t052', level=None, template='courtHearing', narration='Years later, he pleaded guilty, and admitted it in three words.', overlay=None),

    dict(id='t053', level=None, template='closeUpPortrait', mood='grim', narration='The statements were fake.', overlay=None, card={'kind': 'word', 'word': 'FAKE'}),

    dict(id='t054', level=None, template='newsMontage', narration='The auditor was a three-man shop.', overlay=None),

    dict(id='t055', level=None, template='cityStreet', narration='Working out of a strip mall, in a town most auditors had never heard of.', overlay=None),

    dict(id='t056', level=None, template='officeFloor', narration='David Friehling signed the books, year after year.', overlay=None),

    dict(id='t057', level=None, template='courtHearing', narration='And never once caught anything. Because he never really looked.', overlay=None),

    dict(id='t058', level=None, template='bankExterior', narration='No auditor ever picked up a phone and asked a bank to confirm a balance.', overlay=None),

    dict(id='t059', level=None, template='chartBoard', chart='down', breath=True, narration='Here is the whole machine, in one sentence: new money paid old money, and the books were faked to hide it.', overlay=None),

    dict(id='t060', level=None, template='crowdQueue', narration='Picture a birthday party. You drop five dollars in a jar, and so does everyone else.', overlay=None),

    dict(id='t061', level=None, template='officeFloor', narration='Next month, you take your five dollars back out. Plus a little more.', overlay=None),

    dict(id='t062', level=None, template='domesticInterior', narration='As long as new guests keep showing up, nobody checks the jar.', overlay=None),

    dict(id='t063', level=None, template='closeUpPortrait', mood='grim', narration="That's a Ponzi scheme. That was Bernie Madoff's whole business.", overlay=None),

    dict(id='t064', level=None, template='chartBoard', chart='down', narration='It only works as long as new money arrives faster than old money leaves.', overlay=None),

    dict(id='t065', level=None, template='bankExterior', narration='Stop that flow for even a month, and the whole structure caves in.', overlay=None),

    dict(id='t066', level=None, template='officeFloor', narration='Everyone who touched money at that firm should have wondered.', overlay=None),

    dict(id='t067', level=None, template='boardroom', narration='Almost none of them asked.', overlay=None),

    dict(id='t068', level=None, template='domesticInterior', narration='Investors got quarterly statements, thick with real-looking trades.', overlay=None),

    dict(id='t069', level=None, template='chartBoard', chart='up', narration='Buys and sells that never happened, on stocks that were entirely real.', overlay=None),

    dict(id='t070', level=None, template='officeFloor', narration='Printed on real letterhead. Filed in real drawers.', overlay=None),

    dict(id='t071', level=None, template='cityStreet', narration='For most clients, that paper was the whole relationship.', overlay=None),

    dict(id='t072', level=None, template='newsMontage', breath=True, narration='But mathematically, this was never sustainable. And one man on the outside had already done the math.', overlay=None, card={'kind': 'narration', 'text': 'One man\nalready knew.'}),

    # ================= CH 3 =================
    dict(id='t073', level='CH 3', template='officeFloor', breath=True, narration='Harry Markopolos was a money analyst, not a watchdog, not a cop.', overlay=None, card={'kind': 'chapter', 'title': 'The Whistleblower', 'subtitle': 'Nine Years, No Answer', 'hold': 2.4}),

    dict(id='t074', level=None, template='chartBoard', chart='flat', narration="In the late 1990s, he tried to copy Madoff's returns, using Madoff's own strategy.", overlay=None),

    dict(id='t074b', level=None, template='officeFloor', narration='Markopolos worked in the same industry, selling the same kind of strategy.', overlay=None),

    dict(id='t074c', level=None, template='closeUpPortrait', narration='He knew, better than almost anyone, what the returns should have looked like.', overlay=None),

    dict(id='t074d', level=None, template='chartBoard', chart='up', narration="They didn't look like that. They looked flawless.", overlay=None),

    dict(id='t074e', level=None, template='exchangeFloor', chart='flat', narration="Real markets have bad months. Madoff's fund, on paper, barely had bad weeks.", overlay=None),

    dict(id='t075', level=None, template='boardroom', narration="He couldn't. Not even close.", overlay=None),

    dict(id='t076', level=None, template='officeFloor', narration='He ran the numbers again.', overlay=None),

    dict(id='t077', level=None, template='chartBoard', chart='flat', narration='And again.', overlay=None),

    dict(id='t078', level=None, template='boardroom', breath=True, narration="His verdict: Madoff's numbers weren't just unlikely. They were flat-out impossible.", overlay=None),

    dict(id='t079', level=None, template='newsMontage', narration='Markopolos wrote to the SEC.', overlay=None),

    dict(id='t080', level=None, template='cityStreet', narration='In 1999.', overlay=None),

    dict(id='t081', level=None, template='boardroom', narration='He wrote again.', overlay=None),

    dict(id='t082', level=None, template='bankExterior', narration='And again.', overlay=None),

    dict(id='t083', level=None, template='newsMontage', breath=True, narration='Six formal warnings in nine years — 1999, 2000, 2001, 2005, 2007, 2008.', overlay=None, panels={'variant': 'grid4', 'cells': [{'template': 'newsMontage'}, {'template': 'newsMontage'}, {'template': 'boardroom'}, {'template': 'closeUpPortrait'}]}),

    dict(id='t084', level=None, template='chartBoard', chart='flat', narration='His most detailed report ran twenty-nine pages.', overlay=None),

    dict(id='t085', level=None, template='cityStreet', narration='With a title that left nothing to the imagination.', overlay=None, card={'kind': 'narration', 'text': '“The World’s Largest\nHedge Fund Is a Fraud.”'}),

    dict(id='t085b', level=None, template='boardroom', narration='Markopolos laid out twenty-nine separate red flags, in one memo.', overlay=None),

    dict(id='t085c', level=None, template='officeFloor', narration='Any one of them, followed up, could have ended it years early.', overlay=None),

    dict(id='t086', level=None, template='boardroom', narration='The SEC brought Madoff in and asked him directly.', overlay=None, bubbles=[{'text': 'Are you running a Ponzi scheme?', 'speaker': 'left'}, {'text': 'No.', 'speaker': 'right', 'at': 2.0}], foreground={'kind': 'overShoulder', 'side': 'right'}),

    dict(id='t087', level=None, template='officeFloor', mood='grim', narration="By the SEC's own later count, that was close to the whole probe.", overlay=None),

    dict(id='t087b', level=None, template='bankExterior', narration='Fund managers who fed him money never asked either — the fees were too good to slow down for questions.', overlay=None),

    dict(id='t087c', level=None, template='chartBoard', chart='up', narration='So the number kept climbing, warning after warning, year after year.', overlay=None),

    dict(id='t088', level=None, template='bankExterior', narration='Nobody called a bank. Nobody called a custodian.', overlay=None),

    dict(id='t089', level=None, template='exchangeFloor', narration='Nobody checked a single trade against the market it supposedly happened on.', overlay=None),

    dict(id='t090', level=None, template='crowdQueue', narration='Meanwhile, the money kept coming.', overlay=None),

    dict(id='t091', level=None, template='chartBoard', chart='up', narration='By the mid-2000s, Madoff was managing tens of billions of dollars.', overlay=None),

    dict(id='t092', level=None, template='domesticInterior', narration='For thousands of clients. Retirees in Florida. Some of the largest charities in the country.', overlay=None),

    dict(id='t093', level=None, template='broadcastDesk', narration="You'd have trusted him too. Almost everyone who met him did.", overlay=None),

    dict(id='t094', level=None, template='officeFloor', mood='grim', narration="A former chairman of NASDAQ, running history's largest fraud one floor under his own real firm.", overlay=None, card={'kind': 'narration', 'text': 'One floor\nunder himself.'}),

    dict(id='t095', level=None, template='cityStreet', narration='For nine years, the warnings went nowhere.', overlay=None),

    dict(id='t096', level=None, template='closeUpPortrait', breath=True, narration='Then, in 2008, something happened that no forged statement could fix.', overlay=None, card={'kind': 'narration', 'text': 'Something\nno paper could fix.'}),

    # ================= CH 4 =================
    dict(id='t097', level='CH 4', template='exchangeFloor', chart='down', breath=True, narration="The 2008 crash hit every portfolio on earth, Madoff's clients included.", overlay=None, card={'kind': 'chapter', 'title': 'The Confession', 'subtitle': 'Five Days in December', 'hold': 2.4}),

    dict(id='t097b', level=None, template='chartBoard', chart='flat', narration='For a decade, redemptions had been small, predictable, easy to cover with new deposits.', overlay=None),

    dict(id='t097c', level=None, template='newsMontage', narration='2008 broke that pattern completely.', overlay=None),

    dict(id='t097d', level=None, template='broadcastDesk', narration='Markets crashed everywhere. People wanted cash now, not paper.', overlay=None),

    dict(id='t098', level=None, template='crowdQueue', narration='Panicked investors wanted their money back. All at once.', overlay=None, placards=['GIVE IT BACK', "WHERE'S OUR MONEY", 'ANSWERS NOW']),

    dict(id='t099', level=None, template='chartBoard', chart='down', narration='Roughly seven billion dollars in withdrawal requests landed on his desk.', overlay=None),

    dict(id='t099b', level=None, template='officeFloor', narration='Madoff tried calling in favors, chasing fresh money from the funds that fed him.', overlay=None),

    dict(id='t099c', level=None, template='bankExterior', narration="There wasn't enough new money left anywhere to cover this hole.", overlay=None),

    dict(id='t099d', level=None, template='officeFloor', narration='His own employees on the nineteenth floor — the real business — had no idea what was coming.', overlay=None),

    dict(id='t100', level=None, template='bankExterior', mood='grim', narration="He didn't have it.", overlay=None),

    dict(id='t101', level=None, template='officeFloor', mood='grim', gap=1.4, narration='He never had it.', overlay=None),

    dict(id='t102', level=None, template='domesticInterior', mood='grim', narration='On December 9th, 2008, Madoff sat his sons down.', overlay=None, dialogue={'text': "It's one big lie. Basically, a giant Ponzi scheme."}, foreground={'kind': 'overShoulder', 'side': 'right'}),

    dict(id='t103', level=None, template='newsMontage', mood='grim', narration='Mark and Andrew had spent their whole careers in the real business, upstairs.', overlay=None),

    dict(id='t104', level=None, template='boardroom', mood='grim', breath=True, narration='They reported their own father to federal agents the very next day.', overlay=None),

    dict(id='t105', level=None, template='newsMontage', narration='December 10th, 2008.', overlay=None),

    dict(id='t106', level=None, template='cityStreet', narration='FBI Special Agent Ted Cacioppi came to his apartment the next morning.', overlay=None),

    dict(id='t107', level=None, template='domesticInterior', mood='grim', narration='December 11th.', overlay=None, bubbles=[{'text': 'Is there an innocent explanation?', 'speaker': 'left'}, {'text': "There is no innocent explanation. I've been running a massive Ponzi scheme.", 'speaker': 'right', 'at': 2.4}], foreground={'kind': 'overShoulder', 'side': 'left'}),

    dict(id='t108', level=None, template='closeUpPortrait', mood='grim', narration='He was arrested on the spot.', overlay=None),

    dict(id='t108b', level=None, template='cityStreet', narration='In three days, decades of paperwork stopped mattering.', overlay=None),

    dict(id='t108c', level=None, template='bankExterior', narration='Word spread through the firm before the sun came up.', overlay=None),

    dict(id='t108d', level=None, template='broadcastDesk', narration='By breakfast, federal agents were already in the lobby.', overlay=None),

    dict(id='t108e', level=None, template='newsMontage', narration='By lunch, it was the biggest story in American finance.', overlay=None),

    dict(id='t109', level=None, template='broadcastDesk', narration='Nine years after Markopolos wrote the words down, he had been exactly right.', overlay=None),

    dict(id='t110', level=None, template='chartBoard', chart='down', narration="The SEC's first estimate put the fraud at fifty billion dollars.", overlay=None),

    dict(id='t111', level=None, template='newsMontage', narration='A fuller accounting later found something stranger.', overlay=None, panels={'variant': 'v2', 'cells': [{'template': 'chartBoard'}, {'template': 'chartBoard'}]}),

    dict(id='t112', level=None, template='chartBoard', chart='down', breath=True, narration='Sixty-four point eight billion dollars, in fake gains, sitting on client statements.', overlay=None),

    dict(id='t113', level=None, template='broadcastDesk', narration='The real cash that vanished — money people handed over, and never saw again — was about seventeen and a half billion.', overlay=None),

    dict(id='t114', level=None, template='crowdQueue', narration='Two very different numbers. Both called "the size of the fraud."', overlay=None),

    dict(id='t115', level=None, template='bankExterior', narration='Fairfield Greenwich — the fund that sent him $7.2 billion — was gutted along with everyone else.', overlay=None),

    dict(id='t116', level=None, template='officeFloor', narration="The SEC's own watchdog later admitted it had failed, again and again, to catch it.", overlay=None),

    dict(id='t117', level=None, template='closeUpPortrait', mood='grim', narration="Fake numbers on paper don't go to prison.", overlay=None),

    dict(id='t118', level=None, template='newsMontage', mood='grim', narration='A person does.', overlay=None, card={'kind': 'narration', 'text': 'A person\ndoes.'}),

    # ================= CH 5 =================
    dict(id='t119', level='CH 5', template='courtHearing', breath=True, narration='March 12th, 2009. Madoff walked into a federal courtroom.', overlay=None, card={'kind': 'chapter', 'title': 'The Reckoning', 'subtitle': '150 Years, No Trial', 'hold': 2.4}),

    dict(id='t120', level=None, template='closeUpPortrait', narration='And pleaded guilty.', overlay=None),

    dict(id='t121', level=None, template='courtHearing', narration='All eleven felony counts.', overlay=None),

    dict(id='t122', level=None, template='broadcastDesk', narration='Securities fraud. Wire fraud. Mail fraud.', overlay=None),

    dict(id='t123', level=None, template='courtHearing', narration='Money laundering. Perjury. False filings with his own regulator.', overlay=None),

    dict(id='t124', level=None, template='closeUpPortrait', mood='grim', narration='There was no trial. He admitted everything, out loud, in his own words.', overlay=None),

    dict(id='t124b', level=None, template='courtHearing', narration='The courtroom was packed with the people he had ruined.', overlay=None),

    dict(id='t124c', level=None, template='crowdQueue', narration='Some had lost a retirement. Some had lost a business built over decades.', overlay=None),

    dict(id='t124d', level=None, template='broadcastDesk', narration='The court heard from them, one by one, before sentencing.', overlay=None),

    dict(id='t124e', level=None, template='closeUpPortrait', narration='None of it moved the arithmetic. It moved the sentence.', overlay=None),

    dict(id='t125', level=None, template='courtHearing', breath=True, narration='On June 29th, Judge Denny Chin handed down the maximum possible sentence.', overlay=None),

    dict(id='t126', level=None, template='closeUpPortrait', mood='grim', narration='One hundred fifty years.', overlay=None, card={'kind': 'word', 'word': '150 YEARS'}),

    dict(id='t127', level=None, template='courtHearing', narration='Madoff was seventy-one years old.', overlay=None),

    dict(id='t128', level=None, template='closeUpPortrait', mood='grim', breath=True, narration='"I am sorry," he told the courtroom. "I know it will not help you."', overlay=None),

    dict(id='t129', level=None, template='courtHearing', mood='grim', narration='Judge Chin called the crimes extraordinarily evil.', overlay=None),

    dict(id='t130', level=None, template='broadcastDesk', mood='grim', narration='Not a bloodless crime on paper, he said, but one with a staggering human toll.', overlay=None),

    dict(id='t131', level=None, template='boardroom', narration="His brother Peter, the firm's chief compliance officer, pleaded guilty too.", overlay=None),

    dict(id='t132', level=None, template='courtHearing', narration='Sentenced, in 2012, to ten years.', overlay=None),

    dict(id='t132b', level=None, template='boardroom', narration="Peter's sentence read like an echo of his brother's: guilty, and out of excuses.", overlay=None),

    dict(id='t132c', level=None, template='bankExterior', narration="The trustee's job was almost impossible: chase real money through a paper trail built entirely on lies.", overlay=None),

    dict(id='t133', level=None, template='chartBoard', chart='down', narration='Forced to give up a symbolic one hundred forty-three point one billion dollars.', overlay=None),

    dict(id='t134', level=None, template='closeUpPortrait', narration='Money that no longer existed outside a spreadsheet.', overlay=None),

    dict(id='t135', level=None, template='domesticInterior', mood='grim', breath=True, narration="Two years to the day after his father's arrest, Mark Madoff was found dead in his apartment.", overlay=None),

    dict(id='t136', level=None, template='closeUpPortrait', mood='grim', narration='By his own hand.', overlay=None, card={'kind': 'narration', 'text': 'Two years,\nto the day.'}),

    dict(id='t137', level=None, template='bankExterior', narration="A trustee spent over a decade clawing money back from people who had, without knowing it, gained from other people's losses.", overlay=None),

    dict(id='t138', level=None, template='chartBoard', chart='up', narration='It worked, more than anyone had a right to expect.', overlay=None),

    dict(id='t139', level=None, template='crowdQueue', narration="By 2024, victims had gotten back something like ninety-three percent of what they'd lost.", overlay=None),

    dict(id='t139b', level=None, template='chartBoard', chart='up', narration='Somehow, it worked far better than anyone predicted at the start.', overlay=None),

    dict(id='t139c', level=None, template='crowdQueue', narration="Ninety-three cents on the dollar, eventually, for people who'd once been told they'd get nothing.", overlay=None),

    dict(id='t139d', level=None, template='courtHearing', narration="Madoff never got any of it back himself. He wasn't the one it was for.", overlay=None),

    dict(id='t140', level=None, template='domesticInterior', mood='grim', narration='Some names never came back.', overlay=None),

    dict(id='t141', level=None, template='closeUpPortrait', mood='grim', narration='The Elie Wiesel Foundation for Humanity lost its entire endowment.', overlay=None),

    dict(id='t142', level=None, template='chartBoard', chart='down', narration='Fifteen point two million dollars. Gone in one signature.', overlay=None),

    dict(id='t143', level=None, template='newsMontage', mood='grim', narration='Madoff spent his final years in a federal prison in North Carolina.', overlay=None),

    dict(id='t144', level=None, template='domesticInterior', mood='grim', narration='Sick. Aging. Forgotten by the men he once golfed with.', overlay=None),

    dict(id='t144b', level=None, template='officeFloor', narration="The firm that once impressed NASDAQ's own board no longer exists, in any form.", overlay=None),

    dict(id='t145', level=None, template='cityStreet', narration='He died on April 14th, 2021.', overlay=None),

    dict(id='t146', level=None, template='closeUpPortrait', mood='grim', narration='He was eighty-two.', overlay=None, card={'kind': 'narration', 'text': 'Age 82.'}),

    dict(id='t147', level=None, template='domesticInterior', breath=True, narration="Maybe the strangest part isn't that he lied for so long.", overlay=None),

    dict(id='t148', level=None, template='closeUpPortrait', narration="It's how badly we wanted to believe him.", overlay=None),

    dict(id='t149', level=None, template='chartBoard', chart='up', narration='A steady ten percent, year after year, market up or down.', overlay=None),

    dict(id='t150', level=None, template='boardroom', breath=True, narration="That isn't just a good return. It's the fantasy every investor secretly wants to be true.", overlay=None),

    dict(id='t151', level=None, template='courtHearing', mood='grim', breath=True, narration='"I am sorry," he said. "I know it will not help you."', overlay=None),

    dict(id='t152', level=None, template='closeUpPortrait', mood='grim', narration="It didn't.", overlay=None, card={'kind': 'narration', 'text': "It didn't."}),

    dict(id='t153', level=None, template='domesticInterior', narration='And somewhere, right now, another advisor is telling another client that their money is growing exactly the way they were promised.', overlay=None),

    dict(id='t154', level=None, template='broadcastDesk', mood='grim', breath=True, narration='If you ever hear that pitch, you already know the one question worth asking.', overlay=None),

    dict(id='t155', level=None, template='closeUpPortrait', mood='grim', narration="Who's checking the math?", overlay=None, card={'kind': 'narration', 'text': "Who's checking\nthe math?"}),

]
