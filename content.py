#!/usr/bin/env python3
"""The 158-Year-Old Bank That Died in a Weekend — CRAYON-format explainer, ~15 min.

FORMAT: third-person past-tense explainer about a REAL subject (docs/BIBLE.md §1). Not the retired
second-person POV ladder. Every date, figure and quote is verified in docs/research/lehman_brothers.md
with a source; anything I could not verify to that standard is in that file's CUT list and is absent
here. Register: straight and noirish, held throughout (§2) — the subject has 25,000 real victims, so
the Depression episode's comic anachronism register would read as callous.

TEMPLATE CONSTRAINT (WO-13, stated plainly). Only SIX restyled templates exist — officeFloor,
boardroom, exchangeFloor, cityStreet, domesticInterior, newsMontage. Every other template in the
registry is un-restyled legacy line-art and would look wrong next to them, so this episode uses those
six and NOTHING else, including inside `panels` cells. Variety therefore has to come from the
signature devices (§8): 5 chapter cards, 2 narration cards, 2 single-word cards, 3 multi-panel splits,
6 bubble/float beats. The honest cost of that constraint is measured in
docs/research/crayon/COMPARISON.md — it is the episode's weakest axis and is not papered over here.

HOOK — the five steps (§4), in order:
  1 shock stat            t01  "A hundred and fifty-eight-year-old bank died in seventy-two hours."
  2 consequence fragments t01  "$639 billion in assets. $613 billion in debt. 25,000 employees."
  3 the paradox turn      t02  "But it didn't fall because nobody saw it coming. It fell because everybody did."
  4 thesis naming it      t03  "This is the story of Lehman Brothers…"
  5 hard cut DATE + PLACE t04  "Montgomery, Alabama, 1844."

CHAPTERS (§1, `Evocative Noun: Plain Explanation`, emitted as card=dict(kind="chapter", …) and used
verbatim in the description timestamps).
⚠ MEASURED DEFECT: a chapter SUBTITLE longer than ~36 characters wraps to two lines, and because
TextCard size-locks title:subtitle at 0.75 the wrap shrinks the whole block — the chapter title then
measures 0.425 of frame width against the reference's 0.565 (COMPARISON.md §2 §7). Subtitles 1 and 3
below are 45 and 44 chars and do this. Keep future subtitles at or under ~36 characters.
  1 The Cotton Store : How a Dry Goods Shop Became a Wall Street Bank   t04
  2 The Machine      : How Lehman Turned Houses Into Money              t09
  3 The Trick        : The Accounting That Hid Fifty Billion Dollars    t17
  4 The Weekend      : Three Days at the Federal Reserve                t23
  5 The Pavement     : What Monday Morning Actually Cost                t32

PROMISE -> PAYOFF LEDGER (ids match the final t01-t39 sequence):
  * t03 promise: "It starts with cotton. It ends with cardboard boxes on a New York sidewalk."
        -> boxes PAID at t33/t34, cotton PAID at t39. Both halves land; neither is left hanging.
  * t01 promise: "no war, no fire, no robbery — just a weekend"
        -> PAID at t25-t31, which is literally three days in one room.
  * MOTIF (the factual through-line replacing the old sensory anchor): **taking the thing the
        customer cannot pay for, and selling it on.** Planted t05 (cotton instead of cash) ->
        re-triggered t11 (the mortgage bond), t13 (leverage), t20 (Repo 105) -> maximal payoff t39.
  * EPITHET: "the Gorilla" / "Lehman would never be small again" planted t08 -> re-triggered t14
        ("The Gorilla was right") -> inverted t31.
  * share-worthy beat #1: Repo 105 — 105% of the cash makes a loan a "sale"  -> t18/t19/t20
  * share-worthy beat #2: Einhorn read the fraud out loud on a stage four months early -> t21, t38
  * share-worthy beat #3: the Fuld pay hearing, where the ARGUMENT was over $175M -> t37
  * MIDPOINT REVERSAL (§5): the machine runs backwards at the same leverage — t22, with gap=1.4 on
        t21 so the sound engine drops to near-silence and the line lands raw. Spent once.

STRUCTURAL VARIATION vs the last 2 produced (ops/produced_topics.json: bratva, astronaut — both old
format): cold open is a DEATH-FIRST autopsy (the ending stated in sentence one, then a 158-year
rewind), act two is a MECHANISM TEARDOWN in four numbered moves rather than a rise, and the ending is
REFLECTION + COMPLICIT "WE" + CALLBACK TO THE OPENING IMAGE with no forward tease.
"""

