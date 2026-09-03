#!/usr/bin/env python3
"""The Volkswagen Emissions Scandal Explained Like You're 5 — CRAYON-format explainer, ~15-17 min.

FORMAT: third-person past-tense explainer about a REAL subject (docs/BIBLE.md §1). Every date, figure
and quote is verified in docs/research/volkswagen_dieselgate.md; anything unverifiable to that standard
is absent here. Register: straight, dry, occasionally wry about the irony of "Clean Diesel" as a
marketing phrase — a corporate-fraud story with real prosecutions, closer to the reference's Enron
register than to a zany systemic-crisis one. Held throughout; no jokes at any named person's expense.

STRUCTURAL VARIATION vs the last two PRODUCED crayon-format episodes (madoff, theranos): madoff used
the classic thesis hook and closed on REFLECTION + COMPLICIT "WE" + QUOTE CALLBACK + a FORWARD TEASE.
theranos closed on an UNANSWERED QUESTION + QUOTE. This script opens on the classic five-step thesis
hook (naming the company, not a question-thesis, since a company still has a clean origin point — the
2009 on-sale date), and closes on REFLECTION + COMPLICIT "WE" + QUOTE CALLBACK with NO forward tease and
NO unanswered question — the one combination neither of the last two produced episodes used. Five
chapters, shaped promise -> mechanism -> discovery -> reckoning -> verdicts, distinct from madoff's
"a whistleblower had to go looking" shape — here the subject's OWN cars, tested on an ordinary road,
are what betray it.

factoryFloor is NOT used anywhere in this script. ops/improvements.json
(factoryfloor-machine-shade-fractional-seed-bug, high impact, confirmed on the wework 09-01 build) shows
it HALTs any real render via a shade()-on-fractional-seed crash in src/explainer.tsx's shared `Machine`
component. That fix is out of writer scope, so the "inside the engine" beats use chartBoard diagrams and
officeFloor/cityStreet instead of a literal assembly line.

MOTIF: two through-lines. THE STEERING WHEEL — planted end of Ch1 as "a setting no driver would ever
see," defined plainly in Ch2 with the sensor that could tell a lab bench from a real road, and paid off
in Ch3 when three ordinary road trips do what a decade of lab tests never could. "CLEAN DIESEL" — the
marketing phrase, planted as the sales pitch in Ch1, echoed ironically by the EPA's own words in Ch4
("a threat to public health"), and closed on in the final reflection.

PROMISE -> PAYOFF LEDGER:
  * Hook promise: eleven million cars broke emissions law and passed every official test -> the
    mechanism explained plainly in Ch2 (the steering-wheel trick) -> tested at the MIDPOINT REVERSAL
    (Ch3) when a nonprofit-funded road test does what the lab never could.
  * "Clean Diesel" epithet planted Ch1 (the marketing name) -> undercut Ch4 by EPA enforcement chief
    Cynthia Giles's own words about the same cars being "a threat to public health."
  * "A setting no driver would ever see" (end of Ch1) -> the steering-wheel defeat device, defined Ch2,
    is that setting.
  * The $69,000 WVU/ICCT grant planted Ch3 -> paid off at the close against the ~$34.7 billion the
    scandal ultimately cost Volkswagen worldwide.
  * Michael Horn's "we have totally screwed up" (Ch4) and Martin Winterkorn's resignation statement
    that he was "not aware of any wrongdoing" (Ch4) -> both echoed in the closing reflection.
  * James Liang, Oliver Schmidt and Rupert Stadler's guilty pleas planted Ch4 -> their sentences pay
    off directly in Ch5, including the comparative reflection that Schmidt's term outran Liang's.
  * Winterkorn's 2018 indictment planted Ch4 -> paid off in Ch5 not with a verdict (none exists in the
    record) but with the dated fact that his own trial did not even begin until nine years later, and
    was then suspended — the episode's deliberate unresolved thread, stated only as dated history, never
    as an ongoing present-tense claim (per R1).
  * The BMW used as the WVU study's "control" car, planted Ch3, pays off in Ch3 itself (it passed
    clean) as the contrast that made the two Volkswagens' numbers impossible to explain away.
  * The 482,000-car September notice, planted Ch4, is widened by the November add-on of 3.0-liter
    six-cylinder cars to the DOJ's final "590,000" figure, paid off in Ch4.
  * The portable rig built for a car trunk, planted Ch3, is echoed at the close of Ch5/opening of the
    ending as the "trunk full of hoses" that did what regulators' own labs never did.

Per docs/BIBLE.md §6 and the wework 09-01 precedent (dialogue-budget-vs-bible-cost-caveat-reconciled):
every named person in this story is alive or recently so, so every `dialogue=`/`bubbles=` line that
carries a real name's words is a verbatim, sourced quotation from docs/research/volkswagen_dieselgate.md
with its speaker and occasion; the few dialogue= exchanges that are NOT sourced quotations are anonymous
in-world reactions (a dealership pitch, a customer, an engineer) with no real name attached, per the
same precedent.

Numbers, sentence lengths and WPM are self-checked against docs/BIBLE.md §3 before build; vocabulary is
kept short (Anglo-Saxon over Latinate: "firm"/"company" over "corporation", "watchdogs"/"regulators"
kept minimal, "the government"/"lawyers" over "prosecutors", "took the stand"/"said" over "testified",
"backup" avoided, "shut down" over "ceased operations", "help" over "cooperate") to hit the
syllables-per-word band the WPM gate requires — checked with scripts/wpm_predict.py before build.
"""

