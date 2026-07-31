#!/usr/bin/env python3
"""Your Life in the Yakuza at Every Rank (You Owe a Finger) — POV doodle build, ~12 min.
Grounded in docs/research/yakuza.md. RANK format: kobun -> wakashu -> shatei -> shatei-gashira ->
shibucho -> wakagashira -> oyabun -> kumicho. Second-person present-tense POV: the viewer IS a
street kid recruited into a fictional, composite gumi (family) and climbs the documented core yakuza
hierarchy (elaborated to 8 rungs for pacing -- flagged in research), grounded in verified mechanics:
sakazuki cup ceremonies, yubitsume (finger-joint atonement), irezumi/tebori tattooing (200-600 hrs,
VERIFIED range), jonokin tribute, the real 2015 Yamaguchi-gumi/Kobe-Yamaguchi-gumi split (used only as
fictionalized background grounding, never depicted as this episode's literal history), the 1992 Botaiho
+ 2009-2011 prefectural exclusion ordinances, and the ~90% collapse in NPA-reported membership from a
184,100 peak (1963) to roughly 17,600 in 2025 [all VERIFIED, see research doc]. The gumi, the syndicate,
and every named character (Sato, Kenji, Yumi, Ishii) are a FICTIONAL COMPOSITE -- no real, currently
active organization or living individual is depicted.

SPINE: an UNBROKEN NUMERIC CLIMB -- the dollar figure never craters (unlike lottery_winner's spike-
crash-rebuild or mob_boss's RICO seizure); the only real drop across the arc is moral/relational (the
mentor's death), not financial. $40/WK (kobun) -> $400/WK handled, not kept (wakashu) -> $2,000/MO
(shatei, made) -> $18,000/MO (shatei-gashira) -> $60,000/MO (shibucho) -> $2,400,000/YR (wakagashira)
-> $11,000,000/YR (oyabun) -> $340,000,000/YR across the whole syndicate (kumicho) -- undercut
immediately by the apex twist: $0 in your own actual name, no account a court can find.

STORY: SATO -- the mid-level oyabun who recruits you off a stairwell, sponsors your first sakazuki,
teaches giri (duty) over ninjo (feeling); the mentor. His betrayal/loss payoff (the midpoint reversal,
~53%): a syndicate-wide split (grounded in the real 2015 Yamaguchi-gumi fracture) forces him to refuse
the breakaway faction; he's hamon'd (excommunicated), then killed. KENJI -- your fellow recruit, faster
and colder, who sides with the breakaway faction and is the one who confirms Sato's death to you (the
rival's taunt at the reversal); he outlives Sato by decades as an aging peer, then dies in old age at
the loop-close, resolving the mentor arc. YUMI -- your mother, missing two joints of her left hand to a
wringer-machine accident, owing loan shark Ishii $600 by Friday -- the named, concrete want (Level 1),
paid off same-scene. The mother's ACCIDENTAL missing joints are echoed deliberately at Level 7 (t25)
when you take a yubitsume joint yourself, ON PURPOSE, for a debt that was never yours. SENSORY/MOTIF
ANCHOR: the sakazuki sake cup, poured three times across the arc (t05 joining, t10 made, t26 kumicho),
paired each time with the body-dread fact "your hand doesn't shake taking it" -- deepening, not fading,
each time it recurs. ANAPHORA (t12): "The family buys respect. The family buys protection. The family
never once buys you out of owing it."

Templates: 6 NEW (a small yakuza pack in src/stage.tsx -- neonAlley/shrineOathRite/irezumiParlor/
pachinkoFloor/oyabunOffice/yubitsumeRite) + MAFIA's backAlley/countRoom/courtroom/wiretap/waterfront/
commission (re-narrated: the council of allied oyabun) + SAMURAI's teaCeremony + REALESTATE's
rentalUnits/constructionSite + MED's hospitalRounds + universal (window/fileWall/tower/boardroomNotes/
signing/revolvingDoor/warRoom). No two adjacent scenes repeat a template.

STRUCTURAL VARIATION vs the last 2 (self_made_billionaire = FLASH-FORWARD cold open / STEADY-CLIMB-
WITH-ONE-DROP act two / RETURN-AND-PARTIAL-REPAIR ending; lottery_winner = MID-ACTION cold open /
RISE-THEN-FALL-THEN-PARTIAL-RECOVERY act two / CYCLICAL same-spot ending): this cold open is AFTERMATH
(you just outside a violent night, cut away before it resolves who's hurt -- last used 3 episodes back
by crypto_founder, not consecutively); act two is an UNBROKEN NUMERIC CLIMB whose only real drop is
moral (distinct from both prior shapes' financial dips/crashes); the ending is TORCH-PASSING -- the
loop-close returns to the alley's TYPE of moment but a NEW kid, and you make a deliberate choice about
whether to extend him the cup, rather than a literal same-spot repeat (not consecutive with lottery's
CYCLICAL ending).

PROMISE -> PAYOFF LEDGER:
  * t01 cold open (blood on your knuckles, a detective who's never made a charge stick) -> t28 (the
    detective retires without ever making a case stick; only the exclusion list ever touched you)
  * t02 promise/cost-line ("you don't know yet what 'in' actually costs")                -> paid off across the arc, echoed at t27/t30
  * sensory anchor: the sakazuki cup + "your hand doesn't shake" body-dread                -> t05 (joining) -> t10 (made) -> t26 (kumicho, "that fact doesn't scare you anymore. It should.")
  * t03 the $600 owed to Ishii by Friday (the named want)                                  -> t05 (paid off same-night, the cleanest transaction in the whole story)
  * t03 Yumi's two missing finger joints (accidental)                                      -> t25 (echoed on purpose: you take a yubitsume joint yourself, for a debt that isn't yours)
  * t05 Sato's dialogue ("a cup poured is a debt that outlives you")                        -> echoed structurally all arc -> literal payoff in t29's closing line
  * t08 Sato's second line ("giri before ninjo")                                           -> tested and broken at t16 (the split forces the choice this line warned about)
  * t12 anaphora ("the family buys respect... buys protection... never buys you out")       -> reframed at t27 ("own nothing, control everything")
  * t15 the split is called (gap=1.4 silence before the reversal line)                     -> t16 THE REVERSAL (Sato hamon'd, then killed; Kenji's taunt)
  * t19 share beat: the real ~90% membership collapse since the 1963 peak                  -> reframes t28's apex-but-excluded ending
  * UNRESOLVED UNIVERSE THREAD (deliberate): the detective's eleven-year file, unclosed     -> mentioned at t01/t28, never fully resolved
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — AFTERMATH, cut away before it resolves who's hurt ----
    dict(id="t01", level=None, template="neonAlley", gap=0.7,
         narration=("Neon bleeds red across wet asphalt outside a club's back door. Your knuckles are "
                    "open — not from throwing anything, from someone else's teeth. A detective stands "
                    "under the streetlamp across the alley, close enough to arrest you, hands staying "
                    "in his coat pockets instead. He's chased your name through three ranks and eleven "
                    "years of files that never once held up in court. Behind you, the door stops "
                    "swinging. Don't look at it twice."),
         overlay=dict(big="11 YEARS", sub="A FILE THAT'S NEVER HELD UP IN COURT")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="window",
         narration=("Rewind decades. None of this exists yet — not the jacket, not the detective who "
                    "knows your name and can't use it, not the door you won't look at twice. Right now "
                    "you're eleven, and the only thing behind any door is your mother, counting coins "
                    "twice to be sure of the total. You want in. You don't know yet what 'in' actually "
                    "costs, or that the bill never really closes."),
         overlay=None),

    # ---- RANK I · KOBUN · $600 (the want) ----
    dict(id="t03", level="RANK I  ·  KOBUN  ·  $600", template="rentalUnits",
         narration=("The apartment sits above a pachinko hall; the machines' clatter comes up through "
                    "the floorboards like a second heartbeat. Your mother, Yumi, folds shirts at a dry "
                    "cleaner two streets over, missing the last two joints of her left hand to a "
                    "wringer machine nobody ever fixed. She owes the loan shark Ishii six hundred "
                    "dollars by Friday, doubling weekly. You count the tea tin twice. It isn't close."),
         overlay=dict(big="$600", sub="WHAT YUMI OWES ISHII BY FRIDAY")),
    dict(id="t04", level=None, template="backAlley",
         narration=("Ishii sends a collector instead of coming himself — a boy barely older than you, "
                    "already good at this. You block the stairwell with your whole unimpressive body, "
                    "and he laughs before he hits you. From the alley's mouth, an older man in a cheap "
                    "good suit watches without moving. He doesn't help. He just watches how long you "
                    "stay standing."),
         overlay=None),
    dict(id="t05", level=None, template="shrineOathRite",
         narration=("The man's name is Sato — oyabun of a gumi three streets wide, nothing more. He "
                    "doesn't offer money. He offers the cup: sake poured by his own hand, three sips, a "
                    "debt owed nowhere but to the family now. Your hand doesn't shake taking it. That's "
                    "the part that scares you. Ishii is paid by morning. You don't ask by whom, or what "
                    "it actually cost him."),
         overlay=dict(big="$40/WK", sub="THE ALLOWANCE OF A KOBUN"),
         dialogue=dict(text="A cup poured is a debt that outlives you.")),

    # ---- RANK II · WAKASHU · $400/WK ----
    dict(id="t06", level="RANK II  ·  WAKASHU  ·  $400/WK", template="pachinkoFloor",
         narration=("Wakashu means young one — running, not deciding. Your job is the hall's Friday "
                    "envelope: four hundred dollars in small bills, collected from a manager too scared "
                    "to skim it himself. Your cut, if Sato feels generous, is whatever he decides. Rows "
                    "of chrome machines rattle around you, feeding on nickel bets from men who never "
                    "leave. None of what passes through your hands is yours. Not yet."),
         overlay=dict(big="$400/WK", sub="COLLECTED. NONE OF IT KEPT.")),
    dict(id="t07", level=None, template="waterfront",
         narration=("A late delivery at the docks — crates nobody is supposed to count, including you. "
                    "Therefore when a rival crew's headlights swing across the containers, running is "
                    "the only decision that's actually yours to make. A shot goes wide over your head, "
                    "close enough to move the air. You don't drop the crate. You don't know yet that "
                    "not dropping it is the reason Sato starts trusting you."),
         overlay=dict(big="1 SHOT", sub="WIDE. CLOSE ENOUGH TO COUNT.")),
    dict(id="t08", level=None, template="teaCeremony",
         narration=("A sit-down over green tea and rules neither of you wrote. Kenji is Sato's other "
                    "new wakashu — faster hands, colder eyes, the kind of calm you can't fake at "
                    "seventeen. He doesn't threaten you outright. He counts, out loud, how many jobs "
                    "you've each run this month, and smiles when his number is higher. Sato watches "
                    "both of you count."),
         overlay=None,
         dialogue=dict(text="Giri before ninjo. Duty before feeling.")),

    # ---- RANK III · SHATEI · 200 HRS ----
    dict(id="t09", level="RANK III  ·  SHATEI  ·  200 HRS", template="irezumiParlor",
         narration=("Becoming shatei starts with the needle, not the cup. Two hundred hours of "
                    "hand-poked ink, one careful line at a time, covering your back in a dragon that "
                    "means nothing to outsiders and everything to the six other men who carry the same "
                    "one. Every session costs a week you can't work, paid in pain instead of yen. The "
                    "tattoo never fully heals. Neither, it turns out, does the reason you got it."),
         overlay=dict(big="200 HRS", sub="THE INK THAT NEVER WASHES OFF")),
    dict(id="t10", level=None, template="shrineOathRite",
         narration=("This cup is different — poured before the altar, Sato's own oyabun presiding, six "
                    "made men as witnesses. Shatei now, officially: a made man, sworn to a code with "
                    "real teeth. Your hand still doesn't shake taking it. Your first real cut of the "
                    "business clears two thousand dollars a month — more than your mother saw in a "
                    "year folding shirts. You send half of it home before you count what's left."),
         overlay=dict(big="$2,000/MO", sub="YOUR FIRST CUT, MADE OFFICIAL")),
    dict(id="t11", level=None, template="pachinkoFloor",
         narration=("Your own corner of the hall now — three rows of machines, a manager who calls you "
                    "by name and means it nervously. Kenji gets the better corner, the one nearer the "
                    "door where the money moves faster, and doesn't let you forget it. Sato says "
                    "nothing when you ask why. Therefore you learn the answer without being told: this "
                    "family promotes speed, not fairness."),
         overlay=None),
    dict(id="t12", level=None, template="countRoom",
         narration=("Every Friday, a cut of everything you and Kenji both earned leaves in a shared "
                    "envelope by morning — jonokin, tribute, the word for money that was never actually "
                    "yours to keep. Kicking up isn't a metaphor here; it's arithmetic, done under a bare "
                    "bulb, by hand, every week without exception. The family buys respect. The family "
                    "buys protection. The family never once buys you out of owing it."),
         overlay=dict(big="30%", sub="THE CUT THAT LEAVES BY MORNING")),

    # ---- RANK IV · SHATEI-GASHIRA · $18,000/MO ----
    dict(id="t13", level="RANK IV  ·  SHATEI-GASHIRA  ·  $18,000/MO", template="constructionSite",
         narration=("Shatei-gashira means your own crew — six men, a construction-front company with "
                    "your name on none of the paperwork, and a public contract nobody else was ever "
                    "going to be allowed to underbid. Eighteen thousand dollars a month moves through "
                    "accounts you control but don't own, laundered through concrete and rebar instead "
                    "of green tea. Kenji runs the crew next door. Neither of you is told, yet, that "
                    "only one crew survives what's coming."),
         overlay=dict(big="$18,000/MO", sub="LAUNDERED THROUGH CONCRETE")),
    dict(id="t14", level=None, template="boardroomNotes",
         narration=("A city inspector signs off on a foundation nobody actually poured to code, for a "
                    "fee smaller than the concrete alone should have cost. Your junior men present the "
                    "numbers like it's an ordinary business, because to them, by now, it genuinely is. "
                    "You used to flinch at moments like this. Somewhere in the last year, without "
                    "noticing exactly when, you stopped."),
         overlay=None),
    dict(id="t15", level=None, template="teaCeremony", gap=1.4,
         narration=("A sit-down called with less notice than usual, Sato's face doing the math before "
                    "his mouth does. A rival faction inside the syndicate — bigger, hungrier, tired of "
                    "an old man's slow rules — is asking every gumi to choose a side by the end of the "
                    "month. Kenji is already in the other room. The wrong room. Sato knows it before "
                    "anyone says his name out loud."),
         overlay=None),

    # ---- MIDPOINT REVERSAL — the split, hamon, Sato's death, Kenji's taunt ----
    dict(id="t16", level=None, template="warRoom",
         narration=("The split breaks the syndicate down the middle inside a single week — a real "
                    "fracture that happened once to a real yakuza empire, not just this one. Sato "
                    "refuses to bend the knee to the breakaway faction. Hamon: excommunicated, disowned "
                    "on paper and in every hall that used to open for him. Three nights later, he's "
                    "dead in a parking garage, and the man who confirms it to you is Kenji."),
         overlay=dict(big="EXCOMMUNICATED", sub="HAMON: DISOWNED, THEN DEAD"),
         dialogue=dict(text="Loyalty was always going to be the losing bet.")),

    # ---- RANK V · SHIBUCHŌ · $60,000/MO ----
    dict(id="t17", level="RANK V  ·  SHIBUCHŌ  ·  $60,000/MO", template="tower",
         narration=("Someone has to hold the territory Sato leaves empty, and grief doesn't get "
                    "scheduled time for a shibucho. You take the branch — sixty thousand dollars a "
                    "month moving through six businesses across four blocks, more power in one "
                    "afternoon than you'd earned across the last six years combined. Therefore the "
                    "promotion doesn't feel like winning. It feels like being handed a bill with "
                    "someone else's name still on it."),
         overlay=dict(big="$60,000/MO", sub="SATO'S TERRITORY, NOW YOURS")),
    dict(id="t18", level=None, template="hospitalRounds",
         narration=("A war this quiet still keeps a body count — three of your own men in beds this "
                    "month alone, one who won't walk again, none of it reported to any police anywhere. "
                    "You visit because Sato would have, not because it changes the ledger. The man in "
                    "the third bed doesn't recognize you through the bandages. You're grateful, for "
                    "once, not to be recognized."),
         overlay=None),
    dict(id="t19", level=None, template="wiretap",
         narration=("The National Police Agency doesn't need a wiretap to know your name anymore — a "
                    "1992 law and a decade of local ordinances after it built a public exclusion list, "
                    "and yours is already on it. Banks refuse you an account. Landlords refuse you a "
                    "lease. Membership in this life has fallen roughly ninety percent since its 1960s "
                    "peak, and every year it drops further, for exactly this reason. You're rising "
                    "inside a world that's disappearing under you."),
         overlay=dict(big="-90%", sub="MEMBERSHIP SINCE THE 1963 PEAK")),

    # ---- RANK VI · WAKAGASHIRA · $2,400,000/YR ----
    dict(id="t20", level="RANK VI  ·  WAKAGASHIRA  ·  $2,400,000/YR", template="oyabunOffice",
         narration=("Wakagashira — the whole family's second, Sato's old title, worn now by the boy who "
                    "used to hide in a stairwell. Every shatei-gashira's tribute crosses your desk "
                    "before anyone else's; on paper, 2.4 million dollars a year moves through hands "
                    "that are, still, technically, not your own. Sato's sword hangs above a small "
                    "shrine shelf in the corner. You touch neither. Some things stay exactly where the "
                    "dead left them."),
         overlay=dict(big="$2,400,000/YR", sub="EVERY CREW'S TRIBUTE CROSSES YOUR DESK")),
    dict(id="t21", level=None, template="signing",
         narration=("You sign for a hotel development nobody in this city can trace back further than a "
                    "shell company three names deep — the family's biggest legitimate front yet, worth "
                    "more on paper than the entire pachinko chain that raised you. Your signature isn't "
                    "your real name. Neither, most days now, is the face you wear in daylight."),
         overlay=None),
    dict(id="t22", level=None, template="commission",
         narration=("A council of oyabun from every allied gumi meets twice a year in a windowless room, "
                    "to divide territory the old man used to divide alone. You sit at the table now, "
                    "one voice among a dozen — power that widens the moment you stop needing anyone's "
                    "permission first. Kenji sits three seats down, running his own branch of the "
                    "winning faction. Neither of you says Sato's name out loud."),
         overlay=None),

    # ---- RANK VII · OYABUN · $11,000,000/YR ----
    dict(id="t23", level="RANK VII  ·  OYABUN  ·  $11,000,000/YR", template="oyabunOffice",
         narration=("Your own gumi now, under the syndicate's larger banner — construction, real "
                    "estate, three pachinko chains, eleven million dollars a year moving through an "
                    "empire with your name on none of it. Sato's sword still hangs where he left it; "
                    "you finally take it down, not to use, just to stop looking at it every day. Being "
                    "the boss mostly means deciding who else has to make the calls you used to make "
                    "yourself."),
         overlay=dict(big="$11,000,000/YR", sub="THE EMPIRE, YOUR NAME ON NONE OF IT")),
    dict(id="t24", level=None, template="waterfront",
         narration=("The docks again, except now you're the one whose headlights swing across someone "
                    "else's delivery — a smaller crew moving product without your blessing, on your "
                    "own territory. You could let it go. Therefore you don't, because letting it go is "
                    "exactly how territory stops being yours, and territory is the only thing in this "
                    "life that was ever actually yours to lose."),
         overlay=None),
    dict(id="t25", level=None, template="yubitsumeRite",
         narration=("One of your men botched the hotel deal badly enough to cost the gumi real money, "
                    "real reputation — an apology has to be made the old way, or the whole crew reads "
                    "it as weakness. He offers his own finger. You take the blade off the tray instead "
                    "and do it yourself, in front of him, the way Sato once explained but you never "
                    "watched him do. Your mother lost two joints to a machine she never chose. You take "
                    "one on purpose, for a debt that was never yours."),
         overlay=dict(big="1 JOINT", sub="TAKEN INSTEAD OF HIM")),

    # ---- RANK VIII · KUMICHŌ · $340,000,000/YR ----
    dict(id="t26", level="RANK VIII  ·  KUMICHŌ  ·  $340,000,000/YR", template="shrineOathRite", gap=0.7,
         narration=("The old kumicho dies quietly of age, not violence, and the cup passes to you in a "
                    "ceremony forty men deep — supreme boss now, of a syndicate whose businesses move "
                    "an estimated three hundred forty million dollars a year, across a country that's "
                    "spent decades trying to make people like you disappear. Your hand doesn't shake "
                    "taking this cup either. By now, that fact doesn't scare you anymore. It should."),
         overlay=dict(big="$340,000,000", sub="WHAT THE WHOLE SYNDICATE MOVES A YEAR")),
    dict(id="t27", level=None, template="fileWall",
         narration=("On paper, an empire. In your own name: nothing — no deed, no account, no share "
                    "certificate anywhere a court could actually find and seize. Every real kumicho "
                    "learns this same lesson eventually. Own nothing. Control everything. Die, "
                    "technically, broke."),
         overlay=dict(big="$0", sub="WHAT'S ACTUALLY IN YOUR NAME")),
    dict(id="t28", level=None, template="revolvingDoor",
         narration=("Three banks turn you away before a fourth agrees to hold money for a man with your "
                    "name attached to it — the exclusion ordinances, not the police, finally did what "
                    "eleven years of detective work never managed. He retired last spring, that "
                    "detective, without ever once making a charge stick; only a form, a checkbox, an "
                    "exclusion list, touched you in the end. Being kumicho means being the richest man "
                    "in the building who still can't sign for the building."),
         overlay=dict(big="3 BANKS", sub="BEFORE ONE SAID YES")),

    # ---- LOOP CLOSE — torch-passing, resolving the mentor arc ----
    dict(id="t29", level=None, template="hospitalRounds",
         narration=("Kenji, seventy-one now, three seats down from you for forty years and never once a "
                    "friend, dies the way most of the men who chose the other side eventually did — "
                    "quietly, replaced years ago by faces with no tattoos and no cup ceremony at all, "
                    "the kind police can't track because there's nothing left to track. You sit with "
                    "him anyway. Some debts stay open on purpose."),
         overlay=None,
         dialogue=dict(text="Tell Sato I kept the code.")),
    dict(id="t30", level=None, template="neonAlley",
         narration=("Same kind of alley, decades later, rain instead of neon. A kid maybe fifteen "
                    "stands over a fallen collector's boy, hands shaking in a way yours stopped doing a "
                    "long time ago. You don't offer him the cup yet. You just watch, the way Sato once "
                    "watched you, long enough to see how long he stays standing before you decide "
                    "whether this one is worth the debt."),
         overlay=None),
]
