---
layout: layouts/post.njk
title: "Heat Load Calculations - Baseline vs High Efficiency"
seoTitle: "Heat Load Calculations - Baseline vs High Efficiency"
description: "Baseline vs high-efficiency loads for a geodesic-dome building: how air tightness, LED lighting, better glass and pretreated outside air shrink them."
date: 2017-04-10T21:20:44.910Z
permalink: /post/2017/04/05/heat-load-calculations-baseline-vs-high-efficiency.html
ogImage: "/images/0179db_a1d11c2c1c9c464a975651f1c7719852~mv2.jpg"
categories: ["heating-and-cooling-load-calculation-2"]
---

Adicot is working on a project for One Community, a non-profit creating open source plans and designs for sustainable cities and homes. The specific project we are working on is assisting in their HVAC Design of their mixed use City Center.

The City Center has a few unique characteristics; a root cellar, server rooms, an indoor pool... oh, and it is comprised of three geodesic domes.

![Rendering of the One Community Duplicable City Center: two geodesic domes joined by a central tower](/images/0179db_a1d11c2c1c9c464a975651f1c7719852~mv2.jpg)

The One Community designers have chosen an R-45 insulation for the exterior surfaces of the domes. With building insulation, equipment loads, and people loads remaining constant, two heat load calculations were performed; a baseline load using International Energy Conservation Code (IECC) minimums and ASHRAE Fundamentals default materials, and a high efficiency (HE) version of the city center. The HE version included the following changes:

![Baseline versus high-efficiency inputs: infiltration 0.17/0.32 ACH vs 0.06/0.12 ACH; standard lighting vs LED; code-default glass U/SHGC 0.8/0.7 vs ENERGY STAR low-e 0.22/0.25; untreated vs tempered outside air](/images/0179db_adc1699dc1d147c8acfd013911c06c63~mv2.jpg)

It is worth mentioning the benefits outlined below are just analyzing the effect on the heating and cooling systems; but the benefits to building efficiently have much farther reaching benefits. One example is switching to LED lighting from regular incandescent lighting. Incandescent bulbs put off more heat than LED bulbs. This heat is a form of wasted energy which causes increased demand on the cooling system in the summer. By switching to LED bulbs, the reduced heat load to the building means lower cooling costs in the summer and a smaller cooling system; also, the bulbs' lower power consumption means less energy, which all means a more comfortable building powered by a smaller array of photovoltaic panels.

Building Construction

A tighter building means greater temperature control. One Community's City Center prototype building will be in Southern Utah. The domes are designed for passive cooling during the summer months with backup air conditioning for extreme temperature periods. The winter lows in Southern Utah can dip into the single digits, so during the winter, to avoid drafts, efficiently maintain comfortable temperatures, and maintain proper building air balance, a tightly constructed building is an even more critical consideration.

Building air tightness is improved by sealing leakage pathways; e.g., ensuring windows and doors are properly installed with weather stripping, sealants, gaskets, etc., and outlets and recessed lights, which often make easy pathways between conditioned and non-conditioned spaces, must be sealed. A source for more information on this is found in the Building Technologies Program Air Leakage Guide by the US Department of Energy.

Below are the results of One Community's City Center prototype building in Southern Utah comparing an "average building" (a maximum of 0.17 air changes per hour(ACH) in the summer and 0.32 ACH in the winter) to a "tight building" (a maximum of 0.06 ACH in the summer and 0.12 ACH in the winter).

![Bar chart: infiltration heating load by space, baseline vs high efficiency; the tight building cuts it by more than half in every space](/images/0179db_2b865141779a4d7181d1af00bb86d25e~mv2.jpg)

Properly sealing the building makes a significant impact on the results of the heating load calculation. It cuts the impact of outside air infiltration by over 50% for all spaces of the building.

Ventilation

A tight building also comes with a requirement for greater attention to ventilation to ensure the comfort and health of the occupants. Two options when introducing ventilation air into a building are considered for this analysis. The Baseline method is modeled such that the fresh air directly enters the air handling unit's return; the High Efficiency method is modeled such that the outdoor air is pre-treated to 63 °F before it is introduced into the air handler.

