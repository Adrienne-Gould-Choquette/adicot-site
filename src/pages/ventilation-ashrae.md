---
layout: layouts/page.njk
title: "Ventilation Rates: ASHRAE 62.1, IMC, FBC, ASHRAE 170 and 62.2"
seoTitle: "Ventilation Rate Calculator: ASHRAE 62.1 & IMC | adicot.com"
description: "Look up outdoor air and exhaust rates from ASHRAE 62.1, 62.2 and 170, the IMC and the Florida Building Code, and calculate the airflow for your space."
permalink: /ventilation-ashrae.html
ogImage: "/images/0179db_2749b1324ffe42c68cc8af12b23ae74a~mv2.png"
calcInclude: "partials/calc-ashrae621.njk"
calculatorName: "Ventilation and Exhaust Rates"
pageModule: calc-ashrae621.js
calcSource: "ANSI/ASHRAE Standard 62.1-2025"
service: cooling-load-calculations
---

## How to use it

Review the methodology below to make sure it aligns with your project's requirements, then:

1. Choose the standard or code: ASHRAE 62.1-2025, the 2024 IMC, the Florida Building Code, Mechanical (2023 or 2026 edition), ASHRAE 170-2021 for inpatient health care spaces, or ASHRAE 62.2-2025 for dwelling units.
2. Choose the occupancy category or space. Type any part of its name, such as “exam” or “locker”, to narrow the list, or open the list to browse every entry under its heading.
3. The table's rates for that space appear in the results, with the notes that apply.
4. Optionally, enter the floor area (and, for ASHRAE 170, the ceiling height; for 62.2, the number of bedrooms) to turn the rates into airflow. For 62.1 and the IMC, enter the number of occupants if you know it; otherwise the table's default occupant density is used.

The calculator remembers your last entries in this browser. Use **Copy link to these results** to save or share a calculation.

## Methodology

ANSI/ASHRAE Standard 62.1, *Ventilation and Acceptable Indoor Air Quality*, sets minimum ventilation rates for commercial and institutional buildings by occupancy category. This calculator uses the 2025 edition, and three of its tables:

- **Table 6-1, Minimum Ventilation Rates in Breathing Zone:** the people outdoor air rate R<sub>p</sub>, the area outdoor air rate R<sub>a</sub>, the default occupant density, the air class, whether the space may use occupied-standby (OS, Section 6.2.6.2), and the maximum CO<sub>2</sub> above ambient, ΔC<sub>6.1</sub>, used for CO<sub>2</sub>-based demand-controlled ventilation. "NA" means the standard gives no CO<sub>2</sub> limit for that space.
- **Table E-1 (Normative Appendix E), outpatient health care:** the same rates for outpatient spaces the authority having jurisdiction has deemed Standard 170 not to cover.
- **Table 6-2, Minimum Exhaust Rates:** exhaust per unit (per kitchen, toilet room, fixture or shower head), per floor area, or both, and the air class. The requirements tied to particular spaces (auto repair, parking garages, commercial kitchens, laboratories, toilets) are shown with the result, with their section numbers.

The 2025 edition changed more than its layout. It lowered the default occupant density for many spaces (restaurant dining 70 to 67, casinos 120 to 91, beauty and nail salons 25 to 7, for example), cut science laboratory exhaust from 1.00 to 0.35 cfm/ft², added rows such as educational corridors and information technology equipment rooms and a Residential heading, renamed others, and replaced Table 6-2's lettered notes with continuous and intermittent rates and requirements in Section 6.5. Paint spray booths and refrigerating machinery rooms moved to Table 6-3 (airstreams), which gives only an air class.

A dash (—) is the standard's "not applicable". The metric rates are the standard's own metric values, which are rounded, not exact conversions of the inch-pound values.

### Breathing-zone outdoor airflow

The Ventilation Rate Procedure's breathing-zone outdoor airflow (Equation 6-1) is

V<sub>bz</sub> = R<sub>p</sub> × P<sub>z</sub> + R<sub>a</sub> × A<sub>z</sub>

where:

