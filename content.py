#!/usr/bin/env python3
"""POV: You're a Black Market Surgeon (You Never Get to Stop) — POV doodle build, ~12.5 min.
Grounded in docs/research/black_market_surgeon.md. SCENARIO format: NOT a job-rank ladder — a single
escalating situation. Level labels are the escalating $ of the underground medicine economy, not a
job title. Second-person present-tense POV: a licensed trauma surgeon loses everything to a malpractice
board, and the cash-only underground — off-book gunshot patch-ups, unlicensed cosmetic injections,
organ brokering — is the only medicine still open to him. DRAMATIZED CAUTIONARY POV, never a how-to:
no technique detail, no method — the point is the trap closing around a man who once saved lives.

REAL/VERIFIED mechanics woven in (see research doc; flags there): state medical boards do revoke
licenses for malpractice/patient-safety violations (verified: Ohio's revocation of Dr. Katharine Grawe,
"Dr. Roxy", after botched cosmetic procedures); "pumping parties" — unlicensed cash injections of
silicone/paraffin/other substitutes — are real and documented, with a reviewed case series putting
pulmonary-silicone-embolism mortality at roughly ONE IN FOUR (verified: Black Madam/Fiordaliza Pichardo
cases); US law (e.g. NY Penal Law §265.25) makes it a chargeable misdemeanor for a treating physician
to NOT report a gunshot wound — the exact real mechanism that creates cash demand for an off-book
doctor (verified: the NY-Presbyterian/Plaxico Burress reporting-failure investigation); a 2017 Global
Financial Integrity estimate puts illegal organ trafficking at $840M-$1.7B/year, ~12,000 illegal
transplants performed in 2014 (two-thirds kidneys), buyer-side prices $50K-$200K, and the actual donor
— often trafficked or coerced — receiving UNDER 10% of that, often just $1,000-$10,000 [SOLID, the
biggest "wait, that's real?" beat, t18]. The $5,000/month crew retainer and the $1,000,000/year
syndicate house-doctor tier are dramatized composites (flagged in the research doc as illustrative
patterns, not single cited cases) — never presented as real figures, only as the story's escalation.
Numbers serve the story; never listed as a lecture.

SPINE (the escalating cash figure, a legitimate salary collapsing to $0 then climbing back through an
illegitimate one): $180,000/yr (real license) -> $0 (revoked) -> $400/night (first off-book cut) ->
$1,500/night (the regulars) -> $5,000/month (the crew retainer) -> $250,000 (the organ broker's offer,
the reversal) -> $1,000,000/yr (the syndicate's exclusive house doctor) -> [YOU DON'T GET TO STOP — a
fact, not a number]. Cash rises while the legal, the clean, and the reversible all fall to zero first.

STORY: MAYA — your daughter, whose second heart surgery ($11,000 insurance won't cover) is the named
want that opens the door (t01), the reason you tell yourself every level up (t19), and the person who
can never know what paid for her healthy heart (t24/t29). DR. HALE — the delicensed surgeon who
recruits you into off-book work (t09 dialogue: "The first cut for money is the only one that still
costs you anything. After that, it's just Tuesday."); the reversal's aftershock is learning the
syndicate only needs ONE house doctor and Hale no longer has the job (t22) — the promotion that erases
the man who trained you. DESH — a younger, hungrier black-market medic and rival, introduced at his own
retainer (t16), who taunts you once you've crossed the line he hasn't yet (t21 dialogue), and whose own
disappearance from the trade is a late, unexplained callback (t31). MARISOL — the broker/fixer who runs
the job board and later the organ network (t14); her t32 dialogue ("You're not the first doctor on this
board. You won't be the last. There's a man in Geneva who's going to want to meet you.") plants the
UNRESOLVED universe thread — the overseas buyer, never seen, already lined up for whoever's next.
SENSORY ANCHOR: the SNAP of a latex glove at the wrist, re-triggered at every level-up (t03/t09/t10/
t23/t30/t33) — clean and cheap in the legitimate world, cheaper and dirtier through the fall, then
expensive and sterile again at the syndicate clinic, because (t30) "a sound doesn't know the difference
between saving a life and owning one." Secondary sensory: antiseptic curdling into rubbing alcohol,
then bleach, then back to a clinical smell that no longer means safety. Body-dread motif (fact, not
feeling): "your hands find the work before your mind agrees to it" — first true at t10, repeated and
worse at t27. Master open loop: the COLD OPEN (t00 — flash-forward, the syndicate's clean private
clinic, a phone that won't stop buzzing, "you don't get to say no anymore") is not resolved until t23
(the same room, recognized from the inside this time) and paid off completely at t33 (the phone buzzes
again; you already know what you're going to say).

PROMISE -> PAYOFF LEDGER:
  * t00 cold-open flash-forward (the guarded clinic, the phone that won't stop)   -> t23 (you recognize the room), t33 (the phone, full circle)
  * t01 promise/cost line (you've never thought about where the line is; you will) -> t18/t22/t26/t28 (each line crossed)
  * anchor: the glove snap at the wrist                                          -> t03 (clean)/t09 (older glove)/t10 (cheaper)/t23 (expensive again)/t30 (the same sound)/t33 (automatic)
  * body-dread: your hands find the work before your mind agrees to it          -> t10 (first true), t27 (worse, routine)
  * MAYA + the $11,000 surgery (t01)                                            -> t19 (paid for, in blood-money), t24 (she can never know), t29 (she has her heart; you don't have yours)
  * DR. HALE planted + his warning (t09)                                        -> t22 (his fate — replaced, never explained)
  * DESH planted (t16)                                                          -> t21 (the taunt), t31 (his own unexplained disappearance)
  * t12 share beat: illegal silicone injections carry roughly 1-in-4 lung-embolism mortality -> paid immediately (a delivered fact)
  * t18 share beat + REVERSAL: the organ trade's real math — buyer pays 10x what the donor (often coerced) receives -> paid immediately; drives t19-t22
  * MARISOL planted (t14)                                                       -> t32 (her line to the next doctor); UNRESOLVED universe thread: the man in Geneva, never seen
  * wiretap/Feds foreshadow (t17)                                               -> t26 (the raid the syndicate simply absorbs — you can't be arrested, you also can't leave)

Templates: MED pack (operatingRoom/scrubIn/hospitalRounds/consult) for the legitimate-life and
human-cost beats; a NEW small "underground medicine" pack in src/stage.tsx — hotelRoom/basementOR/
coldCase/syndicateClinic — composed ENTIRELY from existing backdrops re-lit/re-staged (operatingRoom
re-lit dim = the basement OR; the MAFIA count room's cash pile = the organ handoff; donStudy re-lit =
the pumping-party room; the clean operatingRoom + a guard extra = the syndicate's owned clinic — no new
SVG art, see docs/TEMPLATES.md). Reused from MAFIA: backAlley, courtroom, donOffice, wiretap. Reused
from SPY: safehouse. Universal: podiumScene, fileWall, deskSilhouette, layoffs, countRoom(MAFIA)/
window/lobby. No two adjacent scenes share a template; syndicateClinic (the master-loop anchor) is
reused non-adjacently 4x, mirroring how prior episodes reuse one anchor template for the cold-open/
payoff/apex/close (e.g. samurai's sengokuField). STRUCTURAL VARIATION vs the last 2 (hitman = mid-action
cold open / rise-with-mounting-guilt / door-left-open; samurai = aftermath cold open / tragic rise /
cyclical mirror-by-place): this cold open is a FLASH-FORWARD (a glimpse of the apex before rewinding to
explain it), the act-2 shape is FALL-THEN-RISE (a real career collapses to $0 before the underground
climb begins), and the loop closes via ROLE MIRRORING (a new desperate doctor takes your old seat at
Marisol's door) rather than a place-echo or a someone-else's-hands echo — a different mechanic from
both prior episodes.
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — flash-forward to the apex, cut away before it resolves (master loop) ----
    dict(id="t00", level=None, template="syndicateClinic", gap=0.7,
         narration=("Steel door. Two guards, bored the way men get when killing is only their job. A "
                    "phone on the tray buzzes and does not stop. Latex snaps at your wrist — clean, "
                    "expensive, wrong on hands like yours. Whatever is under this sheet, you don't get "
                    "to say no to it anymore. Not tonight. Not ever again."),
         overlay=None),

    # ---- LEVEL 01 · $180,000 — the real license, the named want ----
    dict(id="t01", level="LEVEL 01  ·  $180,000", template="operatingRoom", rate="-10%",
         narration=("Rewind. None of that exists yet. Tonight you're a licensed trauma surgeon, "
                    "$180,000 a year, a hospital badge with your real name on it. Your daughter Maya "
                    "needs a second heart surgery insurance won't fully cover — eleven thousand dollars, "
                    "a number you say out loud like it's a dare. You have never once thought about "
                    "where the line is. You will."),
         overlay=dict(big="$180,000", sub="A REAL LICENSE · A DAUGHTER'S $11,000 SURGERY")),
    dict(id="t02", level=None, template="podiumScene",
         narration=("Six months ago you presented your outcomes data to four hundred surgeons in this "
                    "same city — the best complication rate in your hospital's twenty-year history. "
                    "Applause you can still hear, if you're honest with yourself. Maya sat in the second "
                    "row, front teeth missing, holding a poster board that read MY DAD FIXES HEARTS. "
                    "Right now, tonight, you still believe that's exactly what you do."),
         overlay=None),
    dict(id="t03", level=None, template="scrubIn",
         narration=("The glove snaps clean and cold at your wrist, the way it has ten thousand times "
                    "before. Antiseptic, and the hum of a machine keeping somebody alive. A drug "
                    "interaction slips past you on a Tuesday, buried in a chart nobody double-checks in "
                    "time. The patient doesn't wake up. Your hands were steady through every second of "
                    "it. That's the part the review board can't get past."),
         overlay=None),
    dict(id="t04", level=None, template="hospitalRounds",
         narration=("Nobody says it to your face. Colleagues find reasons to check a different chart, "
                    "take a different hallway, laugh a half-second too loud walking past you. The "
                    "lawsuit is $340,000 you don't have. The board meets Thursday. Don't wait for the "
                    "letter. You already know exactly what it's going to say before anyone signs it."),
         overlay=None),

    # ---- LEVEL 02 · $0 — the fall ----
    dict(id="t05", level="LEVEL 02  ·  $0", template="courtroom", gap=0.7,
         narration=("$0. License revoked, permanent, the word stamped across eleven years of training "
                    "in one afternoon. The room smells like old carpet and vending-machine coffee, "
                    "nothing like a hospital. Eleven thousand dollars for Maya's surgery is still due. "
                    "It was due yesterday. A man who spent a decade learning to save lives just lost the "
                    "only legal way left to do it."),
         overlay=dict(big="$0", sub="THE LICENSE, REVOKED — PERMANENT")),
    dict(id="t06", level=None, template="deskSilhouette",
         narration=("Unemployment doesn't cover a surgeon's mortgage, let alone a cardiologist's "
                    "invoice. You apply to be anything — a device rep, a hospital administrator, "
                    "anything that will still take a felon's cousin of a résumé. Every application asks "
                    "the same question near the top. Every answer is the same no near the bottom. "
                    "Maya's surgery date moves. Then it moves again."),
         overlay=None),
    dict(id="t07", level=None, template="fileWall",
         narration=("Rejection letters pile on the kitchen counter like a second lawsuit. Your bank "
                    "balance reads $340, a number you're almost afraid to look at twice. You haven't "
                    "told Maya any of this — she still thinks Dad's just on a break. You are extremely "
                    "good at exactly one skill in the entire world, and using it now, on your own, is a "
                    "felony."),
         overlay=None),
    dict(id="t08", level=None, template="layoffs",
         narration=("The eviction notice is yellow, taped at exact eye level so you can't miss it. Your "
                    "wife takes Maya to her mother's — temporarily, she says, and you both know how "
                    "much work that word is quietly doing. You have never once been truly hungry in "
                    "your life until now, and it turns out hunger has an excellent memory. A stranger "
                    "calls your old cell number. He has work. Off the books."),
         overlay=None),

    # ---- LEVEL 03 · $400 A NIGHT — the first cut, Dr. Hale, the anchor made real ----
    dict(id="t09", level="LEVEL 03  ·  $400 A NIGHT", template="backAlley",
         narration=("$400 a night. Cash, folded twice, no chart, no name. Dr. Hale meets you under a "
                    "caged bulb in an alley that smells of wet brick and gun oil, and sizes you up like "
                    "a man buying a used car. He was a real surgeon once too, before the first version "
                    "of this exact conversation. Latex snaps at your wrist. Older glove. Same sound."),
         overlay=dict(big="$400 / NIGHT", sub="CASH · NO CHART · NO NAME"),
         dialogue=dict(text="The first cut for money is the only one that still costs you anything. After that, it's just Tuesday.")),
    dict(id="t10", level=None, template="basementOR", rate="+12%",
         narration=("Bare bulb. Plastic sheeting taped over a basement window. A kid on a folding table "
                    "with a hole in him nobody can explain to a nurse with a badge. Rubbing alcohol "
                    "instead of the surgical scrub you trained on — same sting, cheaper smell. Your "
                    "hands find the bullet before you've finished deciding whether you're really doing "
                    "this. They already know. They stopped asking your permission on the walk down here."),
         overlay=None),
    dict(id="t11", level=None, template="consult",
         narration=("He's seventeen, and he begs you not to call it in before he begs you to stop the "
                    "bleeding — in that exact order. A real hospital reports a gunshot wound by law "
                    "within the hour. Here, the only law is whoever is paying you. You keep the boy "
                    "alive and keep his name out of every record that exists. Therefore you're not a "
                    "doctor tonight. You're something the law never bothered to build a word for."),
         overlay=None),

    # ---- LEVEL 04 · $1,500 A NIGHT — the regulars ----
    dict(id="t12", level="LEVEL 04  ·  $1,500 A NIGHT", template="hotelRoom",
         narration=("$1,500 a night. Regulars now — a motel room, foil taped over the window, a line of "
                    "women who can't afford a real surgeon's silicone or his conscience. Roughly one in "
                    "four people who take an injection like this into their lungs never walks back out "
                    "of an emergency room. That's a documented number, not a scare tactic. You don't "
                    "tell them. They wouldn't stop asking anyway."),
         overlay=dict(big="$1,500 / NIGHT", sub="THE REGULARS")),
    dict(id="t13", level=None, template="countRoom",
         narration=("Money buys silence. Money buys distance from the version of you that used to "
                    "check a chart twice. Money buys the version of you that stops asking a patient's "
                    "real name. You count it twice under a bulb with no shade, and for the first time in "
                    "a year it's more than enough. It has also never once, not for a second, felt like "
                    "it's actually yours."),
         overlay=None),
    dict(id="t14", level=None, template="safehouse",
         narration=("A corkboard behind her, photographs pinned with red string connecting names you "
                    "don't recognize to jobs you're about to take. Marisol runs the wall like a "
                    "scheduler with a much worse waitlist. She never once asks what happened to your "
                    "license — she already knows. That's exactly why she called you first. You're not "
                    "her first doctor. You won't be her last."),
         overlay=None),
    dict(id="t15", level=None, template="hospitalRounds",
         narration=("You walk past your old hospital some mornings, on purpose, just to prove to "
                    "yourself you still can. Nobody at the front desk recognizes you anymore — new "
                    "badges, a repainted lobby, a life that kept going fine without you in it. You tell "
                    "yourself that's relief. Standing here, it reads a lot more like grief with "
                    "somewhere else to be tonight."),
         overlay=None),

    # ---- LEVEL 05 · $5,000 A MONTH — the retainer, Desh ----
    dict(id="t16", level="LEVEL 05  ·  $5,000 A MONTH", template="donOffice",
         narration=("$5,000 a month, guaranteed, whether anyone gets shot this week or not. One crew "
                    "keeps you on retainer now instead of paying you wound by wound. A younger guy named "
                    "Desh works the next neighborhood over — same trade, same silence, already watching "
                    "your numbers the way a resident eyes a rotation he wants. You used to compete for a "
                    "fellowship. Now you compete for whose patients bleed out slower."),
         overlay=dict(big="$5,000 / MONTH", sub="ON CALL FOR ONE CREW")),
    dict(id="t17", level=None, template="wiretap", gap=1.4,
         narration=("A reel-to-reel turns in a room three blocks from where you'll scrub in tonight, a "
                    "federal agent circling a name on a photograph that might be yours by Christmas. You "
                    "don't know that yet. Marisol calls with a new kind of job — more money than you've "
                    "ever once been offered, and she wants your answer before you've heard the whole "
                    "sentence."),
         overlay=None),

    # ---- LEVEL 06 · $250,000 — THE BROKER (midpoint reversal) ----
    dict(id="t18", level="LEVEL 06  ·  $250,000", template="coldCase",
         narration=("$250,000. One kidney, one night, a steel cooler on ice instead of a chart. The "
                    "buyer pays roughly ten times that number; the person on your table gets under ten "
                    "percent of the total and didn't fully choose to be here. That's not a rumor. That's "
                    "the real, documented math of the organ trade, and as of tonight you are standing "
                    "inside it, not reading about it."),
         overlay=dict(big="$250,000", sub="THE ORGAN BROKER'S OFFER")),
    dict(id="t19", level=None, template="basementOR",
         narration=("You don't sleep after. The antiseptic smell that used to mean safety now just "
                    "means something is being covered up quickly and well. Maya's second surgery is "
                    "paid in full, cash, no insurance company ever asking a single question. You bought "
                    "her a working heart with someone else's kidney, and you cannot make that sentence "
                    "sound clean no matter how many times you rehearse it in your head."),
         overlay=None),
    dict(id="t20", level=None, template="consult",
         narration=("You operate on three more patients that same week and don't ask a single "
                    "follow-up question about any of them. The follow-up call used to be a reflex — the "
                    "actual caring part of medicine, the part you trained a decade for. It's gone now, "
                    "and you genuinely can't remember which patient took it from you when he left your "
                    "table."),
         overlay=None),
    dict(id="t21", level=None, template="backAlley",
         narration=("Desh finds you under the same caged bulb where Hale first found you, and he isn't "
                    "smiling the way a rival usually does when he's finally caught up. He crossed a line "
                    "he used to swear he never would. Tonight, so did you. Neither of you says that part "
                    "out loud."),
         overlay=None,
         dialogue=dict(text="You used to save people for a living. Now you just decide who's worth saving. Congratulations. You're finally one of us.")),

    # ---- LEVEL 07 · $1,000,000 A YEAR — the syndicate's doctor ----
    dict(id="t22", level="LEVEL 07  ·  $1,000,000 A YEAR", template="donOffice",
         narration=("$1,000,000 a year. A guaranteed contract, a private clinic, real equipment, armed "
                    "men making sure nobody ever asks you a question again. You ask where Hale is — the "
                    "man who trained you into this exact life. The syndicate only needs one house "
                    "doctor. You get the job because he doesn't have it anymore, and nobody offers to "
                    "tell you what that actually means."),
         overlay=dict(big="$1,000,000 / YR", sub="THE SYNDICATE'S OWN DOCTOR")),
    dict(id="t23", level=None, template="syndicateClinic",
         narration=("Steel door. Two guards, bored the way men get when killing is just their job. The "
                    "same kind of phone from the very first night of this story sits on the same kind "
                    "of tray, and it buzzes exactly the way you always somehow knew it eventually would. "
                    "You recognize this room before you've even finished walking into it. You built it "
                    "the entire time you thought you were only surviving."),
         overlay=None),
    dict(id="t24", level=None, template="consult",
         narration=("Maya visits on a Sunday, thirteen now, a healthy heart, a father with a private "
                    "clinic she's been told is consulting work. She asks why you're never home before "
                    "dinner anymore. You give her an answer that's true in every single word and "
                    "somehow, completely, a lie. Therefore the one person you did all of this for can "
                    "never be told why you actually did it."),
         overlay=None),
    dict(id="t25", level=None, template="window",
         narration=("The clinic has a window, real glass, an actual view, and most nights you stand at "
                    "it doing the math on what it would cost to simply disappear. There isn't a number "
                    "high enough. There's also, you're only now starting to understand, no number "
                    "required — nobody who works for this syndicate is ever actually asked if they'd "
                    "like to leave."),
         overlay=None),

    # ---- LEVEL 08 · YOU DON'T GET TO STOP — total captivity, loop close ----
    dict(id="t26", level="LEVEL 08  ·  YOU DON'T GET TO STOP", template="wiretap", rate="+12%",
         narration=("You don't get to stop. Federal agents raid a warehouse two addresses from your "
                    "clinic; the syndicate has a lawyer standing there before the agents finish reading "
                    "the warrant out loud. You're worth more to them protected than prosecuted, which "
                    "sounds like safety until you understand what it actually means. You cannot be "
                    "arrested. You also cannot leave. Those are the same fact, said two different ways."),
         overlay=dict(big="NO EXIT", sub="PROTECTED FROM EVERYTHING EXCEPT THIS")),
    dict(id="t27", level=None, template="coldCase",
         narration=("Money buys silence. Money buys distance. Money buys the version of you that "
                    "doesn't ask anymore — you bought all three, in full, years ago now. Another cooler, "
                    "another number packed on ice, another name you'll never learn and were never once "
                    "going to ask for. Your hands find the work before your mind agrees to it. They "
                    "stopped waiting for your permission around level three."),
         overlay=None),
    dict(id="t28", level=None, template="syndicateClinic",
         narration=("The private clinic is the nicest room you've worked in since residency — better "
                    "light, better tools, better everything except the two men by the door whose entire "
                    "job is making sure you never walk out of this particular life. You saved people for "
                    "a living once. Now a living is the only thing standing between you and being one "
                    "more body the syndicate quietly disappears."),
         overlay=None),
    dict(id="t29", level=None, template="window",
         narration=("A real window, actual glass, an actual view for once. You have more money than the "
                    "surgeon you used to be ever earned in a decade, and you would trade every dollar of "
                    "it for one ordinary Tuesday when the worst thing on your schedule was a paperwork "
                    "audit. Maya has her heart now. You no longer entirely have yours."),
         overlay=None),
    dict(id="t30", level=None, template="scrubIn",
         narration=("The glove snaps at your wrist, clean and expensive now, sterile in a way that would "
                    "have made the old you proud. It's the exact same sound as your very first day of "
                    "residency, and the exact same sound as your first illegal cut in a basement, "
                    "because a sound doesn't know the difference between saving a life and owning one. "
                    "You do. That's the whole cost, right there, in one small snap."),
         overlay=None),
    dict(id="t31", level=None, template="backAlley",
         narration=("Desh never made it to the syndicate's tier — not enough referrals, or too many, "
                    "nobody bothers telling you which. You still drive past the caged bulb in that alley "
                    "sometimes, tinted windows up, and think about the rival who taught you exactly what "
                    "crossing a line costs. He's gone now, the way people go in this life: quietly, and "
                    "without an explanation anyone owes you."),
         overlay=None),
    dict(id="t32", level=None, template="lobby",
         narration=("A young doctor waits outside Marisol's door the exact way you once did — "
                    "desperate, delicensed, out of better options, quietly rehearsing a sentence about "
                    "how this is only temporary. Marisol looks at him the precise way she once looked at "
                    "you."),
         overlay=None,
         dialogue=dict(text="You're not the first doctor on this board. You won't be the last. There's a man in Geneva who's going to want to meet you.")),
    dict(id="t33", level=None, template="syndicateClinic", gap=0.7, rate="-10%",
         narration=("The phone on the tray buzzes and does not stop. Latex snaps at your wrist, one "
                    "more time, clean and cold and utterly automatic. You pick it up before you've "
                    "decided to. Somewhere down a basement stairwell exactly like the one you started "
                    "on, another life just walked in asking for the same off-book miracle you once "
                    "were. You already know exactly what you're going to say."),
         overlay=None),
]
