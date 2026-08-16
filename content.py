#!/usr/bin/env python3
"""The Theranos Fraud Explained Like You're 5 — CRAYON-format explainer, ~16-17 min.

FORMAT: third-person past-tense explainer about a REAL subject (docs/BIBLE.md §1). Every date, figure
and quote is verified in docs/research/theranos.md with a source; anything unverifiable to that
standard is in that file's CUT list and is absent here. Register: straight and noirish, held
throughout (§2) — real patients received wrong cancer/HIV/pregnancy results, so a comic register would
read as callous, same reasoning as the Lehman episode.

STRUCTURAL VARIATION vs the last new-format episode (lehman_brothers, the only prior crayon-format
build): lehman opened DEATH-FIRST (the ending stated in sentence one) and closed on REFLECTION +
COMPLICIT "WE" + CALLBACK, no forward tease. This script opens with the classic five-step hook ending
on a THESIS naming the subject (the Wolf/Rockefeller shape, not the death-first shape), uses FOUR
chapters instead of five, and closes on the UNANSWERED-QUESTION + QUOTE shape (the Rockefeller shape)
rather than reflection-only — still complicit "we", still a callback to the opening image, but built
around a question the episode deliberately never answers.

CHAPTERS (§1, `Evocative Noun: Plain Explanation`, emitted as card=dict(kind="chapter", ...) and used
verbatim in the description timestamps):
  1 The Wunderkind   : A 19-Year-Old With a Big Idea       (28 chars)
  2 The Machine That Wasn't : How One Drop Became a Lie    (25 chars)
  3 The Wall          : Silencing Everyone Who Noticed     (30 chars)
  4 The Reckoning     : What the Verdict Actually Said     (30 chars)

PROMISE -> PAYOFF LEDGER:
  * Hook promise: "a blood machine that could barely run one test" -> mechanism PAID in Ch2
    (the real number: by one account 15 of 240+, by another just one — herpes).
  * MOTIF (factual through-line, replacing the old sensory anchor): ONE DROP OF BLOOD, promised to
    replace the whole of medicine. Planted in the hook and Ch1 -> re-triggered at the Ch2 mechanism
    reveal (what one drop actually became: a diluted sample on a borrowed machine) -> re-triggered at
    the Ch3 reversal (the WSJ headline is about that same drop) -> paid off in the closing hold, which
    inverts it: "it started with one drop of blood... in the end, all it told anyone was how much
    people wanted to believe."
  * EPITHET/CALLBACK: "the board that had no doctors on it" planted in Ch1 -> re-triggered structurally
    when Ch4 shows who actually caught the fraud (two junior employees and a reporter, not the board).
  * share-worthy beat #1: the company's own claim was 240+ tests; by one account only 15 ever ran on
    the real machine, by another account just one — a herpes test.
  * share-worthy beat #2: the whistleblower who forced the regulatory complaint was the board's own
    grandson.
  * share-worthy beat #3: Forbes valued her personal stake at $4.5 billion, then $0, without her
    changing anything about the company herself — only what became known about it.
  * MIDPOINT REVERSAL (§5, structural, "the moment the subject's own machine turns on them"): the WSJ
    story publishing, Oct 15 2015 — the moment the deception becomes public and can no longer be
    contained by lawyers. gap=1.4 on the scene immediately before it.

Numbers, sentence lengths and WPM are self-checked against docs/BIBLE.md §3 before build; see the
tail of this file for the narration-rate stamp.
"""

FPS = 30

NARRATION_RATE = "-5%"   # matches the current channel-wide retune (docs/BIBLE.md §3), unchanged here

