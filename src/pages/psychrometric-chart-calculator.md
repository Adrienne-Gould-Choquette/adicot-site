---
layout: layouts/page.njk
title: "Psychrometric Chart Calculator"
seoTitle: "Psychrometric Chart Calculator | adicot.com"
description: "Enter two of dry bulb, wet bulb, dew point and RH% to get enthalpy, specific volume, humidity ratio and the other psychrometric properties."
permalink: /psychrometric-chart-calculator.html
ogImage: "/images/0179db_1a1558ad7d1b48689cdf12ae77dd36c1~mv2.png"
calcInclude: "partials/calc-psych.njk"
calculatorName: "Psychrometric Chart Calculator"
pageModule: calc-psych.js
calcSource: "Psycrometric V3.5"
---


For two conditions, with cooling loads and condensate, use the [psychrometric chart 2-condition calculator](/psychrometric-chart-2-condition).
![Psychrometric Chart](/images/0179db_3385faa561c848dc92d05eb61a780d0d~mv2.jpg)

Instructions:

- Review the methodology below to ensure it aligns with your project's requirements.

- Select Metric or US units

- Under Given, choose which pair of properties you know: dry bulb and wet bulb, dry bulb and relative humidity, dry bulb and dew point, or dew point and relative humidity.

- Enter the two values.

- Enter the project's altitude

- The results update as you type.

* Temperature, Wet Bulb, is only available as an input when the first input is Temperature, Dry Bulb

Methodology, Equations, and Examples:

Psychrometrics studies the thermodynamic and physical properties of air and its mixtures with water vapor. It focuses on understanding and analyzing the relationships between temperature, humidity, pressure, and other properties of moist air. Psychrometry is essential in various fields, including HVAC (Heating, Ventilation, and Air Conditioning), meteorology, and industrial processes that involve air and humidity control.

Psychrometrics is used by professionals in several fields, including HVAC Engineers and Technicians. Psychrometrics is crucial for designing and sizing HVAC systems, as it helps determine heating and cooling loads, air conditioning requirements, and indoor air quality considerations. Architects consider psychrometric properties when designing buildings to ensure proper ventilation, temperature control, and occupant comfort. Meteorologists utilize psychrometrics to understand weather patterns, study humidity effects on precipitation, and make weather forecasts. Various industrial processes, such as drying, cooling, and humidification, rely on psychrometric analysis to control and optimize air and moisture levels.



The following psychrometric chart equations and terms have been adapted from the ASHRAE Fundamentals Handbook (I-P Edition), Chapter 1, Psychrometrics, https://handbook.ashrae.org/Handbook.aspx.



- Dry-bulb Temperature, Tdb: The temperature of the air as measured by a standard thermometer. It represents the sensible heat component of the air. When reading a psychrometric chart, it is the horizontal axis at the bottom of the chart.

- Wet-bulb Temperature, Twb: The temperature measured by a thermometer with its bulb covered in a wet wick exposed to moving air. It is used to determine the humidity and adiabatic saturation properties of air. When reading a psychrometric chart, it is the diagonal line that intersects the curved leftmost line.

- Dew-point Temperature, Tdp: The measure of the dry-bulb temperature at the point that water vapor starts to condense to liquid or be removed from the air. Dew Point Temperature is also referred to as the condensation point because it is the temperature at which the water turns to liquid from vapor in the airstream. When reading a psychrometric chart, it is the horizontal line that intersects the curved leftmost line.

The dewpoint temperature is the temperature at which the humidity ratio is equal to the humidity ratio at saturation:

Ws (p, td) = W

- Relative Humidity, RH%: The ratio of water vapor in the air to the maximum amount of water vapor the air can hold at a given temperature. It is expressed as a percentage.

The equation to calculate relative humidity is:

RH% = pw / ps × 100

where:

pw = water vapor partial pressure at the total pressure, p, and dew-point temperature, Temperature,dp

ps = saturation water vapor partial pressure at the pressure, p, and the dry-bulb temperature, Temperature,db

- Specific Volume: The volume occupied by a unit mass of moist air. It is the reciprocal of the air density. When reading a psychrometric chart, the specific volume lines are the steep diagonal lines that slope down to the right.

- Specific Enthalpy, h: The total energy content per unit mass of moist air. It takes into account both the sensible and latent heat components. When reading a psychrometric chart, the specific enthalpy is the diagonal line intersecting the leftmost straight line.

- Humidity Ratio, W: The mass of water vapor present per unit mass of dry air. Also known as the moisture content or specific humidity. When reading a psychrometric chart, it is the horizontal line that intersects the right axis of the chart. It is commonly measured in units of pounds of moisture per pound of dry air (lbmoisture / lbdry-air ), grains of moisture per pound of dry air (grains / lbdry -air), and grams per kg (g/kg). Note that there are 7000 grains of moisture per pound of moisture.

To solve for humidity ratio, the calculations assume that moist air is a mixture of independent perfect gasses, water vapor and dry air:

