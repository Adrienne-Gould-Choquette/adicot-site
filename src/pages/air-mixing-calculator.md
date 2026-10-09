---
layout: layouts/page.njk
title: "Air Mixing Calculator"
seoTitle: "Air Mixing Calculator | adicot.com"
description: "Calculate the mixed air temperature of two or three airstreams, such as outside air and return air, from each airflow and temperature, in US or metric units."
permalink: /air-mixing-calculator.html
ogImage: "/images/0179db_703073c0a2d649cf925bf9638205e916~mv2.png"
calcInclude: "partials/calc-mixair.njk"
calculatorName: "Air Mixing Calculator"
pageModule: calc-mixair.js
calcSource: "Mixed Air Calculator V1.6"
---

![Air Mixing Image](/images/0179db_f708369f256b49e09476a12e41b225c7~mv2.jpg)

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Choose US (cfm, °F) or SI (l/s, °C) units. Switching converts the values already entered.
2. Enter the outdoor air flow and its dry bulb and wet bulb temperatures. The [ASHRAE climate data](https://ashrae-meteo.info/v3.0/) link gives the design conditions for your exact location. Open "How to find this on the ASHRAE site" under the outdoor air fields for the steps and the values to read.
3. Enter the return air flow and its dry bulb and wet bulb temperatures.
4. Optionally, enter a third air stream, such as bypass air, with its flow and temperatures.
5. The total air flow, the mixed air dry bulb and wet bulb, and the mixed humidity ratio appear in the results and update as you type.

## Methodology, equations and example

In HVAC, air mixing involves blending different air streams to achieve a desired temperature, humidity and air quality. Supply, return and outdoor air are combined to create a uniform mixture. Air mixing methods include mixing boxes, diffusers, grilles and the Venturi effect. Benefits include improved comfort, better indoor air quality and energy efficiency: mixing ensures uniform conditions, dilutes pollutants and reduces energy consumption.

This calculator can also include a third air stream. An example of a third air stream is a bypass air duct that goes from the supply air plenum back to the return air plenum. Trane has an excellent Engineers Newsletter describing dehumidification with constant-volume systems, which discusses the mixed-air bypass method of dehumidification:

> "Simple and inexpensive, this option blends cold, dry air leaving the cooling coil with warm, moist, mixed air (return air and outdoor air) to achieve the proper supply-air temperature."

The calculator mixes the streams the way the ASHRAE Handbook—Fundamentals, chapter 1, describes adiabatic mixing of moist air. Mixing keeps the mass of dry air, the water vapor and the energy of the streams. So each stream's air flow is first converted to a mass flow of dry air, and the mix's humidity ratio and enthalpy are the mass-weighted averages of the streams':

**m<sub>#</sub> = Q<sub>#</sub> ÷ v<sub>#</sub>**

**W<sub>MA</sub> = (m<sub>1</sub> × W<sub>1</sub> + m<sub>2</sub> × W<sub>2</sub> + m<sub>3</sub> × W<sub>3</sub>) ÷ (m<sub>1</sub> + m<sub>2</sub> + m<sub>3</sub>)**

**h<sub>MA</sub> = (m<sub>1</sub> × h<sub>1</sub> + m<sub>2</sub> × h<sub>2</sub> + m<sub>3</sub> × h<sub>3</sub>) ÷ (m<sub>1</sub> + m<sub>2</sub> + m<sub>3</sub>)**

**T<sub>MA</sub> = (h<sub>MA</sub> − 1,061 × W<sub>MA</sub>) ÷ (0.240 + 0.444 × W<sub>MA</sub>)**

Where:

- **Q<sub>#</sub>**: the flow rate of each air stream, CFM (l/s)
- **v<sub>#</sub>**: the specific volume of each stream, ft³ per lb of dry air, from its dry bulb and humidity ratio
- **m<sub>#</sub>**: the mass flow of dry air in each stream, lb/min
- **W<sub>MA</sub>, W<sub>#</sub>**: the humidity ratio of the mix and of each stream (the mass of water vapor per mass of dry air), lb/lb, from each stream's dry bulb and wet bulb
- **h<sub>MA</sub>, h<sub>#</sub>**: the enthalpy of the mix and of each stream, Btu per lb of dry air
- **T<sub>MA</sub>**: the mixed air dry bulb, °F

The mixed air wet bulb is then solved from T<sub>MA</sub> and W<sub>MA</sub>. Every property uses the chapter's psychrometric equations at sea-level pressure (14.696 psia); metric inputs are converted to these units and back. Averaging the dry bulbs and wet bulbs by flow, as a quick hand estimate does, is close for the dry bulb but not exact, and wet bulb does not mix linearly at all. If the mix lands past saturation (cold air mixed with very humid air), some of the moisture condenses as fog, and the calculator reports the saturated temperature the mix settles at.

**Example:** calculate the mixed air conditions of three air streams:

- Outdoor air: 150 CFM at 91 °F dry bulb / 77 °F wet bulb
- Return air: 1,550 CFM at 75 °F dry bulb / 62.3 °F wet bulb
- Bypass air: 300 CFM at 55 °F dry bulb / 54.5 °F wet bulb

Each stream's properties, from its dry bulb and wet bulb:

| Stream | W, lb/lb | v, ft³/lb | m = Q ÷ v, lb/min | h, Btu/lb |
|---|---|---|---|---|
| Outdoor air | 0.016782 | 14.257 | 10.52 | 40.324 |
| Return air | 0.009069 | 13.676 | 113.34 | 27.924 |
| Bypass air | 0.008912 | 13.161 | 22.79 | 22.873 |

The total dry air is 146.65 lb/min, so:

W<sub>MA</sub> = (10.52 × 0.016782 + 113.34 × 0.009069 + 22.79 × 0.008912) ÷ 146.65 = 0.009598 lb/lb (67.2 gr/lb)

h<sub>MA</sub> = (10.52 × 40.324 + 113.34 × 27.924 + 22.79 × 22.873) ÷ 146.65 = 28.029 Btu/lb

T<sub>MA</sub> = (28.029 − 1,061 × 0.009598) ÷ (0.240 + 0.444 × 0.009598) = 73.06 °F dry bulb

At 73.06 °F dry bulb and 0.009598 lb/lb, the mixed air wet bulb is 62.43 °F. Averaging by flow instead would give 73.20 °F dry bulb and 62.23 °F wet bulb.
