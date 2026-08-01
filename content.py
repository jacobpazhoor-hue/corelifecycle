#!/usr/bin/env python3
"""Your Life as Every Rank in the Mongol Empire — POV doodle build, ~12-13 min.
Grounded in docs/research/mongol_empire.md. HISTORY format: herder's son -> arban (10) -> jaghun
commander (100) -> minghan commander (1,000) -> tumen commander/noyan (10,000) -> regional noyan/
governor -> khan of a khanate -> Khagan (Great Khan). Second-person present-tense POV: the viewer IS
a composite herder's son who rises through the real, documented decimal army (Ancient Origins /
Wikipedia "Mingghan") across ~1206-1271, compressed into one mythic climb the same way the existing
ROMAN and SAMURAI history packs compress centuries into one POV lifetime. Grounded in verified
mechanics: the arban/jaghun/minghan/tumen decimal command structure, the Yassa's collective-punishment
discipline, the 1219-1221 Khwarazmian campaign (triggered by the real massacre of a Mongol trade
caravan at Otrar), the Yam relay system (200-300km/day, VERIFIED), the paiza passport tablet, the
1259 death of Möngke Khan and the 1260-1264 Toluid Civil War that split the empire into four de facto
independent khanates (Golden Horde/Chagatai/Ilkhanate/Yuan), and Kublai Khan's chao paper currency
(VERIFIED capital penalty for refusal/counterfeiting, per Marco Polo's account) [all VERIFIED, see
research doc]. Per-rank silver ("balish") figures are ILLUSTRATIVE/dramatized -- no payroll ledger for
individual Mongol ranks survives, unlike a modern salary; flagged in the research doc. Balish is used
as the single wealth unit across the ENTIRE spine (t09-t29), including the pre-Mongke-standardization
early scenes (t09/t12), as a deliberate anachronism so the 0 -> 2 -> 600 -> 4,000 -> 11,000 -> 90,000
-> 400,000 progression reads as one continuous, comparable climb rather than switching currencies
mid-story; the research doc's period-accurate dirham note for t12 is acknowledged but not used, for
that reason. Chuluun,
Ganbaatar, and Sarnai are a FICTIONAL COMPOSITE -- no real historical individual is depicted as the
protagonist; Genghis Khan, Möngke, Kublai, Ariq Böke, and Marco Polo are referenced only as real,
independently documented background events.

SPINE: a RISE-THEN-FRACTURE spine -- the protagonist's personal balish figure never drops (0 -> 2 ->
600 -> 4,000 -> 11,000 -> 90,000 -> 400,000), but the EMPIRE itself cracks at the midpoint: the title
"Khagan" still grows in personal wealth/status even as three of the four khanates stop answering to
it. Distinct from yakuza's unbroken-climb-moral-only-reversal (the wealth spine there also never
dropped) in that here the reversal is structural/political, visibly fracturing the very throne being
climbed toward -- the apex number is real but the empire behind it is not whole.

STORY: CHULUUN -- the aging arban commander who finds you in the wreckage of a rival clan's raid on
your family's herd, recruits you with a bow instead of coin, and teaches the Yassa's law over blood-
tribe. The mentor. His loss (the midpoint reversal, ~60%): the succession war after Möngke Khan's
death forces him to choose the losing side's opponent's side (the eventual winner) and he still dies
in an unrecorded skirmish before the war even resolves -- loyalty costing him anyway. GANBAATAR --
your fellow arban recruit, faster and colder, who backs the LOSING claimant (Ariq Böke) in the civil
war, taunts you at the reversal, and outlives the loss to become a rival khan you negotiate peace with
for decades. SARNAI -- your mother, left with three sick sheep after the raid that starts the story --
the named, concrete want (Level 1), paid off same-arc when Chuluun's bow buys back what the raid took.
SENSORY/MOTIF ANCHOR: the draw-callus on your right thumb, from a lifetime of the bow, retriggered at
every level-up, eventually buried under the rings/seals of rank until the Khagan's own seal ring
covers it completely at the apex. ANAPHORA (t29): "The seal buys silk. The seal buys silver. The seal
has never once... bought back the men who used to kneel."

Templates: 7 NEW (a Mongol pack in src/stage.tsx -- steppeCamp/horsebackDrill/steppeRaid/siegeWalls/
yamRelayStation/khanAudienceTent/khaganThrone) + ROMAN's warCouncil/praetorians (reframed as the
kheshig guard)/throne (a lesser khanate throne, distinct from the bespoke apex khaganThrone)/
commission (reframed as the kurultai) + SAMURAI's merchantHouse/teaCeremony + DYNASTY's portraitHall
(Chinggisid bloodline legitimacy) + SPY's debrief + universal window/tower/fileWall/signing.
Deliberately avoids modern-coded universal templates (desk/boardroomNotes/revolvingDoor/warRoom/
emptyChair) as anachronistic for a 13th-century setting. No two adjacent scenes repeat a template.

STRUCTURAL VARIATION vs the last 2 (lottery_winner = MID-ACTION cold open / spike-crash-rebuild act
two / CYCLICAL same-spot ending; yakuza = AFTERMATH cold open / unbroken-climb-moral-only-reversal /
TORCH-PASSING ending): this cold open is FLASH-FORWARD (decades ahead, on the Khagan's own throne,
cut away before the envoy's refusal is explained); act two is RISE-THEN-FRACTURE (personal wealth
never drops, but the empire the throne sits over visibly and permanently cracks at the midpoint,
distinct from both prior shapes); the ending is ONE-DOOR-LEFT-OPEN -- not a literal same-spot cycle,
not a passed torch, but an unopened, unanswered letter still sitting on the desk (the shared-universe
thread), deliberately unresolved.

PROMISE -> PAYOFF LEDGER:
  * t01 cold open (the throne, the envoy who won't kneel, a map with one shaded quarter)  -> t29 (a herald confirms 3 of 4 khanates no longer answer) + t30 (the letter, left deliberately open)
  * t02 promise/cost-line ("you will not keep all of it, and it will not keep you warm")   -> paid off literally at t27/t29's "on paper is doing a lot of work" twist
  * sensory anchor: the draw-callus on the thumb + its body-dread beat                      -> t05 (first bow) -> t15 ("you stop counting your own thumb's old scars") -> t18 (Chuluun's death, "it doesn't register anything") -> t30 (buried under the seal ring)
  * t03 Sarnai + the herd (the named want)                                                  -> t04 (the raid takes it) -> t05 (Chuluun's bow answers it)
  * t05 Chuluun's line ("the arrow doesn't care whose son you are")                         -> tested at t13's second warning -> paid off in his death at t18
  * t07 Yassa collective-punishment beat (ten men punished for one man's fear)               -> echoed/inverted at t22 (you give that same order yourself, as the one now enforcing it)
  * t10 the Otrar caravan massacre (the trigger)                                            -> pays off as the total-war campaign of t11-t12
  * t16 silence beat (gap=1.4) before the reversal                                          -> t17 THE REVERSAL (Möngke's death, the civil war, Ganbaatar's taunt)
  * t16/t20 the Yam relay share-worthy beat (200-300km/day)                                  -> reframed darkly at t18 (the same speed that once carried good news now carries Chuluun's death) and t29 (the same system that delivers the khanates' refusal)
  * t24 the Ilkhanate's unopened letter (planted)                                            -> UNRESOLVED UNIVERSE THREAD (deliberate) -> referenced again, still unopened, at t30
  * t28 share beat: Kublai's chao paper currency, death penalty for refusing it              -> undercuts t27's apex treasury number immediately
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — FLASH-FORWARD, decades ahead, cut away before it resolves ----
    dict(id="t01", level=None, template="khaganThrone", gap=0.7,
         narration=("Lacquer and cold brass under your palms — the arms of a throne it took forty "
                    "years to reach. An envoy from the west stands in the doorway and does not kneel. "
                    "Behind you, a wall map shows an empire that once answered to a single name; a full "
                    "quarter of it is shaded a color that isn't yours anymore. Don't ask him why he "
                    "won't bow. You already know."),
         overlay=dict(big="16%", sub="OF ALL LAND ON EARTH, ONCE")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="window",
         narration=("Rewind sixty years. None of this exists yet: not the throne, not the map, not the "
                    "envoy who won't bow. There's only grass to the horizon in every direction and a "
                    "boy who has never once been warm in winter. You will end up owning more land than "
                    "any single person in history. You will not keep all of it, and it will not keep "
                    "you warm either."),
         overlay=None),

    # ---- LEVEL 01 · THE HERDER'S SON ----
    dict(id="t03", level="LEVEL 01  ·  THE HERDER'S SON", template="steppeCamp",
         narration=("Eleven sheep. Two of them cough in a way your mother, Sarnai, pretends not to "
                    "hear. The ger's felt walls hold in smoke and mutton fat and almost no heat at all. "
                    "You want your own horse — not the family's, yours — and a winter where counting "
                    "the herd twice doesn't change the number. Somewhere past that ridge, a man named "
                    "Temüjin is already binding the tribes into one fist."),
         overlay=dict(big="11 SHEEP", sub="TWO OF THEM ARE SICK")),
    dict(id="t04", level=None, template="steppeRaid",
         narration=("Horses at the treeline before the dogs even bark. A rival clan takes the herd, the "
                    "good felt, your father's bow — everything but the ger itself, left standing out of "
                    "what passes for mercy out here. Sarnai doesn't cry where you can see it. Therefore "
                    "you don't either. By morning the eleven sheep are three, and three won't survive "
                    "the thaw."),
         overlay=dict(big="3 SHEEP", sub="LEFT AFTER THE RAID")),
    dict(id="t05", level=None, template="steppeCamp",
         narration=("An old warrior named Chuluun rides in behind the raiders' tracks — too late to "
                    "help, early enough for the wreckage to still be smoking. He offers no coin, only a "
                    "bow, a place in his arban, and a hand heavy on your shoulder. The string bites your "
                    "draw-thumb raw the first hundred pulls. Chuluun doesn't promise it gets better."),
         overlay=None,
         dialogue=dict(text="The arrow doesn't care whose son you are.")),

    # ---- LEVEL 02 · ARBAN · TEN MEN ----
    dict(id="t06", level="LEVEL 02  ·  ARBAN  ·  TEN MEN", template="horsebackDrill",
         narration=("Arban: ten men, one unit, drawn on purpose from ten different clans so no one owes "
                    "loyalty to blood over the group. Nine strangers become your family faster than "
                    "blood ever did, because the Yassa — Chinggis Khan's law — makes you answer for each "
                    "other's cowardice as much as your own courage. Dawn to dark: mounted archery at a "
                    "full gallop, an arrow loosed the instant both hooves leave the ground."),
         overlay=dict(big="10 MEN", sub="ONE FAMILY, BY LAW NOW")),
    dict(id="t07", level=None, template="debrief",
         narration=("A boy named Ganbaatar rides two horses better than you ride one and makes sure the "
                    "whole arban knows it. Then a recruit in the jaghun beside yours breaks and runs "
                    "mid-drill. Therefore his whole ten-man unit kneels in the dirt at dusk, punished as "
                    "one body for one man's fear — the law's oldest, coldest lesson. Nobody in your "
                    "arban runs. Not out of courage. Out of arithmetic."),
         overlay=dict(big="1 DESERTER", sub="TEN MEN PUNISHED FOR HIM")),
    dict(id="t08", level=None, template="tower",
         narration=("Word passes down from Chuluun before sunrise: the arban rides tonight, first "
                    "blood, first real test past the drill ground's straw men. Ganbaatar's unit rides "
                    "beside yours, close enough that outrunning him becomes its own kind of survival. "
                    "The bow-callus on your thumb has stopped bleeding. It's just numb now, and numb, "
                    "you're starting to learn, is the more useful state."),
         overlay=None),

    # ---- LEVEL 03 · JAGHUN COMMANDER · 100 MEN ----
    dict(id="t09", level="LEVEL 03  ·  JAGHUN COMMANDER  ·  100 MEN", template="steppeRaid",
         narration=("Torches, not dawn, light the enemy camp — Chuluun's plan, your arban riding point. "
                    "A man twice your size comes at you out of the smoke; the bow already strung wins "
                    "before the knife even clears its sheath. By the time the tents stop burning, you're "
                    "jaghun commander — a hundred men, earned in one night instead of ten years. Your "
                    "khubi share: two silver ingots, your first."),
         overlay=dict(big="2 BALISH", sub="YOUR FIRST KHUBI SHARE")),
    dict(id="t10", level=None, template="merchantHouse",
         narration=("News reaches the ordu from a trade route six hundred miles west: a Mongol caravan "
                    "under the Khan's own protection, slaughtered at a city called Otrar on the "
                    "governor's order. A caravan is not an army. But it carried the Khan's seal, and the "
                    "seal is the one thing this empire cannot let anyone touch and live. Therefore, "
                    "within the week, the whole ordu turns west."),
         overlay=dict(big="450", sub="KILLED UNDER THE KHAN'S SEAL")),
    dict(id="t11", level=None, template="tower",
         narration=("Weeks of riding blur into a single ache in your hips and a permanent grit of dust "
                    "behind your teeth. Ganbaatar's jaghun rides the opposite flank, close enough at "
                    "night to hear his men's fires, far enough that you stop checking. Chuluun says "
                    "nothing about mercy on this march. Nobody asks him to. The walls of the first city "
                    "rise out of the haze on the ninth week, taller than anything either of you has ever "
                    "burned."),
         overlay=None),

    # ---- LEVEL 04 · MINGHAN COMMANDER · 1,000 MEN ----
    dict(id="t12", level="LEVEL 04  ·  MINGHAN COMMANDER  ·  1,000 MEN", template="siegeWalls",
         narration=("Minghan commander now — a thousand men answer to you alone. The city's walls hold "
                    "three days against catapults built from its own orchard trees, then don't. Inside, "
                    "the ruler who ordered the caravan killed is already gone, so the punishment lands "
                    "on the city instead of the man. Smoke tastes like scorched wool at the back of your "
                    "throat for a week after. Your share of the sack: six hundred balish, silk, and a "
                    "silence you don't examine too closely."),
         overlay=dict(big="600 BALISH", sub="THE SACKED CITY'S SHARE")),
    dict(id="t13", level=None, template="fileWall",
         narration=("Someone keeps a rough tally of the dead in this campaign — the number climbs past "
                    "what any single mind can hold as individual faces, so it stops being faces at all. "
                    "Chuluun finds you at the tally wall, not to comfort you, just to stand near you a "
                    "while. An empire that only grows, he says, forgets how to stop. You don't answer "
                    "him. You're not sure yet that you disagree."),
         overlay=None,
         dialogue=dict(text="An empire that only grows forgets how to stop.")),
    dict(id="t14", level=None, template="praetorians",
         narration=("Word comes down from the Khan's own tent: your thousand held the breach when two "
                    "others broke, and the Khan wants men like that close, not just useful at a "
                    "distance. The kheshig — his personal guard, ten thousand strong, chosen only by "
                    "deed — takes you in. Ganbaatar isn't chosen. He rides on the campaign's other wing "
                    "without a single word to you about it, which somehow says everything."),
         overlay=None),

    # ---- LEVEL 05 · TUMEN COMMANDER · NOYAN ----
    dict(id="t15", level="LEVEL 05  ·  TUMEN COMMANDER  ·  NOYAN", template="warCouncil",
         narration=("Tumen commander, noyan — ten thousand men, a rank the Khan himself once held "
                    "before there was an empire under him to hold it. Chinggis Khan dies the year "
                    "you're confirmed, of causes the histories can't agree on; the empire he built "
                    "somehow keeps expanding without him, which frightens you more than his death does. "
                    "Balish move through your tent by the thousand now. You stop counting your own "
                    "thumb's old scars."),
         overlay=dict(big="4,000 BALISH", sub="A YEAR THROUGH YOUR TUMEN")),
    dict(id="t16", level=None, template="yamRelayStation", gap=1.4,
         narration=("A relay rider changes horses at your post without slowing to a full stop, already "
                    "three hundred miles into a run that will end six hundred more away by tomorrow "
                    "night. The Yam carries grain prices, troop counts, a wedding announcement, all at "
                    "the same reckless speed — the fastest messages on earth for the next six centuries. "
                    "It's the best thing this empire ever built. It's also how bad news travels exactly "
                    "as fast as good."),
         overlay=dict(big="185 MILES", sub="A DAY. FASTEST ON EARTH.")),

    # ---- MIDPOINT REVERSAL — Möngke's death, the civil war, Ganbaatar's taunt ----
    dict(id="t17", level=None, template="commission",
         narration=("Möngke Khan dies in a siege camp in China, and by the one law even the empire "
                    "never bends — only his bloodline can rule — two of his brothers claim the same "
                    "throne inside the same season. Ganbaatar backs the brother who will lose. "
                    "Therefore he corners you at the kurultai's edge with the calm of a man who's "
                    "already decided you picked wrong too. Chuluun hasn't chosen yet. You beg him, "
                    "once, to just stay out of it."),
         overlay=dict(big="2 KHANS", sub="CLAIMING ONE THRONE"),
         dialogue=dict(text="You picked wrong, or Chuluun did. Same thing now.")),
    dict(id="t18", level=None, template="steppeRaid",
         narration=("Chuluun rides for the side that holds the capital, the side you'd have picked too, "
                    "and it isn't enough. A skirmish nobody bothers naming in the histories takes him "
                    "three days before the war's outcome is even decided either way. Don't ask which "
                    "side actually won that field. It doesn't matter anymore who did. Your thumb finds "
                    "the old bow-callus without being told to. It doesn't register anything. That's the "
                    "part that scares you."),
         overlay=None),

    # ---- LEVEL 06 · REGIONAL NOYAN · GOVERNOR ----
    dict(id="t19", level="LEVEL 06  ·  REGIONAL NOYAN  ·  GOVERNOR", template="khanAudienceTent",
         narration=("The winning side remembers who held the line and rewards you with a province "
                    "instead of a battlefield — regional noyan, governor of land wider than the steppe "
                    "you grew up on. A paiza tablet, gold and stamped with the Khan's seal, buys you "
                    "fresh horses at every post between here and the capital. Eleven thousand balish "
                    "move through your ledger every year. You keep three hundred. The rest climbs the "
                    "Yam north, out of your hands entirely."),
         overlay=dict(big="11,000 BALISH", sub="A YEAR. YOU KEEP 300.")),
    dict(id="t20", level=None, template="yamRelayStation",
         narration=("Your own relay post now, two hundred fresh horses standing ready for riders who "
                    "never explain themselves and never need to. A trader once told you the fastest "
                    "courier in his own country covers seventy miles in a hard day. Yours cover three "
                    "times that, and have for forty years already. The empire's real power was never "
                    "the horde. It was always how fast the horde could hear."),
         overlay=None),
    dict(id="t21", level=None, template="merchantHouse",
         narration=("Under the Khan's peace, caravans move safer through your province than they ever "
                    "did under their own kings — silk, spice, and a merchant class that grows fat "
                    "calling it the Khan's road instead of anyone's country. Ganbaatar administers the "
                    "province beside yours now, older, colder, civil in the specific way old enemies get "
                    "once open war stops paying. Neither of you mentions Chuluun's name at the border "
                    "markers where your two territories meet."),
         overlay=None),
    dict(id="t22", level=None, template="debrief",
         narration=("A tax officer under you skims silver off three years of tribute rolls before the "
                    "shortfall surfaces. The Yassa doesn't care that he's competent, or that you like "
                    "him. It cares that the law survives him more than he does. You sign the order "
                    "yourself, the way Chuluun once signed his own harder ones. Word of the execution "
                    "reaches the capital faster than the silver ever did — and the capital, this time, "
                    "is watching you specifically."),
         overlay=None),

    # ---- LEVEL 07 · KHAN OF THE KHANATE ----
    dict(id="t23", level="LEVEL 07  ·  KHAN OF THE KHANATE", template="throne",
         narration=("The empire that once answered to one name now answers to four — Golden Horde, "
                    "Chagatai, Ilkhanate, and the Khan's own line in the east — and yours is one of "
                    "them. A throne, a seal, ninety thousand balish a year that no longer climbs north "
                    "to anyone above you. Not the whole house. A quarter of one, with your name freshly "
                    "carved over the door."),
         overlay=dict(big="90,000 BALISH", sub="THE KHANATE'S YEARLY TAKE")),
    dict(id="t24", level=None, template="portraitHall",
         narration=("Only Chinggis Khan's blood can sit a khanate's throne — the one law even the civil "
                    "war never touched. A hall in your capital holds the painted faces of every khan of "
                    "your line, four so far, a fifth frame left deliberately, uncomfortably empty. A "
                    "letter arrives from the Ilkhanate that month, sealed in a hand you don't recognize, "
                    "asking after a debt no one in your court will explain to you. You set it aside. You "
                    "don't answer it."),
         overlay=None),
    dict(id="t25", level=None, template="teaCeremony",
         narration=("Ganbaatar rules the khanate bordering yours now, and peace between you is a "
                    "marriage alliance neither of you wanted, negotiated over tea neither of you drinks. "
                    "He's grayer than Chuluun was the day he found you in the wreckage of your first "
                    "raid. Some nights, he says, he still hears Chuluun's name and reaches for an "
                    "apology he's never once actually offered. You don't offer him one either."),
         overlay=None),
    dict(id="t26", level=None, template="praetorians",
         narration=("Your own kheshig now, chosen the same way the Khan once chose you — by deed, not "
                    "blood. The throne you sit is real, the guards at your door are real, and none of "
                    "it changes the fifth empty frame in the portrait hall or the letter still unanswered "
                    "on your desk. Then, at midwinter, a rider from the eastern capital arrives with a "
                    "summons carrying the Great Khan's own seal, not a khanate's."),
         overlay=None),

    # ---- LEVEL 08 · KHAGAN · GREAT KHAN — get it, at cost, resolving the cold open ----
    dict(id="t27", level="LEVEL 08  ·  KHAGAN  ·  GREAT KHAN", template="khaganThrone", gap=0.7,
         narration=("Khagan. Great Khan. The title Chinggis himself held, offered to you at a kurultai "
                    "that three of the four khanates don't bother sending anyone to attend. Lacquer and "
                    "cold brass under your palms, exactly as it will be decades from now, exactly as it "
                    "is right now for the first time. Four hundred thousand balish move through the "
                    "whole empire's treasury a year, on paper. On paper is doing quite a lot of the work "
                    "in that sentence."),
         overlay=dict(big="400,000 BALISH", sub="THE WHOLE TREASURY, ON PAPER")),
    dict(id="t28", level=None, template="signing",
         narration=("Your treasury stops moving silver at all and starts printing paper instead — "
                    "mulberry bark pressed thin, stamped with your seal, worth exactly as much as your "
                    "word is. You sign the decree yourself: refuse it in payment, or print your own, and "
                    "the penalty is death, printed on the note like a dare. It works. Merchants who've "
                    "never met you accept a square of bark as gold because your name is on it. Not one "
                    "of them has ever seen your face."),
         overlay=dict(big="DEATH", sub="FOR REFUSING YOUR OWN MONEY")),

    # ---- LOOP CLOSE — one-door-left-open, resolving the cold open, leaving the universe thread ----
    dict(id="t29", level=None, template="khaganThrone",
         narration=("A herald rides the Yam from the western khanates with an answer you already knew "
                    "was coming before he opens his mouth: three of the four no longer recognize Khagan "
                    "as a title with any real teeth in it, only a courtesy, extended or not at their "
                    "pleasure. The seal buys silk. The seal buys silver. The seal has never once, not "
                    "today, bought back the men who used to kneel without being asked."),
         overlay=dict(big="3 OF 4", sub="KHANATES THAT DON'T ANSWER"),
         dialogue=dict(text="Three of four. The fourth was always going to be the hard one.")),
    dict(id="t30", level=None, template="window",
         narration=("Alone in the map room after everyone else has gone to sleep, your seal ring "
                    "sitting where the bow-callus used to be, worn smooth by forty years instead of a "
                    "bowstring. The Ilkhanate's letter is still on the desk, still unopened, the name on "
                    "it still unfamiliar. Somewhere past the western horizon a boy you'll never meet is "
                    "counting a herd that doesn't add up, the same way you once did. You don't open the "
                    "letter tonight either."),
         overlay=None),
]
