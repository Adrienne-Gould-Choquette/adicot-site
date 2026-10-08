---
layout: layouts/page.njk
title: "Temp Loss Thru Air Ducts"
seoTitle: "Temp Loss through an Air Duct Calculator | adicot.com"
description: "Free calculator for the temperature change and heat loss of air in an insulated duct, from the airflow, duct size, length, insulation and surroundings."
permalink: /temp-loss-through-an-air-duct.html
ogImage: "/images/0179db_84454a352b5146639da5df235a00246c~mv2.png"
calcInclude: "partials/calc-ducttemp.njk"
calculatorName: "Temperature Loss Through an Air Duct"
pageModule: calc-ducttemp.js
calcSource: "Temp Loss Thru Air Duct Version 1.14"
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Choose the duct shape and enter its size: height and width for a rectangular duct, or the inside diameter for a round one (inches).
2. Choose the exterior duct conditions:
   - Still air: h<sub>outside</sub> = 1 Btu/(h·ft²·°F)
   - Moving air: h<sub>outside</sub> = 1.75 Btu/(h·ft²·°F)
   - Outdoors (wind): h<sub>outside</sub> = 4 Btu/(h·ft²·°F)
3. Enter the air flow rate, Q, in CFM.
4. Enter the temperature of the air entering the duct, T<sub>air</sub>, and of the air around the duct, T<sub>outside</sub>, in °F.
5. Enter the duct insulation value, R<sub>insulation</sub>, in h·ft²·°F/Btu.
6. Enter the duct length in feet.
7. The exit air temperature, the heat gained or lost, and the values behind them appear in the results, and update as you type.

## Duct heat loss calculator methodology

### Purpose

This calculator estimates the heat loss (or heat gain) from rectangular or round ducts carrying air through unconditioned spaces, and calculates the resulting exit air temperature.

### Input parameters

- **Duct shape:** rectangular or round
- **Duct dimensions:** height and width (in) for rectangular ducts, diameter (in) for round
- **Exterior conditions:** the convection coefficient for the air outside the duct
- **Flow rate (Q):** volumetric air flow rate (CFM)
- **T<sub>air</sub>:** temperature of the air entering the duct (°F)
- **T<sub>outside</sub>:** ambient air temperature around the duct (°F)
- **R<sub>insulation</sub>:** thermal resistance of the duct insulation (h·ft²·°F/Btu)
- **Length:** total duct length (ft)

### Step 1: cross-sectional area

- Rectangular ducts: A = (Height × Width) / 144 [ft²]. Example: height 16 in, width 14 in: A = (16 × 14) / 144 = 1.556 ft²
- Round ducts: A = π × (Diameter/12)² / 4 [ft²]. Example: diameter 18 in: A = π × 1.5² / 4 = 1.767 ft²

### Step 2: air velocity

V = Q / A, where Q is the flow rate [CFM] and A the cross-sectional area [ft²].

- Rectangular example: Q = 1,000 CFM, A = 1.556 ft²: V = 1,000 / 1.556 = 642.7 fpm = 10.7 fps
- Round example: Q = 2,000 CFM, A = 1.767 ft²: V = 2,000 / 1.767 = 1,131.8 fpm = 18.9 fps

### Step 3: hydraulic diameter

- Rectangular ducts: D<sub>h</sub> = 4A / P [in], where A is the area [in²] and P the perimeter [in] = 2(Height + Width). Example: height 16 in, width 14 in: P = 2(16 + 14) = 60 in; A = 16 × 14 = 224 in²; D<sub>h</sub> = 4(224) / 60 = 14.93 in
- Round ducts: D<sub>h</sub> = diameter. Example: D<sub>h</sub> = 18 in

### Step 4: mass flow rate

ṁ = ρ × Q × 60 [lb/h], where ρ is the air density [lb/ft³] ≈ 0.075 lb/ft³ at standard conditions, Q the flow rate [CFM], and 60 converts minutes to hours. Reference: ASHRAE Handbook—Fundamentals (2025), Chapter 1: Psychrometrics.

Example: ṁ = 0.075 × 1,000 × 60 = 4,500 lb/h

### Step 5: inside convection coefficient

h<sub>inside</sub> = 1.5 × V<sup>0.8</sup> / (D<sub>h</sub> / 12)<sup>0.2</sup> [Btu/(h·ft²·°F)], where V is the air velocity [fps] and D<sub>h</sub> the hydraulic diameter [in]; dividing by 12 converts the hydraulic diameter from inches to feet.

Reference: simplified empirical correlation for forced convection in ducts, adapted from McQuiston, F.C., Parker, J.D., and Spitler, J.D. (2005). *Heating, Ventilating, and Air Conditioning: Analysis and Design*, 6th ed., Wiley.

- Rectangular example: V = 10.7 fps, D<sub>h</sub> = 14.93 in: h<sub>inside</sub> = 1.5 × 6.67 / 1.045 = 9.57 Btu/(h·ft²·°F)
- Round example: V = 18.9 fps, D<sub>h</sub> = 18 in: h<sub>inside</sub> = 1.5 × 10.48 / 1.0845 = 14.5 Btu/(h·ft²·°F)

### Step 6: thermal resistance network

- R<sub>inside</sub> = 1 / h<sub>inside</sub>: convective resistance on the inside duct surface
- R<sub>duct</sub> = thickness / k<sub>duct</sub>: conductive resistance through the duct wall, taken as negligible (R<sub>duct</sub> = 0) for thin sheet metal
- R<sub>insulation</sub>: user input, the conductive resistance of the insulation
- R<sub>outside</sub> = 1 / h<sub>outside</sub>: convective resistance on the outside surface (still air 1, moving air 1.75, outdoors 4 Btu/(h·ft²·°F))