- V<sub>bz</sub> = breathing-zone outdoor airflow, cfm (L/s)
- R<sub>p</sub> = people outdoor air rate, cfm/person (L/s·person)
- P<sub>z</sub> = zone population, the largest number of people expected to occupy the zone in typical usage
- R<sub>a</sub> = area outdoor air rate, cfm/ft² (L/s·m²)
- A<sub>z</sub> = zone floor area, ft² (m²)

Where the population is not known, P<sub>z</sub> is the default occupant density times the floor area: per 1,000 ft², or per 100 m².

V<sub>bz</sub> is the breathing-zone requirement only. The zone and system outdoor air intake also depend on the zone air distribution effectiveness and the system ventilation efficiency, which this calculator does not apply.

### Exhaust

The minimum exhaust depends on the category and may be given per unit, per floor area, or both. Where a rate is given per floor area, the calculator multiplies it by the zone's floor area. Dwelling-unit kitchens, shower rooms and toilets have two per-unit rates, shown as a pair such as 50/70 cfm: the first for continuous operation, the second for intermittent operation, which is intended to run whenever the space is in use.

### Worked examples

**Retail, pet shop (animal areas), 2,000 ft².** Table 6-1 gives R<sub>p</sub> = 7.5 cfm/person, R<sub>a</sub> = 0.18 cfm/ft², a default density of 10 people per 1,000 ft² and air class 2.

- P<sub>z</sub> = 2,000 ft² × 10 / 1,000 ft² = 20 people
- V<sub>bz</sub> = 7.5 × 20 + 0.18 × 2,000 = 150 + 360 = 510 cfm

Table 6-2 gives 0.90 cfm/ft², air class 2, so the minimum exhaust is 0.90 × 2,000 = 1,800 cfm.

**Office space, 5,000 ft².** Table 6-1 gives R<sub>p</sub> = 5 cfm/person, R<sub>a</sub> = 0.06 cfm/ft², a default density of 5 people per 1,000 ft², air class 1, occupied-standby allowed and a maximum CO<sub>2</sub> of 600 ppm above ambient.

- P<sub>z</sub> = 5,000 ft² × 5 / 1,000 ft² = 25 people
- V<sub>bz</sub> = 5 × 25 + 0.06 × 5,000 = 125 + 300 = 425 cfm

**Soiled laundry storage room, 500 ft².** Table 6-2 gives 1.00 cfm/ft² and air class 3, so the minimum exhaust is 1.00 × 500 = 500 cfm.

### Air classes

The standard classes air by its contaminant concentration, sensory-irritation intensity and odor, and limits where each class may be recirculated or transferred:

- **Class 1:** low contaminant concentration, low sensory-irritation intensity and inoffensive odor.
- **Class 2:** moderate contaminant concentration, mild sensory-irritation intensity or mildly offensive odors.
- **Class 3:** significant contaminant concentration, significant sensory-irritation intensity or offensive odor.
- **Class 4:** highly objectionable fumes or gases, or potentially dangerous particles, bioaerosols or gases.

### Considerations

- **Actual occupancy.** The default densities are for when the actual occupancy is not known. Use the design occupancy when you have it.
- **Supply and exhaust.** Some spaces have both a Table 6-1 ventilation rate and a Table 6-2 exhaust rate; the results show both.
- **Outpatient health care.** These rates are from Normative Appendix E of Standard 62.1-2025, for spaces in outpatient facilities the authority having jurisdiction has deemed ASHRAE/ASHE Standard 170 not to cover. The dental rates are intended only for outpatient dental clinics where the amount of nitrous oxide is limited, not for dental operatories in institutional buildings where nitrous oxide is piped.
- **Airborne infection.** The standard notes that the outpatient rates provide for acceptable indoor air quality; they do not address the airborne transmission of viruses, bacteria and other infectious contagions.
- **Laboratories and animal facilities.** Laboratories that comply with ANSI/ASSP Z9.5, and animal facilities with a risk evaluation by the owner's environmental health and safety professional, need not meet the Table 6-1 and 6-2 rates (Sections 6.2.1.1.4 and 6.2.1.1.5).
- **Codes.** This is for education and reference. Always consult the complete ASHRAE Standard 62.1, the edition your code adopts, and the applicable local codes for design and compliance.

