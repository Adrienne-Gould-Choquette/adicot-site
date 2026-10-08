---
layout: layouts/page.njk
title: "Condensate Pump Size Calculator"
seoTitle: "Condensate Pump Sizing Calculator (GPH & Head) | adicot.com"
description: "Size a condensate pump: calculate or enter the coil condensate, then list the pumps that lift it to your head height at your voltage."
permalink: /condensate-pump-size-calculator.html
ogImage: "/images/0179db_8a3c073eff1944b8988b88b768d4de3c~mv2.jpg"
calcInclude: "partials/calc-condensate-pump.njk"
calculatorName: "Condensate Pump Size Calculator"
pageModule: calc-condensate-pump.js
calcSource: "Condensate Pump Specifier V5.3"
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Choose US or metric units. Switching converts the values you have entered.
2. Give the condensate flow: either calculate it from the coil's entering and leaving dry-bulb and wet-bulb temperatures and its airflow, or enter it directly.
3. Choose the application (the kind of equipment the pump serves) and the voltage available.
4. Enter the head height: the vertical lift from the pump to the highest point of the discharge line.
5. The best-fit pump appears in the results: the one with the smallest rated flow at that head that still delivers the condensate flow, with its flow at the head and its largest rated flow. When several models share that rating (the same pump with options such as a safety switch or tubing), all of them are listed.

Use **Copy link to these results** to save or share the selection.

## Methodology

### Condensate generated

The condensate is the moisture the coil removes from the air:

**Condensate (lb/h) = Airflow (cfm) × 60 ÷ v × (W<sub>entering</sub> − W<sub>leaving</sub>) ÷ 7000**

where v is the specific volume of the entering air (ft³/lb) and W the humidity ratio in grains per pound, each from the dry-bulb and wet-bulb temperatures and the altitude, using the ASHRAE Handbook—Fundamentals psychrometric equations. One gallon of condensate weighs about 8.345 lb, so gph = lb/h × 0.11983. This is the same calculation as our [condensate calculator](/condensate-calculator).

### Pump selection

A pump suits the job when it is made for the application and the voltage, and its flow at the head height is at least the condensate flow. Manufacturers rate condensate pumps at a few heads only, so between those heads the calculator takes the pump's flow at the next higher listed head, which is conservative. Above a pump's highest listed head it is not rated, and is not listed.

Condensate pumps run on a float switch: the pump starts when the reservoir fills and stops when it empties. A pump with more capacity than the condensate simply runs for shorter periods, so any larger pump would also work. The calculator shows only the smallest pump that does the job, since it is usually the quietest and least expensive, and says how many larger pumps also fit.

### Example

A coil cooling 1,200 cfm from 80 °F dry bulb, 67 °F wet bulb to 55 °F dry bulb, 54 °F wet bulb, at sea level, makes about 13.2 lb/h, or 1.6 gph, of condensate (the calculator's starting values). For an air conditioner at 115 V with a 10 ft lift, 12 Little Giant pumps qualify, and the best fit is the VCMA-15 at 25 gph at 10 ft, sold as four models (VCMA-15UL, -15ULS, -15ULST and -15ULT). The VCL-24 models are rated only up to 9 ft, so they drop out at a 10 ft lift.

## Notes

- The pump data are Little Giant's catalog ratings. Confirm the selection, the reservoir size and any safety-switch wiring with the manufacturer's data.
- Size the discharge line and allow for its friction: long or small-diameter tubing adds to the effective head.
- Hi-temperature models are for plenum applications and condensing appliances with hot condensate; check the maximum liquid temperature for your equipment.
