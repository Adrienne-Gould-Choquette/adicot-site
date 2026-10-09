---
layout: layouts/page.njk
title: "Coil Selection Calculator"
seoTitle: "Coil Selection Calculator | adicot.com"
description: "Find the sensible, latent and total coil load (the capacity the coil must deliver), the leaving air, coil face area and velocity, and the water or glycol flow."
permalink: /coil-selection-calculator.html
ogImage: "/images/0179db_34bba9fdec3d49dc828e1e4be55b6ad3~mv2.png"
calcInclude: "partials/calc-coil.njk"
calculatorName: "Coil Selection Calculator"
pageModule: calc-coil.js
calcSource: "Coil Selection V2.9"
---


## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then choose US or metric units. Each of the four tools gives its result as soon as its own inputs are complete.

**1. Coil air side (sensible, latent and total cooling)**

- Choose what to solve for: the coil loads, the airflow, the leaving air or the entering air. That answer's own inputs are hidden, so nothing typed there can over-define it. Then enter what you know and leave the rest blank; until the entries fix the answer, the tool says what to add next.
- For the coil loads, enter the entering and leaving dry bulb.
- Coil loads are not room loads: the load at the coil includes the outdoor air brought in for ventilation and the fan heat, so a room load from a load calculation is usually smaller. Enter coil loads, and take the entering air as the air reaching the coil (mixed air for a recirculating system, outdoor air for a DOAS).
- For the latent and total cooling, add the moisture of the entering air and of the leaving air: choose whether you know each as a wet bulb, a relative humidity or a dew point, and enter it. The two can differ, for example an RH entering and a dew point leaving.
- Enter the airflow (at the entering air), and the altitude if the project is not near sea level.
- The results give each condition's enthalpy and humidity ratio, the sensible, latent and total cooling, and the sensible heat ratio.
- To size the airflow instead, leave the airflow blank and enter the total, the sensible or the latent cooling. One is enough; if more than one is entered the total is used, then the sensible. For a sensible coil load the two dry bulbs are enough, and for a latent coil load the two dew points.
- For the sensible cooling alone, enter just the two dry bulbs and the airflow. For the latent cooling alone, set both moisture dropdowns to "Dew point" and enter just the two dew points and the airflow. A wet bulb or an RH needs its dry bulb as well, because neither fixes the moisture in the air by itself.
- To find the leaving air, leave it blank and enter the entering air, the airflow, and any two of the sensible, latent and total cooling. The results give the leaving dry bulb, wet bulb, RH and dew point.
- If you know only the total cooling, enter it with the leaving RH or dew point (how moist the air leaves the coil) instead of a second coil load.
- With one coil load only: the sensible cooling and the entering dry bulb give the leaving dry bulb; the latent cooling and the entering dew point (or the full entering air) give the leaving dew point.
- To find the entering air, do the same with the leaving air as the known end and the entering air left blank. One coil load alone gives the entering dry bulb (from the sensible) or the entering dew point (from the latent).
- If you enter more than is needed, the tool is over-defined: the results panel shows a warning naming the extra entry in place of results, until you clear it, or clear another entry to solve from it instead.

**2. Coil face area and velocity**

- Enter the coil face height and width, and the airflow. The airflow box is shared with tool 1: typing it in either place fills in both, and left blank it takes the airflow tool 1 finds.

**3. Fluid flow (water or glycol)**

- Select the quantity to solve for: coil load, flow rate, entering temperature or leaving temperature.
- Select the coil: Cooling (chilled water or glycol, which warms up through the coil) or Heating (hot water, which cools down). This decides which side of the known temperature a solved temperature falls on.
- Enter the other inputs. Leave the coil load blank to use the total cooling from tool 1.

**4. Fluid velocity in coil tubes**

- Enter the tube inside diameter and the number of tubes fed, and the flow rate, or leave it blank to use the flow from tool 3.

## Coil Load & Leaving Air Temperature – Methodology

The coil load is the heat the coil moves between the air and the water or glycol: the sensible, latent and total cooling at the conditions given. It is the same number as the capacity the coil must deliver at those conditions, so the methodology below says "load" throughout.


##### Overview

This tool finds the sensible, latent and total cooling of a coil from its entering and leaving air conditions and the airflow. It uses the exact method of the ASHRAE Handbook—Fundamentals, chapter 1 ("Moist Air Cooling and Dehumidification"), rather than the standard-air factors 1.08, 0.68 and 4.5, so the result follows the actual density of the air at its temperature, humidity and altitude. The psychrometric 2-condition calculator uses the same method, so the two agree.

1. Air conditions

