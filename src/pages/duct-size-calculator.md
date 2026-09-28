---
layout: layouts/page.njk
title: "Duct Size Calculator"
seoTitle: "Duct Size Calculator | adicot.com"
description: "Free online ductulator: size flex, duct board, metal or fabric ducts by velocity, friction loss or duct dimensions, in US or metric units."
permalink: /duct-size-calculator.html
ogImage: "/images/0179db_4e311cfa54304b3586bd4de74473a18b~mv2.png"
calcInclude: "partials/calc-duct-size.njk"
calculatorName: "Duct Size Calculator V1.26"
pageModule: calc-duct-size.js
---

## Duct dimensions are always inner dimensions

Every dimension this duct sizer reports is a clear inside dimension. Add liner,
wrap or sheet thickness separately when you detail the duct.

### How to use it

Pick your unit system, then the duct material — the material is what sets the
absolute roughness, so flex and metal of the same diameter do not carry the same
air at the same friction rate. Enter the air volume in CFM (l/s), choose one
design criterion, and enter its value. The results update as you type.

The optional duct height constrains the rectangular answer to that depth. Leave
it blank and the rectangle comes back square. When the criterion is
**Rect. Duct, W × H**, the value you enter is the width and the height field is
its height.

## HVAC duct sizing calculator methodology

### Overview

This duct size calculator sizes HVAC ductwork by the **equal friction method**,
the same principle as a traditional Ductulator, and reports both the round duct
and the rectangular duct that carries the same air at the same friction rate.
It is consistent with ASHRAE Fundamentals Chapter 21 and ACCA Manual D for
residential, commercial and industrial work.

Friction rate is always quoted per 100 ft (per 30 m).

### 1. Round duct from a friction rate

Pressure drop comes from the Darcy-Weisbach equation:

ΔP/L = f × (ρ/2) × V² / D

with the friction factor from the Swamee-Jain (1976) explicit approximation to
Colebrook-White, which avoids iterating on *f*:

f = 0.25 / [log₁₀(ε/3.75D + 5.74/Re^0.9)]²

Where:

- ΔP/L = pressure drop per unit length (in. wg/100 ft)
- f = Darcy friction factor
- ρ = air density, 0.0735 lb/ft³
- V = air velocity (ft/min)
- D = duct diameter
- ε = absolute roughness of the material
- Re = Reynolds number

Sizing is the same relation solved for D rather than a separate approximation:

D = [8 f L Q² / (π² g hf)]^0.2

Because *f* depends on *D*, this converges by iteration — but it converges to
the same model the forward direction uses. That matters in practice: size a duct
on 0.08 in. wg/100 ft, then enter the diameter you were given, and the
calculator returns 0.08. Through V1.25 it did not.

### 2. Air velocity

Once the diameter is known, velocity follows from continuity:

V = Q / A, with A = π(D/12)²/4

### 3. Rectangular duct — equal friction, not equal area

Rectangular ducts are reported as the **circular equivalent** of Huebscher
(1948), adopted by ACCA Manual D Appendix 3 and ASHRAE Fundamentals Chapter 21:

De = 1.30 × (W × H)^0.625 / (W + H)^0.25

This holds friction rate and airflow constant — **not** cross-sectional area.
The equal-friction rectangle always has more free area than its round
equivalent, and therefore runs at a lower velocity. The calculator reports both
velocities so the difference is visible rather than implied.

Sizing a rectangle on equal area instead is a common shortcut and it
under-sizes: it gives a duct that carries the air faster and at a higher
friction rate than the round duct it was meant to replace.

### 4. Material roughness

The material sets the absolute roughness ε used above:

| Material | ε |
|---|---|
| Metal (galvanized steel) | 0.0003 ft |
| Duct board | 0.0019 ft |
| Flex | 0.00775 ft |
| Fabric (DurkeeSox) | 0.024 ft |

## Design criteria

These are the ranges most often used in practice. They are guidance, not code
requirements — the governing criterion on a real project is usually noise or
available static pressure.

Velocity

- Supply ducts: 800–1,500 fpm
- Return ducts: 600–1,000 fpm
- Main supply trunks: 1,000–2,000 fpm

Friction rate

- Low-velocity systems: 0.08–0.10 in. wg/100 ft
- Medium-velocity systems: 0.10–0.20 in. wg/100 ft
- High-velocity systems: 0.20–0.50 in. wg/100 ft

## Worked example

**Given:** 2,000 CFM, galvanized steel, 0.08 in. wg/100 ft.

**Step 1 — round duct.** Solving Darcy-Weisbach with the Swamee-Jain friction
factor at ε = 0.0003 ft gives **D = 18.49 in.**

**Step 2 — velocity.** A = π(18.49/12)²/4 = 1.865 ft², so V = 2,000 / 1.865 =
**1,072 fpm**, within the range for a main supply trunk.

**Step 3 — rectangular equivalent.** The square that satisfies
De = 1.30 a/2^0.25 at De = 18.49 is **16.92 × 16.92 in.**, running at
**1,006 fpm** — slower than the round duct, because the equal-friction rectangle
has more free area.

**Step 4 — constrain the depth.** Fix the height at 12 in. and the same duct
becomes **24.61 × 12.00 in.** at 975 fpm, still at 0.080 in. wg/100 ft.

Note that the equal-*area* rectangle for an 18.49 in. round duct would be
16.39 in. square. That is the shortcut this calculator does not take.

## What changed in V1.26

Two corrections, both of which move published numbers:

**One friction model in both directions.** Earlier versions used one formulation
to size a duct from a friction rate and a different one to report the rate from
a diameter. They disagreed, so the calculator was not self-consistent. Both
directions now use Swamee-Jain. Sizing moved by about 0.8% on metal and duct
board, −3.4% on flex and −7.8% on fabric duct — the gap grew with roughness.

**Metric friction input.** A unit conversion on the metric friction-loss input
scaled it by roughly 1/3.33, so entering 20 Pa/30 m sized the duct for about
6 Pa/30 m and oversized every metric duct. At 472 l/s of metal duct, 20 Pa/30 m
now returns 36.05 cm. US results were never affected.

The Swamee-Jain constant is written as 3.75 here where the published equation
has 3.7. It is inherited from the original workbook and is applied in both
directions, so the calculator remains self-consistent; it shifts diameters by a
fraction of a percent against the textbook form.

## References

- ASHRAE (2025). *ASHRAE Handbook — Fundamentals*, Chapter 21: Duct Design. Atlanta: American Society of Heating, Refrigerating and Air-Conditioning Engineers.
- ACCA (2016). *Manual D — Residential Duct Systems*, Appendix 3: Circular Equivalents. Air Conditioning Contractors of America.
- Huebscher, R.G. (1948). "Friction Equivalents for Round, Square and Rectangular Ducts." *ASHVE Transactions*, 54: 101–118.
- Swamee, P.K., & Jain, A.K. (1976). "Explicit Equations for Pipe-Flow Problems." *Journal of the Hydraulics Division, ASCE*, 102(5): 657–664.
- Colebrook, C.F. (1939). "Turbulent Flow in Pipes." *Journal of the Institution of Civil Engineers*, 11(4): 133–156.
- SMACNA (2006). *HVAC Systems Duct Design*, 4th Edition. Sheet Metal and Air Conditioning Contractors' National Association.
- Moody, L.F. (1944). "Friction Factors for Pipe Flow." *Transactions of the ASME*, 66(8): 671–684.

This digital duct size calculator provides estimates equivalent to traditional
Ductulator tools, offering convenient online duct sizing for HVAC professionals
and contractors. It is an estimating aid and does not replace engineering
judgment.
