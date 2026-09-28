---
layout: layouts/page.njk
title: "Mechanical Equipment Wind Pressure Calculator"
seoTitle: "Mechanical Equipment Wind Pressure Calculator | adicot.com"
description: "Uses ASCE 7-22 to calculate the lateral and uplift wind pressures on mechanical equipment on rooftops, walls or slabs."
permalink: /wind-pressure-calculator.html
ogImage: "/images/0179db_a853ff4d55704da4a3cabe32b66ef643~mv2.png"
calcInclude: "partials/calc-windload.njk"
calculatorName: "Mechanical Equipment Wind Pressure Calculator"
pageModule: calc-windload.js
calcSource: "Wind Load Calculator-V9.0"
---

This mechanical equipment wind pressure calculator calculates the lateral and uplift pressures on mechanical equipment installed on rooftops, on walls or on slabs. It uses the ASCE 7-22 wind pressure methodology and equations, and takes into account the building height, exposure category, equipment location and wind speed. Whether you are an engineer, architect or contractor, it can help you determine the wind loads on equipment.

## How to use it

Review the references and results to make sure this methodology aligns with your project's requirements, then:

1. Enter the equipment model number, if you want it on the printout.
2. Choose whether the equipment is on a roof.
   - **If yes:** choose whether the project is in Miami-Dade or Broward County, Florida's High-Velocity Hurricane Zone (HVHZ), where rooftop units installed on stands have minimum clearance requirements below the equipment for maintenance, then enter the clearance below the equipment or the curb height (in) and the roof height (ft).
   - **If no:** choose wall-mounted or slab-mounted at grade, and enter the height to the bottom of the equipment (ft); enter 0 for slab-mounted equipment.
3. Enter the equipment length, depth and height (in), from the manufacturer's data.
4. Choose the risk category and the exposure category, and enter the ultimate wind speed (mph). The [ASCE Hazard Tool](https://gis.asce.org/beta-7-22/) gives the ASCE 7-22 wind speed for an address and risk category.
5. The lateral and uplift pressures appear in the results and update as you type. Print the page for a record of the inputs and results.

## Methodology

The calculator follows ASCE 7-22, Chapters 26 and 29 (Chapter 29: Wind Loads on Building Appurtenances and Other Structures), at allowable stress design (ASD) level.

**Height of the equipment**

- Rooftop: z = roof height + (clearance + equipment height) / 12 [ft]
- Slab or wall: z = height to bottom of equipment + equipment height / 12 [ft]

**Velocity pressure exposure coefficient** (Table 26.10-1), with z taken as no less than 15 ft:

K<sub>z</sub> = 2.41 × (z / z<sub>g</sub>)<sup>2/α</sup>, where z<sub>g</sub> = 3,280, 2,460 or 1,935 ft and α = 7.5, 9.8 or 11.5 for exposure B, C or D (Table 26.11-1).

**Velocity pressure** (26.10.2):

q<sub>z</sub> = 0.00256 × K<sub>z</sub> × K<sub>zt</sub> × K<sub>e</sub> × V² [psf], with K<sub>zt</sub> = 1 (26.8.2) and K<sub>e</sub> = 1 (26.9). In ASCE 7-22 the directionality factor K<sub>d</sub> is no longer part of q<sub>z</sub>; it is applied in the force equations below.

**Design pressures** (29.4.1, Equations 29.4-2 and 29.4-3, with K<sub>d</sub> = 0.85 from Table 26.6-1 and the 0.6 ASD load factor of 2.4.1):

- Lateral wind pressure = ± q<sub>z</sub> × K<sub>d</sub> × GC<sub>r</sub> × 0.6, with GC<sub>r</sub> = 1.9
- Uplift wind pressure = q<sub>z</sub> × K<sub>d</sub> × GC<sub>r</sub> × 0.6, with GC<sub>r</sub> = 1.5

**HVHZ clearance.** For rooftop equipment in the High-Velocity Hurricane Zone (Miami-Dade and Broward counties), the minimum clearance under the equipment depends on its shorter plan dimension: 14 in up to 23 in, 18 in to 36 in, 24 in to 48 in, 30 in to 60 in, and 48 in above.

The calculator warns when the equipment length is two or more times its height, a proportion outside the range this calculation is set up for.

**Tornado loads.** ASCE 7-22 adds tornado loads (Chapter 32) for Risk Category III and IV buildings in the tornado-prone region. This calculator covers the ordinary wind loads of Chapters 26 and 29 only.

**Compared with ASCE 7-16.** Moving K<sub>d</sub> out of q<sub>z</sub> does not change the pressures. The new K<sub>z</sub> constants change them by: Exposure B, 0.3% to 5% lower (the most on tall buildings); Exposure C, within about 1%; Exposure D, 0.5% higher.

## Florida Building Code note

Per the 2023 Florida Building Code, Section 1609.1.1, Determination of Wind Loads:

> "Exposed mechanical equipment or appliances fastened to a roof or installed on the ground in compliance with the code using rated stands, platforms, curbs, slabs, walls, or other means are deemed to comply with the wind resistance requirements of the 2007 Florida Building Code, as amended. Further support or enclosure of such mechanical equipment or appliances is not required by a state or local official having authority to enforce the Florida Building Code."

Results are not valid unless verified, signed and sealed by a registered engineer. Adicot, Inc. makes no guarantees to the accuracy of these results.
