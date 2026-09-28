---
layout: layouts/page.njk
title: "Present Value & Future Value Calculator"
seoTitle: "Present Value & Future Value Calculator | adicot.com"
description: "Engineering economics calculator: solves for present worth (P), future worth (F), uniform series (A) and uniform gradient (G), given i% and n."
permalink: /present-future-value-calculator.html
ogImage: "/images/0179db_97806967d0554982ae43e388dc4d39e5~mv2.png"
calcInclude: "partials/calc-econ.njk"
calculatorName: "Present Value and Future Value Calculator"
pageModule: calc-econ.js
calcSource: "Engineering Economics V1.4"
---

## How to use it

1. Choose what to find: the future value F, the present value P, or the uniform series A.
2. Enter any of the given amounts that apply (present value, future value, uniform series, arithmetic gradient) and leave the others blank. Several can be combined; each is converted with its own factor and the results are added.
3. Enter the interest rate per period, in percent, and the number of periods.
4. The result appears and updates as you type. A 0 % rate is handled exactly.

## Methodology, equations and examples

This calculator applies standard engineering-economics time-value-of-money formulas to convert between present value (P), future value (F), uniform series (A), and arithmetic gradient (G). It follows the notation used in typical engineering-economy texts (e.g., Blank & Tarquin; Newnan). The goal is to let engineers quickly evaluate cash-flow alternatives.

### Key idea: the time value of money

A dollar today is worth more than a dollar later because of interest, inflation, and opportunity cost. Therefore, cash flows must be brought to a common point in time — present or future — before comparing alternatives.

### Variables

- P – Present Value (today’s worth of a cash flow)

- F – Future Value (amount at the end of n periods)

- A – Uniform Series (equal payment each period)

- G – Arithmetic Gradient (cash flow that increases by a constant amount each period)

- i – Interest or discount rate per period

- n – Number of periods

Note: the period for i and n must match (e.g., 12% annual for 10 years, or 1% monthly for 24 months).

Here are the formulas used in the Engineering Economics Calculator, along with examples for each:

Compound Amount (F/P, i, n):
The compound amount formula (F/P) calculates the future value of a present sum of money after compounding at a given interest rate for a specific number of periods.

To find F, given P: (F/P, i, n) F = P(1+i)^n

Example: If you invest $5,000 in a savings account with an annual interest rate of 5%, how much will you have after 10 years?

F = $5,000 x (1 + 0.05)^10 = $8,144.47

Present Worth (P/F, i, n):
The present worth formula (P/F) computes the current value of a future sum of money that will be received or paid at a future date, discounted back to the present at a given interest rate.

To find P, given F: (P/F, i, n) P = F(1+i)^(-n)

Example: If you expect to receive $10,000 3 years from now, and the discount rate is 4%, what is the present value of that amount?

P = $10,000 x (1 + 0.04)^-3 = $8,889.96

Series Compound Amount (F/A, i, n):
The series compound amount (F/A) formula determines the future value of equal cash flows invested or received at regular intervals over a specific period at a given interest rate.

To find F, given A: (F/A, i, n) F = A [ ( (1+i)^n - 1) / i ]

Example: If you invest $500 at the end of each year for the next 8 years with an interest rate of 8%, how much will you have at the end of 8 years?

F = $500 x [((1 + 0.08)^8 - 1) / 0.08 ] = $5,318.31

Series Present Worth (P/A, i, n):

The series present worth formula (P/A) calculates the equivalent present value of equal cash flows received or paid at regular intervals over a specific period at a given interest rate.

To find P, given A: (P/A, i, n) P = A [ ((1+i)^n - 1) / (i (1+i)^n ) ]

Example: You will receive $1,000 at the end of each year for the next 5 years, and the interest rate is 7%. What is the present value of this cash flow series?

P = $1,000 x [ ((1 + 0.07)^5 - 1) / (0.07 (1 + 0.07)^5) ] = $4,100.20

Sinking Fund (A/F,i,n):

The sinking fund factor (A/F) calculates the regular payments (or deposits) needed to accumulate a specified amount of money in a fund at a future time, with a given interest rate. It is commonly used to plan for the replacement or upgrade of an asset.

To find A, given F: (A/F, i, n) A = F x i / [ (1+i)^n - 1 ]

Example: You want to accumulate $10,000 in a sinking fund over 5 years with an annual interest rate of 6%. Using the sinking fund formula, you can calculate the regular payments required:

A = $10,000 x 0.06 / [ (1 + 0.06)^5 - 1] = $1,773.96

Capital Recovery (A/P,i,n):

The capital recovery factor (A/P) calculates the equal periodic payments required to recover the initial investment and cover the interest costs over a specific period.

To find A, given P: (A/P, i, n) A = P [ i (1+i)^n / ((1+i)^n - 1) ]

Example: You need to recover an initial investment of $50,000 over 10 years with an annual interest rate of 8%. Using the capital recovery formula, you can calculate the equal periodic payments required:

A = $50,000 x [0.08 (1+0.08)^10 / ((1+0.08)^10 - 1) ] = $7,451.47

Compound Gradient (F/G):

The compound gradient factor (F/G) calculates the future value of a series of increasing or decreasing cash flows that compound at a given interest rate.

To Find F, given G: (F/G, i, n) F = G x [ (1+i)^n - 1 - ni ] / i^2

Example: Suppose you have a series of cash flows that increase by $2,000 every year for 8 years, and the interest rate is 5%. Using the compound gradient formula, you can calculate the future value of the cash flows:

F = $2,000 x [ (1 + 0.05)^8 - 1 - 8 x 0.05 ] / 0.05^2 = $61,964.36

Discount Gradient (P/G):

The discount gradient factor (P/G) is used in engineering economics to calculate the present worth of a series of cash flows that change over time. It considers both the time value of money and the gradient, which represents the rate of change of the cash flows.

To find P, given G: (P/G, i, n) P = G x [ ((1+i)^n - in - 1) / ((i^2) (1+i)^n ) ]

Example: Suppose you have a series of cash flows that increase by $2,000 every year for 8 years, and the interest rate is 5%. Using the discount gradient formula, you can calculate the present value of the cash flows:

P = $2,000 x [ ((1 + 0.05)^8 - 0.05 x 8 - 1) / (0.05^2 x (1 + 0.05)^8) ] = $41,939.91

Arithmetic Gradient Uniform Series (A/G):

The arithmetic gradient uniform series factor (A/G) converts a gradient series, cash flows that grow by a constant amount each period, into an equivalent uniform series.

To find A, given G: (A/G, i, n) A = G x [ 1/i − n / ((1+i)^n − 1) ]

Example: Suppose you are considering a project that will generate an increasing annual cash flow with a constant gradient of $2,000 per year for a duration of 8 years. The interest rate for the project is 5% per year.

A = $2,000 x [ 1/0.05 − 8 / ((1 + 0.05)^8 − 1) ] = $6,489.02
