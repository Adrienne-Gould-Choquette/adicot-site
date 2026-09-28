---
layout: layouts/page.njk
title: "CLTD Roof & Wall Numbers and Hourly CLTD"
seoTitle: "CLTD Roof & Wall Numbers and Hourly CLTD | adicot.com"
description: "Find ASHRAE CLTD roof and wall numbers, the hourly CLTD corrected for your design temperatures, and the conduction load q = U × A × CLTD."
permalink: /ctld-roof-and-wall-numbers.html
ogImage: "/images/0179db_43b6ae640f6143788cc9c45edae58be2~mv2.jpg"
calcInclude: "partials/calc-cltd.njk"
calculatorName: "CLTD Roof and Wall Numbers"
pageModule: calc-cltd.js
calcSource: "ASHRAE CLTD Surface Type V1.1"
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

**Roof**

1. Choose the roof type.
2. Choose the mass location. The choices depend on the roof type.
3. Choose the insulation R-value range.
4. The CLTD roof number appears in the results.

**Wall**

1. Choose the principal wall material.
2. Choose the mass location.
3. Choose the secondary wall material.
4. Choose the insulation R-value range.
5. The wall material code (the principal wall material's layer code from the Handbook's Table 11, for example A1 for 1 in. stucco) and the CLTD wall number appear in the results. Roofs have no such code: Table 31 names the roof materials directly. Where the Handbook marks a combination not possible, the calculator says so and lists the R-value ranges that do have a number.

**CLTD by hour**

1. Choose °F or °C and the direction the wall faces.
2. Enter the indoor design temperature and the outdoor design maximum and daily range. The defaults are the conditions the tables were computed for.
3. Optionally, enter each surface's U-factor and area to get its conduction cooling load.
4. The corrected CLTD for each hour (solar time) appears under the roof and wall numbers, with the peak hour marked.

## Methodology

The Cooling Load Temperature Difference (CLTD) method estimates the cooling load through roofs and walls from tabulated temperature differences. The roof or wall number selects which column of the CLTD tables applies to a construction: it captures how much thermal mass the construction has and where that mass sits relative to the insulation, which set how much the heat gain lags and is damped through the day.

This calculator is based on the 1997 ASHRAE Handbook—Fundamentals, Table 31, page 28.42, for roofs, and Tables 33A, 33B and 33C for walls.

### CLTD by hour

The hourly values are the 1997 Handbook's Table 30 (flat roofs, by roof number) and Table 32 (sunlit walls, by wall number and orientation). They are for July at 40°N latitude, dark surfaces, an indoor temperature of 78 °F (25.5 °C), and an outdoor maximum of 95 °F (35 °C) with a 21 °F (11.6 °C) daily range. The 1997 edition has no latitude or month correction for these tables.

For other design temperatures, the Handbook corrects each hour's value:

Corrected CLTD = CLTD + (78 − t<sub>r</sub>) + (t<sub>m</sub> − 85), in °F; or CLTD + (25.5 − t<sub>r</sub>) + (t<sub>m</sub> − 29.4), in °C

where t<sub>r</sub> is the indoor temperature and t<sub>m</sub> = outdoor maximum − daily range / 2 is the outdoor mean. The Handbook recommends no adjustment for color, or for ventilation of the space above a ceiling. At the tables' own stated conditions the formula gives a mean of 84.5 °F, so the correction there is −0.5 °F rather than zero; that is how the Handbook's formula works out, and the calculator applies it as published.

The conduction cooling load for each hour is then q = U × A × corrected CLTD.

The values are read from the SI printing of the Handbook, in kelvins, so the °C figures are exactly as printed. The °F figures are the kelvin values × 1.8. They agree with the I-P printing to within 0.9 °F, but may differ from its whole-degree values by 1 °F.

**Example:** roof number 1 (a steel deck roof with little mass), indoor 75 °F, outdoor maximum 90 °F, daily range 20 °F. The outdoor mean is 90 − 20 / 2 = 80 °F, so the correction is (78 − 75) + (80 − 85) = −2 °F. At hour 14, the table gives 49 K = 88.2 °F, so the corrected CLTD is 86.2 °F. With U = 0.1 Btu/h·ft²·°F and 1,000 ft², q = 0.1 × 1,000 × 86.2 = 8,620 Btu/h.

For the default U-factors and SHGC of windows and doors, use the [U-factor and SHGC default values](/iecc-window-u-shgc-default-values) lookup.
