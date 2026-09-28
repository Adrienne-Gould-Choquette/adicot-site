---
layout: layouts/page.njk
title: "Bilinear Interpolation / Double Interpolation"
seoTitle: "Bilinear Interpolation Calculator | adicot.com"
description: "Estimate a value between four known points on a grid, such as a reading between the rows and columns of an equipment performance table."
permalink: /bilinear-interpolation.html
ogImage: "/images/0179db_29a525e624cd4dda983b252a4c6d1ae6~mv2.jpg"
calcInclude: "partials/calc-bilinear.njk"
calculatorName: "Bilinear Interpolation Calculator"
pageModule: calc-bilinear.js
calcSource: "Bilinear Interpolation V1.9"
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Enter x<sub>1</sub> and x<sub>2</sub>, the known bounding values for x, across the top, and x, the value you are interpolating for, between them.
2. Enter y<sub>1</sub> and y<sub>2</sub>, the known bounding values for y, down the side, and y between them.
3. Enter P<sub>11</sub>, P<sub>12</sub>, P<sub>21</sub> and P<sub>22</sub>, the known values at (x<sub>1</sub>,y<sub>1</sub>), (x<sub>1</sub>,y<sub>2</sub>), (x<sub>2</sub>,y<sub>1</sub>) and (x<sub>2</sub>,y<sub>2</sub>), in the corners.
4. The interpolated value appears in the center of the grid, and updates as you type.

For interpolating between two points on a line, use the [linear interpolation calculator](/linear-interpolation-calculator).

## Methodology, equations and example

This calculator returns an interpolated value using bilinear interpolation. "Bilinear" refers to a technique that uses the values at the four nearest data points to estimate the value at a point within the grid. The four points form a rectangle, and the interpolation is a weighted average of their values based on the distance of each from the point of interest. The technique is also called double interpolation, or bilinear filtering in some contexts.

The weights come from the distances between the point of interest and each of the four surrounding points: the closer a point is, the more it contributes. Each known value is multiplied by its weight, and the results are summed.

The method of bilinear, or double, interpolation:

**Step 1:** linear interpolation at point (x,y<sub>1</sub>):
R(x,y<sub>1</sub>) = P<sub>11</sub>(x<sub>2</sub>−x)/(x<sub>2</sub>−x<sub>1</sub>) + P<sub>21</sub>(x−x<sub>1</sub>)/(x<sub>2</sub>−x<sub>1</sub>)

**Step 2:** linear interpolation at point (x,y<sub>2</sub>):
R(x,y<sub>2</sub>) = P<sub>12</sub>(x<sub>2</sub>−x)/(x<sub>2</sub>−x<sub>1</sub>) + P<sub>22</sub>(x−x<sub>1</sub>)/(x<sub>2</sub>−x<sub>1</sub>)

**Step 3:** linear interpolation at point (x,y) using the results of Steps 1 and 2:
R(x,y) = R(x,y<sub>1</sub>)(y<sub>2</sub>−y)/(y<sub>2</sub>−y<sub>1</sub>) + R(x,y<sub>2</sub>)(y−y<sub>1</sub>)/(y<sub>2</sub>−y<sub>1</sub>)

**Step 4:** substituting R(x,y<sub>1</sub>) and R(x,y<sub>2</sub>) gives the interpolated value at (x,y) as a single equation:
R(x,y) = P<sub>11</sub>(x<sub>2</sub>−x)(y<sub>2</sub>−y)/((x<sub>2</sub>−x<sub>1</sub>)(y<sub>2</sub>−y<sub>1</sub>)) + P<sub>21</sub>(x−x<sub>1</sub>)(y<sub>2</sub>−y)/((x<sub>2</sub>−x<sub>1</sub>)(y<sub>2</sub>−y<sub>1</sub>)) + P<sub>12</sub>(x<sub>2</sub>−x)(y−y<sub>1</sub>)/((x<sub>2</sub>−x<sub>1</sub>)(y<sub>2</sub>−y<sub>1</sub>)) + P<sub>22</sub>(x−x<sub>1</sub>)(y−y<sub>1</sub>)/((x<sub>2</sub>−x<sub>1</sub>)(y<sub>2</sub>−y<sub>1</sub>))

The graph with the results above shows the four points and the point being interpolated.

### Example

Calculate the total cooling capacity of a 5-ton Bryant® package unit from its performance data table, at design conditions of 79 °F condenser entering air and 65 °F evaporator entering wet bulb.

![Bilinear Interpolation Performance Data at Design Conditions](/images/0179db_75ddb8498ef740d7b716aaad31b7ea46~mv2.jpg)

The example is solved two ways: first by three linear interpolations (Steps 1 to 3), then with the single bilinear equation (Step 4). From the table and the design conditions:

- P<sub>11</sub> = 55.04 MBtuh, P<sub>12</sub> = 59.00 MBtuh, P<sub>21</sub> = 52.59 MBtuh, P<sub>22</sub> = 56.34 MBtuh
- x<sub>1</sub> = 75 °F, x<sub>2</sub> = 85 °F, x = 79 °F
- y<sub>1</sub> = 63 °F, y<sub>2</sub> = 67 °F, y = 65 °F

![Bilinear Interpolation-Example Problem](/images/0179db_7dedd71d65ec4896a4142422e756c5c1~mv2.jpg)

**Solution 1: three linear interpolations**

- Step 1, at (x,y<sub>1</sub>): R = 55.04 (85−79)/(85−75) + 52.59 (79−75)/(85−75) = 54.06 MBtuh
- Step 2, at (x,y<sub>2</sub>): R = 59.00 (85−79)/(85−75) + 56.34 (79−75)/(85−75) = 57.936 MBtuh
- Step 3, at (x,y): R = 54.06 (67−65)/(67−63) + 57.936 (65−63)/(67−63) = 55.998 MBtuh

**Solution 2: the single equation**

R(x,y) = 55.04(85−79)(67−65)/((85−75)(67−63)) + 52.59(79−75)(67−65)/((85−75)(67−63)) + 59.00(85−79)(65−63)/((85−75)(67−63)) + 56.34(79−75)(65−63)/((85−75)(67−63)) = 55.998 MBtuh

**Solution 3: the calculator.** Enter the values in the grid above as they appear in the performance table; the center shows 55.998.
