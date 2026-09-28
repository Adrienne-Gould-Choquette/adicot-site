---
layout: layouts/page.njk
title: "Condensate Converter"
seoTitle: "Condensate Converter | adicot.com"
description: "Convert condensate and moisture between latent Btu/h, kW, pints per day, gallons per hour and liters per hour."
permalink: /condensate-converter.html
ogImage: "/images/0179db_daaf359141154a97b8f87493967aaae2~mv2.png"
calcInclude: "partials/calc-condconv.njk"
calculatorName: "Condensate Converter"
pageModule: calc-condconv.js
calcSource: "Condensate Converter V1.3"
---

This converter converts moisture measurement units, such as latent Btu/h and kW, pints per day, gallons per hour and liters per hour.

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Enter the value to convert.
2. Choose its unit: Btu/h, watts, kW, pints per day, gallons per hour, liters per hour or pounds per hour.
3. The value appears in every unit in the results, and updates as you type.

To find how much condensate a coil or dehumidifier produces in the first place, use the [condensate calculator](/condensate-calculator).

## Methodology

The converter uses these relationships:

- Btu/h = pints/day × 1.04 lb/pint ÷ 24 h/day × 1,055 Btu/lb
- 1 kW = 3,412.142 Btu/h
- 1 kW = 1,000 W
- 1 gallon = 8 pints = 3.78541 liters
- 1 gallon of water = 8.34 lb

**Example:** a dehumidifier removing 70 pints of water per day removes 70 × 1.04 ÷ 24 × 1,055 = 3,200.17 Btu/h of latent heat, or 0.94 kW. That is 70 ÷ 8 ÷ 24 = 0.3646 gallons per hour.
