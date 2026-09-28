---
layout: layouts/post.njk
title: "How to Use the Bilinear Interpolation Calculator"
seoTitle: "How to Use the Bilinear Interpolation Calculator"
description: "A step-by-step demonstration of the Bilinear Interpolation Calculator, reading a heat pump capacity between table rows and columns."
date: 2024-06-24T19:37:31.056Z
permalink: /post/how-to-use-the-bilinear-interpolation-calculator.html
ogImage: "/images/0179db_29a525e624cd4dda983b252a4c6d1ae6~mv2.jpg"
categories: ["equipment-selection", "hvac-engineering"]
---

![Adicot's bilinear interpolation calculator on the earlier version of the site](/images/0179db_29a525e624cd4dda983b252a4c6d1ae6~mv2.jpg)

This article demonstrates the Bilinear Interpolation Calculator. See the [calculator page](/bilinear-interpolation) to learn more about our methodology.

You can find all of our calculators on the [calculators page](/calculators), grouped by category.

Most of our calculators give the option to select metric or English units. For this calculator, as long as you stay consistent with units, you can use any units.

Example:

Suppose you want to calculate the Total Cooling Capacity of a 5-ton Bryant® package unit. A snippet of the equipment's performance data table at design conditions is provided. For our scenario, the design conditions are:

- Condenser Entering Air Temperature: 79 °F

- Evaporator Entering Wet Bulb Temperature: 65 °F

![Heat pump performance table: total capacity at 1,700 cfm for 63 and 67 °F entering wet bulb and 75 and 85 °F condenser air, highlighted](/images/0179db_cfb2287fd9f84b8ba363a4ac5082efe6~mv2.jpg)

Solution:

This problem will be solved three times. Solution 1 will be to perform linear interpolation three times using Steps 1, 2, and 3 as described in the methodology section. Solution 2 will use the combined bilinear interpolation equation shown in Step 4 of the methodology section. Solution 3 will show how to use the calculator to quickly and accurately obtain the results.

For all solutions, the inputs below come from the table or the given values:

P11 = 55.04 MBtuh

P12 = 59.00 MBtuh

P21 = 52.59 MBtuh

P22 = 56.34 MBtuh

x1 = 75 °F

x2 = 85 °F

y1 = 63 °F

y2 = 67 °F

x = 79 °F

y = 65 °F

Solution 1:

Step 1: Interpolate around point (x,y1)

R(x,y1) = P11(x2-x)/(x2-x1) + P21(x-x1)/(x2-x1)

= 55.04 (85-79)/(85-75) + 52.59 (79-75)/(85-75)

= 54.06 MBtuh

Step 2: Interpolate around point (x,y2)

R(x,y2) = P12(x2-x)/(x2-x1) + P22(x-x1)/(x2-x1)

= 59.00(85-79)/(85-75) + 56.34(79-75)/(85-75)

=57.936 MBtuh

Step 3: Perform a linear interpolation at point (x,y) using the results from Step 1 and Step 2:

R(x,y) = R(x,y1)(y2-y)/(y2-y1) + R(x,y2)(y-y1)/(y2-y1)

= 54.06(67-65)/(67-63) + 57.936(65-63)/(67-63)

=55.998 MBtuh

Solution 2:

The bilinear interpolation as a single equation as shown above:

R(x,y) = P11(x2-x)(y2-y)/((x2-x1)(y2-y1)) + P21(x-x1)(y2-y)/((x2-x1)(y2-y1)) + P12(x2-x)(y-y1)/((x2-x1)(y2-y1)) + P22(x-x1)(y-y1)/((x2-x1)(y2-y1))

R(x,y)=55.04(85-79)(67-65)/((85-75)(67-63))+52.59(79-75)(67-65)/((85-75)(67-63))+59.00(85-79)(65-63)/((85-75)(67-63))+56.34(79-75)(65-63)/((85-75)(67-63))

=55.998 MBtuh

Solution 3: To Solve using the calculator, enter the inputs in the same order they appear in the table. Below is a table showing the inputs. The result is shown in red in the middle of the table as 55.998 MBtuh.

![Calculator grid with the four table values and the interpolated result, 55.998, at 79 °F and 65 °F](/images/0179db_2e8009c679e844dc8f4ad19ce4116746~mv2.jpg)

- HVAC Engineering
- Equipment Selection
