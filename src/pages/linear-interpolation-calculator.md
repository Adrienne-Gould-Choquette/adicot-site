---
layout: layouts/page.njk
title: "Linear Interpolation"
seoTitle: "Linear Interpolation Calculator | adicot.com"
description: "Find y at a given x, or x at a given y, between two known points, with the equation, a graph and a worked HVAC example. Free and easy to use."
permalink: /linear-interpolation-calculator.html
ogImage: "/images/0179db_00a34d72e05d42ddb1927ff52749af93~mv2.jpg"
calcInclude: "partials/calc-linear.njk"
calculatorName: "Linear Interpolation Calculator"
pageModule: calc-linear.js
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Enter the two known points, (x<sub>1</sub>, y<sub>1</sub>) and (x<sub>2</sub>, y<sub>2</sub>).
2. Choose whether to find y at a given x, or x at a given y.
3. Enter that x (or y). The result and a graph of the line appear as you type. If the value is outside the two known points, the calculator says so: that is an extrapolation, not an interpolation.

Read more in our blog post, [Unlock the power of precision with our linear interpolation calculator](/post/unlock-the-power-of-precision-with-our-linear-interpolation-calculator).

## Methodology, equations and examples

Linear interpolation is a numerical method for estimating values between two known data points by assuming a straight line between them. It is a basic form of interpolation: when the data between two points is close to a straight line, linear interpolation fills in the values in between.

Linear interpolation is used in mathematics, computer graphics, data analysis and engineering. It gives a simple, quick approximation of missing or intermediate values, especially when the data lies close to a straight line. For more complex curves, or where a smoother fit is needed, other methods such as spline interpolation may be more appropriate.

To perform linear interpolation, we need two adjacent data points, (x<sub>1</sub>, y<sub>1</sub>) and (x<sub>2</sub>, y<sub>2</sub>). The goal is to estimate the value of an unknown point (x, y) on the line between them:

![Linear Interpolation Graph](/images/0179db_214bac8b1a544a64a2119ae09a6caeeb~mv2.jpg)

**y = y<sub>1</sub>(x<sub>2</sub> − x)/(x<sub>2</sub> − x<sub>1</sub>) + y<sub>2</sub>(x − x<sub>1</sub>)/(x<sub>2</sub> − x<sub>1</sub>)**

Here (x − x<sub>1</sub>) is the distance from the first known point to the unknown point, (x<sub>2</sub> − x) the distance from the unknown point to the second, and (x<sub>2</sub> − x<sub>1</sub>) the distance between the two known points. Their ratios place the unknown point along the line joining the two known points. Solving the same line for x gives the x at a given y:

**x = x<sub>1</sub>(y<sub>2</sub> − y)/(y<sub>2</sub> − y<sub>1</sub>) + x<sub>2</sub>(y − y<sub>1</sub>)/(y<sub>2</sub> − y<sub>1</sub>)**

Linear interpolation assumes a straight line between the points, which is not always accurate, particularly if the data follows a more complex pattern. In such cases spline interpolation or another method may give better results. Within a small range, though, linear interpolation is a simple and quick estimate.

### Example

Suppose you want the total cooling capacity of a Bryant® packaged air conditioning unit from its performance data table, at these design conditions:

- Condenser entering air temperature: 79 °F
- Evaporator entering wet bulb temperature: 63 °F

From the manufacturer's table, at 63 °F entering wet bulb:

- x<sub>1</sub> = 75 °F, y<sub>1</sub> = 55.04 MBtuh (total capacity at 75 °F condenser entering air)
- x<sub>2</sub> = 85 °F, y<sub>2</sub> = 52.59 MBtuh (total capacity at 85 °F)
- x = 79 °F

![Bryant® packaged air conditioning unit performance data](/images/0179db_3ff5ff974db746118fab79d62bda0d79~mv2.jpg)

**Solution 1, graphically.** Plot the two known points, (75 °F, 55.04 MBtuh) and (85 °F, 52.59 MBtuh), and draw a straight line between them. Draw a vertical line at x = 79 °F, and from where it meets the line, a horizontal line to the y-axis. It reads about 54 MBtuh.

![Linear interpolation graph](/images/0179db_ee5f5091ee5943f680d7da045a83365a~mv2.jpg)

**Solution 2, by the equation.**

y = 55.04 × (85 − 79)/(85 − 75) + 52.59 × (79 − 75)/(85 − 75) = 33.024 + 21.036 = 54.06 MBtuh

**Solution 3, with the calculator.** Enter the same values. The result is 54.06 MBtuh, the calculator's starting example.

So at 79 °F condenser entering air, the total cooling capacity is about 54.06 MBtuh.

## Why use linear interpolation

- **Data approximation:** estimate values between known data points, such as between the rows and columns of an equipment performance table.
- **Data visualization:** fill in missing or incomplete points to plot a continuous series.
- **Function approximation:** approximate a function from a set of discrete data points by joining them with straight lines, where the function itself is not known or is hard to compute.
- **Time series:** fill in missing values in a sequence from the values either side.
- **Numerical methods:** linear interpolation is a building block for more complex schemes, such as cubic spline interpolation.

To interpolate between four points, in two directions at once, use the [bilinear interpolation calculator](/bilinear-interpolation).