FPS = 30

NARRATION_RATE = "-5%"   # matches the current channel-wide retune (docs/BIBLE.md §3)

SCENES = [
    dict(id='t001', level=None, overlay=None, template='closeUpPortrait',
         narration='Eleven million cars, built by one firm, were breaking the law each time they started.'),

    dict(id='t002', level=None, overlay=None, template='chartBoard', chart='down',
         narration='Not by a little. Up to forty times the legal limit. For years, watchdogs tested them. Every test, they passed.'),

    dict(id='t003', level=None, overlay=None, template='broadcastDesk',
         narration='Because the engine always knew when it was being watched. It only cheated when none could see.'),

    dict(id='t004', level=None, overlay=None, template='cityStreet', breath=True,
         narration='This is the story of Volkswagen, which sold the world clean diesel, and built a machine to lie about it. No hacker broke in. No rival wrecked it.'),

    dict(id='t005', level=None, overlay=None, template='boardroom',
         narration='The firm built the lie, on purpose, and signed off on it.'),

    dict(id='t006', level=None, overlay=None, template='newsMontage',
         narration='Germany, two thousand nine. The new diesel engines went on sale.'),

    dict(id='t007', level='CH 1', overlay=None, template='officeFloor', breath=True, card={'kind': 'chapter', 'title': 'The Clean Lie', 'subtitle': 'How Volkswagen Sold Diesel as Green', 'hold': 2.4},
         narration='A diesel engine burns fuel another way than a gas one. It gets more miles from each gallon.'),

    dict(id='t008', level=None, overlay=None, template='boardroom',
         narration='But burning fuel that way also makes more nitrogen oxide. A gas that helps make smog.'),

    dict(id='t009', level=None, overlay=None, template='cityStreet',
         narration='And smog makes it harder to breathe. Volkswagen still wanted to sell diesel in America.'),

    dict(id='t010', level=None, overlay=None, template='newsMontage', chart='flat',
         narration="America's smog rules were tighter than Europe's, by a wide margin."),

    dict(id='t011', level=None, overlay=None, template='officeFloor',
         narration='A truly clean diesel, tuned to really meet them, ran another way. Rough. Slow. Burned through fuel fast. None wanted to buy that.'),

    dict(id='t012', level=None, overlay=None, template='domesticInterior',
         narration='It sounded too easy to be true, because it was.'),

    dict(id='t013', level=None, overlay=None, template='newsMontage',
         narration='So its team gave the cars a friendlier name instead.'),

    dict(id='t014', level=None, overlay=None, template='officeFloor', card={'kind': 'word', 'word': 'Clean.'},
         narration='Clean Diesel. TDI, they called it. Turbocharged. Direct injection. Fast. Efficient. Clean, or so the ads said.'),

    dict(id='t015', level=None, overlay=None, template='domesticInterior', foreground={'kind': 'overShoulder', 'side': 'left'},
         narration='Dealers across the country pushed the pitch hard.'),

    dict(id='t016', level=None, overlay=None, template='cityStreet', bubbles=[{'text': "Diesel? Isn't that the smelly, dirty stuff?", 'speaker': 'left'}, {'text': 'Not anymore. Same power, better mileage, clean.', 'speaker': 'right', 'at': 1.8}], dialogue={'text': 'Not anymore. Same power, better mileage, clean.'},
         narration='A buyer on a lot heard a version of the same line, over and over.'),

    dict(id='t017', level=None, overlay=None, template='exchangeFloor',
         narration='By 2015, eleven million of these cars sat on roads worldwide.'),

    dict(id='t018', level=None, overlay=None, template='newsMontage', card={'kind': 'objects', 'items': ['coinStack', 'safe']},
         narration='Sold across the whole VW Group: Volkswagen, Audi, Porsche, Skoda, Seat.'),

    dict(id='t019', level=None, overlay=None, template='boardroom',
         narration='The firm that built the cheap "people\'s car" had built a green one too. That was the pitch.'),

    dict(id='t020', level=None, overlay=None, template='officeFloor',
         narration='About five hundred ninety thousand of those cars were sold right here, in the US.'),

    dict(id='t021', level=None, overlay=None, template='closeUpPortrait',
         narration='There was just one problem the ads never said.'),

    dict(id='t022', level=None, overlay=None, template='chartBoard', chart='down',
         narration="No diesel engine built could pass America's toughest lab test and still give the mileage it had promised. Not without a trick."),

    dict(id='t023', level=None, overlay=None, template='officeFloor', foreground={'kind': 'overShoulder', 'side': 'right'},
         narration='So somewhere inside the code, the team built one.'),

    dict(id='t024', level=None, overlay=None, template='newsMontage', card={'kind': 'word', 'word': 'Hidden.'},
         narration='A setting no driver would ever see. A door that only opened when needed.'),

    dict(id='t025', level=None, overlay=None, template='domesticInterior',
         narration='None knocked.'),

    dict(id='t026', level=None, overlay=None, template='cityStreet', breath=True,
         narration='For six years, it worked.'),

    dict(id='t027', level='CH 2', overlay=None, template='chartBoard', breath=True, card={'kind': 'chapter', 'title': 'The Trapdoor', 'subtitle': 'Software Built to Fool the Test', 'hold': 2.4},
         narration='Here is what the code did, in plain terms. A lab test puts a car on rollers.'),

    dict(id='t028', level=None, overlay=None, template='domesticInterior',
         narration='The wheels turn. The car never moves. No real road ever drives exactly like that.'),

    dict(id='t029', level=None, overlay=None, template='cityStreet',
         narration="So the team taught the car's computer to notice the difference."),

    dict(id='t030', level=None, overlay=None, template='newsMontage', card={'kind': 'word', 'word': 'Wheel.'},
         narration='It watched the steering wheel. On rollers, the wheel barely turns. On a real road, it turns constantly.'),

    dict(id='t031', level=None, overlay=None, template='officeFloor', foreground={'kind': 'overShoulder', 'side': 'left'},
         narration='It watched the speed, the engine load, even how long the drive had run.'),

    dict(id='t032', level=None, overlay=None, template='boardroom',
         narration='None of this was an accident. Someone signed off on each line.'),

    dict(id='t033', level=None, overlay=None, template='broadcastDesk',
         narration='Around April 2013, the team sharpened the trick further, tuned closer to the wheel.'),

    dict(id='t034', level=None, overlay=None, template='closeUpPortrait', breath=True,
         narration='Put all of that together, and the car could guess, almost always, whether it was being tested.'),

    dict(id='t035', level=None, overlay=None, template='officeFloor', chart='up',
         narration='If it thought yes, it switched on full pollution controls.'),

    dict(id='t036', level=None, overlay=None, template='cityStreet',
         narration='If it thought no, it turned them back down. Better mileage. More power. That was the reward. Watchdogs had a name for this kind of trick.'),

    dict(id='t037', level=None, overlay=None, template='chartBoard', card={'kind': 'word', 'word': 'Defeat device.'},
         narration='A defeat device.'),

    dict(id='t038', level=None, overlay=None, template='closeUpPortrait',
         narration='Give a machine a reason to lie, and you may never catch it lying.'),

    dict(id='t039', level=None, overlay=None, template='boardroom',
         narration="Building one on purpose wasn't a gray area. It was a US crime."),

    dict(id='t040', level=None, overlay=None, template='officeFloor',
         narration='Its own team still built one, and refined it for years.'),

    dict(id='t041', level=None, overlay=None, template='chartBoard', chart='up',
         narration='Each official test, on each rolling bench, the cars came back clean. Watchdogs had no reason to look closer.'),

    dict(id='t042', level=None, overlay=None, template='newsMontage',
         narration='The paperwork said clean. The lab said clean. So did the salesperson. The car agreed, each time it was asked.'),

    dict(id='t043', level=None, overlay=None, template='domesticInterior', bubbles=[{'kind': 'float', 'text': 'It only ever told the truth once: on the road, alone.'}],
         narration='It only ever told the truth once: on the road, alone, with none grading it.'),

    dict(id='t044', level=None, overlay=None, template='chartBoard', chart='down',
         narration='And on the road, it put out nitrogen oxide at up to forty times the legal standard.'),

    dict(id='t045', level=None, overlay=None, template='cityStreet',
         narration='A pollutant tied to smog, to asthma, and to lung disease. Millions of engines. Millions of trips.'),

    dict(id='t046', level=None, overlay=None, template='domesticInterior', card={'kind': 'word', 'word': 'Nobody.'},
         narration='None outside Volkswagen knew.'),

    dict(id='t047', level=None, overlay=None, template='closeUpPortrait',
         narration='None, yet.'),

    dict(id='t048', level='CH 3', overlay=None, template='cityStreet', breath=True, card={'kind': 'chapter', 'title': 'The Road Trip', 'subtitle': 'Three Cars That Caught the Lie', 'hold': 2.4},
         narration='In 2013, a small group had an idea that had nothing to do with catching a crime.'),

    dict(id='t049', level=None, overlay=None, template='officeFloor',
         narration='The International Council on Clean Transportation wanted European watchdogs to adopt American-style clean diesel rules.'),

    dict(id='t050', level=None, overlay=None, template='boardroom',
         narration='To make the case, they needed proof American diesel tech worked on real roads.'),

    dict(id='t051', level=None, overlay=None, template='newsMontage', card={'kind': 'objects', 'items': ['briefcase', 'laptop']},
         narration='They gave West Virginia University a grant.'),

    dict(id='t052', level=None, overlay={'big': '$69,000', 'sub': 'THE GRANT THAT FOUND IT'}, template='bankExterior',
         narration='Sixty-nine thousand.'),

    dict(id='t053', level=None, overlay=None, template='boardroom',
         narration='Grad students built a portable emissions rig, small enough to fit in a trunk. It cost less than a used car.'),

    dict(id='t054', level=None, overlay=None, template='cityStreet', foreground={'kind': 'overShoulder', 'side': 'right'},
         narration='A probe went in the exhaust pipe.'),

    dict(id='t055', level=None, overlay=None, template='officeFloor',
         narration='The rig read each gas coming out of it, live. They picked three diesel cars.'),

    dict(id='t056', level=None, overlay=None, template='domesticInterior',
         narration='A VW Jetta. A VW Passat. And a BMW, kept in as a check.'),

    dict(id='t057', level=None, overlay=None, template='cityStreet',
         narration='Then they just drove them. Highways. City streets. Mountain roads. Thirteen hundred miles, in total.'),

    dict(id='t058', level=None, overlay=None, template='officeFloor', panels={'variant': 'v2', 'cells': [{'template': 'officeFloor'}, {'template': 'cityStreet'}]},
         narration='A lab bench on one side. A real road on the other. The numbers should not be this far apart. The BMW passed, comfortably, the whole way.'),

    dict(id='t059', level=None, overlay=None, template='newsMontage', bubbles=[{'kind': 'float', 'text': '"These numbers cannot be right."'}], dialogue={'text': 'These numbers cannot be right.'},
         narration='One researcher, staring at the readout, said it out loud.'),

    dict(id='t060', level=None, overlay=None, template='chartBoard', chart='down',
         narration='The two Volkswagens were failing by fifteen to forty times the legal limit.'),

    dict(id='t061', level=None, overlay=None, template='officeFloor',
         narration='On rollers, in a lab, those same two cars had always passed.'),

    dict(id='t062', level=None, overlay=None, template='closeUpPortrait', breath=True,
         narration='A steering wheel that never stopped turning had done what a decade of lab tests never had.'),

    dict(id='t063', level=None, overlay=None, template='newsMontage',
         narration='In May 2014, the results went to California and to the EPA. It was asked to explain the gap.'),

    dict(id='t064', level=None, overlay=None, template='boardroom',
         narration='For over a year, the firm offered updates, recalls, and excuses instead.'),

    dict(id='t065', level=None, overlay=None, template='officeFloor', card={'kind': 'narration', 'text': 'None of it\nclosed the gap.'},
         narration='None of it closed the gap. Watchdogs kept pushing.'),

    dict(id='t066', level=None, overlay=None, template='cityStreet',
         narration='They threatened to withhold approval for the next model year.'),

    dict(id='t067', level=None, overlay=None, template='boardroom', gap=1.4,
         narration='On September 3rd, 2015, its own engineers at last owned up.'),

    dict(id='t068', level=None, overlay=None, template='newsMontage', mood='grim', card={'kind': 'narration', 'text': 'The cars had\na defeat device.'},
         narration='The cars had a defeat device, built in, on purpose.'),

    dict(id='t069', level=None, overlay=None, template='closeUpPortrait', mood='grim',
         narration='Nine years of quiet cheating, said out loud in one room.'),

    dict(id='t070', level='CH 4', overlay=None, template='broadcastDesk', mood='grim', breath=True, card={'kind': 'chapter', 'title': 'The Reckoning', 'subtitle': 'Fines, a Resignation, and Guilty Pleas', 'hold': 2.4},
         narration='Fifteen days later, on September 18th, 2015, the EPA made it public.'),

    dict(id='t071', level=None, overlay=None, template='closeUpPortrait', mood='grim',
         narration='A formal Notice of Violation of the Clean Air Act.'),

    dict(id='t072', level=None, overlay=None, template='newsMontage', mood='grim', bubbles=[{'kind': 'float', 'text': '"...a threat to public health."'}], dialogue={'text': 'Using a defeat device to evade clean air standards is illegal and a threat to public health.'},
         narration='EPA\'s Giles put it plainly: "Using a defeat device in cars to evade clean air standards is illegal, and a threat to public health."'),

    dict(id='t073', level=None, overlay={'big': '482,000', 'sub': 'CARS, EPA NOTICE, SEPT 2015'}, template='broadcastDesk',
         narration='The notice covered nearly half a million cars, right off the top.'),

    dict(id='t074', level=None, overlay=None, template='exchangeFloor', mood='grim',
         narration="Volkswagen's stock dropped by roughly a third within days."),

    dict(id='t075', level=None, overlay=None, template='chartBoard', chart='down',
         narration='Billions in market value, gone before the firm said one more word.'),

    dict(id='t076', level=None, overlay=None, template='broadcastDesk', mood='grim', bubbles=[{'kind': 'float', 'text': '"...we have totally screwed up."'}], dialogue={'text': 'We have totally screwed up.'},
         narration='On September 21st, VW America\'s CEO, Michael Horn, told a room of reporters: "We have totally screwed up."'),

    dict(id='t077', level=None, overlay=None, template='newsMontage', mood='grim',
         narration='The next day, the firm admitted the code sat in eleven million cars, worldwide.'),

    dict(id='t078', level=None, overlay=None, template='broadcastDesk',
         narration="California's own watchdog, CARB, had pushed hardest for the answer."),

    dict(id='t079', level=None, overlay=None, template='crowdQueue', mood='grim',
         narration='Owners who had believed the "clean" pitch started lining up at dealers for answers.'),

    dict(id='t080', level=None, overlay=None, template='domesticInterior', mood='grim', bubbles=[{'text': 'You told us this was clean.', 'speaker': 'left'}, {'text': "We're working on a fix.", 'speaker': 'right', 'at': 1.6}], dialogue={'text': "We're working on a fix."},
         narration='At the counter, the pitch from three years earlier came right back at them. Two days after that, CEO Martin Winterkorn quit.'),

    dict(id='t081', level=None, overlay=None, template='boardroom', mood='grim', bubbles=[{'kind': 'float', 'text': '"...not aware of any wrongdoing on my part."'}], dialogue={'text': 'I am not aware of any wrongdoing on my part.'},
         narration='He said he was "shocked" and "stunned," and insisted he was "not aware of any wrongdoing" on his part.'),

    dict(id='t082', level=None, overlay=None, template='domesticInterior', card={'kind': 'narration', 'text': 'Nine years\nto test that claim.'},
         narration='Nine years. That is how long it took to test that claim in a courtroom.'),

    dict(id='t083', level=None, overlay=None, template='newsMontage',
         narration='Two days later, Porsche chief Matthias Müller was named the new CEO.'),

    dict(id='t084', level=None, overlay=None, template='cityStreet',
         narration='He would run the firm for the next two and a half years. The hearings had only begun. On October 8th, Horn was called before Congress.'),

    dict(id='t085', level=None, overlay=None, template='broadcastDesk', foreground={'kind': 'overShoulder', 'side': 'left'},
         narration='Asked, directly, why the defeat device existed, he gave the shortest possible answer.'),

    dict(id='t086', level=None, overlay=None, template='closeUpPortrait', bubbles=[{'kind': 'float', 'text': '"It was installed for this purpose."'}], dialogue={'text': 'It was installed for this purpose.'},
         narration='"It was installed for this purpose," he said.'),

    dict(id='t087', level=None, overlay=None, template='chartBoard', chart='down',
         narration='No purpose but the one it was built for. A second notice landed that November, widening the count.'),

    dict(id='t088', level=None, overlay={'big': '590,000', 'sub': 'TOTAL US CARS, DOJ 2017'}, template='exchangeFloor',
         narration='Roughly ten thousand more six-cylinder Audi, Porsche and VW diesels, on top of the rest.'),

    dict(id='t089', level=None, overlay=None, template='bankExterior',
         narration='In October 2016, a federal judge approved a fourteen-point-seven-billion-dollar deal.'),

    dict(id='t090', level=None, overlay={'big': '$14.7B', 'sub': 'SETTLEMENT, OCTOBER 2016'}, template='chartBoard', chart='down',
         narration='Buybacks, fixes, and compensation for roughly half a million cars.'),

    dict(id='t091', level=None, overlay=None, template='officeFloor',
         narration='It was, at the time, the largest auto-scandal deal in US history.'),

    dict(id='t092', level=None, overlay=None, template='bankExterior',
         narration='Half a million cars, bought back or fixed, one at a time. It was nowhere near the end.'),

    dict(id='t093', level=None, overlay=None, template='closeUpPortrait',
         narration='That same September, a VW engineer named James Liang had pleaded guilty.'),

    dict(id='t094', level=None, overlay=None, template='officeFloor', card={'kind': 'narration', 'text': 'The first\nto admit it.'},
         narration='The first Volkswagen employee to admit any of it, in court.'),

    dict(id='t095', level=None, overlay=None, template='cityStreet',
         narration='On January 7th, 2017, FBI agents arrested a second VW manager, Oliver Schmidt, in Miami.'),

    dict(id='t096', level=None, overlay=None, template='domesticInterior',
         narration='He was on a trip, about to fly home to Germany, when they stopped him.'),

    dict(id='t097', level=None, overlay=None, template='officeFloor',
         narration="He had run VW's own emissions office in the US."),

    dict(id='t098', level=None, overlay=None, template='courtHearing', panels={'variant': 'v2', 'cells': [{'template': 'courtHearing'}, {'template': 'bankExterior'}]},
         narration='Four days later, the Justice Department announced a deal: Volkswagen would plead guilty to three felony counts. And pay four point three billion.'),

    dict(id='t099', level=None, overlay=None, template='bankExterior', chart='down',
         narration='Two point eight billion of it criminal. One point five billion civil.'),

    dict(id='t100', level=None, overlay=None, template='newsMontage',
         narration='Six Volkswagen executives and employees were indicted alongside the deal.'),

    dict(id='t101', level=None, overlay=None, template='boardroom',
         narration='Most of them stayed in Germany, safely outside US jurisdiction.'),

    dict(id='t102', level=None, overlay=None, template='cityStreet', card={'kind': 'narration', 'text': 'Except the one\nthey had arrested.'},
         narration='Except the one they had arrested on a trip.'),

    dict(id='t103', level=None, overlay=None, template='officeFloor', breath=True,
         narration='In March 2017, Volkswagen entered its guilty plea in Detroit, and was sentenced: three years of probation, and an outside monitor over the firm. On paper, the case was closed.'),

    dict(id='t104', level='CH 5', overlay=None, template='courtHearing', breath=True, card={'kind': 'chapter', 'title': 'The Verdict', 'subtitle': 'Prison Terms, Nine Years Late', 'hold': 2.4},
         narration='The sentences, when they at last landed, landed unevenly.'),

    dict(id='t105', level=None, overlay=None, template='closeUpPortrait',
         narration='James Liang, the engineer, was sentenced in August 2017.'),

    dict(id='t106', level=None, overlay={'big': '40 MONTHS', 'sub': 'JAMES LIANG, AUG 2017'}, template='chartBoard', chart='down',
         narration='Forty months in prison, and a two hundred thousand dollar fine. He had cooperated with the government since 2016.'),

    dict(id='t107', level=None, overlay=None, template='exchangeFloor',
         narration='Forty months was the floor, not the ceiling, for what came next.'),

    dict(id='t108', level=None, overlay=None, template='closeUpPortrait',
         narration='It bought him nothing close to freedom.'),

    dict(id='t109', level=None, overlay=None, template='courtHearing',
         narration='Oliver Schmidt, the compliance chief, was sentenced that December.'),

    dict(id='t110', level=None, overlay={'big': '7 YEARS', 'sub': 'OLIVER SCHMIDT, DEC 2017'}, template='chartBoard', chart='down',
         narration='Seven years, and a four hundred thousand dollar fine.'),

    dict(id='t111', level=None, overlay=None, template='courtHearing',
         narration='The heaviest US prison term handed to anyone in this case. Heavier than the man who built the code.'),

    dict(id='t112', level=None, overlay=None, template='closeUpPortrait',
         narration='In May 2018, a grand jury indicted Martin Winterkorn himself.'),

    dict(id='t113', level=None, overlay=None, template='courtHearing',
         narration='Four US counts. Conspiracy, and three counts of wire fraud.'),

    dict(id='t114', level=None, overlay=None, template='boardroom', bubbles=[{'kind': 'float', 'text': '"...you will pay a heavy price."'}], dialogue={'text': 'If you try to deceive the United States, then you will pay a heavy price.'},
         narration='Attorney General Jeff Sessions warned: "If you try to deceive the United States, then you will pay a heavy price."'),

    dict(id='t115', level=None, overlay=None, template='cityStreet',
         narration='Germany does not hand its own citizens over.'),

    dict(id='t116', level=None, overlay=None, template='closeUpPortrait',
         narration='Winterkorn never faced that case at all.'),

    dict(id='t117', level=None, overlay=None, template='courtHearing',
         narration="Meanwhile, Audi's own CEO, Rupert Stadler, was arrested in Germany in June 2018."),

    dict(id='t118', level=None, overlay=None, template='domesticInterior',
         narration='Held for four months before his own trial even began.'),

    dict(id='t119', level=None, overlay=None, template='courtHearing',
         narration='The first Volkswagen Group board-level executive jailed over the scandal, anywhere.'),

    dict(id='t120', level=None, overlay=None, template='broadcastDesk',
         narration='German prosecutors had built their own case, separately. His Munich trial at last began in September 2020.'),

    dict(id='t121', level=None, overlay={'big': '$1.2M', 'sub': 'RUPERT STADLER, JUNE 2023'}, template='chartBoard', chart='down',
         narration='In June 2023, Stadler pleaded guilty. A paused sentence, and a hefty fine.'),

    dict(id='t122', level=None, overlay=None, template='newsMontage',
         narration='Winterkorn himself at last walked into a German courtroom too, in September 2024.'),

    dict(id='t123', level=None, overlay=None, template='courtHearing', panels={'variant': 'grid4', 'cells': [{'template': 'courtHearing'}, {'template': 'boardroom'}, {'template': 'officeFloor'}, {'template': 'newsMontage'}]},
         narration='September 3rd, 2024. Nine years after he quit.'),

    dict(id='t124', level=None, overlay=None, template='closeUpPortrait',
         narration='He denied each charge, through his lawyer.'),

    dict(id='t125', level=None, overlay=None, template='broadcastDesk',
         narration='Four other former managers went on trial with him, in the same Braunschweig court.'),

    dict(id='t126', level=None, overlay=None, template='courtHearing',
         narration='In May 2025, that court convicted two of them.'),

    dict(id='t127', level=None, overlay={'big': '4.5 YRS', 'sub': 'JENS HADLER, DIESEL ENGINE CHIEF'}, template='chartBoard', chart='down',
         narration='Jens Hadler, who had led diesel engine development, got four and a half years.'),

    dict(id='t128', level=None, overlay=None, template='courtHearing',
         narration='Hanno Jelden, who led powertrain tech, got two years and seven months.'),

    dict(id='t129', level=None, overlay=None, template='boardroom',
         narration='Four men who had once run the engine program. Two prison terms, two paused.'),

    dict(id='t130', level=None, overlay=None, template='newsMontage',
         narration='Two more, more senior still, walked out with paused terms.'),

    dict(id='t131', level=None, overlay=None, template='courtHearing',
         narration="Winterkorn's own case was tried apart from theirs, over his health."),

    dict(id='t132', level=None, overlay=None, template='newsMontage',
         narration='The man at the very top waited longest of all.'),

    dict(id='t133', level=None, overlay=None, template='closeUpPortrait',
         narration='In 2025, the court paused his trial again, for that same reason.'),

    dict(id='t134', level=None, overlay=None, template='courtHearing',
         narration='No verdict has been reached in the record this account was built from.'),

    dict(id='t135', level=None, overlay=None, template='newsMontage', card={'kind': 'word', 'word': 'Unresolved.'},
         narration='Nine years to open a case. Still no ending.'),

    dict(id='t136', level=None, overlay=None, template='chartBoard', chart='down', breath=True,
         narration='By 2020, it put the worldwide cost at more than thirty-one billion euros.'),

    dict(id='t137', level=None, overlay={'big': '$34.7B', 'sub': "VW'S OWN REPORTED WORLDWIDE COST"}, template='bankExterior',
         narration='Nearly thirty-five billion dollars, by the exchange rate of the time.'),

    dict(id='t138', level=None, overlay=None, template='domesticInterior',
         narration='The group that first caught it had spent sixty-nine thousand dollars.'),

    dict(id='t139', level=None, overlay=None, template='closeUpPortrait',
         narration='Do the math, and it comes out close to five hundred thousand to one.'),

    dict(id='t140', level=None, overlay=None, template='officeFloor',
         narration='That is the ratio between the grant that found the lie and the cost of it.'),

    dict(id='t141', level=None, overlay=None, template='bankExterior',
         narration='None at Volkswagen had budgeted for that math.'),

    dict(id='t142', level=None, overlay=None, template='boardroom', breath=True,
         narration='Each watchdog who tested these cars had months, years even, on the same lab bench.'),

    dict(id='t143', level=None, overlay=None, template='newsMontage',
         narration='Germany. California. The U.S. government itself.'),

    dict(id='t144', level=None, overlay=None, template='chartBoard', chart='flat',
         narration='All of them missed the same trick.'),

    dict(id='t145', level=None, overlay=None, template='cityStreet', breath=True,
         narration='It took three plain cars, driven on plain roads, to catch what a decade of tests never did.'),

    dict(id='t146', level=None, overlay=None, template='closeUpPortrait',
         narration='Not a whistleblower. Not a lawsuit. A trunk full of hoses.'),

    dict(id='t147', level=None, overlay=None, template='domesticInterior',
         narration='You can build the toughest test in the world.'),

    dict(id='t148', level=None, overlay=None, template='newsMontage',
         narration='If the thing you are testing can recognize a test, you have lost.'),

    dict(id='t149', level=None, overlay=None, template='boardroom',
         narration='We built the tests. We wrote the rules.'),

    dict(id='t150', level=None, overlay=None, template='closeUpPortrait',
         narration='We still let a steering wheel decide when to believe our own eyes.'),

    dict(id='t151', level=None, overlay=None, template='newsMontage', breath=True,
         narration='"We have totally screwed up," Volkswagen\'s own man told America, the week the truth came out.'),

    dict(id='t152', level=None, overlay=None, template='chartBoard', chart='down',
         narration='Eleven million cars.'),

    dict(id='t153', level=None, overlay=None, template='bankExterior',
         narration='Thirty-five billion dollars.'),

    dict(id='t154', level=None, overlay=None, template='closeUpPortrait', breath=True,
         narration='One sentence that at last told the truth.')
]
