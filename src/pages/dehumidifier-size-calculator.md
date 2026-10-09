---
layout: layouts/page.njk
title: "Dehumidifier Size and Selection Calculator"
seoTitle: "Dehumidifier Size Calculator (Pints per Day) | adicot.com"
description: "Size a dehumidifier from the latent load in pints/day, Btu/h or kW, and list the commercial models that meet it, with airflow, efficiency and price."
permalink: /dehumidifier-size-calculator.html
ogImage: "/images/0179db_72e95366e2c24fc5b74436bf8b01a0ef~mv2.png"
calcInclude: "partials/calc-dehumidifier.njk"
calculatorName: "Dehumidifier Selection Calculator"
pageModule: calc-dehumidifier.js
calcSource: "Dehumidifier Specifier V7.1"
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Choose the units of the required capacity: pints/day, Btu/h or kW. Switching units converts the capacity you have entered.
2. Enter the required latent capacity.
3. The capacity in all three units, and the dehumidifiers that meet it, appear in the results. Click a model to open its manufacturer's specification sheet.

## Methodology

Dehumidifiers are rated in pints of water removed per day, but engineers are often given the latent load in Btu/h or kW. The calculator converts the required capacity to pints/day and compares it with each manufacturer's rated capacity.

From Btu/h, using 1.04 lb of water per pint and 1,055 Btu/lb for the latent heat of condensation:

Pints/day = Btu/h ÷ 1.04 lb/pint × 24 h/day ÷ 1,055 Btu/lb

**Example.** A space has an excess latent load of 4,100 Btu/h: 4,100 ÷ 1.04 × 24 ÷ 1,055 = 89.7 pints/day.

From kW, first convert to Btu/h (1 kW = 3,412.142 Btu/h):

Pints/day = kW × 3,412.142 ÷ 1.04 lb/pint × 24 h/day ÷ 1,055 Btu/lb

**Example.** An excess latent load of 1.2 kW: 1.2 × 3,412.142 ÷ 1.04 × 24 ÷ 1,055 = 89.6 pints/day.

### Which models are shown

The calculator finds the smallest dehumidifier whose rated capacity meets or exceeds the required capacity, and shows it together with every other qualifying model rated less than 10 pints/day above it, so similar units from different manufacturers are shown side by side. For 60 pints/day, for example, that is the three models rated 70 pints/day; for 91 pints/day, the five rated 100 to 105. Larger units are not shown, since they would be oversized.

The largest dehumidifier listed removes 730 pints/day (33,373 Btu/h, 9.78 kW). For a larger load, split it between units.

Above about 225 pints/day the listed models are far apart: nothing is listed between 225 and 345, 345 and 500, or 500 and 730 pints/day, so a load in those ranges is met by the next size up. For large loads, commercial and grow-room dehumidifiers from makers such as Desert Aire are sized to order and quoted by the manufacturer; they are not listed here because their ratings are not published at 80°F / 60% RH.

The ratings are the manufacturers' at 80°F / 60% RH entering air, the condition AlorAir labels "AHAM". Many residential dehumidifiers are advertised at the DOE condition of 65°F / 60% RH instead, which gives a much lower figure, so compare other models at 80°F / 60% RH. At lower temperatures or humidity a dehumidifier removes less water, so check the manufacturer's performance data at your design conditions. This is a preliminary selection tool: confirm the final selection with the manufacturer and your engineer. Adicot is not affiliated with any equipment manufacturer.

## Dehumidifiers in the calculator

Capacities in Btu/h and kW are converted from the rated pints/day. The list covers the current Santa Fe, Quest, Aprilaire and AlorAir whole-house and commercial models. Prices are approximate retail prices from an internet search on 26 September 2026.

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Manufacturer and model</th><th scope="col">Pints/day</th><th scope="col">Btu/h</th><th scope="col">kW</th><th scope="col">cfm</th><th scope="col">Pints/kWh</th><th scope="col">Approx. price</th></tr></thead>
  <tbody>
  {%- for d in dehumidifiers %}
    <tr><th scope="row"><a href="{{ d.url }}" rel="noopener">{{ d.name }}</a></th><td>{{ d.ppd }}</td><td>{{ d.btuh }}</td><td>{{ d.kW }}</td><td>{{ d.cfm }}</td><td>{{ d.eff }}</td><td>${{ d.price }}</td></tr>
  {%- endfor %}
  </tbody>
</table>
</div>
