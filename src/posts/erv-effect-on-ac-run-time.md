---
layout: layouts/post.njk
title: "Effect of ERV on AC Run Time"
seoTitle: "Effect of ERV on AC Run Time"
description: "How to calculate what an ERV does to air-conditioner run time, step by step, with the Psychrometric Chart 2-Condition Calculator and a worked example."
date: 2023-08-20T03:07:47.010Z
permalink: /post/erv-effect-on-ac-run-time.html
ogImage: "/images/0179db_bfee65eeb17c497d81dfac22d7f649a7~mv2.png"
categories: ["erv", "psychrometric-chart"]
forCalculator: /psychrometric-chart-2-condition
---

My colleague and I had a recent discussion about his ongoing project. We focused on figuring out how adding an Energy Recovery Ventilator (ERV) to treat ventilation air impacts the run time of air conditioning equipment. To answer this, we used adicot.com's [Psychrometric Chart 2-Condition Calculator](/psychrometric-chart-2-condition) and the methodology shown below to compare equipment run times with untreated ventilation air versus ventilation air treated by an ERV. The results showed an impressive 25% reduction in equipment run time due to the ERV implementation. You'll find the details of our approach in the following section.

To solve this problem, we assumed the following will be given:

Given:

- Equipment Cooling Capacity [BTU/h] provided by the manufacturer

- ASHRAE Outside air design temperatures (Dry bulb and wet bulb) [°F]

- Coil Leaving Air Temperatures (Dry bulb and wet bulb) [°F] provided by the manufacturer

- Ventilation air volume [cfm] per ASHRAE 62.1 or the building code

Procedure:

- Calculate the Ventilation Air Total Cooling Load [BTU/h] (Psychrometric Chart 2-Condition Calculator)

- Run time = Ventilation load/Equipment Capacity x 60 min [min]

Example:

- Equipment Cooling Capacity: 2.50 tons or 30,000 BTU/h

- Outside air temperatures in Boston, MA: 88 °F / 72 °F

- Coil Leaving Air Temperatures: 55 °F / 54.9 °F

- Ventilation air volume: 100 CFM

- Calculate the total load of ventilation air using Psychrometric Chart 2-Condition Calculator where:

- Entering Conditions are outside air design temperatures

- Exiting Conditions are coil-leaving air temperatures

Ventilation Air Total Cooling Load = 5,274 BTU/h

- Run time = 5,274 BTU/h / 30,000 BTU/h x 60 min/hr = 11 minutes/hour to condition the ventilation air

Adding an ERV:
Replace outside air temperature with the ERV leaving air temperature (100 CFM @ 78 °F dry bulb, 68 °F wet bulb):

- Total Load: 3,940 BTU/h

- Run time: 8 minutes/hour to condition ventilation air

The results show the effect of an ERV on AC equipment run time is significant and that adding an ERV reduces the equipment run time caused by ventilation air by 25%.

Let us know how you use our Adicot Calculators
