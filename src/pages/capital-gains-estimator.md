---
layout: layouts/page.njk
title: "Home Sale Long-term Capital Gains Tax Estimator*"
seoTitle: "Home Sale Capital Gains Tax Estimator (2026) | adicot.com"
description: "Estimate federal long-term capital gains tax, net proceeds and cash on hand from a property sale, with the home-sale exclusion and the 3.8% NIIT."
permalink: /capital-gains-estimator.html
ogImage: "/images/0179db_d6668c8900464366ac0949559735d314~mv2.png"
calcInclude: "partials/calc-capgains.njk"
calculatorName: "Long-term Capital Gains Estimator"
pageModule: calc-capgains.js
calcSource: "Capital Gains Estimator 2.8"
---

\*For long-term gains: property held for more than one year. A short-term gain (property held a year or less) is taxed as ordinary income at your income tax rate.

## How to use it

Review the method below to make sure it fits your situation, then:

1. Enter the original purchase price of the property.
2. Enter the sales price.
3. Enter the expenses and improvements that add to the property's basis or were spent selling it. See [IRS Publication 523](https://www.irs.gov/publications/p523) for what counts.
4. Enter the sales commission, as a percentage of the sales price.
5. Enter your taxable income for the year of the sale, **not** including this gain.
6. Choose whether the property has been your primary residence for two of the last five years ([IRS Topic 701, Sale of your home](https://www.irs.gov/taxtopics/tc701)), your filing status and the tax year of the sale.
7. Optionally, enter the remaining mortgage and the price of your next home, to see the cash left on hand.
8. The tax on the gain, band by band, the net proceeds and the cash on hand appear in the results as you type.

## Method

### Capital gain

Capital gain = sales price × (1 − sales commission) − original purchase price − expenses

If the property was your primary residence for two of the last five years, up to **$250,000** of the gain is excluded, or **$500,000** if you are married filing jointly. The exclusion never goes beyond the gain itself, and a loss on the sale of a personal home is not deductible, so the tax is never negative.

Taxable gain = capital gain − excluded amount (not less than zero)

### Tax on the gain

Long-term capital gains are taxed at 0%, 15% or 20%, depending on where they fall in your **total** taxable income. Your ordinary taxable income fills the brackets first, and the gain is stacked on top of it. So a gain is taxed at 0% only as far as the 0% ceiling is above your other income, and at 20% only above the 15% ceiling.

- Gain at 0% = the part of the gain below the 0% ceiling
- Gain at 15% = the part between the 0% and 15% ceilings
- Gain at 20% = the rest

### Net investment income tax

A 3.8% net investment income tax (NIIT) applies to the smaller of the taxable gain and the amount by which income exceeds $200,000 (single or head of household), $250,000 (married filing jointly) or $125,000 (married filing separately). The law bases this on modified adjusted gross income; the estimator uses taxable income plus the gain, which is usually a little lower. See [IRS: Net investment income tax](https://www.irs.gov/individuals/net-investment-income-tax).

Capital gains tax = 15% × gain at 15% + 20% × gain at 20% + NIIT

### Proceeds

- Net proceeds = sales price − purchase price − expenses − sales commission − capital gains tax
- Cash on hand = sales price − remaining mortgage − sales commission − capital gains tax − next home's price

### Example

A married couple, filing jointly, bought a home for $555,000 and spent $300,000 renovating it. They sell it in 2026 for $1,900,000, pay a 7% commission and still owe $100,000 on the mortgage. It has been their home for more than two of the last five years. Their 2026 taxable income, not counting the sale, is $260,000.

- Capital gain = $1,900,000 × (1 − 7%) − $555,000 − $300,000 = $912,000
- Excluded = $500,000, so the taxable gain is $412,000
- Their $260,000 of other income is already above the 0% ceiling ($98,900), so none of the gain is at 0%.
- Gain at 15% = $613,700 − $260,000 = $353,700 → $53,055
- Gain at 20% = $412,000 − $353,700 = $58,300 → $11,660
- NIIT = 3.8% × the smaller of $412,000 and ($672,000 − $250,000 = $422,000) = 3.8% × $412,000 = $15,656
- Capital gains tax = $53,055 + $11,660 + $15,656 = **$80,371**, an effective 19.5% of the taxable gain
- Net proceeds = $1,900,000 − $555,000 − $300,000 − $133,000 − $80,371 = **$831,629**
- Cash on hand = $1,900,000 − $100,000 − $133,000 − $80,371 = **$1,586,629**

### What it leaves out

This is an estimate of the federal tax only. It does not include state income tax; depreciation recapture on a rental or a home office, which is taxed at up to 25%; the reduced exclusion for a partial period of use; or other adjustments to basis. Consult a tax professional.

## Long-term capital gains rates by filing status

Taxable income, including the gain. From IRS Revenue Procedures 2024-40 (2025) and 2025-32 (2026), section 3.03; NIIT thresholds from IRC §1411 and the exclusion from IRC §121.

{% for y in capGains %}
### {{ y.year }}

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Filing status</th><th scope="col">0% rate</th><th scope="col">15% rate</th><th scope="col">20% rate</th><th scope="col">3.8% NIIT over</th><th scope="col">Home-sale exclusion</th></tr></thead>
  <tbody>
  {%- for r in y.rows %}
    <tr><th scope="row">{{ r.status }}</th><td>{{ r.zero }}</td><td>{{ r.fifteen }}</td><td>{{ r.twenty }}</td><td>{{ r.niit }}</td><td>{{ r.excl }}</td></tr>
  {%- endfor %}
  </tbody>
</table>
</div>
{% endfor %}

See also [IRS Topic 409, Capital gains and losses](https://www.irs.gov/taxtopics/tc409).
