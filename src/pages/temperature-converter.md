---
layout: layouts/page.njk
title: "Temperature Converter"
seoTitle: "Temperature Converter: °F, °C, K, °R | adicot.com"
description: "Convert a temperature between Fahrenheit, Celsius, Kelvin and Rankine, with the formulas for each conversion and a worked example."
permalink: /temperature-converter.html
ogImage: "/images/0179db_e4c4c1443c43426f8d1b7a7e1be5b017~mv2.png"
calcInclude: "partials/calc-temperature.njk"
calculatorName: "Temperature Converter"
pageModule: calc-temperature.js
calcSource: "Temp Converter V1.2"
---

## How to use it

1. Enter the known temperature.
2. Choose the scale it is in: Fahrenheit, Celsius, Kelvin or Rankine.
3. The same temperature appears in all four scales in the results table, and updates as you type.

Use **Copy link to this result** to save or share the conversion. The link reopens the converter with the same temperature and scale.

## Conversion formulas

Adicot's temperature converter converts a temperature from one scale to another, between the Fahrenheit, Celsius, Rankine and Kelvin scales. Every conversion is exact.

| To | From Celsius | From Fahrenheit | From Kelvin | From Rankine |
|---|---|---|---|---|
| **°F** | °F = °C × 9/5 + 32 | — | °F = (K − 273.15) × 9/5 + 32 | °F = °R − 459.67 |
| **°C** | — | °C = (°F − 32) × 5/9 | °C = K − 273.15 | °C = (°R − 491.67) × 5/9 |
| **K** | K = °C + 273.15 | K = (°F − 32) × 5/9 + 273.15 | — | K = °R × 5/9 |
| **°R** | °R = °C × 9/5 + 491.67 | °R = °F + 459.67 | °R = K × 9/5 | — |

## Worked examples

**Convert to Fahrenheit.** Water freezes at 0 °C. What is the freezing point of water in °F?
°F = (0 °C × 9/5) + 32 = 32 °F

**Convert to Celsius.** Water boils at 212 °F. What is the boiling point of water in °C?
°C = (212 °F − 32) × 5/9 = 100 °C

**Convert to Rankine.** The temperature of the surface of the sun is 5,772 K. What is the equivalent temperature in Rankine, °R?
°R = 5,772 K × 9/5 = 10,389.6 °R

**Convert to Kelvin.** Absolute zero is 0 °R. What is absolute zero in Kelvin, K?
K = 0 °R × 5/9 = 0 K

## Common temperatures

<div class="table-scroll">
<table class="ref-table">
  <caption class="visually-hidden">Common temperatures in Fahrenheit, Celsius, Kelvin and Rankine</caption>
  <thead><tr><th scope="col"></th><th scope="col">°F</th><th scope="col">°C</th><th scope="col">K</th><th scope="col">°R</th></tr></thead>
  <tbody>
  {%- for r in temperatureTable %}
    <tr><th scope="row">{{ r.label }}</th><td>{{ r.F }}</td><td>{{ r.C }}</td><td>{{ r.K }}</td><td>{{ r.R }}</td></tr>
  {%- endfor %}
  </tbody>
</table>
</div>

## The four temperature scales

### Fahrenheit

The Fahrenheit temperature scale is used primarily in the United States and a few other countries. It is one of the four main temperature scales in common use; the others are Celsius, Kelvin and Rankine. Fahrenheit is the primary temperature scale used in the United States for everyday weather reports, indoor and outdoor temperature measurements, and personal reference. In countries that predominantly use the Fahrenheit scale, people are familiar with it for day-to-day temperature comparisons. Fahrenheit is often used in HVAC systems in the United States for temperature control and settings in homes, buildings and vehicles. Despite its prevalence in the United States, the Fahrenheit scale is less commonly used in most other parts of the world, where the Celsius scale is the standard for scientific and daily temperature measurements.

### Celsius

The Celsius temperature scale, also known as the centigrade scale, is used widely and in many countries around the world. It is one of the most common temperature scales and is based on the freezing and boiling points of water under standard atmospheric conditions. On the Celsius scale, the freezing point of water is 0 degrees Celsius (°C) and the boiling point of water is 100 °C. Celsius is commonly used in daily life to express air temperatures, weather forecasts and indoor temperatures. It is the standard temperature scale used in weather reports and daily temperature measurements in many countries. Celsius is frequently used in scientific research, particularly in fields like biology, chemistry and medicine, where it provides a practical and straightforward scale for most laboratory experiments and temperature-related studies. Celsius is part of the International System of Units (SI), which makes it a global standard for temperature measurement in scientific publications and international collaborations.

### Rankine

The Rankine temperature scale is used primarily in engineering, especially in the United States. Rankine is an absolute temperature scale, like Kelvin, with 0 °R representing absolute zero. While Kelvin is used in scientific and international contexts, Rankine is more common in the U.S. engineering community, in fields such as thermodynamics, fluid mechanics and heat transfer. Its advantage in engineering work is that its degree is the same size as the Fahrenheit degree, so engineers and technicians can work with absolute temperatures without converting between Celsius and Fahrenheit.

### Kelvin

The Kelvin temperature scale is used primarily in scientific and international contexts. Kelvin is an absolute temperature scale: 0 K is absolute zero, the lowest possible temperature, where all molecular motion ceases. Its unit is the kelvin, written "K". Kelvin is the preferred temperature scale in most scientific disciplines, including physics, chemistry, astronomy and atmospheric science. Its use is particularly prevalent in research involving extreme temperatures, cryogenics and fundamental physical phenomena. The kelvin is the SI unit of temperature and is used in scientific publications, academic research and international collaborations. While Kelvin is not as commonly used in engineering as Celsius or Fahrenheit, it has applications in some engineering fields, such as materials science, aerospace engineering and thermal analysis. Kelvin is often used in laboratories and controlled experiments, and in space missions and planetary exploration, because of its absolute nature and its consistency across scientific disciplines.
