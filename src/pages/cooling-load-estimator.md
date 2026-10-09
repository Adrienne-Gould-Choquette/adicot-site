---
layout: layouts/page.njk
title: "Cooling Load Ballpark Estimator: Tons per Square Foot"
seoTitle: "Cooling Load Estimator: Tons per Square Foot | adicot.com"
description: "Estimate cooling tons, lighting and electrical load, and occupants from floor area for over 50 building types: a quick check on a load calculation."
permalink: /cooling-load-estimator.html
ogImage: "/images/0179db_c22de83f37c2418ca6d10c1cdc40ec18~mv2.png"
calcInclude: "partials/calc-coolingload.njk"
calculatorName: "Cooling Load Ballpark Estimator"
pageModule: calc-coolingload.js
calcSource: "Cooling Load Ballpark Estimator V1.6"
service: cooling-load-calculations
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Choose US or metric units.
2. Enter the project's floor area.
3. Choose the building type: type part of a name to search, such as "school" or "restaurant", or click the arrow to see the whole list. Try neighboring building types too, to see the full range of loads and home in on the right one for your project.
4. The low, average and high estimates of occupants, lights and other electrical load, and refrigeration appear in the results.

## Methodology

The calculator estimates a building's occupants, lights and other electrical load, and refrigeration (cooling) from its floor area and building type, using check figures of what buildings of each type have historically had:

- **Occupants** = floor area ÷ floor area per person
- **Lights and other electrical** = floor area × watts per square foot
- **Refrigeration** = floor area ÷ floor area per ton, and 1 ton = 12,000 Btu/h (3.52 kW)

Some building types have a low, average and high figure; others have only an average. Low refrigeration corresponds to the most square feet per ton.

In metric units, the same figures are converted to square meters (1 ft² = 0.092903 m²).

**Example.** A 10,000 ft² general office building: 280 ft² per ton gives 10,000 ÷ 280 = 35.7 tons (428,571 Btu/h) on average, with a range of 27.8 tons (at 360 ft²/ton) to 52.6 tons (at 190 ft²/ton). At 2.5 W/ft², lights and other electrical come to 25,000 W.

### What it is for

This is a pre-design ballpark: an estimate of the cooling load before a full analysis has been done, or a sanity check of a load calculation's result. It is not a load calculation. The check figures take no account of the inputs a load calculation uses, such as construction, climate, orientation, glazing or ventilation. As buildings, lighting and equipment become more efficient, the watts and tons trend lower than these historical figures.

For a quick look at a single space, the [coil selection calculator](/coil-selection-calculator) and the [psychrometric calculator](/psychrometric-chart-calculator) work from airflows and air conditions. For a full load calculation, see our [cooling load calculation services](/services/cooling-load-calculations).

## Check figures by building type

The figures the calculator uses, adapted from the ASHRAE Handbook—Fundamentals and other sources.

<div class="table-scroll">
<table class="ref-table">
  <thead>
    <tr><th scope="col" rowspan="2">Building type</th><th scope="colgroup" colspan="3">ft² per person</th><th scope="colgroup" colspan="3">Lights &amp; other electrical, W/ft²</th><th scope="colgroup" colspan="3">ft² per ton</th></tr>
    <tr><th scope="col">Low</th><th scope="col">Avg</th><th scope="col">High</th><th scope="col">Low</th><th scope="col">Avg</th><th scope="col">High</th><th scope="col">Low</th><th scope="col">Avg</th><th scope="col">High</th></tr>
  </thead>
  <tbody>
  {%- for b in coolingLoad.table %}
    <tr><th scope="row">{{ b.name }}</th>{% for v in b.occ %}<td>{{ v }}</td>{% endfor %}{% for v in b.lights %}<td>{{ v }}</td>{% endfor %}{% for v in b.ref %}<td>{{ v }}</td>{% endfor %}</tr>
  {%- endfor %}
  </tbody>
</table>
</div>