Each condition's humidity ratio W, enthalpy h and specific volume v come from its dry bulb and its wet bulb, RH or dew point, with the ASHRAE psychrometric equations at the altitude's atmospheric pressure (the same equations as the psychrometric chart calculator).

2. Mass flow of dry air

m = CFM x 60 / v_enter

- m = Mass flow of dry air (lb/h)
- CFM = Airflow at the entering air (ft³/min)
- v_enter = Specific volume of the entering air (ft³/lb dry air)

3. Total cooling

Q_t = m x [(h_enter - h_leave) - (W_enter - W_leave) x h_w]

- h_enter, h_leave = Entering and leaving enthalpy (Btu/lb dry air)
- W_enter, W_leave = Entering and leaving humidity ratio (lb/lb dry air)
- h_w = Enthalpy of the condensate, which leaves at the leaving dry bulb: h_w = T_leave - 32 (Btu/lb)

4. Sensible and latent cooling

Q_s = m x (0.240 + 0.444 x W_leave) x (T_enter - T_leave)

Q_L = Q_t - Q_s

So sensible plus latent always equals the total, and the sensible heat ratio is Q_s / Q_t. The condensate is m x (W_enter - W_leave) lb/h.

5. Example

Given: 2,000 CFM; entering 95 °F dry bulb, 78 °F wet bulb; leaving 55 °F dry bulb, 54 °F wet bulb; sea level.

- Entering: h = 41.30 Btu/lb, W = 0.016771 lb/lb (117.4 gr/lb), v = 14.360 ft³/lb
- Leaving: h = 22.57 Btu/lb, W = 0.008631 lb/lb (60.4 gr/lb)
- m = 2,000 x 60 / 14.360 = 8,356 lb/h
- Q_t = 8,356 x [(41.30 - 22.57) - 0.008140 x 23] = 154,971 Btu/h
- Q_s = 8,356 x (0.240 + 0.444 x 0.008631) x (95 - 55) = 81,502 Btu/h
- Q_L = 154,971 - 81,502 = 73,469 Btu/h; sensible heat ratio 0.53; condensate 68.0 lb/h

The same airflow by the standard-air shortcuts gives 1.08 x 2,000 x 40 = 86,400 Btu/h sensible and 4.5 x 2,000 x 18.73 = 168,593 Btu/h total, 6 to 9 % high here, because 95 °F humid air is lighter than standard air (14.36 ft³/lb against 13.33). The shortcuts are fine for hand checks near standard conditions; the exact method holds at any condition and altitude.

6. Solving for airflow

With "Airflow", the tool inverts the total: CFM = Q_t x v_enter / {60 x [(h_enter - h_leave) - (W_enter - W_leave) x h_w]}. Given a sensible or a latent load instead, it inverts that equation the same way: CFM = Q_s x v_enter / [60 x (0.240 + 0.444 x W_leave) x (T_enter - T_leave)], or CFM = Q_L x v_enter / [60 x (W_enter - W_leave) x (1093 + 0.444 x T_enter - T_leave)].

7. Solving for the leaving or the entering air

The leaving or the entering air is found with the same equations as above, solved for the air at one end of the coil instead of the loads, so entering the result back with the loads cleared returns the loads you started from.

- With two of the loads given, the two unknowns are T_leave and W_leave. The sensible equation gives T_leave = T_enter - Q_s / [m x (0.240 + 0.444 x W_leave)], and the total equation, with h_leave = 0.240 x T_leave + W_leave x (1061 + 0.444 x T_leave), gives W_leave = [h_enter - 0.240 x T_leave - W_enter x (T_leave - 32) - Q_t / m] / (1093 - 0.556 x T_leave). The two are repeated until they agree.
- With the total cooling and the leaving RH or dew point given, the tool finds the leaving dry bulb at which the total cooling equals the load. A leaving wet bulb is not offered here, because at a fixed wet bulb the total hardly changes with the dry bulb.

Example: 2,000 CFM entering at 95 °F dry bulb and 78 °F wet bulb, with 81,502 Btu/h sensible and 154,971 Btu/h total, leaves at 55.0 °F dry bulb, 54.0 °F wet bulb (94 % RH, 53.3 °F dew point). The same total with a leaving RH of 94 % gives the same 55.0 °F.

The entering-air choices work the same way from the leaving air. Because the airflow is at the entering air, the mass flow m depends on the entering air being found, so the tool repeats m = CFM x 60 / v_enter along with T_enter = T_leave + Q_s / [m x (0.240 + 0.444 x W_leave)] and W_enter = W_leave + Q_L / [m x (1093 + 0.444 x T_enter - T_leave)] until they agree. The example in reverse: 2,000 CFM leaving at 55 °F dry bulb and 54 °F wet bulb, with the same 81,502 Btu/h sensible and 154,971 Btu/h total, enters at 95.0 °F dry bulb and 78.0 °F wet bulb.

