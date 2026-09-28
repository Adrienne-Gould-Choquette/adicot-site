---
layout: layouts/page.njk
title: "Fluid Mixing Calculator"
seoTitle: "Fluid Mixing Calculator | adicot.com"
description: "Calculate the mixed temperature and specific heat of two fluids. Pick from the fluid database or enter your own."
permalink: /fluid-mixing-calculator.html
ogImage: "/images/0179db_2d5be7b9624a4d36871eca9524982bc2~mv2.png"
calcInclude: "partials/calc-fluidmix.njk"
calculatorName: "Fluid Mixing Calculator"
pageModule: calc-fluidmix.js
calcSource: "Fluid Mixing Calculator V1.03"
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Choose US (°F, lb) or metric (°C, kg) units. Switching converts the values already entered.
2. For each of the two fluids, choose the fluid type from the list of 86 liquids, or choose **Other** and enter its specific heat.
3. Enter each fluid's temperature and mass.
4. The mixed temperature, mixed specific heat and total mass appear in the results, and update as you type.

## Methodology and equations

When two fluids are mixed and no heat is lost to the surroundings, the heat given up by the warmer fluid equals the heat taken up by the cooler one. Each fluid's heat content is its mass times its specific heat times its temperature, so the mixed temperature is the heat-capacity-weighted average of the two:

**T<sub>mix</sub> = (m<sub>1</sub> × c<sub>1</sub> × T<sub>1</sub> + m<sub>2</sub> × c<sub>2</sub> × T<sub>2</sub>) ÷ (m<sub>1</sub> × c<sub>1</sub> + m<sub>2</sub> × c<sub>2</sub>)**

The specific heat of the mixture is the mass-weighted average:

**c<sub>mix</sub> = (m<sub>1</sub> ÷ M) × c<sub>1</sub> + (m<sub>2</sub> ÷ M) × c<sub>2</sub>**, where M = m<sub>1</sub> + m<sub>2</sub>

Where:

- **T**: temperature, °F (°C)
- **m**: mass, lb (kg)
- **c**: specific heat, Btu/lb·°F (kcal/kg·°C, which is numerically the same)

The calculation assumes the fluids mix completely, do not react, change phase or dissolve with any heat of solution, and that specific heat is constant over the temperature range.

**Example:** 50 lb of ethylene glycol at 60 °F (c = 0.56 Btu/lb·°F) is mixed with 100 lb of fresh water at 180 °F (c = 1.0 Btu/lb·°F).

T<sub>mix</sub> = (50 × 0.56 × 60 + 100 × 1.0 × 180) ÷ (50 × 0.56 + 100 × 1.0) = 19,680 ÷ 128 = 153.75 °F

c<sub>mix</sub> = (50 ÷ 150) × 0.56 + (100 ÷ 150) × 1.0 = 0.853 Btu/lb·°F

## Specific heats of liquids

The specific heats the calculator uses. Values marked \* are converted from kJ/kg·K (1 Btu/lb·°F = 4.1868 kJ/kg·K).

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Liquid</th><th scope="col">Btu/lb·°F (kcal/kg·°C)</th><th scope="col">kJ/kg·K</th></tr></thead>
  <tbody>
  {%- for f in fluidSpecificHeats %}
    <tr><th scope="row">{{ f.label }}</th><td>{{ f.btu }}{% if f.derived %}*{% endif %}</td><td>{{ f.kj }}</td></tr>
  {%- endfor %}
  </tbody>
</table>
</div>
