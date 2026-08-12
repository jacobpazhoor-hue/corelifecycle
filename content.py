#!/usr/bin/env python3
"""The 158-Year-Old Bank That Died in a Weekend — CRAYON-format explainer, ~15 min.

FORMAT: third-person past-tense explainer about a REAL subject (docs/BIBLE.md §1). Every date, figure
and quote is verified in docs/research/lehman_brothers.md with a source; anything I could not verify to
that standard is in that file's CUT list and is absent here. Register: straight and noirish, held
throughout (§2) — the subject has 25,000 real victims, so the Depression episode's comic anachronism
register would read as callous.

GRANULARITY — THIS IS THE WO-22 REWRITE. Same subject, same verified facts, same measured MATCHes as
the 39-scene WO-13 build; what changed is the EDIT. That build ran 39 scenes over 13.7 min: a 21.1s
mean scene against the reference's 4.79s mean shot, and at 8 evenly spaced samples it showed only
4 distinct set-ups out of 8 (the reference montages show 8 of 8). Since WO-17 there is exactly ONE
framing per scene, so a scene IS a shot and the writer — not the director — owns the cut rate.
This script is written to docs/BIBLE.md §3a: ONE set-up per 1-2 sentences, 10-16 narration words a
scene. MEASURED on this build: 196 scenes, 16.16 min, mean scene 4.95s, 12.4 cuts/min, 8 of 8 distinct
set-ups at the reference montages' own sampling density, 152.7 WPM runtime-inclusive, gate PASS.
An intermediate 141-scene draft of this same script measured 154.2 WPM and would have HALTED: past
about a 7s mean scene, splitting a scene REMOVES more sentence-final pause than the gap it adds, so
the fix for a high WPM is more scenes, not fewer. The table is in §3a.

SET-UP ROTATION. Thirteen explainer environments exist (`EXPLAINER_TEMPLATES` in src/explainer.tsx —
NOT docs/TEMPLATES.md, which still documents only the legacy library): officeFloor · boardroom ·
exchangeFloor · cityStreet · domesticInterior · newsMontage · bankExterior · courtHearing ·
factoryFloor · broadcastDesk · crowdQueue · closeUpPortrait · chartBoard. At this cut rate the
template list alone is not enough variety, so the devices carry their share: 5 chapter cards,
6 narration cards, 4 word cards, 2 object cards, 4 panel splits, 4 over-the-shoulder foregrounds,
5 bubble/float beats. Rule held throughout: at least two other set-ups between any two uses of one
template (the bible's "never adjacent" is the floor, not the target).

PERIOD (WO-26 — the defect COMPARISON.md §7 defect 4 scored, "period/anachronism mismatch through
chapters 1-2"). Every one of the thirteen rooms is drawn CONTEMPORARY and none of them takes a period
flag, so this is a WRITING constraint, not an art one: the fix is choosing rooms whose CONTENTS the
narration's century does not contradict. The tiers are measured off the JSX in src/explainer.tsx and
written down in docs/BIBLE.md §8 PERIOD. Chapter 1 runs 1844-1865 and the ending's callback returns
there, so both are now built from the four rooms that carry no dated machine — newsMontage,
courtHearing, factoryFloor, domesticInterior — plus the full-screen cards, which are era-free by
construction because the art beneath them is never rendered. WHAT THIS COSTS, stated plainly: chapter
1 has FOUR rooms available where the modern chapters have thirteen, so its rotation is tighter than
theirs and it buys its fifth set-up from a device (the t007 over-the-shoulder silhouette — a black
mass carries no century). All four of those rooms key `interior`, which is why the historical chapter
now reads warm and enclosed and the 1994 cut to `cityStreet` at t019 opens out. That is a bonus, not
the reason. The real fix is period art; until it exists, this is the rule.

`officeFloor` REPETITION (WO-26, the second QA defect: "it looks the same every time"). It was the
most-placed room at 20 uses, 12 of them a plain full-frame room with no device on it. Now 16, of
which 8 are plain: t007b went to courtHearing on the period rule, t109 to courtHearing (the line is
about lawyers), t118 to newsMontage (the line is "most of them found out from the news"), t133b to
domesticInterior (the complicit "we" watching from a front room), and t085 became a v2 split so the
room arrives as half a frame beside the queue rather than as itself again.

HOOK — the five steps (§4), in order, all inside the first ~30s:
  1 shock stat            t001  "A hundred and fifty-eight-year-old bank died in seventy-two hours."
  2 consequence fragments t002  "$639 billion in assets. $613 billion in debt. 25,000 employees."
  3 the paradox turn      t003  "But it did not fall because nobody saw it coming..."
  4 thesis naming it      t004  "This is the story of Lehman Brothers..."
  5 hard cut DATE + PLACE t005  "Montgomery, Alabama, 1844."

CHAPTERS (§1, `Evocative Noun: Plain Explanation`, emitted as card=dict(kind="chapter", …) and used
verbatim in the description timestamps). MEASURED DEFECT (COMPARISON.md §2 §7): a subtitle past ~36
characters wraps to two lines and shrinks the whole block, so the WO-13 chapter titles measured 0.425
of frame width against the reference's 0.565. Every subtitle below is inside 36 characters.
  1 The Cotton Store : A Shop Where Nobody Had Cash   (27)  t005
  2 The Machine      : How Houses Became Money        (22)  t027
  3 The Trick        : The Accounting That Hid Billions (32) t059
  4 The Weekend      : Three Days at the New York Fed (30)  t086
  5 The Pavement     : What Monday Morning Cost       (24)  t114

PROMISE -> PAYOFF LEDGER (a `b` suffix is the second half of a scene split for pace, §3a):
  * t004b promise: "It starts with cotton. It ends with cardboard boxes on a New York sidewalk."
        -> boxes PAID at t116b/t119, cotton PAID at t138-t141b. Both halves land.
  * t001 promise: "No war. No fire. No robbery." -> PAID at t094-t113, three days in one room.
  * MOTIF (the factual through-line replacing the old sensory anchor): **taking the thing the
        customer cannot pay for, and selling it on.** Planted t006-t008 (cotton instead of cash) ->
        re-triggered t025 (the habit outlives the cotton), t031-t033 (the mortgage bond), t040-t042
        (leverage), t070 (Repo 105) -> maximal payoff t139-t141.
  * EPITHET: "the Gorilla" / "Lehman would never be small again" planted t020-t023 -> re-triggered
        t049 ("The Gorilla was right") -> inverted t113.
  * share-worthy beat #1: Repo 105 — 105% of the cash makes a loan a "sale" -> t061-t071
  * share-worthy beat #2: Einhorn read the fraud out loud on a stage four months early -> t076, t134
  * share-worthy beat #3: the Fuld pay hearing, where the ARGUMENT was over $175M -> t129-t131b
  * MIDPOINT REVERSAL (§5): the machine runs backwards at the same leverage — t081, with gap=1.4 on
        t080 so the sound engine drops to near-silence and the line lands raw. Spent once.

STRUCTURAL VARIATION vs the last 2 produced (ops/produced_topics.json: bratva, astronaut — both old
format): cold open is a DEATH-FIRST autopsy (the ending stated in sentence one, then a 158-year
rewind), act two is a MECHANISM TEARDOWN in four numbered moves rather than a rise, and the ending is
REFLECTION + COMPLICIT "WE" + CALLBACK TO THE OPENING IMAGE with no forward tease.
"""

