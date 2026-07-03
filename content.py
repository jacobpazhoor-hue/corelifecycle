#!/usr/bin/env python3
"""Your Life as a Billionaire Heir at Every Level — POV doodle build, ~12 min, template-driven.
Grounded in docs/research/billionaire_heir.md (the generational-wealth ladder: heir -> student ->
trust fund at 25/30/35 -> family office -> successor -> steward -> dynasty architect -> the invisible
families no list names). Second-person present-tense POV: the viewer IS the third-generation heir of
the fictional Halloran freight dynasty ($8.2B, founded 1954 with one truck). Dramatization layer on
verified mechanics: buy-borrow-die/step-up basis, spendthrift trusts + HEMS, 25/30/35 vesting,
family offices (~8,000 worldwide), South Dakota perpetual trusts (>$500B), Nevada 365-year trusts,
the foundation 5% rule, Williams Group 70%/90% curse, Cerulli $124T Great Wealth Transfer,
Cargill-MacMillan's 21 billionaires.

SPINE (what is actually YOURS, against the fortune around you): $0 as a child in a $8.2B world ->
$130K/yr tuition -> a $70M jet that is NOT yours -> $2M at 25 on the trust's terms -> a $40M exit
that was secretly bought -> you RUN $6.8B -> the dynasty trust runs 365 years -> and the apex twist:
you personally own $0 — ownership is the vulnerability; CONTROL is the only inheritance. The cold
open (the will says "you inherit nothing") resolves at the vault: nothing is yours BY DESIGN.

STORY: mentor HENRY — the grandfather-founder, one truck in 1954, grilled-cheese Thursdays, the
portrait hall with ONE EMPTY FRAME and the sentence that runs the whole video: "None of this is
yours. All of it is your problem." He dies at the ~50% mark; the will skips your father RICHARD
(gen 2, secretly -$1.9B in the hole — the 70%-by-gen-2 curse on schedule) and names YOU successor.
Rival: cousin PRESTON ("You know it's mine, right?"). The succession war: Halloran v. Halloran,
the 9-6 family council vote, your father leaving without a word. The echo-engine: "11 minutes" of
father-time, counted at 9 years old at the estate gates — recounted by YOUR son at the same gates —
and by your granddaughter at the loop close. The gates (gilded bars, figBehind) are the want-object
drawn in scene 1, scene 23 and the final scene.

Theme (anaphora): "The money bought the room. The money bought the silence in it. The money bought
you — the day you were born." Share-worthy true beats: buy-borrow-die = $0 tax; $500B parked in
South Dakota forever-trusts; 70%/90% of fortunes dead by gen 2/3; one family with 21 billionaires;
the $124T Great Wealth Transfer inside 2% of families.

Topic templates: DYNASTY pack (heirGates/portraitHall/portraitHallFilled — filled fifth frame,
t29 only/yachtDeck/galaBallroom/familyVault) +
universal (boardroomNotes/dinner/window/jet/signing/desk/deskClose/atrium/fileWall/boardroomHead/
warRoom/revolvingDoor/emptyChair) + lectureHallScene + pnlWall + courtroom. No two adjacent scenes
share a template. gap=0.7 only on the five biggest reveals.
"""

FPS = 30

