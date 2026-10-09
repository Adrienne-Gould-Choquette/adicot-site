---
layout: layouts/page.njk
title: "Heat Pump Balance Point Calculator"
seoTitle: "Heat Pump Balance Point Calculator | adicot.com"
description: "Find a heat pump's balance point from its 47 °F and 17 °F capacities and the building heat loss, and size the strip heat at design temperature."
permalink: /heat-pump-balance-point-calculator.html
calcInclude: "partials/calc-balancepoint.njk"
calculatorName: "Heat Pump Balance Point Calculator"
pageModule: calc-balancepoint.js
calcSource: "Balance Point V1.1"
service: cooling-load-calculations
---

## How to use it

1. Enter the outdoor temperature at which the building needs no heat. It is usually 60–65 °F, because internal and solar gains cover the losses above it.
2. Enter the outdoor design temperature and the building's design heat loss (from a load calculation).
3. From the manufacturer's data, enter the heat pump's heating capacity at two outdoor temperatures. The AHRI rating points, 47 °F and 17 °F, are the usual pair.
4. The results update as you type. They show the balance point, the shortfall at the design temperature, and the strip heater size that covers it. The chart shows both lines.

Use **Copy link to these results** to save or share the calculation.

## Methodology, equation and example

A heat pump's heating capacity falls as the outdoor temperature drops, while the building's heat loss rises. The **balance point** is the outdoor temperature at which the two are equal. Above it, the heat pump alone carries the building. Below it, supplemental heat (usually electric strip heat in the air handler) has to make up the difference.

The calculator treats both as straight lines:

**Heat loss(T) = Design heat loss × (T₀ − T) / (T₀ − T_design)**

**Capacity(T) = Q_low + (Q_high − Q_low) / (T_high − T_low) × (T − T_low)**

The balance point is where they cross:

**T_bal = (m_L × T₀ − Q_low + m_C × T_low) / (m_C + m_L)**

**Supplemental heat = Design heat loss − Capacity(T_design)**, and zero if the heat pump covers the design load. Converting to kW: 1 kW = 3,412.14 Btu/h.

Where:

- **T₀**: outdoor temperature with no heating load, °F
- **T_design**: outdoor design temperature, °F
- **m_L**: slope of the heat loss line, Design heat loss / (T₀ − T_design), Btu/h per °F
- **m_C**: slope of the capacity line, (Q_high − Q_low) / (T_high − T_low), Btu/h per °F
- **Q_low, Q_high**: heat pump capacity at the low and high rating temperatures T_low and T_high, Btu/h

The supplemental heat is rounded up to the next standard strip heater (5, 8, 10, 15, 20 or 25 kW). The calculator also sizes **emergency heat**: strip heat covering the full design load, for when the heat pump is off or locked out.

**Example:** A house loses 15,000 Btu/h at a 17 °F design temperature and needs no heat above 65 °F. The heat pump delivers 17,800 Btu/h at 47 °F and 10,700 Btu/h at 17 °F.

- m_L = 15,000 / (65 − 17) = 312.5 Btu/h per °F
- m_C = (17,800 − 10,700) / (47 − 17) = 236.67 Btu/h per °F
- T_bal = (312.5 × 65 − 10,700 + 236.67 × 17) / (236.67 + 312.5) = 24.8 °F
- Capacity at 17 °F = 10,700 Btu/h, so the supplemental heat is 15,000 − 10,700 = 4,300 Btu/h = 1.26 kW, and a 5 kW strip heater covers it.

## Notes

- Use the capacities the manufacturer publishes for the matched indoor and outdoor units. The calculator uses them as entered.
- Below the lower rating temperature, the calculator extends the straight line through the two rating points. If the manufacturer publishes capacity at the design temperature itself, enter that as the low rating point.
- Strip heater sizes vary by air handler. Confirm the sizes available for the unit you are specifying.
