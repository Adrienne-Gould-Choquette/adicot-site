---
layout: layouts/page.njk
title: "SH Window Size Chart Converter"
seoTitle: "SH Window Size Chart Calculator | adicot.com"
description: "Converts single hung window size codes, such as SH 24 or SH H32, to the frame size, masonry opening and clear opening."
permalink: /sh-window-size-chart.html
ogImage: "/images/0179db_0c66d828e1144fcaa831f8e3ed883df4~mv2.png"
calcInclude: "partials/calc-shwindow.njk"
calculatorName: "SH Window Size Chart Converter"
pageModule: calc-shwindow.js
calcSource: "Window Size Chart V1.3"
---

Architects and engineers often use an abbreviated nomenclature to denote the size of single-hung windows. Measurements vary slightly between manufacturers, so use this converter as a general guide to window frame, masonry opening and clear opening sizes. For the most accurate results, verify the actual dimensions with the manufacturer.

## How to use it

1. Choose the window size code.
2. The single-hung window's frame size, masonry opening and clear opening appear in the results.

Egress windows are marked with an "\*".

For the code default U-factor and SHGC of a window, use the [U-factor and SHGC default values](/iecc-window-u-shgc-default-values) lookup; to compare heating and cooling equipment efficiencies, use the [efficiency converter](/eer-seer2-cop-hspf2-kwton-converter).

## Single-hung window size chart

Width × height, in inches.

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Size code</th><th scope="col">Frame size</th><th scope="col">Masonry opening</th><th scope="col">Clear opening</th></tr></thead>
  <tbody>
  {%- for w in shWindows %}
    <tr><th scope="row">{{ w.code }}</th><td>{{ w.frame }}</td><td>{{ w.masonry }}</td><td>{{ w.clear }}</td></tr>
  {%- endfor %}
  </tbody>
</table>
</div>

\* Egress on all floors.
