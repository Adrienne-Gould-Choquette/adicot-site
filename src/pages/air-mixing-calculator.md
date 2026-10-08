---
layout: layouts/page.njk
title: "Air Mixing Calculator"
seoTitle: "Air Mixing Calculator | adicot.com"
description: "Calculate the mixed air temperature of two or three airstreams, in US or metric units."
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

The mixed air dry bulb of three air streams is the flow-weighted mean of their dry bulbs:

**T<sub>MA</sub> = (T<sub>1</sub> × Q<sub>1</sub> + T<sub>2</sub> × Q<sub>2</sub> + T<sub>3</sub> × Q<sub>3</sub>) ÷ (Q<sub>1</sub> + Q<sub>2</sub> + Q<sub>3</sub>)**

Wet bulb does not mix that way. Moisture mixes by humidity ratio (W, the mass of water vapor per mass of dry air), so the calculator finds each stream's humidity ratio from its dry bulb and wet bulb, takes their flow-weighted mean in the same way, and then solves for the wet bulb at the mixed dry bulb and mixed humidity ratio:

**W<sub>MA</sub> = (W<sub>1</sub> × Q<sub>1</sub> + W<sub>2</sub> × Q<sub>2</sub> + W<sub>3</sub> × Q<sub>3</sub>) ÷ (Q<sub>1</sub> + Q<sub>2</sub> + Q<sub>3</sub>)**

Where:

- **T<sub>MA</sub>**: the mixed air dry bulb, °F (°C)
- **T<sub>#</sub>**: the dry bulb of each air stream, °F (°C)
- **W<sub>MA</sub>, W<sub>#</sub>**: the humidity ratio of the mix and of each stream, lb/lb (kg/kg)
- **Q<sub>#</sub>**: the flow rate of each air stream, CFM (l/s)

The humidity ratios and the mixed wet bulb use the psychrometric equations of the ASHRAE Handbook—Fundamentals, chapter 1, at sea-level pressure (14.696 psia). Weighting by volume flow rather than by mass of dry air is the usual simplification for ventilation and air conditioning; the difference is small at these temperatures. If the mix lands past saturation (cold air mixed with very humid air), some of the moisture condenses as fog, and the calculator reports the saturated temperature the mix settles at.

**Example:** calculate the mixed air temperature of three air streams:

- Outdoor air: 150 CFM at 91 °F dry bulb / 77 °F wet bulb
- Return air: 1,550 CFM at 75 °F dry bulb / 62.3 °F wet bulb
- Bypass air: 300 CFM at 55 °F dry bulb / 54.5 °F wet bulb

Dry bulb mixed air temperature:

T<sub>MA,DB</sub> = (91 °F × 150 CFM + 75 °F × 1,550 CFM + 55 °F × 300 CFM) ÷ (150 CFM + 1,550 CFM + 300 CFM) = 73.20 °F dry bulb

Humidity ratio of each stream, from its dry bulb and wet bulb: outdoor air 0.01678 lb/lb, return air 0.00907 lb/lb, bypass air 0.00891 lb/lb.

W<sub>MA</sub> = (0.01678 × 150 CFM + 0.00907 × 1,550 CFM + 0.00891 × 300 CFM) ÷ 2,000 CFM = 0.00962 lb/lb (67.4 gr/lb)

At 73.20 °F dry bulb and 0.00962 lb/lb, the mixed air wet bulb is 62.51 °F. Averaging the wet bulbs directly would give 62.23 °F, about 0.3 °F low.
