---
layout: layouts/page.njk
title: "Annual Cooling Cost Calculator"
seoTitle: "Annual Cooling Cost Calculator (SEER & SEER2) | adicot.com"
description: "Estimate the yearly cost to run an air conditioner from its capacity, SEER or SEER2 rating, your city's full-load cooling hours and your electricity rate."
permalink: /annual-cooling-cost-calculator.html
ogImage: "/images/0179db_9cc7470b96a9459abaa521c72efa15b5~mv2.png"
calcInclude: "partials/calc-annualcost.njk"
calculatorName: "Annual Cooling Cost Calculator"
pageModule: calc-annualcost.js
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Enter the unit's cooling capacity, in Btu/h.
2. Choose whether its efficiency rating is SEER or SEER2, and enter it. For SEER2, also choose the equipment type, which sets the conversion to SEER.
3. Choose the location nearest your building to fill in its full-load cooling hours, or type the hours yourself if you have a better figure (from an hourly energy model, for example).
4. Enter your electricity rate. The default is the current US average residential price; the rate on your bill gives a better estimate.

The annual energy and cost appear as you type. Use **Copy link to these results** to save or share the calculation.

## Methodology, equation and example

The calculator estimates the electricity an air conditioner uses over a year of cooling, and what it costs:

**Annual energy (kWh) = Capacity (Btu/h) ÷ SEER × Full-load cooling hours ÷ 1000**

**Annual cost = Annual energy (kWh) × Electricity rate ($/kWh)**

Capacity ÷ SEER is the unit's average power draw in watts, since SEER is in Btu per watt-hour. The **full-load cooling hours** (equivalent full-load hours) are the hours the unit would have to run at full capacity to deliver a year's cooling in that climate. Real equipment cycles and runs at part load, so these are not clock hours; they convert a seasonal efficiency into a seasonal energy use.

The hours for each location come from ENERGY STAR's savings calculator for air-source heat pumps (U.S. EPA and DOE; data source EPA, 2002). They are typical values for a unit sized to the load. An oversized unit, a different thermostat setting or an unusual building will run differently. The data are from 2002, and many locations have warmed since, so recent cooling hours may be somewhat higher.

**SEER and SEER2.** SEER2 ratings, required since 2023, come from a test with higher external static pressure, so a unit's SEER2 is lower than its SEER. The calculator converts SEER2 to SEER with the same equipment-type factors as our [EER, SEER2, COP, HSPF2 and kW/ton converter](/eer-seer2-cop-hspf2-kwton-converter) (for example, SEER = SEER2 ÷ 0.95 for a split system).

**Electricity rate.** The default, $0.18/kWh, is the U.S. average residential price over the 12 months ending July 2026: 17.99 ¢/kWh (EIA, *Electric Power Monthly*, Table 5.3). Rates vary widely by state and utility, so use your own where you can.

### Example

A 38,000 Btu/h system with a SEER of 11, in Miami, Florida (3,931 full-load cooling hours), with electricity at $0.18/kWh:

- Average power: 38,000 ÷ 11 = 3,454.5 W
- Annual energy: 3,454.5 × 3,931 ÷ 1000 = 13,579.8 kWh
- Annual cost: 13,579.8 × $0.18 = $2,444.37 per year

These are the calculator's starting values. The same system with a SEER of 16 would use 9,336 kWh and cost $1,680.50 a year, a saving of about $764 a year.

## Sources

- U.S. EPA and U.S. DOE, ENERGY STAR savings calculator for air-source heat pumps (ASHP_Sav_Calc.xls), full-load cooling hours by location (EPA, 2002). [energystar.gov](https://www.energystar.gov/products/heating_cooling/guide/savings-calculator/standalone)
- U.S. Energy Information Administration, *Electric Power Monthly*, Table 5.3, Average Price of Electricity to Ultimate Customers. [eia.gov](https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_3)
