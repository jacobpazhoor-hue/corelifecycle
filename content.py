#!/usr/bin/env python3
"""Your Life in a Cartel at Every Rank — POV doodle build, ~12 min, template-driven.
Grounded in docs/research/mexican_cartel.md (the narco ladder: halcón lookout -> burrero mule ->
sicario -> jefe de plaza -> lugarteniente -> el patrón/kingpin -> la red/the network -> la demanda,
the buyers up north). Second-person present-tense POV: the viewer IS a poor kid on a dust-town corner
who climbs to the man in the walled compound and learns the only two exits were always a cell or a
grave — and that above even the kingpin sits a market that spends him and never learns his name.
CAUTIONARY, ANTI-GLAMOUR DRAMATIZATION over VERIFIED, NON-INSTRUCTIONAL facts: recruitment of minors
as lookouts/hitmen (VICE), sicario pay a poverty wage (~$85-200 a hit/month; "$30 a time" account),
"plata o plomo" (silver or lead), el piso (turf tax), a real kingpin listed ~$1B (Forbes/Chapo),
Sinaloa revenue estimates $3B-$39B/yr, ~$150B/yr Americans spend on illicit drugs (RAND 2016), and
Mexico's drug war since 2006 (100,000+ disappeared, well over 120,000 dead — figures contested). NO
production, smuggling method, or weapon technique is depicted — jargon and settings are named only as
milestones of a life, never as instruction.

SPINE (gold $ escalation, with red-cost beats — the money climbs while the exit closes): ~$600/MO
(halcón) -> $5,000/LOAD (burrero) -> $85/BODY (sicario — the horror number) -> $40M/YEAR (the plaza's
piso) -> $300M (the lieutenant, the war) -> $1 BILLION (the patrón) -> THE MARKET (la red) -> $150
BILLION (la demanda, the buyers). You climb from being the cheapest thing in the machine to running
it — and learn you were inventory the whole way, and inventory gets sold.

STORY: mentor EL TÍO (runs the corner, recruits you, gives the code + the warning "everyone on this
road is already dead"); rival EL FLACO (rises beside you, crueler, faster, mocks the medallion); the
recurring fixer THE LICENCIADO (the cartel's lawyer/launderer — the shared-universe character planted
at the count room t16 and left UNRESOLVED at t23). MIDPOINT (t14): the patrón above you brands El Tío
an informant and orders you to kill him to prove loyalty; you do it, and press his medallion into his
dead hand — "you are not the knife; you are what the knife is for." Sensory anchor motif: a CHEAP
PLASTIC SAINT'S MEDALLION on a bootlace at your throat — your mother Rosa ties it on (t01), you press
it to your lips before every job (t02/t04), after the first body (t08), into El Tío's hand (t14), it
is gold now and means nothing (t17), it's in your fist in the tunnel (t24), and at the end a soldier
cuts it from your throat (t26) and it's tied onto a new lookout kid on the same corner (t27). Master
open loop: the AFTERMATH cold open (t00) — dawn, the emptied compound, the phone that stopped ringing,
cuffed at your own gate as the medallion is cut away — resolves at t24-t26 (the raid, the tunnel, the
cell you choose over the grave). The final image (t28) bends up to the buyer who never sees you.

PROMISE->PAYOFF LEDGER:
  * t00 cold open (dawn, emptied compound, cuffed, medallion cut off)  -> t24/t26 (the raid; the cell)
  * t01 want: out of nothing; Rosa's medicine + the medallion she ties  -> t11/t17 (you have millions and can't go home)
  * anchor: the plastic saint's medallion at your throat                -> t02, t04, t08, t14, t17, t24, t26, t27
  * t02 mentor El Tío + warning "everyone here is already dead"          -> t13/t14 (you are ordered to kill him; you do)
  * t05 rival El Flaco                                                   -> t12 (his taunt); t23 (what he became)
  * t06 "plata o plomo" — no third door                                 -> t23/t26 (the door was always a cell or a grave)
  * t14 cost line "you are what the knife is for"                       -> t25 ("you were inventory")
  * t16 the Licenciado (planted at the count room)                      -> t23 (his line; left UNRESOLVED, universe thread)
  * UNRESOLVED universe thread (deliberate): THE LICENCIADO, the fixer   -> he already works for whoever's next; never caught (open)

Templates: CARTEL pack (lookoutCorner/sierraRoute/narcoShrineRite/plazaTown/ranchCompound + prop
narcoTruck) + MAFIA reuse (backAlley/waterfront/cardGame/donOffice/countRoom/courtroom/prisonCell/
wiretap) + universal (dinner/warRoom/jet/window/emptyChair). ranchCompound is REUSED 4x on purpose as
the master-loop anchor (t00 aftermath / t10 the plaza finca / t18 the kingpin's fortress / t24 the
raid) — the compound the whole life is built to reach and lose. No two adjacent scenes share a
template. Structural variation vs last 2 (special_forces mid-action breach, rise-into-rot, cyclical;
billionaire_heir will-reading, fall-then-rise): cold open is AFTERMATH (the morning it ends); act-2
shape is a true RISE-THEN-FALL (you actually lose it all); ending is cyclical (medallion to a new kid)
with one door left open (the demand up north / the Licenciado).
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — the aftermath (the master loop): the morning it ends ----
    dict(id="t00", level=None, template="ranchCompound", gap=0.7,
         narration=("Dawn. Your own gate, cold iron under your knees, wrists zip-tied behind you. The dogs "
                    "aren't barking — that was the first sign, an hour ago, and you knew. Your phone stopped "
                    "ringing at four. Two hundred gunmen on the payroll and not one answered. A soldier leans "
                    "in and cuts the bootlace at your throat, and the little plastic saint you've worn for "
                    "thirty years drops into his glove. The compound behind you is already empty. This is how "
                    "it ends for everyone who reaches the top of this. You just didn't believe it would be you."),
         overlay=dict(big="THE MORNING IT ENDS", sub="THE DOGS WENT QUIET · THE PHONE STOPPED")),

    # ---- LEVEL 1 — EL HALCÓN (the lookout) ----
    dict(id="t01", level="LEVEL 01  ·  EL HALCÓN  (THE LOOKOUT)", template="lookoutCorner",
         narration=("Rewind. You're thirteen, on the edge of a dust town where the road out is the only thing "
                    "worth looking at. Your mother, Rosa, coughs through the wall at night, and the medicine "
                    "costs forty pesos you don't have. She kneels and ties a cheap plastic saint on a "
                    "bootlace around your neck. So death knows you're spoken for, she says. A man on the "
                    "corner has watched you a week. He gives you a phone and a whistle. Watch the road. Call "
                    "the trucks. Six hundred dollars a month — more than Rosa has ever held."),
         overlay=dict(big="~$600 / MONTH", sub="A PHONE, A WHISTLE, AND A NAME NOBODY KNOWS YET")),
    dict(id="t02", level=None, template="narcoShrineRite",
         narration=("The man on the corner is El Tío — the Uncle — and the whole barrio steps off the "
                    "sidewalk for him. He takes you to a little roadside shrine, candles guttering, and "
                    "watches you press the plastic saint to your lips the way Rosa showed you. He nods, like "
                    "you passed something. Then he tells you the only true thing anyone in this life will ever "
                    "tell you, flat, without cruelty."),
         overlay=None,
         dialogue=dict(text="Everyone on this road is already dead, m'ijo. Some of us just don't know the day.")),
    dict(id="t03", level=None, template="backAlley", gap=0.7,
         narration=("You find out what the whistle is for on a Tuesday. A rival crew came through in the "
                    "night, and now the alley behind the market has a man in it who used to run this corner, "
                    "and a cardboard sign, and the smell of it reaches you before the shape does. The whole "
                    "town walks past with their eyes on their shoes. Nobody screams. Nobody calls anyone. "
                    "That silence is the loudest thing you've ever heard, and it teaches you the rule in one "
                    "second: you are already in. There was never a form to sign, and there is no way back out."),
         overlay=dict(big="FIRST BODY", sub="THE TOWN LEARNS TO LOOK AT ITS SHOES")),

    # ---- LEVEL 2 — EL BURRERO (the mule) ----
    dict(id="t04", level="LEVEL 02  ·  EL BURRERO  (THE MULE)", template="sierraRoute",
         narration=("Sixteen now, and watching the road isn't enough — El Tío puts you on it. You ride the "
                    "sierra in a pickup that smells of diesel and cut lime, moving packages you're told never "
                    "to open. Before every run you kiss the little saint. Five thousand a load. The mountains "
                    "are beautiful at dawn and full of shallow graves, and you tell yourself the second part "
                    "doesn't apply to you. The weight in the truck bed is the first thing you've carried that "
                    "can end you."),
         overlay=dict(big="$5,000 / LOAD", sub="THE FIRST THING YOU CARRY THAT CAN END YOU")),
    dict(id="t05", level=None, template="waterfront",
         narration=("A handoff at a container port, midnight, salt and rust in your throat. This is where you "
                    "meet El Flaco — the Skinny One — a mule your age who volunteers for the runs nobody else "
                    "will take and grins the whole time. A load goes missing that night. The boy who was "
                    "carrying it goes missing with it, and no one says his name again by morning. You keep "
                    "your head down and your saint tucked inside your collar. El Flaco just shrugs. More road "
                    "for us, he says."),
         overlay=None),
    dict(id="t06", level=None, template="cardGame",
         narration=("Therefore they test you. A back room, a low lamp, El Tío across a card table sliding a "
                    "pistol to the center like a bet. This is the door every man in this life walks through, "
                    "and it only opens one way. Plata o plomo — silver or lead. Take the money and the work "
                    "that comes with it, or take the bullet for saying no. Your hands are steady on the felt. "
                    "That steadiness is the thing that should frighten you, and it doesn't. You pick up the "
                    "silver. There was never a third door."),
         overlay=dict(big="PLATA O PLOMO", sub="THE SILVER OR THE LEAD · YOU DON'T GET A THIRD DOOR")),

    # ---- LEVEL 3 — EL SICARIO (the gunman) ----
    dict(id="t07", level="LEVEL 03  ·  EL SICARIO  (THE GUNMAN)", template="plazaTown", gap=0.7,
         narration=("Your first job is in the town square, in daylight, on purpose — the cartel doesn't hide "
                    "its work, it advertises it. A name, a face, a debt in someone else's ledger. It's over in "
                    "the time it takes the church bell to finish ringing. The plaza empties around you like "
                    "water around a stone. Here is the part the corridos never sing: they pay you eighty-five "
                    "dollars for it. You are the cheapest thing in the entire machine, and the machine knows "
                    "exactly how little you cost to replace."),
         overlay=dict(big="$85 / BODY", sub="THE CHEAPEST THING IN THE WHOLE MACHINE")),
    dict(id="t08", level=None, template="narcoShrineRite",
         narration=("After, you go back to the shrine, because there's nowhere else the shaking stops. You "
                    "press the plastic saint to your lips and it tastes like copper now. You start a count in "
                    "your head that night — one — and swear it's the only one. It isn't. The men beside you "
                    "are eighteen, nineteen, already flinching at engines. A sicario here gets maybe three "
                    "years before the road collects him. Planning past that is for people with a way out."),
         overlay=dict(big="3-YEAR LIFE", sub="THE AVERAGE GUNMAN DOESN'T SEE A FOURTH")),
    dict(id="t09", level=None, template="donOffice",
         narration=("But you're good at surviving, and surviving is a kind of promotion here. The plaza boss "
                    "gets taken — extradited, or buried, you're never told which — and the corridor needs a "
                    "man who does the work and keeps his mouth shut. El Tío puts your name forward. He sits "
                    "you behind a desk that used to belong to a dead man and slides the keys to a whole town "
                    "across it. Reaching the top of this means nothing, he says, if you can't hold a single "
                    "plaza first."),
         overlay=dict(big="A DEAD MAN'S DESK", sub="YOU HELD ON · SO THEY HAND YOU THE TOWN")),

    # ---- LEVEL 4 — JEFE DE PLAZA (the plaza boss) ----
    dict(id="t10", level="LEVEL 04  ·  JEFE DE PLAZA  (THE PLAZA BOSS)", template="ranchCompound",
         narration=("Now you have a finca — a walled compound at the edge of the sierra, an iron gate, dogs, "
                    "a ring of gunmen who call you jefe. You own a corridor: every gram, every truck, every "
                    "kilometer of a road the government pretends it patrols. The medallion at your throat "
                    "isn't plastic anymore; you had it cast in gold, and it's heavier, and it means less. "
                    "Rosa could have any medicine in the country now. But you can't go back to the dust town. "
                    "Men like you don't get to go home."),
         overlay=dict(big="THE FINCA", sub="A WALLED CORRIDOR · AND YOU CAN'T GO HOME")),
    dict(id="t11", level=None, template="plazaTown",
         narration=("You run the town not with fear alone, but with a floor. El piso — the tax on the ground "
                    "itself. The taquero pays. The pharmacy pays. The migrant paying to cross your stretch of "
                    "desert pays. Forty million a year moves through your hands, and almost none of it stays: "
                    "you pay up, you pay the police, you pay the soldiers who wave your trucks through. The "
                    "whole town works for you, and you work for the men above you."),
         overlay=dict(big="$40M / YEAR", sub="EL PISO · THE TAX ON THE GROUND ITSELF")),
    dict(id="t12", level=None, template="sierraRoute",
         narration=("The convoys are yours to send now — you don't ride in the truck bed, you point the "
                    "truck. El Flaco runs guns for the plaza beside yours and pulls up alongside your window "
                    "in the sierra, sunglasses on at dusk, counting his kills against yours like a scoreboard. "
                    "He's climbing as fast as you and enjoying it more. He nods at the gold saint on your "
                    "chest and laughs."),
         overlay=None,
         dialogue=dict(text="You still kiss that plastic saint, primo? Up here we don't pray. We collect.")),

    # ---- MIDPOINT — the order to kill El Tío ----
    dict(id="t13", level=None, template="dinner", gap=1.4,
         narration=("A summons to a quiet dinner with the patrón above you — candlelight, good tequila, a man "
                    "who smiles the whole time he decides who lives. He slides a folder across the cloth. "
                    "Inside is a face you'd know in the dark: El Tío. The Uncle. The word is that he's been "
                    "talking to the Americans. The patrón wants it done by someone the old man trusts. He "
                    "wants it done by you. To prove there is nothing in you the cartel doesn't own. He lets "
                    "the silence stretch. Then he says the one word that has no answer."),
         overlay=None),
    dict(id="t14", level=None, template="backAlley", gap=0.7,
         narration=("You take El Tío to the same alley behind the market where he first showed you a body, "
                    "years ago. He knows. He doesn't run — running is a bullet, and he taught you that. He "
                    "presses his own saint into your hand and tells you to make the count and not to lie to "
                    "yourself about the number. Then you do it. Afterward you fold his medallion into his "
                    "dead fingers, and it lands, cold and final: you were never the knife. You are the thing "
                    "the knife is for. And a thing gets used until it breaks."),
         overlay=dict(big="EL TÍO", sub="YOU WERE NEVER THE KNIFE · YOU ARE WHAT IT'S FOR")),

    # ---- LEVEL 5 — EL LUGARTENIENTE (the lieutenant) ----
    dict(id="t15", level="LEVEL 05  ·  EL LUGARTENIENTE  (THE LIEUTENANT)", template="warRoom",
         narration=("You should have died of it. Instead the grief hardens into something colder, and the "
                    "patrón moves you up for passing his test. You're a lieutenant now — you don't hold one "
                    "plaza, you run the war across a dozen. Rival cartels, the army, a map stuck with pins "
                    "that used to be people. Three hundred million moves under you. You stop reading the count "
                    "as names. You read it as a column, and the column is the only thing you keep clean."),
         overlay=dict(big="$300M", sub="THE DEAD STOP BEING PEOPLE · THEY BECOME A COLUMN")),
    dict(id="t16", level=None, template="countRoom",
         narration=("The money isn't a metaphor up here; it's a physical problem. A naked bulb, tables of "
                    "banded cash the counters can't finish before more arrives, sour and papery in the heat. "
                    "A soft man in a good suit walks that wall and never touches a bill: the Licenciado, the "
                    "cartel's lawyer, who turns paper into ports and pharmacies and a football club. Money "
                    "buys the police. Money buys the judge. Money buys the mothers who won't testify. Money "
                    "buys everything in this country except the one thing you spend it all chasing: a door out."),
         overlay=dict(big="A ROOM OF CASH", sub="IT BUYS EVERYTHING BUT THE ONE DOOR YOU WANT")),
    dict(id="t17", level=None, template="narcoShrineRite",
         narration=("Rosa dies while you're at war, in a good hospital you paid for, in a city you couldn't "
                    "risk entering. You send flowers you can't deliver in person and mourn her at the same "
                    "roadside shrine where El Tío warned you. The gold saint is warm from your skin and worth "
                    "a year of a mule's pay and it protects you from nothing. You wanted out of nothing for "
                    "her, and you got everything, and she died alone because of what the everything cost. That "
                    "was the trade. Nobody read you the terms because you'd have taken it anyway."),
         overlay=dict(big="ROSA", sub="EVERYTHING YOU BUILT · AND SHE DIED ALONE")),

    # ---- LEVEL 6 — EL PATRÓN (the kingpin) ----
    dict(id="t18", level="LEVEL 06  ·  EL PATRÓN  (THE KINGPIN)", template="ranchCompound", gap=0.7,
         narration=("The patrón above you is killed in his own bed, and there's no ceremony to what comes "
                    "next — you're simply the one still standing, so the cartel is yours. El Patrón. The "
                    "kingpin. A mountain fortress with a tunnel under the bedroom floor, an army, generals and "
                    "governors on the payroll. Forbes could put a number on you now — a billion dollars — and "
                    "print it beside your face. Every police force on two continents knows your name. You've "
                    "become the man the whole climb was built to reach."),
         overlay=dict(big="$1 BILLION", sub="EL PATRÓN · A NAME ON A LIST ON TWO CONTINENTS")),
    dict(id="t19", level=None, template="jet",
         narration=("Reach is the drug now, not money. A private strip carved into the sierra, planes that "
                    "cross the water to Europe where a kilo is worth five times what it fetches at home. Your "
                    "product moves through ports you've never seen, into the noses of people who will never "
                    "once think of the dust town or the alley or the eighty-five dollars. You point a finger "
                    "and cargo crosses an ocean. But you sleep in a different room every night, and the tunnel "
                    "is always within ten steps."),
         overlay=None),
    dict(id="t20", level=None, template="window",
         narration=("They write ballads about you now. Corridos on the radio that make the alley sound like a "
                    "coronation and leave out the smell. Boys in dust towns wear your saint and want your "
                    "life, exactly the way you once wanted the man's on the corner. From your window you can "
                    "see three states you control and not one street you can walk down. They sing your name "
                    "and can't say it near a soldier. You own the corridor, and you live in a tunnel."),
         overlay=dict(big="THEY SING YOUR NAME", sub="AND YOU CAN'T WALK DOWN A SINGLE STREET")),

    # ---- LEVEL 7 — LA RED (the network) ----
    dict(id="t21", level="LEVEL 07  ·  LA RED  (THE NETWORK)", template="warRoom",
         narration=("But you are not the top, and the proof is that the machine doesn't need you. La red — the "
                    "network — is bigger than any patrón: chemists, bankers, port bosses, whole governments "
                    "renting out their coasts. Take one kingpin off the board and the price of a kilo doesn't "
                    "twitch for a single day. You spent your life believing you climbed toward the center. "
                    "There is no center. There is a market, and it wears men like you the way you wore that "
                    "plastic saint — until they crack, then it picks up another."),
         overlay=dict(big="LA RED", sub="TAKE OUT THE KINGPIN · THE PRICE DOESN'T MOVE")),
    dict(id="t22", level=None, template="wiretap",
         narration=("Somewhere in a cool northern office, men you'll never meet are listening. A reel turns. A "
                    "wall of photographs has your face in the center now, red string running out to every man "
                    "you ever trusted. The Americans don't need to beat you. They need to buy one person close "
                    "enough — and in a life built entirely on plata o plomo, everyone already learned that "
                    "everyone can be bought. Including the men who guard your bedroom door."),
         overlay=None),
    dict(id="t23", level=None, template="dinner",
         narration=("The Licenciado comes to see you one last time — the lawyer who launders the cash through "
                    "the port and the pharmacy and the football club, who has served three patrones and "
                    "buried none of them. He never carries a gun. He carries a pen, which is worse. He lays "
                    "out your accounts and your options, and there are fewer of the second than the first, "
                    "and he tells you the thing you already knew the morning the dogs went quiet."),
         overlay=None,
         dialogue=dict(text="You were never the top, patrón. You were the product. I already work for whoever's next.")),

    # ---- LEVEL 8 — LA DEMANDA (the demand) + LOOP CLOSE ----
    dict(id="t24", level="LEVEL 08  ·  LA DEMANDA  (THE DEMAND)", template="ranchCompound", gap=0.7,
         narration=("So walk it all the way back to that dawn. The dogs go quiet — that's the tell, the only "
                    "warning you get. Headlights climb the mountain road, too many, in a line, and your two "
                    "hundred gunmen are already gone because someone paid them more to leave. Ten steps to the "
                    "tunnel. Your gold saint is in your fist. You could go down fighting and be a corrido by "
                    "morning, or you could go into the ground under the bedroom and run one last time. You "
                    "choose the tunnel. Because after everything, you still want to live. That was always the "
                    "whole problem."),
         overlay=dict(big="THE ROAD CLIMBS", sub="TEN STEPS TO THE TUNNEL · YOU STILL WANT TO LIVE")),
    dict(id="t25", level=None, template="courtroom",
         narration=("The tunnel comes up inside a cordon. Of course it does — they had the map before you ran. "
                    "Now you're in a foreign courtroom under a fluorescent hum, a translator at your ear, a "
                    "flag that isn't yours behind the judge. And here is the number that ends the story: the "
                    "buyers up north spend a hundred and fifty billion dollars a year on what you sold. A "
                    "hundred and fifty billion. You and every patrón before you were a delivery service for "
                    "an appetite that never once learned your name. You weren't the kingpin. You were "
                    "inventory. And inventory gets restocked."),
         overlay=dict(big="$150 BILLION", sub="THE APPETITE UP NORTH · YOU WERE ONLY THE DELIVERY")),
    dict(id="t26", level=None, template="prisonCell", gap=0.7,
         narration=("A cell in a country you can't pronounce, a light that never fully goes out. This is one "
                    "of the two doors El Tío promised you on the corner when you were thirteen — the cell or "
                    "the grave, and you chose the cell the moment you chose the tunnel. Count what you own "
                    "now. A billion dollars you can't touch. A gold saint in an evidence bag. A count in your "
                    "head you finally stopped keeping because there wasn't paper enough. Zero. You own zero. "
                    "You always did. The cartel just let you hold the gold for a while."),
         overlay=dict(big="$0", sub="THE CELL OR THE GRAVE · THOSE WERE ALWAYS THE EXITS")),
    dict(id="t27", level=None, template="lookoutCorner",
         narration=("Back in the dust town the road out still runs to the horizon, and a boy of thirteen "
                    "stands on the corner where you stood. A man hands him a phone and a whistle. His mother "
                    "coughs through a thin wall. Someone kneels and ties a cheap plastic saint on a bootlace "
                    "at his throat — maybe the same one they cut from you, cleaned off and passed down. Watch "
                    "the road, they tell him. Call the trucks. Six hundred a month. To him it sounds like the "
                    "whole world. The circle closes exactly where it opened."),
         overlay=dict(big="A NEW KID · SAME CORNER", sub="THE ROAD OUT WAS NEVER A WAY OUT")),
    dict(id="t28", level=None, template="emptyChair",
         narration=("And a thousand miles north, in a bright clean city, a man you will never meet lays a bill "
                    "on a bar and gets a small paper packet in return, and never thinks about the sierra or "
                    "the shrine or the boy on the corner, because he doesn't have to. He is the top of the "
                    "ladder you spent your life climbing, and he doesn't know the ladder exists. The dogs went "
                    "quiet for you. They'll go quiet for whoever's next. The market is hungry in the morning, "
                    "same as always. It never once learned a single one of your names."),
         overlay=dict(big="THE HUNGER NEVER ENDS", sub="THE MAN AT THE TOP DOESN'T KNOW YOU EXIST")),
]