## Other standards and codes

### 2024 IMC and the Florida Building Code, Mechanical

The International Mechanical Code sets its own minimum ventilation rates in Table 403.3.1.1, with the same breathing-zone equation as ASHRAE 62.1 (IMC Equation 4-1): V<sub>bz</sub> = R<sub>p</sub> × P<sub>z</sub> + R<sub>a</sub> × A<sub>z</sub>. The table also gives the exhaust rate for each occupancy, per square foot of floor area or, where a note says so, per room or per fixture. The IMC's categories and some rates differ from ASHRAE 62.1, so use the table your jurisdiction has adopted.

Florida adopts the IMC with amendments as the Florida Building Code, Mechanical. The 2026 Ninth Edition (based on the 2024 IMC) has the same Table 403.3.1.1 values as the 2024 IMC. The 2023 Eighth Edition (based on the 2021 IMC) has fewer categories: it has no animal facilities or outpatient health care rows, for example. The IMC and FBC tables are in inch-pound units only.

### ASHRAE 170-2021, inpatient health care

ANSI/ASHRAE/ASHE Standard 170, *Ventilation of Health Care Facilities*, sets design parameters for each space in Table 7-1: the pressure relationship to adjacent areas, the minimum outdoor and total air changes per hour, whether all room air must be exhausted directly outdoors, whether room recirculating units are allowed, unoccupied turndown, minimum filter efficiency, and the design relative humidity and temperature. Given the floor area and ceiling height, the calculator converts the air change rates to airflow:

Q = ach × room volume / 60, in cfm (ft³), or ach × room volume / 3.6, in L/s (m³)

The notes shown with each space are short summaries. Read the full note in the standard before relying on it. Outpatient spaces (Table 8-1) and residential health care (Table 9-1) are not included.

### ASHRAE 62.2-2025, dwelling units

ANSI/ASHRAE Standard 62.2, *Ventilation and Acceptable Indoor Air Quality in Residential Buildings*, sets the continuous whole-dwelling ventilation rate (Equation 4-1):

Q<sub>tot</sub> = 0.03 A<sub>floor</sub> + 7.5 (N<sub>br</sub> + 1), in cfm, with A<sub>floor</sub> in ft²; or 0.15 A<sub>floor</sub> + 3.5 (N<sub>br</sub> + 1), in L/s, with A<sub>floor</sub> in m²

where N<sub>br</sub> is the number of bedrooms, not less than 1. For example, a 2,000 ft² three-bedroom house needs 0.03 × 2,000 + 7.5 × 4 = 90 cfm. The standard also sets local exhaust for kitchens, bathrooms and toilet rooms (Tables 5-1 and 5-2), shown with the result. Its infiltration credit (Section 4.1.2), which needs a blower door test, is not applied.

## Table 6-1: Minimum ventilation rates in breathing zone

From ANSI/ASHRAE Standard 62.1-2025. A blank cell is one the standard leaves blank.

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Occupancy category</th><th scope="col">R<sub>p</sub> cfm/person</th><th scope="col">R<sub>p</sub> L/s·person</th><th scope="col">R<sub>a</sub> cfm/ft²</th><th scope="col">R<sub>a</sub> L/s·m²</th><th scope="col">Default density, #/1,000 ft² (#/100 m²)</th><th scope="col">Air class</th><th scope="col">OS (6.2.6.2)</th><th scope="col">Max. CO<sub>2</sub> above ambient, ppm</th></tr></thead>
  <tbody>
  {%- for r in ashrae621.table61 %}
    <tr><th scope="row">{{ r[0] }}</th><td>{{ r[1] }}</td><td>{{ r[2] }}</td><td>{{ r[3] }}</td><td>{{ r[4] }}</td><td>{{ r[5] }}</td><td>{{ r[6] }}</td><td>{{ r[8] }}</td><td>{{ r[7] }}</td></tr>
  {%- endfor %}
  </tbody>
</table>
</div>

## Table E-1: Outpatient health care facilities