SCENES = [
    # ================= HOOK — five steps, first ~30s =================
    dict(id="t001", level=None, template="cityStreet",
         narration=("She raised seven hundred million dollars for a blood machine that could barely "
                    "run one test."),
         overlay=None),

    dict(id="t001b", level=None, template="bankExterior",
         narration=("No white coat. No hospital badge. Just a girl in a black turtleneck."),
         overlay=None),

    dict(id="t002", level=None, template="chartBoard",
         narration=("Nine billion dollars, on paper."),
         overlay=dict(big="$9 BILLION", sub="HER COMPANY'S PEAK VALUE")),

    # §3a RHYTHM — hook step 2, escalating fragments, each shorter than the last.
    dict(id="t002b", level=None, template="crowdQueue",
         narration=("Blood tests for cancer. For HIV. For pregnancy. Wrong."),
         overlay=None),

    dict(id="t002c", level=None, template="officeFloor",
         narration=("Tens of thousands of results, voided."),
         overlay=None),

    dict(id="t002d", level=None, template="newsMontage",
         narration=("Two federal indictments."),
         overlay=None),

    dict(id="t003", level=None, template="boardroom",
         narration=("But investors never once watched the machine run. So for years, almost nobody "
                    "found out that it couldn't."),
         overlay=None,
         card=dict(kind="narration", text="Nobody outside the building\nwatched it work.")),

    dict(id="t004", level=None, template="exchangeFloor",
         narration=("This is the story of Elizabeth Holmes, the dropout who promised to fix medicine, "
                    "and faked the machine meant to do it."),
         overlay=None),

    dict(id="t004b", level=None, template="domesticInterior",
         narration=("It starts with a nineteen-year-old's idea for a patch. It ends with a verdict, "
                    "on the fourth floor of a federal courthouse."),
         overlay=None),

    # ================= CHAPTER 1 — The Wunderkind =================
    dict(id="t005", level="CH 1", template="cityStreet", breath=True,
         narration=("Stanford University, 2003. A sophomore named Elizabeth Holmes had an idea she "
                    "could not stop thinking about."),
         overlay=None,
         card=dict(kind="chapter", title="The Wunderkind", subtitle="A 19-Year-Old With a Big Idea", hold=2.4)),

    dict(id="t006", level=None, template="officeFloor",
         narration=("She dropped out that year. The company's first name was Real-Time Cures."),
         overlay=None),

    dict(id="t007", level=None, template="domesticInterior",
         narration=("Her idea: a patch that tested your blood and dosed out medicine, on its own."),
         overlay=None),

    dict(id="t008", level=None, template="closeUpPortrait",
         narration=("It never worked. So the idea changed."),
         overlay=None),

    dict(id="t009", level=None, template="chartBoard",
         narration=("What if one drop of blood could run hundreds of tests?"),
         overlay=None),

    dict(id="t010", level=None, template="crowdQueue",
         narration=("No needle. No lab. No waiting days for results."),
         overlay=None),

    dict(id="t011", level=None, template="officeFloor",
         narration=("She named the machine after Thomas Edison."),
         overlay=None,
         card=dict(kind="word", word="Edison")),

    dict(id="t012", level=None, template="boardroom",
         narration=("By 2004 she had half a million dollars, from a family friend named Tim Draper."),
         overlay=None),

    dict(id="t013", level=None, template="chartBoard",
         narration=("Then five million. Then nine. Then twenty-eight."),
         overlay=None),

    dict(id="t014", level=None, template="exchangeFloor",
         narration=("By 2010 one single investor put in forty-five million more."),
         overlay=None),

    dict(id="t015", level=None, template="newsMontage",
         narration=("The company had not shipped a product. It was already worth close to a billion "
                    "dollars."),
         overlay=None),

    dict(id="t016", level=None, template="boardroom", breath=True,
         narration=("In 2011 a former United States Secretary of State joined her board."),
         overlay=None),

    dict(id="t017", level=None, template="closeUpPortrait",
         narration=("He believed her. No question."),
         overlay=None),

    dict(id="t018", level=None, template="cityStreet",
         narration=("Over the next three years he brought in the rest."),
         overlay=None),

    # §3a RHYTHM — HOLD #1, ~12s. The reveal that the board had authority and pedigree, and nothing
    # medical at all.
    dict(id="t019", level=None, template="boardroom",
         narration=("The board built up around her medical device company had almost no doctors on "
                    "it. It had a former Secretary of State, a former Secretary of Defense, a "
                    "longtime U.S. Senator, and a four-star general. Not one of them had ever run a "
                    "lab."),
         overlay=None),

    dict(id="t020", level=None, template="chartBoard",
         narration=("The company called it 'The Board of Counselors.'"),
         overlay=None),

    dict(id="t021", level=None, template="bankExterior",
         narration=("Walgreens came next."),
         overlay=None),

    dict(id="t022", level=None, template="newsMontage",
         narration=("September 9th, 2013. A long-term deal, announced to the world."),
         overlay=None),

    dict(id="t023", level=None, template="officeFloor",
         narration=("The first Wellness Center opened inside a Walgreens in Palo Alto."),
         overlay=None),

    dict(id="t024", level=None, template="crowdQueue",
         narration=("If you needed blood work, you could walk in on a lunch break."),
         overlay=None,
         bubbles=[dict(text="Just one drop?", x=0.30, y=0.50, tail="right"),
                  dict(text="Just one drop.", x=0.70, y=0.30, tail="left", at=1.5)]),

    dict(id="t025", level=None, template="exchangeFloor",
         narration=("By the end of 2013, forty Wellness Centers were open."),
         overlay=None),

    dict(id="t026", level=None, template="chartBoard",
         narration=("Two hundred and forty different tests, if you believed the pitch, from one "
                    "finger stick."),
         overlay=dict(big="240+ TESTS", sub="THE PROMISE")),

    dict(id="t027", level=None, template="domesticInterior",
         narration=("Cancer markers. Cholesterol. Thyroid. Pregnancy. All from one drop."),
         overlay=None),

    dict(id="t028", level=None, template="exchangeFloor",
         narration=("Investors lined up."),
         overlay=None),

    dict(id="t029", level=None, template="boardroom",
         narration=("An investor asked how it worked."),
         overlay=None,
         bubbles=[dict(text="How does it actually work?", x=0.28, y=0.55, tail="right"),
                  dict(text="One drop. Any test. That's the whole company.", x=0.72, y=0.25, tail="left", at=2.0)]),

    dict(id="t030", level=None, template="closeUpPortrait",
         narration=("Nobody outside her closest circle ever saw the machine run on real blood."),
         overlay=None),

    dict(id="t031", level=None, template="chartBoard",
         narration=("February 2014. A hundred and ninety-eight million more. The company neared a nine "
                    "billion dollar price tag."),
         overlay=dict(big="$9 BILLION", sub="FEBRUARY 2014")),

    dict(id="t032", level=None, template="newsMontage",
         narration=("June 2014. Fortune put her on its cover."),
         overlay=None),

    dict(id="t033", level=None, template="broadcastDesk",
         narration=("The headline read: this CEO is out for blood."),
         overlay=None,
         card=dict(kind="narration", text="\"This CEO Is Out\nfor Blood.\"")),

    dict(id="t034", level=None, template="crowdQueue",
         narration=("The cover made her famous overnight."),
         overlay=None),

    dict(id="t035", level=None, template="closeUpPortrait",
         narration=("She wore black turtlenecks. She spoke in a voice pitched oddly low."),
         overlay=None),

    dict(id="t036", level=None, template="domesticInterior",
         narration=("People compared her to Steve Jobs. She encouraged the comparison."),
         overlay=None),

    dict(id="t037", level=None, template="chartBoard",
         narration=("By 2015 Forbes named her the youngest self-made female billionaire alive."),
         overlay=dict(big="$4.5 BILLION", sub="FORBES, 2015")),

    dict(id="t038", level=None, template="crowdQueue",
         narration=("She was nineteen when the company began. She was thirty when the world learned "
                    "her name."),
         overlay=None),

    dict(id="t039", level=None, template="factoryFloor",
         narration=("But none of it — the board, the cover, the nine billion dollars — was proof the "
                    "machine worked."),
         overlay=None),

    dict(id="t040", level=None, template="newsMontage",
         narration=("She told her workers the mission mattered more than money."),
         overlay=None),

    dict(id="t041", level=None, template="domesticInterior",
         narration=("She told them Theranos could save lives — theirs, and everyone else's."),
         overlay=None),

    dict(id="t042", level=None, template="closeUpPortrait", breath=True,
         narration=("Most of them believed her."),
         overlay=None),

    dict(id="t043", level=None, template="chartBoard",
         narration=("On the chart, the machine could do anything. On the factory floor, it could not."),
         overlay=None,
         panels=dict(variant="v2", cells=[dict(template="chartBoard"), dict(template="factoryFloor")])),

    # forward hook, end of chapter 1
    dict(id="t044", level=None, template="boardroom",
         narration=("But none of the statesmen on that board had ever watched the machine run on real "
                    "blood, in real time."),
         overlay=None),

    # ================= CHAPTER 2 — The Machine That Wasn't =================
    dict(id="t045", level="CH 2", template="factoryFloor", breath=True,
         narration=("The machine even had a name and a shape people trusted. What it did not have was "
                    "a working version of itself."),
         overlay=None,
         card=dict(kind="chapter", title="The Machine That Wasn't", subtitle="How One Drop Became a Lie", hold=2.4)),

    dict(id="t046", level=None, template="chartBoard",
         narration=("The company said Edison could run over two hundred and forty different tests."),
         overlay=None),

    dict(id="t047", level=None, template="newsMontage", breath=True,
         narration=("In truth, by one account, the number was fifteen. By another, it was one."),
         overlay=None),

    dict(id="t048", level=None, template="closeUpPortrait",
         narration=("One test. Herpes."),
         overlay=None),

    dict(id="t048b", level=None, template="bankExterior",
         narration=("The company disputed that number for years."),
         overlay=None),

    dict(id="t049", level=None, template="boardroom",
         narration=("So how did two hundred and thirty-nine other tests get run at all?"),
         overlay=None),

    dict(id="t050", level=None, template="factoryFloor",
         narration=("Not on Edison. On ordinary machines, built by Siemens."),
         overlay=None),

    dict(id="t051", level=None, template="domesticInterior",
         narration=("Machines built for a full vial of blood from your arm."),
         overlay=None),

    dict(id="t052", level=None, template="crowdQueue",
         narration=("Theranos was collecting a few drops from a finger."),
         overlay=None),

    dict(id="t053", level=None, template="chartBoard",
         narration=("So the drops were diluted, stretched, to fill the machine's need."),
         overlay=None),

    # §3a RHYTHM — HOLD #2, mechanism definition, ~12-13s.
    dict(id="t054", level=None, template="officeFloor",
         narration=("Dilution is simple, and it is a problem. Water down a sample, and every substance "
                    "in it reads lower than it actually is. A hormone level, a cholesterol count, a "
                    "cancer marker — thinned out, and reported as real."),
         overlay=None),

    dict(id="t055", level=None, template="bankExterior",
         narration=("This was never disclosed to Walgreens, or to investors."),
         overlay=None),

    dict(id="t056", level=None, template="courtHearing",
         narration=("It was disclosed to one place only: the FDA."),
         overlay=None),

    dict(id="t057", level=None, template="closeUpPortrait",
         narration=("The company called the modification a trade secret."),
         overlay=None),

    dict(id="t058", level=None, template="newsMontage",
         narration=("Worth protecting, they said, from competitors who might steal it."),
         overlay=None),

    dict(id="t059", level=None, template="chartBoard",
         narration=("On paper: one revolutionary machine. In the lab: a room of borrowed machines, "
                    "relabeled."),
         overlay=None,
         panels=dict(variant="v2", cells=[dict(template="chartBoard"), dict(template="officeFloor")])),

    dict(id="t060", level=None, template="domesticInterior",
         narration=("Two hundred and thirty-nine tests' worth of doubt."),
         overlay=None),

    dict(id="t061", level=None, template="officeFloor",
         narration=("One lab worker raised it with her manager."),
         overlay=None,
         bubbles=[dict(text="These results don't look right.", x=0.28, y=0.55, tail="right"),
                  dict(text="Then don't run them again.", x=0.72, y=0.25, tail="left", at=2.0)]),

    dict(id="t062", level=None, template="closeUpPortrait",
         narration=("She quit within six months."),
         overlay=None),

    dict(id="t063", level=None, template="crowdQueue",
         narration=("Her name was Erika Cheung."),
         overlay=None),

    dict(id="t064", level=None, template="boardroom",
         narration=("She told the one board member she trusted most."),
         overlay=None,
         foreground=dict(kind="overShoulder", side="left")),

    dict(id="t065", level=None, template="domesticInterior",
         narration=("He did not act on it."),
         overlay=None),

    dict(id="t066", level=None, template="newsMontage",
         narration=("So she went further: a letter to federal watchdogs, under a lawyer's advice."),
         overlay=None),

    dict(id="t067", level=None, template="closeUpPortrait",
         narration=("That letter mattered more than anyone in the building knew."),
         overlay=None),

    dict(id="t068", level=None, template="cityStreet",
         narration=("There was a second name inside that same house."),
         overlay=None),

    dict(id="t069", level=None, template="domesticInterior",
         narration=("Tyler Shultz — the statesman's own grandson — worked there too."),
         overlay=None),

    dict(id="t070", level=None, template="officeFloor",
         narration=("He noticed the company was throwing out lab results that made Edison look bad."),
         overlay=None),

    dict(id="t071", level=None, template="boardroom",
         narration=("He wrote his grandfather a memo about it."),
         overlay=None,
         bubbles=[dict(kind="float", text="Why are we hiding failed runs?", x=0.30, y=0.22)]),

    dict(id="t072", level=None, template="closeUpPortrait",
         narration=("His grandfather sided with the company."),
         overlay=None),

    dict(id="t073", level=None, template="domesticInterior",
         narration=("His grandfather said one thing."),
         overlay=None,
         dialogue=dict(text="She's family, Tyler.")),

    dict(id="t073b", level=None, template="closeUpPortrait",
         narration=("Tyler said another."),
         overlay=None,
         dialogue=dict(text="The blood in those tubes isn't.")),

    dict(id="t074", level=None, template="newsMontage",
         narration=("Theranos sent lawyers after him too."),
         overlay=None),

    dict(id="t075", level=None, template="cityStreet",
         narration=("Private eyes followed him for months."),
         overlay=None),

    dict(id="t076", level=None, template="boardroom",
         narration=("Two young workers — one in the lab, and a board member's own grandson — had "
                    "said the same thing, on their own, and neither one was believed."),
         overlay=None),

    dict(id="t077", level=None, template="newsMontage",
         narration=("But two people outside Theranos were about to hear about that wall too."),
         overlay=None),

    dict(id="t078", level=None, template="cityStreet",
         narration=("One was a journalist. The other was a lawyer with an old grudge."),
         overlay=None),

    dict(id="t079", level=None, template="courtHearing",
         narration=("Richard Fuisz had sued Theranos once. Theranos had sued back."),
         overlay=None),

    dict(id="t080", level=None, template="closeUpPortrait",
         narration=("He knew people. And he talked."),
         overlay=None),

    dict(id="t081", level=None, template="broadcastDesk",
         narration=("The journalist's name was John Carreyrou, at the Wall Street Journal."),
         overlay=None),

    dict(id="t082", level=None, template="officeFloor", breath=True,
         narration=("He started making calls in 2015."),
         overlay=None),

    # ================= CHAPTER 3 — The Wall =================
    dict(id="t083", level="CH 3", template="cityStreet", breath=True,
         narration=("Theranos had a wall built from lawyers, not brick. It was about to be tested."),
         overlay=None,
         card=dict(kind="chapter", title="The Wall", subtitle="Silencing Everyone Who Noticed", hold=2.4)),

    dict(id="t084", level=None, template="boardroom",
         narration=("Theranos hired one of the toughest law firms in the country."),
         overlay=None),

    dict(id="t085", level=None, template="newsMontage",
         narration=("Its lawyers sent threatening letters to almost anyone who talked."),
         overlay=None),

    dict(id="t086", level=None, template="officeFloor",
         narration=("Workers signed papers agreeing to stay silent, before their first day."),
         overlay=None),

    dict(id="t087", level=None, template="crowdQueue",
         narration=("Some were followed. Some were served with lawsuits."),
         overlay=None),

    dict(id="t088", level=None, template="closeUpPortrait",
         narration=("The letters kept coming."),
         overlay=None),

    dict(id="t089", level=None, template="newsMontage",
         narration=("So did the lawsuits."),
         overlay=None),

    dict(id="t090", level=None, template="domesticInterior", breath=True,
         narration=("The company's own lab director had the same worry."),
         overlay=None),

    dict(id="t091", level=None, template="closeUpPortrait",
         narration=("He told his bosses the results weren't ready for real patients."),
         overlay=None),

    dict(id="t092", level=None, template="bankExterior",
         narration=("Nobody fixed it -- and the product was already on Walgreens' shelves."),
         overlay=None),

    dict(id="t093", level=None, template="courtHearing",
         narration=("By late 2014, doctors were calling in with complaints of their own."),
         overlay=None),

    dict(id="t094", level=None, template="officeFloor",
         narration=("Doctors said some of the results made no clinical sense."),
         overlay=None,
         foreground=dict(kind="overShoulder", side="left")),

    dict(id="t095", level=None, template="closeUpPortrait",
         narration=("The lab director quit for good in late 2014."),
         overlay=None),

    dict(id="t096", level=None, template="newsMontage",
         narration=("He became a name in someone else's notebook."),
         overlay=None),

    dict(id="t097", level=None, template="broadcastDesk",
         narration=("That someone was the same reporter, working the story from the outside."),
         overlay=None),

    dict(id="t098", level=None, template="officeFloor",
         narration=("He started calling former workers, one by one."),
         overlay=None),

    dict(id="t099", level=None, template="crowdQueue",
         narration=("Some hung up. Some talked anyway."),
         overlay=None),

    dict(id="t100", level=None, template="boardroom",
         narration=("Theranos found out he was calling."),
         overlay=None),

    dict(id="t101", level=None, template="closeUpPortrait",
         narration=("So did its lawyers."),
         overlay=None),

    dict(id="t102", level=None, template="newsMontage",
         narration=("They wrote to the Wall Street Journal directly, and to his sources."),
         overlay=None),

    dict(id="t103", level=None, template="domesticInterior",
         narration=("One source held anyway."),
         overlay=None),

    dict(id="t104", level=None, template="cityStreet",
         narration=("The lab director agreed to go on the record."),
         overlay=None),

    dict(id="t105", level=None, template="officeFloor",
         narration=("For months, Theranos tried to kill the story before it ran — legal letters, "
                    "threats of a defamation suit, a direct appeal to the paper's owner. None of it "
                    "worked. The story was true, and the paper knew it."),
         overlay=None),

    # §3a RHYTHM — the quiet beat immediately before the reversal. gap=1.4 drops the mix to near-silence.
    dict(id="t106", level=None, template="domesticInterior",
         narration=("Nobody at Theranos could stop what happened next."),
         overlay=None,
         gap=1.4),

    # §3a RHYTHM — MIDPOINT REVERSAL, the longest hold in the first half of the episode (~14s).
    dict(id="t107", level=None, template="newsMontage",
         narration=("October 15th, 2015. The Wall Street Journal published its story: 'Hot Startup "
                    "Theranos Has Struggled With Its Blood-Test Technology.' Inside the company that "
                    "had told the world it could do anything, one former worker said the truth was "
                    "closer to nothing at all."),
         overlay=None),

    dict(id="t108", level=None, template="broadcastDesk",
         narration=("One headline. And nothing was ever the same again."),
         overlay=None),

    dict(id="t109", level=None, template="exchangeFloor",
         narration=("Investors started asking questions they should have asked years earlier."),
         overlay=None),

    dict(id="t110", level=None, template="bankExterior",
         narration=("Walgreens quietly paused the rollout."),
         overlay=None),

    dict(id="t111", level=None, template="crowdQueue",
         narration=("We had the whistleblowers. Almost nobody had listened."),
         overlay=None,
         card=dict(kind="narration", text="We had the whistleblowers.\nAlmost nobody had listened.")),

    dict(id="t112", level=None, template="officeFloor",
         narration=("The story kept going. More workers called the reporter after it ran, not before."),
         overlay=None),

    dict(id="t113", level=None, template="newsMontage",
         narration=("His book came out in 2018. Its title: Bad Blood."),
         overlay=dict(big="BAD BLOOD", sub="JOHN CARREYROU, 2018")),

    dict(id="t114", level=None, template="boardroom",
         narration=("Watchdogs read the story too."),
         overlay=None,
         foreground=dict(kind="overShoulder", side="right")),

    dict(id="t115", level=None, template="courtHearing",
         narration=("Within months, federal inspectors were inside the lab."),
         overlay=None),

    dict(id="t116", level=None, template="closeUpPortrait",
         narration=("They found the same thing the whistleblowers had said all along."),
         overlay=None),

    dict(id="t117", level=None, template="boardroom",
         narration=("Walgreens finally asked the question it should have asked in 2013."),
         overlay=None,
         bubbles=[dict(text="Is the technology validated?", x=0.28, y=0.55, tail="right"),
                  dict(text="We can't confirm that anymore.", x=0.72, y=0.25, tail="left", at=2.0)]),

    dict(id="t118", level=None, template="bankExterior",
         narration=("By 2016, the deal was dead."),
         overlay=None),

    dict(id="t119", level=None, template="crowdQueue",
         narration=("So, in time, were the Wellness Centers."),
         overlay=None),

    dict(id="t120", level=None, template="officeFloor",
         narration=("What was left: a filing cabinet of denials, and a hard drive of code that mostly "
                    "worked on paper."),
         overlay=None,
         card=dict(kind="objects", items=["laptop", "filingCabinet"])),

    dict(id="t121", level=None, template="domesticInterior", breath=True,
         narration=("The machine that was supposed to fix medicine had not fixed anything."),
         overlay=None),

    # forward hook, end of chapter 3
    dict(id="t122", level=None, template="newsMontage",
         narration=("But a published story is not a punishment. Punishment was still four years "
                    "away."),
         overlay=None),

    # ================= CHAPTER 4 — The Reckoning =================
    dict(id="t123", level="CH 4", template="courtHearing", breath=True,
         narration=("The wall came down in pieces, over seven years, in rooms with very different "
                    "kinds of authority."),
         overlay=None,
         card=dict(kind="chapter", title="The Reckoning", subtitle="What the Verdict Actually Said", hold=2.4)),

    dict(id="t124", level=None, template="newsMontage",
         narration=("First came the health watchdogs."),
         overlay=None),

    dict(id="t125", level=None, template="officeFloor",
         narration=("2016. Federal inspectors revoked Theranos's license to run a clinical lab."),
         overlay=dict(big="2016", sub="CLIA LICENSE REVOKED")),

    dict(id="t126", level=None, template="domesticInterior",
         narration=("Holmes was banned from owning or running a lab, for two years."),
         overlay=None),

    dict(id="t127", level=None, template="chartBoard",
         narration=("Forbes had put her net worth at four and a half billion dollars."),
         overlay=None),

    dict(id="t128", level=None, template="closeUpPortrait",
         narration=("Now Forbes put a new number on her."),
         overlay=None),

    dict(id="t129", level=None, template="crowdQueue",
         narration=("Zero. Not a discount, not a downgrade — zero. The company was still selling a "
                    "nine billion dollar story on paper that was, by then, worth close to nothing."),
         overlay=dict(big="$0", sub="FORBES' NEW ESTIMATE, JUNE 2016")),

    dict(id="t130", level=None, template="exchangeFloor",
         narration=("Then came the money watchdogs."),
         overlay=None),

    dict(id="t131", level=None, template="boardroom", breath=True,
         narration=("March 14th, 2018. The Securities and Exchange Commission charged Theranos, "
                    "Holmes, and her former president with massive fraud."),
         overlay=dict(big="MARCH 2018", sub="SEC FRAUD CHARGES")),

    dict(id="t132", level=None, template="chartBoard",
         narration=("The number the SEC used was blunt: more than seven hundred million dollars "
                    "raised on false claims."),
         overlay=dict(big="$700M+", sub="RAISED THROUGH FALSE CLAIMS")),

    dict(id="t133", level=None, template="courtHearing",
         narration=("Holmes settled. No admission of guilt. A five hundred thousand dollar fine."),
         overlay=None),

    dict(id="t134", level=None, template="closeUpPortrait",
         narration=("Barred from running a public company for ten years."),
         overlay=None),

    dict(id="t135", level=None, template="domesticInterior",
         narration=("She gave back voting control of the company. Gave back millions of shares."),
         overlay=None),

    dict(id="t136", level=None, template="newsMontage",
         narration=("But that was a civil case. A criminal one was already forming."),
         overlay=None),

    dict(id="t137", level=None, template="officeFloor",
         narration=("June 2018. A federal grand jury indicted her on eleven counts of fraud."),
         overlay=dict(big="11 COUNTS", sub="FEDERAL INDICTMENT, JUNE 2018")),

    dict(id="t138", level=None, template="boardroom",
         narration=("She stepped down as CEO the same day."),
         overlay=None),

    dict(id="t139", level=None, template="closeUpPortrait",
         narration=("Her former president and boyfriend, Sunny Balwani, was indicted alongside her."),
         overlay=None),

    dict(id="t140", level=None, template="bankExterior",
         narration=("September 2018. Theranos ran out of cash, and out of time."),
         overlay=None),

    dict(id="t141", level=None, template="broadcastDesk",
         narration=("The company's own lawyer put it in four words to shareholders."),
         overlay=None,
         card=dict(kind="narration", text="\"We are now\nout of time.\"")),

    dict(id="t142", level=None, template="crowdQueue",
         narration=("Theranos dissolved. Nine billion dollars, gone."),
         overlay=None,
         card=dict(kind="word", word="Gone")),

    dict(id="t143", level=None, template="chartBoard",
         narration=("Same company, same machine, same lies — so why did the two trials end so "
                    "differently?"),
         overlay=None),

    dict(id="t144", level=None, template="courtHearing",
         narration=("The criminal case took three more years to reach a jury."),
         overlay=None),

    dict(id="t145", level=None, template="cityStreet",
         narration=("August 2021. Her trial began in a federal courthouse in San Jose."),
         overlay=None),

    dict(id="t146", level=None, template="domesticInterior",
         narration=("Her lawyers argued something surprising: that Balwani had controlled her."),
         overlay=None),

    dict(id="t147", level=None, template="closeUpPortrait",
         narration=("That he was emotionally abusive, and that it explained her decisions."),
         overlay=None),

    dict(id="t148", level=None, template="newsMontage",
         narration=("Balwani's lawyers rejected every part of that story."),
         overlay=None),

    dict(id="t149", level=None, template="domesticInterior",
         narration=("Nine billion dollars, and eleven years, are not the same kind of number."),
         overlay=None),

    dict(id="t150", level=None, template="courtHearing",
         narration=("For eleven weeks, the jury heard about diluted blood, deleted files, and a "
                    "company built to look finished before it was."),
         overlay=None,
         foreground=dict(kind="overShoulder", side="left")),

    dict(id="t151", level=None, template="officeFloor",
         narration=("January 3rd, 2022. The jury came back."),
         overlay=dict(big="JAN 3, 2022", sub="THE VERDICT")),

    # §3a RHYTHM — HOLD #3, the verdict itself, ~13s.
    dict(id="t152", level=None, template="boardroom",
         narration=("Four counts, guilty — all of them about lying to investors. Four counts, not "
                    "guilty — all of them about the patients. Three counts, no verdict at all. The "
                    "jury had split the case exactly along the line between money and blood."),
         overlay=None),

    dict(id="t153", level=None, template="closeUpPortrait",
         narration=("On the investors, guilty."),
         overlay=None,
         card=dict(kind="word", word="Guilty")),

    dict(id="t154", level=None, template="domesticInterior",
         narration=("On the patients, not guilty."),
         overlay=None,
         card=dict(kind="word", word="Not guilty")),

    dict(id="t155", level=None, template="crowdQueue",
         narration=("The line the jury drew ran through the whole case."),
         overlay=None),

    dict(id="t156", level=None, template="chartBoard",
         narration=("Investors could show a loss, in dollars. Try pricing a wrong test result, if "
                    "you can."),
         overlay=None),

    dict(id="t157", level=None, template="exchangeFloor",
         narration=("July 2022. Balwani's own trial ended differently."),
         overlay=None),

    dict(id="t158", level=None, template="broadcastDesk",
         narration=("Guilty. All twelve counts."),
         overlay=None),

    dict(id="t159", level=None, template="newsMontage",
         narration=("No split verdict for him."),
         overlay=None),

    dict(id="t160", level=None, template="courtHearing", breath=True,
         narration=("November 18th, 2022. Holmes was sentenced."),
         overlay=dict(big="NOV 18, 2022", sub="SENTENCING")),

    dict(id="t161", level=None, template="domesticInterior",
         narration=("Eleven years and three months. At sentencing she said, 'I am devastated by my "
                    "failings. I have felt deep pain for what people went through because I failed "
                    "them.'"),
         overlay=None),

    dict(id="t162", level=None, template="officeFloor",
         narration=("A month later, Balwani was sentenced too."),
         overlay=None),

    dict(id="t163", level=None, template="boardroom",
         narration=("Twelve years and eleven months. Longer than hers — for the same company, the "
                    "same machine, the same lies."),
         overlay=dict(big="~13 YEARS", sub="BALWANI'S SENTENCE")),

    dict(id="t164", level=None, template="cityStreet",
         narration=("May 30th, 2023. Holmes reported to a federal prison in Texas."),
         overlay=dict(big="MAY 2023", sub="HOLMES REPORTS TO PRISON")),

    dict(id="t165", level=None, template="closeUpPortrait",
         narration=("Not a boardroom. A prison camp."),
         overlay=None),

    dict(id="t166", level=None, template="bankExterior",
         narration=("She is scheduled for release in the 2030s."),
         overlay=None),

    dict(id="t167", level=None, template="officeFloor",
         narration=("What's left of the company: patents in a drawer, and a name nobody licenses "
                    "anymore."),
         overlay=None,
         card=dict(kind="objects", items=["safe", "filingCabinet"])),

    dict(id="t168", level=None, template="newsMontage",
         narration=("Two lab workers, one reporter, and a grandson who chose the blood over the family "
                    "name — that is who actually stopped it."),
         overlay=None,
         panels=dict(variant="grid4", cells=[dict(template="officeFloor"), dict(template="domesticInterior"),
                                             dict(template="courtHearing"), dict(template="newsMontage")])),

    dict(id="t169", level=None, template="crowdQueue",
         narration=("Not the watchdogs. Not the investors who lost the money."),
         overlay=None),

    dict(id="t170", level=None, template="closeUpPortrait", breath=True,
         narration=("The system built to catch this took seven years. The people who tried to stop it "
                    "took about eighteen months."),
         overlay=None),

    # ---- ENDING — unanswered question + quote, complicit "we", callback to the opening image ----
    dict(id="t171", level=None, template="domesticInterior",
         narration=("Here is the question nobody can actually answer: did she ever believe the machine "
                    "would work?"),
         overlay=None),

    dict(id="t172", level=None, template="closeUpPortrait",
         narration=("Or did she know, and decide the story was worth telling anyway?"),
         overlay=None),

    dict(id="t173", level=None, template="exchangeFloor",
         narration=("She never ran the machine for us, either."),
         overlay=None),

    dict(id="t174", level=None, template="cityStreet",
         narration=("We will probably never know for certain."),
         overlay=None),

    dict(id="t175", level=None, template="newsMontage",
         narration=("We wanted the fairy tale. She gave us one."),
         overlay=None),

    # §3a RHYTHM — HOLD, ~13s, the quote.
    dict(id="t176", level=None, template="bankExterior",
         narration=("What we do know is this. At her sentencing, she said, 'I am devastated by my "
                    "failings.' Nobody ever asked the machine how it felt about that. It never worked "
                    "long enough to answer."),
         overlay=None),

    # §3a RHYTHM — LAST SHOT, the longest hold, callback to the opening image (t001's cityStreet, and
    # the motif of the one drop of blood).
    dict(id="t177", level=None, template="cityStreet", breath=True,
         narration=("It started with one drop of blood, and a promise that it could tell you "
                    "everything. In the end, all it told anyone was how much people wanted to "
                    "believe."),
         overlay=None),
]

# Apply the measured narration rate to every scene. `gen_voice_edge.py` reads `sc.get("rate", RATE)`,
# so this is the writer-side field the pipeline already documents (docs/BIBLE.md §8) — nothing in
# gen_voice_edge.py is edited. A scene that wants its own prosody can still set `rate=` explicitly in
# its own dict above; setdefault leaves that alone.
for _s in SCENES:
    _s.setdefault("rate", NARRATION_RATE)
