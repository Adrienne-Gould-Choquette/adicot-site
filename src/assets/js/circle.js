// Circle and sphere: from any one of radius, diameter, circle area,
// circumference, sphere volume or sphere area, every other.
//
// A port of Circle_Area_and_Circumference V1.11.xlsx, formula for formula;
// check-calculators.mjs holds this file to the workbook's own answers. The input
// is turned into a diameter in inches, and every result comes from that.

export const TYPES = ['Radius', 'Diameter', 'Area of a Circle', 'Circumference', 'Volume of a Sphere', 'Area of a Sphere'];
// Length, area or volume: the power a unit conversion is raised to.
export const POWER = { Radius: 1, Diameter: 1, 'Area of a Circle': 2, Circumference: 1, 'Volume of a Sphere': 3, 'Area of a Sphere': 2 };

// The input as a diameter in inches. unit: 'in' | 'ft' (US) or 'cm' | 'm' (Metric).
function diameterIn(type, v, unit) {
  const PI = Math.PI;
  switch (unit) {
    case 'in': return {
      Diameter: v, 'Area of a Circle': Math.sqrt(4 * v / PI), Circumference: v / PI,
      'Volume of a Sphere': 2 * (3 * v / 4 / PI) ** (1 / 3), Radius: 2 * v, 'Area of a Sphere': Math.sqrt(v / PI),
    }[type];
    case 'ft': return {
      Diameter: v * 12, 'Area of a Circle': Math.sqrt(4 * v * 144 / PI), Circumference: v * 12 / PI,
      Radius: v * 2 * 12, 'Volume of a Sphere': 2 * (3 * v / 4 / PI) ** (1 / 3) * 12, 'Area of a Sphere': 12 * Math.sqrt(v / PI),
    }[type];
    case 'cm': return {
      Diameter: v / 2.54, 'Area of a Circle': 1 / 2.54 * Math.sqrt(4 * v / PI), Radius: v * 2 / 2.54,
      'Volume of a Sphere': 2 * (3 * v / 4 / PI) ** (1 / 3) / 2.54, Circumference: 1 / 2.54 * v / PI, 'Area of a Sphere': Math.sqrt(v / PI) / 2.54,
    }[type];
    case 'm': return {
      Diameter: 1 / 2.54 * v * 100, 'Area of a Circle': 39.3701 * Math.sqrt(4 * v / PI), Radius: 39.3701 * v * 2,
      'Volume of a Sphere': 2 * (3 * v / 4 / PI) ** (1 / 3) * 39.3701, Circumference: 39.3701 * v / PI,
      'Area of a Sphere': Math.sqrt(v / PI) / 2.54 * 100,
    }[type];
    default: throw new Error(`Unknown unit: ${unit}`);
  }
}

export function solve(type, value, unit) {
  const D = diameterIn(type, value, unit);
  const r = D / 2;
  const us = {
    radiusIn: r, radiusFt: r / 12, diameterIn: D, diameterFt: D / 12,
    circleAreaIn: Math.PI * D ** 2 / 4, circumIn: D * Math.PI, sphereVolIn: 4 / 3 * Math.PI * (D / 2) ** 3,
  };
  us.circleAreaFt = us.circleAreaIn / 12 ** 2;
  us.circumFt = us.circumIn / 12;
  us.sphereVolFt = us.sphereVolIn / 12 ** 3;
  us.sphereAreaIn = 4 * Math.PI * us.radiusIn ** 2;
  us.sphereAreaFt = 4 * Math.PI * us.radiusFt ** 2;
  const radiusCm = us.radiusIn * 2.54, diameterCm = us.diameterIn * 2.54;
  const circleAreaCm = us.circleAreaIn * 2.54 ** 2, circumCm = us.circumIn * 2.54, sphereVolCm = us.sphereVolIn * 2.54 ** 3;
  const radiusM = radiusCm / 100;
  const si = {
    radiusCm, radiusM, diameterCm, diameterM: diameterCm / 100, circleAreaCm, circleAreaM: circleAreaCm / 10000,
    circumCm, circumM: circumCm / 100, sphereVolCm, sphereVolM: sphereVolCm / 100 ** 3,
    sphereAreaCm: 4 * Math.PI * radiusCm ** 2, sphereAreaM: 4 * Math.PI * radiusM ** 2,
  };
  return { ...us, ...si };
}

export function problem(v) {
  if (v === null) return 'Enter a value.';
  if (Number.isNaN(v)) return 'The value is not a number.';
  if (!(v > 0)) return 'The value must be greater than zero.';
  return null;
}
