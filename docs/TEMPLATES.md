# Scene Template Catalog (for the art-director / creative agent)

Pick a `template` per scene in content.py from THIS list. Use templates that fit the TOPIC —
a surgeon should be in an operating room, not a boardroom. Never reuse the same template on two
adjacent scenes. Registry lives in src/scenes.tsx `TEMPLATES`; composable packs in src/stage.tsx.

## Universal (work for most white-collar / "career" topics)
| template | depicts | good for |
|---|---|---|
| deskSilhouette | lone figure at a desk, night window | hooks, openings |
| desk | figure typing at a lit laptop, city behind | analyst/associate/any "grind" beat |
| deskClose | tight on a figure at a laptop (moral turn) | a pivotal decision/compromise |
| fileWall | wall of documents/boxes, small figure | paperwork, scale, being a cog |
| tower | figure walking up toward a tower | ambition, climbing |
| window | figure at a big window, skyline | reflection, status |
| signing | figure signing a document | deals, commitments |
| boardroomNotes | conference table, juniors, a leader | meetings, presenting |
| boardroomHead | figure at head of a boardroom | power, leadership |
| atrium | figure in a grand lit atrium | running the machine |
| dinner | two figures at a candlelit table | deal-making, relationships |
| layoffs | people leaving past a red EXIT | cost, cuts, human toll |
| revolvingDoor | govt building <-> glass tower | influence, power broker |
| warRoom | figure before a globe + screens | global/strategic apex |
| emptyChair | empty executive chair, node diagram | anonymous power, "no title" |
| lobby | a new young figure walking in | cyclical ending, the loop |
| jet | figure walking to a private jet at dusk | wealth, travel, arrival |

## Generic stage (any topic with talks/training)
| template | depicts | good for |
|---|---|---|
| lectureHallScene | tiered lecture hall, students | school, training, onboarding |
| podiumScene | figure at a podium, audience, spotlight | pitches, press, addresses, awards |

## Medical pack (surgeon / doctor / nurse)
| template | depicts | good for |
|---|---|---|
| scrubIn | figure scrubbing at a surgical sink | prep, residency, discipline |
| operatingRoom | surgeon over a patient, overhead light, vitals | the operation, high stakes |
| hospitalRounds | figure walking a ward of beds | rounds, residency, patient care |
| scanReview | figure before a wall of x-ray scans | diagnosis, expertise |
| erTrauma | figure rushing a gurney down a corridor | emergencies, pressure |
| consult | a standing figure + a seated patient | consultation, hard news, ethics |

## Startup pack (founder / tech / software)
| template | depicts | good for |
|---|---|---|
| garageStart | figure coding at a workbench in a garage | the scrappy beginning |
| startupGrow | figure in an open startup office, whiteboard, team | early growth, hiring |
| serverScale | figure before racks of servers | scaling, infrastructure |
| ipoBell | figure ringing the bell before a stock ticker | the IPO / exit |

## Military pack (soldier)
| template | depicts | good for |
|---|---|---|
| bootcamp | figure marching a parade ground, formation | training, the bottom |
| barracksLife | figure on a bunk in the barracks | the grind, downtime |
| frontline | figure advancing a sandbagged battlefield | combat, danger |
| commandPost | figure over a map table, screens | command, strategy |
| decoration | figure at attention before flags | medals, rank, ceremony |

## Sports pack (athlete)
| template | depicts | good for |
|---|---|---|
| training | figure in the gym / weight room | grind, discipline |
| lockerRoomScene | figure on the locker-room bench | doubt, pressure, turning points |
| gameDay | figure running out onto a stadium pitch | the big game, performance |
| victory | figure atop a medal podium, crowd | winning, the apex |

## Hedge fund / trading pack (hedge fund manager / trader)
| template | depicts | good for |
|---|---|---|
| tradingFloor | figure at a desk behind terminals, wall of live charts | the grind, analyst/PM at the book |
| pnlWall | figure facing a wall of green/red monitors | the P&L reveal, a drawdown, market power |

## Real estate pack (real estate mogul / landlord / developer)
| template | depicts | good for |
|---|---|---|
| openHouse | figure beside a suburban house with a FOR SALE yard sign | the agent, the first deal, the loop |
| rentalUnits | figure before an apartment-block facade, lit windows | landlord, a portfolio of doors |
| constructionSite | figure under a tower crane + steel-frame building | the developer, ground-up building |
| modelReview | figure over a scale model of a development, blueprint wall | planning, a fund allocating |
| rooftopEmpire | figure at a rooftop railing over a night skyline | the mogul/empire apex, surveying holdings |

## Spy / espionage pack (spy / intelligence officer)
| template | depicts | good for |
|---|---|---|
| tradecraft | figure crossing a fenced training ground (targets, watchtower) | the Farm, the recruit, training |
| surveillance | figure walking a dim night street under streetlamps | a tail, an SDR, watching, the field |
| deadDrop | figure leaving a parcel at a park wall with a chalk mark | a dead drop, a handoff, secrecy |
| safehouse | figure before a corkboard of pinned photos, a map + red string | the target wall, planning a recruitment |
| station | figure at a desk before the embassy seal, flag + vault door | chief of station, the embassy, running ops |
| debrief | two figures at a bare table under a hanging bulb | recruiting/running/debriefing an asset, the pitch |

## Roman empire pack (legionary / centurion / general / Caesar)
| template | depicts | good for |
|---|---|---|
| romanOath | figure at a flaming altar before a temple facade + crowd | the sacramentum, the recruit (tiro), the cyclical loop |
| legionDrill | figure marching a rampart drill ground (stakes + standard) | training, forced marches, the grind, decimation |
| legionCamp | figure seated among rows of leather tents + a campfire | the contubernium, night camp, naming the dead |
| shieldWall | figure in a wall of shields, spear tips, distant ridge + smoke | battle, the shield line, a general acclaimed imperator |
| centurionVitis | figure before a century in formation (helmets + standards) | the optio/centurion commanding, the frontier legions |
| firstSpear | figure beneath the legion's golden eagle (aquila + SPQR) | primus pilus, the first cohort, the knight/equestrian |
| forumScene | figure before a columned temple + civic crowd | homecoming, the mob/grain dole, civic life |
| warCouncil | figure over a map table in a command tent (tents behind) | the legate/general planning, command |
| triumph | figure riding a gold chariot (quadriga) under a triumphal arch | the triumph apex, the cold-open loop |
| throne | figure before the imperial throne, columns, purple drape | Caesar, the donativum, the throne, the assassination |
| senate | figure on the open floor of the curia (tiered senator benches) | the Senate, deification, taking the purple |
| praetorians | figure among helmeted guards (crenellated wall, crossed spears) | the Praetorian Guard above the throne, the auction of the Empire |

## Adding a new domain pack
If a topic needs settings none of these cover (e.g. soldier→battlefield, athlete→stadium,
founder→garage), add backdrop/prop entries + a small template set to src/stage.tsx following the
medical pack pattern, register via a `*_TEMPLATES` export spread into TEMPLATES in scenes.tsx, then
document them here. Keep the doodle style (PAPER fill, INK stroke 3-5). Prefer composing existing
backdrops/props over bespoke one-off scenes.
