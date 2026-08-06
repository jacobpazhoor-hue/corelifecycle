#!/usr/bin/env python3
"""Your Life as Every Rank in the Ottoman Empire — POV doodle build, ~12 min.
Grounded in docs/research/ottoman_empire.md (web-verified Aug 2026: osmanlitarihi.tr, realmofhistory.com,
military-history.fandom.com/Wikipedia "Janissary", Wikipedia "Timar", hurriyetdailynews.com, belleten.gov.tr,
topkapipalace.com.tr, listverse.com/smithsonianmag.com). History format (per topic_queue.json: "Your Life
as Every Rank in the Ottoman Empire"). Second-person present-tense POV: the viewer IS a composite
devshirme-collected Balkan peasant boy climbing the REAL, documented Ottoman "kul" (slave-of-the-sultan)
pipeline — Balkan peasant boy -> Acemi oğlan (VERIFIED: devshirme, ~1 boy per 40 households, ages
roughly 8-20) -> Janissary (VERIFIED: 3 akçe/day entry wage + 12 akçe/quarter cloth + 30 akçe weapons;
forbidden to marry) -> Çorbacı (VERIFIED: the literal "soup-maker" officer title; VERIFIED 10 akçe/day
cavalry-track promotion floor; the regimental cauldron/kazan-i-şerif and its overturning as the formal
signal of mutiny) -> Sanjakbey (VERIFIED ziamet revenue band, 20,000-99,999 akçe/yr) -> Beylerbey/Pasha
(VERIFIED hass revenue band, 100,000+ akçe/yr, three horsetails) -> Vizier (a Divan-ı Hümayun seat; the
VERIFIED Tower of Justice grille, Kafes-i Müşebbek, through which the sultan or Valide Sultan could watch
unseen) -> Grand Vizier/Sadrazam (VERIFIED: held the sultan's seal; VERIFIED apex-cost number, 44 of 284
Grand Viziers executed on direct sultan's order across Ottoman history, 11 more dead in rebellions). The
midpoint reversal is grounded in the REAL, documented 1622 Janissary mutiny that deposed and killed
17-year-old Sultan Osman II — the first Ottoman sultan ever killed by his own corps — happening here
around a FICTIONAL COMPOSITE protagonist and mentor, not a claim either is a specific real historical
figure. The law of fratricide and the bostancıbaşı (head-gardener executioner) are referenced only as
verified background texture. You, Elena, Davud Ağa, and Yusuf are a FICTIONAL COMPOSITE; no real Ottoman
figure (Osman II, Mehmed II, Sokollu Mehmed Pasha) is depicted as this episode's protagonist.

STRUCTURAL VARIATION vs the last 2 produced (gladiator = AFTERMATH cold open / rise-then-reversal-then-
rise / TORCH-PASSING ending; astronaut = FLASH-FORWARD cold open / dual-track-divergence / PURE CYCLICAL
ending): this cold open is MID-ACTION — a silk-cord execution case set down in front of the protagonist,
cut away before whose name is on it. Act two's shape is RISE-THEN-FRACTURE: the personal climb never
reverses in rank, but the SYSTEM itself cracks at the midpoint (the corps proves it can kill its own
sultan), which is the causal reason the protagonist is pushed out of the military track and into
administration. The ending is CYCLICAL BUT DELIBERATELY UNRESOLVED — the loop closes on the exact same
case from the cold open, this time confirmed as someone else's, while the episode's one deliberate
unresolved universe thread (a sealed letter from the harem) stays sealed.

PROMISE -> PAYOFF LEDGER (ids match the final t01-t32 sequence):
  * t01 cold open (the silk-cord case, whose name is on it) -> RESOLVED at t32 (confirmed NOT yours, this time)
  * t02 promise/cost-line ("wanting this costs more than anyone tells an eight-year-old") -> paid across t19/t20 (you become the one counting other families' sons) and t32
  * sensory anchor: the wooden spoon tucked into the Janissary cap -> introduced t07 -> re-triggered t26 -> maximal payoff t32 ("the boy who was only ever fed by someone else's hand")
  * Elena, the named person/want                                  -> introduced t03 -> the unread letter t08 -> PAID OFF at t30 (she can finally read it herself)
  * Davud Ağa, the named mentor                                    -> warns you t07 -> ages under political strain t14 -> the loss payoff (dies stopping the mutiny) t17
  * Yusuf, the named rival                                         -> introduced t11 -> the granary/moral-cost contrast t14 -> taunts you at the midpoint t17 -> the bribery offer t21 -> his failed maneuver against you t27 -> the closing dialogue line t31
  * share-worthy fact #1: the cauldron-mutiny mechanic -> set up t07 -> pays off for real at the VERIFIED 1622 regicide, t16/t17
  * share-worthy fact #2: the Tower of Justice grille (someone may always be watching) -> introduced t25 -> escalates to watching YOU at t31
  * the 44-of-284 Grand Vizier execution stat -> foreshadowed t01 and t26 -> personal arithmetic t31 -> the unresolved dread of t32
  * THE ONE DELIBERATE UNRESOLVED UNIVERSE THREAD: the sealed letter from the harem -> planted t24 -> still sealed, still unopened, at t32
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — MID-ACTION, cut away before whose name is on the case ----
    dict(id="t01", level=None, template="sultanAudience", gap=0.7,
         narration=("A small silk-covered case lands on the cushion in front of you — no herald, no "
                    "warning, just an enormous hand setting it down and stepping back. Cedar and "
                    "rosewater fill the hall. A fountain keeps running like nothing is happening. "
                    "Forty-four men who sat exactly here opened a case like this one and never walked "
                    "back out. Nobody has said your name yet."),
         overlay=dict(big="44 OF 284", sub="GRAND VIZIERS THE SULTAN STRANGLED")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="fileWall",
         narration=("Rewind forty years. None of this exists yet — you're a name nobody has counted "
                    "yet. Somewhere in Istanbul a clerk keeps a ledger of every Balkan household, "
                    "tallying which ones owe the empire a son this cycle. One boy for every forty "
                    "families. You want to matter to someone bigger than a village. Wanting that costs "
                    "more than anyone tells an eight-year-old."),
         overlay=None),

    # ---- LEVEL 01 · A BALKAN VILLAGE ----
    dict(id="t03", level="LEVEL 01  ·  A BALKAN VILLAGE", template="balkanVillage",
         narration=("Your sister Elena is seven, missing her front teeth, and insists on carrying "
                    "water in a jug too big for her arms because you always let her win the argument. "
                    "The house has one good coat between three of you, and a woodsmoke smell that "
                    "never leaves your clothes. Church bells count the hours here, not money. You have "
                    "never once eaten meat on a weekday."),
         overlay=None),
    dict(id="t04", level=None, template="dinner",
         narration=("Your mother portions the bread by weight, not by hunger, and nobody complains "
                    "out loud about the piece smaller than yesterday's. Elena trades you her crust for "
                    "a story instead, same as every night — the one about the sultan who lives past "
                    "the mountains, more gold than God. You tell it easy. You've never once believed "
                    "you'd get closer to him than that."),
         overlay=None),
    dict(id="t05", level=None, template="fileWall",
         narration=("A rider in a green turban reads names off a paper roll at the village well, and "
                    "the well goes quiet in a way it never does for tax collectors. One boy for every "
                    "forty households this cycle — the imam's ledger and the priest's ledger agree on "
                    "the count before either man says a word to your mother. Elena's hand finds yours "
                    "under the table that night. She doesn't ask why it's shaking."),
         overlay=dict(big="1 IN 40", sub="HOUSEHOLDS PAY IN SONS")),

    # ---- LEVEL 02 · ACEMI OĞLAN ----
    dict(id="t06", level="LEVEL 02  ·  ACEMI OĞLAN", template="balkanVillage",
         narration=("The wagon takes four boys from three villages, and you're the only one who "
                    "doesn't cry before the church spire disappears behind the ridge — not bravery, "
                    "just a numbness that scares you more than crying would. An official strips you to "
                    "check for illness, files your name in a Turkish spelling you don't recognize yet, "
                    "and hands you a red felt cap. Elena's crust of bread is still in your pocket, "
                    "going hard."),
         overlay=None),
    dict(id="t07", level=None, template="janissaryBarracks",
         narration=("Barracks çorbacı Davud Ağa claims eleven of you before the others even get names "
                    "assigned, and his first lesson has nothing to do with a sword. The regimental "
                    "cauldron simmers day and night in the yard — mutton fat, woodsmoke, the smell "
                    "that means home for the rest of your life starting tonight. He tucks a wooden "
                    "spoon into your new cap himself, the corps' oldest mark of belonging to no one "
                    "else."),
         overlay=None,
         dialogue=dict(text="The cauldron feeds you now. Everything it gives you, it can also take back.")),
    dict(id="t08", level=None, template="legionDrill",
         narration=("Drill starts before sunrise and doesn't stop for weather, blistered palms, or the "
                    "boy three files down who faints twice in one week and disappears by dinner. "
                    "Janissaries don't marry, don't grow a beard, don't own land — the corps is "
                    "legally your whole family now, married to a cauldron instead of a wife. You write "
                    "Elena a letter you're not sure will ever reach a girl who can't read it herself."),
         overlay=None),

    # ---- LEVEL 03 · JANISSARY (minute-3 spectacle) ----
    dict(id="t09", level="LEVEL 03  ·  JANISSARY", template="siegeWalls", gap=0.7,
         narration=("Your first campaign is a fortress on the Danube that won't fall quietly — cannon "
                    "smoke rolling low over the ditch, the ladder crew ahead of you screaming a name "
                    "that stops being a word by the third try. Davud Ağa's hand closes on your collar "
                    "before you can climb after them, hard enough to bruise, and shoves you flat half "
                    "a second before the wall answers with grapeshot. Somebody else's blood is warm "
                    "across your face."),
         overlay=None),
    dict(id="t10", level=None, template="janissaryBarracks",
         narration=("Three akçe a day, paid after the siege — your first wage, plus twelve akçe for "
                    "the quarter's cloth and thirty for powder and shot, none of it enough to matter "
                    "and all of it entirely yours for the first time in your life. Davud Ağa doesn't "
                    "celebrate with you. He counts the eleven boys he claimed and finds only nine "
                    "still breathing, and says both missing names out loud once, then never again."),
         overlay=dict(big="3 AKÇE/DAY", sub="YOUR FIRST WAGE, ANYONE'S")),
    dict(id="t11", level=None, template="merchantHouse",
         narration=("Yusuf came off the same wagon as you four years ago, faster with a blade and "
                    "colder about who it gets used on, and he's already trading a dead officer's boots "
                    "to a bazaar broker before the man is properly buried. He offers you a cut without "
                    "lowering his voice. You say no. He shrugs like your no costs him nothing — which, "
                    "this early, it doesn't."),
         overlay=None),
    dict(id="t12", level=None, template="legionCamp",
         narration=("Night camp after the campaign, cauldron smoke drifting low over rows of tents, "
                    "and Davud Ağa reads the dead out loud before anyone's allowed to eat — a ritual "
                    "older than the corps' current borders. He makes you repeat two names from a "
                    "different orta entirely, boys you never met. Grief, in this army, is deliberately "
                    "made everyone's job, not just the ones who loved them."),
         overlay=None),

    # ---- LEVEL 04 · ÇORBACI ----
    dict(id="t13", level="LEVEL 04  ·  ÇORBACI", template="janissaryBarracks",
         narration=("Ten akçe a day now, an orta of a hundred men, and a title that translates, "
                    "literally, to a joke a hundred years of soldiers would laugh you out of the yard "
                    "for not knowing: soup-maker. You command a cauldron before you command men, in "
                    "this corps — feed them right and they follow you into cannon fire. Davud Ağa "
                    "salutes you first, before anyone else does, and means it."),
         overlay=dict(big="10 AKÇE/DAY", sub="AN ORTA OF 100 MEN")),
    dict(id="t14", level=None, template="shieldWall",
         narration=("A relief column you're leading takes a border town that surrendered an hour "
                    "before you arrived, and Yusuf's men torch the granary anyway, on nobody's order "
                    "but his own. You could report it. You watch the grain smoke instead, and file the "
                    "silence away as a decision, not an accident — the first one of those, and nowhere "
                    "close to the last."),
         overlay=None),
    dict(id="t15", level=None, template="warCouncil",
         narration=("Word moves through every orta faster than any official order: the young sultan's "
                    "own advisors keep him boxed away from the men, and unpaid campaigns are making an "
                    "army do arithmetic about who it actually answers to. Davud Ağa says nothing in "
                    "the command tent that isn't safe to repeat outside it. His silence, lately, has "
                    "started sounding like its own kind of warning."),
         overlay=None),
    dict(id="t16", level=None, template="janissaryBarracks", gap=1.4,
         narration=("Nobody eats from the cauldron the morning it happens. Word passes orta to orta "
                    "without a single man raising his voice — the food untouched, the yard too quiet "
                    "for a barracks this size. Davud Ağa's face is doing something new. Not fear, "
                    "exactly. Grief, maybe, for something that hasn't finished happening yet."),
         overlay=None),

    # ---- MIDPOINT REVERSAL — the verified 1622 regicide ----
    dict(id="t17", level=None, template="cauldronRevolt",
         narration=("The cauldron goes over on its side and nobody sets it back up. Seventeen-year-old "
                    "Sultan Osman II is dragged off his horse streets from here by men who used to "
                    "salute him, and by nightfall he's dead by a bowstring — the first sultan this "
                    "corps has ever killed instead of served. Davud Ağa goes into the crowd to stop it "
                    "and doesn't come back out of it. Yusuf finds you after, calm, already "
                    "recalculating."),
         overlay=dict(big="1622", sub="A SULTAN, KILLED BY HIS OWN CORPS"),
         dialogue=dict(text="Pick a side before the corps picks it for you.")),
    dict(id="t18", level=None, template="fileWall",
         narration=("Istanbul spends a week pretending it's an orderly city, but a corps that can "
                    "strangle its own sultan isn't a safe thing for anyone to be quietly loyal to "
                    "anymore — including you. A patron who once watched you refuse a burning granary "
                    "files your name for a different kind of promotion: administration, not command. "
                    "Quieter, is the idea. Nowhere in this empire turns out to actually be that."),
         overlay=None),

    # ---- LEVEL 05 · SANJAKBEY ----
    dict(id="t19", level="LEVEL 05  ·  SANJAKBEY", template="lordAudience",
         narration=("A district comes with the title — a modest one, a ziamet worth some twenty "
                    "thousand akçe a year, sipahi cavalry owed to you by law, and a hall full of "
                    "villagers kneeling for decisions you're now the one making instead of receiving. "
                    "None of the revenue is a wage. All of it passes through your hands on its way "
                    "somewhere above you, which is, it turns out, the actual design."),
         overlay=dict(big="20,000 AKÇE", sub="A DISTRICT'S REVENUE, NOT A WAGE")),
    dict(id="t20", level=None, template="balkanVillage",
         narration=("A tax dispute sends you to a village that could be any village — stone houses, "
                    "one good coat between families, a church spire on the far ridge — and you "
                    "collect the levy from a mother who looks at your rank and not your face. "
                    "Somewhere, a clerk in a ledger like the one that once took you is counting her "
                    "sons too. You don't ask which one. You already know how that question ends."),
         overlay=None),
    dict(id="t21", level=None, template="merchantHouse",
         narration=("Yusuf holds the district next to yours now, richer than the revenue on paper "
                    "should allow, and he explains the math without embarrassment over spiced coffee: "
                    "a broker skims the tax count, a clerk looks away for a cut, everyone above them "
                    "assumes the shortfall is just a bad harvest year. You decline, again. He tells "
                    "you, not unkindly, that declining gets more expensive every rank you climb."),
         overlay=None),

    # ---- LEVEL 06 · BEYLERBEY / PASHA ----
    dict(id="t22", level="LEVEL 06  ·  BEYLERBEY / PASHA", template="keepTop",
         narration=("Three horsetails now, planted outside a citadel that's yours to hold, a hass "
                    "grant worth more than a hundred thousand akçe a year moving through accounts that "
                    "still aren't your money any more than the ziamet was. From the wall, the province "
                    "looks like something you own. It isn't. You administer it for a throne you've "
                    "still never once stood in front of."),
         overlay=dict(big="100,000+ AKÇE", sub="A PROVINCE. STILL NOT YOURS")),
    dict(id="t23", level=None, template="siegeWalls",
         narration=("A rebellion in a border sanjak puts you on the other side of a siege you once "
                    "climbed a ladder into as somebody else's soldier. You give the order this time, "
                    "flat, without flinching — the same order Davud Ağa once gave over your own collar "
                    "to keep you alive. The wall falls by dusk. Nobody drags you back from the breach "
                    "this time. Distantly, that should matter more than it does."),
         overlay=None),
    dict(id="t24", level=None, template="praetorians",
         narration=("A summons arrives under the Grand Vizier's own seal: come to the capital, a "
                    "Divan seat is open. A eunuch hands you a second letter first, unmarked, sealed in "
                    "violet wax nobody in your household recognizes — from the harem, is all anyone "
                    "will confirm, no further name attached. You don't open it. Something tells you "
                    "this isn't a letter meant to be opened yet."),
         overlay=None),

    # ---- LEVEL 07 · VIZIER ----
    dict(id="t25", level="LEVEL 07  ·  VIZIER", template="divanChamber",
         narration=("The Divan meets under a domed ceiling and a small latticed window set high in "
                    "the far wall — the Tower of Justice, built so the sultan, or his mother, can "
                    "watch every session unseen. Nobody in this room ever knows, in the moment, "
                    "whether the throne is listening. You learn to speak like it always is. Everyone "
                    "in this hall already has."),
         overlay=dict(big="WHO'S WATCHING?", sub="THE THRONE, OR HIS MOTHER")),
    dict(id="t26", level=None, template="portraitHall",
         narration=("The Grand Vizier's residence keeps a hall of portraits going back generations — "
                    "former sadrazams, former devshirme boys same as you, four gilt frames and a fifth "
                    "left conspicuously empty. Your host mentions it almost as small talk: forty-four "
                    "men who've held that title were strangled on direct order of the sultan they "
                    "served. He says it the way other men mention weather."),
         overlay=None),
    dict(id="t27", level=None, template="merchantHouse",
         narration=("Yusuf spends a month building a case against your appointment out of half-true "
                    "reports and a debt you paid off years ago, and it almost works — until a "
                    "defterdar's audit clears you faster than anyone expected. He doesn't apologize "
                    "when the seal comes to you instead of him. He starts, immediately and visibly, "
                    "the arithmetic of surviving the losing side of it."),
         overlay=None),
    dict(id="t28", level=None, template="divanChamber",
         narration=("The sultan's own seal comes to you on a velvet cushion, an appointment nobody in "
                    "the Divan objected to out loud, whatever they said in private afterward. Yusuf, "
                    "three seats down, congratulates you with a smile that doesn't reach anywhere near "
                    "his eyes. In your coat, a campaign spoon you've carried since you were eleven "
                    "presses flat against your ribs."),
         overlay=None),

    # ---- LEVEL 08 · GRAND VIZIER (SADRAZAM) — apex ----
    dict(id="t29", level="LEVEL 08  ·  GRAND VIZIER (SADRAZAM)", template="sultanAudience", gap=0.7,
         narration=("Sadrazam. The seal is yours, the armies answer to you as Serdar-i Ekrem in the "
                    "field, and there isn't a free-born pasha in this empire who outranks a former "
                    "slave standing exactly where you're standing now. Cedar and rosewater again — the "
                    "same hall this all started in, except this time it's your own name the herald "
                    "calls first, not somebody else's."),
         overlay=dict(big="SADRAZAM", sub="THE SEAL IS YOURS")),
    dict(id="t30", level=None, template="warCouncil",
         narration=("You move armies with a signature and treasuries with a sentence — more real "
                    "power over more real land than any king currently ruling in Europe. None of it is "
                    "technically yours. A courier brings unrelated news the same week: Elena, married "
                    "now, three children, two good coats in the house instead of one. You send money "
                    "north. She sends back the letter you once couldn't write her — reaching a girl "
                    "who can finally read every word of it herself."),
         overlay=None),
    dict(id="t31", level=None, template="divanChamber",
         narration=("The grille sits above your own council now, and some mornings the shadow behind "
                    "it lingers a beat longer than procedure requires. Forty-four Grand Viziers "
                    "strangled on direct order, out of two hundred eighty-four who ever held this "
                    "exact seal — you did the arithmetic your first week and never once said it out "
                    "loud. Roughly one in six. By any honest measure, you're overdue."),
         overlay=dict(big="44 OF 284", sub="ONE IN SIX. YOU'RE OVERDUE."),
         dialogue=dict(text="Everyone up here is overdue, dostum. Some of us just haven't opened the case yet.")),

    # ---- LOOP CLOSE — cyclical, deliberately unresolved ----
    dict(id="t32", level=None, template="sultanAudience",
         narration=("The silk-covered case again — same hall, same fountain running like nothing is "
                    "happening, the same enormous hand setting it down without a sound. This time it "
                    "isn't for you. It's for the pasha kneeling one cushion over, and the relief in "
                    "your chest is uglier than any grief you can find for him. In your coat, an old "
                    "campaign spoon presses flat against your ribs — the boy who was only ever fed by "
                    "someone else's hand, still in here somewhere. The letter from the harem is still "
                    "in your other pocket, still sealed."),
         overlay=dict(big="NOT TODAY", sub="THE CASE ISN'T YOURS THIS TIME")),
]
