#!/usr/bin/env python3
"""The Office Firm That Burned $47 Billion — CRAYON-format explainer, ~15-17 min.

FORMAT: third-person past-tense explainer about a REAL subject (docs/BIBLE.md §1). Every date, figure
and quote is verified in docs/research/wework.md with a source; anything unverifiable to that standard
is in that file's CUT list and is absent here. No named person in this story was charged or convicted,
so the register skips fraud/prison language entirely — this is a governance and hubris story, not a
crime story. Register: comic and a little incredulous, closer to the reference's systemic-crisis
register than its villain-biography one — a firm that rented desks and chairs, and the sheer scale of
belief everyone (including its own bankers) put behind it, earns dry disbelief rather than noir.

STRUCTURAL VARIATION vs the last two PRODUCED crayon-format episodes (theranos, madoff): theranos used
the classic five-step THESIS hook and closed on an UNANSWERED QUESTION + QUOTE, four chapters. madoff
used the classic thesis hook and closed on REFLECTION + COMPLICIT "WE" + QUOTE CALLBACK + a FORWARD
TEASE, five chapters shaped rise -> mechanism -> exposure attempt -> reversal -> reckoning. This script
opens on the classic thesis hook too (WeWork has a founder and a birthplace, so the question-thesis
reserved for systemic subjects does not apply), but closes on REFLECTION + COMPLICIT "WE" + a direct
QUOTE, with NO forward tease and NO unanswered question — the shape neither of the last two produced
episodes used. Five chapters, shaped rise -> mechanism -> a SELF-INFLICTED reversal -> a slow bleed ->
a SECOND filing that finishes what the first one started — distinct from madoff's "exposure attempt"
(a whistleblower had to go looking) and ftx's "leak" (a reporter found it): here the firm's own IPO
paperwork, written to sell itself, is what exposes it. Nobody had to leak a thing. It published its own
confession and mailed it to the public itself.

MOTIF: theranos ran "one drop of blood"; madoff ran "ten percent, every year." This one runs THREE
through-lines: THE NUMBER (forty-seven billion, said at the peak, then run back down at the close of
each later chapter: to nine, to under three, to nothing) — THE FILING (a word planted in Ch1 as a
chore, taught as the mechanism in Ch2, and echoed in the Ch5 title itself, "The Filing, Again," when a
second filing — bankruptcy, not an IPO — finishes the job the first one started) — and THE QUESTION
SoftBank's own founder asked in 2017 ("who wins, the smart guy or the crazy guy?"), planted as a boast
in Ch1, paid off in Ch3 when the man who asked it says, on tape, that he was the foolish one.

CHAPTERS (§1, `Evocative Noun: Plain Explanation`, emitted as card=dict(kind="chapter", ...) and used
verbatim in the description timestamps):
  1 The Vision       : One Man Sold Everyone a Feeling
  2 The Filing       : What the Papers Weren't Meant to Say
  3 The Reckoning     : Wall Street Reads the Fine Print
  4 The Reset        : A Firm Tries to Look Ordinary
  5 The Filing, Again : Bankruptcy, and the Bid That Failed

PROMISE -> PAYOFF LEDGER:
  * Hook promise: "undone by its own papers" -> tested in Ch2 (the S-1 taught, plainly) -> paid off at
    the MIDPOINT REVERSAL (Ch3) as the filing doing exactly the damage the hook named.
  * THE NUMBER ($47 billion) planted Ch1 (the peak) -> run back down at the close of each later
    chapter (Ch3: SoftBank marks it near $3B; Ch4: a new listing values it at $9B, then $270M by 2023;
    Ch5: the bankruptcy filing lists $18.6B of debt against it) -> paid off in the ending as the tally
    of what "worth" turned out to mean.
  * Son's 2017 "crazy guy" exchange planted Ch1 (told as a boast) -> paid off Ch3/ending when Son
    himself, on a recorded call, names himself as the foolish one.
  * "Community Adjusted EBITDA" planted end of Ch1 (mentioned in passing) -> defined plainly in Ch2 ->
    becomes the line reporters seize on within days, in Ch3.
  * The "We" trademark, $5.9 million, paid to a firm Neumann himself controlled, planted Ch1 -> spelled
    out in the S-1 in Ch2 -> paid back in Ch3, once the backlash starts.
  * The 20-votes-a-share Founder stock planted Ch1 (why the board could never really stop him) ->
    defined in Ch2 -> cut to 10 votes in Ch3, a fix that lands too late to save the listing.
  * The mission line — "elevate the world's consciousness" — planted Ch1 as marketing, quoted verbatim
    from the filing itself in Ch2, then read back without a trace of irony in the closing reflection.
  * Flow, and Andreessen Horowitz's $350 million check, planted in Ch4 as backers funding Neumann's
    NEXT firm while WeWork was already dying -> paid off in Ch5 when that same firm backs his failed
    bid to buy WeWork back out of its own bankruptcy.
  * MIDPOINT REVERSAL (§5, "the moment the subject's own machine turns on them"): the S-1 filing,
    written by WeWork's own bankers and lawyers to sell WeWork to the public, is read by the public —
    and inside six weeks it kills the very listing it was written to launch. gap=1.4 immediately before.
  * share-worthy beat #1: WeWork never owned most of the buildings it ran. It signed leases lasting
    fifteen years while selling itself to backers as a tech firm.
  * share-worthy beat #2: the same man who told Neumann he was "not crazy enough" wrote him another
    huge check, for a brand-new firm, one year after WeWork's own stock had already collapsed.

Numbers, sentence lengths and WPM are self-checked against docs/BIBLE.md §3 before build; vocabulary is
deliberately short (Anglo-Saxon over Latinate: "firm" over "company" where it scans, "worth"/"the
number" over "valuation", "workers"/"staff" over "employees", "papers"/"filing" over "documentation",
"backers" over "investors", "redone" over "renegotiated", "said" over "announced", "tech" over
"technology") to hit the syllables-per-word band the WPM gate requires — checked with
scripts/wpm_predict.py before build.
"""

