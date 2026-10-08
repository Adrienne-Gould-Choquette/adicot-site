---
layout: layouts/page.njk
title: "Infiltration and Building Pressurization Calculator (Crack Method)"
seoTitle: "Infiltration & Pressurization Calculator | adicot.com"
description: "Crack-method infiltration through windows and doors, plus the building pressure from net outdoor air and the door opening force against IBC and NFPA limits."
permalink: /infiltration-pressurization-calculator.html
calcInclude: "partials/calc-crackage.njk"
calculatorName: "Infiltration and Building Pressurization Calculator (Crack Method)"
pageModule: calc-crackage.js
calcSource: "Crackage Method V1.02"
---

## How to use it

1. Choose IP (mph, ft, cfm) or SI (m/s, m, l/s) units. Switching converts the values already entered.
2. Enter the winter wind speed. Use the design wind speed for your location if you don't have a site value; **How to find this on the ASHRAE site** under the field shows where to read it.
3. Choose how well the windows fit: tight, average or loose. The description under the choice says which window types fall in each class.
4. Under **Totals**, enter the total crack length (the sum of every window's perimeter) and the total window area. Or choose **Size of each** and enter how many windows there are of each size and the size of one; use **Add another window size** for more sizes (up to 12). Enter the exterior doors under **Doors** the same way, one row per size (**Add another door size**); for a pair of doors, count each leaf and enter one leaf's width.
5. Optionally, enter the building's length, width and height to see the result as air changes per hour.
6. To check whether the outdoor air over-pressurizes the building, enter the net outdoor air (outdoor air supplied minus air exhausted), how tight the walls and roof are, any openings that stay open, and the door to check. The first line of the results says whether the building is over-pressurized (or, with more exhaust than outdoor air, over-depressurized); below it are the building pressure, the force needed to open each door, and the most net outdoor air the doors allow. The example starts at 500 cfm (236 l/s).

The results update as you type. Use **Copy link to these results** to save or share the calculation.

## Methodology, equation and example

The crack method estimates infiltration from the length of the gaps around operable windows and doors. The wind pressure on those gaps drives outdoor air in. The air leaking in per foot of crack depends on how well the openings fit and on the wind speed.

**VHF = 0.000467 × V²**

**Infiltration rate** (cfm per ft of crack):

| Window fit | k | Rate |
|---|---|---|
| Tight | 1 | 0.95 × VHF^0.55 |
| Average | 2 | 2.1 × VHF^0.64 |
| Loose | 6 | 6.05 × VHF^0.62 |

**Crack length = Σ quantity × 2 × (width + height)**

**Q = infiltration rate × crack length**

**ACH = Q × 60 / (L × W × H)**

Where:

- **V**: winter wind speed, mph
- **VHF**: velocity head factor, in. of water
- **Crack length**: the perimeter of each opening, ft
- **Q**: infiltration, cfm
- **L, W, H**: building length, width and height, ft

**Example:** A 30 × 60 ft building, 16 ft high, has four 3 × 5 ft windows of average fit and one 3 × 7 ft door. The winter wind speed is 20 mph.

- VHF = 0.000467 × 20² = 0.1868
- Rate = 2.1 × 0.1868^0.64 = 0.718 cfm/ft
- Crack length = 4 × 2 × (3 + 5) + 1 × 2 × (3 + 7) = 84 ft
- Q = 0.718 × 84 = 60.3 cfm
- ACH = 60.3 × 60 / (30 × 60 × 16) = 0.126 air changes per hour

## Building pressurization and door opening force

A building that takes in more outdoor air than it exhausts is pressurized until the surplus leaks out as fast as it comes in. Too much pressure makes doors hard to open, and a door that opens outward is pushed shut. This part of the calculator finds the pressure the net outdoor air holds the building at, with no wind, and checks the force needed to open a door against the code limit.

**Leakage.** At a pressure difference ΔP (in. w.c.), the building leaks through:

- **Window and door cracks:** crack length × the fit's rate above, with ΔP in place of VHF (the crack curves give leakage per foot against pressure difference).
- **Walls and roof:** area × rate × (ΔP / 0.30)^0.65. ASHRAE Handbook—Fundamentals (2025), chapter 16, gives typical commercial wall leakage of 0.10, 0.30 and 0.60 cfm per ft² at 0.30 in. w.c. for tight, average and leaky walls, with a flow exponent of 0.65. It gives no separate roof figure, so the roof uses the same choices. The wall area is the perimeter × height less the windows and doors; the roof area is length × width.
- **Other openings** that stay open, such as relief dampers and louvers: Q = 2610 × A × ΔP^0.5, with A the free area in ft² (the orifice equation with a flow coefficient of 0.65).
- **Measured leakage:** a blower-door result in cfm at 75 Pa (0.30 in. w.c.) replaces the wall and roof estimate, scaled by (ΔP / 0.30)^0.65.

The building pressure is the ΔP at which the total leakage equals the net outdoor air.

**Door opening force** (NFPA 92 and the ASHRAE Handbook's smoke-control chapter):

**F = F<sub>dc</sub> + 5.2 × W × A × ΔP / (2 × (W − d))**

- **F**: force to open the door, lbf
- **F<sub>dc</sub>**: door closer force, lbf, from the manufacturer; 0 for a door on plain hinges
- **W**: door width, ft; **A**: door area, ft²
- **ΔP**: pressure difference across the door, in. w.c.
- **d**: distance from the knob to the latch edge, ft

**Force limits.** IBC Section 1010.1.3 limits interior swinging egress doors, other than fire doors, to 5 lbf. Other swinging doors must set in motion at 30 lbf (IBC 1010.1.3 and NFPA 101 Section 7.2.1.4.5). Check the code your jurisdiction adopts.

**Example.** A 3 × 7 ft door on plain hinges (F<sub>dc</sub> = 0), knob 3 in. from the edge:

- At the 5 lbf interior limit: ΔP = 5 × 2 × (3 − 0.25) / (5.2 × 3 × 21) = 27.5 / 327.6 = 0.084 in. w.c.
- At the 30 lbf limit: ΔP = 165 / 327.6 = 0.504 in. w.c.

The example building above, 30 × 60 × 16 ft, with average walls and roof, has 2,799 ft² of wall (after the windows and doors) and 1,800 ft² of roof. With 500 cfm of net outdoor air it settles at 0.058 in. w.c.: 472 cfm leaks through the walls and roof and 28 cfm through the cracks. The door then takes 3.4 lbf to open, within the 5 lbf limit, and the door allows up to about 639 cfm of net outdoor air.

If more air is exhausted than brought in, enter the net outdoor air as a negative number: the building is depressurized by the same amount, and the force check applies to a door that opens inward.

The force is for a door that opens against the pressure: outward from a pressurized building, inward into a depressurized one. A door that swings the other way is pushed open instead, which matters for doors that must stay closed or latched.

The pressure is for calm conditions. Wind raises the pressure across doors on the windward side and lowers it on the leeward side, and the stack effect adds to it in tall buildings in winter. The window crack curves were fitted for winds up to 36 mph, a pressure of about 0.6 in. w.c.; above that the calculator flags the crack leakage as extrapolated.

## Window fit classes

- **Tight (k = 1):** locked wood double-hung windows, weather-stripped, with an average gap (1/64-in. crack). Wood casement and awning windows, weather-stripped. Metal casement windows, weather-stripped.
- **Average (k = 2):** locked wood double-hung windows that are not weather-stripped with an average gap (1/64-in. crack), or weather-stripped with a large gap (3/32-in. crack). All vertical and horizontal sliding windows, weather-stripped. Metal casement windows, not weather-stripped, with a large gap (3/32-in. crack).
- **Loose (k = 6):** locked wood double-hung windows, not weather-stripped, with a large gap (3/32-in. crack). Vertical and horizontal sliding windows, not weather-stripped.

## Limits

- The correlations are fitted for wind speeds from 0 to about 36 mph. Above 36 mph the calculator still gives an answer, but flags it as possibly unstable.
- The crack method's infiltration result counts only leakage around operable windows and doors. The pressurization check adds the walls, roof and other openings; a blower-door test of the building is the most accurate input where you have one. Neither part includes the stack effect, which matters in tall buildings.