From ANSI/ASHRAE Standard 62.1-2025, Normative Appendix E, for outpatient spaces the authority having jurisdiction has deemed Standard 170 not to cover.

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Occupancy category</th><th scope="col">R<sub>p</sub> cfm/person</th><th scope="col">R<sub>p</sub> L/s·person</th><th scope="col">R<sub>a</sub> cfm/ft²</th><th scope="col">R<sub>a</sub> L/s·m²</th><th scope="col">Default density, #/1,000 ft² (#/100 m²)</th><th scope="col">Air class</th></tr></thead>
  <tbody>
  {%- for r in ashrae621.tableE1 %}
    <tr><th scope="row">{{ r[0] | replace("Outpatient Health Care Facilities-", "") }}</th><td>{{ r[1] }}</td><td>{{ r[2] }}</td><td>{{ r[3] }}</td><td>{{ r[4] }}</td><td>{{ r[5] }}</td><td>{{ r[6] }}</td></tr>
  {%- endfor %}
  </tbody>
</table>
</div>

## Table 6-2: Minimum exhaust rates

From ANSI/ASHRAE Standard 62.1-2025. A pair such as 50/100 is the continuous / intermittent operation rate.

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Occupancy category</th><th scope="col">cfm/unit</th><th scope="col">cfm/ft²</th><th scope="col">L/s·unit</th><th scope="col">L/s·m²</th><th scope="col">Air class</th></tr></thead>
  <tbody>
  {%- for r in ashrae621.table62 %}
    <tr><th scope="row">{{ r[0] }}</th><td>{{ r[1] }}</td><td>{{ r[2] }}</td><td>{{ r[3] }}</td><td>{{ r[4] }}</td><td>{{ r[5] }}</td></tr>
  {%- endfor %}
  </tbody>
</table>
</div>

## 2024 IMC Table 403.3.1.1: Minimum ventilation rates

From the 2024 International Mechanical Code (also the 2026 Florida Building Code, Mechanical, Ninth Edition). Exhaust rates are cfm/ft² unless a note (e, f) makes them per fixture or per room.

<div class="table-scroll">
<table class="ref-table">
  <thead><tr><th scope="col">Occupancy classification</th><th scope="col">Notes</th><th scope="col">Occupant density, #/1,000 ft²</th><th scope="col">R<sub>p</sub> cfm/person</th><th scope="col">R<sub>a</sub> cfm/ft²</th><th scope="col">Exhaust, cfm/ft²</th></tr></thead>
  <tbody>
  {%- for r in ventilation.imc %}
    <tr><th scope="row">{{ r.group }}: {{ r.name }}</th><td>{{ r.notes }}</td><td>{{ r.values[0] }}</td><td>{{ r.values[1] }}</td><td>{{ r.values[2] }}</td><td>{{ r.values[3] }}</td></tr>
  {%- endfor %}
  </tbody>
</table>
</div>

## References

American Society of Heating, Refrigerating and Air-Conditioning Engineers (ASHRAE). [ANSI/ASHRAE Standard 62.1-2025: Ventilation and Acceptable Indoor Air Quality](https://www.ashrae.org/technical-resources/bookstore/standards-62-1-62-2). Atlanta, GA: ASHRAE.

International Code Council (ICC). [2024 International Mechanical Code, Chapter 4: Ventilation](https://codes.iccsafe.org/content/IMC2024V2.0/chapter-4-ventilation).

Florida Building Commission. [2023 Florida Building Code, Mechanical, Eighth Edition](https://codes.iccsafe.org/content/FLMC2023P1/chapter-4-ventilation) and [2026 Florida Building Code, Mechanical, Ninth Edition](https://codes.iccsafe.org/content/FLMC2026V1.0/chapter-4-ventilation), Chapter 4.

ASHRAE and ASHE. [ANSI/ASHRAE/ASHE Standard 170-2021: Ventilation of Health Care Facilities](https://www.ashrae.org/technical-resources/standards-and-guidelines/read-only-versions-of-ashrae-standards). Atlanta, GA: ASHRAE.

ASHRAE. [ANSI/ASHRAE Standard 62.2-2025: Ventilation and Acceptable Indoor Air Quality in Residential Buildings](https://www.ashrae.org/technical-resources/bookstore/standards-62-1-62-2). Atlanta, GA: ASHRAE.
