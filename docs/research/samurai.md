# Your Life as a Samurai at Every Level — research spine

POV episode. The viewer IS a peasant boy who rises through the warrior ranks of late-Sengoku →
Edo Japan to lord, and lives to see the sword class abolished. Fictional clan (Lord **Arima**) and
characters (mentor **Ichirō**, rival **Kenji**) laid over VERIFIED feudal-Japan mechanics. Crime/
violence framed as cautionary dramatized STORY, never how-to.

## The measure of a life: KOKU (the on-screen gold spine)
- **1 koku** = the volume of rice reckoned to feed ONE person for ONE year (~180 liters / ~150 kg).
  A samurai's rank, pay and a lord's power were ALL measured in koku of assessed rice yield
  (*kokudaka*). This is the number that escalates on screen — rice, not coin, is the spine. [SOLID]
- Rough ladder of a stipend/holding in koku (dramatized to clean numbers; real stipends varied
  wildly by domain and era — FLAG: exact figures are illustrative, the thresholds are real):
  - **Ashigaru** (foot soldier / peasant levy): NO koku holding — a daily rice ration, a borrowed
    spear. Not truly of the samurai class in the strict sense. [SOLID that ashigaru were the
    low, semi-peasant infantry]
  - **Samurai / bushi** (retainer, two swords): a modest hereditary stipend — tens of koku
    (illustrative ~30 koku). [threshold real; number illustrative]
  - **Mounted retainer / higher vassal**: hundreds of koku (illustrative ~500), a horse, men under him.
  - **Karō** (chief/house elder, top retainer of a domain): the senior vassal who runs the han —
    often several thousand koku. [role SOLID]
  - **Daimyō**: DEFINED as a lord assessed at **≥10,000 koku**. This is the hard line between a
    retainer and a feudal lord. [SOLID — 10,000-koku threshold is the textbook definition]
  - **Great daimyō**: the largest domain, **Kaga** (the Maeda clan), the "Million-*koku* Kaga"
    (*Kaga hyakumangoku*) ≈ **1,000,000+ koku**. Largest non-shogunal domain in Edo Japan. [SOLID]
  - **Shōgun** (Tokugawa): direct shogunal lands (*tenryō / bakufu*) ≈ **4,000,000 koku**; the whole
    country's assessed yield ≈ **25–30,000,000 koku** by late Edo. He controlled all of it via the
    *bakuhan* system. [SOLID ballpark — shogunate ~4M; national kokudaka ~25–30M]

## The swords (the want-object / the soul)
- **Daishō** = the paired long sword (*katana*) + short sword (*wakizashi*) worn together. The right
  to wear TWO swords was the visible mark of the samurai class; only samurai could. [SOLID]
- **Katanagari (sword hunt)**, Toyotomi Hideyoshi, **1588**: confiscated weapons from peasants,
  hardening the class line between warrior and farmer — you could no longer cross it by picking up a
  spear. [SOLID] Great share beat: the class you were born below became legally sealed.

## The code + the ritual (the moral-cost engine)
- **Bushidō** — the warrior code (loyalty, honor, service to the lord above one's own life). Note:
  the codified "bushidō" as popularly known is largely an Edo-period / later idealization, but
  loyalty-unto-death service was real. [SOLID enough; don't over-claim a fixed ancient code]
- **Seppuku** (ritual suicide by disembowelment) — to atone, to avoid capture, or ON ORDER from a
  lord/authority as a "privileged" death sentence for a samurai. A **kaishakunin** (a second)
  stands ready to behead the man to end his suffering — often a friend or student, the ultimate
  duty. [SOLID] The midpoint: YOU are made the second for the man who trained you.
- Taking an enemy's HEAD in battle was the proof of valor, presented for reward (kubi-jikken, the
  head inspection). [SOLID]

## The trap at the top (the undercut — the share-worthy true reversal)
- **Sankin-kōtai (alternate attendance)**, institutionalized ~**1635** under the Tokugawa: daimyō
  were forced to spend alternate years in **Edo** and leave their families there as hostages. The
  ruinous cost of two residences + the processions kept the lords DRAINED and loyal — a domain's
  own wealth was the leash. [SOLID]
- **The merchants owned the sword.** Samurai were paid in RICE, which they had to sell for cash via
  brokers. By the Edo period the *chōnin* (merchant class) — legally the LOWEST of the four estates,
  below farmers and artisans — held the daimyō's debt. The **Dōjima Rice Exchange** in Osaka
  (formally licensed **1730**) traded rice warehouse receipts and rice futures — one of the world's
  first organized **futures markets**. The men with NO swords set the price of the samurai's pay and
  held his IOUs. [SOLID] ← the biggest "wait, that's real?" beat.
- Samurai were only ~**5–7%** of the population but ruled the other ~94%. [SOLID ~5–6%]

## The end of the sword (the loop close — 100% true)
- **Meiji Restoration, 1868**: the shogunate falls; samurai privileges dismantled over the next
  decade. Hereditary stipends were commuted to government **bonds** (kinroku-kōsai, ~1876) — the
  warriors were paid off and cut loose. The **Haitōrei edict, 1876**, BANNED wearing swords in
  public. The samurai class (renamed *shizoku*) lost its legal meaning. [SOLID]
- **Satsuma Rebellion, 1877** (the historical "Last Samurai," Saigō Takamori): the final armed
  samurai revolt — crushed by a conscript peasant army with rifles. Three hundred years of the sword
  ended by a government office and a bank. [SOLID]
- The circle: a peasant boy picks up a borrowed spear because he owns nothing; ten generations later
  his line owns no sword at all — by law. The sword was never the wealth. Rice was. Then paper was.

## Escalation spine as used on screen (koku, gold, interleaved with cost/reach beats)
0 koku (borrowed spear, 2 rice balls) → ~30 koku (the two swords) → ~500 koku (a horse, men) →
KARŌ (a castle to run) → **the seppuku order** (cost, not koku) → 10,000 KOKU (you become a lord) →
1,000,000 KOKU (Kaga-scale great lord) → the SHŌGUN's 4,000,000 direct / 30,000,000 all-Japan →
apex twist: a merchant with NO sword holds your debt (Dōjima) → the 1876 edict: the sword is worth
0. Personal honor rises as personal freedom falls; the domain's wealth is the leash.

## Templates
New SAMURAI pack in src/stage.tsx (riceField / dojo / sengokuField / castleGate / teaCeremony /
lordAudience / keepTop / seppukuGarden / shogunHall / merchantHouse) + universal
(signing/emptyChair for the abolition paperwork; dinner avoided as anachronistic — use teaCeremony).
No two adjacent scenes share a template. gap=0.7 on the ~5 biggest reveals; one gap=1.4 silence
scene right before the midpoint seppuku line.
