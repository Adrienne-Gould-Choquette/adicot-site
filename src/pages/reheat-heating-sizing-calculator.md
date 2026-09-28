---
layout: layouts/page.njk
title: "Reheat/Heating Sizing Calculator"
seoTitle: "Reheat/Heating Sizing Calculator | adicot.com"
description: "Enter the airflow and the entering and leaving coil temperatures to size the reheat coil capacity."
permalink: /reheat-heating-sizing-calculator.html
ogImage: "/images/0179db_bfa34710152540b78d1cfcfce23e0fe7~mv2.png"
calcInclude: "partials/calc-reheat.njk"
calculatorName: "Reheat Coil Sizing Calculator"
pageModule: calc-reheat.js
calcSource: "Reheat Coil Sizing Calculator V1.4"
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Choose US (cfm, °F) or Metric (l/s, °C) units. Switching converts the values already entered.
2. Enter the reheat coil airflow, CFM (l/s).
3. Enter the leaving reheat coil temperature, °F (°C).
4. Enter the entering reheat coil temperature, °F (°C).
5. The heating coil capacity appears in Btu/h, kW and W, and updates as you type.

**Note:** for reheat coil sizing calculations, the leaving coil temperature is customarily set to the room heating setpoint, and the entering coil temperature is customarily set to the cooling coil leaving air temperature. To convert the capacity to other units, use the [kW, HP, Btu/h, ton, lbf/h converter](/power-unit-converter).

## Methodology and equations

In air conditioning, "reheat" refers to heating the air after the air conditioning system has cooled it. The purpose of reheating is to control the temperature and humidity in a conditioned space more precisely. After the air has been cooled, it passes through a reheat coil, where it is reheated to the desired temperature. The reheat coil is typically an electric heater or a hot water coil. By adding heat back into the air, the system can achieve a more comfortable humidity level while maintaining the desired temperature.

Reheat is particularly useful in humid climates, or where precise control of humidity is required, such as in laboratories, data centers or specific industrial processes.

**Heating Coil Capacity = 1.0882 × Q × (T<sub>Entering</sub> − T<sub>Leaving</sub>)**

Where:

- **Q**: airflow, CFM (l/s)
- **T<sub>Entering</sub>**: entering coil temperature, °F (°C)
- **T<sub>Leaving</sub>**: leaving coil temperature, °F (°C)

**Example:** calculate the reheat coil capacity needed for a 7.5-ton unit (3,000 CFM). The room heating setpoint is 70 °F and the cooling coil leaving air temperature is 52 °F.

As the note above says, the leaving coil temperature is customarily set to the room heating setpoint and the entering coil temperature to the cooling coil leaving air temperature.

Reheat coil capacity = 1.0882 × 3,000 CFM × (52 °F − 70 °F) = −58,762.80 Btu/h (the negative value denotes heating)

This can be converted to kilowatts using 1 kW = 3,412.14163 Btu/h:

−58,762.80 Btu/h × 1 kW / 3,412.14163 Btu/h = −17.22 kW (the negative value denotes heating)
