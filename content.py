#!/usr/bin/env python3
"""Your Life as a Samurai at Every Level — POV doodle build, ~12 min, template-driven.
Grounded in docs/research/samurai.md (the warrior ladder of late-Sengoku -> Edo -> Meiji Japan:
ashigaru -> samurai -> mounted retainer -> karō -> daimyō -> great lord -> the sword abolished).
Second-person present-tense POV: the viewer IS a peasant boy of a fictional domain (Lord Arima) who
rises to lord and lives to see the sword class dismantled in 1876. Dramatization layer over VERIFIED
feudal-Japan mechanics: KOKU as the measure of rank/pay (1 koku ~= one person's rice for a year),
the 10,000-koku daimyō threshold, the daishō (two swords), Hideyoshi's katanagari sword hunt (1588),
bushidō + seppuku + the kaishakunin (the second), sankin-kōtai (alternate attendance, ~1635),
the chōnin as legally the lowest of the four estates yet holding the daimyō's debt, the Dōjima Rice
Exchange (licensed 1730, one of the first futures markets), the House of Kōnoike (real Osaka bankers
to daimyō), the Meiji Restoration (1868), stipends commuted to bonds (kinroku-kōsai, ~1876), the
Haitōrei sword ban (1876), and the Satsuma Rebellion (1877, Saigō — the last samurai, beaten by a
conscript rifle army). Illustrative koku figures (30/500/4,000) are dramatized to clean numbers; the
THRESHOLDS (10,000 daimyō; ~1,000,000 Kaga; ~4M shogunal / ~30M national) are real per the research.

SPINE (koku = rice = the on-screen gold number, interleaved with cost beats): 0 KOKU (borrowed spear,
two rice balls) -> ~30 KOKU (the two swords + a surname) -> ~500 KOKU (a horse, men) -> 4,000 KOKU
(karō, a castle to run) -> the seppuku order (cost, not koku) -> 10,000 KOKU (you become a lord) ->
1,000,000 KOKU (Kaga-scale great lord) -> the shogun's ~30,000,000-koku Japan -> the merchant with no
sword who holds your debt (Dōjima) -> 1876: the sword is worth 0. Personal honor rises as personal
freedom falls; the domain's own wealth is the leash. Rice was always the wealth. Then paper was.

STORY: mentor ICHIRŌ (the old bushi who gives you the code and the warning "a debt you pay with your
life"); rival KENJI (climbs beside you from the ranks, taunts at the siege, kneels three places down
at the Restoration). MIDPOINT: Ichirō is ordered to commit seppuku to carry a lost battle's blame,
and YOU are named his kaishakunin — the code you served makes you kill the man who taught it to you.
Sensory anchor motif: THE WEIGHT OF THE TWO SWORDS AT YOUR LEFT HIP — it arrives at t04, is
re-triggered at every level-up, and is stripped bare at t25 (the sword ban). Second motif: the smell
of wet rice (origin + close). Master open loop: the cold open (t00) — you kneeling on the white mat,
a second's sword raised — resolves at t27, where the blade never falls because the ritual itself is
abolished; the final image bends back to the rice paddy (t28).

PROMISE->PAYOFF LEDGER:
  * t00 cold-open (you on the white mat, sword raised behind)      -> t27 (the blade never falls; abolished)
  * t01 want-object: the two swords                                -> t04 (granted); t25 (hip goes bare)
  * t05/t06 Ichirō + his warning "a debt you pay with your life"   -> t12/t13 (his seppuku; you the second)
  * t08 rival Kenji                                                -> t22 (kneels down the row, dissolved)
  * t16 the polite Osaka debt / "a quiet man"                      -> t20/t21 (the merchant owns your sword; Dōjima)
  * rice/koku spine ("rice the wealth, then paper")               -> t21, t24, t28
  * UNRESOLVED universe thread (deliberate): the House of Kōnoike  -> the merchant/bank lineage that
    outlives every sword — left open for a future episode.

Templates: SAMURAI pack (riceField/dojo/daisho/sengokuField/castleGate/teaCeremony/lordAudience/
keepTop/seppukuRite/shogunCourt/merchantHouse) + universal (signing). No two adjacent scenes share a
template. Structural variation vs last 2 (mob_boss aftermath / heir will-reading): cold open is an
in-medias-res FLASH-FORWARD to the near-end mat; act-2 is RISE-THEN-FALL (rise to great lord, then
the class is abolished); ending is cyclical-with-a-one-way-door (back to the paddy, sword gone forever).
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — the white mat (the master loop, a flash-forward) ----
    dict(id="t00", level=None, template="seppukuRite", gap=0.7,
         narration=("Raked white gravel. A single pine. A folded white mat — and on it, you, kneeling. "
                    "The short blade rests on a stand within reach, and a friend stands behind you with his "
                    "sword already raised. Your hands are steady. That is the part that should frighten you. "
                    "Sixty years ago you were born in a rice paddy owning nothing but hunger. Everything since "
                    "has walked you here, to this mat. Don't look yet at how it ends."),
         overlay=dict(big="1,000,000 KOKU", sub="AND IT ENDS ON THIS WHITE MAT")),

    # ---- LEVEL 1 — ASHIGARU ----
    dict(id="t01", level="LEVEL 01  ·  ASHIGARU", template="riceField",
         narration=("Start in the mud. You're nine, shin-deep in the paddy, and the smell of wet rice is the "
                    "whole world. Your family has no surname — only warriors get names. Two rice balls a day. "
                    "The lord's castle floats on the far hill like a promise meant for someone else. An old "
                    "warrior named Ichirō rides the path with two swords at his hip, and you can't stop looking "
                    "at them. Other boys want supper. You want the swords."),
         overlay=dict(big="0 KOKU", sub="NO NAME · TWO RICE BALLS A DAY")),
    dict(id="t02", level=None, template="castleGate",
         narration=("But want is cheap, and war is hungry. At fourteen the drums come for the levy. They hand "
                    "you a bamboo spear you must give back, a sack of rice, and a place in the front rank where "
                    "the peasants go. You are ashigaru — a foot-tool, not a warrior. The men with swords stand "
                    "behind you, where the arrows can't reach. Learn the first rule fast: you are the thing that "
                    "is spent."),
         overlay=dict(big="A BORROWED SPEAR", sub="ASHIGARU · THE FRONT RANK IS FOR THE POOR")),
    dict(id="t03", level=None, template="sengokuField", gap=0.7,
         narration=("Then the field opens, and everything you believed about yourself burns off in one breath. "
                    "Banners the height of trees. A wall of spear tips. The man beside you drops with an arrow "
                    "through the mouth — he was talking to you a moment ago. You don't run. Your hands move on "
                    "their own. When it ends you are holding a stranger's head by the hair, and an officer nods "
                    "and writes your name. Your first. It buys your first coin."),
         overlay=dict(big="1 HEAD", sub="THE PROOF OF VALOR · AND THEY WRITE YOUR NAME")),

    # ---- LEVEL 2 — SAMURAI (the two swords) ----
    dict(id="t04", level="LEVEL 02  ·  SAMURAI", template="daisho",
         narration=("Valor is a currency, and you keep spending it. Three campaigns later, Lord Arima's steward "
                    "sets a lacquered stand before you — and on it, two swords. The long katana. The short "
                    "wakizashi. The daishō. Only a samurai may wear both, and today that is you. A surname. A "
                    "stipend of thirty koku — thirty years of a man's rice, yours by right. You tie the swords "
                    "at your left hip. The weight is small. It will never leave you again."),
         overlay=dict(big="~30 KOKU", sub="THE TWO SWORDS · AND A NAME OF YOUR OWN")),
    dict(id="t05", level=None, template="dojo",
         narration=("Ichirō is old now, and he takes you as his own. Dawns in the dojo, the plank floor cold "
                    "under your feet, wooden swords cracking until your palms split and scar. He drills the cuts, "
                    "then the thing beneath the cuts — the code. Loyalty above your life. Service above your "
                    "fear. One evening he stops, and holds the blade flat in the space between you."),
         overlay=None,
         dialogue=dict(text="These are not a gift. They are a debt you pay with your life.")),
    dict(id="t06", level=None, template="teaCeremony",
         narration=("You kneel across a low table from him, steam rising off the tea, rain on the tile outside. "
                    "He tells you what the debt means, plainly, the way you tell a child a true thing. Your "
                    "lord's word can order you into fire. Your lord's word can order you to die by your own hand "
                    "— in a garden, on a white mat — and you will bow and thank him for the honor. You drink. "
                    "The tea is bitter. So is the future you just agreed to."),
         overlay=None),

    # ---- LEVEL 3 — MOUNTED RETAINER ----
    dict(id="t07", level="LEVEL 03  ·  MOUNTED RETAINER", template="lordAudience",
         narration=("Therefore you climb, because a debt that size has to be worth something. You take heads, "
                    "hold lines, and Lord Arima notices. In the audience hall, forehead to the tatami, you are "
                    "named a mounted retainer — five hundred koku, a horse, and men who now live or die on your "
                    "word. You rise from the mat taller than your father ever stood. The swords are heavier "
                    "today. You understand, finally, that the weight was never the steel."),
         overlay=dict(big="~500 KOKU", sub="A HORSE · AND MEN WHO DIE ON YOUR WORD")),
    dict(id="t08", level=None, template="sengokuField",
         narration=("But every rung already has a man standing on it. Kenji climbed from the ranks beside you, "
                    "and he is faster, crueler, better-born by a hair. At the siege of a burning castle you fight "
                    "through the same gate, counting each other's heads like coins. He wipes his blade and grins "
                    "at you through the smoke. Keep the anger he hands you. Bank it. You will need it at the top."),
         overlay=None,
         dialogue=dict(text="You still smell of the rice paddy, farmer.")),
    dict(id="t09", level=None, template="riceField",
         narration=("Then word comes down from the great unifier, Hideyoshi, and it changes the shape of the "
                    "world. The sword hunt. Soldiers walk the paddies where you were born and take every blade, "
                    "spear, and knife from the peasants' hands — melted, they say, into a giant statue of the "
                    "Buddha. The line between farmer and warrior is now iron law. The boy you were could never "
                    "become the man you are. That door is bricked shut behind you. Forever."),
         overlay=dict(big="1588", sub="THE SWORD HUNT · THE CLASS LINE, SEALED")),

    # ---- LEVEL 4 — KARŌ ----
    dict(id="t10", level="LEVEL 04  ·  KARŌ", template="teaCeremony",
         narration=("Rank stops being about the sword and starts being about the room. Lord Arima raises you to "
                    "karō — chief retainer, the man who runs the domain while the lord is away. Sit-downs, "
                    "ledgers, marriages arranged like troop movements. You settle a feud between two villages "
                    "before breakfast and seal a death warrant after it. Thousands of koku pass through your "
                    "hands. None of it slows the small cold thing that has started growing behind your ribs."),
         overlay=dict(big="4,000 KOKU", sub="KARŌ · YOU RUN THE DOMAIN NOW")),
    dict(id="t11", level=None, template="lordAudience",
         narration=("Now you sit near the dais, and the hall kneels to you as you once knelt to it. A castle "
                    "answers to your seal. Every life in the valley — the tax, the harvest, who marries, who is "
                    "punished — bends around a word you sign. You are forty. You have everything the boy in the "
                    "paddy prayed for. Say it plainly: you cannot remember the last night you slept without the "
                    "ledger open behind your eyes."),
         overlay=None),

    # ---- MIDPOINT — the mentor's ordered death ----
    dict(id="t12", level=None, template="dojo", gap=1.4,
         narration=("Then a letter arrives with the lord's seal, and the floor tilts under you. A battle was "
                    "lost. Someone must carry the blame to keep the clan whole — and the name chosen is Ichirō. "
                    "The order is seppuku. The letter names his kaishakunin, his second, the one who ends his "
                    "pain with a single clean cut. It names you. The dojo where he made you stands empty now. "
                    "Your first wooden sword still hangs on his rack."),
         overlay=dict(big="THE ORDER", sub="SEPPUKU · AND YOU ARE NAMED HIS SECOND")),
    dict(id="t13", level=None, template="seppukuRite", gap=0.7,
         narration=("The garden. Raked gravel, a single pine, the white mat. Ichirō kneels, calm, and bares "
                    "himself to the waist. You stand behind him, sword up, and your hands are steady — that is "
                    "the part that breaks you. He lifts the short blade. He looks back at you, once. He cuts. "
                    "You cut. The code you gave your whole life to has just made you kill the man who gave it "
                    "to you."),
         overlay=dict(big="ONE CUT", sub="THE CODE · IT TAKES YOUR TEACHER THROUGH YOUR HAND"),
         dialogue=dict(text="Don't look away. That is the last thing I can teach you.")),

    # ---- LEVEL 5 — DAIMYŌ (you cross the line) ----
    dict(id="t14", level="LEVEL 05  ·  DAIMYŌ", template="keepTop", gap=0.7,
         narration=("You should break. Instead you rise — grief burns clean and leaves something harder behind. "
                    "Within three years, a war won and a marriage made and a lord's line failing, you cross the "
                    "one line that matters. Ten thousand koku. Below it, a retainer. At it, a daimyō — a lord in "
                    "your own right. You stand at the top of your own keep, the domain spread grey and gold "
                    "below you, and the swords at your hip finally match the weight of the man wearing them."),
         overlay=dict(big="10,000 KOKU", sub="THE LINE · YOU ARE A LORD NOW")),
    dict(id="t15", level=None, template="castleGate",
         narration=("But the throne comes with a chain, and its name is sankin-kōtai. The shogun's law: every "
                    "other year you must live in Edo, and when you ride home, your wife and your son stay behind "
                    "— hostages in all but the word. You ride out the great gate at the head of a procession you "
                    "cannot afford, banners and bearers and horses, all of it performed for a capital that is "
                    "quietly counting your coin as it passes."),
         overlay=dict(big="EVERY OTHER YEAR", sub="SANKIN-KŌTAI · YOUR FAMILY STAYS AS HOSTAGES")),
    dict(id="t16", level=None, template="teaCeremony",
         narration=("Two households now, a thousand miles apart, and both of them bleeding money. The "
                    "processions alone could drown a domain. So you do what lords do — you borrow. A quiet man "
                    "from Osaka pours your tea and lends against next year's rice, and the year after that. The "
                    "debt is polite. The debt is patient. The debt never once raises its voice. You have never "
                    "in your life met a weapon like it."),
         overlay=None),

    # ---- LEVEL 6 — THE GREAT LORD ----
    dict(id="t17", level="LEVEL 06  ·  THE GREAT LORD", template="keepTop",
         narration=("Still you climb, because stopping is the only thing that frightens a man like you now. "
                    "Marriages, alliances, a rival house swallowed whole — and your domain swells past a size "
                    "that has a legend of its own. A million koku. Kaga scale. The largest holding no shogun "
                    "rules directly. From the keep you cannot see the edge of what answers to your seal. You own "
                    "more rice than some nations own bread. You feel nothing. Note that."),
         overlay=dict(big="1,000,000 KOKU", sub="KAGA-SCALE · THE GREATEST DOMAIN IN JAPAN")),
    dict(id="t18", level=None, template="shogunCourt",
         narration=("Then you kneel again — because there is always a higher hall. Edo. The shogun's court, "
                    "gilded screens the length of a river, and you, a million-koku lord, are one small mark in a "
                    "long kneeling row. He holds four million koku outright. The whole country assesses near "
                    "thirty million, and he moves it like a game board. Five men in a hundred wear the swords. "
                    "You rule the other ninety-five. And one man rules you."),
         overlay=dict(big="30,000,000 KOKU", sub="ALL OF JAPAN · AND ONE MAN MOVES IT ALL")),
    dict(id="t19", level=None, template="keepTop",
         narration=("Home again, you walk the balcony over a domain worth a million koku and count what it "
                    "actually buys you. Not sleep. Not your son, raised by letter in a hostage city. Not one "
                    "hour the ledgers do not own. You could buy a province. You cannot buy back the paddy, the "
                    "two rice balls, the boy who wanted only the swords. But none of it matters if you can't "
                    "survive the men who truly hold the money — and you are about to meet one."),
         overlay=None),

    # ---- LEVEL 7 — THE MERCHANT OWNS THE SWORD ----
    dict(id="t20", level="LEVEL 07  ·  THE MERCHANT", template="merchantHouse", gap=0.7,
         narration=("Osaka. A merchant's counting house — rice bales to the rafters, an abacus clicking, gold "
                    "koban stacked like roof tiles. The chōnin, the merchant class, rank legally last: below the "
                    "samurai, below the farmers, dead bottom of the four estates. And this man holds your debt. "
                    "He never touched a sword in his life; he owns yours. The ledger carries a name older than "
                    "your clan — the House of Kōnoike — and it will outlive every blade in Japan."),
         overlay=dict(big="LAST OF FOUR", sub="THE MERCHANT'S RANK · AND HE OWNS YOUR SWORD")),
    dict(id="t21", level=None, template="signing",
         narration=("He slides the ledger across, and you sign your own harvest away before it grows. Your pay "
                    "is rice; the rice must be sold for coin; and the price is set here, in Osaka, at the Dōjima "
                    "Rice Exchange — where men trade paper claims on rice that does not yet exist. The world's "
                    "first futures market, and your stipend rides on it. The men with no swords set the price of "
                    "the sword. Remember it: rice was always the wealth. Then paper was."),
         overlay=dict(big="DŌJIMA · 1730", sub="THE FIRST FUTURES MARKET · IT PRICES YOUR PAY")),

    # ---- LEVEL 8 — THE END OF THE SWORD ----
    dict(id="t22", level="LEVEL 08  ·  THE END OF THE SWORD", template="lordAudience",
         narration=("Then the age itself turns, and no sword can cut it. Black ships, foreign guns, a "
                    "boy-emperor raised up in Kyoto, and the shogun who ruled you for two centuries simply hands "
                    "it all back. One by one the great lords bow and return their domains to the throne. Kenji "
                    "kneels three places down the same row, his house dissolving beside yours — the race you ran "
                    "for sixty years, ending in one empty hall. A million koku, gone with a signature."),
         overlay=dict(big="1868", sub="THE RESTORATION · THE LORDS GIVE IT ALL BACK")),
    dict(id="t23", level=None, template="castleGate",
         narration=("Your castle is not yours. In 1871 the domains are abolished outright, redrawn into "
                    "prefectures run by clerks. The gate your ancestors held for three hundred years now opens "
                    "for a governor with an inkstone. Your title thins to a single word — shizoku, former "
                    "warrior — and the leash you never once saw is finally clear. It was never the shogun. It "
                    "was the domain's own wealth. And they have simply taken the domain."),
         overlay=dict(big="1871", sub="THE DOMAINS ABOLISHED · A CLERK HOLDS THE GATE")),
    dict(id="t24", level=None, template="signing",
         narration=("They pay you off. Your hereditary stipend — the rice that measured your family for ten "
                    "generations — is commuted to a stack of government bonds and pushed across a desk. Sign "
                    "here. The warriors are bought out and cut loose, all at once, a whole class retired by "
                    "paperwork. The paper is worth something for now. Most who take it will be poor inside a "
                    "decade. You hold your family's entire honor in one thin envelope."),
         overlay=dict(big="1876", sub="YOUR STIPEND → A PAPER BOND · SIGN HERE")),
    dict(id="t25", level=None, template="merchantHouse", gap=0.7,
         narration=("Then they come for the last thing. The Haitōrei edict: no swords worn in public. A clerk "
                    "with a ledger and a bored young policeman wait at the merchant's door where you came to beg "
                    "terms. You untie the daishō from your left hip — the weight that arrived the day you became "
                    "someone, the weight that never left in fifty years. Your hip goes light. Your hip goes "
                    "wrong. The sword is worth nothing now, by law."),
         overlay=dict(big="0", sub="HAITŌREI · THE SWORD IS WORTH NOTHING"),
         dialogue=dict(text="Swords are prohibited, citizen. Hand it over.")),
    dict(id="t26", level=None, template="sengokuField",
         narration=("One last time, the old world stands and fights. 1877 — the southern samurai rise behind "
                    "Saigō, the last true warrior, steel against an empire. They meet a conscript army: farmers' "
                    "sons, the ninety-five you once ruled, holding rifles any peasant can be taught to fire in a "
                    "week. The swords lose in an afternoon. Three hundred years of the blade, ended not by a "
                    "better sword — by a factory, a rifle line, and a government office."),
         overlay=dict(big="1877", sub="THE LAST SAMURAI · BEATEN BY PEASANTS WITH RIFLES")),

    # ---- LOOP CLOSE — the mat, then the paddy ----
    dict(id="t27", level=None, template="seppukuRite", gap=0.7,
         narration=("So you come back to the garden. Raked gravel, a single pine, the white mat — the death a "
                    "samurai is owed. You kneel. A friend stands behind you, sword raised, the way you once "
                    "stood behind Ichirō. Your hands are steady. But the blade does not fall. Even this is "
                    "forbidden now — the ritual, the honor, the ending, all abolished, like the sword, like the "
                    "domain. They took your death too. You are made to live."),
         overlay=dict(big="THE MAT", sub="EVEN YOUR DEATH · ABOLISHED")),
    dict(id="t28", level=None, template="riceField",
         narration=("An old man walks back into a rice paddy. The smell of wet rice is the whole world again; it "
                    "always was. You began here with a borrowed spear and two rice balls, owning nothing. You "
                    "end here owning no sword at all — by law. The koku, the castle, the million — all of it was "
                    "rice, and the rice was always someone else's to price. Five in a hundred wore the blade. In "
                    "the end, none of you did. The circle closes in the mud where it opened."),
         overlay=dict(big="THE CIRCLE", sub="A BORROWED SPEAR → NO SWORD AT ALL")),
]
