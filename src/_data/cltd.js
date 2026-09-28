// Choices for the CLTD roof and wall form, from the same module the lookup runs.
import { ROOF_TYPES, ROOF_R, WALL_TYPES, WALL_MASS, WALL_SECONDARY, WALL_R } from '../assets/js/cltd.js';

export default {
  roofTypes: ROOF_TYPES, roofR: ROOF_R, wallTypes: WALL_TYPES.map(t => t[0]),
  wallMass: WALL_MASS, wallSecondary: WALL_SECONDARY, wallR: WALL_R,
};
