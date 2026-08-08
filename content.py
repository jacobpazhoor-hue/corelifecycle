#!/usr/bin/env python3
"""Your Life as a Pirate at Every Rank — POV doodle build, ~12 min.
Grounded in docs/research/pirate.md (Golden Age of Piracy, ~1650-1730; well-documented figures and
events: Bartholomew Roberts and his 1721 Articles, Henry Every's 1695 Ganj-i-Sawai raid, the 1718
Nassau "Republic of Pirates" and Woodes Rogers' King's Pardon, Captain Kidd's 1701 hanging + gibbeting,
and the VERIFIED largest mass pirate execution in history: 52 of Roberts' surviving crew hanged at
Cape Coast Castle, February 1722). Rank format (per topic_queue.json: "Your Life as a Pirate at Every
Rank"). Second-person present-tense POV: the viewer IS a composite green hand who signs the Articles
off a captured merchant ship and climbs the REAL, documented pirate-ship chain of command — green hand
(no share) -> able seaman (VERIFIED: 1 share under Roberts' Articles) -> gunner/specialist (VERIFIED:
1.25-1.5 shares) -> quartermaster (VERIFIED: the elected 2nd-in-command, 1.5-2 shares, could overrule
a captain on anything short of a chase or a fight) -> captain (VERIFIED: elected, 2 shares, absolute
authority ONLY in battle, votable OUT) -> commodore/fleet command (VERIFIED: Roberts himself commanded
a small multi-ship squadron at his 1721-22 peak) -> THE RECKONING. The VERIFIED injury-compensation
schedule (800 pieces of eight for a leg) and the "no purchase, no pay" wage system are the episode's
share-worthy facts. "Walking the plank" is NOT used anywhere in this script — per the research doc it
is a later literary invention, not a documented Golden Age practice; marooning (VERIFIED, a real
Articles punishment) is used instead. You, Robbie, Josiah Blunt, and Gideon Slate are a FICTIONAL
COMPOSITE; no real historical pirate (Roberts, Every, Kidd) is depicted as this episode's protagonist.

STRUCTURAL VARIATION vs the last 2 produced (astronaut = FLASH-FORWARD cold open / dual-track-
divergence / PURE CYCLICAL ending; ottoman_empire = MID-ACTION cold open / rise-then-fracture /
cyclical-but-deliberately-unresolved ending): this cold open is AFTERMATH — the violence (capture,
the burned ship) has already happened off-screen; you're already in chains, already being marched,
before the episode's first line. Act two's shape is RISE-THEN-FALL-THEN-RISE: rank and money climb
cleanly through Level 4, CRASH to $0 at the midpoint (a real betrayal + the real marooning punishment),
then climb again, past the previous peak, to Commodore. The ending is ONE-DOOR-LEFT-OPEN: the loop
returns to the exact gallows steps of the cold open, but cuts away before the one open question (do
you take the pardon offered a second time) is ever answered — not a fully closed circle.

PROMISE -> PAYOFF LEDGER (ids match the final t01-t32 sequence):
  * t01 cold open (the march to the gallows, 52 ahead of you, cut before the top step)      -> RESOLVED at t30-t32 (the same steps, this time counted as 52 too)
  * t02 promise/cost-line ("wanting that has a price nobody prices honestly up front")       -> paid across t22 (the unopened chest), t29 (command everything, own nothing), t32
  * sensory anchor: salt worked permanently into the cracks of your palms (touch, not sound)  -> introduced t03 -> re-triggered every level-up (t05/t08/t09/t14/t19/t30) -> maximal payoff t32 ("your hands already know exactly how this knot is tied")
  * Robbie, the named person/want                                                            -> introduced t03 -> the letter/money thread t04/t12/t20 -> PAID OFF at t29 (his own boat, bought outright)
  * Josiah Blunt, the named mentor                                                           -> introduces the Articles t07, warns you t08, stands the rail t17 -> the loss payoff (dies covering your escape) t18
  * Gideon Slate, the named rival                                                            -> introduced t13 (skimming shares) -> taunts/frames you at the midpoint t18 -> the dialogue line t18 -> resolved (also hanged) t31
  * share-worthy fact #1: the VERIFIED injury-compensation schedule (800 pieces of eight, a leg) -> planted t16, referenced again t30
  * share-worthy fact #2: the VERIFIED 52-hanged Cape Coast Castle mass execution (1722)      -> foreshadowed t01 -> confirmed t30 -> paid off t31/t32
  * the real 1718 Woodes Rogers pardon, offered and refused twice                             -> t23 (refused) -> t27 (refused again, louder doom) -> ONE LAST TIME, unanswered, t31/t32
  * THE ONE DELIBERATE UNRESOLVED UNIVERSE THREAD: the locked sea chest with an unmatched sigil -> planted t22, never opened, never explained
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — AFTERMATH, cut away before the top step ----
    dict(id="t01", level=None, template="executionDock", gap=0.7,
         narration=("Eleven wooden steps, and fifty-one boot-prints ahead of you already gone still "
                    "in the blood. Smoke from the burned ship still catches at the back of your throat. "
                    "A chaplain reads names off a list faster than any man wants his called. An officer "
                    "argues with the hangman somewhere behind you about the order. Don't look back. "
                    "Count the doors instead — there aren't any left."),
         overlay=dict(big="52", sub="HANGED IN ONE MORNING, 1722")),

    # ---- PROMISE + COST-LINE ----
    dict(id="t02", level=None, template="fileWall",
         narration=("Rewind. None of this exists yet — not the rope, not the list, not the fifty-one "
                    "names ahead of yours. Somewhere a customs clerk logs cargo manifests nobody in "
                    "your family will ever own a line of. You want more than a manifest entry's worth "
                    "of a life. Wanting that, it turns out, has a price nobody prices honestly up "
                    "front."),
         overlay=None),

    # ---- LEVEL 01 · A FISHING COVE ----
    dict(id="t03", level="LEVEL 01  ·  A FISHING COVE", template="fishingCove",
         narration=("Your brother Robbie is nine, coughs through every winter, and still insists on "
                    "hauling the nets himself so you can mend them instead. The shack smells of tar "
                    "and drying cod, same as it has your whole life. One good coat between the both of "
                    "you. Salt is already working into the cracks of your palms — it will never fully "
                    "leave them again."),
         overlay=None),
    dict(id="t04", level=None, template="dinner",
         narration=("Supper is cod tail and hard bread, split three ways by weight, not by hunger. "
                    "Robbie trades you the bigger half for a story anyway, same as always — the one "
                    "about ships that come back from the Indies with more silver than the church roof "
                    "cost. You tell it easy. Somewhere past the harbor mouth, a captain shorthanded for "
                    "his next crossing is already asking around for hands."),
         overlay=None),
    dict(id="t05", level=None, template="shipDeck",
         narration=("The merchant captain signs you on for a wage that sounds enormous until the "
                    "purser explains it: one pound ten a month, paid on return, if the voyage turns a "
                    "profit and if he remembers. Salt cracks deeper into your palms hauling line you've "
                    "never touched before. Robbie's cough follows you down the gangplank in your head "
                    "for three straight days at sea."),
         overlay=dict(big="£1.50/MO", sub="IF THE CAPTAIN EVEN PAYS IT")),
    dict(id="t06", level=None, template="broadsideBattle",
         narration=("A sloop under a black flag runs you down eleven days out, and the merchant "
                    "captain doesn't even reach for a pistol before striking his colors — fighting a "
                    "crew that outguns you three to one buys nobody a funeral worth having. Cannon "
                    "smoke drifts across both decks like fog that won't lift. Their quartermaster reads "
                    "the choice out loud, bored, like he's done it forty times: join the account, or "
                    "swim."),
         overlay=dict(big="JOIN, OR SWIM", sub="THE CHOICE THEY GIVE YOU")),

    # ---- LEVEL 02 · GREEN HAND ----
    dict(id="t07", level="LEVEL 02  ·  GREEN HAND", template="signing",
         narration=("The Articles get read aloud before anyone signs, every clause, because a crew "
                    "that can't read still gets to vote on what it lives and dies by. Equal shares, "
                    "equal say, a captain who can be un-elected as easily as elected. You make your "
                    "mark next to eleven others who can't write their names either. Josiah Blunt, the "
                    "quartermaster, watches you do it without blinking."),
         overlay=None),
    dict(id="t08", level=None, template="shipDeck",
         narration=("Josiah Blunt has a scar for every year he's outlived the men who trained him, and "
                    "his first lesson isn't about a cutlass. The Articles feed a green hand who earns "
                    "his keep, and a share who's voted it — you're neither yet. Salt keeps working the "
                    "calluses deeper while you learn to splice rope in the dark, hands remembering what "
                    "your eyes still can't."),
         overlay=None,
         dialogue=dict(text="The Articles feed you. They can just as easy starve you. Earn the difference.")),
    dict(id="t09", level=None, template="countRoom",
         narration=("The first split happens under a single swinging lamp, pieces of eight counted "
                    "into piles twice, because nobody trusts the first count including the man doing "
                    "it. Full shares go first. Specialist shares next. Green hands split what's left, "
                    "which tonight is nothing — the prize barely covered the powder it cost to take. "
                    "Other men's palms fill. Yours stay empty, and salt-cracked, and yours."),
         overlay=dict(big="£0", sub="GREEN HANDS SPLIT LAST")),

    # ---- LEVEL 03 · ABLE SEAMAN (minute-3 spectacle) ----
    dict(id="t10", level="LEVEL 03  ·  ABLE SEAMAN", template="shipDeck",
         narration=("Six months and two prizes later, the crew votes you a full share — one show of "
                    "hands, no ceremony, Josiah reading your name off the roll like it always belonged "
                    "there. A full share means a full vote too: on the next target, the next captain, "
                    "whether a wounded man gets put ashore or carried. Power here is one man, one "
                    "voice, counted out loud in front of everyone."),
         overlay=dict(big="1 SHARE", sub="A FULL VOTE, FINALLY")),
    dict(id="t11", level=None, template="broadsideBattle",
         narration=("A Portuguese trader tries to outrun you into a squall and loses the bet — "
                    "grapeshot across her rigging, a boarding axe through her foremast shrouds, smoke "
                    "thick enough to taste copper at the back of your throat. Her captain surrenders "
                    "before you're halfway up the side. Below decks: crates of sugar, indigo, and a "
                    "strongbox nobody on her crew will admit knowing the combination to."),
         overlay=None),
    dict(id="t12", level=None, template="countRoom",
         narration=("Six pounds, your first real share, counted into your own two hands under the "
                    "swinging lamp this time. Six pounds is four months of a merchant wage for one "
                    "afternoon of terror. Robbie's letter, when it finally reaches shore months later, "
                    "doesn't say thank you — it says the coughing stopped, and the roof doesn't leak on "
                    "his side anymore. That line buys more than the money did."),
         overlay=dict(big="£6", sub="YOUR FIRST SHARE, EVER")),
    dict(id="t13", level=None, template="nassauHarbor",
         narration=("Nassau spends money faster than any prize can make it — rum, a room with an "
                    "actual bed, a debt to a tavern keeper who smiles like he already owns your next "
                    "voyage. Gideon Slate buys a round with coin that doesn't match his share. Nobody "
                    "asks where the difference came from except you, once, out loud. He remembers "
                    "exactly who asked. It's the first time he decides he doesn't like you."),
         overlay=dict(big="£0", sub="GONE IN NINE DAYS")),

    # ---- LEVEL 04 · GUNNER ----
    dict(id="t14", level="LEVEL 04  ·  GUNNER", template="shipDeck",
         narration=("A dead gunner's post opens up ugly — a swivel gun took his arm off at the "
                    "shoulder — and the crew votes you into it before the deck's properly swabbed. One "
                    "and a half shares now, and a station on the gun deck where the difference between "
                    "living and not living is measured in seconds you don't get to practice. Salt and "
                    "powder both live permanently under your fingernails."),
         overlay=dict(big="1.5 SHARES", sub="GUNNER'S CUT")),
    dict(id="t15", level=None, template="broadsideBattle",
         narration=("A Royal Navy sloop mistakes you for easy hunting and nearly isn't wrong — her "
                    "first broadside takes two men off the rail beside you, spray off the shot still "
                    "warm on your face. Your hands load faster than your head can keep up with, which "
                    "is, Josiah tells you after, the entire point of drilling until it's boring. Your "
                    "pulse doesn't slow for an hour. None of it reads like courage."),
         overlay=None),
    dict(id="t16", level=None, template="countRoom",
         narration=("The Articles have a page for exactly this: eight hundred pieces of eight for a "
                    "leg, six hundred for an arm, written down and voted on before anyone's blood is "
                    "actually on the deck. A wounded gunner two ships over collects his eight hundred "
                    "without a doctor's signature or a magistrate's approval — just the crew's word, "
                    "kept. No merchant captain in the world pays that."),
         overlay=dict(big="800 PIECES OF EIGHT", sub="WRITTEN DOWN. VOTED ON. FOR A LEG.")),
    dict(id="t17", level=None, template="shipDeck", gap=1.4,
         narration=("Middle watch, dead calm, the kind of night the sea goes flat as poured glass and "
                    "every sound carries twice as far as it should. Josiah stands the rail beside you "
                    "longer than the watch requires, quiet in a way that isn't like him. Gideon Slate "
                    "hasn't spoken to you in three days. Salt sits cold and familiar in the cracks of "
                    "your palms. Nothing is wrong yet. That's the part that doesn't sit right."),
         overlay=None),

    # ---- MIDPOINT REVERSAL ----
    dict(id="t18", level=None, template="broadsideBattle",
         narration=("Two Navy frigates come out of a dawn mist with no warning shot, and half the crew "
                    "is dead or taken before anyone's fully dressed. Josiah goes down covering your run "
                    "to the boats and doesn't get back up. Gideon reaches the quarterdeck first and "
                    "tells the boarding officer, loud enough for the whole crew to hear, that the "
                    "missing strongbox was your idea. Nobody has time to check if that's true."),
         overlay=dict(big="MAROONED", sub="THE ARTICLES, TURNED ON YOU"),
         dialogue=dict(text="Articles don't care whose idea it was. Just whose name gets said.")),
    dict(id="t19", level=None, template="marooned",
         narration=("The vote takes four minutes — marooning, not hanging, because even Gideon's lie "
                    "can't quite manufacture enough evidence for a rope, and some scrap of the code "
                    "still holds. One pistol, one shot, a keg of water, and a sandbar that disappears "
                    "at high tide in about eleven hours. Salt is already in the cracks of your palms. "
                    "It just has nothing left to hold onto out here."),
         overlay=dict(big="£0", sub="ONE PISTOL, ONE SHOT, THE SAND")),
    dict(id="t20", level=None, template="shipDeck",
         narration=("A fishing lugger out of Nassau finds you on the fourth tide, more out of drifting "
                    "curiosity than mercy, and the old man at the tiller doesn't ask a single question "
                    "the whole way in — he's seen a marooned man's face before. Robbie's last letter is "
                    "still dry in an oilskin pouch you never once let go of. You don't thank the old "
                    "man out loud. He wouldn't believe you meant it yet."),
         overlay=None),

    # ---- LEVEL 05 · QUARTERMASTER ----
    dict(id="t21", level="LEVEL 05  ·  QUARTERMASTER", template="signing",
         narration=("A different crew, new Articles, and this time the vote that matters is for "
                    "quartermaster — the man who splits the loot, settles disputes, and can overrule a "
                    "captain on anything that isn't a chase or a fight. They elect you on Josiah's old "
                    "reputation as much as your own, which is its own kind of debt. You read every "
                    "clause aloud yourself this time."),
         overlay=dict(big="1.5–2 SHARES", sub="QUARTERMASTER'S CUT")),
    dict(id="t22", level=None, template="countRoom",
         narration=("The richest split of your life so far — three hundred pounds, your two shares "
                    "counted out clean, plus a locked sea chest from the same prize that nobody on "
                    "either crew can open or claim. It's carved with initials that match no one aboard. "
                    "You set it aside instead of forcing the lock. Some doors, Josiah used to say, you "
                    "leave shut until they're actually yours to open."),
         overlay=dict(big="£300", sub="THE RICHEST SPLIT YET")),
    dict(id="t23", level=None, template="nassauHarbor",
         narration=("Governor Woodes Rogers' pardon is nailed to half the posts in Nassau by the time "
                    "you make port — surrender now, swear off the account, keep whatever you've got "
                    "left. Half your crew takes it on the spot. You count what you've actually got "
                    "left: three hundred pounds, already spent on debts and a coat for a trip home you "
                    "keep not taking. You sail again instead."),
         overlay=dict(big="£0", sub="THE PARDON OFFERED. YOU SAIL ANYWAY.")),

    # ---- LEVEL 06 · CAPTAIN ----
    dict(id="t24", level="LEVEL 06  ·  CAPTAIN", template="shipDeck",
         narration=("The old captain freezes during a chase that needed a decision ten seconds ago, "
                    "and the crew votes him out by acclamation before the enemy ship's even out of "
                    "range — the fastest election in the history of this particular deck. You're "
                    "captain by nightfall, with absolute say over exactly one thing: what happens in a "
                    "fight. Every other decision on this ship still isn't yours alone to make."),
         overlay=dict(big="2 SHARES", sub="CAPTAIN — VOTED IN, VOTABLE OUT")),
    dict(id="t25", level=None, template="broadsideBattle",
         narration=("A Spanish treasure galleon, low in the water and slow to turn, is the kind of "
                    "prize captains dream about and mostly never see — you close under a false flag, "
                    "run up the black one at forty yards, and her crew strikes without firing a single "
                    "gun back. Smoke you never had to make drifts off her own frightened deck instead. "
                    "It's the easiest fight of your entire career."),
         overlay=None),
    dict(id="t26", level=None, template="countRoom",
         narration=("A thousand pounds a share — the kind of number Josiah told you about once, from a "
                    "raid decades before either of you was born, a story sailors half-believe. You "
                    "believe it now, personally, hands closing around your own count twice for "
                    "accuracy. A share like this comes once, if it comes at all. You already know "
                    "you're going to spend every pound of it."),
         overlay=dict(big="£1,000", sub="A SHARE LIKE THIS COMES ONCE")),
    dict(id="t27", level=None, template="nassauHarbor",
         narration=("The pardon notice is still nailed to the same post, weathered a year duller, when "
                    "you make port with a thousand pounds and nowhere honest left to explain where it "
                    "came from. A customs officer who used to be a privateer himself offers you the "
                    "paperwork personally, almost gently. You buy a round for the whole crew instead, "
                    "and a faster ship, and tell yourself there's time later."),
         overlay=dict(big="£0", sub="THE PARDON, AGAIN. YOU SAIL AGAIN.")),

    # ---- LEVEL 07 · COMMODORE ----
    dict(id="t28", level="LEVEL 07  ·  COMMODORE", template="shipDeck",
         narration=("Three more captains fall in under your flag inside a single season — not by "
                    "force, by reputation, the way water finds the lowest point without being told to. "
                    "Four ships, close to three hundred men, more real command than most colonial "
                    "governors can raise on a bad week. You're still, on paper, exactly one vote among "
                    "your own crew. Nobody above you has ever once heard your actual name."),
         overlay=dict(big="4 SHIPS", sub="A SQUADRON, NOT JUST A CREW")),
    dict(id="t29", level=None, template="captainsCabin",
         narration=("The great cabin has stern windows wide enough to frame four hulls riding at "
                    "anchor under one moon, and a chart table crowded with routes half of Europe would "
                    "pay to see. A chest of gold sits under it you cannot legally spend one coin of in "
                    "any port that matters. Command everything. Own nothing you could hand across an "
                    "honest counter. Robbie's letter says he's bought his own boat now, outright — none "
                    "of your name attached to it."),
         overlay=dict(big="COMMODORE", sub="COMMAND EVERYTHING. OWN NOTHING.")),

    # ---- LEVEL 08 · THE RECKONING (apex cost) ----
    dict(id="t30", level="LEVEL 08  ·  THE RECKONING", template="executionDock", gap=0.7,
         narration=("Two Navy frigates that spent four months studying your patterns finally guess the "
                    "right cove, and a squadron built on reputation turns out to need every ship to "
                    "actually be present to fight — yours is the only one that was, that morning. "
                    "Chains, a burned deck, eleven wooden steps waiting at the far end of a very short "
                    "voyage. Salt is still in the cracks of your palms. Rope again, just not the kind "
                    "you know how to splice."),
         overlay=dict(big="52", sub="HANGED IN ONE MORNING, 1722")),
    dict(id="t31", level=None, template="courtroom",
         narration=("The Admiralty court doesn't take long — the flag, the log book, three witnesses "
                    "who trade their own necks for yours, and a verdict everyone in the room already "
                    "knew walking in. Cape Coast Castle hangs fifty-two men off your own count that "
                    "same year, the largest morning of gallows this ocean has ever seen. Gideon Slate "
                    "is item forty-one on a list read out loud in a voice that doesn't pause for any of "
                    "the names."),
         overlay=None,
         dialogue=dict(text="The pardon's still open. Say the words and it ends here.")),

    # ---- LOOP CLOSE — one door left open ----
    dict(id="t32", level=None, template="executionDock",
         narration=("Eleven wooden steps again, fifty-two boot-prints ahead of yours instead of "
                    "fifty-one, and the same chaplain reading names in the same flat voice. The young "
                    "officer's offer is still sitting in the air, unanswered, exactly where you left "
                    "it. Salt is still in the cracks of your palms — rope again, and your hands already "
                    "know exactly how this particular knot is tied. Nobody has said your name yet."),
         overlay=dict(big="ONE PARDON LEFT", sub="THE ROPE DOESN'T CARE")),
]
