---
layout: layouts/page.njk
title: "International Energy Conservation Code\nWindow U-Factors & SHGC Default Values"
seoTitle: "IECC Window U/SHGC Default Values | adicot.com"
description: "Look up the default window, skylight and door U-factor, SHGC and VT from the 2024 IECC and the 2023 Florida Building Code, Tables C303.1.3(1) to (3)."
permalink: /iecc-window-u-shgc-default-values.html
ogImage: "/images/0179db_514a2c8568f8460db7f449213ca34fc4~mv2.png"
calcInclude: "partials/calc-fenestration.njk"
calculatorName: "Window U-Factor and SHGC Default Values"
pageModule: calc-fenestration.js
calcSource: "Window Default Fenestration U_SHGC - 2023 FBC V1.2"
service: energy-code-compliance
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

**Windows, glass doors and skylights**

1. Choose the frame type.
2. Choose single or double pane.
3. Choose clear or tinted glazing.
4. The code default U-factor, SHGC and VT appear in the results.

**Doors**

1. Choose the door type.
2. The code default U-factor appears in the results.

**Note:** NFRC's Certified Product Directory lists the rated U-factor and SHGC of specific windows, which you should use where the product is known. To turn a single-hung window size code such as SH24 into frame and opening sizes, use the [SH-# window size converter](/sh-window-size-chart).

## Methodology

NFRC U-factor and SHGC values are critical when performing cooling load calculations and energy code compliance calculations. New windows have these values on their NFRC labels. Where the windows no longer have an NFRC label, the International Energy Conservation Code (IECC) and the Florida Energy Conservation Code (FECC) provide default U-factor, SHGC and VT values. The values below are taken directly from the 2024 International Energy Conservation Code and the 2023 Florida Building Code, Energy Conservation (8th edition), Tables C303.1.3(1), (2) and (3); the two codes give identical values, unchanged from the 2021 IECC and 2020 FBC.

### Table C303.1.3(1): default glazed fenestration U-factors

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Frame type</th><th scope="col">Single pane</th><th scope="col">Double pane</th></tr></thead>
  <tbody>
  {%- for r in fenestration.uRows %}
    <tr><th scope="row">{{ r.frame }}</th><td>{{ r.single }}</td><td>{{ r.double }}</td></tr>
  {%- endfor %}
  </tbody>
</table>
</div>

### Table C303.1.3(2): default opaque door U-factors

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Door type</th><th scope="col">U-factor</th></tr></thead>
  <tbody>
  {%- for d in fenestration.doors %}
    <tr><th scope="row">{{ d[0] }}</th><td>{{ d[1] }}</td></tr>
  {%- endfor %}
  </tbody>
</table>
</div>

### Table C303.1.3(3): default window, glass door and skylight SHGC and VT

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Glazing</th><th scope="col">SHGC</th><th scope="col">VT</th></tr></thead>
  <tbody>
  {%- for r in fenestration.shgcRows %}
    <tr><th scope="row">{{ r.panes }}, {{ r.glazing | lower }}</th><td>{{ r.shgc }}</td><td>{{ r.vt }}</td></tr>
  {%- endfor %}
    <tr><th scope="row">Glazed block</th><td>0.6</td><td>0.6</td></tr>
  </tbody>
</table>
</div>

## Examples

**Example 1:** you are performing a load calculation for an existing building. On a site visit you see that the existing windows have metal frames and single-pane glass with no tinting. What U-factor, SHGC and VT should you use for the windows?

- Find the U-factor from Table C303.1.3(1) by looking up metal frame, single pane: **U-factor = 1.2**
- Find the SHGC and VT from Table C303.1.3(3) by looking up single pane, clear: **SHGC = 0.8, VT = 0.6**

**Example 2:** on the same site visit you see that the existing doors are uninsulated metal. What U-factor should you use?

- Find the U-factor from Table C303.1.3(2) by looking up uninsulated metal: **U-factor = 1.2**

To solve both examples with the lookup above, choose Metal, Single, Clear and Uninsulated Metal.