If the loads call for air past saturation (more than 100 % RH), or for air cooled below the dew point given, no leaving condition exists at that airflow and the tool says so; the airflow or the loads have to change.

8. One load from part of the conditions

The sensible cooling depends mainly on the dry bulbs and the latent cooling mainly on the moisture, so the tool gives either one without the other set of inputs. Whatever is missing is filled in as below, and the note under the results says which applies; with every input entered, the exact loads above are used instead.

- Sensible from the dry bulbs: Q_s = m x (0.240 + 0.444 x W) x (T_enter - T_leave). With no moisture entered, the air is taken as dry (W = 0), in the mass flow as well. For the example above this gives 82,384 Btu/h against the exact 81,502, about 1 % high; for drier air the difference is smaller. With the moisture entered at one end only, that W is used throughout, which is exact for a coil that removes no moisture.
- Latent from the moisture: subtracting the sensible from the total leaves Q_L = m x (W_enter - W_leave) x (1093 + 0.444 x T_enter - T_leave). A dew point gives W without a dry bulb, which a wet bulb or an RH cannot. Where a dry bulb is missing, that end's dew point stands in for it, in the mass flow as well. For the example above, the dew points alone (71.8 and 53.3 °F) give 76,069 Btu/h against the exact 73,469, about 3.5 % high, because the air is in fact warmer and lighter than air at its dew point.
- Leaving dry bulb from a sensible load, and leaving dew point from a latent load, are the same two equations solved for T_leave and W_leave; the entering dry bulb and dew point likewise, for T_enter and W_enter. The airflow for a sensible or a latent load is found from the same two equations, with the same stand-ins for whatever is missing.

9. Reference Standards

- ASHRAE Handbook—Fundamentals (2025) — Chapter 1: Psychrometrics

- ACCA Manual N, 5th edition — Commercial Load Calculation Procedures

- Carrier System Design Manual, Part 2 (2009) — Air Conditioning Load Estimation

- ASHRAE 62.1-2025 — Ventilation and Acceptable Indoor Air Quality

10. Application Notes


- Enter the altitude when the project is not near sea level; it sets the atmospheric pressure, and so the air's density and humidity ratio.

- Positive coil loads are cooling; a negative coil load denotes heating, and a negative latent coil load denotes adding moisture.

- For SI conversions:

- 1 Btu/h = 0.293 W

- 1 CFM = 0.472 L/s

Disclaimer:

This calculator is intended for educational and preliminary design use only. Results should be validated using manufacturer coil performance data and ASHRAE-approved engineering procedures.



## Coil Face Area & Air Velocity – Methodology


### Overview

This calculator determines the coil face area and air velocity across an HVAC cooling or heating coil based on the coil’s physical dimensions and volumetric airflow rate.

These parameters are essential for evaluating coil performance, fan sizing, and condensation control. Excessive face velocity may cause water carryover or noise, while low velocity may reduce heat transfer efficiency.

Calculations are consistent with ASHRAE Fundamentals (2025), Chapter 21: Duct Design, and ACCA Manual D (2016) standards for residential and light commercial air distribution systems.

1. Coil Face Area

Formula:

A = H x L

Where:

- ( A ) = Coil face area (ft² or m²)

- ( H ) = Coil face height (ft or m)

- ( L ) = Coil face length (ft or m)

Unit Conversions:

- For Imperial units:

A = (H x L) / 144

where height and length are entered in inches

- For Metric units:

A = ( H x L ) / 1,000,000

where height and length are entered in millimeters.

2. Coil Air Velocity


Formula:

V = Q / A

Where:

- ( V ) = Coil air velocity (fpm or m/s)

- ( Q ) = Volumetric flow rate of air (CFM or L/s)

- ( A ) = Coil face area (ft² or m²)

Conversions:

- 1 CFM = 0.0004719 m³/s

- 1 L/s = 0.001 m³/s

3. Example (Imperial Units)


Given:

- Height = 12 in

- Length = 12 in

- Airflow = 2,000 CFM

Step 1:

A = 12 / 12 x 12 / 12 = 1.00 ft²

Step 2:

V = 2,000 / 1.00 = 2,000 fpm

✅ Result:
Coil Area = 1.00 ft²
Coil Velocity = 2,000 fpm

4. Example (Metric Units)