SCENES = [
    # ---- COLD OPEN — the will reading (the page that makes no sense yet) ----
    dict(id="t00", level=None, template="boardroomNotes", gap=0.7,
         narration=("Four hours after your grandfather stops breathing, fourteen lawyers are seated at his table. "
                    "You are thirty-one. The folder in front of you holds eight point two billion dollars — and the "
                    "lawyer slides one page across the mahogany. You read it twice. You inherit: nothing. Not the "
                    "house. Not the money. Nothing is yours. Your whole life was aimed at this room. You don't "
                    "understand the page yet. You will."),
         overlay=dict(big="$8,200,000,000", sub="THE WILL · AND THE PAGE SAYS: NOTHING")),

    # ---- LEVEL 1 — THE HEIR ----
    dict(id="t01", level="LEVEL 01  ·  THE HEIR", template="heirGates",
         narration=("Start at the gates. You're nine. The driveway is half a mile long, the house at the end of it "
                    "has forty-one rooms, and your father is in none of them. He runs the empire your grandfather "
                    "started in 1954 with one rusted truck. Today you saw your father for eleven minutes. You "
                    "counted. Other kids want bikes. You want an appointment."),
         overlay=dict(big="41 ROOMS", sub="AND YOUR FATHER IN NONE OF THEM")),
    dict(id="t02", level=None, template="portraitHall",
         narration=("The only person in the house who talks to you like a person is the man who built it. Your "
                    "grandfather Henry walks you down the portrait hall: his mother and father — farmers, painted "
                    "in gold from the only photographs he had — then Henry himself, then your father Richard, "
                    "painted at forty, already looking guarded. At the end hangs an empty frame. 'That one's "
                    "yours,' Henry says. 'None of this is yours. All of it is your problem.'"),
         overlay=None),
    dict(id="t03", level=None, template="dinner",
         narration=("Henry eats with you every Thursday. Cook's night off, grilled cheese, just you two. He keeps a "
                    "photograph in his wallet — one rusted truck, 1954. 'I was poorer than anyone you will ever "
                    "meet,' he says, and taps the picture. You ask him what it feels like to earn a dollar. He goes "
                    "quiet for a long time. 'You'll have to fight harder than I did to find out.' You're nine. You "
                    "think it's a riddle. It's a warning."),
         overlay=dict(big="ONE TRUCK · 1954", sub="WHAT THE WHOLE THING GREW FROM")),

    # ---- LEVEL 2 — THE STUDENT ----
    dict(id="t04", level="LEVEL 02  ·  THE STUDENT", template="lectureHallScene",
         narration=("But heirs aren't raised — they're placed. At fourteen you're sent to a school in Switzerland "
                    "that costs a hundred and thirty thousand dollars a year — the most expensive school on Earth. "
                    "Your roommate's father owns a shipping line. The boy across the hall is an actual prince. "
                    "Nobody asks what your family does; asking is the one thing that isn't done. First rule of old "
                    "money: never count another man's money out loud."),
         overlay=dict(big="$130K / YR", sub="THE TUITION · THE MOST EXPENSIVE SCHOOL ON EARTH")),
    dict(id="t05", level=None, template="window",
         narration=("Your cousin Preston is three years older and already dresses like a board member. Christmas "
                    "break, you two watch the adults through the library window — lawyers, even at Christmas, "
                    "always lawyers. 'You know it's mine, right?' he says. Not cruel. Certain. 'I'm oldest. That's "
                    "how this works.' You're fourteen, and something new and ugly switches on in your chest. Keep "
                    "it. You're going to need it."),
         overlay=None),
    dict(id="t06", level=None, template="jet",
         narration=("Sixteen. The jet waits for you now — seventy million dollars of aluminum that leaves when you "
                    "say leave. You test it once: four friends, Portugal, a weekend, because you can. Monday, a "
                    "polite man from something called the family office calls. The card you used isn't yours. The "
                    "jet isn't yours. Nothing you touch is yours — every dollar you will ever spend is approved by "
                    "a committee you've never met. The cage has wonderful catering."),
         overlay=dict(big="$70M", sub="THE JET · NOT YOURS. NOTHING IS.")),

    # ---- LEVEL 3 — THE TRUST FUND ----
    dict(id="t07", level="LEVEL 03  ·  THE TRUST FUND", template="signing",
         narration=("Twenty-five. A conference room, a trustee, a pen. Your trust vests today — the first of three "
                    "doors: twenty-five, thirty, thirty-five. Ten thousand a month becomes two million, all at "
                    "once. There are conditions, printed small. Health, education, maintenance, support — and the "
                    "trust decides what those four words mean. Men you have never met wrote the rules of your life "
                    "before you could read. You sign where the tab says sign."),
         overlay=dict(big="$2M AT 25", sub="DOORS AT 25 · 30 · 35 — ON THEIR TERMS")),
    dict(id="t08", level=None, template="yachtDeck",
         narration=("The summer you turn twenty-six, you have four hundred friends. They find you — Monaco, "
                    "Sardinia, a deck full of laughter you're quietly paying for. A woman you love signs a "
                    "nondisclosure agreement before your third date; the lawyers insist. Everyone laughs at your "
                    "jokes now. Your jokes have not gotten better. And the ugly switch Preston installed keeps "
                    "asking: which of these people would stay for the version of you with nothing?"),
         overlay=dict(big="400 FRIENDS", sub="AND AN NDA BEFORE THE THIRD DATE")),
    dict(id="t09", level=None, template="desk",
         narration=("So you try to become someone instead of something. You start a logistics-software company "
                    "under a clean name — no Halloran anywhere on it. Eighteen-hour days, for the first time in "
                    "your life, and it feels like health. Investors fight to get in; the round closes in a week. "
                    "You allow yourself one night of pride. But at the closing dinner, an investor toasts you by "
                    "your real name. Everyone knew. They always knew."),
         overlay=None),
    dict(id="t10", level=None, template="deskClose", gap=0.7,
         narration=("Two years later a rival offers forty million for the company, and for one afternoon you feel "
                    "earned. Then you read the diligence file. Your biggest customer — sixty percent of revenue — "
                    "is a freight subsidiary your family quietly owns. Your father routed it to you. To keep you "
                    "busy. To keep you contained. The exit was bought before you started. You sell anyway. Your "
                    "hands don't shake when you sign. That's the part that scares you."),
         overlay=dict(big="$40M EXIT", sub="SOLD · AND STILL NOT EARNED")),

    # ---- LEVEL 4 — THE FAMILY OFFICE ----
    dict(id="t11", level="LEVEL 04  ·  THE FAMILY OFFICE", template="atrium",
         narration=("If the money is going to own you, you decide to learn how it works. The family office: one "
                    "quiet floor in Manhattan, sixty-one employees, one client — your last name. There are about "
                    "eight thousand offices like it on Earth, running fortunes like yours, and almost nobody knows "
                    "they exist. Henry, ninety now, insists on walking you in himself. 'Took you long enough,' he "
                    "says, and his grip on your arm is the proudest thing you've ever felt."),
         overlay=dict(big="61 EMPLOYEES", sub="ONE CLIENT: YOUR LAST NAME")),
    dict(id="t12", level=None, template="familyVault",
         narration=("They show you the vault. No gold. Paper. Trust deeds, four hundred LLCs, a family constitution "
                    "older than your father. And they teach you old money's favorite trick: buy, borrow, die. Never "
                    "sell — borrow against the stock at two percent and live on the loan, tax-free. Die, and the "
                    "step-up wipes the gains clean for your heirs. The estate tax is forty percent on paper. The "
                    "family has paid almost none of it in seventy years. All of it legal."),
         overlay=dict(big="$0 TAX", sub="BUY · BORROW · DIE — AND THE STEP-UP WIPES IT")),
    dict(id="t13", level=None, template="fileWall",
         narration=("Weeks in the files teach you the shape of the thing. The foundation with your name on a museum "
                    "wing. The freeport vault in Geneva where the paintings live, duty-free, in the dark. The trust "
                    "in South Dakota — because South Dakota lets a trust live forever, and half a trillion dollars "
                    "of family money now sits there in quiet buildings tourists walk past. You finally see it: the "
                    "family doesn't own things. The family is a legal weather system."),
         overlay=dict(big="$500B", sub="PARKED IN SOUTH DAKOTA TRUSTS · FOREVER")),
    dict(id="t14", level=None, template="dinner",
         narration=("Thursday. Grilled cheese, like you're nine again. Henry is ninety-one and doesn't eat much "
                    "now. 'Listen,' he says. 'Seventy percent of families lose it all by the second generation. "
                    "Ninety by the third.' He looks at you a long, level moment. 'You're the third.' Then, quieter: "
                    "'Watch your father. He's been losing since the day I didn't die on schedule.' You laugh. Henry "
                    "doesn't. That is the last dinner."),
         overlay=dict(big="70% → 90%", sub="FORTUNES DEAD BY GEN 2 · GEN 3 — YOU'RE GEN 3")),

    # ---- MIDPOINT — the founder dies; the will skips a generation ----
    dict(id="t15", level=None, template="portraitHall",
         narration=("Henry dies on a Tuesday, in the house, in the room he was born poor enough to remember. "
                    "Ninety-one years. One truck to eight point two billion. At the funeral, four hundred people "
                    "fill the hall, and a black ribbon hangs on his gold frame. Your father doesn't cry; he checks "
                    "his phone. Preston squeezes your shoulder like a handshake he's been practicing. You are "
                    "thirty-one. The will is read in four hours."),
         overlay=dict(big="91 YEARS", sub="ONE TRUCK TO $8.2B · THE FOUNDER IS GONE")),
    dict(id="t16", level=None, template="boardroomNotes", gap=0.7,
         narration=("The same table from the beginning. Fourteen lawyers. The folder. The page. You inherit "
                    "nothing — because everything is already in trust. Nothing to tax. Nothing to sue. Nothing a "
                    "divorce or a creditor can ever touch. That was Henry's design: own nothing, control "
                    "everything. Then the lawyer turns to the second page. The trusts require a successor. Henry "
                    "chose one, in his own hand. It is not your father. It's you."),
         overlay=dict(big="YOU. NOT HIM.", sub="THE SUCCESSION SKIPS A GENERATION")),

    # ---- LEVEL 5 — THE SUCCESSION WAR ----
    dict(id="t17", level="LEVEL 05  ·  THE SUCCESSION WAR", template="pnlWall",
         narration=("You ask the office for the full books — a successor's right. It takes them nine days to "
                    "comply, and on the tenth you understand why Henry skipped a generation. Your father has been "
                    "borrowing against the family's collateral for a decade. Bad hotels. A vanity airline. Margin. "
                    "The hole is one point nine billion dollars, papered over with newer debt. Henry knew. The "
                    "curse doesn't skip generations — it books them in advance."),
         overlay=dict(big="-$1.9B", sub="YOUR FATHER'S HOLE · THE CURSE, ON SCHEDULE")),
    dict(id="t18", level=None, template="courtroom",
         narration=("Your father sues. To break the trust, to void the succession, to finally become the thing his "
                    "father never let him be. Preston joins him — he was always certain. Halloran versus Halloran: "
                    "two years, forty lawyers, billed hourly. You learn the ugliest true thing about money this "
                    "size: it doesn't tear families apart. It just pays for the tearing, by the hour, for as long "
                    "as anyone can stand it. Your mother stops hosting Christmas. There is no Christmas now."),
         overlay=dict(big="2 YEARS", sub="HALLORAN v. HALLORAN · 40 LAWYERS, HOURLY")),
    dict(id="t19", level=None, template="window",
         narration=("Your father asks to meet. No lawyers. A window, two glasses, the skyline he tells himself he "
                    "built. Up close he looks old for the first time, and small. 'Step aside,' he says. 'I'm his "
                    "son.' And here is the moment: you could give it back. You could just be a son. Instead you "
                    "hear Henry — all of it is your problem. 'No,' you say. One word. Your father's face closes "
                    "like a door, and you hear the lock turn."),
         overlay=None),
    dict(id="t20", level=None, template="boardroomHead", gap=0.7,
         narration=("The family council votes on a Sunday, because the constitution says it must. Nine to six. For "
                    "you. Your father stands, buttons his jacket, and leaves without one word. Preston follows him "
                    "out. You now control eight point two billion dollars, minus a one point nine billion dollar "
                    "hole, and the chair at the head of the table is finally yours. It's warmer than you expected. "
                    "Someone was sitting in it your whole life."),
         overlay=dict(big="9 – 6", sub="THE VOTE · IT COST HIM HIS FATHER'S CHAIR")),

    # ---- LEVEL 6 — THE STEWARD ----
    dict(id="t21", level="LEVEL 06  ·  THE STEWARD", template="galaBallroom",
         narration=("Rebuilding takes six years. You sell the airline, feed the hole, and the machine heals — money "
                    "this size heals anything, if you stop wounding it. Now the galas. Your foundation gives away "
                    "two hundred million a year; the law only requires five percent of it ever move at all. "
                    "Senators find you at these parties. Museum directors laugh before your jokes land. Giving it "
                    "away, you discover, buys more than spending it ever did."),
         overlay=dict(big="$200M / YR", sub="GIVEN AWAY · IT BUYS MORE THAN IT SPENDS")),
    dict(id="t22", level=None, template="warRoom",
         narration=("The screens say six point eight billion and climbing — past Henry's peak by next year. "
                    "Compounding does the work; your only job is refusing to interrupt it. You approve allocations "
                    "before dawn and sleep at the office twice a week. There's a boy at home with your eyes. You "
                    "named him Henry. This morning, your assistant blocked him into the calendar. Nine-forty to "
                    "nine-fifty-one."),
         overlay=dict(big="$6.8B", sub="YOURS TO RUN · NOT YOURS TO KEEP")),
    dict(id="t23", level=None, template="heirGates", gap=0.7,
         narration=("Sunday. Your son stands at the gates with a soccer ball, watching your car crunch up the "
                    "half-mile drive. He's nine. You had eleven minutes for him today. He counted — the way you "
                    "counted once, on the other side of these same black bars. Your body understands before you "
                    "do: your hand is on the iron, and you can't remember getting out of the car. The bars were "
                    "never for keeping people out."),
         overlay=dict(big="11 MINUTES", sub="YOUR SON, TODAY · HE COUNTED")),
    dict(id="t24", level=None, template="revolvingDoor",
         narration=("You try to be different. The machine has other plans. A merger needs a regulator soothed — "
                    "you make one call. A senator calls you sir; he's sixty-two, you're forty-four. The family bank "
                    "knows your cash flow before you feel hungry. Somewhere in these years you stop asking what "
                    "things cost — not because you're rich, but because the asking was the last muscle of the "
                    "person you almost got to be."),
         overlay=None),

    # ---- LEVEL 7 — THE DYNASTY ----
    dict(id="t25", level="LEVEL 07  ·  THE DYNASTY", template="signing",
         narration=("Then one gray afternoon you sign what Henry once signed: the dynasty trust, re-armed for "
                    "another century. In Nevada, a trust can run three hundred and sixty-five years. In South "
                    "Dakota — forever. Every heir a beneficiary, never an owner. Untaxable, undivorceable, "
                    "untouchable, for as long as law exists. Your pen hovers over the line, and the empty frame in "
                    "the hall flickers behind your eyes. You sign. Of course you sign."),
         overlay=dict(big="365 YEARS", sub="THE TRUST OUTLIVES YOUR NAME")),
    dict(id="t26", level=None, template="familyVault", gap=0.7,
         narration=("And standing in the vault, you finally read the page from the beginning the way Henry meant "
                    "it. You inherit nothing, because ownership is the weakness. Owners get taxed. Owners get sued, "
                    "divorced, kidnapped, blamed. The trust owns. You merely control — and control is the only "
                    "inheritance. You will die richer than most nations, and your personal estate will fit in one "
                    "drawer. It is the family's masterpiece. It is also your cage, notarized."),
         overlay=dict(big="$0", sub="WHAT YOU OWN · CONTROL IS THE INHERITANCE")),

    # ---- LEVEL 8 — THE INVISIBLE FAMILIES ----
    dict(id="t27", level="LEVEL 08  ·  THE INVISIBLE FAMILIES", template="dinner",
         narration=("There is a level above you. You meet it exactly once — a dinner, eleven families, no phones, "
                    "no press, no names on the door. Across the table sits a man from the family with twenty-one "
                    "billionaires in it. They own the largest private company in America, and your neighbors have "
                    "never once said their name out loud. Up here there is only one rule, and he says it like a "
                    "toast: stay off the lists. Lists are for new money."),
         overlay=dict(big="21 BILLIONAIRES", sub="ONE FAMILY · A NAME YOU'VE NEVER SAID")),
    dict(id="t28", level=None, template="emptyChair",
         narration=("Over the next twenty years, one hundred and twenty-four trillion dollars changes hands — the "
                    "largest transfer of money in human history, old hands to young ones. More than half of it "
                    "moves inside two percent of families. The heirs are already chosen. Most were chosen before "
                    "they were born, the way you were. Nobody voted. Nobody will. The chair at the very top of the "
                    "world sits empty on purpose — a trust doesn't need a face."),
         overlay=dict(big="$124T", sub="THE GREAT TRANSFER · INSIDE 2% OF FAMILIES")),

    # ---- LOOP CLOSE — the fifth frame; the gates ----
    dict(id="t29", level=None, template="portraitHallFilled",
         narration=("You're sixty. A painter comes on Thursdays now, and the fifth frame in the hall — your frame — "
                    "is no longer empty. The money bought the room. The money bought the silence in it. The money "
                    "bought you, the day you were born, before you could object. Seventy percent gone by the second "
                    "generation. Ninety by the third. You beat the curse. Say it slower. The curse is the only "
                    "thing you ever beat."),
         overlay=dict(big="90%", sub="DIE BY GENERATION THREE · YOU'RE THE EXCEPTION")),
    dict(id="t30", level=None, template="heirGates",
         narration=("Sunday, at the gates. Your son is grown. His daughter stands where you stood — nine years old, "
                    "small hands on the black iron, watching the house. Her father was inside it for eleven minutes "
                    "today. She counted. You walk down the drive, past the fountain, and hand her the only true "
                    "thing you own — Henry's sentence, four generations old now. 'None of this is yours,' you say. "
                    "'All of it is your problem.' The gates close. They always close."),
         overlay=dict(big="GENERATION FIVE", sub="THE GATES CLOSE · THEY ALWAYS CLOSE")),
]