Reference: ASHRAE Handbook—Fundamentals (2025), Chapter 26: Heat, Air, and Moisture Control in Building Assemblies.

**R<sub>total</sub> = R<sub>inside</sub> + R<sub>duct</sub> + R<sub>insulation</sub> + R<sub>outside</sub>**

Example: h<sub>inside</sub> = 9.57, h<sub>outside</sub> = 1.75 (moving air), R<sub>insulation</sub> = 6: R<sub>inside</sub> = 1 / 9.57 = 0.104; R<sub>outside</sub> = 1 / 1.75 = 0.571; R<sub>total</sub> = 0.104 + 0 + 6 + 0.571 = 6.676 h·ft²·°F/Btu. When summing thermal resistances, keep full precision through the intermediate steps and round only the final result.

### Step 7: heat transfer

Q<sub>transfer</sub> = |T<sub>air</sub> − T<sub>outside</sub>| × (P × L) / R<sub>total</sub> [Btu/h], where P is the perimeter [ft] (rectangular: 2(Height + Width) / 12; round: π × Diameter / 12) and L the duct length [ft]. If T<sub>air</sub> > T<sub>outside</sub> the duct loses heat; if T<sub>air</sub> < T<sub>outside</sub> it gains heat. Reference: Fourier's law of heat conduction applied to composite walls; Holman, J.P. (2010). *Heat Transfer*, 10th ed., McGraw-Hill, pp. 76–82.

- Rectangular, heat loss: T<sub>air</sub> = 155 °F, T<sub>outside</sub> = −4 °F, ΔT = 159 °F; P = 60 in = 5 ft; L = 100 ft; R<sub>total</sub> = 6.676; surface area = 5 × 100 = 500 ft²; Q<sub>loss</sub> = 159 × 500 / 6.676 = 11,908 Btu/h
- Round, heat gain: T<sub>air</sub> = 55 °F, T<sub>outside</sub> = 95 °F, ΔT = 40 °F; P = π × 18 / 12 = 4.71 ft; L = 100 ft; R<sub>total</sub> = 6.640 (h<sub>inside</sub> = 14.5); surface area = 471.2 ft²; Q<sub>gain</sub> = 40 × 471.2 / 6.640 = 2,839 Btu/h

### Step 8: temperature change

ΔT<sub>air</sub> = Q<sub>transfer</sub> / (ṁ × c<sub>p</sub>) [°F], with c<sub>p</sub> = 0.240 Btu/(lb·°F). Reference: first law of thermodynamics for steady flow; Cengel, Y.A., and Boles, M.A. (2015). *Thermodynamics: An Engineering Approach*, 8th ed., McGraw-Hill, pp. 230–235.

- Heat loss: 11,908 / (4,500 × 0.240) = 11.0 °F drop
- Heat gain: 2,839 / (9,000 × 0.240) = 1.31 °F rise

### Step 9: exit air temperature

- Heat loss (T<sub>air</sub> > T<sub>outside</sub>): T<sub>exit</sub> = T<sub>air</sub> − ΔT<sub>air</sub>. Example: 155 − 11.0 = 144.0 °F
- Heat gain (T<sub>air</sub> < T<sub>outside</sub>): T<sub>exit</sub> = T<sub>air</sub> + ΔT<sub>air</sub>. Example: 55 + 1.31 = 56.3 °F

### Step 10: effective thermal parameter

k = P / (R<sub>total</sub> × ṁ × c<sub>p</sub>) [1/ft], a system-level parameter combining geometry and thermal resistance. Example: k = 5 / (6.676 × 4,500 × 0.240) = 6.93 × 10⁻⁴ /ft

Steps 7 to 9 treat the temperature difference as constant along the duct. The calculator goes one step further: because the air's temperature, and so the driving temperature difference, changes along the duct, it integrates dT/dL = −k (T − T<sub>outside</sub>) over the length, giving **T<sub>exit</sub> = T<sub>outside</sub> + (T<sub>air</sub> − T<sub>outside</sub>) × e<sup>−kL</sup>**. For short runs and well-insulated ducts the two agree closely; for long or poorly insulated runs the exponential form is the more accurate.

## Assumptions

- Steady-state heat transfer
- Uniform air temperature across the duct cross-section
- Constant air properties (c<sub>p</sub>, ρ) along the duct length
- One-dimensional heat transfer in the radial direction
- Negligible heat generation within the system
- Fully developed turbulent flow
- Constant outside air temperature along the duct length
- Negligible thermal resistance of thin metal duct walls
- Negligible radiation heat transfer

## Key references

- ASHRAE Handbook—Fundamentals (2025). American Society of Heating, Refrigerating and Air-Conditioning Engineers, Atlanta, GA.
- Incropera, F.P., DeWitt, D.P., Bergman, T.L., and Lavine, A.S. (2007). *Fundamentals of Heat and Mass Transfer*, 6th ed., John Wiley & Sons, New York.
- McQuiston, F.C., Parker, J.D., and Spitler, J.D. (2005). *Heating, Ventilating, and Air Conditioning: Analysis and Design*, 6th ed., John Wiley & Sons, New York.
- Holman, J.P. (2010). *Heat Transfer*, 10th ed., McGraw-Hill, New York.
- Cengel, Y.A., and Boles, M.A. (2015). *Thermodynamics: An Engineering Approach*, 8th ed., McGraw-Hill Education, New York.

## Applications

- HVAC system design and optimization
- Energy loss assessment in air distribution systems
- Determining insulation requirements
- Verifying temperature maintenance for process air
- Building energy modeling and analysis