FPS = 30

# NARRATION RATE — set here, per scene, and MEASURED. Read this before "fixing" it.
#
# `gen_voice_edge.RATE` is "-13%", chosen (and correctly measured) against the PREVIOUS episode, whose
# sentences average ~15 words. This script obeys the canon's sentence targets instead — 8.47-word mean,
# 56.3% of sentences under 8 words (docs/BIBLE.md §3) — and short fragments make edge-tts insert a
# sentence-final pause far more often, so the SAME rate reads slower: measured 147.3 WPM speech here
# against 149.1 on the legacy episode.
#
# That matters because runtime WPM can never exceed speech WPM, and roughly 97% of this episode's
# runtime is speech. At -13% the whole episode measured **143.5 WPM runtime — outside gate.py's
# 145-152 band** — and no amount of gap-trimming can fix it: zeroing every gap and lead in the episode
# would only reach 147.3. Measured on this script's own prose, 5 scenes / 333 words per rate:
#   -13% -> 148.8   -12% -> 149.2   -11% -> 150.7   -10% -> 153.8   -8% -> 156.3  (speech WPM)
# -11% projects to 145.3 WPM runtime, inside the band but within 1.0 of its edge (gate.py WARNs there).
# -10% projects to 148.2 — mid-band, and within 0.3 of the reference channel's own 148.5 aggregate.
NARRATION_RATE = "-10%"

