#!/usr/bin/env python3
"""Your Life as a Gladiator at Every Level — POV doodle build, ~12 min.
Grounded in docs/research/gladiator.md. History/rank-hybrid format (per topic_queue.json: format
"history" with a rank-style title spine): Novicius (bought at the block) -> Tiro (first bout) ->
Quartus/Tertius Palus -> Secundus Palus -> Primus Palus (the champion) -> Free Man (the rudis
offered, refused) -> Lanista (owns the ludus) -> the Editor/emperor above you. Second-person
present-tense POV: the viewer IS a composite gladiator who climbs the real, documented palus grading
system (VERIFIED: TheCollector, Rome Wiki) through a ludus (gladiator school) run by a lanista, ending
above even the ludus at the editor/emperor who funds the games. Real background grounding: the palus
ranking tiers, the rudis (wooden sword of discharge, ~30 fights/~5 years), Flamma's four refused
freedoms (Hadrian-era, tombstone-verified), Marcus Attilius's upset of Hilarus (Pompeii graffito),
Marcus Aurelius's real 12,000-sestertii re-enlistment cap, the munera cost tiers, and Trajan's
123-day/~10,000-man Dacian triumph games (Cassius Dio via Jerome, flagged as a later secondary
figure, order-of-magnitude only) -- and Commodus's real documented arena appearances + assassination,
referenced only as background, never as this episode's literal protagonist. Priscus (doctore/mentor)
and Barca (rival) are a FICTIONAL COMPOSITE; "Priscus" borrows the name of one half of the real,
Martial-documented double-rudis pair from the Colosseum's 80 AD inaugural games as grounding texture,
not a claim that this is literally that man.

SPINE: PRICE OF A MAN vs. WINS-TO-FREEDOM -- a new flavor (see research doc; distinct from the seven
prior spine flavors already catalogued: valuation-vs-personal, inverted power-vs-pay, control-vs-own,
scenario pure-money, dual-track-valuation, unbroken-climb-moral-only-reversal, evidence-vs-paycheck).
The big gold overlay tracks your MARKET VALUE -- what the lanista could sell you for, what an editor
pays to rent you (600 HS -> 62 HS purse-share -> 500 HS crowd tosses -> 3,000 HS quoted value ->
12,000 HS, Marcus Aurelius's real re-enlistment cap) -- money that is never legally yours to spend; a
parallel win-count toward the real 30-fight rudis threshold runs underneath, and perversely the more
famous (and more profitable to keep fighting) you become, the less anyone around you wants that count
to finish.

STRUCTURAL VARIATION vs the last 2 produced (mongol_empire = FLASH-FORWARD cold open / rise-then-
fracture / ONE-DOOR-LEFT-OPEN ending; fbi_undercover = MID-ACTION cold open / likable-target moral-
erosion / CYCLICAL ending): this cold open is AFTERMATH (standing over a fallen opponent, the crowd's
thumb not yet turned, cut away before the verdict); act two's shape is RISE-THEN-REVERSAL-THEN-RISE-
AGAIN (the personal rank climb never truly reverses, but the midpoint costs you Priscus, and the
"freedom" the whole climb was nominally for gets refused at Level 6, same as it cost the real Flamma);
the ending is TORCH-PASSING, blended with a CYCLICAL image (the final line bends back to the cold
open's exact unresolved thumb) -- distinct from yakuza's torch-passing (no cyclical image close) and
mongol's one-door-left-open (no direct echo of the cold open at all).

PROMISE -> PAYOFF LEDGER:
  * t01 cold open (the thumb not yet turned)                    -> t34 (the loop close, a new fighter's own thumb-verdict, unresolved and cyclical)
  * t02 promise/cost-line (Marcia, the debt, "you don't know what it costs") -> the DEBT pays off at t22 (the farm bought back); MARCIA HERSELF -- whether she ever learns your arena name, whether you ever see her again -- is the deliberate UNRESOLVED UNIVERSE THREAD
  * sensory anchor: the barley bowl                              -> given/humiliating t04 -> ritual t06 -> weight before the first fight t07 -> untouched in grief t21 -> served by your own hand t23/t27 -> offered again, torch-passed, t33
  * t03 the 600 HS price ("less than the horse")                 -> escalates t08($62)/t10($500)/t13($3,000)/t17($12,000) -> inverted at t26 ($150,000 -- now on the other side of the number)
  * t09 Priscus's tally count ("twenty-nine to go") + mentor warning -> tested t19 (silence beat) -> t20 (his death) -> paid off at t22 (thirty marks reached, refused anyway)
  * t12 Barca's rivalry introduced                                -> paid off at t24 (his taunt, answered by the crowd, not by you)
  * t15 the first death that isn't yours (a fellow tiro)          -> echoed, inverted, at t28 (a fighter dies under YOUR ownership, the ledger side of the same cost)
  * t18 the editor points you out / "Priscus hasn't fought in six years" -> THE REVERSAL at t20
  * t20 Priscus's dying line ("watch the gate")                   -> lived out literally at t29 -> repeated verbatim, torch-passed, at t33 -> paid off visually at t34
  * t30 the 123-day/10,000-man share-worthy fact                  -> undercut immediately by t31 ("the house doesn't sleep well") and t32 (Commodus, the box isn't safe either)
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — AFTERMATH, cut away before the verdict ----
    dict(id="t01", level=None, template="arenaSand", gap=0.7,
         narration=("Sand in your teeth, blood cooling on a stranger's blade already dropped in the "
                    "dirt. Sixty thousand throats have gone quiet at once — the worst sound in Rome. A "
                    "closed fist turns slowly above the first tier, thumb tucked, deciding a life that "
                    "isn't yours to keep. Don't look at the box. Count your own heartbeats instead. Get "
                    "to four before it opens."),
         overlay=dict(big="4 SECONDS", sub="THE THUMB HASN'T TURNED YET")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="riceField",
         narration=("Three years earlier none of this exists — not the sand, not the fist above the "
                    "box, not the name Rome will shout instead of your own. A border farm, a dead "
                    "father's debts, a sister named Marcia too young to understand why soldiers are "
                    "counting the goats twice. You want the debt gone. You don't yet know what Rome "
                    "charges for that, or that it isn't paid in coin."),
         overlay=None),

    # ---- LEVEL 01 · NOVICIUS ----
    dict(id="t03", level="LEVEL 01  ·  NOVICIUS", template="slaveMarket",
         narration=("The auctioneer's stick taps your jaw sideways, checking teeth like you're "
                    "livestock, because today you are. Six hundred sesterces — less than the horse tied "
                    "beside the block, and the horse doesn't flinch at the number. A lanista's man counts "
                    "out coin without once meeting your eyes. Marcia's face is three hundred miles behind "
                    "you and getting further with every one he drops."),
         overlay=dict(big="600 HS", sub="YOUR PRICE. LESS THAN THE HORSE.")),
    dict(id="t04", level=None, template="ludusYard",
         narration=("Chains off, a wooden bowl of grey barley mash pushed into your hands before anyone "
                    "asks your name. Eat, says the man watching you — Priscus, doctore, more scar than "
                    "face. Fat cushions the cut, he says, like it's kindness. It takes months to learn "
                    "he's right: the men who starve here die faster, prettier, and completely unmourned."),
         overlay=None),
    dict(id="t05", level=None, template="arenaGate",
         narration=("Priscus walks you past the tunnel mouth once, just to watch your face do it. "
                    "Torchlight gutters against wet stone; ahead, a rectangle of white daylight roars "
                    "faintly, sixty thousand voices flattened by distance into one long breath. Not yet, "
                    "he says. Not for months. Eat first. Grow first. The relief lasts exactly as long as "
                    "the sentence does, and not one second longer."),
         overlay=None),

    # ---- LEVEL 02 · TIRO (minute-3 spectacle) ----
    dict(id="t06", level="LEVEL 02  ·  TIRO", template="ludusYard",
         narration=("Six months on the wooden post, the same eleven strikes until your shoulders stop "
                    "asking why. Barley three times a day, weight you didn't want piling onto a frame "
                    "built for farm work, not this. Priscus corrects your grip with a stick across the "
                    "knuckles, never the blade. Pain teaches faster than kindness, he says. He isn't wrong."),
         overlay=None),
    dict(id="t07", level=None, template="arenaGate",
         narration=("The bars lift on a system nobody explains twice. Your hands are steady. That's the "
                    "part that scares you — not the shaking, the absence of it, like your body already "
                    "knows something your mind hasn't caught up to. Barley sits like a stone behind your "
                    "ribs. Past the light, a name that isn't yours yet gets announced instead."),
         overlay=None),
    dict(id="t08", level=None, template="arenaSand",
         narration=("Your opponent has fourteen fights and twelve wins; you have zero of either. Nobody "
                    "in the tiers expects the newcomer still standing after — least of all you, blade "
                    "shaking now that it's finally safe to. The crowd doesn't chant your name. It doesn't "
                    "know it yet. Sixty-two sesterces land in your palm afterward, damp, the first money "
                    "you've ever owned outright."),
         overlay=dict(big="62 HS", sub="YOUR FIRST CUT OF THE PURSE")),
    dict(id="t09", level=None, template="ludusYard",
         narration=("Priscus doesn't celebrate wins. He counts them out loud against thirty — the number "
                    "that buys you out from under all of this — and chalks one mark inside the yard wall, "
                    "twenty-nine still bare. Some men chase the count. Some men forget one was ever kept. "
                    "He watches to see which kind you'll be before you've decided it yourself."),
         overlay=None,
         dialogue=dict(text="Don't fall in love with the sand before it lets you go.")),

    # ---- LEVEL 03 · QUARTUS/TERTIUS PALUS ----
    dict(id="t10", level="LEVEL 03  ·  QUARTUS PALUS", template="arenaSand",
         narration=("Six marks on the tally now, quartus palus chalked beside your name for the first "
                    "time — a rank, not just a number. A woman in the third tier throws a bronze bracelet "
                    "instead of coin; a boy near the wall screams a name that turns out to be yours, "
                    "badly pronounced. Barca, two posts over in the yard, watches the bracelet land and "
                    "does not clap."),
         overlay=dict(big="500 HS", sub="TOSSED FROM THE CROWD, NOT PAID")),
    dict(id="t11", level=None, template="ludusOffice",
         narration=("Priscus's ledger hangs behind his desk, every fighter's record chalked in columns: "
                    "wins, purses, a number the lanista calls your worth without once calling it your "
                    "wage. Yours is climbing faster than most. He doesn't say congratulations. He says a "
                    "rising number gets you more fights, not fewer — and more fights is not the same "
                    "thing as more life."),
         overlay=None),
    dict(id="t12", level=None, template="arenaGate",
         narration=("Barca fights secutor to your murmillo, faster than anyone in the yard and twice as "
                    "proud of it. He corners you at the gate before a shared bill, close enough that "
                    "torchlight catches the scar bisecting one eyebrow. Enjoy the bracelets, he says. "
                    "Bracelets don't chalk marks on Priscus's wall. Yours does — and it terrifies him "
                    "more than he'll say out loud."),
         overlay=None),

    # ---- LEVEL 04 · SECUNDUS PALUS ----
    dict(id="t13", level="LEVEL 04  ·  SECUNDUS PALUS", template="arenaSand",
         narration=("Secundus palus now, fourteen marks chalked, and the games get bigger the way debts "
                    "do — quietly, then all at once. A retiarius's net catches your ankle mid-turn and "
                    "the crowd's gasp arrives before your own does. You cut free on instinct you didn't "
                    "know you'd trained. Three thousand sesterces sits under your name in Priscus's "
                    "ledger by nightfall. You don't remember agreeing to be worth that."),
         overlay=dict(big="3,000 HS", sub="YOUR MARKET VALUE, QUOTED ALOUD")),
    dict(id="t14", level=None, template="ludusYard",
         narration=("Priscus's hands shake now on cold mornings, a tremor he hides by keeping them busy "
                    "— resetting the post, restacking practice swords, anything. He teaches you the "
                    "retiarius counter he almost died learning himself, thirty years and one bad knee "
                    "ago. Some lessons cost the teacher more than the student, he says, and doesn't "
                    "explain which kind this one is."),
         overlay=None),
    dict(id="t15", level=None, template="arenaGate",
         narration=("A tiro two years newer than you doesn't walk back through this same tunnel one "
                    "afternoon — a name you knew, a bunk you passed daily, gone in the time it takes a "
                    "net to land wrong. Priscus doesn't stop training that evening. Grief on a schedule "
                    "this tight is a luxury the ludus can't extend you. You eat the barley anyway. It "
                    "tastes like nothing at all."),
         overlay=None),
    dict(id="t16", level=None, template="forumScene",
         narration=("The pompa parades every fighter through the forum before the games, and a stranger "
                    "in the colonnade shouts a name Priscus gave you — not the one Marcia would still "
                    "recognize. Fig sellers wave. A boy copies your walk, badly. Three hundred miles from "
                    "a farm you can barely picture now, the wrong name is starting to feel like the true "
                    "one."),
         overlay=None),

    # ---- LEVEL 05 · PRIMUS PALUS ----
    dict(id="t17", level="LEVEL 05  ·  PRIMUS PALUS", template="arenaSand",
         narration=("Primus palus, the top chalk-mark, the one Priscus says maybe one fighter in twenty "
                    "ever reaches wearing his own teeth. Marcus Aurelius himself has capped what a "
                    "lanista can charge to rent you out again — twelve thousand sesterces, an emperor's "
                    "own ceiling on your price. Twenty-two marks now. Eight from free. The math should "
                    "feel like hope. It feels like a leash getting longer, not shorter."),
         overlay=dict(big="12,000 HS", sub="THE EMPEROR'S OWN CAP ON YOUR PRICE")),
    dict(id="t18", level=None, template="imperialBox",
         narration=("This month's editor — a senator financing the games for votes he'll never admit "
                    "wanting — has you pointed out from the box above the sand, the way a buyer points "
                    "at good livestock. Someone up there likes the story: student and teacher, same "
                    "ludus, same wall. Priscus hasn't fought in six years. That detail, said once too "
                    "loud, doesn't leave the room the way it should."),
         overlay=None),
    dict(id="t19", level=None, template="ludusYard", gap=1.4,
         narration=("Months pass, seven more wins chalked up without you counting them one by one, and "
                    "Priscus rubs oil into a practice sword he hasn't swung in years, slower than the "
                    "job needs. Twenty-nine, he says — not a count this time, just a number sitting in "
                    "the air between you. He starts a sentence twice and finishes neither. The yard has "
                    "never been this quiet at dusk before."),
         overlay=None),
    dict(id="t20", level=None, template="arenaSand",
         narration=("The editor's bill reads STUDENT AGAINST TEACHER, letters big enough for the cheap "
                    "seats, and Priscus walks onto the sand across from you like a man keeping an "
                    "appointment he made decades ago. You lower your blade twice. Twice, the crowd boos "
                    "it back up. On the third, before the thumb can turn, Priscus turns his own wrist "
                    "and takes the choice off the table himself."),
         overlay=dict(big="6 YEARS", sub="RETIRED, UNTIL TODAY'S BILL"),
         dialogue=dict(text="Don't watch me. Watch the gate. That's where you live now.")),
    dict(id="t21", level=None, template="arenaGate",
         narration=("The barley bowl sits untouched on the bench where Priscus always left his. Nobody "
                    "in the ludus says his name out loud for three days, like grief might be contagious. "
                    "You find yourself walking to the gate at the exact hour he used to stand there — not "
                    "fighting, not training, just measuring the light in the tunnel the way he taught you "
                    "without meaning to."),
         overlay=None),

    # ---- LEVEL 06 · FREE MAN (rudis offered, refused) ----
    dict(id="t22", level="LEVEL 06  ·  FREE MAN", template="rudisCeremony",
         narration=("Thirty marks on the wall. A magistrate holds out the rudis at the games' close — "
                    "the wooden sword, the discharge, Marcia's farm bought back twice over and a name "
                    "that could go home to it. Every fighter in the ludus watches you reach for it. You "
                    "take it, turn it once in the light. Then you hand it back and ask for another "
                    "contract instead."),
         overlay=dict(big="THE RUDIS", sub="OFFERED. YOU HAND IT BACK.")),
    dict(id="t23", level=None, template="ludusYard",
         narration=("A new tiro flinches at the practice post the way you once did, and you correct his "
                    "grip with a flat hand instead of Priscus's stick, because some of his lessons you "
                    "kept and some you didn't. Fat cushions the cut, you tell him, handing over a bowl of "
                    "barley he clearly hates already. He'll understand the kindness of it in about six "
                    "months. Everyone does."),
         overlay=None),
    dict(id="t24", level=None, template="arenaSand",
         narration=("Barca, primus palus at a rival ludus now, shares the bill with you for an "
                    "anniversary spectacle the whole city turns out for. He's slower than he was, meaner "
                    "about it, close enough at the gate for only you to hear him. You don't answer with "
                    "words. The crowd answers for you, and for once Barca doesn't watch the bracelets "
                    "land — he watches you."),
         overlay=None,
         dialogue=dict(text="Free men don't usually stay. What's still chasing you?")),

    # ---- LEVEL 07 · LANISTA ----
    dict(id="t25", level="LEVEL 07  ·  LANISTA", template="ludusOffice",
         narration=("Priscus's old ludus comes up for sale the year its aging owner dies with no sons, "
                    "and you buy it before the thought finishes forming — less a plan than a reflex. Your "
                    "name goes on the door where his used to be. The ledger, the tallies, the barley "
                    "rations: all yours to set now, and you set them exactly the way he did, without once "
                    "deciding to."),
         overlay=None),
    dict(id="t26", level=None, template="countRoom",
         narration=("A games budget lands on your table for a mid-tier bill: a hundred and fifty "
                    "thousand sesterces, five ranks of fighters priced by how likely each is to die "
                    "entertainingly. You supply the men. You take the operator's cut. It's, on paper, "
                    "the exact arrangement that once priced you at six hundred — you're just standing on "
                    "the other side of the number now."),
         overlay=dict(big="150,000 HS", sub="A SHOW'S BUDGET. YOU SUPPLY THE MEN.")),
    dict(id="t27", level=None, template="ludusYard",
         narration=("A boy arrives in chains one grey morning, maybe sixteen, a farm accent thick enough "
                    "to place the province without asking. He won't eat the barley at first. Neither did "
                    "you. You don't tell him that yet — some lessons only land once a person's already "
                    "halfway through learning them the hard way, same as every lesson that ever mattered "
                    "here."),
         overlay=None),
    dict(id="t28", level=None, template="arenaSand",
         narration=("One of your own fighters goes down badly in a bill you priced yourself — a shortcut "
                    "in the matching, taken to save four thousand sesterces you didn't need to save. He "
                    "doesn't get up on his own. You cover the funeral cost without being asked to, and "
                    "tell yourself that's the difference between you and the lanista who once bought you. "
                    "Some nights the math doesn't agree."),
         overlay=None),
    dict(id="t29", level=None, template="arenaGate",
         narration=("You stand at the gate now the way Priscus used to, watching someone else's chest "
                    "rise and fall too fast in the dark before it opens. The urge to say something useful "
                    "arrives too late, same as it always does. Not fighting anymore doesn't mean not "
                    "afraid anymore — it just moves the fear to a worse position: watching, unable to "
                    "take the hit for anyone."),
         overlay=None),

    # ---- LEVEL 08 · THE EDITOR ABOVE YOU ----
    dict(id="t30", level="LEVEL 08  ·  THE EDITOR ABOVE YOU", template="imperialBox",
         narration=("An invitation up into the box itself, for games marking a conquest you've never "
                    "seen on any map — Trajan's Dacian triumph, a hundred and twenty-three days, ten "
                    "thousand men across the whole run. Somewhere in that number is a boy who once "
                    "refused barley. You fund a fraction of it. Most of it happens without you in the "
                    "room. From up here the sand looks smaller than it ever did standing on it."),
         overlay=dict(big="123 DAYS", sub="10,000 MEN. AN EMPIRE'S TREASURY.")),
    dict(id="t31", level=None, template="arenaSand",
         narration=("The crowd's roar hits the same register it always did, sixty thousand throats "
                    "folding into one sound, except now it's a sound you bought instead of survived. A "
                    "fighter goes down two rings out and the thumb turns before you've decided how you "
                    "feel about it. You used to be the wager. Now you're the house, and the house, it "
                    "turns out, still doesn't sleep well."),
         overlay=None),
    dict(id="t32", level=None, template="praetorians",
         narration=("Word travels down from the palace faster than anything else does: an emperor fought "
                    "in this same arena once, staged bouts against half-armed men, paid himself a "
                    "fortune from the treasury for every appearance — and died anyway, strangled in his "
                    "own bath by a man he trusted with his back turned. The box is higher than the sand. "
                    "It was never actually safe."),
         overlay=None),

    # ---- LOOP CLOSE — torch-passing, bending back to the cold open ----
    dict(id="t33", level=None, template="ludusYard",
         narration=("Years past owning the place outright, you still meet every new arrival at the post "
                    "yourself instead of sending an underling, chains barely off, a barley bowl already "
                    "in your hand before anyone asks for it. This one won't eat it either. You crouch to "
                    "his eye level anyway, the way it was once done for you, and hand over the only true "
                    "thing anyone ever gave you first."),
         overlay=None,
         dialogue=dict(text="Don't watch me. Watch the gate. That's where you live now.")),
    dict(id="t34", level=None, template="arenaGate",
         narration=("The boy walks the tunnel toward the white rectangle of daylight the exact way you "
                    "once did, slow, chin up, hands steadier than they should be. You don't follow him "
                    "out. You stand where Priscus stood, measuring the light the way he taught you "
                    "without meaning to, and somewhere past the bars sixty thousand throats are already "
                    "going quiet, waiting on a fist that hasn't turned yet."),
         overlay=None),
]
