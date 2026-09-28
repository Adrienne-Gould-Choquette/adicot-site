---
layout: layouts/page.njk
title: "Return Air Transfer Duct/Pass Thru Calculator"
seoTitle: "Transfer Duct & Pass-Through Grille Calculator | adicot.com"
description: "Size return air transfer ducts and pass-through grilles: minimum grille free area and transfer duct area per FBC 601.6, with sample grilles that fit."
permalink: /transfer-pass-thru-calculator.html
ogImage: "/images/0179db_008560f6f1754049bfc6c53a981e26ef~mv2.png"
calcInclude: "partials/calc-transfer.njk"
calculatorName: "Return Air Transfer Duct and Pass-Through Sizer"
pageModule: calc-transfer.js
calcSource: "Transfer Duct Sizer V1.57"
---

## How to use it

Review the method below to make sure it fits your project, then:

1. Choose the transfer type: a pass-through (grilles on each side of one wall), or a transfer duct, flex or hard, between two grilles.
2. Enter the supply airflow to the room, in cfm.
3. Choose the supply duct material serving the room: flex, duct board or metal. It is used only to estimate the supply duct's size.
4. For a pass-through or hard transfer duct, enter the height available for the duct (the framing depth or cavity), to get the width it needs.
5. Choose the grilles to list: Grille Tech return grilles, AirGuide RA fixed blade return grilles, or AirGuide DG door/transfer grilles.
6. The minimum grille free area, the minimum transfer duct area and the grilles that suit them appear in the results.

## Method

This follows the balanced return air requirements of the 2023 Florida Building Code, Mechanical, Section 601.6. Rooms with a supply but no ducted return need a return path back to the air handler, so that closing the door doesn't pressurize the room.

### Minimum grille free area

Transfer grilles need 50 square inches of free area per 100 cfm of supply air (FBC 601.6, Exception 2):

A<sub>grille,min</sub> = Q × 50 ÷ 100 in² = Q ÷ 288 ft²

### Minimum transfer duct area

A transfer duct must be at least 1.5 times the cross-sectional area of the supply duct entering the room (FBC 601.6, Exception 1):

A<sub>transfer,min</sub> = 1.5 × A<sub>supply</sub>

The calculator estimates the supply duct as a round duct carrying the room's airflow at a friction rate of 0.1 in. wg per 100 ft, typical of residential duct design. It solves the Colebrook equation with White's explicit method (*Fluid Mechanics*, 1986) in a single pass, which rounds the duct very slightly up (about 0.7%), on the safe side. The air is taken as standard (0.0735 lb/ft³, kinematic viscosity 0.000162 ft²/s), and the duct's absolute roughness as 0.00775 ft for flex, 0.0019 ft for duct board and 0.0003 ft for metal.

The square duct shown alongside is the equal-friction equivalent (ACCA Manual D, Appendix 3): side = diameter × 2<sup>0.25</sup> ÷ 1.30.

### Transfer duct size

- **Pass-through or hard transfer duct:** at the height available, the duct's width is A<sub>transfer,min</sub> ÷ height.
- **Flex transfer duct:** the minimum flex diameter is √(4 × A<sub>transfer,min</sub> ÷ π).

### Sample grilles

The calculator lists sample return grilles that suit the airflow. A grille is listed when:

- its free area is at least the minimum: its maximum supply, A<sub>k</sub> × 288 cfm rounded, is at least the airflow;
- its neck and its free area are larger than the minimum transfer duct area, so that the grille doesn't choke the duct; and
- it is not more than twice the size needed: its maximum supply is no more than twice the airflow. Below 25 cfm, only the smallest grille (6 × 6 in.) is listed.

For a pass-through or hard transfer duct, the duct is the grille's neck size. The largest grille in each list sets its limit: Grille Tech 48 × 30 in., up to 2,333 cfm; AirGuide RA 30 × 30 in., up to 1,604 cfm; AirGuide DG 30 × 30 in., up to 1,783 cfm.

For the AirGuide grilles, A<sub>k</sub> is the balancing factor from AirGuide's performance data (airflow = average face velocity × A<sub>k</sub>): RA models RA(OB), RAME(OB), RAAG(OB), RAAGME(OB), RAP(OB), RAPME(OB), RF2FS(OB), RF2FSME(OB), RF2DS(OB), RF2DSME(OB) and RAFB(OB); DG models DG-1, DG-2 and DG-3. Confirm the size and A<sub>k</sub> with the manufacturer's current data before specifying.

### Example

A bedroom supplied with 50 cfm through flex duct, with a pass-through and 6 in. of wall cavity:

- Minimum grille free area = 50 ÷ 288 = 0.174 ft² (25 in²)
- Supply duct at 0.1 in. wg per 100 ft: 5.03 in. round, 0.138 ft² (equal-friction square 4.6 × 4.6 in.)
- Minimum transfer duct area = 1.5 × 0.138 = 0.207 ft² (29.8 in²)
- At 6 in. high, the pass-through needs to be at least 29.8 ÷ 6 = 5.0 in. wide.
- Grilles that suit it: 8 × 6 in. (A<sub>k</sub> 0.22 ft², up to 63 cfm) and 10 × 6 in. (0.29 ft², up to 84 cfm).

### Other requirements

- **Pressure differential:** with the doors closed, the pressure difference across each door must not exceed 0.01 in. WC (2.5 Pa). The same limit applies across fire walls in ceiling return plenums, met with air duct or transfer pathways from the high- to the low-pressure side (FBC 601.6). The transfer duct and grille sizes above are the code's prescriptive ways to meet it.
- **Door undercut:** doors to rooms with transfer grilles need an unrestricted undercut of at least 1 in. (FBC 601.6).
- **Which rooms:** only habitable rooms need balanced return air; bathrooms, closets, storage rooms and laundry rooms are excluded, except that all supply air into the master suite counts (FBC 601.6, Exception 3).
- **Grille free area:** use the manufacturer's A<sub>k</sub> for the grille you specify.
- **IMC:** under the 2024 International Mechanical Code, Section 601.5, return and transfer openings are sized per the equipment manufacturer's instructions, ACCA Manual D, or the design professional.

## Sample return grille catalog

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Neck, in.</th><th scope="col">Free area A<sub>k</sub>, ft²</th><th scope="col">Free area, in²</th><th scope="col">Max supply at 50 in²/100 cfm, cfm</th></tr></thead>
  <tbody>
  {%- for g in transferGrilles %}
    <tr><th scope="row">{{ g.neck }}</th><td>{{ g.ak }}</td><td>{{ g.akIn }}</td><td>{{ g.maxCfm }}</td></tr>
  {%- endfor %}
  </tbody>
</table>
</div>

## References

- Florida Building Code, Mechanical (2023), Section 601.6, "Balanced Return Air"
- International Mechanical Code (2024), Section 601.5, "Return Air Openings"
- ACCA Manual D, *Residential Duct Systems*
- F. M. White, *Fluid Mechanics* (1986): explicit solution of the Colebrook equation for diameter

This is for licensed mechanical engineers and designers. Always check the local code, the manufacturers' data and the project's requirements.