Dry air: pda V = nda RT

Water Vapor: pw V = nw RT

Combining these two equations using the perfect gas equation: pV = nRT:

(pda + pw) V = (nda + nw) RT

Combining and rearranging the equations above:

xda = nda / n = (pda V / RT) / ((pda + pw) V / RT) = pda / (pda + pw) = pda / p

xw = nw / n = (pw V / RT) / ((pda + pw) V / RT) = pw / (pda + pw) = pw / p

The humidity ratio, W, is the ratio of the mass of water vapor to the mass of dry air:

W = Mw / Mda

which is equal to the molecular masses x the mole fraction ratio:

W = 18.015268 xw /(28.966 xda)

= 0.621945 xw / xda

Substitute pressure terms for mole fraction terms:

W = 0.621945 pw / pda

= 0.621945 pw / (p-pw)

where:

p - total pressure

pda - partial pressure of dry air

pw - partial pressure of water vapor

V - total volume of air

nda - number of moles of dry air

nw - number of moles of water vapor

R - universal gas constant, 1545.349 ft·lbf / (lbmol·°R)

T - absolute temperature, °R

Mw = mass of water vapor

Mda = mass of dry air

xw / xda= mole fraction of water vapor to dry air

- Specific Volume:, v Specific volume is the volume occupied by a unit mass of moist air. It is the reciprocal of the air density. It is often given in units of cubic feet per pound of dry air (ft^3 / lb,da) or cubic meter per kilogram of dry air (m^3 / kg,da). The formula for specific volume is derived from the ideal gas law:

v = 0.370486 (t + 459.67)(1 + 1.607858 W) / p

where t is the dry-bulb temperature [°F], W the humidity ratio [lb,w / lb,da] and p the total pressure [psia].

- Standard Atmospheric Pressure, Patm: The force per unit area exerted by the weight of the Earth's atmosphere on a given surface. It is commonly measured in units of pressure such as inches of mercury (in. Hg), pounds per square inch (psi), pascals (Pa), or millibars (mb).

Barometric pressure varies considerably with altitude as well as with local geographic and weather conditions. The equation to calculate pressure based on altitude is:

Patm = 14.696 [1 - 6.8754 x 10^(-6) Z]^5.2559 psia x 2.03602 in Hg / psi

where: z = Altitude [ft]

Example:

What is the atmospheric pressure at Mile High Stadium, which has an altitude of 5,280 ft?

Substitute Z = 5,280 ft into the Patm equation above:

Patm = 14.696 [1 - 6.8754 x 10^(-6) Z]^5.2559 psia x 2.03602 in Hg / psi

= 14.696 [1 - 6.8754 x 10^(-6) 5,280]^5.2559 psia x 2.03602 in Hg / psi

= 24.636 in Hg

- Standard Temperature, t: The standard temperature varies considerably with altitude and geographic and weather conditions. Temperature is assumed to decrease linearly with increasing altitude. The equation to calculate the standard temperature based on altitude is:

t = 59 - 0.00356620 Z

where: t = temperature [°F]

z = Altitude [ft]

Example:

What is the standard temperature at Mile High Stadium, which has an altitude of 5,280 ft?

Substitute Z = 5,280 ft into the t equation above:

t = 59 - 0.00356620 (5,280ft)

= 40.170 °F

- Saturation Vapor Pressure, pws (ps): The pressure exerted by water vapor when the air is saturated at a specific temperature. It represents the maximum moisture the air can hold at that temperature. Because the vapor pressure of water in saturated moist air differs negligibly from the saturation vapor pressure of pure water at the same temperature, the vapor pressure of water can be used in place of saturation pressure at atmospheric pressure, p.

The equation to solve for the vapor pressure of water in saturated moist air is:

ps = xws p

where:

xws - mole fraction of water vapor in saturated moist air at temperature, t, and pressure, p

p - total barometric pressure of moist air

- Partial Vapor Pressure: The portion of the total atmospheric pressure due to water vapor alone. It represents the pressure exerted by water vapor as a component of the air mixture.

## How the calculator solves

Every property comes from the 2021 ASHRAE Handbook—Fundamentals, chapter 1, with no curve fits. Saturation pressure uses the Hyland-Wexler equations (5 and 6), over ice below 32 °F and over water above. Humidity ratio comes from the wet bulb by equation 35 (or 37 when the wet bulb is below freezing), or directly from the vapor pressure when the RH or the dew point is given. Dew point and wet bulb are solved exactly: the dew point starts from ASHRAE's equation 39 or 40 and is refined by Newton's method until it matches the saturation pressure, and the wet bulb is solved from equation 35 or 37 the same way. Altitude sets the atmospheric pressure by equation 3. The 2025 Handbook replaces the Hyland-Wexler saturation pressure with the IAPWS formulations (IAPWS-IF97 over water, IAPWS 2008 over ice); from −20 to 150 °F the two agree within 0.03 %, so the results are unchanged at the precision shown.