Given:

- Height = 250 mm

- Length = 250 mm

- Airflow = 600 L/s

Step 1:

A =250 x 250 / 1,000,000 = 0.0625 m²

Step 2:

V = 600 L/s / 0.0625 m² x 1 m³/s / 1,000 L/s = 9.6 m/s

✅ Result:
Coil Area = 0.06 m²
Coil Velocity = 9.6 m/s

5. Design Guidance

Parameter Recommended Range Reference

- Cooling coil face velocity 2.0–2.5 m/s (400–500 fpm)ASHRAE HVAC Systems and Equipment (2024), Air-Cooling and Dehumidifying Coils

- Heating coil face velocity 3.0–4.0 m/s (600–800 fpm)ACCA Manual D (2016)

- Maximum allowable to avoid carryover≤ 2.8 m/s (550 fpm)ASHRAE HVAC Systems and Equipment (2024)

6. Reference Standards

- ASHRAE Handbook—Fundamentals (2025) — Chapter 21: Duct Design

- ASHRAE HVAC Systems and Equipment (2024) — Air-Cooling and Dehumidifying Coils

- ACCA Manual D (2016) — Residential Duct Systems

- Carrier System Design Manual, Part 2 (2009) — Air Distribution and Coil Selection

7. Application Notes

- Maintain coil velocities within recommended ranges to prevent condensate blow-off.

- Ensure coil face area aligns with fan capacity and static pressure limitations.

- For multi-row coils, use the total effective face area rather than finned area for calculations.

- Use psychrometric tools to confirm leaving air conditions at calculated velocities.

Disclaimer:

This calculator is intended for educational and preliminary design use only. Results should be validated using manufacturer coil performance data and ASHRAE-approved engineering procedures.


## Water & Glycol Flow Rate – Methodology


##### Overview

This calculator estimates the required volumetric flow rate (or coil load, or entering/leaving temperatures) for hydronic systems using water or glycol solutions.

It applies fundamental energy balance equations for sensible heat transfer and allows for different heat capacities of glycol mixtures commonly used in HVAC chilled- and hot-water loops.

Calculations are consistent with ASHRAE Fundamentals (2025), Chapter 4: Heat Transfer, and ACCA Manual N (5th edition) methods for coil and piping design.

1. Formula – Energy Balance

Q = V̇ × c<sub>p</sub> × ΔT

Where:

- Q = Coil load (Btu/h or kW)

- V˙ = Volumetric flow rate (GPM or L/s)

- cp = Specific heat capacity × density × 60 (Fluid factor)
(Btu/h)/(GPM·°F) or kJ/(L·°C)

- ΔT = Temperature difference between the entering and leaving fluid

Rearranged to solve for flow rate:

V̇ = Q ÷ (c<sub>p</sub> × ΔT)

Solving for a temperature, ΔT = Q ÷ (V̇ × c<sub>p</sub>). In a cooling coil the fluid warms up, so leaving = entering + ΔT; in a heating coil it cools down, so leaving = entering − ΔT. Temperatures below freezing keep their sign.

2. Typical Fluid Factors (cₚ)

Fluid English (Btu/h per GPM·°F) Metric (kJ per L·°C)

Ethylene Glycol 10% (by volume) 481.0 4.0219

Ethylene Glycol 20% (by volume) 469.1 3.9224

Ethylene Glycol 30% (by volume) 454.7 3.8019

Ethylene Glycol 40% (by volume) 438.2 3.6638

Ethylene Glycol 50% (by volume) 419.4 3.5071

Propylene Glycol 10% (by volume) 491.1 4.1067

Propylene Glycol 20% (by volume) 483.7 4.0448

Propylene Glycol 30% (by volume) 472.5 3.9510

Propylene Glycol 40% (by volume) 457.7 3.8274

Propylene Glycol 50% (by volume) 439.3 3.6729

Water 500.9 4.1869

Glycol concentrations are by volume. The glycol factors are density × specific heat at 15 °C (59 °F), from ASHRAE Handbook—Fundamentals (2001), Chapter 21, Tables 6, 7, 10 and 11 (the Dow data for inhibited glycols); water is 8.34 lb/gal × 1.001 Btu/lb·°F. The factors change a little with temperature: for hot water, or glycol well below 59 °F, check the density and specific heat at your temperature in ASHRAE Handbook—Fundamentals (2025), Chapter 31, or the manufacturer's data.

3. Example (English Units)

Given:

Coil Load = 9,500 Btu/h
Entering = 80 °F
Leaving = 54 °F
Fluid = Propylene Glycol 40 % (by volume) → factor = 457.7

