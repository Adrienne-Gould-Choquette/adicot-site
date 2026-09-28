---
layout: layouts/page.njk
title: "Ohm's Law with Power Calculator"
seoTitle: "Ohm's Law With Power Calculator | adicot.com"
description: "Uses Ohm's law to calculate voltage, current, resistance and power. Enter any two values and the calculator solves the rest."
permalink: /ohms-law-with-power-calculator.html
ogImage: "/images/0179db_4f1773b436ed4802b59090e1fe686e44~mv2.jpg"
calcInclude: "partials/calc-ohms.njk"
calculatorName: "Ohm's Law with Power Calculator"
pageModule: calc-ohms.js
calcSource: "Ohms Law with Power Calculator V2.3"
---

![Image showing Ohms Law Equations](/images/0179db_f71c1287522e4378b13876ad57d02c30~mv2.jpg)

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then enter exactly two of:

- **Voltage (V):** the line-to-line or line-to-neutral voltage, in volts.
- **Current (I):** the circuit load current, in amperes.
- **Resistance (R):** the measured or expected resistance, in ohms.
- **Power (P):** the total load power, in watts.

The calculator determines the other two quantities from Ohm's law and the power law, and updates as you type.

**Important:** enter only two values at a time; with three or more the results would not be consistent. Values must be greater than zero, since HVAC electrical loads are treated as real, resistive and unidirectional.

## Methodology

This calculator determines electrical power, voltage, current and resistance for HVAC systems, motors and control circuits. These calculations are fundamental to electrical load design, equipment selection and safety verification for air-handling units (AHUs), compressors and fans.

Ohm's law defines the linear relationship between voltage (V), current (I) and resistance (R):

**V = I × R**

When power (P) is introduced, the set of equations expands to:

**P = V × I = I² × R = V² ÷ R**

These formulas let engineers size conductors, verify breaker ratings and calculate the heat output of resistive HVAC elements.

### Calculation methods

Depending on which two quantities are known, the calculator applies:

| Known values | Calculations performed |
|---|---|
| Voltage (V), current (I) | P = V × I, R = V ÷ I |
| Voltage (V), resistance (R) | I = V ÷ R, P = V × I |
| Voltage (V), power (P) | I = P ÷ V, R = V ÷ I |
| Current (I), resistance (R) | V = I × R, P = V × I |
| Current (I), power (P) | V = P ÷ I, R = V ÷ I |
| Power (P), resistance (R) | I = √(P ÷ R), V = I × R |

### Worked example

**Given:** a 208-volt electric duct heater rated at 4,500 watts. Find the operating current and resistance.

- I = P ÷ V = 4,500 ÷ 208 = 21.63 amps
- R = V ÷ I = 208 ÷ 21.63 = 9.61 ohms

This matches standard calculations for single-phase resistive HVAC loads, such as electric coils or reheat elements.

### References

- National Fire Protection Association (NFPA). NFPA 70: National Electrical Code (NEC), 2026 edition.
- ASHRAE. Standard 90.1-2025: Energy Standard for Sites and Buildings Except Low-Rise Residential Buildings.