The impact on the heating load is below:

![Bar chart: outside air heating load by space, untreated vs pretreated by a DOAS; the 2nd floor dining room drops from about 190,000 to 20,000 Btu/h](/images/0179db_4077f082de694d37955c1a760ccf6870~mv2.jpg)

It is not surprising that the burden on the primary heating system is significantly reduced when 63 °F air is introduced versus 8 °F air. What is not represented here is the energy and equipment needed to pretreat the air to 63 °F. A dedicated outdoor air system (DOAS) has been recommended as it is specifically designed for this functionality. A DOAS will have additional upfront, maintenance and operating costs, so this delta is not all savings. A further more in depth analysis will be discussed in a follow up blog entry.

Fenestration

In comparison to some geodesic domes, the glass to wall ratio on this structure is well balanced; this is a sound design choice when optimizing for energy efficiency. The International Energy Conservation Code (IECC) Table C303.1.3 lists default values for window specifications given their physical characteristics. The Baseline building was modeled using metal frame, clear, double glazed fenestration (U=0.8, SHGC=0.7).

At the time of this writing, exact windows had not been specified, so the Efficient Windows Collaborative's window selection tool was used to select windows with U=0.22 and SHGC=0.25.

![Bar chart: glass heating load by space, U/SHGC 0.8/0.7 vs 0.22/0.25; high-efficiency glazing cuts each space by roughly three quarters](/images/0179db_41155507493f4800a4a23f3f02ed4d5f~mv2.jpg)

As expected, more efficient windows greatly reduce the heat loss of the building to the outdoors.

Lighting

The final variable used in the Baseline vs High Efficiency building comparison is lighting. As stated earlier, there are a multitude of benefits over and above HVAC equipment sizing when selecting more energy efficient light bulbs. You can read more about this at One Community's Lighting Analysis. Since lighting adds heat to the building, inefficiency in lighting burdens the HVAC systems during building cooling. Below is a comparison on the energy usage for cooling with baseline lighting as dictated in ASHRAE Fundamentals Chapter 18 Table 2 for the various spaces versus the high efficiency building which uses low wattage high efficiency bulbs:

![Bar chart: lighting load by space, ASHRAE default lighting vs low-wattage LED](/images/0179db_6e02e54043884864b027b4ee0b9686c0~mv2.jpg)

The graph displays a significant savings for the cooling load by using LED low wattage bulbs versus traditional ASHRAE design standards.

So which do I recommend they implement? ALL design changes are highly recommended. It is not possible to emphasize enough the benefits to all three pillars of sustainability, people, planet and profits. Which has the greatest impact to equipment sizing? The charts below give a representation of the burden each factor places on the system. It is clear that tempering the outside air* is absolutely necessary (and most likely dictated by local building codes); but all factors show measurable and viable improvements:

![Bar chart: total load by factor, baseline vs high efficiency; ventilation falls from about 475,000 to 80,000 Btu/h](/images/0179db_2bf81b4f5be046ae9e625b2440f9c183~mv2.jpg)

![Pie chart, high-efficiency load by factor: ventilation 39%, lighting 26%, infiltration 19%, glass 16%](/images/0179db_3b468839bd1d4d99981f93b434997476~mv2.jpg)

![Pie chart, baseline load by factor: ventilation 61%, glass 15%, infiltration 14%, lighting 11%](/images/0179db_9d14b1a2b974486fb40127c493bc48eb~mv2.jpg)

*All data regarding ventilation will be addressed in an upcoming blog post, and the charts above will be updated to reflect the additional analysis incorporating a Dedicated Outdoor Air System (DOAS).

#loadcalculation #heatloadcalc #coolingloadcalc #highefficiency #Adicot #mechanicalengineering #heatingloaddetails #HVACEngineering #hvac #hvacload #heatloadcalculation #heatloadcalculations #coolingloadcalculation #coolingloadcalculations #loadcalc #loadcalculations

- Heating & Cooling Load Calcs
