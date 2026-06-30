#!/usr/bin/env python3
"""Your Life as Every Rank in the Roman Empire — POV doodle build, ~12.5 min, template-driven.
Grounded in docs/research/roman_empire.md (legion ranks + the cursus, early/high Empire / Principate).
Second-person, present-tense POV: the viewer IS the soldier, climbing tiro -> legionary -> optio ->
centurion -> primus pilus (knight) -> legate/general/imperator -> Caesar -> the people ABOVE Caesar
(the Praetorian Guard, the frontier legions, the Senate, the mob, the gods).

DUAL SPINE (money + reach): a real MONEY/property escalation in the gold overlay — 0 DENARII (a debt
and one tunic) -> 225 DENARII/YR (the Augustan legionary wage, minus deductions) -> ~450 (optio,
double pay) -> ~3,375 (centurion, ~15x a ranker) -> 400,000 SESTERCES (primus pilus = the equestrian
census, a knight) -> 1,000,000 SESTERCES (legate = the senatorial census) -> ALL OF ROME (Caesar, the
treasury) -> 25,000 SESTERCES/MAN (the per-soldier price the Guard literally auctioned the Empire for
in 193 AD). The apex twist: even the throne has a price, and it is the least safe seat on earth.

STORY: mentor DRUSUS — a grizzled centurion with the vine staff (vitis) who trains you, names his
dead, and teaches the brutal truth ("most men don't get the land"). He falls in battle and presses the
vitis into your hands (your promotion-into-centurion payoff); his dying line "hold them" recurs and pays
off at your assassination. The home you climb for: your sister LIVIA, eating barley paste in the village,
and the seized family farm you swore to buy back. The cost: the higher you rise, the further from home —
at the top you own the world and have nowhere to return (the L5 homecoming reversal). Open loop (cold
open): the TRIUMPH — gold chariot, red-painted face, the slave's whisper "remember you are mortal" —
lived at L6 and paid off at L8 as you are murdered. Cyclical close: a new boy of seventeen swears the
same oath; the chariot is always waiting, it only changes who stands in it.

Theme (anaphora): "Money buys silver. Money buys rank. Money cannot buy the road home." /
"You climb to be safe; the throne is the most dangerous chair ever built."
Share-worthy true beats: the pay-minus-deductions ("you pay Rome to die for it"); DECIMATION; the
TRIUMPH whisper; CLAUDIUS found behind a curtain; the 193 AD AUCTION of the Empire; Vespasian's joke.

Topic templates: ROMAN pack (triumph/romanOath/legionDrill/legionCamp/shieldWall/centurionVitis/
firstSpear/forumScene/warCouncil/throne/senate/praetorians) + universal dinner. No two adjacent scenes
share a template. Each scene: id, level (label on first scene of each level, else None), narration
(~70 words POV), overlay ({big,sub} or None), template. Dramatized/cautionary history, never how-to.
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — the triumph (the apex; cut away before it resolves) ----
    dict(id="t00", level=None, template="triumph",
         narration=("Gold wheels grind over stone. Four white horses. A whole city screaming your name. Your face is "
                    "painted red — like Jupiter, like a god. And behind you in the chariot a slave leans close and "
                    "whispers the only true thing said all day: remember you are mortal. You climbed your entire life "
                    "to stand here, in the most dangerous chair on earth. You just don't know that yet."),
         overlay=dict(big="ALL OF ROME", sub="THE TRIUMPH · REMEMBER YOU ARE MORTAL")),

    # ---- LEVEL 1 — THE TIRO (recruit) ----
    dict(id="t01", level="LEVEL 01  ·  THE TIRO", template="romanOath",
         narration=("Rewind. You are seventeen. A village you could spit across. A sister, Livia, who eats barley "
                    "paste twice a day. A family farm the tax men took. You want it back, so you walk to the recruiter "
                    "and swear the sacramentum — the soldier's oath — to an emperor a thousand miles away. Twenty-five "
                    "years of service. No pay yet. One tunic, a debt, and a promise: survive, and Rome gives you land. "
                    "You believe it."),
         overlay=dict(big="0 DENARII", sub="THE TIRO · A DEBT AND ONE TUNIC")),
    dict(id="t02", level=None, template="legionDrill",
         narration=("Training is built to break you. It works. Twenty Roman miles a day under full load — armor, "
                    "shield, stakes, three days' grain. You build a marching camp at dusk. You tear it down at dawn. "
                    "You build it again. Your feet split; your hands harden. A centurion named Drusus runs you ragged, "
                    "a worn vine staff in his fist. Most men, he says, never get the land. You decide, quietly, to be "
                    "the exception."),
         overlay=None),
    dict(id="t03", level=None, template="legionCamp",
         narration=("Night in the camp. Eight of you to a tent — your contubernium, the only family the legion gives "
                    "you. One fire, one millstone, one fear nobody says aloud. Drusus sits against a stake and names "
                    "his dead — Gaius, Maximus, the boy whose name he never learned. You ask why he stays. He watches "
                    "the fire a long time. Because out there, he says, there is nothing left to go back to. You don't "
                    "understand him yet."),
         overlay=None),

    # ---- LEVEL 2 — THE LEGIONARY ----
    dict(id="t04", level="LEVEL 02  ·  THE LEGIONARY", template="shieldWall",
         narration=("Your first battle. You are a miles gregarius now — a ranker in the line. The shields lock. The "
                    "man beside you is your wall; you are his. Drusus's voice cuts over the screaming, the same two "
                    "words again and again: hold them. Hold them. A spear takes the man on your right through the "
                    "throat. You step into his place. You do not run. And the pay for standing where men die is two "
                    "hundred twenty-five denarii a year."),
         overlay=dict(big="225 DENARII / YR", sub="THE LEGIONARY · THE PAY TO STAND AND DIE")),
    dict(id="t05", level=None, template="legionDrill",
         narration=("Here is what no recruiter says. From those two hundred twenty-five denarii, the legion takes its "
                    "cut — for your food, your boots, your tent. They even charge you into the burial club, so that "
                    "when you fall, the others can bury what's left. You do the sum on a "
                    "march and laugh until it isn't funny: you are paying Rome for the privilege of dying for it."),
         overlay=None),
    # ---- LEVEL 3 — THE OPTIO ----
    dict(id="t07", level="LEVEL 03  ·  THE OPTIO", template="centurionVitis",
         narration=("You are good at this — alive at the end of days that kill better men, and people notice. So they "
                    "make you optio. Double pay — four hundred and fifty denarii — and a darker job. You no "
                    "longer just hold the line; you stop eighty other men from breaking it. You stand behind them in "
                    "battle so they cannot run without going through you. The first time you shove a terrified boy "
                    "back into the shields, you see your own first battle in his eyes. You do it anyway. Rank is just "
                    "being the one who makes others stay."),
         overlay=dict(big="~450 DENARII / YR", sub="THE OPTIO · DOUBLE PAY · 80 MEN AT YOUR BACK")),
    dict(id="t08", level=None, template="shieldWall",
         narration=("A mountain campaign. The line buckles — a flank gives, men start to peel away — and it is your "
                    "job to weld them back. You scream Drusus's words until your voice tears: hold them, hold them. "
                    "You drive your own men forward, and somehow the line holds, and the day is won. Afterward your "
                    "hands are steady. That is the part that should frighten you."),
         overlay=None),
    dict(id="t09", level=None, template="legionDrill",
         narration=("Another cohort runs. Not yours — but Rome does not forgive cowardice. The legate orders the old "
                    "punishment, the one you prayed never to see: decimation. The cohort is lined up. Lots are drawn. "
                    "One man in every ten is chosen, then beaten to death by the nine who stood beside him. You watch "
                    "a man club his own tentmate into the dirt to avoid joining him. That is Rome's logic, naked: fear "
                    "costs less than loyalty."),
         overlay=dict(big="ONE IN TEN", sub="DECIMATION · KILLED BY THE NINE BESIDE HIM")),

    # ---- LEVEL 4 — THE CENTURION (Drusus falls — the staff passes) ----
    dict(id="t10", level="LEVEL 04  ·  THE CENTURION", template="shieldWall",
         narration=("Level four begins the way everything in the legion ends — in blood. A river crossing, an ambush, "
                    "the line folding. Drusus is in front of you when the spear finds him, low, under the ribs. He "
                    "goes down in the mud still saying it, quieter now: hold them. You drag him behind the shields. He "
                    "presses the vine staff into your hands. Take it, he says. Earn the land. Go home. Then the old "
                    "man is gone."),
         overlay=None),
    dict(id="t11", level=None, template="centurionVitis",
         narration=("They confirm what the dead man started: you are a centurion now. Eighty men answer your whistle. "
                    "The vitis in your fist is more than a staff — it is a licence to flog, and you use it. Three "
                    "thousand denarii a year, fifteen times a ranker's wage. "
                    "And when a boy of seventeen swears the oath in front of you, you hear your own voice promise him "
                    "the land — and wonder if Drusus ever believed it."),
         overlay=dict(big="~3,375 DENARII / YR", sub="THE CENTURION · 80 MEN · THE VINE STAFF")),
    dict(id="t12", level=None, template="legionCamp",
         narration=("You name your dead now, the way he did. You sit against a stake and say "
                    "the names to the fire, and you finally understand him: there is nothing to go back to, because "
                    "the going-back is what you traded away, one campaign at a time. Livia's letters come slower. The "
                    "farm in them is a farm in a story. Money buys silver. Money buys rank. Money cannot buy the road "
                    "home."),
         overlay=None),

    # ---- LEVEL 5 — THE FIRST SPEAR (knight — and the homecoming reversal) ----
    dict(id="t13", level="LEVEL 05  ·  PRIMUS PILUS", template="firstSpear",
         narration=("Level five. Primus pilus — the first spear, chief centurion of the whole legion. The eagle, the "
                    "aquila, stands beside you now; lose it and the legion is disgraced forever. And reaching this "
                    "rank makes you a knight — four hundred thousand "
                    "sesterces, the property of an equestrian, nobility bought with money. The boy with one tunic "
                    "could buy the family farm back a hundred times. So you go home to do it."),
         overlay=dict(big="400,000 SESTERCES", sub="FIRST SPEAR · A KNIGHT BY PROPERTY")),
    dict(id="t14", level=None, template="forumScene",
         narration=("The village is smaller than your memory of it. The farm is someone else's now — sold years ago, "
                    "the new owner polite and afraid of the scarred man with a sword. You ask after Livia. A long "
                    "silence. She married, moved two valleys over, buried a husband, grew old without you. The "
                    "barley-paste girl you climbed twenty-five years to save does not need saving anymore. You have "
                    "the money. There is nothing left to spend it on."),
         overlay=dict(big="THE FARM IS SOLD", sub="EVERYTHING TO SPEND · NOWHERE TO RETURN")),
    dict(id="t15", level=None, template="shieldWall",
         narration=("So you return to the only home that's left — the eagle, the line, the war. And you are "
                    "extraordinary at it now. A frontier breaks; you hold a breach for three days that should have "
                    "fallen in one. When the relief column arrives, your own men lift their swords and roar the word a "
                    "soldier's whole life bends toward: imperator. Commander. The general above you hears it. He does "
                    "not look pleased. He looks at you the way a man looks at a knife."),
         overlay=None),

    # ---- LEVEL 6 — THE GENERAL / IMPERATOR (live the triumph) ----
    dict(id="t16", level="LEVEL 06  ·  THE GENERAL", template="warCouncil",
         narration=("They cannot stop your rise, so they raise you — legate, then a province, then three legions "
                    "moving on your word. You are a senator now: a million sesterces to your name and a share of all "
                    "your soldiers take. You stop counting men and start counting eagles. From the command tent the "
                    "war is clean — lines on vellum, not faces in the mud. You give the order; a boy of seventeen "
                    "steps into a dead man's place. You used to be that boy."),
         overlay=dict(big="1,000,000 SESTERCES", sub="THE GENERAL · A SENATOR · IMPERATOR")),
    dict(id="t17", level=None, template="triumph",
         narration=("And then the day from the very beginning arrives. Rome votes you a triumph. Gold wheels on "
                    "stone, four white horses, your face painted red like a god, a whole city screaming your name. You "
                    "have everything the boy with one tunic dreamed of. And in the chariot behind you the slave leans "
                    "close and whispers it: remember you are mortal. You barely hear him over the crowd. That is the "
                    "mistake — the whisper is the only voice telling you the truth."),
         overlay=dict(big="THE TRIUMPH", sub="YOUR FACE PAINTED AS A GOD")),
    dict(id="t18", level=None, template="banquet",
         narration=("At the banquet the wine is gold and the smiles are not. You have become the most dangerous thing "
                    "in Rome — a general the soldiers love. Senators lean in. Some toast you as the next Caesar. Some "
                    "are already deciding you must never be. You read the room the way Drusus read a battlefield, and "
                    "you see it clearly: there is one rank left above you, and the only way to be safe from the throne "
                    "is to sit on it."),
         overlay=None),

    # ---- LEVEL 7 — CAESAR ----
    dict(id="t19", level="LEVEL 07  ·  CAESAR", template="senate",
         narration=("Level seven. You take it — by acclaim, by the legions at your back, by a Senate that has learned "
                    "what happens to men who refuse. They drape you in purple and call you Augustus, Caesar, Princeps. "
                    "Imperium over every legion, every province, every grain ship that feeds the city. The boy who "
                    "paid Rome for his own boots now owns the treasury of the world. You climbed your whole life to be "
                    "safe — and you have never been in so much danger."),
         overlay=dict(big="ALL OF ROME", sub="CAESAR · THE TREASURY OF THE WORLD")),
    dict(id="t20", level=None, template="throne",
         narration=("Your first act as master of the world is to pay. Not the people — the Praetorian Guard, the only "
                    "armed men allowed inside Rome. The donativum, they call it. A gift, they call it. Everyone knows "
                    "the truth: you hand each guardsman more gold than a legionary earns in fifteen years, simply so they "
                    "will not kill you this week. The throne does not sit above the army. It pays rent."),
         overlay=dict(big="15,000 / GUARD", sub="THE DONATIVUM · RENT ON THE THRONE")),
    dict(id="t21", level=None, template="banquet",
         narration=("You eat nothing a slave has not tasted first. You sleep behind a barred door, in a different room "
                    "each night. Your wife, your sons, your oldest friend — each is a door an assassin could walk "
                    "through, so you trust none of them, and the loneliness is total. This is the secret no one tells "
                    "the boy at the altar: every rank you climbed, you climbed to be safe. And the safest-looking seat "
                    "on earth has the most knives at its back."),
         overlay=None),

    # ---- LEVEL 8 — THE PEOPLE ABOVE CAESAR ----
    dict(id="t22", level="LEVEL 08  ·  ABOVE CAESAR", template="praetorians",
         narration=("Who could be above Caesar? The men you are paying. The Praetorian Guard makes emperors and "
                    "unmakes them. They cut down Caligula in a corridor — then found a trembling man named Claudius "
                    "hiding behind a curtain, dragged him out, and made him emperor on the spot, because he would pay. "
                    "The Guard does not serve the throne. The throne serves the Guard. You are the most powerful "
                    "person alive, and you belong to your own bodyguards."),
         overlay=dict(big="9,000 GUARDS", sub="THEY MAKE EMPERORS · AND KILL THEM")),
    dict(id="t23", level=None, template="centurionVitis",
         narration=("And above the Guard: the legions. The same shield line you bled in for twenty-five years. Out on "
                    "the frontier an army grows tired of a distant Caesar, lifts some general on a shield, and roars "
                    "that word — imperator — exactly as your men once roared it for you. In one year Rome had four "
                    "emperors in twelve months, each made and murdered by soldiers. Every throne rests on men with "
                    "spears. And men with spears can always choose another."),
         overlay=None),
    dict(id="t24", level=None, template="forumScene",
         narration=("Above the legions, one more power, and it carries no sword at all: the people. The mob of Rome — "
                    "a million mouths that must be fed and amused, or they burn the city down. Bread and circuses, "
                    "the poets sneer, but it is iron law — free grain, free games, or no emperor at all. You, who "
                    "command every legion on earth, lie awake over the price of wheat. The man atop the world serves "
                    "the hungriest man in it."),
         overlay=None),
    dict(id="t25", level=None, template="throne",
         narration=("It comes the way it always comes. Not an army — a few familiar faces, a blade you trusted, a "
                    "corridor with no Guard in it because the Guard was paid to look away. Two old sounds return as it "
                    "happens: Drusus in the mud saying hold them, hold them — and the slave in the gold chariot "
                    "whispering remember you are mortal. The most dangerous chair ever built does not let you leave it "
                    "standing. You climbed your whole life to die in it."),
         overlay=dict(big="MURDERED", sub="MORE CAESARS DIED BY THE KNIFE THAN IN BED")),
    dict(id="t26", level=None, template="praetorians",
         narration=("And here is the part they will not believe is true. In the year 193, after they killed one "
                    "emperor, the Praetorian Guard did not bother choosing the next. They auctioned him. They stood on "
                    "the camp wall and sold the Roman Empire to the highest bidder. A rich man named Didius Julianus "
                    "won — twenty-five thousand sesterces promised to every guardsman — and was made master of the "
                    "world. He ruled nine weeks before they killed him too. That is the price of the throne."),
         overlay=dict(big="25,000 SESTERCES / MAN", sub="193 AD · THE GUARD AUCTIONED ROME")),

    # ---- LOOP CLOSE ----
    dict(id="t27", level=None, template="senate",
         narration=("When a Caesar dies well, the Senate can vote him a god — temples, priests, a star to carry his "
                    "soul to heaven, for the right corpse. One emperor, Vespasian, felt death coming and made "
                    "the joke that outlived him: dear me, I think I am becoming a god. He understood it to the end. "
                    "The purple, the eagle, the throne, the godhood — all a costume the city dressed you in. And the "
                    "city undresses a corpse as easily as it crowned a man."),
         overlay=None),
    dict(id="t28", level=None, template="romanOath",
         narration=("Somewhere this morning, in a village you could spit across, a boy of seventeen walks to a "
                    "recruiter. He has a sister who eats barley paste, a farm someone took, a debt and one tunic. He "
                    "swears the sacramentum to an emperor he will never meet, and dreams of the land, and the road "
                    "home. He does not know the chariot is already waiting — gold wheels, four horses, a slave with a "
                    "whisper — and that it does not care who stands in it. It only changes who."),
         overlay=dict(big="ALL OF ROME", sub="THE CHARIOT IS ALWAYS WAITING")),
]
