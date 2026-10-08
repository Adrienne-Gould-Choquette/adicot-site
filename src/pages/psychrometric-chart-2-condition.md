---
layout: layouts/page.njk
title: "Psychrometric Chart 2-Condition Calculator"
seoTitle: "Psychrometric Chart 2 Condition Calculator | adicot.com"
description: "Enter two air conditions to calculate total, sensible and latent cooling, condensate generated, and the psychrometric properties of each."
permalink: /psychrometric-chart-2-condition.html
ogImage: "/images/0179db_86988a0ffbdc46cd911c2528adc865ab~mv2.jpg"
calcInclude: "partials/calc-psych.njk"
calculatorName: "Psychrometric Chart 2-Condition Calculator"
pageModule: calc-psych.js
calcSource: "Psychrometric 2 Condition V1.1"
psychStates: 2
psychKind: coil
---


Instructions:

- Review the methodology below to ensure it aligns with your project's requirements.

- Select Metric or US units

- For the entering air and the leaving air, choose under Given which pair of properties you know: dry bulb and wet bulb, dry bulb and relative humidity, dry bulb and dew point, or dew point and relative humidity. The two can differ, for example an RH entering and a dew point leaving.

- Enter the two values for each.

- Enter the air flow rate (at the entering air) to calculate the total, sensible and latent cooling, the sensible heat ratio, the condensate generated and the airflow per ton.

- Enter the project's altitude.

- The results update as you type.

For a single condition, use our [psychrometric chart calculator](/psychrometric-chart-calculator).

Methodology:

The following formulas are used in this calculator. They have been adapted from the 2021 ASHRAE Handbook -Fundamentals.

p = 14.696 (1-6.8754 x 10^(-6)Z)^5.2559

t = 59 - 0.00356620Z

For 32 °F < t < 707.103 °F:

p,ws = 145.03774 (2C / (-B + (B^2 - 4AC)^0.5))^4

See ASHRAE Handbook-Fundamentals for Coefficient Values, A, B, and C.

W = Mw / Mda

RH% = (p,w / p,s) × 100

v = 0.370486 (t,db + 459.67)(1 + 1.607858 W) / p

h = 0.240 t + W(1061 + 0.444t)

p,w = p x W / (0.621945 + W )

where

h = specific enthalpy [Btu/lb,da]

p = barometric pressure [psia]

p,w = water vapor partial pressure [psia]

p,s = saturation water vapor pressure [psia]

p,ws = saturation pressure [psia]

t = temperature [°F]

T,d = dew point temperature [°F]

t,db = dry bulb temperature [°F]

t,wb = wet bulb temperature [°F]

v = specific volume [ft^3/lb,da]

W = humidity ratio [lb,w / lb,da]

Z = Altitude [ft]

## How the calculator solves

Every property comes from the 2021 ASHRAE Handbook—Fundamentals, chapter 1, with no curve fits. Saturation pressure uses the Hyland-Wexler equations (5 and 6), over ice below 32 °F and over water above. Humidity ratio comes from the wet bulb by equation 35 (or 37 when the wet bulb is below freezing), or directly from the vapor pressure when the RH or the dew point is given. Dew point and wet bulb are solved exactly: the dew point starts from ASHRAE's equation 39 or 40 and is refined by Newton's method until it matches the saturation pressure, and the wet bulb is solved from equation 35 or 37 the same way. Altitude sets the atmospheric pressure by equation 3. The 2025 Handbook replaces the Hyland-Wexler saturation pressure with the IAPWS formulations (IAPWS-IF97 over water, IAPWS 2008 over ice); from −20 to 150 °F the two agree within 0.03 %, so the results are unchanged at the precision shown.

## Cooling loads

The loads use the exact method of the ASHRAE Handbook—Fundamentals, chapter 1 ("Moist Air Cooling and Dehumidification"), rather than the standard-air factors 1.08 and 0.68, so they follow the actual density of the air at its temperature, humidity and altitude. The coil selection calculator uses the same method, so the two agree.

m = CFM x 60 / v_enter (lb of dry air per hour; the airflow is at the entering air)

Total: Q_t = m x [(h_enter - h_leave) - (W_enter - W_leave) x (t_leave - 32)], the last term being the heat carried off by the condensate, which leaves at the leaving dry bulb

Sensible: Q_s = m x (0.240 + 0.444 W_leave) x (t_enter - t_leave)

Latent: Q_L = Q_t - Q_s; sensible heat ratio = Q_s / Q_t; airflow per ton = CFM / (Q_t / 12,000)

Condensate: m x (W_enter - W_leave), in pints per day at 1.04 lb per pint, as the condensate calculator.

For example, 1,000 cfm cooled from 80 °F dry bulb, 67 °F wet bulb to 55 °F dry bulb, 54 °F wet bulb at sea level gives 38,212 Btu/h total: 26,409 sensible and 11,803 latent. The standard-air shortcuts give about 2 to 5 % more (39,080 Btu/h by 1.08 and 0.68, 39,954 by 4.5 and the enthalpy difference), because 80 °F air is lighter than standard air.
