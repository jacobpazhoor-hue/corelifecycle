# Lehman Brothers — verified research (WO-13 sample episode)

Slug `lehman_brothers` · queue format `superlative` · title `The 158-Year-Old Bank That Died in a Weekend` (44 chars).

`docs/BIBLE.md` §5: every date, figure and quote in `content.py` must appear below with a source.
Anything I could not verify is in the **CUT** list at the bottom and does not appear in the script.

## Origin

| fact | value | source |
|---|---|---|
| Henry Lehman arrives Montgomery, Alabama | 1844, opens a dry-goods store selling to cotton farmers | Encyclopedia of Alabama; Barclays archive; HBS Baker Library Lehman exhibit |
| Farmers paid in cotton, not cash; the Lehmans then traded the cotton | yes | HBS "General merchants to commodities brokers" |
| Emanuel joins 1847 ("H. Lehman and Brother"); Mayer arrives 1850, firm renamed **Lehman Brothers** | 1850 | Encyclopedia of Alabama; Wikipedia (Mayer Lehman) |
| Age at death | **1850 → 2008 = 158 years** | arithmetic on the above; the title's "158-year-old" is standard in the coverage |

## The machine

| fact | value | source |
|---|---|---|
| Fuld CEO | **1994 → September 2008** | CNNMoney "5 years after Lehman"; FCIC testimony |
| Fuld pay dispute | Waxman's chart: ~**$484–485M** since 2000. Fuld testified **under $310M** for 2000–2007 | NBC News; House Oversight hearing 2008-10-06 |
| Stock peak | **$86/share, February 2007**, market cap near **$60 billion** | Corporate Finance Institute; Britannica |
| Record year | fiscal **2007 net income $4.2 billion** on net revenues **$19.3 billion** (a record, +10% on the prior record) | Lehman FY2007 press release / 10-K (SEC EDGAR) |
| Gross leverage | **over 30 to 1** (≈30.7x at end of FY2007); some accounts put later peaks above 40:1 | Valukas Report coverage; FCIC |
| Bear Stearns rescue | JPMorgan announced **March 16, 2008** at ~**$2/share**; amended **March 24** to ~**$10/share** | SEC Form 425; CNBC 2008-03-17 |
| Einhorn | **May 21, 2008**, Ira W. Sohn conference, speech titled **"Accounting Ingenuity"** — argued Lehman understated losses and overstated assets | Einhorn speech PDF (FCIC resource library) |

## Repo 105

| fact | value | source |
|---|---|---|
| Assets moved off the balance sheet at quarter-end | up to **$50 billion** | Valukas Report; Wharton; Repo 105 (Wikipedia) |
| Effect on reported net leverage | real **13.9** reported as **12.1** | Valukas Report coverage |
| Valukas Report length | **2,200 pages** | Report of Anton R. Valukas (Wikipedia) |
| Mechanism | assets "sold" at ≥105% of the cash received could be booked as a true sale rather than a loan, so they left the books and came back days later | Wharton; Repo 105 |

## The weekend

| fact | value | source |
|---|---|---|
| Q3 pre-release | **September 10, 2008** — net loss **$3.9 billion**, gross writedowns **$7.8 billion** | Lehman 8-K (SEC EDGAR) |
| Friday Sept 12 | Paulson (Treasury), Geithner (NY Fed), Cox (SEC) summon Wall Street CEOs to the Federal Reserve Bank of New York; a private rescue must exist by Sunday night | FCIC final report ch.18; Fortune "3 days" |
| Saturday Sept 13 | CEOs draft a "bad bank" to take Lehman's real estate; Paulson rejects it and demands the private sector put up perhaps **$25–30 billion** | FCIC ch.18 |
| Saturday Sept 13 | **Bank of America walks** and buys **Merrill Lynch** the same day for **$50 billion in stock** | FCIC ch.18; Fortune |
| Sunday Sept 14 | Barclays' **John Varley** and **Bob Diamond** tell Paulson/Geithner/Cox the **FSA** will not approve the deal | FCIC ch.18 |
| Filing | **September 15, 2008**, ~1:45am | Bankruptcy of Lehman Brothers (Wikipedia); History.com |
| Size | **$639 billion** assets, **$613 billion** debts — largest bankruptcy in U.S. history | History.com; Britannica |
| Employees | ~**25,000** worldwide; **fourth-largest** U.S. investment bank | History.com; Britannica |
| Market value lost | **93%** | Britannica |
| Market reaction | Dow closed **−504 points (−4.4%)** on September 15, 2008 — its worst day since reopening after 9/11 | CNNMoney 2008-09-15; TIME |

## CUT — considered and left out because I could not verify to this standard

- Lehman's Archstone acquisition price ($22.2bn is widely cited but I did not confirm it against a
  primary source).
- The BNC Mortgage shutdown headcount (1,200 jobs / 23 offices).
- Any figure for Fuld's total career compensation stated as settled fact — the script uses the
  **dispute itself** (Waxman's number vs Fuld's number), which is what is actually documented.
- The exact wording of anything said inside the Fed that weekend. The two voiced dialogue lines in
  `content.py` are written as **period-plausible paraphrase of documented positions**, not as quotes,
  and are not attributed to a named person saying those words.