FPS = 30

NARRATION_RATE = "-5%"   # matches the current channel-wide retune (docs/BIBLE.md §3)

SCENES = [
    # ================= HOOK =================
    dict(id='t001', level=None, overlay=None, template='closeUpPortrait',
         narration='A firm that rented out desks and chairs was once worth forty-seven billion dollars.'),

    dict(id='t002', level=None, overlay=None, template='chartBoard', chart='up',
         narration='More than Ford.'),

    dict(id='t003', level=None, overlay=None, template='newsMontage',
         narration='Then it tried to sell shares to the public, and in six weeks lost thirty-eight billion dollars of that worth — without selling a single one.'),

    dict(id='t004', level=None, overlay=None, template='crowdQueue',
         narration='No crash. No plague. No scandal a watchdog had to dig up.'),

    dict(id='t005', level=None, overlay=None, template='bankExterior', card={'kind': 'word', 'word': 'Itself.'},
         narration='It was undone by its own papers.'),

    dict(id='t006', level=None, overlay=None, template='officeFloor',
         narration='This is the story of WeWork, the office firm that sold the world on reinventing work itself.'),

    dict(id='t007', level=None, overlay=None, template='cityStreet',
         narration='SoHo, New York City. 2010.'),

    # ================= CH 1: The Vision =================
    dict(id='t008', level='CH 1', overlay=None, template='boardroom', breath=True,
         card={'kind': 'chapter', 'title': 'The Vision', 'subtitle': 'One Man Sold Everyone a Feeling', 'hold': 2.4},
         narration='A twenty-seven-year-old named Adam Neumann had already tried, and failed, once.'),

    dict(id='t009', level=None, overlay=None, template='domesticInterior',
         narration='His first firm sold baby clothes with knee pads sewn in, for crawling.'),

    dict(id='t010', level=None, overlay=None, template='officeFloor',
         narration='It sold well enough.'),

    dict(id='t011', level=None, overlay=None, template='domesticInterior',
         narration='Just not well enough to matter.'),

    dict(id='t012', level=None, overlay=None, template='cityStreet',
         narration='A friend, an architect named Miguel McKelvey, tipped him off about cheap office space in Brooklyn.'),

    dict(id='t013', level=None, overlay=None, template='officeFloor',
         narration='They gutted a floor, and rented it out desk by desk, under one shared roof.'),

    dict(id='t014', level=None, overlay=None, template='boardroom',
         narration='A small first try. They sold their stake in it.'),

    dict(id='t015', level=None, overlay=None, template='officeFloor',
         narration='Then, in 2010, they opened something new.'),

    dict(id='t016', level=None, overlay=None, template='exchangeFloor',
         narration='They called it WeWork.'),

    dict(id='t016b', level=None, overlay=None, template='broadcastDesk',
         narration='Business writers barely noticed.'),

    dict(id='t017', level=None, overlay=None, template='chartBoard', chart='flat',
         narration='The idea itself was not new.'),

    dict(id='t018', level=None, overlay=None, template='officeFloor',
         narration='Sign a long lease on a floor. Fix it up. Rent out the desks by the month.'),

    dict(id='t019', level=None, overlay=None, template='bankExterior',
         narration='Landlords had done some form of this for decades.'),

    dict(id='t020', level=None, overlay=None, template='crowdQueue',
         narration='Neumann sold something else on top: a feeling of belonging.'),

    dict(id='t021', level=None, overlay=None, template='domesticInterior',
         dialogue=dict(text="Feels less like an office, more like a bar that lets you work."),
         narration='Free beer. Glass walls. A room that felt like a club, not a lease.'),

    dict(id='t022', level=None, overlay=None, template='crowdQueue', mood='bright',
         narration='Young firms signed up in droves.'),

    dict(id='t023', level=None, overlay=None, template='chartBoard', chart='up',
         narration='Between 2014 and 2016 alone, the worth of the firm climbed from one point four billion dollars to ten point five.'),

    dict(id='t024', level=None, overlay=None, template='cityStreet',
         narration='New buildings. New cities. Almost every month.'),

    dict(id='t024b', level=None, overlay=None, template='boardroom',
         narration='No watchdog asked how those leases really worked.'),

    dict(id='t025', level=None, overlay=None, template='newsMontage',
         narration='In 2017, Masayoshi Son, the head of Japan\'s SoftBank, walked into WeWork\'s New York office.'),

    dict(id='t026', level=None, overlay=None, template='closeUpPortrait',
         narration='He stayed about thirty minutes.'),

    dict(id='t027', level=None, overlay=None, template='officeFloor', bubbles=[{'kind': 'float', 'text': '"In a fight, who wins — the smart guy or the crazy guy?"'}],
         narration='Son asked him one thing, Neumann later told Forbes: in a fight, who wins — the smart guy, or the crazy guy?'),

    dict(id='t028', level=None, overlay=None, template='closeUpPortrait', bubbles=[{'kind': 'float', 'text': '"Crazy guy."'}],
         narration='"Crazy guy," Neumann said back.'),

    dict(id='t029', level=None, overlay=None, template='courtHearing', bubbles=[{'kind': 'float', 'text': '"You are correct, but you are not crazy enough."'}],
         narration='"You are correct," Son told him. "But you are not crazy enough."'),

    dict(id='t030', level=None, overlay=None, template='chartBoard', chart='up',
         narration='SoftBank put in four point four billion dollars, on the spot.'),

    dict(id='t031', level=None, overlay=None, template='exchangeFloor',
         narration='More rounds followed.'),

    dict(id='t032', level=None, overlay=None, template='cityStreet',
         narration='Crews gutted floor after floor of glass and reclaimed wood, city after city.'),

    dict(id='t033', level=None, overlay=None, template='domesticInterior', mood='bright',
         narration='Former staff later said Neumann went barefoot in the office, and asked for cases of a $140 tequila wherever he showed up.'),

    dict(id='t034', level=None, overlay=None, template='crowdQueue', mood='bright',
         narration='Nobody much minded. The number kept climbing.'),

    dict(id='t035', level=None, overlay=None, template='officeFloor',
         narration='"Our mission," the firm would later write, "is to elevate the world\'s consciousness."'),

    dict(id='t036', level=None, overlay=None, template='exchangeFloor',
         narration='A line about desks, dressed up as a spiritual quest.'),

    dict(id='t037', level=None, overlay=None, template='newsMontage',
         narration='Nobody laughed at it. Not yet.'),

    dict(id='t038', level=None, overlay=None, template='officeFloor', card={'kind': 'objects', 'items': ['briefcase', 'houseModel', 'cashStack']},
         narration='By January 2019, a new funding round set the firm\'s worth at forty-seven billion dollars.'),

    dict(id='t039', level=None, overlay=None, template='newsMontage',
         narration='More than Ford.'),

    dict(id='t039b', level=None, overlay=None, template='officeFloor',
         narration='A firm that owned almost none of its own floors.'),

    dict(id='t040', level=None, overlay=None, template='bankExterior',
         narration='It renamed itself "The We Company," a name meant to sound bigger than office space.'),

    dict(id='t041', level=None, overlay=None, template='domesticInterior',
         narration='Neumann\'s wife, Rebekah, ran the branding, and helped shape the mission itself.'),

    dict(id='t042', level=None, overlay=None, template='officeFloor',
         narration='Behind him sat a quieter piece of paper.'),

    dict(id='t043', level=None, overlay=None, template='courtHearing', card={'kind': 'narration', 'text': 'A trademark,\nsold to himself.'},
         narration='WeWork paid five point nine million dollars for rights to the word "We" — to a firm Neumann himself ran.'),

    dict(id='t044', level=None, overlay=None, template='officeFloor',
         narration='His own shares carried twenty votes each.'),

    dict(id='t045', level=None, overlay=None, template='exchangeFloor',
         narration='Everyone else\'s carried one.'),

    dict(id='t046', level=None, overlay=None, template='officeFloor', foreground={'kind': 'overShoulder', 'side': 'left'},
         narration='On paper, no board could ever outvote him.'),

    dict(id='t047', level=None, overlay=None, template='newsMontage',
         narration='None of this had reached the public yet.'),

    dict(id='t048', level=None, overlay=None, template='chartBoard', chart='up',
         narration='And by then the firm had already built its own way to count profit.'),

    dict(id='t049', level=None, overlay=None, template='courtHearing',
         narration='It called the figure "Community Adjusted EBITDA."'),

    dict(id='t050', level=None, overlay=None, template='officeFloor',
         narration='Nobody outside the room knew yet what that figure left out.'),

    dict(id='t051', level=None, overlay=None, template='courtHearing',
         narration='To sell shares to the public, the firm would have to write it all down first.'),

    # ================= CH 2: The Filing =================
    dict(id='t052', level='CH 2', overlay=None, template='officeFloor', breath=True,
         card={'kind': 'chapter', 'title': 'The Filing', 'subtitle': "What the Papers Weren't Meant to Say", 'hold': 2.4},
         narration='Before a firm sells shares to the public, the law makes it file a paper called an S-1.'),

    dict(id='t053', level=None, overlay=None, template='courtHearing',
         narration='A long file. Every number, every risk, every conflict of interest, laid out in plain sight.'),

    dict(id='t053b', level=None, overlay=None, template='cityStreet',
         narration='Three hundred pages, give or take — and you were meant to read every one.'),

    dict(id='t054', level=None, overlay=None, template='closeUpPortrait',
         narration='It is meant to be a formality.'),

    dict(id='t055', level=None, overlay=None, template='newsMontage',
         narration='August 14th, 2019. The We Company filed its own.'),

    dict(id='t056', level=None, overlay=None, template='chartBoard', chart='down',
         narration='In 2018, it had earned one point eight two billion dollars.'),

    dict(id='t057', level=None, overlay=None, template='boardroom', chart='down',
         narration='And lost one point nine three billion.'),

    dict(id='t058', level=None, overlay=None, template='broadcastDesk', card={'kind': 'word', 'word': 'Lost.'},
         narration='It had lost more than it made.'),

    dict(id='t059', level=None, overlay=None, template='boardroom',
         narration='Plain EBITDA means earnings before interest, tax, and wear on the buildings — a rough read on the real business. "Community Adjusted" went further. It stripped out marketing, too. Growth costs. Even plain overhead.'),

    dict(id='t062', level=None, overlay=None, template='crowdQueue', card={'kind': 'narration', 'text': 'A profit with the\nlosses removed.'},
         dialogue=dict(text="So it's profit, minus the part where you didn't make any?"),
         narration='In effect, it was a profit figure with the losses taken back out.'),

    dict(id='t063', level=None, overlay=None, template='broadcastDesk',
         narration='Readers of the filing laughed before they finished the page.'),

    dict(id='t064', level=None, overlay=None, template='officeFloor',
         narration='The filing also spelled out the trademark deal.'),

    dict(id='t065', level=None, overlay=None, template='boardroom',
         narration='Five point nine million dollars, for the word "We," to a firm Neumann ran himself.'),

    dict(id='t066', level=None, overlay=None, template='courtHearing',
         narration='Written down, it read very differently than it had sounded in a room.'),

    dict(id='t067', level=None, overlay=None, template='exchangeFloor',
         narration='It spelled out the vote math too.'),

    dict(id='t068', level=None, overlay=None, template='boardroom',
         narration='Neumann\'s shares: twenty votes each. Everyone else\'s: one.'),

    dict(id='t069', level=None, overlay=None, template='closeUpPortrait', foreground={'kind': 'overShoulder', 'side': 'right'},
         narration='Even if he sold nearly everything, he could still never lose control of the board.'),

    dict(id='t070', level=None, overlay=None, template='chartBoard', chart='flat',
         narration='Picture a firm where its founder can be outvoted by nobody, on anything, ever — no matter how few shares he keeps.'),

    dict(id='t071', level=None, overlay=None, template='officeFloor',
         narration='That was the firm asking the public for money.'),

    dict(id='t072', level=None, overlay=None, template='newsMontage',
         narration='And there was the mission line itself, printed in full.'),

    dict(id='t073', level=None, overlay=None, template='closeUpPortrait',
         narration='"Our mission is to elevate the world\'s consciousness."'),

    dict(id='t074', level=None, overlay=None, template='boardroom',
         narration='Written for a room of Wall Street readers who mostly just wanted the numbers.'),

    dict(id='t075', level=None, overlay=None, template='chartBoard', chart='down',
         narration='In the first six months of 2019 alone, the firm lost more than nine hundred million dollars.'),

    dict(id='t076', level=None, overlay=None, template='bankExterior',
         narration='On one point five four billion dollars of sales.'),

    dict(id='t077', level=None, overlay=None, template='newsMontage',
         narration='Five hundred twenty-eight floors by then. Growing fast. Losing faster.'),

    dict(id='t078', level=None, overlay=None, template='cityStreet',
         narration='Every one of those floors sat under a lease that could run fifteen years or more.'),

    dict(id='t079', level=None, overlay=None, template='bankExterior',
         narration='But its own renters could leave with a month\'s notice.'),

    dict(id='t080', level=None, overlay=None, template='chartBoard',
         narration='A firm selling short leases, wrapped around decades of fixed debt.'),

    dict(id='t080b', level=None, overlay=None, template='officeFloor',
         panels={'variant': 'v2', 'cells': [{'template': 'officeFloor'}, {'template': 'cityStreet'}]},
         narration='Fifteen years of rent, next to a lease anyone could walk out of in a month.'),

    dict(id='t081', level=None, overlay=None, template='newsMontage',
         narration='That gap had a name too, once people went looking for one.'),

    dict(id='t082', level=None, overlay=None, template='boardroom', panels={'variant': 'v2', 'cells': [{'template': 'officeFloor'}, {'template': 'courtHearing'}]},
         narration='A real-estate firm, dressed for years as a tech one.'),

    dict(id='t083', level=None, overlay=None, template='newsMontage',
         narration='All of it sat in one file, sent to the government, open for anyone to read.'),

    dict(id='t084', level=None, overlay=None, template='officeFloor',
         narration='Nobody had to leak a single page.'),

    dict(id='t085', level=None, overlay=None, template='closeUpPortrait',
         narration='You don\'t need a spy when the target mails its own file to the front desk.'),

    dict(id='t086', level=None, overlay=None, template='domesticInterior',
         narration='The firm had written its own confession, and sent it to the public itself.'),

    # ================= CH 3: The Reckoning =================
    dict(id='t087', level='CH 3', overlay=None, template='newsMontage', breath=True,
         card={'kind': 'chapter', 'title': 'The Reckoning', 'subtitle': 'Wall Street Reads the Fine Print', 'hold': 2.4},
         narration='Reporters and readers on Wall Street picked the filing apart within days.'),

    dict(id='t088', level=None, overlay=None, template='broadcastDesk',
         narration='"Community Adjusted EBITDA" turned into a punchline on business TV.'),

    dict(id='t089', level=None, overlay=None, template='closeUpPortrait',
         narration='One writer joked WeWork had built a number that adjusted for having a business at all.'),

    dict(id='t090', level=None, overlay=None, template='boardroom',
         narration='Backers who had been ready to buy in started asking what else the file hid.'),

    dict(id='t091', level=None, overlay=None, template='chartBoard', chart='down',
         narration='The banks selling the deal quietly cut their own guess in half.'),

    dict(id='t092', level=None, overlay=None, template='newsMontage',
         narration='Then again.'),

    dict(id='t092b', level=None, overlay=None, template='bankExterior',
         narration='Banks quietly made calls of their own.'),

    dict(id='t093', level=None, overlay=None, template='closeUpPortrait',
         narration='Down toward ten billion. Then lower still.'),

    dict(id='t094', level=None, overlay=None, template='boardroom',
         narration='The board tried to fix what it could, fast.'),

    dict(id='t095', level=None, overlay=None, template='officeFloor',
         narration='Neumann handed back the five point nine million from the trademark deal.'),

    dict(id='t096', level=None, overlay=None, template='chartBoard',
         narration='His votes were cut from twenty a share to ten.'),

    dict(id='t097', level=None, overlay=None, template='boardroom',
         narration='It was not enough, and it came too late.'),

    dict(id='t098', level=None, overlay=None, template='cityStreet',
         narration='The one file meant to win Wall Street over had done the opposite job entirely.'),

    dict(id='t099', level=None, overlay=None, template='newsMontage', gap=1.4,
         narration='It was written to raise money.'),

    dict(id='t100', level=None, overlay=None, template='closeUpPortrait', mood='grim', breath=True,
         narration='Instead, inside six weeks, that same filing — WeWork\'s own words, sent out by WeWork itself — was what killed the deal.'),

    dict(id='t101', level=None, overlay=None, template='boardroom', mood='grim',
         narration='September 24th, 2019. The board pushed Neumann out as chief.'),

    dict(id='t102', level=None, overlay=None, template='newsMontage', mood='grim',
         narration='September 30th. The firm pulled the whole filing back.'),

    dict(id='t103', level=None, overlay=None, template='domesticInterior', mood='grim', card={'kind': 'word', 'word': 'Pulled.'},
         narration='No listing. No new shares sold. No first day of trading at all.'),

    dict(id='t104', level=None, overlay=None, template='bankExterior', mood='grim',
         narration='SoftBank, already in for billions, stepped back in to keep the firm alive.'),

    dict(id='t105', level=None, overlay=None, template='chartBoard', mood='grim',
         narration='A rescue worth roughly nine point five billion dollars.'),

    dict(id='t106', level=None, overlay=None, template='closeUpPortrait',
         narration='Neumann himself walked away with a package worth up to one point seven billion dollars.'),

    dict(id='t107', level=None, overlay=None, template='boardroom',
         narration='Nearly nine hundred seventy million for his shares. A hundred eighty-five million as a fee for advice.'),

    dict(id='t108', level=None, overlay=None, template='chartBoard',
         narration='Five hundred million more, in credit, to help pay off his own loans.'),

    dict(id='t109', level=None, overlay=None, template='closeUpPortrait',
         narration='The man who cost the firm its listing left it richer than almost anyone else in the room.'),

    dict(id='t110', level=None, overlay=None, template='officeFloor', mood='grim',
         narration='That November, the firm cut twenty-four hundred jobs — about one worker in five.'),

    dict(id='t110b', level=None, overlay=None, template='cityStreet', mood='grim',
         narration='Some had joined for the mission. All of them still needed rent.'),

    dict(id='t111', level=None, overlay=None, template='crowdQueue', mood='grim',
         dialogue=dict(text="I signed up to elevate the world's consciousness. Now I'm just packing a box."),
         narration='People who had signed up for free beer and a mission line packed their own desks instead.'),

    dict(id='t112', level=None, overlay=None, template='broadcastDesk', mood='grim',
         narration='By the next spring, SoftBank marked its own stake down again: two point nine billion dollars.'),

    dict(id='t113', level=None, overlay=None, template='closeUpPortrait', mood='grim',
         bubbles=[{'kind': 'float', 'text': '"...I\'ve been admitting that several times I was foolish."'}],
         narration='On a call with investors, Masayoshi Son said it plainly: he had been foolish.'),

    dict(id='t114', level=None, overlay=None, template='boardroom', mood='grim', bubbles=[{'kind': 'float', 'text': '"I was wrong."'}],
         narration='"I was wrong," he said.'),

    dict(id='t115', level=None, overlay=None, template='chartBoard', mood='grim',
         narration='The man who told Neumann he was not crazy enough now sounded like the one who had been.'),

    dict(id='t116', level=None, overlay=None, template='newsMontage', mood='grim',
         narration='Forty-seven billion, on paper, had become two point nine.'),

    dict(id='t116b', level=None, overlay=None, template='courtHearing', card={'kind': 'word', 'word': 'Erased.'},
         narration='Erased, on paper, in under a year.'),

    dict(id='t117', level=None, overlay=None, template='officeFloor',
         narration='Nothing about the floors themselves had changed. Only the belief in them had.'),

    # ================= CH 4: The Reset =================
    dict(id='t118', level='CH 4', overlay=None, template='exchangeFloor', breath=True,
         card={'kind': 'chapter', 'title': 'The Reset', 'subtitle': 'A Firm Tries to Look Ordinary', 'hold': 2.4},
         narration='Under a new chief, WeWork spent two years trying to look plain.'),

    dict(id='t119', level=None, overlay=None, template='officeFloor',
         panels={'variant': 'v2', 'cells': [{'template': 'cityStreet'}, {'template': 'officeFloor'}]},
         narration='Leases got redone. Weak floors closed. The mission talk went quiet.'),

    dict(id='t120', level=None, overlay=None, template='boardroom',
         narration='In March 2021, the firm found a second door onto the stock market.'),

    dict(id='t121', level=None, overlay=None, template='exchangeFloor',
         narration='A shell firm called BowX merged with it instead of a normal listing.'),

    dict(id='t122', level=None, overlay=None, template='chartBoard', chart='up',
         narration='This time, the number was nine billion dollars.'),

    dict(id='t123', level=None, overlay=None, template='closeUpPortrait',
         narration='One fifth of the old peak — and still, somehow, a relief.'),

    dict(id='t124', level=None, overlay=None, template='newsMontage',
         narration='October 21st, 2021. WeWork finally traded on the New York Stock Exchange, under the ticker "WE."'),

    dict(id='t125', level=None, overlay=None, template='exchangeFloor', mood='bright',
         narration='Shares jumped more than thirteen percent on the first day.'),

    dict(id='t126', level=None, overlay=None, template='closeUpPortrait',
         narration='It had taken two years, one pulled filing, and one very different door in.'),

    dict(id='t127', level=None, overlay=None, template='boardroom',
         narration='By then Neumann had already begun something new.'),

    dict(id='t128', level=None, overlay=None, template='domesticInterior',
         narration='A housing-rental firm called Flow.'),

    dict(id='t129', level=None, overlay=None, template='officeFloor',
         narration='In August 2022, the backer Andreessen Horowitz put in three hundred fifty million dollars.'),

    dict(id='t130', level=None, overlay=None, template='chartBoard', chart='up',
         narration='A billion-dollar price tag, before Flow had opened one door.'),

    dict(id='t131', level=None, overlay=None, template='closeUpPortrait',
         narration='The firm called it the biggest single check it had ever cut.'),

    dict(id='t132', level=None, overlay=None, template='newsMontage',
         narration='The same Wall Street that had laughed at "Community Adjusted EBITDA" wrote Neumann a fresh nine-figure check.'),

    dict(id='t133', level=None, overlay=None, template='boardroom',
         narration='For a firm he had not yet built.'),

    dict(id='t134', level=None, overlay=None, template='exchangeFloor', mood='grim', chart='down',
         narration='Back at WeWork, the stock kept sliding.'),

    dict(id='t135', level=None, overlay=None, template='chartBoard', mood='grim', chart='down',
         narration='Higher rates made every lease cost more to carry.'),

    dict(id='t136', level=None, overlay=None, template='crowdQueue', mood='grim',
         narration='Firms sent workers home, then only some of them back.'),

    dict(id='t137', level=None, overlay=None, template='officeFloor', mood='grim',
         narration='Fewer desks got rented than the leases had already promised to pay for.'),

    dict(id='t138', level=None, overlay=None, template='closeUpPortrait', mood='grim',
         narration='By August 2023, the firm warned it might not last the year.'),

    dict(id='t139', level=None, overlay=None, template='chartBoard', mood='grim', chart='down',
         card={'kind': 'narration', 'text': '$47 billion.\nNow, $270 million.'},
         narration='Forty-seven billion dollars, once. Now, two hundred seventy million.'),

    dict(id='t140', level=None, overlay=None, template='newsMontage', mood='grim',
         narration='A "going concern" warning is one step from the end.'),

    dict(id='t141', level=None, overlay=None, template='bankExterior', mood='grim',
         narration='It means a firm\'s own accountants are not sure it lasts the year.'),

    dict(id='t142', level=None, overlay=None, template='boardroom', mood='grim',
         narration='WeWork\'s did not say so lightly.'),

    dict(id='t143', level=None, overlay=None, template='closeUpPortrait', mood='grim',
         narration='The floors were still full of desks. The math under them was not.'),

    # ================= CH 5: The Filing, Again =================
    dict(id='t144', level='CH 5', overlay=None, template='courtHearing', breath=True, mood='grim',
         card={'kind': 'chapter', 'title': 'The Filing, Again', 'subtitle': 'Bankruptcy, and the Bid That Failed', 'hold': 2.4},
         narration='November 6th, 2023.'),

    dict(id='t145', level=None, overlay=None, template='bankExterior', mood='grim',
         narration='WeWork and five hundred seventeen linked firms filed for Chapter 11 bankruptcy, in New Jersey.'),

    dict(id='t146', level=None, overlay=None, template='chartBoard', mood='grim', chart='down',
         narration='Eighteen point six billion dollars in debt.'),

    dict(id='t147', level=None, overlay=None, template='newsMontage', mood='grim', chart='down',
         narration='Against fifteen billion in assets.'),

    dict(id='t148', level=None, overlay=None, template='closeUpPortrait', mood='grim',
         narration='A second filing, four years after the first — this time asking a court for cover, not asking the public for cash.'),

    dict(id='t149', level=None, overlay=None, template='boardroom', mood='grim',
         narration='About ninety percent of lenders agreed to trade three billion dollars of debt for stock instead.'),

    dict(id='t150', level=None, overlay=None, template='newsMontage', mood='grim',
         narration='The filing did not even cover every country WeWork worked in.'),

    dict(id='t151', level=None, overlay=None, template='cityStreet', mood='grim',
         narration='Floors outside the U.S. and Canada were left out of it entirely.'),

    dict(id='t152', level=None, overlay=None, template='crowdQueue', mood='grim',
         dialogue=dict(text="On paper, the company's bankrupt. My badge still works, so -- here I am."),
         narration='Members at those floors kept badging in, working for a firm that was, on paper, in ruins somewhere else.'),

    dict(id='t153', level=None, overlay=None, template='closeUpPortrait',
         narration='Then Neumann tried something nobody saw coming.'),

    dict(id='t154', level=None, overlay=None, template='boardroom',
         narration='In March 2024, backed by Flow, he offered to buy WeWork back.'),

    dict(id='t155', level=None, overlay=None, template='chartBoard',
         narration='Roughly five hundred million dollars, to reclaim the firm he had been pushed out of.'),

    dict(id='t156', level=None, overlay=None, template='courtHearing',
         narration='Creditors and the court weighed the bid for weeks.'),

    dict(id='t157', level=None, overlay=None, template='closeUpPortrait',
         narration='Then Neumann walked away from his own bid.'),

    dict(id='t158', level=None, overlay=None, template='newsMontage', bubbles=[{'kind': 'float', 'text': '"Disappointing."'}],
         narration='He called the bankruptcy "disappointing," in public remarks, and left it there.'),

    dict(id='t159', level=None, overlay=None, template='courtHearing',
         narration='June 11th, 2024. A judge signed off on WeWork\'s exit from bankruptcy.'),

    dict(id='t160', level=None, overlay=None, template='chartBoard', chart='up',
         narration='More than four billion dollars in debt, wiped clean.'),

    dict(id='t161', level=None, overlay=None, template='boardroom',
         narration='Future lease bills cut by roughly half — about twelve billion dollars, over time.'),

    dict(id='t162', level=None, overlay=None, template='chartBoard', chart='up',
         narration='About four hundred fifty million dollars in fresh cash, raised to keep it going.'),

    dict(id='t163', level=None, overlay=None, template='closeUpPortrait', foreground={'kind': 'overShoulder', 'side': 'right'},
         narration='A private firm again. Smaller. Quieter. Still standing.'),

    dict(id='t164', level=None, overlay=None, template='officeFloor',
         narration='Still renting out desks and chairs.'),

    dict(id='t165', level=None, overlay=None, template='domesticInterior',
         narration='No trial. No verdict.'),

    dict(id='t165b', level=None, overlay=None, template='courtHearing',
         narration='Nobody from WeWork ever stood in a courtroom over what the filing said.'),

    dict(id='t166', level=None, overlay=None, template='closeUpPortrait',
         narration='That was never the crime here.'),

    dict(id='t167', level=None, overlay=None, template='cityStreet',
         narration='There was no crime to charge.'),

    dict(id='t168', level=None, overlay=None, template='boardroom',
         narration='Just a firm that told everyone, including itself, a story too big to keep paying rent on.'),

    # ================= ENDING =================
    dict(id='t169', level=None, overlay=None, template='closeUpPortrait', breath=True,
         narration='Maybe the strangest part of this story is not the trademark, or the twenty votes a share.'),

    dict(id='t170', level=None, overlay=None, template='newsMontage', card={'kind': 'narration', 'text': 'How badly\nwe wanted it true.'},
         narration="It's how badly we wanted the story to be true."),

    dict(id='t171', level=None, overlay=None, template='closeUpPortrait',
         narration='We called a landlord a tech firm because it said the word "community" enough times. We read "elevate the world\'s consciousness" next to a balance sheet, and let the balance sheet wait its turn. You can dress a spreadsheet up as a mission. Sooner or later, someone reads the spreadsheet anyway.'),

    dict(id='t174', level=None, overlay=None, template='chartBoard',
         narration='Forty-seven billion dollars, once. Then two point nine. Then nine. Then two hundred seventy million.'),

    dict(id='t175', level=None, overlay=None, template='closeUpPortrait', breath=True,
         narration='The desks never moved. Only the number believing in them did.'),

    dict(id='t176', level=None, overlay=None, template='boardroom', mood='grim',
         bubbles=[{'kind': 'float', 'text': '"...I\'ve been admitting that several times I was foolish. I was wrong."'}],
         narration='"I was foolish," the man who funded all of it finally said. "I was wrong."'),

    dict(id='t177', level=None, overlay=None, template='bankExterior',
         narration='Neither of them, in the end, was ever asked to prove he was crazy enough.'),

    dict(id='t178', level=None, overlay=None, template='cityStreet',
         narration='You don\'t need a crime for a firm this size to fall.'),

    dict(id='t179', level=None, overlay=None, template='closeUpPortrait', breath=True,
         narration='You just need to stop believing the number, and write down why.'),
]
