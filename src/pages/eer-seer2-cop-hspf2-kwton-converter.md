---
layout: layouts/page.njk
title: "EER SEER2 COP HSPF2 kW/Ton Converter"
seoTitle: "EER, SEER2, COP, HSPF2 & kW/Ton Converter | adicot.com"
description: "Convert HVAC efficiency ratings between EER, SEER, SEER2, HSPF, HSPF2, COP and kW/ton, using the DOE's SEER2 and HSPF2 factors for each equipment type."
permalink: /eer-seer2-cop-hspf2-kwton-converter.html
ogImage: "/images/0179db_cf446f98ffb9473cb0e83d7a5a3efc30~mv2.jpg"
calcInclude: "partials/calc-efficiency.njk"
calculatorName: "EER, SEER2, COP, HSPF2 and kW/Ton Converter"
pageModule: calc-efficiency.js
calcSource: "EER SEER COP Converter V1.4"
---

This converter converts between SEER, EER, HSPF, the DOE's SEER2 and HSPF2 ratings, COP and kW/ton. Since January 1, 2023, the Department of Energy's minimum efficiencies for central air conditioners and heat pumps are stated in SEER2 and HSPF2, and differ by region (10 CFR 430.32).

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Choose the efficiency rating you are converting from: SEER, SEER2, EER, COP, HSPF, HSPF2 or kW/ton.
2. Enter its value. For 15 SEER equipment, for example, enter 15.
3. Choose the equipment type. It is needed when converting to or from the DOE's January 1, 2023, SEER2 and HSPF2 ratings.
4. Every other rating appears in the results, and updates as you type.

To convert capacities rather than efficiencies, use the [kW, Btu/h and ton converter](/power-unit-converter).

## Methodology and equations

The calculator uses these conversions:

- EER = 0.875 × SEER
- EER = 12 / (kW/ton)
- COP = 3.516 / (kW/ton)
- COP = EER / 3.413
- COP = 0.293 × HSPF

Conversions to SEER2 and HSPF2 use RESNET's conversion factors, which were derived from empirical data:

| Equipment type | SEER2 | HSPF2 |
|---|---|---|
| Single package | SEER × 0.96 | HSPF × 0.84 |
| Single split | SEER × 0.95 | HSPF × 0.85 |
| Small duct high velocity | SEER × 1.00 | HSPF × 0.85 |
| Space constrained | SEER × 0.99 | HSPF × 0.85 |

(From Energy Gauge, *Modeling of SEER2/HSPF2 and how it compares to SEER/HSPF*, December 27, 2022.)

**Example:** a 15 SEER single-split system is 15 × 0.875 = 13.125 EER, 15 × 0.95 = 14.25 SEER2, and 13.125 / 3.413 = 3.846 COP.
