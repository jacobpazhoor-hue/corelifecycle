#!/usr/bin/env python3
"""POV: You Win the Lottery (Every Level of the Money) — POV doodle build, ~12 min.
Grounded in docs/research/lottery_winner.md. SCENARIO format: the levels are escalating TIME/DECISION
points across a single life-changing event and its aftermath (the ticket -> the match -> the claim ->
the first spend -> the family line -> the drain -> the fall -> the rebuild -> the number now), not job
ranks. Second-person present-tense POV: the viewer IS an ordinary forklift operator who wins a $412M
Powerball jackpot and lives what the real research says actually happens next — a spike, then a real
crash, then a smaller, guarded, honestly-earned number at the end.

REAL/VERIFIED mechanics woven in (see research doc; flags there): Powerball jackpot odds are 1 in
292,201,338 [VERIFIED, official prize chart]; the lump-sum cash option is ~50-60% (commonly ~52%) of
the advertised annuitized jackpot, paid immediately, before any tax [VERIFIED, 2026 lottery-tax
coverage]; the IRS withholds 24% automatically but a jackpot lands you in the 37% top bracket, meaning
more is owed at filing [VERIFIED]; roughly half of US states allow anonymous claiming via a trust. The
episode's central "wait — that's real?" reversal: the widely-repeated "70% of lottery winners go
broke" statistic is NOT a real, sourced figure — NEFE, the organization it's constantly misattributed
to, has stated on the record it never produced or can confirm it [VERIFIED]. The real, peer-reviewed
finding (Hankins, Hoekstra & Skiba, Review of Economics and Statistics, 2011) is quieter and scarier in
a different way: winners of MODEST prizes ($50K-$150K), especially those already financially precarious
before they won, file for bankruptcy at a higher rate within 3-5 years [VERIFIED]. This episode's
"curse" beats (a robbery-adjacent threat, a predatory advisor, repeated lawsuits) are a dramatized
recombination of three real, well-documented cases — Jack Whittaker ($314.9M Powerball, 2002, robbed
repeatedly, sued repeatedly, said "I wish I'd torn that ticket up"), William "Bud" Post III ($16.2M
Pennsylvania, 1988, bankrupt within years, his own brother convicted in a murder-for-hire plot over the
winnings), and Abraham Shakespeare ($30M Florida Lotto, 2006, murdered in 2009 by a woman who'd gained
control of his money) — used ONLY as real-world grounding texture, never as the protagonist. The
protagonist, Dale, Renn, Mateo, Priya Chen, Terrence, and every named character in this episode are a
FICTIONAL COMPOSITE; no real winner is depicted as fact.

SPINE: the gold overlay is a SPIKE, not a climb — the advertised jackpot ($412,000,000) at the match,
cut to the real lump-sum-after-tax cash figure ($135,000,000) at the claim, spent down to $118M, held
near $104M through the family-ask level, then CRATERS at the midpoint reversal (-$71,000,000, a
predatory "guaranteed" fund) to $19,000,000 at rock bottom, before a slow, boring, verified rebuild to
$27,000,000 — and the closing twist echoes the claim-level "advertised vs. actual" gap one more time:
of that $27M, only $3,100,000 is actually yours to touch without a trustee's signature, the rest locked
in trust for people who aren't you. The sub-caption carries non-dollar cost beats (61 PEOPLE WHO'VE
ASKED, 3-5 YEARS bankruptcy-study finding) so the gap between the number and the cost stays legible.

STORY: DALE — the gas-station clerk who's sold you a ticket every Friday for six years, warm, never a
villain; his act-1 warning (t04 dialogue, "odds don't care how bad you need it") is the theme stated
early, paid off literally by the closing line. RENN — your sister; her son MATEO's $4,200 ER bill is
the named, concrete want (Level 1), paid off cleanly and immediately at Level 4 — the only number in
the whole story that ever feels entirely clean. PRIYA CHEN — the wealth advisor who structures the
claim helpfully at Level 3, then steers you into an unregistered "friends and family" fund you sign
without your lawyer present; her cold, unapologetic line at the reversal ("You signed every page
yourself") is the rival's taunt at the midpoint. TERRENCE — an old warehouse coworker who resurfaces
claiming a "fifth ticket" existed in your old Friday office pool that no one ever claimed — the
UNRESOLVED UNIVERSE THREAD (deliberate); mentioned twice, never resolved. SENSORY ANCHOR: the smell of
burnt gas-station coffee under a buzzing fluorescent strip light — re-triggered at every level-up (t04,
t09, t16, t22, t30) including, ironically, in Priya's eleven-dollar-coffee office (t09) as a contrast
beat. BODY-DREAD MOTIF (fact, not feeling): "your hands don't move" at the numbers match (t06) ->
"don't shake, not yet" signing the trust (t10) -> "don't shake signing it" at the fund that drains
everything (t16, the line you'll remember longest) -> restored, guarded, at the rebuild (t23).

Templates: 2 NEW (a small lottery pack in src/stage.tsx — ticketCounter/trailerPorch) + DYNASTY's
`galaBallroom`/`suburbHouse`(REALESTATE)/`familyVault`/`yachtDeck` (repurposed from old-money to new
money's isolation and protection) + MAFIA's `courtroom` (re-narrated from RICO to civil nuisance suits)
+ SPY's `safehouse` (re-narrated from a target wall to a forensic accountant's tracing board) + MED's
`consult` + GEN's `foundationScene` + universal (deskSilhouette/window/lobby/boardroomNotes/signing/
dinner/deskClose/fileWall/emptyChair/revolvingDoor/atrium). No two adjacent scenes repeat a template.

STRUCTURAL VARIATION vs the last 2 (self_made_billionaire = FLASH-FORWARD cold open / STEADY-CLIMB-
WITH-ONE-DROP act two / RETURN-AND-PARTIAL-REPAIR ending; crypto_founder = AFTERMATH cold open /
BOOM-BUST-BOOM act two / COMPLICIT-SILENCE ending): this cold open is MID-ACTION (a tense, unresolved
standoff at the gas-station door, cut away before it resolves — last used 2 episodes back by
venture_capitalist, not consecutively); act two is a single RISE-THEN-FALL-THEN-PARTIAL-RECOVERY arc —
one spike, one real crash, one slow honest climb back, not multiple boom-bust cycles and not a steady
line with one drop; the ending is CYCLICAL — the loop-close scene returns to the EXACT same counter,
the exact same clerk, and resolves the cold open's standoff directly (not a torch-passing mentorship,
not one door left ambiguously open, not a silent mirrored choice with a stranger) before landing on a
quiet, quotable, non-triumphant final line.

PROMISE -> PAYOFF LEDGER:
  * t01 cold open (the hoodie man blocking the door, "don't move yet")    -> t30 (resolved: it's Dez, an old coworker, not a threat)
  * t02 promise/cost-line ("you'll know exactly, to the dollar, and past it") -> paid off across the arc, echoed at t30
  * sensory anchor: burnt gas-station coffee + fluorescent hum            -> t04/t09/t16/t22/t30 (re-triggered, including ironically at Priya's office)
  * t03 Mateo's $4,200 ER bill (the named want)                          -> t11 (paid off same-day, the cleanest number in the story)
  * t04 Dale's dialogue warning ("odds don't care how bad you need it")   -> echoed structurally all arc -> literal payoff in t30's closing line
  * t06 body-dread motif ("your hands don't move")                       -> t10 ("don't shake, not yet") -> t16 (drains everything, "you'll remember longest") -> t23 (restored, guarded)
  * t09 the trust/anonymity choice                                       -> t24 (familyVault, "own nothing, control everything") -> t29 (the $3.1M twist)
  * t14 Terrence's "fifth ticket" rumor                                  -> UNRESOLVED, deliberate universe thread; revisited, not resolved, at t28
  * t15 the first lawsuit                                                -> escalates t19 (more lawsuits) -> resolved by t23 (real fiduciary counsel)
  * t16 Priya's unregistered "friends and family" fund, signed unread    -> t17 THE REVERSAL (-$71,000,000)
  * share beat: the debunked "70% go broke" myth + the real 2011 study   -> t21, reframes the whole arc's meaning
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — mid-action, cut away before it resolves ----
    dict(id="t01", level=None, template="ticketCounter", gap=0.7,
         narration=("Fluorescent hum, and under it the smell of burnt gas-station coffee — the same "
                    "smell for six years running. Someone is holding the door shut from outside. A man "
                    "in a gray hoodie stands between you and the parking lot, both hands buried in his "
                    "pockets. 'Just enough to fix what's broken,' he says, too calm for what his hands "
                    "might be doing. Dale freezes behind the register. Six years ago, you stood exactly "
                    "here for a dollar-two ticket. Don't move yet."),
         overlay=dict(big="1 IN 292,201,338", sub="THE ODDS THAT NIGHT NEVER MATTERED LESS")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="deskSilhouette",
         narration=("Rewind six years. None of this exists yet — not the hoodie, not the door held "
                    "shut, not the number that will replace your name in every room you walk into "
                    "afterward. Right now the forklift needs a new battery, the rent is three days "
                    "late, and nobody in this story has said the word jackpot out loud yet. You want to "
                    "know what one actually costs. Everyone thinks they do. By the end you'll know "
                    "exactly, to the dollar, and past it."),
         overlay=None),

    # ---- LEVEL 01 · THE TICKET · $4,200 ----
    dict(id="t03", level="LEVEL 01  ·  THE TICKET  ·  $4,200", template="trailerPorch",
         narration=("Fourteen-fifty an hour on the forklift, third shift, a propane tank reading a "
                    "quarter full on the porch behind you. Your sister Renn's boy Mateo spent Tuesday "
                    "night in an ER bed wheezing, and insurance covers most of it — not the four "
                    "thousand two hundred dollars still sitting on a bill with your name on the "
                    "co-sign line. Rent is due Friday. So is the bill. Only one of them can actually "
                    "wait."),
         overlay=dict(big="$4,200", sub="MATEO'S ER BILL — WHAT YOU DON'T HAVE")),
    dict(id="t04", level=None, template="ticketCounter",
         narration=("Every Friday for six years, one ticket, same six numbers — your father's "
                    "birthday, backward, plus the one he always called lucky before the word stopped "
                    "meaning anything to either of you. Dale rings it up without looking up from the "
                    "register, the way he has a hundred Fridays before this one, exact change ready "
                    "before you even reach the counter. The ticket rack glows red and gold behind him "
                    "under a strip light that's buzzed since before either of you worked here."),
         overlay=None,
         dialogue=dict(text="Odds don't care how bad you need it, kid.")),
    dict(id="t05", level=None, template="window",
         narration=("2 a.m., the ticket photographed four times on your phone — in case the paper "
                    "smudges, in case the dog gets to it, in case something you can't name yet happens "
                    "to a slip of paper worth checking on. The drawing isn't until tomorrow night. "
                    "Therefore none of this checking changes one single number. Count the digits again "
                    "anyway. Sleep was never really the plan tonight, not with six numbers doing laps "
                    "behind your eyes."),
         overlay=None),

    # ---- (still Level 01) the match ----
    dict(id="t06", level=None, template="deskSilhouette",
         narration=("Seven. Fourteen. Nineteen. Twenty-six. Forty-four. The fifth ball is still "
                    "spinning on a muted TV when your stomach drops out from under the rest of you. "
                    "Powerball: eight. Your hands don't move. That's the part that scares you — not the "
                    "numbers matching, the stillness after. The remote stays warm in your other hand. "
                    "You never once think to set it down, and a studio audience on screen is cheering "
                    "for a number they don't know yet is yours."),
         overlay=None),

    # ---- LEVEL 02 · THE MATCH · $412,000,000 ----
    dict(id="t07", level="LEVEL 02  ·  THE MATCH  ·  $412,000,000", template="ticketCounter", gap=0.7,
         narration=("Dale scans the ticket four times before the machine locks up and prints CLAIM AT "
                    "LOTTERY HEADQUARTERS instead of a dollar figure. The whole store goes quiet around "
                    "the sound of it. A stranger three feet away is filming you on his phone before "
                    "you've said one word out loud. Four hundred twelve million dollars, advertised, "
                    "and you haven't claimed a single cent of it yet."),
         overlay=dict(big="$412,000,000", sub="THE ADVERTISED JACKPOT")),
    dict(id="t08", level=None, template="lobby",
         narration=("Lottery headquarters has a security desk, a waiting room with better chairs than "
                    "any DMV, and a clipboard asking one question first: claim under your own name, "
                    "public record forever, or through a trust, and disappear from it. Half the states "
                    "don't give you a choice at all. Yours does. Therefore the first real decision of "
                    "the rest of your life is whether anyone gets to know it was you."),
         overlay=None),

    # ---- LEVEL 03 · THE CLAIM · $135,000,000 ----
    dict(id="t09", level="LEVEL 03  ·  THE CLAIM  ·  $135,000,000", template="boardroomNotes",
         narration=("Priya Chen has a coffee that costs eleven dollars and tastes like nothing, and "
                    "your four hundred twelve million on a whiteboard, cut down live in front of you. "
                    "The lump-sum option is fifty-two percent of that, before tax — two hundred "
                    "fourteen million. Federal withholding takes twenty-four points off the top; the "
                    "real bracket takes thirty-seven. What's actually, finally yours: about a third of "
                    "the number that made the news."),
         overlay=dict(big="$135,000,000", sub="AFTER THE HAIRCUT AND THE IRS")),
    dict(id="t10", level=None, template="signing",
         narration=("You sign as a trust, not a name — Priya's idea, the one piece of advice out of "
                    "this whole ordeal that costs you nothing later. The pen is heavier than a "
                    "two-dollar ticket has any right to make you expect, and the notary stamps three "
                    "separate pages without once looking up. Your hands don't shake, not yet. That's a "
                    "fact worth remembering, plainly, without decoration. It won't stay true forever."),
         overlay=None),

    # ---- LEVEL 04 · THE FIRST SPEND · $118,000,000 ----
    dict(id="t11", level="LEVEL 04  ·  THE FIRST SPEND  ·  $118,000,000", template="openHouse",
         narration=("Mateo's bill gets paid same-day, wired, gone — the smallest number in this whole "
                    "story and the only one that ever feels entirely, completely clean, no fine print "
                    "attached anywhere. Renn gets a house outright, no mortgage, her name only on the "
                    "deed, a spare room already painted for a nephew who doesn't need it yet. You quit "
                    "the forklift job by text message, five words, and delete the app before anyone can "
                    "reply. One hundred eighteen million left, after the house, the debt, the gifts."),
         overlay=dict(big="$118,000,000", sub="AFTER THE HOUSE, THE DEBT, THE GIFTS")),
    dict(id="t12", level=None, template="dinner",
         narration=("Sunday dinner, twice the usual plates on the table, a cousin you haven't spoken "
                    "to since a wedding asking, casually, between bites, what it's like now. Renn "
                    "laughs a half-second too fast at a joke that wasn't funny. Under the noise, a new "
                    "kind of math is already starting — who gets asked first, who gets asked twice, who "
                    "never gets asked at all."),
         overlay=None),

    # ---- LEVEL 05 · THE LINE FORMS · 61 ASKS ----
    dict(id="t13", level="LEVEL 05  ·  THE LINE FORMS  ·  61 ASKS", template="galaBallroom",
         narration=("A small gathering turns into a receiving line without anyone deciding it should. "
                    "A former neighbor needs a truck payment covered. A church you visited twice wants "
                    "a wing named after you. Sixty-one people have asked you for money this month alone "
                    "— you know the exact number because you started keeping a list, and hating "
                    "yourself a little more with every new name added to it."),
         overlay=dict(big="61", sub="PEOPLE WHO'VE ASKED THIS MONTH")),
    dict(id="t14", level=None, template="deskClose",
         narration=("Terrence texts from the old warehouse floor, three years since you last spoke a "
                    "single word to each other — a fifth ticket, he says, from the Friday pool you all "
                    "used to run before the layoffs, one nobody ever actually claimed. He doesn't ask "
                    "outright. He just mentions it, twice, two different ways, days apart. Don't answer "
                    "either message. Some math doesn't add up no matter how many times you run it in "
                    "your head."),
         overlay=None),
    dict(id="t15", level=None, template="courtroom",
         narration=("A cousin of Renn's files first, a promised-share claim built on a conversation "
                    "nobody else remembers happening the way he describes it under oath. Your lawyer "
                    "calls it nuisance litigation and tells you to expect four more before the year is "
                    "out. He's right about the number. He's wrong about the word nuisance — every one "
                    "of them has a real, actual face you used to know."),
         overlay=None),

    # ---- LEVEL 06 · THE DRAIN · SIGNED, UNREAD ----
    dict(id="t16", level="LEVEL 06  ·  THE DRAIN  ·  SIGNED, UNREAD", template="consult", gap=1.4,
         narration=("Priya has a fund, private, 'friends and family only,' guaranteed returns typed in "
                    "a font confident enough to make guaranteed look almost true. Your lawyer is in "
                    "Denver this week, unreachable until Monday. You sign without him, once, because "
                    "once feels harmless when you're this tired of reading fine print at midnight. Your "
                    "hands don't shake signing it. That's the part you'll remember longest, later, once "
                    "you understand exactly what it actually cost you."),
         overlay=None),
    dict(id="t17", level=None, template="deskSilhouette",
         narration=("The statement arrives on a Tuesday, an envelope no different from any other: "
                    "seventy-one million dollars, gone into a fund that was never registered with "
                    "anyone, anywhere, ever, under any name that checks out. Priya doesn't apologize on "
                    "the call. She doesn't raise her voice either. The silence where an explanation "
                    "should be sits there, unfilled, and is somehow the loudest part of the entire "
                    "conversation."),
         overlay=dict(big="-$71,000,000", sub="THE FUND WAS NEVER REGISTERED"),
         dialogue=dict(text="You signed every page yourself.")),
    dict(id="t18", level=None, template="safehouse",
         narration=("A forensic accountant's office now — corkboard, red string, seven shell companies "
                    "tracing back through three different holding names to a P.O. box in a state you've "
                    "never once set foot in. He calls it a common pattern, a real phrase pulled from a "
                    "real study, about winners just like you, filed away somewhere as a footnote. "
                    "Common doesn't make it cheaper. It just makes it less surprising, which turns out "
                    "not to be the same thing as easier."),
         overlay=None),

    # ---- LEVEL 07 · THE FALL · $19,000,000 ----
    dict(id="t19", level="LEVEL 07  ·  THE FALL  ·  $19,000,000", template="window",
         narration=("Two more lawsuits land before the forensic report is even finished being typed — "
                    "a former friend, a contractor, both citing conversations that happened, "
                    "technically, but not the way either of them is describing them now under oath, in "
                    "front of strangers. Legal fees eat faster than the fund ever did, month over month. "
                    "Nineteen million dollars left, on paper, most of it already spoken for by people "
                    "who still have your old phone number."),
         overlay=dict(big="$19,000,000", sub="WHAT'S LEFT, AFTER THE LAWYERS")),
    dict(id="t20", level=None, template="emptyChair",
         narration=("Renn stops answering on the third call, then the fourth, then stops texting back "
                    "even the single word she used to at least send. Her chair at Sunday dinner stays "
                    "empty two weeks running, then three, then long enough that you stop setting a "
                    "plate for it. Money buys the ER bill. Money buys the house. Money does not buy "
                    "your sister trusting a single word you say about any of it anymore."),
         overlay=None),
    dict(id="t21", level=None, template="window",
         narration=("The number everyone quotes — seventy percent of winners go broke — turns out to "
                    "be a stat nobody can actually source; the organization it's always credited to "
                    "says on the record it never produced it. The real study is quieter: modest "
                    "winners, already drowning before the ticket, file for bankruptcy at a higher rate "
                    "within three to five years. Winning didn't fix the hole. It just made the hole big "
                    "enough to be a headline."),
         overlay=dict(big="3–5 YEARS", sub="HOW LONG A WINDFALL TAKES TO FIND THE CRACKS ALREADY THERE")),
    dict(id="t22", level=None, template="openHouse",
         narration=("You show up at Renn's door unannounced, no lawyer, no check, no envelope of any "
                    "kind — just you, hands empty, for the first time in over a year. She lets you as "
                    "far as the porch, not the kitchen, and that's further than the last three weeks "
                    "got you combined. Mateo waves once from the window behind her. Therefore it isn't "
                    "nothing. It just isn't fixed yet either, and you don't try to make it sound like "
                    "more than it is."),
         overlay=None),

    # ---- LEVEL 08 · THE REBUILD · $27,000,000 ----
    dict(id="t23", level="LEVEL 08  ·  THE REBUILD  ·  $27,000,000", template="revolvingDoor",
         narration=("New counsel this time, a fiduciary by law, not by favor — someone whose entire fee "
                    "structure depends on you staying rich long-term, not on you feeling flattered this "
                    "quarter. Therefore the first thing she does, day one, is fire three people who "
                    "were never actually working for you to begin with. It takes eleven full months "
                    "just to get back to a number you can say out loud without flinching at it."),
         overlay=None),
    dict(id="t24", level=None, template="familyVault",
         narration=("A trust gets built the right way this time, walled off from your own signature, "
                    "three separate approvals required for anything larger than a birthday check — "
                    "money for Mateo's college, for Renn's kids you haven't even met yet, locked behind "
                    "a door even you can't open alone anymore. Own nothing, control everything, your "
                    "new lawyer repeats, the way people repeat a line they've clearly said to a hundred "
                    "winners exactly like you before, and meant every time."),
         overlay=None),
    dict(id="t25", level=None, template="atrium",
         narration=("The rebuild is boring on purpose — index funds, three rental properties, a modest "
                    "stake in a business you actually understand because you once ran one out of the "
                    "back of a truck, the smell of diesel still the most honest thing in the whole "
                    "portfolio. Twenty-seven million dollars, verified, diversified, nothing about it "
                    "interesting enough to make the news twice. It took years, real years, to learn how "
                    "to want exactly that."),
         overlay=dict(big="$27,000,000", sub="BORING MONEY. IT TOOK YEARS TO WANT THAT.")),

    # ---- LEVEL 09 · YEARS LATER · THE NUMBER NOW ----
    dict(id="t26", level="LEVEL 09  ·  YEARS LATER  ·  THE NUMBER NOW", template="foundationScene",
         narration=("A scholarship fund, Mateo's name on the first plaque, quietly, for kids with a "
                    "bill like his and no cousin anywhere holding a winning ticket. Ribbon, scissors, a "
                    "reporter asking what advice you'd give the next person whose numbers come up "
                    "someday. There's a true answer, long, about the hoodie, the counter, the smell of "
                    "burnt coffee that never actually left you no matter how far you moved. You give "
                    "the shorter one instead."),
         overlay=None),
    dict(id="t27", level=None, template="yachtDeck",
         narration=("A boat you use four days a year, alone more often than not, open water in every "
                    "direction and nobody left out here to ask you for anything. Gulls, engine hum, "
                    "salt on your lips instead of burnt coffee for once. The quiet is the most "
                    "expensive thing you've ever actually bought, and the first one that's never once "
                    "tried to sue you for it."),
         overlay=None),
    dict(id="t28", level=None, template="lobby",
         narration=("The old warehouse floor still smells like diesel and cold concrete, exactly the "
                    "way it did the last decade you clocked in here. Terrence nods once, doesn't smile, "
                    "doesn't mention the fifth ticket out loud this time either — just holds it there, "
                    "in the space between you, the way he has for years now. Some debts stay open on "
                    "purpose. You let this one stay that way."),
         overlay=None),
    dict(id="t29", level=None, template="window",
         narration=("The real number, the one that actually matters, was never the twenty-seven "
                    "million on the statement. It's the three million one hundred thousand you can "
                    "touch without a trustee's signature sitting next to yours — everything else locked "
                    "away for people who aren't you anymore, by your own design this time, on purpose, "
                    "finally, after learning it the expensive way."),
         overlay=dict(big="$3,100,000", sub="THE REST ISN'T YOURS TO TOUCH")),

    # ---- LOOP CLOSE — cyclical, the same counter, resolving the cold open ----
    dict(id="t30", level=None, template="ticketCounter",
         narration=("The hoodie isn't reaching for a weapon, just his phone — a hospital bill, his "
                    "daughter, four thousand two hundred dollars, the exact number you used to owe "
                    "once, down to the cent. You recognize that particular kind of fear before he even "
                    "finishes the sentence. Dale rings up two things this time: the bill, paid quiet, "
                    "no fuss, and one more ticket for you, same six numbers as always. The odds haven't "
                    "changed. You have."),
         overlay=None,
         dialogue=dict(text="Same numbers?")),
]