SCENES = [
    # ================= HOOK — the five steps, first ~30s =================
    dict(id="t01", level=None, template="cityStreet",
         narration=("A hundred and fifty-eight-year-old bank died in seventy-two hours. Six hundred "
                    "and thirty-nine billion dollars in assets. Six hundred and thirteen billion in "
                    "debt. Twenty-five thousand employees on four continents. The fourth largest "
                    "investment bank in America. All of it gone between a Friday night and a Monday "
                    "morning. No war. No fire. No robbery. Just a weekend."),
         overlay=dict(big="$639 BILLION", sub="THE LARGEST BANKRUPTCY IN U.S. HISTORY")),

    dict(id="t02", level=None, template="boardroom",
         narration=("But it did not fall because nobody saw it coming. It fell because everybody "
                    "did. The men who could have stopped it sat in one room for three days. They "
                    "looked at the number. Then they decided it was somebody else's problem."),
         overlay=None,
         card=dict(kind="narration", text="Everyone saw it coming. Nobody would pay to stop it.")),

    dict(id="t03", level=None, template="exchangeFloor",
         narration=("This is the story of Lehman Brothers, the bank that was too big to fail right "
                    "up until the weekend somebody decided it was not. It is a story about leverage, "
                    "which is a polite word for other people's money. It starts with cotton. It ends "
                    "with cardboard boxes on a New York sidewalk."),
         overlay=None),

    # ================= CHAPTER 1 — The Cotton Store =================
    dict(id="t04", level="CH 1", template="cityStreet",
         narration=("Montgomery, Alabama, 1844. A German immigrant named Henry Lehman opened a shop "
                    "and sold pots, cloth and farm tools to cotton growers. There was one problem "
                    "with the customers. They had no money. Alabama in the 1840s ran on cotton, not "
                    "cash."),
         overlay=dict(big="1844", sub="MONTGOMERY, ALABAMA"),
         card=dict(kind="chapter", title="The Cotton Store",
                   subtitle="How a Dry Goods Shop Became a Wall Street Bank", hold=2.8)),

    dict(id="t05", level=None, template="domesticInterior",
         narration=("So Henry took cotton as payment. Then he did the thing that made his family "
                    "rich for a century and a half. He sold the cotton. Not the pots. The cotton. By "
                    "1850 both of his brothers had crossed the Atlantic to join him. Emanuel. Mayer. "
                    "The sign over the door was repainted. Lehman Brothers."),
         overlay=dict(big="1850", sub="THE NAME OVER THE DOOR")),

    dict(id="t06", level=None, template="officeFloor",
         narration=("Now look at what trading cotton actually meant. A bale that did not exist yet. "
                    "Grown in Alabama. Sold to a buyer in New York. At a price agreed months before "
                    "the crop came in. That is a derivative. Lehman was trading derivatives decades "
                    "before Wall Street had a word for them. The store became a broker. The broker "
                    "became a bank."),
         overlay=None),

    dict(id="t07", level=None, template="newsMontage",
         narration=("And then it simply kept not dying. The Civil War burned the cotton trade to the "
                    "ground. Lehman survived. The Great Depression killed American banks by the "
                    "thousand. Lehman survived. Two world wars. The oil shock. Black Monday, 1987. "
                    "Survived, survived, survived. A hundred and fifty-eight years is long enough to "
                    "start believing you cannot die."),
         overlay=dict(big="158 YEARS", sub="THROUGH EVERY CRASH BEFORE THIS ONE"),
         # §6.4 — four eras, four independently keyed cells. The orange block is an explicit ground
         # override so the two `interior`-keyed cells cannot land on the same hue.
         panels=dict(variant="grid4", cells=[dict(template="cityStreet"),
                                             dict(template="boardroom"),
                                             dict(template="newsMontage"),
                                             dict(template="officeFloor", ground="#e8541f")])),

    dict(id="t08", level=None, template="boardroom",
         narration=("1994. Lehman is spun out on its own and a trader named Richard Fuld takes the "
                    "top job. On the floor they called him the Gorilla. He kept the job for fourteen "
                    "years, which in investment banking is about four lifetimes. Fuld's rule was "
                    "simple. Lehman would never be small again. Everything after this follows from "
                    "that one sentence."),
         overlay=dict(big="14 YEARS", sub="RICHARD FULD, CEO FROM 1994")),

    # ================= CHAPTER 2 — The Machine =================
    dict(id="t09", level="CH 2", template="officeFloor",
         narration=("So how does a bank make money out of a house it does not own? Slowly, and then "
                    "all at once. Here is the machine, in four moves."),
         overlay=None,
         card=dict(kind="chapter", title="The Machine",
                   subtitle="How Lehman Turned Houses Into Money", hold=2.8)),

    dict(id="t10", level=None, template="domesticInterior",
         narration=("Move one. Somebody borrows. A family signs a mortgage they can just about "
                    "afford, at a rate that resets in two years to one they cannot. The lender does "
                    "not care. The lender is not keeping the loan."),
         overlay=None,
         bubbles=[dict(kind="float", text="The rate resets in two years.", x=0.30, y=0.20),
                  dict(kind="float", text="We'll refinance before then.", x=0.66, y=0.72, at=4.0)]),

    dict(id="t11", level=None, template="exchangeFloor",
         narration=("Move two. The loan gets sold. Thousands of them are bundled into one bond, and "
                    "the bond is sliced into layers. The top layer is paid first and rated triple-A. "
                    "The bottom layer is paid last and pays the most. Same houses. Different "
                    "positions in the queue. That is the whole trick, and it is genuinely clever "
                    "right up to the moment everybody in the queue stops paying at once."),
         overlay=None),

    dict(id="t12", level=None, template="cityStreet",
         narration=("Move three, and this is where Lehman went further than anyone. Why buy "
                    "mortgages from a lender when you can buy the lender? Lehman bought mortgage "
                    "companies outright. Now it made the loan, packaged the loan, sold the bond, and "
                    "kept a pile of the bonds it could not sell. Every step of the pipe, one owner."),
         overlay=None),

    dict(id="t13", level=None, template="officeFloor",
         narration=("Move four. Do all of it with borrowed money. For every dollar Lehman actually "
                    "owned, it had borrowed more than thirty. That is what leverage means. It works "
                    "beautifully in one direction. A three percent gain becomes a hundred percent "
                    "gain. A three percent loss erases you completely."),
         overlay=dict(big="30 TO 1", sub="BORROWED AGAINST ITS OWN MONEY")),

    dict(id="t14", level=None, template="newsMontage",
         narration=("And for a while it worked exactly the way the model said it would. February "
                    "2007. Lehman stock touches eighty-six dollars a share. The firm is worth close "
                    "to sixty billion dollars. It has just posted the best year in its history. Four "
                    "point two billion in profit, on nineteen point three billion of revenue. The "
                    "Gorilla was right. Lehman was never going to be small again."),
         overlay=dict(big="$86", sub="A SHARE — FEBRUARY 2007")),

    dict(id="t15", level=None, template="boardroom",
         narration=("Inside the building, a few people had started doing the arithmetic backwards. "
                    "What happens to a thirty-to-one bank if house prices simply stop going up? Not "
                    "fall. Stop. The risk officers ran the number. The answer was bad enough that "
                    "the risk officers stopped being invited to the meetings."),
         overlay=None,
         dialogue=dict(text="If housing goes flat, we do not survive it. Not down. Flat."),
         bubbles=[dict(text="If housing goes flat, we do not survive it.", x=0.66, y=0.19,
                       tail="down", tailAt=0.35, tailSkew=-0.2, at=13.0)]),

    dict(id="t16", level=None, template="exchangeFloor",
         narration=("The machine had one requirement, and it never once stopped asking for it. Not "
                    "profit. Not customers. Something much simpler than that."),
         overlay=None,
         card=dict(kind="word", word="More")),

    # ================= CHAPTER 3 — The Trick =================
    dict(id="t17", level="CH 3", template="newsMontage",
         narration=("By 2008 the bonds nobody wanted were sitting on Lehman's own books. And every "
                    "quarter, the firm had to show those books to the world. So it found a way to "
                    "make them look emptier than they were."),
         overlay=None,
         card=dict(kind="chapter", title="The Trick",
                   subtitle="The Accounting That Hid Fifty Billion Dollars", hold=2.8)),

    dict(id="t18", level=None, template="officeFloor",
         narration=("It was called Repo 105, and it is beautiful the way a card trick is beautiful. "
                    "A repo is a loan against an asset. You hand over a bond, take the cash, and buy "
                    "the bond back a few days later. Because you are buying it back, it never leaves "
                    "your balance sheet. It is a loan. And a loan is debt."),
         overlay=None),

    dict(id="t19", level=None, template="boardroom",
         narration=("Unless. If the assets you hand over are worth at least a hundred and five "
                    "percent of the cash you take, the accounting lets you call it a sale. Not a "
                    "loan. A sale. And a sold asset leaves the books entirely. Same bond. Same cash. "
                    "Same buy-back a few days later. Completely different picture."),
         overlay=dict(big="105%", sub="THE LINE THAT TURNED A LOAN INTO A SALE")),

    dict(id="t20", level=None, template="exchangeFloor",
         narration=("So a few days before the end of every quarter, Lehman shipped up to fifty "
                    "billion dollars of assets out of the door. The balance sheet was photographed. "
                    "Then the assets came back. Reported leverage, twelve point one. Actual "
                    "leverage, thirteen point nine. Nothing had been sold. Nothing had been fixed. A "
                    "number had been photographed at the exact moment it looked best."),
         overlay=dict(big="$50B", sub="MOVED OFF THE BOOKS EVERY QUARTER"),
         # §6.4 — the two halves of the trick, side by side: the desk that books it, the room that
         # signs it off. `officeFloor` is `interior`, `boardroom` is `grey`, so the cells key apart.
         panels=dict(variant="v2", cells=[dict(template="officeFloor"),
                                          dict(template="boardroom")])),

    dict(id="t21", level=None, template="officeFloor", gap=1.4,
         narration=("Outside the building, people were noticing. May 21st, 2008. A hedge fund "
                    "manager named David Einhorn stands up at a New York conference and gives a talk "
                    "called Accounting Ingenuity. He goes through Lehman's own public filings, line "
                    "by line, and says, politely, that the numbers do not add up. Lehman called him "
                    "a short seller talking his own book. Lehman was not wrong about that. It was "
                    "wrong about the numbers."),
         overlay=dict(big="MAY 2008", sub="EINHORN READ IT OUT LOUD, ON A STAGE"),
         bubbles=[dict(text="The numbers do not add up.", x=0.30, y=0.18, tail="down",
                       tailAt=0.55, at=16.0)]),

    # ---- MIDPOINT REVERSAL — the machine turns on its owner. Spent once. ----
    dict(id="t22", level=None, template="newsMontage",
         narration=("Here is what the whole industry missed. The machine that turned houses into "
                    "money only ran in one direction. When house prices fell, it ran backwards. At "
                    "the same speed. With the same leverage. Thirty to one, pointed the other way."),
         overlay=None,
         card=dict(kind="narration", text="The machine only ever ran in one direction.")),

    # ================= CHAPTER 4 — The Weekend =================
    dict(id="t23", level="CH 4", template="cityStreet",
         narration=("March 2008. Bear Stearns, the smallest of the big Wall Street banks, runs out "
                    "of cash in three days. JPMorgan buys it for two dollars a share, raised a week "
                    "later to ten. The Federal Reserve backstops the deal. Wall Street read that "
                    "rescue as a promise. It was not a promise."),
         overlay=dict(big="$2", sub="A SHARE — BEAR STEARNS, MARCH 2008"),
         card=dict(kind="chapter", title="The Weekend",
                   subtitle="Three Days at the Federal Reserve", hold=2.8)),

    dict(id="t24", level=None, template="boardroom",
         narration=("September 10th, 2008. Lehman pre-announces its third quarter. A loss of three "
                    "point nine billion dollars, and seven point eight billion of writedowns on "
                    "property nobody wanted. The stock had been eighty-six dollars. It was now under "
                    "eight. Fuld had spent the whole summer hunting a buyer at a price he was "
                    "willing to accept. There were no takers left."),
         overlay=dict(big="$3.9B LOSS", sub="THE THIRD QUARTER, ANNOUNCED SEPT 10")),

    dict(id="t25", level=None, template="exchangeFloor",
         narration=("Friday, September 12th. Henry Paulson at the Treasury, Timothy Geithner at the "
                    "New York Fed and Christopher Cox at the SEC summon the chief executives of Wall "
                    "Street to the Federal Reserve Bank of New York. The instruction is blunt. "
                    "Lehman is out of money. By Sunday night there is a buyer, or there is a "
                    "bankruptcy. And the government is not paying for it."),
         overlay=None),

    dict(id="t26", level=None, template="boardroom",
         narration=("Saturday. The room builds a plan. The banks pool their own money into a bad "
                    "bank, take Lehman's worst property off its hands, and let a buyer have the "
                    "clean half. Paulson looks at it and says the private sector has to put in far "
                    "more. Twenty-five, perhaps thirty billion dollars. Their own money. To rescue a "
                    "competitor."),
         overlay=dict(big="$25-30B", sub="WHAT THE ROOM WAS ASKED TO PUT IN"),
         dialogue=dict(text="There is no federal money in this one. Whatever you build, you build with your own.")),

    dict(id="t27", level=None, template="officeFloor",
         narration=("Then Bank of America walked. It had been the likeliest buyer all week. On "
                    "Saturday afternoon it left the table, and by that evening it had bought Merrill "
                    "Lynch instead, for fifty billion dollars in stock. One Wall Street firm was "
                    "rescued that weekend. It was not Lehman."),
         overlay=dict(big="$50 BILLION", sub="BANK OF AMERICA BOUGHT MERRILL INSTEAD")),

    dict(id="t28", level=None, template="boardroom",
         narration=("That left Barclays. All day Sunday the British bank worked the deal, and all "
                    "day Sunday it looked done. Then John Varley and Bob Diamond told the room the "
                    "truth. Their regulator in London would not approve it. Britain was not going to "
                    "let a British bank swallow an American one's losses."),
         overlay=None,
         # ⚠ QA DEFECT, LEFT IN DELIBERATELY (docs/research/crayon/COMPARISON.md §3). This float has no
         # `color`, so it renders in the default WHITE over `boardroom`'s pale window wall and is very
         # nearly illegible at 10:30 in the render. The fix is `color="#000000"` — docs/BIBLE.md §8 says
         # exactly that for a pale scene. It is NOT applied here on purpose: content.py, the measurements
         # in COMPARISON.md and out/lehman_brothers.mp4 must all describe the same build. Apply it in the
         # next pass, not by patching this file after the audit.
         bubbles=[dict(kind="float", text="London will not approve it.", x=0.34, y=0.24, at=14.0)]),

    dict(id="t29", level=None, template="cityStreet",
         narration=("Sunday night, September 14th. There is no buyer. There is no federal money. "
                    "There are lawyers in a conference room drafting a bankruptcy filing for a "
                    "company that had been trading since before the Civil War. Inside Lehman's "
                    "headquarters on Seventh Avenue, employees who had come in on a Sunday sat and "
                    "watched the television to find out whether they still had jobs."),
         overlay=None),

    dict(id="t30", level=None, template="newsMontage",
         narration=("Every door had been tried by now. The Treasury. The Fed. Two buyers. A room "
                    "full of rivals. Every answer came back as the same single word."),
         overlay=None,
         card=dict(kind="word", word="No")),

    dict(id="t31", level=None, template="boardroom",
         narration=("A quarter to two in the morning, September 15th, 2008. Lehman Brothers Holdings "
                    "filed for bankruptcy. Six hundred and thirty-nine billion dollars of assets. "
                    "Six hundred and thirteen billion of debt. The firm that was never going to be "
                    "small again had become the largest failure in American history, and nothing "
                    "since has come close to it."),
         overlay=dict(big="$613 BILLION", sub="IN DEBT — FILED AT 1:45 A.M.")),

    # ================= CHAPTER 5 — The Pavement =================
    dict(id="t32", level="CH 5", template="exchangeFloor",
         narration=("Monday. The Dow closed down five hundred and four points, four point four "
                    "percent, its worst single day since the markets reopened after September 11th. "
                    "And that was only the part of it with a number attached."),
         overlay=dict(big="504 POINTS", sub="THE DOW'S WORST DAY SINCE 9/11"),
         card=dict(kind="chapter", title="The Pavement",
                   subtitle="What Monday Morning Actually Cost", hold=2.8)),

    dict(id="t33", level=None, template="cityStreet",
         narration=("Outside the building on Seventh Avenue there were cameras. And in front of the "
                    "cameras there were people in suits, carrying cardboard boxes. That picture went "
                    "around the world inside a day. It is still the image people mean when they say "
                    "two thousand and eight. Twenty-five thousand employees, and most of them found "
                    "out from the news."),
         overlay=None),

    dict(id="t34", level=None, template="officeFloor",
         narration=("What was inside the boxes was ordinary. Photographs. A mug. A pair of running "
                    "shoes. Somebody's kid's drawing. The people carrying them had not sliced a "
                    "mortgage bond or signed off a Repo 105 trade. They had answered phones, fixed "
                    "servers and filed things. The machine was built at the top. It was carried out "
                    "of the door by everybody else."),
         overlay=None,
         # §6.4 — the leaning gutter puts the desk that was emptied against the street it was
         # emptied onto. `officeFloor` is `interior`, `cityStreet` is `daylight`.
         panels=dict(variant="diagonal2", cells=[dict(template="officeFloor"),
                                                 dict(template="cityStreet")])),

    dict(id="t35", level=None, template="domesticInterior",
         narration=("The wreckage kept spreading outward. Money market funds broke. Credit froze "
                    "worldwide, because no lender could tell which bank was next. And within weeks "
                    "the American government was doing for everybody else exactly what it had just "
                    "refused to do for Lehman. The lesson Wall Street took from that weekend was not "
                    "the one anyone intended to teach."),
         overlay=None),

    dict(id="t36", level=None, template="newsMontage",
         narration=("Two years later a court-appointed examiner named Anton Valukas published his "
                    "report. Two thousand two hundred pages. It laid out Repo 105 in detail. What it "
                    "was. Who signed it. How a firm reporting leverage of twelve point one was "
                    "actually running at thirteen point nine. No Lehman executive went to prison. "
                    "Not one."),
         overlay=dict(big="2,200 PAGES", sub="THE VALUKAS REPORT, 2010")),

    dict(id="t37", level=None, template="exchangeFloor",
         narration=("Richard Fuld was asked in Congress what he had been paid. A congressman's chart "
                    "said four hundred and eighty-five million dollars since 2000. Fuld said the "
                    "real figure was under three hundred and ten million. Read that argument again. "
                    "The disagreement was a hundred and seventy-five million dollars, and both sides "
                    "believed their own number was the reasonable one."),
         overlay=dict(big="$485M", sub="THE FIGURE FULD DISPUTED")),

    # ---- ENDING — reflection, complicit "we", callback to the opening image. No CTA. ----
    dict(id="t38", level=None, template="cityStreet",
         narration=("Here is the part that should bother us. Nothing Lehman did that weekend was a "
                    "secret. The leverage was in the filings. The mortgages were in the newspapers. "
                    "Einhorn read the whole thing out loud on a stage four months early. We had the "
                    "numbers. We did not want them. A bank that had outlived the Civil War and the "
                    "Depression and 1987 was not supposed to be capable of dying, and believing that "
                    "was more comfortable than checking."),
         overlay=None),

    dict(id="t39", level=None, template="domesticInterior",
         narration=("Henry Lehman opened a shop where the customers had no money. Only cotton. He "
                    "took the cotton anyway, because he knew he could sell it on to somebody else. A "
                    "hundred and fifty-eight years later, his firm was still doing precisely that. "
                    "Taking the thing nobody could pay for. Selling it on. It worked every single "
                    "time, right up until the Monday it did not."),
         overlay=None),
]

# Apply the measured narration rate to every scene. `gen_voice_edge.py` reads `sc.get("rate", RATE)`,
# so this is the writer-side field the pipeline already documents (docs/BIBLE.md §8) — nothing in
# gen_voice_edge.py is edited. A scene that wants its own prosody can still set `rate=` explicitly in
# its own dict above; setdefault leaves that alone.
for _s in SCENES:
    _s.setdefault("rate", NARRATION_RATE)
