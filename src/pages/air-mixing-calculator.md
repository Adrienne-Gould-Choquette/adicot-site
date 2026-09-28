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
2. Enter the outdoor air flow and its dry bulb and wet bulb temperatures. The [ASHRAE climate data](https://ashrae-meteo.info/v3.0/) link gives the design conditions for your exact location.
3. Enter the return air flow and its dry bulb and wet bulb temperatures.
4. Optionally, enter a third air stream, such as bypass air, with its flow and temperatures.
5. The total air flow and the mixed air dry bulb and wet bulb appear in the results and update as you type.

## Methodology, equations and example

In HVAC, air mixing involves blending different air streams to achieve a desired temperature, humidity and air quality. Supply, return and outdoor air are combined to create a uniform mixture. Air mixing methods include mixing boxes, diffusers, grilles and the Venturi effect. Benefits include improved comfort, better indoor air quality and energy efficiency: mixing ensures uniform conditions, dilutes pollutants and reduces energy consumption.

This calculator can also include a third air stream. An example of a third air stream is a bypass air duct that goes from the supply air plenum back to the return air plenum. Trane has an excellent Engineers Newsletter describing dehumidification with constant-volume systems, which discusses the mixed-air bypass method of dehumidification:

> "Simple and inexpensive, this option blends cold, dry air leaving the cooling coil with warm, moist, mixed air (return air and outdoor air) to achieve the proper supply-air temperature."

The equation for the mixed air temperature of three air streams is:

**T<sub>MA</sub> = (T<sub>1</sub> × Q<sub>1</sub> + T<sub>2</sub> × Q<sub>2</sub> + T<sub>3</sub> × Q<sub>3</sub>) ÷ (Q<sub>1</sub> + Q<sub>2</sub> + Q<sub>3</sub>)**

Where:

- **T<sub>MA</sub>**: the dry bulb or wet bulb mixed air temperature, °F (°C)
- **T<sub>#</sub>**: the dry bulb or wet bulb temperature of each air stream, °F (°C)
- **Q<sub>#</sub>**: the flow rate of each air stream, CFM (l/s)

**Example:** calculate the mixed air temperature of three air streams:

- Outdoor air: 150 CFM at 91 °F dry bulb / 77 °F wet bulb
- Return air: 1,550 CFM at 75 °F dry bulb / 62.3 °F wet bulb
- Bypass air: 300 CFM at 55 °F dry bulb / 54.5 °F wet bulb

Dry bulb mixed air temperature:

T<sub>MA,DB</sub> = (91 °F × 150 CFM + 75 °F × 1,550 CFM + 55 °F × 300 CFM) ÷ (150 CFM + 1,550 CFM + 300 CFM) = 73.20 °F dry bulb

Wet bulb mixed air temperature:

T<sub>MA,WB</sub> = (77 °F × 150 CFM + 62.3 °F × 1,550 CFM + 54.5 °F × 300 CFM) ÷ (150 CFM + 1,550 CFM + 300 CFM) = 62.23 °F wet bulb