FPS = 30

# NARRATION RATE — set here, per scene, and MEASURED. Read this before "fixing" it.
#
# -7% was chosen in WO-17 on the OWNER's ear ("the voice needs to be slightly sped up") and measured
# 156.8 WPM speech / 152.5 runtime over the 39-scene build. Do not change it here without re-measuring;
# `gen_voice_edge.RATE` carries the same value and the full rate table.
#
# WHAT THE WO-22 RE-CUT DOES TO THE RUNTIME FIGURE. Runtime WPM = words / runtime, and every scene
# boundary costs LEAD (0.1s) + an inter-scene gap (0.25-0.55s ordinary, 0.60-1.00s before a chapter
# turn) while REMOVING one sentence-final pause from inside the synthesised utterance. Splitting is
# therefore not free but not full price either. Measured on this script: see the header of
# docs/BIBLE.md §3a and the numbers printed by gen_voice_edge.py.
#
# THIS LINE, NOT JUST gen_voice_edge.RATE, is what sets the rate for this episode: the setdefault at
# the bottom of this file stamps it onto every scene, and a per-scene `rate` WINS over the module
# default. Changing one without the other is a silent no-op.
NARRATION_RATE = "-7%"

SCENES = [
    # ================= HOOK — the five steps, first ~30s =================
    dict(id="t001", level=None, template="cityStreet",
         narration=("A hundred and fifty-eight-year-old bank died in seventy-two hours. No war. No fire. No "
                    "robbery."),
         overlay=None),

    dict(id="t002", level=None, template="chartBoard",
         narration=("Six hundred and thirty-nine billion dollars of assets."),
         overlay=dict(big="$639 BILLION", sub="THE LARGEST BANKRUPTCY IN U.S. HISTORY")),

    dict(id="t002b", level=None, template="crowdQueue",
         narration=("Six hundred and thirteen billion of debt. Twenty-five thousand employees. Four "
                    "continents."),
         overlay=None),

    dict(id="t003", level=None, template="boardroom",
         narration=("But it did not fall because nobody saw it coming. It fell because everybody did."),
         overlay=None,
         card=dict(kind="narration", text="Everyone saw it coming. Nobody would pay to stop it.")),

    dict(id="t004", level=None, template="exchangeFloor",
         narration=("This is the story of Lehman Brothers."),
         overlay=None),

    dict(id="t004b", level=None, template="cityStreet",
         narration=("It starts with cotton. It ends with cardboard boxes on a New York sidewalk."),
         overlay=None),

    # ================= CHAPTER 1 — The Cotton Store =================
    dict(id="t005", level="CH 1", template="newsMontage", breath=True,
         narration=("Montgomery, Alabama, 1844. A German immigrant named Henry Lehman opened a shop."),
         overlay=dict(big="1844", sub="MONTGOMERY, ALABAMA"),
         card=dict(kind="chapter", title="The Cotton Store", subtitle="A Shop Where Nobody Had Cash", hold=2.4)),

    dict(id="t005b", level=None, template="factoryFloor",
         narration=("He sold pots, cloth and farm tools to cotton growers."),
         overlay=None),

    dict(id="t006", level=None, template="domesticInterior",
         narration=("There was one problem with the customers. They had no money."),
         overlay=None),

    dict(id="t006b", level=None, template="newsMontage",
         narration=("Alabama in the eighteen forties ran on cotton, not cash. A crop was the only money "
                    "most of his customers ever had."),
         overlay=None),

    dict(id="t007", level=None, template="factoryFloor",
         narration=("So Henry took cotton as payment."),
         overlay=None,
         # §6.8 — the era-safe palette is only four rooms deep (§8 PERIOD), so chapter 1 buys its
         # fifth set-up from a DEVICE rather than a fourteenth room: a silhouette is a black mass and
         # carries no century. `factoryFloor` stages its colour hero at x 1260, so the near plane
         # takes the RIGHT edge — the silhouette's shoulder line stops at 1360.
         foreground=dict(kind="overShoulder", side="right")),

    dict(id="t007b", level=None, template="courtHearing",
         narration=("Then he did the thing that would make his family rich for a century and a half, and it "
                    "had nothing to do with pots."),
         overlay=None),

    dict(id="t008", level=None, template="domesticInterior",
         narration=("He sold the cotton. Not the pots. The cotton."),
         overlay=None,
         card=dict(kind="word", word="Cotton")),

    dict(id="t009", level=None, template="newsMontage",
         narration=("By 1850 both of his brothers had crossed the Atlantic to join him. Emanuel. Mayer."),
         overlay=dict(big="1850", sub="THE NAME OVER THE DOOR")),

    dict(id="t009b", level=None, template="factoryFloor",
         narration=("The sign over the door was repainted, and the name on it outlived all three of them."),
         overlay=None),

    dict(id="t010", level=None, template="courtHearing",
         narration=("Lehman Brothers. Now look at what trading cotton actually meant."),
         overlay=None),

    dict(id="t011", level=None, template="newsMontage",
         narration=("A bale that did not exist yet. Grown in Alabama."),
         overlay=None),

    dict(id="t011b", level=None, template="factoryFloor",
         narration=("Sold to a buyer in New York, months before anybody knew what the crop would be worth."),
         overlay=None),

    dict(id="t012", level=None, template="courtHearing",
         narration=("At a price agreed before the crop came in."),
         overlay=None),

    dict(id="t012b", level=None, template="domesticInterior",
         narration=("That is a derivative: a contract whose value depends on something that has not "
                    "happened yet."),
         overlay=None),

    dict(id="t013", level=None, template="newsMontage",
         narration=("Lehman was trading derivatives decades before Wall Street had a word for them."),
         overlay=None),

    dict(id="t013b", level=None, template="courtHearing",
         narration=("The store became a broker. The broker became a bank."),
         overlay=None),

    dict(id="t014", level=None, template="factoryFloor",
         narration=("And then it simply kept not dying."),
         overlay=None),

    dict(id="t015", level=None, template="newsMontage",
         narration=("The Civil War burned the cotton trade to the ground and took the South's economy with "
                    "it."),
         overlay=None),

    dict(id="t015b", level=None, template="courtHearing",
         narration=("Lehman survived."),
         overlay=None),

    dict(id="t016", level=None, template="crowdQueue",
         narration=("The Great Depression killed American banks by the thousand. Lehman survived that too."),
         overlay=None),

    dict(id="t017", level=None, template="newsMontage",
         narration=("Two world wars. The oil shock. Black Monday, 1987. Survived, survived, survived."),
         overlay=dict(big="158 YEARS", sub="THROUGH EVERY CRASH BEFORE THIS ONE"),
         # §6.4 — four eras, four independently keyed cells. The orange block is an explicit ground
         # override so the two `interior`-keyed cells cannot land on the same hue.
         panels=dict(variant="grid4", cells=[dict(template="cityStreet"),
                 dict(template="boardroom"),
                 dict(template="newsMontage"),
                 dict(template="officeFloor", ground="#e8541f")])),

    dict(id="t018", level=None, template="closeUpPortrait",
         narration=("A hundred and fifty-eight years is long enough to start believing you cannot die."),
         overlay=None),

    dict(id="t018b", level=None, template="domesticInterior",
         narration=("It is also long enough for everybody who remembers the last near miss to retire."),
         overlay=None),

    dict(id="t019", level=None, template="cityStreet", breath=True,
         narration=("1994. Lehman is spun out on its own, and a trader named Richard Fuld takes the top "
                    "job."),
         overlay=None),

    dict(id="t020", level=None, template="officeFloor",
         narration=("On the floor they called him the Gorilla. He kept the job for fourteen years."),
         overlay=dict(big="14 YEARS", sub="RICHARD FULD, CEO FROM 1994"),
         # §6.8 — officeFloor stages its hero at x 1180-1480, so the silhouette takes the LEFT edge.
         foreground=dict(kind="overShoulder", side="left")),

    dict(id="t021", level=None, template="boardroom",
         narration=("In investment banking, where a bad quarter can end a career, that is about four "
                    "lifetimes."),
         overlay=None),

    dict(id="t022", level=None, template="closeUpPortrait",
         narration=("Fuld's rule was simple."),
         overlay=None,
         bubbles=[dict(kind="float", text="Lehman will never be small again.", x=0.3, y=0.2)]),

    dict(id="t023", level=None, template="chartBoard",
         narration=("Lehman would never be small again. Everything after this follows from that one "
                    "sentence."),
         overlay=None,
         card=dict(kind="narration", text="Lehman would never be small again.")),

    dict(id="t024", level=None, template="exchangeFloor",
         narration=("By the nineties the cotton was long gone, and so was everyone who had ever touched it."),
         overlay=None),

    dict(id="t024b", level=None, template="newsMontage",
         narration=("The habit was not."),
         overlay=None),

    dict(id="t025", level=None, template="bankExterior",
         narration=("Lehman still made its money the same way."),
         overlay=None),

    dict(id="t025b", level=None, template="crowdQueue",
         narration=("Take the thing the customer cannot pay for. Sell it on."),
         overlay=None),

    dict(id="t026", level=None, template="domesticInterior",
         narration=("But how does a bank that started with cotton end up owning your mortgage?"),
         overlay=None),

    # ================= CHAPTER 2 — The Machine =================
    dict(id="t027", level="CH 2", template="factoryFloor", breath=True,
         narration=("So how does a bank make money out of a house it does not own?"),
         overlay=None,
         card=dict(kind="chapter", title="The Machine", subtitle="How Houses Became Money", hold=2.4)),

    dict(id="t027b", level=None, template="closeUpPortrait",
         narration=("Slowly, and then all at once."),
         overlay=None),

    dict(id="t028", level=None, template="chartBoard",
         narration=("Here is the machine, in four moves. Move one. Somebody borrows."),
         overlay=None),

    dict(id="t029", level=None, template="domesticInterior",
         narration=("A family signs a mortgage they can just about afford, at a rate that resets in two "
                    "years to one they cannot."),
         overlay=None,
         bubbles=[dict(kind="float", text="The rate resets in two years.", x=0.3, y=0.2),
                  dict(kind="float", text="We'll refinance before then.", x=0.66, y=0.7, at=3.4)]),

    dict(id="t030", level=None, template="closeUpPortrait",
         narration=("The lender does not care, because the lender is not keeping the loan."),
         overlay=None),

    dict(id="t030b", level=None, template="bankExterior",
         narration=("It will be somebody else's problem inside a month."),
         overlay=None),

    dict(id="t031", level=None, template="officeFloor",
         narration=("Move two. The loan gets sold."),
         overlay=None),

    dict(id="t031b", level=None, template="chartBoard",
         narration=("Thousands of them are bundled into one bond, and investors buy a share of everybody's "
                    "mortgage payments at once."),
         overlay=None),

    dict(id="t032", level=None, template="factoryFloor",
         narration=("The bond is sliced into layers."),
         overlay=None),

    dict(id="t032b", level=None, template="exchangeFloor",
         narration=("The top layer is paid first and rated triple-A, which is the rating governments get."),
         overlay=None),

    dict(id="t033", level=None, template="chartBoard",
         narration=("The bottom layer is paid last and pays the most, because it is the one that loses "
                    "everything first."),
         overlay=None),

    dict(id="t033b", level=None, template="domesticInterior",
         narration=("Same houses. Different positions in the queue."),
         overlay=None),

    dict(id="t034", level=None, template="crowdQueue",
         narration=("That is the whole trick, and it is genuinely clever."),
         overlay=None),

    dict(id="t035", level=None, template="officeFloor",
         narration=("Right up to the moment everybody in the queue stops paying at once, which the model "
                    "said could not happen."),
         overlay=None,
         # §6.6 — the product, isometric on white: a house turned into a stack of cash.
         card=dict(kind="objects", items=["houseModel", "cashStack"])),

    dict(id="t036", level=None, template="cityStreet",
         narration=("Move three. This is where Lehman went further than anyone."),
         overlay=None),

    dict(id="t037", level=None, template="bankExterior",
         narration=("Why buy mortgages from a lender when you can buy the lender?"),
         overlay=None),

    dict(id="t037b", level=None, template="officeFloor",
         narration=("Lehman bought mortgage companies outright, and fed them straight into its own pipe."),
         overlay=None),

    dict(id="t038", level=None, template="factoryFloor",
         narration=("Now it made the loan, packaged the loan, sold the bond, and kept a pile of the bonds "
                    "it could not sell."),
         overlay=None),

    dict(id="t039", level=None, template="chartBoard",
         narration=("Every step of the pipe, one owner."),
         overlay=None),

    dict(id="t040", level=None, template="boardroom",
         narration=("Move four, and this is the one that killed it. Do all of it with borrowed money."),
         overlay=None,
         # §6.8 — boardroom's hero stands at the RIGHT, so the silhouette takes the left edge.
         foreground=dict(kind="overShoulder", side="left")),

    dict(id="t041", level=None, template="exchangeFloor",
         narration=("For every dollar Lehman actually owned, it had borrowed more than thirty dollars to "
                    "invest alongside it."),
         overlay=dict(big="30 TO 1", sub="BORROWED AGAINST ITS OWN MONEY")),

    dict(id="t042", level=None, template="chartBoard",
         narration=("That is what leverage means. It works beautifully in one direction, and only in one "
                    "direction."),
         overlay=None),

    dict(id="t043", level=None, template="broadcastDesk",
         narration=("A three percent gain on borrowed money becomes a hundred percent gain on your own."),
         overlay=None),

    dict(id="t044", level=None, template="closeUpPortrait",
         narration=("A three percent loss erases you completely, and nobody has to do anything wrong for it "
                    "to happen."),
         overlay=None),

    dict(id="t045", level=None, template="newsMontage", breath=True,
         narration=("And for a while it worked exactly the way the model said it would."),
         overlay=None),

    dict(id="t046", level=None, template="exchangeFloor",
         narration=("February 2007. Lehman stock touches eighty-six dollars a share."),
         overlay=dict(big="$86", sub="A SHARE — FEBRUARY 2007")),

    dict(id="t046b", level=None, template="bankExterior",
         narration=("The firm is worth close to sixty billion dollars."),
         overlay=None),

    dict(id="t047", level=None, template="broadcastDesk",
         narration=("It has just posted the best year in its history. Four point two billion in profit."),
         overlay=None),

    dict(id="t048", level=None, template="chartBoard",
         narration=("On nineteen point three billion of revenue."),
         overlay=None),

    dict(id="t048b", level=None, template="boardroom",
         narration=("A record, at a firm whose entire culture was built on beating the last record."),
         overlay=None),

    dict(id="t049", level=None, template="closeUpPortrait",
         narration=("The Gorilla was right. Lehman was never going to be small again."),
         overlay=None),

    dict(id="t050", level=None, template="officeFloor",
         narration=("Inside the building, a few people had started doing the arithmetic backwards."),
         overlay=None),

    dict(id="t050b", level=None, template="exchangeFloor",
         narration=("They were asking what would break the machine rather than what would feed it."),
         overlay=None),

    dict(id="t051", level=None, template="boardroom",
         narration=("What happens to a thirty-to-one bank if house prices simply stop going up? Not fall. "
                    "Stop."),
         overlay=None,
         bubbles=[dict(text="If housing goes flat, we do not survive it.", x=0.66, y=0.19, tail="down", tailAt=0.35, tailSkew=-0.2, at=3.6)]),

    dict(id="t052", level=None, template="chartBoard",
         narration=("The risk officers ran the number, and then they ran it again."),
         overlay=None),

    dict(id="t053", level=None, template="officeFloor",
         narration=("The answer was bad enough that the risk officers stopped being invited to the "
                    "meetings."),
         overlay=None),

    dict(id="t054", level=None, template="crowdQueue",
         narration=("Nobody had to lie."),
         overlay=None),

    dict(id="t054b", level=None, template="closeUpPortrait",
         narration=("They simply stopped asking the question that had an answer they could not use."),
         overlay=None),

    dict(id="t055", level=None, template="factoryFloor",
         narration=("The machine had one requirement, and it never once stopped asking for it."),
         overlay=None),

    dict(id="t056", level=None, template="exchangeFloor",
         narration=("Not profit. Not customers. Something much simpler than that."),
         overlay=None,
         card=dict(kind="word", word="More")),

    dict(id="t057", level=None, template="newsMontage",
         narration=("By the summer of 2007 American house prices had stopped going up, which was the one "
                    "thing the whole structure could not survive."),
         overlay=None),

    dict(id="t058", level=None, template="bankExterior",
         narration=("The machine kept buying anyway. The bonds nobody wanted piled up inside Lehman's own "
                    "building."),
         overlay=None),

    # ================= CHAPTER 3 — The Trick =================
    dict(id="t059", level="CH 3", template="officeFloor", breath=True,
         narration=("By 2008 those bonds were sitting on Lehman's own books."),
         overlay=None,
         card=dict(kind="chapter", title="The Trick", subtitle="The Accounting That Hid Billions", hold=2.4)),

    dict(id="t059b", level=None, template="broadcastDesk",
         narration=("And every quarter, the firm had to show those books to the world."),
         overlay=None),

    dict(id="t060", level=None, template="boardroom",
         narration=("So it found a way to make them look emptier than they were, four times a year, for "
                    "exactly the few days that mattered."),
         overlay=None),

    dict(id="t061", level=None, template="chartBoard",
         narration=("It was called Repo 105, and it is beautiful the way a card trick is beautiful."),
         overlay=None),

    dict(id="t062", level=None, template="exchangeFloor",
         narration=("A repo is a loan against an asset."),
         overlay=None),

    dict(id="t062b", level=None, template="crowdQueue",
         narration=("You hand over a bond, you take the cash, and both sides know you are coming back for "
                    "it."),
         overlay=None),

    dict(id="t063", level=None, template="officeFloor",
         narration=("You buy the bond back a few days later."),
         overlay=None,
         # §6.6 — the two objects the whole trick moves between: the vault and the cash.
         card=dict(kind="objects", items=["safe", "cashStack"])),

    dict(id="t064", level=None, template="factoryFloor",
         narration=("Because you are buying it back, it never leaves your balance sheet."),
         overlay=None),

    dict(id="t064b", level=None, template="newsMontage",
         narration=("It is a loan. And a loan is debt."),
         overlay=None),

    dict(id="t065", level=None, template="boardroom",
         narration=("Unless."),
         overlay=None,
         card=dict(kind="word", word="Unless")),

    dict(id="t066", level=None, template="chartBoard",
         narration=("If the assets you hand over are worth at least a hundred and five percent of the cash "
                    "you take..."),
         overlay=None),

    dict(id="t067", level=None, template="officeFloor",
         narration=("...the accounting lets you call it a sale. Not a loan. A sale."),
         overlay=dict(big="105%", sub="THE LINE THAT TURNED A LOAN INTO A SALE")),

    dict(id="t067b", level=None, template="exchangeFloor",
         narration=("The same transaction, with a different name on it."),
         overlay=None),

    dict(id="t068", level=None, template="factoryFloor",
         narration=("And a sold asset leaves the books entirely, taking its debt with it."),
         overlay=None),

    dict(id="t069", level=None, template="boardroom",
         narration=("Same bond. Same cash. Same buy-back a few days later. Completely different picture."),
         overlay=None),

    dict(id="t070", level=None, template="exchangeFloor",
         narration=("So a few days before the end of every quarter, Lehman shipped assets out of the door "
                    "and reported what was left."),
         overlay=None,
         # §6.4 — the desk that books the trade beside the room that signs it off. `officeFloor`
         # is `interior` and `boardroom` is `grey`, so the two cells key apart.
         panels=dict(variant="v2", cells=[dict(template="officeFloor"), dict(template="boardroom")])),

    dict(id="t071", level=None, template="chartBoard",
         narration=("Up to fifty billion dollars of them."),
         overlay=dict(big="$50B", sub="MOVED OFF THE BOOKS EVERY QUARTER")),

    dict(id="t071b", level=None, template="officeFloor",
         narration=("The balance sheet was photographed. Then the assets came back."),
         overlay=None),

    dict(id="t072", level=None, template="newsMontage",
         narration=("Reported leverage, twelve point one. Actual leverage, thirteen point nine."),
         overlay=None),

    dict(id="t072b", level=None, template="boardroom",
         narration=("The difference was the entire point of the exercise."),
         overlay=None),

    dict(id="t073", level=None, template="closeUpPortrait",
         narration=("Nothing had been sold. Nothing had been fixed."),
         overlay=None),

    dict(id="t073b", level=None, template="factoryFloor",
         narration=("Nothing had even moved, in the sense that mattered."),
         overlay=None),

    dict(id="t074", level=None, template="cityStreet",
         narration=("A number had been photographed at the exact moment it looked best."),
         overlay=None,
         card=dict(kind="narration", text="A number, photographed at the moment it looked best.")),

    dict(id="t075", level=None, template="crowdQueue",
         narration=("Outside the building, people were noticing."),
         overlay=None),

    dict(id="t075b", level=None, template="chartBoard",
         narration=("Numbers that clean, in a year that ugly, are their own kind of signal."),
         overlay=None),

    dict(id="t076", level=None, template="broadcastDesk", breath=True,
         narration=("May 21st, 2008. A hedge fund manager named David Einhorn stands up at a New York "
                    "conference."),
         overlay=dict(big="MAY 2008", sub="EINHORN READ IT OUT LOUD, ON A STAGE")),

    dict(id="t077", level=None, template="closeUpPortrait",
         narration=("The talk is called Accounting Ingenuity. He goes through Lehman's own public filings, "
                    "line by line."),
         overlay=None,
         bubbles=[dict(text="The numbers do not add up.", x=0.3, y=0.18, tail="down", tailAt=0.55, at=4.4)]),

    dict(id="t078", level=None, template="boardroom",
         narration=("And says, politely, in front of a room full of investors, that the numbers do not add "
                    "up."),
         overlay=None),

    dict(id="t079", level=None, template="exchangeFloor",
         narration=("Lehman called him a short seller talking his own book, which is what he was."),
         overlay=None),

    dict(id="t080", level=None, template="closeUpPortrait", gap=1.4,
         narration=("Lehman was not wrong about that. It was wrong about the numbers."),
         overlay=None),

    # ---- MIDPOINT REVERSAL — the machine turns on its owner. Spent once. ----
    dict(id="t081", level=None, template="factoryFloor",
         narration=("Here is what the whole industry missed."),
         overlay=None),

    dict(id="t081b", level=None, template="domesticInterior",
         narration=("The machine that turned houses into money only ran in one direction."),
         overlay=None),

    dict(id="t082", level=None, template="chartBoard",
         narration=("When house prices fell, it ran backwards. At the same speed. With the same leverage."),
         overlay=None,
         card=dict(kind="narration", text="The machine only ever ran in one direction.")),

    dict(id="t083", level=None, template="crowdQueue",
         narration=("Thirty to one, pointed the other way."),
         overlay=None),

    dict(id="t083b", level=None, template="exchangeFloor",
         narration=("The same arithmetic that made the profits made the hole."),
         overlay=None),

    dict(id="t084", level=None, template="cityStreet",
         narration=("Every dollar of that leverage now belonged to somebody else. And they wanted it back."),
         overlay=None),

    dict(id="t085", level=None, template="officeFloor",
         narration=("A bank does not die when it runs out of value."),
         overlay=None,
         # §6.4 — one of the four splits that break `officeFloor`'s repeat impression (WO-26): the
         # room that holds the value beside the queue that wants the cash, which is the distinction
         # the next line turns on. `officeFloor` is `interior` and `crowdQueue` is `grey`, so the two
         # cells key apart without either naming a hex.
         panels=dict(variant="v2", cells=[dict(template="officeFloor"), dict(template="crowdQueue")])),

    dict(id="t085b", level=None, template="closeUpPortrait",
         narration=("It dies when it runs out of cash, and the two can be weeks apart."),
         overlay=None),

    # ================= CHAPTER 4 — The Weekend =================
    dict(id="t086", level="CH 4", template="bankExterior", breath=True,
         narration=("March 2008. Bear Stearns, the smallest of the big Wall Street banks, runs out of cash "
                    "in three days."),
         overlay=None,
         card=dict(kind="chapter", title="The Weekend", subtitle="Three Days at the New York Fed", hold=2.4)),

    dict(id="t087", level=None, template="broadcastDesk",
         narration=("JPMorgan buys it for two dollars a share, raised a week later to ten."),
         overlay=dict(big="$2", sub="A SHARE — BEAR STEARNS, MARCH 2008")),

    dict(id="t087b", level=None, template="boardroom",
         narration=("The Federal Reserve backstops the deal."),
         overlay=None),

    dict(id="t088", level=None, template="exchangeFloor",
         narration=("Wall Street read that rescue as a promise. It was not a promise."),
         overlay=None),

    dict(id="t088b", level=None, template="closeUpPortrait",
         narration=("It was one decision, taken under pressure, about a different bank."),
         overlay=None),

    dict(id="t089", level=None, template="boardroom",
         narration=("September 10th, 2008. Lehman pre-announces its third quarter. A loss of three point "
                    "nine billion dollars."),
         overlay=dict(big="$3.9B LOSS", sub="THE THIRD QUARTER, ANNOUNCED SEPT 10")),

    dict(id="t090", level=None, template="domesticInterior",
         narration=("And seven point eight billion of writedowns on property nobody wanted at any price."),
         overlay=None),

    dict(id="t091", level=None, template="newsMontage",
         narration=("The stock had been eighty-six dollars."),
         overlay=None),

    dict(id="t091b", level=None, template="chartBoard",
         narration=("It was now under eight, and falling every hour the market was open."),
         overlay=None),

    dict(id="t092", level=None, template="officeFloor",
         narration=("Fuld had spent the whole summer hunting a buyer at a price he was willing to accept."),
         overlay=None,
         foreground=dict(kind="overShoulder", side="left")),

    dict(id="t093", level=None, template="closeUpPortrait",
         narration=("There were no takers left."),
         overlay=None),

    dict(id="t094", level=None, template="bankExterior", breath=True,
         narration=("Friday, September 12th."),
         overlay=None),

    dict(id="t094b", level=None, template="crowdQueue",
         narration=("Paulson at the Treasury, Geithner at the New York Fed and Cox at the SEC summon the "
                    "chief executives of Wall Street."),
         overlay=None),

    dict(id="t095", level=None, template="boardroom",
         narration=("The instruction is blunt. Lehman is out of money."),
         overlay=None),

    dict(id="t095b", level=None, template="officeFloor",
         narration=("By Sunday night there is a buyer, or there is a bankruptcy."),
         overlay=None,
         dialogue=dict(text="There is no federal money in this one. Whatever you build, you build with your own.")),

    dict(id="t096", level=None, template="closeUpPortrait",
         narration=("And the government is not paying for it. Not this time."),
         overlay=None),

    dict(id="t097", level=None, template="crowdQueue",
         narration=("Saturday. The room builds a plan. The banks pool their own money into a bad bank."),
         overlay=None),

    dict(id="t098", level=None, template="factoryFloor",
         narration=("Take Lehman's worst property off its hands. Let a buyer have the clean half."),
         overlay=None),

    dict(id="t098b", level=None, template="cityStreet",
         narration=("It is the Bear Stearns rescue, without the Federal Reserve."),
         overlay=None),

    dict(id="t099", level=None, template="boardroom",
         narration=("Paulson looks at it and says the private sector has to put in far more than it has "
                    "offered."),
         overlay=None),

    dict(id="t100", level=None, template="chartBoard",
         narration=("Twenty-five, perhaps thirty billion dollars. Their own money. To rescue a competitor."),
         overlay=dict(big="$25-30B", sub="WHAT THE ROOM WAS ASKED TO PUT IN")),

    dict(id="t101", level=None, template="cityStreet",
         narration=("Then Bank of America walked."),
         overlay=None),

    dict(id="t101b", level=None, template="boardroom",
         narration=("It had been the likeliest buyer all week, and everyone in the room knew it."),
         overlay=None),

    dict(id="t102", level=None, template="bankExterior",
         narration=("On Saturday afternoon it left the table. By that evening it had bought Merrill Lynch "
                    "instead."),
         overlay=dict(big="$50 BILLION", sub="BANK OF AMERICA BOUGHT MERRILL INSTEAD")),

    dict(id="t103", level=None, template="newsMontage",
         narration=("Fifty billion dollars in stock."),
         overlay=None),

    dict(id="t103b", level=None, template="crowdQueue",
         narration=("One Wall Street firm was rescued that weekend. It was not Lehman."),
         overlay=None,
         card=dict(kind="narration", text="One firm was rescued that weekend. It was not Lehman.")),

    dict(id="t104", level=None, template="boardroom",
         narration=("That left Barclays."),
         overlay=None),

    dict(id="t104b", level=None, template="officeFloor",
         narration=("All day Sunday the British bank worked the deal, and all day Sunday it looked done."),
         overlay=None),

    dict(id="t105", level=None, template="closeUpPortrait",
         narration=("Then John Varley and Bob Diamond told the room the truth."),
         overlay=None,
         # `boardroom`'s window wall is PALE, so this float is set in BLACK (docs/BIBLE.md §8) — the
         # WO-13 build shipped the default white here and it was very nearly illegible.
         bubbles=[dict(kind="float", text="London will not approve it.", x=0.34, y=0.24, color="#000000", at=3.2)]),

    dict(id="t106", level=None, template="bankExterior",
         narration=("Their regulator in London would not approve it, and no amount of American pressure "
                    "changed that."),
         overlay=None),

    dict(id="t107", level=None, template="broadcastDesk",
         narration=("Britain was not going to let a British bank swallow an American one's losses."),
         overlay=None),

    dict(id="t108", level=None, template="cityStreet", breath=True,
         narration=("Sunday night, September 14th. There is no buyer. There is no federal money."),
         overlay=None),

    dict(id="t109", level=None, template="courtHearing",
         narration=("There are lawyers in a conference room drafting a bankruptcy filing for a company that "
                    "had been trading since before the Civil War."),
         overlay=None),

    dict(id="t110", level=None, template="crowdQueue",
         narration=("Inside the headquarters on Seventh Avenue, employees who had come in on a Sunday "
                    "watched the television to find out whether they still had jobs."),
         overlay=None),

    dict(id="t111", level=None, template="newsMontage",
         narration=("Every door had been tried. The Treasury. The Fed. Two buyers. A room full of rivals."),
         overlay=None),

    dict(id="t111b", level=None, template="boardroom",
         narration=("Every answer came back as one word."),
         overlay=None,
         card=dict(kind="word", word="No")),

    dict(id="t112", level=None, template="courtHearing",
         narration=("A quarter to two in the morning, September 15th, 2008. Lehman Brothers Holdings filed "
                    "for bankruptcy."),
         overlay=dict(big="$613 BILLION", sub="IN DEBT — FILED AT 1:45 A.M.")),

    dict(id="t113", level=None, template="closeUpPortrait",
         narration=("The firm that was never going to be small again had become the largest failure in "
                    "American history."),
         overlay=None),

    # ================= CHAPTER 5 — The Pavement =================
    dict(id="t114", level="CH 5", template="exchangeFloor", breath=True,
         narration=("Monday. The Dow closed down five hundred and four points. Four point four percent."),
         overlay=dict(big="504 POINTS", sub="THE DOW'S WORST DAY SINCE 9/11"),
         card=dict(kind="chapter", title="The Pavement", subtitle="What Monday Morning Cost", hold=2.4)),

    dict(id="t115", level=None, template="broadcastDesk",
         narration=("Its worst single day since the markets reopened after September 11th."),
         overlay=None),

    dict(id="t115b", level=None, template="chartBoard",
         narration=("And that was only the part with a number attached."),
         overlay=None),

    dict(id="t116", level=None, template="cityStreet",
         narration=("Outside the building on Seventh Avenue there were cameras."),
         overlay=None),

    dict(id="t116b", level=None, template="closeUpPortrait",
         narration=("And in front of the cameras, people in suits carrying cardboard boxes."),
         overlay=None),

    dict(id="t117", level=None, template="crowdQueue",
         narration=("That picture went around the world inside a day."),
         overlay=None),

    dict(id="t117b", level=None, template="broadcastDesk",
         narration=("It is still the image people mean when they say two thousand and eight."),
         overlay=None),

    dict(id="t118", level=None, template="newsMontage",
         narration=("Twenty-five thousand employees. Most of them found out from the news."),
         overlay=None),

    dict(id="t119", level=None, template="domesticInterior",
         narration=("What was inside the boxes was ordinary. Photographs. A mug."),
         overlay=None),

    dict(id="t119b", level=None, template="closeUpPortrait",
         narration=("A pair of running shoes. Somebody's kid's drawing."),
         overlay=None),

    dict(id="t120", level=None, template="factoryFloor",
         narration=("The people carrying them had not sliced a mortgage bond or signed off a Repo 105 "
                    "trade."),
         overlay=None),

    dict(id="t121", level=None, template="officeFloor",
         narration=("They had answered phones, fixed servers and filed things. The machine was built at the "
                    "top."),
         overlay=None,
         # §6.4 — the leaning gutter puts the desk that was emptied against the street it was
         # emptied onto. `officeFloor` is `interior`, `cityStreet` is `daylight`.
         panels=dict(variant="diagonal2", cells=[dict(template="officeFloor"), dict(template="cityStreet")])),

    dict(id="t122", level=None, template="crowdQueue",
         narration=("It was carried out of the door by everybody else."),
         overlay=None),

    dict(id="t123", level=None, template="chartBoard",
         narration=("The wreckage kept spreading outward."),
         overlay=None),

    dict(id="t123b", level=None, template="exchangeFloor",
         narration=("Money market funds broke, and the safest place in finance stopped being safe."),
         overlay=None),

    dict(id="t124", level=None, template="bankExterior",
         narration=("Credit froze worldwide, because no lender could tell which bank was next, or which one "
                    "was holding the wrong paper."),
         overlay=None),

    dict(id="t125", level=None, template="broadcastDesk",
         narration=("Within weeks the American government was doing for everybody else exactly what it had "
                    "just refused to do for Lehman."),
         overlay=None),

    dict(id="t126", level=None, template="courtHearing", breath=True,
         narration=("Two years later a court-appointed examiner named Anton Valukas published his report."),
         overlay=None),

    dict(id="t126b", level=None, template="officeFloor",
         narration=("Two thousand two hundred pages."),
         overlay=dict(big="2,200 PAGES", sub="THE VALUKAS REPORT, 2010")),

    dict(id="t127", level=None, template="newsMontage",
         narration=("It laid out Repo 105 in detail."),
         overlay=None),

    dict(id="t127b", level=None, template="boardroom",
         narration=("What it was. Who signed it. And what it was for."),
         overlay=None),

    dict(id="t128", level=None, template="crowdQueue",
         narration=("No Lehman executive went to prison. Not one."),
         overlay=None),

    dict(id="t129", level=None, template="courtHearing",
         narration=("Richard Fuld was asked in Congress what he had been paid."),
         overlay=None),

    dict(id="t129b", level=None, template="chartBoard",
         narration=("A congressman's chart said four hundred and eighty-five million dollars since 2000."),
         overlay=dict(big="$485M", sub="THE FIGURE FULD DISPUTED")),

    dict(id="t130", level=None, template="broadcastDesk",
         narration=("Fuld said the real figure was under three hundred and ten million. Read that argument "
                    "again."),
         overlay=None),

    dict(id="t131", level=None, template="boardroom",
         narration=("The disagreement was a hundred and seventy-five million dollars."),
         overlay=None),

    dict(id="t131b", level=None, template="closeUpPortrait",
         narration=("Both sides believed their own number was the reasonable one."),
         overlay=None),

    # ---- ENDING — reflection, complicit "we", callback to the opening image. No CTA. ----
    dict(id="t132", level=None, template="cityStreet", breath=True,
         narration=("Here is the part that should bother us. Nothing Lehman did that weekend was a secret."),
         overlay=None),

    dict(id="t133", level=None, template="newsMontage",
         narration=("The leverage was in the filings. The mortgages were in the newspapers."),
         overlay=None),

    dict(id="t133b", level=None, template="domesticInterior",
         narration=("None of it was hidden from anybody who wanted to look."),
         overlay=None),

    dict(id="t134", level=None, template="broadcastDesk",
         narration=("Einhorn read the whole thing out loud on a stage four months early."),
         overlay=None),

    dict(id="t135", level=None, template="crowdQueue",
         narration=("We had the numbers. We did not want them."),
         overlay=None,
         card=dict(kind="narration", text="We had the numbers. We did not want them.")),

    dict(id="t136", level=None, template="bankExterior",
         narration=("A bank that had outlived the Civil War and the Depression and 1987 was not supposed to "
                    "be capable of dying."),
         overlay=None),

    dict(id="t137", level=None, template="closeUpPortrait",
         narration=("And believing that was more comfortable than checking, which is the part that repeats."),
         overlay=None),

    dict(id="t138", level=None, template="domesticInterior", breath=True,
         narration=("Henry Lehman opened a shop where the customers had no money. Only cotton."),
         overlay=None),

    dict(id="t139", level=None, template="newsMontage",
         narration=("He took the cotton anyway, because he knew he could sell it on to somebody else."),
         overlay=None),

    dict(id="t140", level=None, template="exchangeFloor",
         narration=("A hundred and fifty-eight years later, his firm was still doing precisely that."),
         overlay=None),

    dict(id="t140b", level=None, template="crowdQueue",
         narration=("Taking the thing nobody could pay for. Selling it on."),
         overlay=None),

    dict(id="t141", level=None, template="factoryFloor",
         narration=("It worked every single time, right up until the Monday it did not."),
         overlay=None),
]

# Apply the measured narration rate to every scene. `gen_voice_edge.py` reads `sc.get("rate", RATE)`,
# so this is the writer-side field the pipeline already documents (docs/BIBLE.md §8) — nothing in
# gen_voice_edge.py is edited. A scene that wants its own prosody can still set `rate=` explicitly in
# its own dict above; setdefault leaves that alone.
for _s in SCENES:
    _s.setdefault("rate", NARRATION_RATE)
