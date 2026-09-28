// Dehumidifiers in Dehumidifier Specifier V7.1.xlsx, in the workbook's order
// (ascending capacity). Current Santa Fe, Quest, Aprilaire and AlorAir models,
// September 2026. Capacity and efficiency are the manufacturer's ratings at
// 80°F / 60% RH entering air (AlorAir calls this condition "AHAM"); airflow is
// at 0.0 in. w.c. or the high fan speed. Prices are from an internet search on
// 26 September 2026: Sylvane for Santa Fe, Quest and Aprilaire (AMG Air for the
// Quest 746), AlorAir's own store for AlorAir.
// [manufacturer and model, cfm, efficiency pints/kWh, capacity pints/day,
//  approx. retail price $, spec sheet URL]
export const MODELS = [
  ["Santa Fe UltraMD33",150,5.1,37,1780,"https://rp.widen.net/s/dcp7brqqsh"],
  ["Aprilaire E050",145,4.23,50,1310,"https://www.crawlspacedepot.com/content/aprilaire-e050-specification-sheet.pdf"],
  ["Santa Fe Compact70",150,5.5,70,1365,"https://www.santa-fe-products.com/wp-content/uploads/2019/06/Compact70-A2L-Data-Sheet.pdf"],
  ["Santa Fe Ultra70",150,5.5,70,1695,"https://rp.widen.net/s/w7btlqlctx"],
  ["Aprilaire E070",200,4.44,70,1400,"https://www.crawlspacedepot.com/content/aprilaire-e070-specification-sheet.pdf"],
  ["Aprilaire E080",185,5.92,80,1495,"https://www.abrwholesalers.com/media/assets/product/documents/aprilaire/dehumidifier/eseries/specification-sheet-aprilaire-e080-dehumidifier.pdf"],
  ["AlorAir Sentinel WHD 100",309,5.49,90,1199,"https://www.alorair.com/product-details/alorair-sentinel-whd-100"],
  ["Santa Fe Ultra V100",385,6.4,100,2329,"https://rp.widen.net/s/6kvtgqrpmt"],
  ["Aprilaire E100",280,5.49,100,1878,"https://storage.googleapis.com/sos-websvc/uploads/core/files/brochures/Aprilaire/aprilaire-e100-dehumidifier-specification-sheet-2025.pdf"],
  ["Santa Fe Oasis105",280,7.5,102,2249,"https://rp.widen.net/s/qjs8mpfgkd"],
  ["AlorAir Sentinel WHD 120",309,5.49,104,1699,"https://www.alorair.com/product-details/alorair-sentinel-whd-120"],
  ["Quest 100",280,7.5,105,2300,"https://www.questclimate.com/wp-content/uploads/2024/10/Quest_100_Spec-Sheet_4044590_A2L.pdf"],
  ["Santa Fe Advance Dry110",370,7.7,110,2203,"https://rp.widen.net/s/kjbp6mnf2z"],
  ["Santa Fe Classic",275,7.27,116,3165,"https://rp.widen.net/s/gwxdfb2jrq"],
  ["Santa Fe Ultra V125",385,5.9,125,2870,"https://rp.widen.net/s/8rgpbh5gfz"],
  ["Aprilaire E130",310,6.13,130,2496,"https://www.amgair.com/content/documents/Aprilaire/E130/aprilaire-e130-dehumidifier-specification-sheet-963.pdf"],
  ["Quest Hi-E Dry 140",300,7.2,135,3900,"https://www.questclimate.com/wp-content/uploads/2025/04/Hi-E-Dry-140_Spec_Sheet_A2L.pdf"],
  ["AlorAir Sentinel WHD 150",383,7.82,140,2999,"https://www.alorair.com/product-details/alorair-sentinel-whd-150"],
  ["Santa Fe Ultra V155",435,7.1,155,4354,"https://rp.widen.net/s/s7gnvm7hzx"],
  ["Quest 155",500,8.5,155,3300,"https://www.questclimate.com/wp-content/uploads/2024/11/Quest_155_Spec_Sheet_A2L.pdf"],
  ["AlorAir Sentinel WHD 200",413,6.97,165,3799,"https://www.alorair.com/product-details/alorair-sentinel-whd-200"],
  ["Quest Hi-E Dry 195",610,6.1,195,4100,"https://www.questclimate.com/wp-content/uploads/2024/10/Spec-Sheet_Hi-E-Dry_195_A2L_4046400.pdf"],
  ["Quest 205",575,7.7,200,4400,"https://www.questclimate.com/wp-content/uploads/2024/10/Spec-Sheet_Quest-205_A2L_4046110.pdf"],
  ["Santa Fe Ultra V205",550,7.5,205,5360,"https://rp.widen.net/s/jkjglnvwm8"],
  ["Quest 225 208/230V",630,7.6,225,3800,"https://www.questclimate.com/wp-content/uploads/2024/09/Quest-225_208-230v_Spec-Sheet_A2L.pdf"],
  ["Quest 335 208/230V",900,8.5,345,5800,"https://www.questclimate.com/wp-content/uploads/2024/09/Quest_335_208-230v_Spec_Sheet_A2L.pdf"],
  ["Quest 335 277V",900,8.5,345,5800,"https://www.questclimate.com/wp-content/uploads/2024/09/Spec-Sheets_335_277v_A2L.pdf"],
  ["Quest 506 208/230V",1150,9.2,500,8830,"https://www.questclimate.com/wp-content/uploads/2024/12/Quest-506-208-230v-Spec-Sheet__A2L.pdf"],
  ["Quest 506 277V",1150,9.2,500,8830,"https://www.questclimate.com/wp-content/uploads/2024/12/Spec-Sheets_Quest-506_277v_A2L_4046310.pdf"],
  ["Quest 746 480V",1650,8.3,730,13000,"https://www.questclimate.com/wp-content/uploads/2024/10/Quest_746_480V_Spec_Sheet_R454B.pdf"],
];
