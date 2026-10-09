---
layout: layouts/page.njk
title: "Air Diffuser FPM to CFM Calculator"
seoTitle: "FPM to CFM Converter | adicot.com"
description: "Convert between face velocity (fpm) and airflow (cfm) for an air diffuser, from its core size, net free area or area factor, in US or metric units."
permalink: /fpm-to-cfm-calculator.html
ogImage: "/images/0179db_3e5b4ce0d6e941988ba2e405c80124f8~mv2.jpg"
calcInclude: "partials/calc-diffuser.njk"
calculatorName: "Air Diffuser FPM to CFM Calculator"
pageModule: calc-diffuser.js
calcSource: "FPM to CFM thru a Diffuser V1.3"
---

## How to use it

1. Choose US or metric units. Switching converts the values already entered.
2. Choose what you know: the air flow rate, to find the velocity, or the velocity, to find the air flow rate. Enter it.
3. Give the diffuser's area as the core length and width with its area factor A<sub>k</sub>, as the core area with A<sub>k</sub>, or as the net free area.
4. The result and the net free area appear in the results, and update as you type.

Verify A<sub>k</sub> from the diffuser manufacturer's technical data.

## Methodology

Air diffusers distribute conditioned air into occupied spaces. Calculating the velocity of the air leaving a diffuser is essential to proper system design: it governs air distribution, occupant comfort and ventilation.

### Theoretical foundation

The velocity through a diffuser follows from the relationship between volumetric flow rate, area and velocity:

**Q = A × V**, so **V = Q / A**

Where Q is the volumetric flow rate (CFM), A the cross-sectional area (ft²) and V the velocity (FPM).

### Net free area

In practice, diffusers contain grilles, louvers or other obstructions that reduce the open area the air can pass through. This is accounted for with an area factor, A<sub>k</sub>, also known as the free area ratio or net free area coefficient:

A<sub>net</sub> = A × A<sub>k</sub>

where A<sub>net</sub> is the net free area (ft²), A the core or face area of the diffuser (ft²), and A<sub>k</sub> the area factor (dimensionless, typically 0.4 to 0.9). Combining the two:

**V = Q / (A × A<sub>k</sub>)**, or for a rectangular core of length L and width W: **V = Q / (L × W × A<sub>k</sub>)**

### Units

When the length and width are in inches, as is usual in HVAC practice, convert them to feet before calculating a velocity in FPM:

1. Core area in square inches: A = L × W (in²)
2. Convert to square feet: A = L × W / 144 (ft²), since 1 ft² = 12 in × 12 in = 144 in²
3. Apply the area factor: A<sub>net</sub> = A × A<sub>k</sub> (ft²)
4. Velocity: V = Q / A<sub>net</sub> (FPM)

### Design considerations

Area factors vary by diffuser type and construction, and are best taken from the manufacturer's literature:

- Perforated face diffusers: A<sub>k</sub> = 0.4 to 0.6
- Bar grilles: A<sub>k</sub> = 0.6 to 0.8
- Linear slot diffusers: A<sub>k</sub> = 0.5 to 0.7
- Ceiling diffusers with deflecting vanes: A<sub>k</sub> = 0.7 to 0.9

Typical diffuser velocities:

- Low velocity applications (offices, residential): 400 to 800 FPM
- Medium velocity applications (retail, lobbies): 800 to 1,200 FPM
- High velocity applications (industrial): 1,200 to 2,000+ FPM

Lower velocities generally give better thermal comfort and less noise; higher velocities may be needed for long throws or industrial applications.

### Worked example

Calculate the face velocity of a rectangular ceiling diffuser with Q = 1,200 CFM, L = 12 in, W = 18 in and A<sub>k</sub> = 0.82.

1. Core area: A = 12 in × 18 in = 216 in²
2. In square feet: A = 216 / 144 = 1.5 ft²
3. Net free area: A<sub>net</sub> = 1.5 ft² × 0.82 = 1.23 ft²
4. Velocity: V = 1,200 CFM / 1.23 ft² = 976 FPM

976 FPM is in the medium velocity range, appropriate for commercial spaces such as retail or office lobbies.

### Common errors

The most common error is failing to convert dimensional units. If L and W are in inches, divide by 144 to get ft²; if they are in feet, no conversion is needed; and the flow rate must be in CFM for a velocity in FPM. Treating 12 × 18 = 216 as ft² instead of in² gives V = 1,200 / (216 × 0.82) = 6.78 FPM, which is wrong; the correct figure is 976 FPM.

Leaving out the area factor gives an artificially low velocity: the air moving through the net free area is faster than the nominal face velocity.

## Typical net free area by core size

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Core size, in</th><th scope="col">Core area, ft²</th><th scope="col">Net free area, ft²</th><th scope="col">A<sub>k</sub></th></tr></thead>
  <tbody>
  {%- for d in diffuserTypical %}
    <tr><th scope="row">{{ d.size }}</th><td>{{ d.core }}</td><td>{{ d.net }}</td><td>{{ d.ak }}</td></tr>
  {%- endfor %}
  </tbody>
</table>
</div>

Across these sizes, net free area ≈ 0.6571 × core area − 0.0463 ft², which is the estimate the calculator shows for the core size entered.
