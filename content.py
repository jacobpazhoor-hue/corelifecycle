#!/usr/bin/env python3
"""Your Life as Every Rank in Special Forces — POV doodle build, ~12 min, template-driven.
Grounded in docs/research/special_forces.md (the special-operations ladder: selection candidate ->
operator on an ODA -> team sergeant -> the tier-1 Unit -> assault/troop commander -> squadron ->
the joint task force that spends operators -> the anonymous signature above it all). Second-person
present-tense POV: the viewer IS a nobody who climbs from a selection roster number to the man who
signs the targets, and learns he was ammunition the whole way. Dramatization layer over VERIFIED,
NON-INSTRUCTIONAL mechanics: SELECTION attrition (most wash out), the Q Course and the tab, the ODA
(12-man Operational Detachment Alpha, 18-series specialties), unconventional warfare / foreign internal
defense / direct action, the tier-1 special mission unit under JSOC running STERILE (no rank, no name,
"you don't exist"), the find-fix-finish HVT raid cycle, ISR/exfil/the bird, and the interagency /
National Command Authority / a case officer above the whole enterprise. NO real tradecraft or methods
are depicted — selection events and jargon are named only as career milestones (cautionary POV).

SPINE (a command + attrition STAT, not $ — special forces is a modest salary; the drama is who you
spend): ROSTER 47 / most quit -> 1 OF 12 (the ODA + the tab) -> 12 MEN die on your call -> NO NAME
(the Unit, sterile) -> 40 DOORS A NIGHT (assault commander) -> 100+ OPERATORS (squadron) -> 3
CONTINENTS (the task force that spends you) -> ONE SIGNATURE (the man who signs, whom you never see).
You climb from being SPENT (the tip of the spear is the part that breaks off in the wound) to being
the one who SPENDS others — and above even you sits a civilian who never trained, never bled.

STORY: mentor MASTER SERGEANT COLE (the cadre who runs your selection, then your team sergeant; gives
you the code and the warning "quitting is a bullet"); rival VEGA (climbs beside you from selection,
faster, crueler, makes the Unit with you, taunts as a rival troop leader at the midpoint). MIDPOINT:
on an HVT raid the exfil bird is pulled to protect a source, and Cole is killed holding the stairwell —
you carry his taped tags out and learn the truth: you are not the spear, you are what the spear is
made of. Ammunition. And ammunition gets spent. Sensory anchor motif: YOUR DOG TAGS, TAPED SO THEY
DON'T RATTLE (sound discipline) — loud at selection (t01), taped the night of the first infil (t05),
checked on the team (t07), NONE at the sterile Unit (t10), a dead man's tags carried out (t14), a
drawer of them (t17), and a new candidate's rattling on a ruck run at the loop-close (t28). Master
open loop: the cold open (t00) — first man through a door, a hostage in the third room, a shape
rising with a rifle — resolves at t26 (you make the shot, the hostage lives, you take the round);
the final image bends back to a selection ruck run in the dark (t28).

PROMISE->PAYOFF LEDGER:
  * t00 cold-open (the breach, hostage in the third room, a shape rising)  -> t26 (you make the shot; you take the round)
  * t01 want: the tab / to belong + finish                                 -> t04 (you earn it)
  * anchor: dog tags taped so they don't rattle                            -> t05, t07, t10 (none/sterile), t14, t17, t28
  * t02 mentor Cole + his warning "quitting is a bullet"                    -> t13/t14 (Cole killed; you carry his tags out)
  * t02 rival Vega                                                          -> t15 (his taunt); t23 (what you both became)
  * t14 cost line "you are ammunition"                                     -> t23/t24 (you become the one who spends)
  * UNRESOLVED universe thread (deliberate): the case officer who signs     -> the man from Langley whose name you're never
    the folder ("Mr. Gray")                                                    cleared to know — left open for a future episode.

Templates: MILITARY pack (bootcamp/barracksLife/frontline/commandPost/decoration) + SPY pack
(tradecraft/surveillance/safehouse/debrief/station) + universal (warRoom/emptyChair/signing/jet).
No two adjacent scenes share a template. Structural variation vs last 2 (billionaire_heir will-reading /
samurai flash-forward mat): cold open is an in-medias-res MID-ACTION breach; act-2 is a straight RISE
that curdles at the midpoint (rise-into-rot); ending is CYCLICAL (back to a ruck run in the dark) with
one universe door left open (the man who signs).
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — the breach (the master loop, mid-action) ----
    dict(id="t00", level=None, template="frontline", gap=0.7,
         narration=("Zero three-thirty. You're first on the door, stacked tight, four men breathing on your "
                    "spine. The charge blows. Flashbang. White. You go in low through the smoke, rifle up, and "
                    "the hostage is exactly where the source swore — third room, zip-tied to a chair. But a "
                    "shape rises in the corner with a long gun coming level, and you have half a second to be "
                    "right. Your tags are taped silent against your chest. Your hands are steady. Hold there."),
         overlay=dict(big="0330 · BREACH", sub="THE HOSTAGE IS IN THE THIRD ROOM")),

    # ---- LEVEL 1 — THE CANDIDATE (selection) ----
    dict(id="t01", level="LEVEL 01  ·  THE CANDIDATE", template="bootcamp",
         narration=("Rewind. You're a nobody from a nothing town, a name-tape and a roster number — forty-"
                    "seven — and nothing else. No team. No tab. Fresh dog tags rattle on your chest with "
                    "every step of the ruck, loud as coins in a can. Two hundred men started this morning. "
                    "The mountain doesn't care about any of you. Other guys want to be soldiers. You want in "
                    "somewhere that would never let you quit."),
         overlay=dict(big="ROSTER 47", sub="200 START · A NAME TAPE, NOTHING ELSE")),
    dict(id="t02", level=None, template="tradecraft",
         narration=("Selection is built to break you, and it's honest about it. Land nav alone in the black. "
                    "A ruck that grinds your spine into your hips. Sleep measured in minutes. A cadre named "
                    "Master Sergeant Cole runs the course, flat-eyed, never yelling. A recruit called Vega "
                    "moves up front like the weight is nothing. At the truck a man drops his ruck and climbs "
                    "aboard — done. Cole doesn't even look. He looks at you."),
         overlay=None,
         dialogue=dict(text="You don't get to quit here. Quitting is a bullet — it only takes one.")),
    dict(id="t03", level=None, template="barracksLife", gap=0.7,
         narration=("By day three the barracks tells the whole story without a word. Two hundred bunks this "
                    "morning. Count them now — most are stripped bare, mattresses rolled, the men who owned "
                    "them gone in the night. Nobody was thrown out. They walked. That's the trick of it: no "
                    "one makes you fail. You unmake yourself, quietly, at three a.m., and ring a bell. Your "
                    "tags still rattle. Vega's bunk is still made. So is yours."),
         overlay=dict(big="MOST QUIT", sub="SELECTION · NOBODY FAILS YOU — YOU FAIL YOURSELF")),

    # ---- LEVEL 2 — THE OPERATOR (the tab, the ODA) ----
    dict(id="t04", level="LEVEL 02  ·  THE OPERATOR", template="decoration",
         narration=("Selection only earns you the right to be trained. Months of the pipeline — the Q Course, "
                    "weapons and demolitions and languages beaten into you — and then a plain morning under "
                    "the flags, and they hand you the tab. You made it. You're an operator now, one of twelve "
                    "on an Operational Detachment Alpha — an A-team, a whole small war in a dozen men. Cole is "
                    "your team sergeant. The boy from the ruck run belongs to something at last."),
         overlay=dict(big="1 OF 12", sub="THE TAB · YOU MADE THE TEAM")),
    dict(id="t05", level=None, template="surveillance",
         narration=("First infil. A dim street in a country the news won't name, midnight, the smell of diesel "
                    "and wet concrete. Before you step off, you do the thing Cole taught you — you tape your "
                    "dog tags flat so they can't rattle, can't catch light, can't give you away. Sound "
                    "discipline. The tags go silent against your skin and stay that way for twenty years. "
                    "Out here you don't announce yourself. Out here, quiet is alive."),
         overlay=dict(big="TAPE THE TAGS", sub="SOUND DISCIPLINE · QUIET IS ALIVE")),
    dict(id="t06", level=None, template="frontline",
         narration=("Then a doorway lights up, and the training becomes true in one second. Muzzle flash. The "
                    "copper taste floods your mouth before you understand you bit your cheek. Your hands move "
                    "on their own — stack, breach, clear — the way Cole drilled it ten thousand times. When "
                    "it's over a man is down who was standing, and you're still standing who could be down. "
                    "That's the whole math. You did the job. It bought you the next one."),
         overlay=dict(big="FIRST", sub="THE COPPER TASTE · AND YOU DID THE JOB")),

    # ---- LEVEL 3 — THE TEAM SERGEANT ----
    dict(id="t07", level="LEVEL 03  ·  THE TEAM SERGEANT", template="commandPost",
         narration=("Therefore they give you the team. Cole moves up, and the ODA is yours — twelve men, "
                    "twelve families, one plan, and your name on it. Before every bird you walk the line and "
                    "check each man: kit, ammo, and the tags, taped flat, because a rattle is a funeral. "
                    "Twelve lives now ride on a call you make in the dark on half the facts. The weight isn't "
                    "the ruck anymore. The weight is that every one of them believes you."),
         overlay=dict(big="12 MEN", sub="THE TEAM SERGEANT · THEY DIE ON YOUR CALL")),
    dict(id="t08", level=None, template="safehouse",
         narration=("The work is quieter than the movies. A corkboard of faces, a map stuck with red string, "
                    "a village you're meant to turn into a partner and a weapon. Foreign internal defense — "
                    "you train other men to fight so fewer of yours have to. But intel is a rumor wearing a "
                    "suit, and one night the string points at the wrong house. A door you clear holds a "
                    "family, not a target. You carry that home. It doesn't tape down quiet."),
         overlay=None),
    dict(id="t09", level=None, template="debrief",
         narration=("But being good at this only buys a harder door. In a bare room under a single bulb, two "
                    "men with no patches and no names slide a folder across the table. There is a place above "
                    "Special Forces — a Unit that doesn't officially exist, its own selection, worse than the "
                    "first. Vega already got the tap; he'll be in your class. You sign. Reaching the top means "
                    "nothing if you can't survive being chosen for it first."),
         overlay=dict(big="THE TAP", sub="A UNIT THAT DOESN'T EXIST · SELECTION, AGAIN")),

    # ---- LEVEL 4 — THE UNIT (tier-1, sterile) ----
    dict(id="t10", level="LEVEL 04  ·  THE UNIT", template="tradecraft",
         narration=("The Unit erases you to make you. No rank on your chest. No unit patch. No name tape. You "
                    "grow your hair out, wear civilian clothes, and carry no ID at all — and here's the part "
                    "that's actually real: you take off your dog tags. Sterile kit. If you die tonight, "
                    "there's nothing on your body to say who you were. You spent your whole life earning a "
                    "name. They just took it back. On paper, you don't exist."),
         overlay=dict(big="NO NAME", sub="THE UNIT · STERILE · YOU DON'T EXIST")),
    dict(id="t11", level=None, template="safehouse",
         narration=("Now the board is a hunt. A high-value target's face, patterns of life, the F3EA cycle — "
                    "find, fix, finish, exploit, analyze — a machine that turns a name into a raid into "
                    "another name by dawn. Drones hold overwatch like patient birds. You are the finish. The "
                    "sharp end. The tip of the spear — and nobody says the quiet part: the tip is the part "
                    "that snaps off in the wound. You're too busy being the best in the world to hear it."),
         overlay=None),
    dict(id="t12", level=None, template="frontline",
         narration=("So you finish. Raid after raid, the same brutal ballet — infil, breach, clear, exfil "
                    "before the block wakes. Rotor wash, cordite, the copper taste that never fully leaves. "
                    "Vega runs the next team over, counting kills against yours like a scoreboard. You're "
                    "untouchable, the both of you. That feeling — that nothing can reach you up here — is "
                    "exactly the lie the next night is built to teach you."),
         overlay=dict(big="THE TIP OF THE SPEAR", sub="FIND · FIX · FINISH · BEFORE DAWN")),

    # ---- MIDPOINT — the bird is pulled; Cole ----
    dict(id="t13", level=None, template="surveillance", gap=1.4,
         narration=("One target looks like all the others until it isn't. A compound, a stairwell, Cole on "
                    "point because he never stopped going through doors. You're on the roof running the "
                    "assault. The exfil bird is inbound, minutes out, blades already a rumor on the horizon. "
                    "Cole's voice in your ear, calm, holding the stairwell so the team can pull the hostage. "
                    "Then command comes up on the net. And the bird banks away."),
         overlay=None),
    dict(id="t14", level=None, template="frontline", gap=0.7,
         narration=("A source somewhere is worth more than the man on the stairs. The exfil is diverted to "
                    "protect an asset you'll never be briefed on. No QRF. Cole holds anyway, because that's "
                    "the code he taught you, until he can't. You bring him out yourself, and his tags are "
                    "taped flat, silent, the way he showed you at the truck. That's when it lands, cold and "
                    "final: you are not the spear. You are what the spear is made of. Ammunition. And "
                    "ammunition gets spent."),
         overlay=dict(big="AMMUNITION", sub="THE BIRD BANKED AWAY · AND HE HELD ANYWAY")),

    # ---- LEVEL 5 — TROOP / ASSAULT COMMANDER ----
    dict(id="t15", level="LEVEL 05  ·  ASSAULT COMMANDER", template="commandPost",
         narration=("You should quit. Instead grief burns down to something harder, and you take the troop. "
                    "You stop kicking the door and start choosing it. Multiple objectives a night, the whole "
                    "assault force moving on your word, HVTs crossed off a list before breakfast. Vega runs "
                    "the troop beside yours, and he grins across the planning table with Cole barely buried."),
         overlay=dict(big="40 DOORS A NIGHT", sub="YOU CHOOSE THE DOOR NOW"),
         dialogue=dict(text="Still counting the dead, farmer? Up here you don't count them. You spend them.")),
    dict(id="t16", level=None, template="surveillance",
         narration=("And you're good at it — that's the horror. You move men across a city like pieces, and "
                    "the ones who don't come back become a line in a report you sign before the coffee's "
                    "cold. Money bought nothing here; the job pays a schoolteacher's wage. What it buys is "
                    "this: the power to decide which of your own men walks into the room that's wrong. You "
                    "make that call clean now. Your hands are steady. That's the part that should frighten you."),
         overlay=None),
    dict(id="t17", level=None, template="barracksLife",
         narration=("In your desk there's a drawer you don't open in daylight. Dog tags, taped flat, silent — "
                    "one set for every man you spent. You could name each one, the town, the kid, the joke he "
                    "always told. The rattle you silenced twenty years ago to stay alive is the sound you "
                    "can't get back. You wanted in somewhere that would never let you quit. It never will. "
                    "That was the trap, and you walked into it grinning."),
         overlay=dict(big="A DRAWER OF TAGS", sub="ONE SET FOR EVERY MAN YOU SPENT")),

    # ---- LEVEL 6 — SQUADRON COMMANDER ----
    dict(id="t18", level="LEVEL 06  ·  SQUADRON COMMANDER", template="station",
         narration=("Still you climb, because stopping is the only door you can't make yourself open. They "
                    "give you a squadron — a hundred-plus operators plus the enablers, intel and aviation and "
                    "the drones that never blink, spread across theaters you used to only infil. You don't "
                    "wear the kit now. You sign for the target and hand the mission to a younger version of "
                    "yourself, tags already taped, already gone into the dark."),
         overlay=dict(big="100+ OPERATORS", sub="YOU SIGN THE TARGET NOW")),
    dict(id="t19", level=None, template="signing",
         narration=("A name crosses your desk, a face, a pattern of life, a window of maybe two hours. You "
                    "sign. Somewhere a stack forms on a door, a charge blows, a man goes in low through the "
                    "smoke — and you are warm and dry a thousand miles away, moving him like you were once "
                    "moved. You have become the calm voice on the net. The one who banks the bird away when "
                    "the math says a source is worth more than the man on the stairs."),
         overlay=None),
    dict(id="t20", level=None, template="debrief",
         narration=("But every command answers to a bigger one. Under a bulb in a bare room, a folder slides "
                    "toward you again — the same ritual as the tap, older now. The joint task force. The "
                    "level where special operations stops being a knife and becomes a machine that runs the "
                    "whole hunt at once. You take it. Of course you take it. You never learned how to be a "
                    "man who doesn't."),
         overlay=dict(big="THE TASK FORCE", sub="THE KNIFE BECOMES A MACHINE")),

    # ---- LEVEL 7 — THE TASK FORCE (JSOC) ----
    dict(id="t21", level="LEVEL 07  ·  THE JOINT COMMAND", template="warRoom",
         narration=("A dark room the size of a hangar, a wall of live feeds, a globe pinned with every target "
                    "worth a raid. Three continents run through your hands at once. The industrial version of "
                    "the thing that made you: find, fix, finish, on a schedule, forever, a raid a night in "
                    "cities most of the country couldn't place on a map. You are the command now. The command "
                    "that spends operators. The command that once spent you."),
         overlay=dict(big="3 CONTINENTS", sub="THE COMMAND THAT SPENDS OPERATORS")),
    dict(id="t22", level=None, template="commandPost",
         narration=("The wall calls it find-fix-finish. Everyone in the room says it flat, like weather. A "
                    "green figure on a screen becomes a dot, becomes a decision, becomes nothing, and the "
                    "next slide is already up. You approve targets by the dozen between sips of cold coffee. "
                    "The boy on the ruck run couldn't have carried this. The man on the stairwell died so "
                    "someone could. Turns out that someone is you."),
         overlay=None),
    dict(id="t23", level=None, template="emptyChair",
         narration=("Vega's chair is empty across the command floor — burned out, or buried, you're never told "
                    "which, and you don't ask. You won the race the two of you ran from the mud. This is the "
                    "prize: a room where you become the exact voice that banked the bird away from Cole. You "
                    "swore you'd never be it. You are it. The only question left is who taps a man like you — "
                    "and there's a folder for that too."),
         overlay=None),

    # ---- LEVEL 8 — THE MAN WHO SIGNS ----
    dict(id="t24", level="LEVEL 08  ·  THE MAN WHO SIGNS", template="station", gap=0.7,
         narration=("Above the whole enterprise sits a chain you were never cleared to see. An interagency "
                    "man from Langley — call him Mr. Gray, because you never get a real name — sets a folder "
                    "on the table. Inside is a target, a country, and a signature line that is not yours. "
                    "He never trained. He never bled. He never taped a tag. He decides, and you execute, and "
                    "the war stays a secret because officially none of it happened at all."),
         overlay=dict(big="ONE SIGNATURE", sub="THE MAN WHO SIGNS · YOU NEVER SEE HIM"),
         dialogue=dict(text="There's no medal for this one. You were never here. Sign it.")),
    dict(id="t25", level=None, template="jet",
         narration=("You did point the spear once. You forget that, up here, warm and briefed and clean. So "
                    "walk it back — all the way back — to the thing the whole climb was built to answer. That "
                    "first breach. Zero three-thirty. The third room. The hostage in the chair, and the shape "
                    "rising in the corner with a long gun coming level. You've spent twenty years becoming the "
                    "man who could sign this. Once, you were the man who had to be right."),
         overlay=None),

    # ---- LOOP CLOSE — resolve the breach, then the ruck run ----
    dict(id="t26", level=None, template="frontline", gap=0.7,
         narration=("Half a second. Your tags are taped silent, your hands are steady, and you make the shot "
                    "because Cole drilled it into your spine ten thousand times. The shape drops. The hostage "
                    "lives. But the corner had a second gun, and a round punches through your shoulder like a "
                    "hot wire, and you go down grinning in the smoke, alive, having done the job. That's the "
                    "whole math. It bought you every level after. And every level cost you the boy who taped "
                    "his tags that first night."),
         overlay=dict(big="YOU MAKE THE SHOT", sub="THE HOSTAGE LIVES · AND YOU TAKE THE ROUND")),
    dict(id="t27", level=None, template="decoration",
         narration=("There is no medal for most of it, and the ones they give you, you can't wear where "
                    "anyone would understand. You have a drawer of silent tags and a folder signed by a man "
                    "with no name and a shoulder that aches before rain. You wanted in somewhere that would "
                    "never let you quit. You got it. It kept its promise all the way down. It never once let "
                    "you go."),
         overlay=dict(big="NO MEDAL", sub="IT NEVER ONCE LET YOU GO")),
    dict(id="t28", level=None, template="bootcamp",
         narration=("Before dawn, a mountain, a line of nobodies under rucks in the black. You're the cadre "
                    "now, flat-eyed, standing where Cole stood. Two hundred started. A kid near the back, "
                    "roster number rattling, fresh tags loud as coins in a can — same as you, all those "
                    "years ago. He's about to unmake himself, or not. You step in close and tell him the only "
                    "true thing anyone ever told you. Tape your tags, son. Quiet is alive. The circle closes "
                    "in the dark where it opened."),
         overlay=dict(big="ROSTER 01", sub="A NEW NAME TAPE · THE CIRCLE BEGINS AGAIN")),
]