ΔT=80−54=26°F

V˙=9,500 / (457.7×26) =0.80GPM

✅ Result: Volumetric Flow Rate = 0.80 GPM

4. Example (Metric Units)

Given:

Coil Load = 1,500 kW
Entering = 23 °C
Leaving = 16 °C
Fluid = Water → cp=4.2

ΔT=7°C

V˙=1,500 / (4.2×7) =51.0L/s

✅ Result: Volumetric Flow Rate = 51.0 L/s (≈ 184 m³/h)

5. Application Notes

- Maintain proper fluid selection for freeze protection and corrosion control.

- Adjust flow for glycol concentration: higher glycol → lower cₚ → higher flow requirement.

- Design flow velocity in piping:

- Chilled water: 1.5 – 3.0 m/s (5 – 10 ft/s)

- Hot water: 1.0 – 2.5 m/s (3 – 8 ft/s)
(Ref: ASHRAE HVAC Systems and Equipment, 2024)

6. Reference Standards

- ASHRAE Handbook—Fundamentals (2025) — Ch. 4 Heat Transfer; Ch. 31 Physical Properties of Secondary Coolants (Brines)

- ASHRAE HVAC Systems and Equipment (2024) — Ch. 32 Hydronic Heating and Cooling

- ACCA Manual N, 5th edition — Commercial Load Calculations

- Carrier System Design Manual, Part 3 (2012) — Hydronic Coil and Piping Design

Disclaimer:

This calculator is intended for educational and preliminary design use only. Results should be validated using manufacturer coil performance data and ASHRAE-approved engineering procedures.

### Water Velocity – Methodology


##### Overview


This calculator determines the average velocity of water or fluid flow through one or more tubes based on the total flow rate, tube inner diameter, and number of parallel tubes.

Maintaining velocity within proper ranges is critical for avoiding erosion, noise, and poor heat transfer performance in hydronic and plumbing systems.

Calculations are consistent with ASHRAE Fundamentals (2025), Chapter 22: Pipe Design, and ASPE Design Handbook (2017).

1. Formula (English Units)

V=(0.4085 ×Q) / (N×D²)

Where:

- V = Velocity (ft/s)

- Q = Flow rate (GPM)

- N = Number of tubes or parallel circuits

- D = Inside diameter of tube (inches)

2. Formula (Metric Units)

V= (4×Q) / (N×π×D²)

Where:

- V = Velocity (m/s)

- Q = Flow rate (L/s ÷ 1000, in m³/s)

- D = Diameter (mm ÷ 1000)

2. Example (English Units)

Given:

Q=1 GPM
D=1 in

N=15

V=(0.4085 ×Q) / (N×D²)

=(0.4085×1 GPM) / (15×(1 in)²)

✅ Result: 0.0272 FPS

3. Example (Metric Units)

Given:

Q=2.0 L/s
D=25 mm
N=2

V=4×2.0 / [2×π×(0.025)²]

✅ Result: 2.04 m/s

4. Design Guidelines

Fluid System Velocity Range Notes

Chilled Water 2–5 ft/s (0.6–1.5 m/s) Avoid air binding & ensure good heat transfer

Condenser Water 3–6 ft/s (0.9–1.8 m/s) Prevent scaling

Glycol Mixtures 2.5–5 ft/s (0.75–1.5 m/s) Higher viscosity; lower Reynolds number

Domestic Water 3–8 ft/s (0.9–2.5 m/s) Minimize noise & corrosion

5. Reference Standards

1. ASHRAE Handbook—Fundamentals, 2025. Chapter 22: Pipe Design.
2. ASHRAE Handbook—HVAC Systems and Equipment, 2024. Chapter 32: Hydronic Heating and Cooling.
3. ASPE Design Handbook, Volume 2, 2017. Plumbing Systems.
4. Carrier System Design Manual, Part 3, 2012. Pipe Sizing for HVAC Systems.
5. Bell & Gossett Engineering Manual (System Syzer), 2018 Edition.
6. Perry’s Chemical Engineers’ Handbook, 9th Ed., Section 6: Fluid Mechanics and Transport Properties.

6. Application Notes

- Ensure velocity is sufficient to maintain turbulent flow (Re > 4000).

- Limit maximum velocity to reduce pipe erosion and water hammer.

- For multi-tube coils, divide total flow evenly among circuits for accurate results.

- Use appropriate glycol correction factors for viscosity adjustments.

Disclaimer:

This calculator is intended for educational and preliminary design use only. Results should be validated using manufacturer coil performance data and ASHRAE-approved engineering procedures.

