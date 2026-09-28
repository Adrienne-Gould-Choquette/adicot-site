---
layout: layouts/page.njk
title: "Commercial Kitchen Exhaust-Hood Calculator"
seoTitle: "Kitchen Hood Exhaust CFM Calculator (2024 IMC) | adicot.com"
description: "Size commercial kitchen hood exhaust (cfm or l/s), hood length and make-up air from the appliances under the hood, per the 2024 IMC and ASHRAE."
permalink: /ckv-commercial-kitchen-ventilation.html
ogImage: "/images/0179db_0736c99eb474446ea992b7d7a46145c1~mv2.jpg"
calcInclude: "partials/calc-ckv.njk"
calculatorName: "Commercial Kitchen Exhaust Hood Calculator"
pageModule: calc-ckv.js
calcSource: "Commercial Kitchen Exhaust Calculation V1.9"
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements. Work out one hood at a time, then:

1. Choose US or metric units. Switching units converts the lengths you have entered.
2. Choose the hood style. The diagram shows it.
3. Choose the hood type: Type I for appliances that produce grease or smoke, Type II for heat and moisture only.
4. Choose each appliance under the hood and enter its length (inches, or meters). Use **Add appliance** for more rows.
5. Optionally, enter the make-up air as a percentage of the exhaust.
6. The hood length, the code minimum exhaust, the ASHRAE Handbook range, make-up air and the code notes that apply appear in the results.

## Methodology

The exhaust a hood needs depends on its style and on the appliances it serves. Not every hood style is rated for every appliance duty, so the appliances and their duty ratings are part of the hood specification.

### Hood type

The 2024 International Mechanical Code (IMC) and the 2023 Florida Building Code—Mechanical (FBC-M) classify hoods by what they capture:

- **Type I** hoods are required where cooking appliances produce grease or smoke, and over medium-, heavy- and extra-heavy-duty cooking appliances (Section 507.2).
- **Type II** hoods are required over dishwashers and appliances that produce heat or moisture without grease or smoke (Section 507.3). The 2024 IMC also lists light-duty cooking appliances here.

Where any appliance under a hood requires a Type I hood, the hood must be Type I.

### Hood length

The hood is the length of the equipment under it plus 12 inches (0.3 m): the code requires canopy hoods to overhang the appliances by at least 6 inches on each open side (IMC 507.1.6.1; FBC-M 507.4.1).

### Exhaust rate

The hood is sized for the heaviest-duty appliance under it. With a light-duty and a medium-duty appliance under one hood, for example, the whole hood is sized at the medium-duty rate. Each rate is in cfm per linear foot of hood, so

Exhaust = hood length × rate

The calculator gives three answers:

- **Code minimum:** the code rate for the hood style and the heaviest duty (IMC 507.2.10 and 507.3.4; FBC-M 507.5). Some hood styles are not allowed over heavy or extra-heavy appliances.
- **ASHRAE Handbook range:** the typical design range for the hood style and the heaviest duty. For extra-heavy duty the Handbook gives a minimum only (for example "550+").
- **Range weighted by duty:** each appliance's own ASHRAE range, averaged over the equipment length. This shows how much of the hood the heavy appliances occupy; the hood itself must still be sized for its heaviest duty.

With a dishwasher under the hood, the hood is sized as if every appliance under it were a dishwasher, at 100 cfm per foot.

In metric units the rates are converted to l/s per meter (1 cfm/ft = 1.548 l/s per meter).

**Example.** An open-burner range (medium duty, 36 in.) and a flat griddle (medium duty, 36 in.) under a wall-mounted canopy hood: 72 in. of equipment gives a 7 ft hood. The code minimum is 7 ft × 300 cfm/ft = 2,100 cfm, and the ASHRAE range is 7 × 200 to 7 × 300 = 1,400–2,100 cfm. With 80% make-up air, the make-up air is 1,680 cfm.

### Make-up air

The make-up air is a percentage of the exhaust. Separately, the IMC and FBC-M (Table 403.3.1.1) and ASHRAE 62.1 require enough outdoor air for an exhaust rate of at least 0.70 cfm per square foot of kitchen.

## Minimum exhaust by hood style (IMC 507.2.10 and 507.3.4; FBC-M 507.5)

Cfm per linear foot of hood.

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Hood style</th><th scope="col">Light duty</th><th scope="col">Medium duty</th><th scope="col">Heavy duty</th><th scope="col">Extra-heavy duty</th></tr></thead>
  <tbody>
  {%- for r in ckv.codeTable %}
    <tr><th scope="row">{{ r.hood }}</th>{% for v in r.rates %}<td>{{ v }}</td>{% endfor %}</tr>
  {%- endfor %}
  </tbody>
</table>
</div>

A hood over dishwashers only: 100 cfm per foot.

## Typical exhaust by hood style (ASHRAE Handbook)

Cfm per linear foot of hood.

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Hood style</th><th scope="col">Light duty</th><th scope="col">Medium duty</th><th scope="col">Heavy duty</th><th scope="col">Extra-heavy duty</th></tr></thead>
  <tbody>
  {%- for r in ckv.ashraeTable %}
    <tr><th scope="row">{{ r.hood }}</th>{% for v in r.rates %}<td>{{ v }}</td>{% endfor %}</tr>
  {%- endfor %}
  </tbody>
</table>
</div>

## Appliance duty categories

The calculator assigns each appliance the duty category in the ASHRAE Handbook—HVAC Applications (Commercial Kitchen Ventilation):

{% for d in ckv.byDuty %}
- **{{ d.duty }}:** {{ d.names | join("; ") }}
{%- endfor %}

## Hood styles

- **Wall-mounted canopy:** all types of cooking equipment located against a wall.
- **Single-island canopy:** all types of cooking equipment in a single-line island configuration.
- **Double-island canopy:** cooking equipment mounted back-to-back in an island; the rates are per side, so enter one side at a time.
- **Back shelf / proximity:** counter-height equipment, typically against a wall but possibly freestanding.
- **Pass-over:** counter-height equipment where food passes from the cooking side to the serving side.
- **Eyebrow:** mounted directly to ovens and some dishwashers.

## References

- International Code Council. *International Mechanical Code* (2024), Sections 403.3.1.1 and 507, and *Florida Building Code—Mechanical*, 8th edition (2023), Section 507. The minimum rates are unchanged from the 2018 IMC; the 2024 IMC moved them from one table into Sections 507.2.10 (Type I) and 507.3.4 (Type II).
- ASHRAE. *ASHRAE Handbook—HVAC Applications*, Commercial Kitchen Ventilation.

Always confirm the design with the hood manufacturer and the code your jurisdiction has adopted.
