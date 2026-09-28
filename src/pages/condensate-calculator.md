---
layout: layouts/page.njk
title: "Condensate Rate Calculator"
seoTitle: "Condensate Rate Calculator | adicot.com"
description: "Calculate the condensate a coil generates from the entering and leaving air conditions, in US or metric units."
permalink: /condensate-calculator.html
ogImage: "/images/0179db_71db01a9d5bf40e39783790a7a171708~mv2.png"
calcInclude: "partials/calc-psych.njk"
calculatorName: "Condensate Rate Calculator"
pageModule: calc-psych.js
calcSource: "Condensate Generated V2.16"
psychStates: 2
psychKind: condensate
---

Instructions:

- Review the methodology to ensure it aligns with your project's requirements.

- Select US or Metric Units

- For the entering (initial) air and the leaving (final) air, choose under Given which pair of properties you know: dry bulb and wet bulb, dry bulb and relative humidity, dry bulb and dew point, or dew point and relative humidity. The two can differ, for example an RH entering and a dew point leaving.

- Enter the two values for each.

- Enter the air flow rate, CFM [l/s]

- Enter the altitude of the project, ft [m]

- The results update as you type.
- The results and all the psychrometric parameters are shown in the Results Table.

For a single condition, use the [psychrometric chart calculator](/psychrometric-chart-calculator).
To convert condensate between units, use the [condensate converter](/condensate-converter).

Methodology and Equations:

This calculator can be used in US or Metric Units. The user inputs leaving and entering coil conditions as Dry Bulb or Dew Point Temperature, Wet Bulb Temperature or Relative Humidity, coil Airflow rate, and project altitude. The formulas to calculate the psychrometric properties of the initial and final conditions are based on the methodology outlined in the ASHRAE 2021 Handbook. The change in the humidity ratio is used to calculate the Condensate Generated.

lb,moisture/hr = Q / v x Δw x C

where: Q = air flow rate, CFM

v= Specific Volume, ft^3/lb,dry air

Δw = change in humidity ratio, w,entering − w,leaving, lb,moisture/lb,dry air

C= 60 min/ hr

The following conversions are used to calculate the various units of condensate generated :

BTU/h = Pints/day x 1.04 lb/pint / 24 hrs/day x 1055 BTU/lb

1 kW = 3412.142 BTU/hr

1 kW = 1000 W

1 Gallon = 8 pints = 3.78541 liters

1 Gallon of water = 8.34 lbs

## How the calculator solves

Every property comes from the 2021 ASHRAE Handbook—Fundamentals, chapter 1, with no curve fits. Saturation pressure uses the Hyland-Wexler equations (5 and 6), over ice below 32 °F and over water above. Humidity ratio comes from the wet bulb by equation 35 (or 37 when the wet bulb is below freezing), or directly from the vapor pressure when the RH or the dew point is given. Dew point and wet bulb are solved exactly: the dew point starts from ASHRAE's equation 39 or 40 and is refined by Newton's method until it matches the saturation pressure, and the wet bulb is solved from equation 35 or 37 the same way. Altitude sets the atmospheric pressure by equation 3. The 2025 Handbook replaces the Hyland-Wexler saturation pressure with the IAPWS formulations (IAPWS-IF97 over water, IAPWS 2008 over ice); from −20 to 150 °F the two agree within 0.03 %, so the results are unchanged at the precision shown.
