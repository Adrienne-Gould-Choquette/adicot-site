---
layout: layouts/page.njk
title: "kW, HP, BTU Unit Converter"
seoTitle: "kW, HP, BTU, Ton Converter | adicot.com"
description: "Convert power and HVAC capacity between tons of refrigeration, kilowatts (kW), horsepower (hp), Btu/h, MBH, lb-ft/h and ft-lbf/h."
permalink: /power-unit-converter.html
ogImage: "/images/0179db_c57972ac429d4673971a751a9632fce4~mv2.png"
calcInclude: "partials/calc-powerconv.njk"
calculatorName: "Power Unit Converter"
pageModule: calc-powerconv.js
calcSource: "Power Unit Conversion V1.3"
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Enter the value to convert.
2. Choose its unit: Btu/h, MBH, tons of refrigeration, kilowatts, watts, horsepower, foot pound-force per hour or pound-foot per hour.
3. The value appears in every unit in the results table, and updates as you type.

## Methodology

This calculator converts between the common units of power, or energy rate, used in HVAC design, mechanical engineering and energy analysis. All conversions use the standard constants given in the ASHRAE Handbook—Fundamentals (2025), by the U.S. Department of Energy (DOE) and by NIST.

### Conversion formulas

| From 1 Btu/h, multiply by | To get | Formula |
|---|---|---|
| 778.169 | foot pound-force per hour | P<sub>ft·lbf/h</sub> = 778.169 × P<sub>Btu/h</sub> |
| 778.169 | pound-foot per hour (the same unit as ft·lbf/h) | P<sub>lb·ft/h</sub> = 778.169 × P<sub>Btu/h</sub> |
| 0.000293071 | kilowatts | P<sub>kW</sub> = 0.000293071 × P<sub>Btu/h</sub> |
| 0.293071 | watts | P<sub>W</sub> = 0.293071 × P<sub>Btu/h</sub> |
| 1/1,000 | MBH | P<sub>MBH</sub> = P<sub>Btu/h</sub> / 1,000 |
| 1/12,000 | tons of refrigeration | P<sub>ton</sub> = P<sub>Btu/h</sub> / 12,000 |
| 1/2,544.43 | horsepower | P<sub>hp</sub> = P<sub>Btu/h</sub> / 2,544.43 |

### Worked example

Convert 900 Btu/h to the other units:

- P<sub>kW</sub> = 900 × 0.000293071 = 0.2638 kW
- P<sub>hp</sub> = 900 / 2,544.43 = 0.3537 hp
- P<sub>ton</sub> = 900 / 12,000 = 0.075 tons of refrigeration
- P<sub>W</sub> = 900 × 0.293071 = 263.76 W
- P<sub>MBH</sub> = 900 / 1,000 = 0.90 MBH

These conversions match standard HVAC reference tables and can be cross-checked in the ASHRAE Handbook—Fundamentals, Chapter 38 (Units and Conversions).

### References

- ASHRAE Handbook—Fundamentals (2025), Chapter 40, "Units and Conversions"
- U.S. Department of Energy, Energy Units and Conversions Fact Sheet
- NIST SP 811, Guide for the Use of the International System of Units (SI)

Results are intended for preliminary engineering estimates. Adicot, Inc. makes no guarantee of accuracy for design or code-compliance documentation.
