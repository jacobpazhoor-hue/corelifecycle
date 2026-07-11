#!/usr/bin/env python3
"""POV: You're the World's First Trillionaire — POV doodle build, ~12.5 min, template-driven.
Grounded in docs/research/trillionaire.md. SCENARIO format: the levels are an escalating MONEY ladder
(not job ranks). The gold "$" overlay is the wealth spine — $0 -> $1M -> $100M -> $1B -> $100B -> $1T
-> "$1T ON PAPER / $0 you can spend" -> "THE APPETITE". Second-person present-tense POV: you are a
broke, brilliant 31-year-old whose sister Dani is sick in the way that costs money you don't have; you
build a company with your best friend Sam, and the number climbs — a million, a hundred million, a
billion — until, to cross into the billions, you gut what Sam built and end the town that raised you.
By a trillion you learn the number is not money you can spend; it is a stock position that only stays
real if you never touch it, priced every second by strangers who never learn your name. DRAMATIZED
near-future cautionary POV about wealth, power, and isolation — NOT a how-to, NOT glorification.

REAL/VERIFIED mechanics woven in (see research doc; FLAGS there): no trillionaire exists yet (piece is
EXPLICITLY near-future/projected — Oxfam ~2030s); a TRILLION SECONDS ≈ 31,700 years vs a billion ≈ 32
years (the whole point — they sound alike and are not); spending $1M A DAY SINCE THE BIRTH OF CHRIST
still totals only ≈$740B < $1T (the share beat); a mega-fortune is UNREALIZED EQUITY — selling a large
stake pushes the price DOWN (market impact) so it can't be cashed at face value; "BUY, BORROW, DIE" —
the ultra-rich borrow against pledged shares for spendable cash and realize no taxable income; a paper
fortune can swell by >$1M PER MINUTE (Oxfam on Musk, 2025); $1T would exceed the GDP of all but ~15-18
countries (FLAGGED approximate); a net worth is set by OTHER PEOPLE, second by second, and dies
overnight if confidence dies. Numbers serve the STORY (woven into POV, never listed).

SPINE (money overlay — the number and what it charges you at each stage):
$1T(cold open) -> $0 -> $1M -> $100M -> $1B -> $100B -> $740B -> $1T -> $1T ON PAPER / $0 CASH ->
THE APPETITE.

STORY: DANI (Dani) — your younger sister, sick, two states away; the REASON you climb and the RELATION
the money erodes; the sensory/emotional anchor is her 19-SECOND SAVED VOICEMAIL ("call me back," her
laugh), re-triggered at every level and unresolved at the top (you cannot buy one new second of it).
SAM — your best friend since eighth grade and co-founder (garage, folding chairs, her code + your
nerve); the MIDPOINT BETRAYAL (t13) — to cross into the billions you sell out her half and end the
town, and she walks out the same garage door. HALVORSEN — the first investor/mentor whose warning
frames the whole arc (t02 dialogue) and who hands you the knife (t09); his rule pays off at t25.
ROURKE — a rival billionaire, the midpoint taunt (t14 dialogue). KEELE — the fixer / family-office
head (shared-universe character); his line ends you (t26) and he is left UNRESOLVED (he already has
the next one's number). Sensory anchor motif (body-based, per the ocean/trillionaire lesson — a TASTE,
not an undrawn prop): BURNT GAS-STATION COFFEE — all you can afford at $0, the last thing that still
tastes like being nobody at $1T; re-triggered at t01/t05/t10/t11/t17/t20/t27. Master open loop: the
FLASH-FORWARD cold open (t00 — the ballroom, thirteen digits, Dani calling LIVE, your hands full of
champagne, you let it ring) pays off at t18-t19. Universe thread (deliberate, left OPEN): KEELE (t26) —
who manages whoever's next, and books a flight to a younger, hungrier kid with an idea and a sister
and a card that just declined.

PROMISE->PAYOFF LEDGER:
  * t00 flash-forward cold open (thirteen digits; Dani live; you let it ring)  -> t18/t19 (we arrive at the exact moment; the call dies)
  * t01 want: enough that "no" stops meaning Dani + the declined card          -> t04 (you pay her whole bill), t26/t27 (you got it all; she's a voicemail now)
  * anchor: BURNT GAS-STATION COFFEE (re-triggered)                            -> t05/t10/t11/t17/t20/t27 ("the last thing that tastes like being nobody")
  * anchor: DANI's 19-second voicemail (her laugh, "call me back")             -> t02/t08/t16/t19/t27 (all you own outright at the end)
  * t02 Halvorsen's warning "the number will never love you back"              -> t25 (fully understood; it never learned your name)
  * t03 SAM planted (co-founder, the handshake half)                           -> t13 (the midpoint betrayal; she walks out the garage)
  * t06 buy-borrow-die / "rich but no money" (the paper trap)                  -> t15 (leverage), t21/t22 (you can't sell; you're the collateral)
  * t17 share beat: $1M/day since Christ still < a trillion                    -> paid immediately (a delivered fact)
  * t18 share beat: a trillion seconds = ~31,700 years                         -> paid immediately (a delivered fact)
  * t24 THE APPETITE (what sits above the money)                               -> t25/t26 (it never sleeps and never learns your name)
  * KEELE (t26) — the universe thread                                          -> left UNRESOLVED on purpose (he goes to the next kid)

Templates: REUSE ONLY (no new stage art). Wealth/power keys from the existing packs —
galaBallroom/yachtDeck/throne/portraitHall/familyVault (DYNASTY), rooftopEmpire (REALESTATE),
tradingFloor/pnlWall (HEDGE), garageStart/startupGrow/serverScale (STARTUP), donOffice-free MAFIA
avoided; plus universals desk/deskClose/dinner/boardroomNotes/boardroomHead/tower/atrium/supervisor/
signing/layoffs/window/lobby/emptyChair. galaBallroom is the reused master-loop anchor (t00 cold open /
t18 payoff); pnlWall (t10/t21), serverScale (t05/t24), desk-family (t01/t20), window (t16/t27) each
reused but NEVER on adjacent scenes. STRUCTURAL VARIATION vs last 2 (ocean = mid-action cold open /
fall-then-rise / one-door-open; cartel = aftermath cold open / rise-then-fall / cyclical): this cold
open is a FLASH-FORWARD (dropped forward to the $1T ballroom before we've earned it), the act shape is
a DIVERGENT RISE (the fortune only ever climbs and NEVER crashes — the person hollows out beneath it;
distinct from both prior shapes), and the ending is TRAPPED / GILDED-CAGE (cost-frozen at the summit,
replaying 19 old seconds; the Keele/next-kid thread stays open) — not one-door-open, not cyclical.
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — FLASH-FORWARD to the $1T moment (the master loop) ----
    dict(id="t00", level=None, template="galaBallroom", gap=0.7,
         narration=("A ballroom the size of an aircraft hangar, and every face in it turned up at the number on "
                    "the wall behind you — thirteen digits, more money than any human being has ever held. The "
                    "applause hits like weather. And in your jacket, warm against your chest, your phone buzzes "
                    "once. DANI. Your sister. Live, right now, the first call from her in months. You have a "
                    "trillion dollars and both hands full of champagne, and you let it ring. Remember that. It "
                    "matters later."),
         overlay=dict(big="$1T", sub="THE WORLD'S FIRST · AND SHE'S CALLING, AND YOU LET IT RING")),

    # ---- LEVEL 01 — $0 (comfort + want; the named person; the anchor) ----
    dict(id="t01", level="LEVEL 01  ·  $0", template="desk",
         narration=("Six years earlier the card declines at a gas station for four dollars of coffee. Burnt, "
                    "bitter, the scorched bottom of the pot — you drink it anyway, because it is warm and it is "
                    "yours. Your sister Dani is two states away and sick in the specific way that costs money you "
                    "do not have. Thirty-one years old. Brilliant on paper, broke in every other way. The want is "
                    "simple, and it has her face on it. Get enough that the word no stops meaning her."),
         overlay=dict(big="$0", sub="EVERYTHING YOU OWN · AND A SISTER YOU CAN'T AFFORD TO SAVE")),
    dict(id="t02", level=None, template="dinner",
         narration=("Halvorsen finds you at a diner that still takes cash — old money, dead eyes, the first man "
                    "ever to bet real dollars on you. He slides a check across the ketchup rings and tells you the "
                    "one true thing you will spend six years failing to believe. Your phone lights between you: a "
                    "saved voicemail, nineteen seconds, Dani laughing at nothing, call me back. Four hundred plays "
                    "and counting. He watches you fail, again, to delete it, and slowly shakes his head."),
         overlay=None,
         dialogue=dict(text="The number will never love you back. Nobody tells you that going in.")),
    dict(id="t03", level=None, template="garageStart",
         narration=("The idea is small, and then it is not. You and Sam build it in her garage on folding chairs, "
                    "a space heater ticking in the cold, the whole thing running on her code and your nerve. Sam "
                    "is your best friend since the eighth grade; she owns half of everything on a handshake and a "
                    "napkin, and neither of you thinks to write it down better. By spring it works. By summer "
                    "strangers pay for it. The coffee is still burnt, but now there is more of it. Something is coming."),
         overlay=None),

    # ---- LEVEL 02 — $1 MILLION (the idea works; minute-3 delivered spectacle) ----
    dict(id="t04", level="LEVEL 02  ·  $1 MILLION", template="startupGrow",
         narration=("The first million arrives as a wire confirmation at two in the morning, and the number is so "
                    "long you count the zeros twice. A million dollars. You call Dani before you call anyone — you "
                    "pay the whole hospital balance in one click, the debt that has hummed under your life for two "
                    "years just gone. She cries. You cry. Sam orders forty desks and hires the town you both grew "
                    "up in, one cousin at a time. For one clean year, the money is only good."),
         overlay=dict(big="$1M", sub="THE DEBT THAT RULED YOUR LIFE · GONE IN ONE CLICK")),
    dict(id="t05", level=None, template="serverScale",
         narration=("Growth is a drug with no ceiling. Users double, then double again, and the servers Sam built "
                    "hum in a cold room like a heart that will not slow down. You still drink the burnt "
                    "gas-station coffee from a paper cup, on a desk that now costs more than your first apartment. "
                    "Investors circle. Halvorsen calls it traction. You call it proof. The word no is losing its "
                    "teeth, and you have started, quietly, to enjoy exactly how that feels."),
         overlay=None),
    dict(id="t06", level=None, template="boardroomNotes",
         narration=("Here is the first lie nobody warns you about: you are rich now, and you have no money. It is "
                    "all locked in the company — in shares, in a number on a cap table that only turns real if you "
                    "sell, and selling means giving up the thing itself. So the bank teaches you the trick the "
                    "truly rich all use. Borrow against the stock instead. Spend millions, sell nothing, owe no "
                    "tax. Live on debt shaped exactly like a fortune."),
         overlay=dict(big="$0 CASH", sub="RICH ON PAPER · YOU BORROW AGAINST IT AND SELL NOTHING")),

    # ---- LEVEL 03 — $100 MILLION (you cross from rich into an institution) ----
    dict(id="t07", level="LEVEL 03  ·  $100 MILLION", template="tower",
         narration=("A hundred million dollars does not feel like more money. It feels like a change of species. "
                    "You stop being a person with a company and become an institution with a person attached. "
                    "There is a tower now, your product's name across the top of it, a lobby floor you are not "
                    "allowed to sweep. Dani flies out; you give her the tour and she goes quiet at how many "
                    "strangers say your first name like a brand. The coffee is catered now. It tastes like nothing."),
         overlay=dict(big="$100M", sub="YOU STOP BEING A PERSON · YOU BECOME AN INSTITUTION")),
    dict(id="t08", level=None, template="atrium",
         narration=("At this altitude the air changes. Every hand that lands on your shoulder wants something with "
                    "a dollar sign behind it, and you lose the trick of telling a friend from a position. People "
                    "laugh a half-second early at things that are not funny. Sam stops coming to the big meetings; "
                    "she says the room makes her skin itch. You tell yourself she will come around. Deep in your "
                    "chest the old voicemail sits unplayed for a month, the first time ever."),
         overlay=None),
    dict(id="t09", level=None, template="boardroomHead",
         narration=("Then Halvorsen brings the deal that changes the kind of man you are. His fund will pour in "
                    "enough to launch you clear past a billion — but the money comes wrapped around a knife. Cut "
                    "the division Sam runs. Kill the free tools the town depends on. Lay off the cousins you hired "
                    "at forty desks. Do it clean, do it fast, and the number goes vertical. He names the cut the "
                    "way a surgeon names one. Take the night. Decide."),
         overlay=None),

    # ---- LEVEL 04 — $1 BILLION (the midpoint reversal is paid HERE) ----
    dict(id="t10", level="LEVEL 04  ·  $1 BILLION", template="pnlWall",
         narration=("The model is on the wall in green and it is merciless. Keep the town, stay a rich man. Cut "
                    "the town, become a billionaire. A thousand jobs render down to one line item with a minus in "
                    "front of it. Halvorsen does not push; he does not have to. The number does the pushing for "
                    "him, glowing, patient, hungry. The burnt coffee goes cold in your fist. You do not drink it. "
                    "You stopped tasting it a hundred million ago."),
         overlay=dict(big="$1B", sub="KEEP THE TOWN, STAY RICH · CUT IT, GO VERTICAL")),
    dict(id="t11", level=None, template="layoffs",
         narration=("You drive back to the town to look at it before you end it. The diner still takes cash. The "
                    "same burnt coffee, the same cousins in the same booths, calling you by the name you had before "
                    "the tower. They are proud of you. They think you came to celebrate. You sit with the check in "
                    "your coat and the numbers in your head, and you smile, and you lie to their faces with your "
                    "whole face. Nobody in that room gets a vote on their own ending."),
         overlay=None),
    dict(id="t12", level=None, template="supervisor", gap=1.4,
         narration=("Sam is waiting at the garage where it started, folding chairs still out, the space heater "
                    "still ticking. She already knows. She always reads you first. She does not shout. She asks you "
                    "one question, quiet, in the cold — whether you are doing this because you have to, or because "
                    "you have started to want to. You open your mouth. Nothing comes out. The heater ticks. The "
                    "silence goes on one beat too long, and in that beat she has her whole answer."),
         overlay=None),
    dict(id="t13", level=None, template="signing", gap=0.7,
         narration=("You sign. One pen, one page, and the town goes dark and Sam goes with it — she sells her half "
                    "back and walks out of your life through the same garage door you both once carried a server "
                    "through. The wire clears at dawn: one billion dollars, exactly as promised. You wanted to buy "
                    "your way out of becoming the man you feared. Instead you paid full price to become him. The "
                    "number is vertical now. So is the fall you cannot feel yet."),
         overlay=dict(big="$1B", sub="YOU CROSSED · AND LEFT SAM ON THE OTHER SIDE")),

    # ---- LEVEL 05 — $100 BILLION (you move markets; you can't tell who's real) ----
    dict(id="t14", level="LEVEL 05  ·  $100 BILLION", template="yachtDeck",
         narration=("A hundred billion is a different physics. You say one word in a closed room and three markets "
                    "flinch. You do not chase money anymore; it runs toward you, faster than you can turn around to "
                    "face it. Rourke pulls his yacht alongside yours off a coast whose name you never learned, "
                    "raises a glass, and welcomes you, finally, to the only club that matters. He has a smile like "
                    "a closing door. You have not really laughed since the garage."),
         overlay=dict(big="$100B", sub="SAY ONE WORD · THREE MARKETS FLINCH"),
         dialogue=dict(text="Nobody up here has friends. We have exposure to each other. Welcome.")),
    dict(id="t15", level=None, template="tradingFloor",
         narration=("The money now grows while you sleep, faster than you could spend it awake. In a strong year "
                    "your paper fortune swells by more than a million dollars a minute — and not one cent of it is "
                    "earned, or taxed, or touched. You borrow against the mountain and live like a god on a loan. "
                    "Pledged shares. A private line of credit. No income on any form. The richest men alive do not "
                    "have money. They have leverage, and a number strangers keep score of."),
         overlay=dict(big="$1M / MIN", sub="IT GROWS WHILE YOU SLEEP · UNEARNED, UNTAXED, UNTOUCHED")),
    dict(id="t16", level=None, template="window",
         narration=("Dani calls on a Tuesday while you are on a stage in Geneva, and you thumb it silent without "
                    "breaking your sentence. You will call her back. You are always about to call her back. That "
                    "night, alone at a black window forty floors up, you play the old nineteen seconds — her "
                    "laugh, call me back — the only sound in the whole building that does not want a piece of you. "
                    "A hundred billion dollars. You cannot buy one new second of that laugh."),
         overlay=None),

    # ---- LEVEL 06 — $1 TRILLION (the world's first; the cold-open payoff) ----
    dict(id="t17", level="LEVEL 06  ·  $1 TRILLION", template="rooftopEmpire",
         narration=("Try to hold how big a trillion is. Spend a million dollars a day, every single day, since the "
                    "birth of Christ — and today you would still be hundreds of billions short of it. It is a "
                    "number the human mind is not built to hold, and it is about to have your name on it. From the "
                    "roof of your tower the city is a circuit board, and every light in it is a person who now, in "
                    "some small way, works for you. The coffee up here is perfect. You would kill for the burnt kind."),
         overlay=dict(big="$740B", sub="A MILLION A DAY SINCE CHRIST · STILL NOT A TRILLION")),
    dict(id="t18", level=None, template="galaBallroom", gap=0.7,
         narration=("And then, on an ordinary Thursday, it crosses. The ballroom the size of a hangar. Thirteen "
                    "digits on the wall. The applause hits like weather — you are the first human being ever worth "
                    "a trillion dollars, worth more, on paper, than most nations on earth. Here is the scale of it: "
                    "a million seconds is twelve days, a billion seconds is thirty-two years, and a trillion "
                    "seconds is thirty-two thousand. In your jacket the phone buzzes once. DANI. Live."),
         overlay=dict(big="$1T", sub="WORTH MORE THAN NATIONS · AND SHE IS CALLING RIGHT NOW")),
    dict(id="t19", level=None, template="throne",
         narration=("You let it ring. Ten thousand people are chanting a number that is you, and you promise "
                    "yourself you will call her back the second this is over. The call dies. The little screen goes "
                    "dark. Later there will be a voicemail; later there will always be a voicemail. You stand at "
                    "the top of everything money can build, higher than any person has ever stood, and the truth "
                    "arrives quiet and total. There is no one up here. You climbed clear out of your own life."),
         overlay=None),
    dict(id="t20", level=None, template="deskClose",
         narration=("The next morning you make it yourself — cheap grounds, too many of them, boiled bitter in a "
                    "machine your assistant does not know you own. Burnt gas-station coffee, the last thing left on "
                    "earth that still tastes like being nobody. You hold the paper cup in both hands at a desk that "
                    "could buy a country. For one swallow you are thirty-one again, and broke, and free. Then the "
                    "phone lights with nine hundred people who need a decision. The swallow is over."),
         overlay=None),

    # ---- LEVEL 07 — YOU CAN'T SELL IT (the number owns you; you are collateral) ----
    dict(id="t21", level="LEVEL 07  ·  YOU CAN'T SELL IT", template="pnlWall",
         narration=("So you decide to take some out. Just some. Enough to be free of it. The instant the sell "
                    "order hits the wall in green, the price buckles — a seller that size is a signal, and the "
                    "market reads it as fear and runs. Sell a tenth of your stake and you erase a hundred billion "
                    "doing it. The trillion is real only as long as you never reach for it. You own the biggest "
                    "number in human history, and you cannot spend it without making it smaller."),
         overlay=dict(big="$1T ON PAPER", sub="TOUCH IT AND IT SHRINKS · YOU CANNOT CASH OUT")),
    dict(id="t22", level=None, template="familyVault",
         narration=("The bankers explain it gently, the way you would explain a cage to something that still "
                    "thinks it is free. You are not the owner of the fortune. You are its collateral. Every yacht, "
                    "every jet, every quiet favor is borrowed against the shares — and if the world's confidence in "
                    "you ever so much as blinks, the loans come due and the whole tower of it comes down in a "
                    "single morning. Other people set your worth, second by second, in a vote you do not get."),
         overlay=None),
    dict(id="t23", level=None, template="portraitHall",
         narration=("Money stops working on you the way weather stops mattering to a mountain. The tenth house is "
                    "the first house. The first billion and the tenth feel identical, which is to say they feel "
                    "like nothing — and nothing is a terrible thing to spend your one life buying. Guards walk you "
                    "to your own bathroom. Everyone who gets close gets searched first. You have a hundred rooms, "
                    "and you eat alone in every one of them, chasing a jolt the money stopped giving you at a million."),
         overlay=None),

    # ---- LEVEL 08 — THE APPETITE (what sits above money; the loop close) ----
    dict(id="t24", level="LEVEL 08  ·  THE APPETITE", template="serverScale",
         narration=("And now the last thing — the thing that sits above the money. There is an appetite that "
                    "priced you all the way up here, and it is not yours, and it never sleeps. It runs in cold "
                    "rooms full of servers, a market that reprices you every second the world turns, that wanted "
                    "you hungry at the bottom and wants you afraid at the top, because afraid is how it keeps you "
                    "climbing. You thought you were the player. The number was playing you. It always was."),
         overlay=dict(big="THE APPETITE", sub="THE MARKET NEVER SLEEPS · IT WAS NEVER YOURS")),
    dict(id="t25", level=None, template="emptyChair",
         narration=("Halvorsen dies the way the very rich do, quietly and elsewhere, and leaves you his chair at a "
                    "table you no longer want a seat at. And you finally understand the one true thing he told you "
                    "at that diner with the ketchup rings, six years and a trillion dollars ago. The number will "
                    "never love you back. It cannot. It does not know your name — it never learned it — because a "
                    "name is the one thing at this altitude that has no price, so the market simply does not carry it."),
         overlay=None),
    dict(id="t26", level=None, template="lobby",
         narration=("There is a man named Keele who manages fortunes like yours the way a keeper manages the "
                    "animal that could kill him. He arranges the loans, the islands, the silence. On the marble of "
                    "a lobby that echoes your own footsteps back at you like a warning, he tells you the thing that "
                    "finally ends you. Then he takes a call, and books a flight, and goes to see someone younger, "
                    "hungrier — a kid with an idea, and a sister, and a card that just declined."),
         overlay=None,
         dialogue=dict(text="You don't own it. You just get to hold it, until the next one does.")),
    dict(id="t27", level=None, template="window", gap=0.7, rate="-8%",
         narration=("So you go home to a house the size of a museum and sit in the dark with the only thing you own "
                    "outright: nineteen seconds of your sister laughing, years old now, call me back. You play it. "
                    "You play it again. A trillion dollars, and you cannot buy one new second of it. Somewhere "
                    "tonight a broke kid pays four dollars for burnt coffee and swears he will get enough that the "
                    "word no never lands on anyone he loves. Don't, you want to tell him. Don't. You got the whole "
                    "number. It never once learned your name."),
         overlay=None),
]
