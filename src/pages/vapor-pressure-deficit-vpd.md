---
layout: layouts/page.njk
title: "Vapor Pressure Deficit (VPD)"
seoTitle: "Vapor Pressure Deficit (VPD) | adicot.com"
description: "Calculate the room and leaf vapor pressure deficit (VPD) for grow rooms from the room temperature and humidity."
permalink: /vapor-pressure-deficit-vpd.html
ogImage: "/images/0179db_d72711d97cd24dde93dda8621a925f10~mv2.png"
calcInclude: "partials/calc-vpd.njk"
calculatorName: "Vapor Pressure Deficit (VPD) Calculator"
pageModule: calc-vpd.js
calcSource: "VPD_Vapor_Pressure_Differential V1.4"
---

## How to use it

1. Choose US or metric units. Switching converts the values already entered.
2. Enter the room (dry bulb) temperature.
3. Choose whether you know the relative humidity or the wet bulb temperature, and enter it. The calculator works out the other.
4. Optionally enter the leaf temperature, for the leaf VPD.
5. Enter the altitude.
6. The air and leaf VPD appear in the results with the other properties of the air, and update as you type.

## What vapor pressure deficit is

Vapor pressure deficit (VPD) is the difference between how much water vapor the air could hold when saturated and how much it holds now, expressed as a pressure. It is a direct measure of the air's drying power: a high VPD means the air is relatively dry and pulls moisture from surfaces and plants quickly; a low VPD means the air is close to saturation. Growers use VPD to manage transpiration in grow rooms and greenhouses, and HVAC designers use it to size dehumidification for them.

## Equations

**Air VPD** = p<sub>ws</sub>(T<sub>air</sub>) − p<sub>w</sub>

**Leaf VPD** = p<sub>ws</sub>(T<sub>leaf</sub>) − p<sub>w</sub>

where p<sub>ws</sub>(T) is the saturation vapor pressure at temperature T (the Hyland-Wexler equations of the 2021 ASHRAE Handbook—Fundamentals, chapter 1), and p<sub>w</sub> is the partial pressure of the water vapor in the air. With the relative humidity known, p<sub>w</sub> = RH × p<sub>ws</sub>(T<sub>air</sub>). With the wet bulb known, the humidity ratio W comes from ASHRAE's wet-bulb equation (eq. 35, or eq. 37 with ice on the wick below 32 °F) and p<sub>w</sub> = p × W ÷ (0.621945 + W). The dew point is the temperature at which p<sub>ws</sub> equals p<sub>w</sub>, solved exactly. These are the same exact ASHRAE psychrometrics as the [psychrometric calculator](/psychrometric-chart-calculator), and they hold below freezing too. Pressures are converted from psia to kPa by 6.89476. The 2025 Handbook replaces the Hyland-Wexler saturation pressure with the IAPWS formulations (IAPWS-IF97 over water, IAPWS 2008 over ice); from −20 to 150 °F the two agree within 0.03 %, so the results are unchanged at the precision shown.

**Example:** a grow room at 77 °F and 55 % RH, with leaves at 75 °F. The saturation vapor pressure at 77 °F is 3.169 kPa. The vapor pressure in the air is 0.55 × 3.169 = 1.743 kPa, so the air VPD is 3.169 − 1.743 = 1.43 kPa. The saturation pressure at the 75 °F leaf is 2.965 kPa, so the leaf VPD is 2.965 − 1.743 = 1.22 kPa. The dew point is 59.6 °F and the wet bulb 65.6 °F.

For target VPD ranges by crop and growth stage, see the [VPD chart from Perfect Grower](https://www.perfectgrower.com/knowledge/knowledge-base/vpd-chart-vapor-pressure-deficit/).

