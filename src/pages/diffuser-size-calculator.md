---
layout: layouts/page.njk
title: "Diffuser Size Calculator"
seoTitle: "Diffuser & Return Grille Size Calculator | adicot.com"
description: "Find the supply diffuser or return grille sizes for an airflow at a chosen neck velocity, with static pressure, throw and NC. US or metric units."
permalink: /diffuser-size-calculator.html
ogImage: "/images/0179db_66693b4dd80a41d48d597a49e90a7ede~mv2.png"
calcInclude: "partials/calc-diffuser-size.njk"
calculatorName: "Diffuser and Return Grille Size Calculator"
pageModule: calc-diffuser-size.js
calcSource: "Diffuser Size Calculator V3.20"
---

## How to use it

Review the method below to make sure it fits your project, then:

1. Choose US or metric units. Switching converts the values you have entered.
2. Choose the diffuser or grille type, from the Grille Tech or the AirGuide catalog. A picture and a link to the manufacturer appear under the results.
3. Enter the neck velocity you are designing for, in fpm (or m/s), and the airflow, in cfm (or l/s).
4. Optionally, enter the maximum noise criterion (NC) for the room.
5. The sizes that fit appear in the results with their airflow, throw and NC at each catalog velocity. The column the calculator read is shaded. Change the velocity to see how the choices, throw and noise move.

## Nomenclature

- **Neck velocity:** the air velocity through the diffuser's neck, in fpm (m/s).
- **Ps:** static pressure, in. wg (Pa). AirGuide's catalogs list total pressure (**TP**) instead.
- **NC:** noise criterion. "<20" is below 20; "-" means not rated (quiet).
- **Throw:** the distance the air travels before slowing to a terminal velocity, ft (m). Ceiling diffusers list two throws, to 100 and 50 fpm; AirGuide's sidewall grilles list three, to 150, 100 and 50 fpm.

## Method

A properly sized diffuser delivers its airflow at a neck velocity that keeps noise and pressure drop acceptable while throwing the air far enough to mix the room. The calculator reads a manufacturer's performance catalog for the type chosen, in the column of the highest catalog velocity at or below the one you enter (no interpolation), and lists every size that:

1. **Carries the airflow:** its rated airflow in that column is at least the required airflow;
2. **Is not oversized:** its largest rated airflow, at any velocity, is no more than four times the requirement; and
3. **Is not too big at low velocity:** its smallest rated airflow is no more than the requirement (1.2 times the requirement at 300 fpm or less).

For 55 cfm or less, the last two become "rated for 55 cfm or less at the lowest velocity" and "smallest rating 55 cfm or less", so the smallest sizes are offered.

If you give a maximum NC, a size is also left out when its NC in that column is above it.

In metric units, the airflow is converted to cfm (1 l/s = 2.11888 cfm, rounded to a whole cfm) and the velocity to fpm (1 m/s = 196.85 fpm), and the catalog is shown converted: airflow in l/s, pressure in Pa (1 in. wg = 249.09 Pa), throw in m.

**Example.** A 1-way curved blade ceiling diffuser for 200 cfm at 500 fpm: the 500 fpm column gives an 18×4 or 12×6 (220 cfm), a 20×4 or 16×6 (246 cfm) and a 24×4 (314 cfm). With a maximum NC of 30, none of them qualifies, since they rate NC 32–33 at 500 fpm. Drop the velocity to 400 fpm and the 24×4 qualifies: 251 cfm at NC 27.

## Choosing a noise criterion

Background sound from HVAC systems should suit the room: quieter for bedrooms, private offices, conference rooms and performance spaces; louder is acceptable in lobbies, corridors and open-plan offices. The ASHRAE Handbook—HVAC Applications, chapter 49, *Noise and Vibration Control*, Table 1, gives design guidelines for HVAC-related background sound by room type. See the [ASHRAE Handbook online](https://www.ashrae.org/technical-resources/ashrae-handbook/ashrae-handbook-online).

Note that a diffuser's catalog NC is for a single unit in a standard room; several diffusers in one space add up, and the room's absorption changes what is heard.

## Notes on the catalogs

- The catalogs are sample manufacturer data (Grille Tech and AirGuide), for preliminary selection. Confirm the final selection, and the pressure and throw, with your manufacturer's data.
- The AirGuide data are from AirGuide Manufacturing's performance data sheets: RA fixed blade return grilles, V/VH supply grilles and registers (sidewall, at 0°, 22½° and 45° blade deflection), and CB curved blade supply grilles and registers (1- to 4-way). Their throws are given at terminal velocities of 150, 100 and 50 fpm. The same selection rules apply to both catalogs. The AirGuide sheets have a few evident misprints (a throw that falls as velocity rises, such as 20-3-49 for 20-30-49); these are shown as printed.
- The 1-way multi-shutter ceiling diffuser uses the 1-way curved blade catalog's ratings.
- The 2-, 3- and 4-way ceiling catalogs share airflow, NC and pressure ratings with the 1-way; only the throws differ.

Adicot is not affiliated with, and does not recommend, any diffuser or grille manufacturer. Any references or links to specific manufacturers are for illustration only.
