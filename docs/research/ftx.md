# Research: FTX / Sam Bankman-Fried — verified facts, figures, quotes

Sources: SEC/DOJ press releases and indictment (Dec 13 2022); DOJ SDNY press releases (Nov 2 2023
verdict, March 28 2024 sentencing, justice.gov/usao-sdny); CoinDesk reporting (Nov 2 2022 Alameda
balance-sheet story; Nov 12 2022 collapse timeline); Wikipedia "FTX", "Bankruptcy of FTX", "Trial of
Sam Bankman-Fried" (cross-checked against news sources below, not used as sole source for any figure);
CNN, CNBC, NPR, Axios, TechCrunch, ABC News, CBS News trial/sentencing coverage; contemporaneous
Twitter/X apology thread (Nov 10 2022); FTX Super Bowl LVI commercial (Feb 2022, widely re-aired
footage). All dates and dollar figures below are cross-confirmed across at least two of these sources.

## Timeline

- **2014**: Sam Bankman-Fried graduates MIT with a degree in physics. Joins Jane Street Capital, a
  quantitative trading firm, in New York.
- **2017**: Leaves Jane Street; founds Alameda Research, a crypto quantitative trading firm, out of an
  apartment in Berkeley, California.
- **2019**: Co-founds FTX, a cryptocurrency exchange, with Gary Wang (an MIT classmate and former
  Google engineer, who becomes FTX's co-founder/CTO). FTX is headquartered first in Hong Kong, later
  the Bahamas. Caroline Ellison (another Jane Street alum) becomes co-CEO and later sole CEO of
  Alameda Research. Nishad Singh joins as FTX's director of engineering.
- **Jan 2022**: FTX closes a $400M funding round that values the company at **$32 billion**. Investors
  include Sequoia Capital, SoftBank, Temasek, and others.
- **Early 2022**: Bankman-Fried's personal net worth is estimated as high as **~$26 billion** by
  outside estimates, making him one of the youngest billionaires in the world (he is 29-30 at the
  time). FLAG: the exact peak figure varies by source/date ($22–26B range reported); this script uses
  "as much as $26 billion" rather than a single precise number.
- **Feb 13, 2022**: FTX airs a Super Bowl LVI commercial starring Larry David, in which David's
  character dismisses a string of historic inventions (the wheel, the toilet, coffee) before being
  shown FTX and saying: **"I don't think so. And I'm never wrong about this stuff."** The ad becomes,
  in hindsight, one of the most-cited ironic artifacts of the collapse.
- **2022 election cycle**: Bankman-Fried donates roughly **$40 million** to political campaigns and
  committees, becoming the second-largest donor to Democratic causes that cycle (behind only George
  Soros), while FTX executives quietly funneled comparable "dark money" sums to Republican-aligned
  groups as well.
- **Nov 2, 2022**: CoinDesk publishes a leaked Alameda Research balance sheet showing a large share of
  Alameda's **$14.6 billion** in assets is its own exchange's token, FTT — about **$3.66 billion** of
  it "unlocked" FTT, meaning Alameda's core holdings were largely a token FTX itself had printed.
- **Nov 6, 2022**: Binance CEO Changpeng "CZ" Zhao announces on Twitter/X that Binance will liquidate
  its own FTT holdings (received from an earlier equity buyout of Binance's FTX stake), citing "recent
  revelations." This triggers a bank run on FTX.
- **Nov 8, 2022**: FTX halts customer withdrawals. Binance signs a non-binding letter of intent to
  acquire FTX.
- **Nov 9, 2022**: After a look at FTX's books, Binance walks away from the deal.
- **Nov 10, 2022**: Bahamian regulators freeze the assets of FTX's Bahamas subsidiary. Bankman-Fried
  announces Alameda Research is winding down. He posts a 22-tweet public apology thread beginning
  **"I'm sorry. That's the biggest thing. I f---ed up, and should have done better,"** later adding,
  "The full story here is one I'm still fleshing out every detail of, but at a very high level, I
  f---ed up twice."
- **Nov 11, 2022**: FTX, Alameda Research, and roughly 130 affiliated companies file for Chapter 11
  bankruptcy in Delaware. Bankman-Fried resigns as CEO; John J. Ray III — who oversaw the Enron
  bankruptcy — is installed as the new CEO to run the wind-down.
- **Dec 12, 2022**: Bankman-Fried is arrested in Nassau, the Bahamas, at the request of the U.S.
  Attorney's Office for the Southern District of New York — the evening before he was scheduled to
  testify before the U.S. House Financial Services Committee.
- **Dec 13, 2022**: DOJ unseals an 8-count criminal indictment. U.S. Attorney Damian Williams states:
  **"Sam Bankman-Fried perpetrated one of the biggest financial frauds in American history — a
  multibillion-dollar scheme designed to make him the King of Crypto."**
- **Dec 2022**: Gary Wang (co-founder/CTO) and Caroline Ellison (Alameda CEO) plead guilty to fraud
  charges and agree to cooperate with prosecutors. Nishad Singh (director of engineering) later also
  pleads guilty and cooperates.
- **Oct 3 – Nov 2, 2023**: Criminal trial, U.S. v. Samuel Bankman-Fried, in the Southern District of
  New York before Judge Lewis Kaplan. Caroline Ellison testifies for the prosecution over multiple
  days that Bankman-Fried directed her to use FTX customer funds to cover Alameda's trading losses,
  fund venture investments, buy real estate, and make political donations — and testifies she felt
  relief when the company collapsed because she "didn't have to lie anymore."
- **Nov 2, 2023**: Jury convicts Bankman-Fried on all seven counts: two counts of wire fraud, two
  counts of conspiracy to commit wire fraud, one count of conspiracy to commit securities fraud, one
  count of conspiracy to commit commodities fraud, and one count of conspiracy to commit money
  laundering.
- **March 28, 2024**: Judge Kaplan sentences Bankman-Fried to **25 years** in federal prison and
  orders **$11 billion** in forfeiture ($8B tied to the wire-fraud counts against customers, $1.72B
  raised from investors under false pretenses, and $1.3B owed to Alameda's lenders).
- **Sept 24, 2024**: Caroline Ellison is sentenced to **2 years** in prison, credited for
  "very, very substantial" cooperation with the government.

- **June 2021**: FTX signs a **19-year, $135 million** naming-rights deal for the Miami Heat's arena,
  renamed FTX Arena. After the bankruptcy filing, Miami-Dade County moves immediately to end the
  relationship, and a bankruptcy judge formally terminates the deal in January 2023 — the arena carried
  FTX's name for roughly a year and a half of the original 19.
- The Sept 2023 pretrial record: prosecutors argued the Larry David Super Bowl ad (which advertised
  "FTX" without distinguishing the international exchange from the separate, U.S.-regulated FTX.US)
  undermined Bankman-Fried's later defense that he believed FTX.US and FTX International were kept
  properly separate.

## The mechanism (verified)

- Bankman-Fried directed Gary Wang to build a secret software exception into FTX's code that let
  Alameda Research — nominally just another customer account — run an effectively unlimited negative
  balance, reported as roughly a **$65 billion** line of credit capacity, without triggering the
  margin calls or liquidation any other account would face.
- Through that backdoor, FTX customer deposits — money users believed sat in their own accounts, ready
  to withdraw — were used to cover Alameda's trading losses, fund venture investments, buy Bahamas
  real estate, and make the political donations above. Roughly **$10 billion** of customer funds moved
  from FTX to Alameda; when the bank run hit, there was an **$8 billion** hole between what FTX owed
  customers and what it actually held.
- FTX's own exchange token, FTT, was central to the illusion: Alameda's balance sheet was papered with
  FTT that FTX itself had created, so the "collateral" backing the whole structure was, in large part,
  a number FTX could print at will.

- **Nov 17, 2022**: New FTX CEO John J. Ray III — who previously oversaw the Enron liquidation — writes
  in a bankruptcy court filing: "Never in my career have I seen such a complete failure of corporate
  controls and such a complete absence of trustworthy financial information as occurred here,"
  adding this in 40 years of legal and restructuring experience.

## Quotations (verbatim, sourced above)

1. Larry David, FTX Super Bowl LVI ad (Feb 2022): "I don't think so. And I'm never wrong about this
   stuff."
2. Sam Bankman-Fried, Twitter/X, Nov 10 2022: "I'm sorry. That's the biggest thing. I f---ed up, and
   should have done better." / "The full story here is one I'm still fleshing out every detail of,
   but at a very high level, I f---ed up twice."
3. U.S. Attorney Damian Williams, Dec 13 2022 indictment announcement: "Sam Bankman-Fried perpetrated
   one of the biggest financial frauds in American history — a multibillion-dollar scheme designed to
   make him the King of Crypto."
4. Caroline Ellison, trial testimony, Oct 2023 (as reported by CNN/multiple outlets): testified she
   felt relief when FTX collapsed because she "didn't have to lie anymore."
5. John J. Ray III, bankruptcy court filing, Nov 17 2022: "Never in my career have I seen such a
   complete failure of corporate controls and such a complete absence of trustworthy financial
   information as occurred here."

## Cut / unverified — NOT used in the script

- The commonly repeated paraphrase of the FTX ad as "a little bit sketchy, but it's not a scam" could
  not be verified as actual ad dialogue in multiple source checks; the verified line above is used
  instead.
- A single precise "peak net worth" dollar figure for Bankman-Fried is not used — estimates range
  $22–26B depending on date/source, so the script says "as much as $26 billion" and flags it as an
  estimate, never a hard count-up figure.
- Michael Lewis's book "Going Infinite" is not used as a source for any fact in this script; it was
  criticized for a sympathetic framing and is not corroborated independently here.
