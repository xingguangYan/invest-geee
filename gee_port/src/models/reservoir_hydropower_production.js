/**
 * InVEST Reservoir Hydropower Production — GEE JS port.
 *
 * Ported from: src/natcap/invest/reservoir_hydropower_production.py
 *
 * Estimates annual average hydropower production from a reservoir using
 * inflow volume, turbine efficiency, and head.
 */

var utils = require('users/bqt2000204051/INVEST:src/utils/index');

var SPEC = {
  watershed: { about: 'Watershed polygon.', type: 'vector', required: true },
  inflow: { about: 'Annual average inflow volume (m3/yr/pixel or total).', type: 'raster', required: true },
  reservoir_surface_area: { about: 'Reservoir surface area (m2).', type: 'raster', required: false },
  dam_height: { about: 'Dam height (m).', type: 'number', required: false },
  turbine_efficiency: { about: 'Turbine efficiency (0-1).', type: 'number', required: false },
  generation_efficiency: { about: 'Overall generation efficiency.', type: 'number', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

var RHO = 1000; // kg/m^3 water density
var G = 9.81;  // m/s^2 gravity
var SECS_PER_YEAR = 31557600; // seconds in a year

/**
 * Compute hydropower energy from inflow, head, and efficiency.
 *
 * E = rho * g * Q * h * eta * 3600 * 24 * 365 / 1e6  (kWh)
 *
 * where Q is mean flow rate (m3/s), h is head (m), eta is efficiency.
 *
 * @param {number} inflow_m3_per_year  total annual inflow
 * @param {number} head  effective head (m)
 * @param {number} efficiency  overall efficiency
 * @return {number}  annual energy (kWh)
 */
function computeHydropowerEnergy(inflow, head, efficiency) {
  var flowRate = inflow / SECS_PER_YEAR; // m3/s
  var powerW = RHO * G * flowRate * head * efficiency; // W
  var energyKwh = powerW * SECS_PER_YEAR / 1000; // kWh
  return energyKwh;
}

/**
 * Compute hydropower production image.
 *
 * @param {ee.Image} inflow  annual inflow (m3/yr)
 * @param {number} head
 * @param {number} efficiency
 * @return {ee.Image}  annual energy (kWh/pixel)
 */
function computeHydropowerImage(inflow, head, efficiency) {
  var flowRate = inflow.divide(SECS_PER_YEAR).rename('flow_rate_m3s');
  var powerW = ee.Image(RHO)
    .multiply(ee.Image(G))
    .multiply(flowRate)
    .multiply(head)
    .multiply(efficiency)
    .rename('power_W');
  var energyKwh = powerW.multiply(SECS_PER_YEAR).divide(1000).rename('energy_kWh');
  return energyKwh;
}

function run(args) {
  utils.assert(args.watershed, 'watershed is required');
  utils.assert(args.inflow, 'inflow is required');

  var head = args.dam_height || 50;
  var efficiency = args.turbine_efficiency || 0.9;

  var energy = computeHydropowerImage(args.inflow, head, efficiency);
  var totalEnergy = energy.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: args.watershed.geometry(),
    scale: 30,
    bestEffort: true
  }).get('energy_kWh');

  var outputs = {
    energy_per_pixel: energy,
    total_energy_kwh: totalEnergy
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeHydropowerEnergy = computeHydropowerEnergy;
exports.computeHydropowerImage = computeHydropowerImage;
exports.RHO = RHO;
exports.G = G;
exports.SECS_PER_YEAR = SECS_PER_YEAR;
