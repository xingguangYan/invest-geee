var annualWaterYield = require('users/bqt2000204051/INVEST:src/models/annual_water_yield');
var carbon = require('users/bqt2000204051/INVEST:src/models/carbon');
var coastalBlueCarbon = require('users/bqt2000204051/INVEST:src/models/coastal_blue_carbon');
var coastalVulnerability = require('users/bqt2000204051/INVEST:src/models/coastal_vulnerability');
var cropPollination = require('users/bqt2000204051/INVEST:src/models/crop_pollination');
var cropProduction = require('users/bqt2000204051/INVEST:src/models/crop_production');
var delineateIt = require('users/bqt2000204051/INVEST:src/models/delineateit');
var forestCarbonEdge = require('users/bqt2000204051/INVEST:src/models/forest_carbon_edge_effect');
var habitatQuality = require('users/bqt2000204051/INVEST:src/models/habitat_quality');
var habitatRiskAssessment = require('users/bqt2000204051/INVEST:src/models/habitat_risk_assessment');
var ndr = require('users/bqt2000204051/INVEST:src/models/ndr');
var recreation = require('users/bqt2000204051/INVEST:src/models/recreation');
var reservoirHydropowerProduction = require('users/bqt2000204051/INVEST:src/models/reservoir_hydropower_production');
var routeDEM = require('users/bqt2000204051/INVEST:src/models/route_dem');
var scenarioGenProximity = require('users/bqt2000204051/INVEST:src/models/scenario_gen_proximity');
var scenicQuality = require('users/bqt2000204051/INVEST:src/models/scenic_quality');
var sdr = require('users/bqt2000204051/INVEST:src/models/sdr');
var seasonalWaterYield = require('users/bqt2000204051/INVEST:src/models/seasonal_water_yield');
var urbanCoolingModel = require('users/bqt2000204051/INVEST:src/models/urban_cooling_model');
var urbanFloodMitigation = require('users/bqt2000204051/INVEST:src/models/urban_flood_mitigation');
var urbanMentalHealth = require('users/bqt2000204051/INVEST:src/models/urban_mental_health');
var urbanNatureAccess = require('users/bqt2000204051/INVEST:src/models/urban_nature_access');
var urbanStormwater = require('users/bqt2000204051/INVEST:src/models/urban_stormwater');
var waveEnergy = require('users/bqt2000204051/INVEST:src/models/wave_energy');
var windEnergy = require('users/bqt2000204051/INVEST:src/models/wind_energy');

exports.annualWaterYield = annualWaterYield;
exports.carbon = carbon;
exports.coastalBlueCarbon = coastalBlueCarbon;
exports.coastalVulnerability = coastalVulnerability;
exports.cropPollination = cropPollination;
exports.cropProduction = cropProduction;
exports.delineateIt = delineateIt;
exports.forestCarbonEdge = forestCarbonEdge;
exports.habitatQuality = habitatQuality;
exports.habitatRiskAssessment = habitatRiskAssessment;
exports.ndr = ndr;
exports.recreation = recreation;
exports.reservoirHydropowerProduction = reservoirHydropowerProduction;
exports.routeDEM = routeDEM;
exports.scenarioGenProximity = scenarioGenProximity;
exports.scenicQuality = scenicQuality;
exports.sdr = sdr;
exports.seasonalWaterYield = seasonalWaterYield;
exports.urbanCoolingModel = urbanCoolingModel;
exports.urbanFloodMitigation = urbanFloodMitigation;
exports.urbanMentalHealth = urbanMentalHealth;
exports.urbanNatureAccess = urbanNatureAccess;
exports.urbanStormwater = urbanStormwater;
exports.waveEnergy = waveEnergy;
exports.windEnergy = windEnergy;

// /**
// * InVEST Wind Energy — GEE JS port.
// *
// * Ported from: src/natcap/invest/wind_energy.py
// *
// * Estimates wind energy production using the Weibull wind speed distribution
// * and a piecewise turbine power curve. The closed-form approximation uses
// * the Weibull CDF to estimate the fraction of time spent in each power
// * regime (cut-in, ramp, rated, cut-out).
// */

// var utils = require('../utils/index.js');

// var SPEC = {
//   wind_data: {
//     about: 'Gridded wind speed data (must have band "speed" with mean wind speed m/s).',
//     type: 'raster',
//     required: true
//   },
//   landmasses: { about: 'Land mask.', type: 'raster', required: true },
//   turbine_parameters: {
//     about: 'Turbine parameters table (V_cin, V_rate, V_cout, P_rate, m, lossrate, height).',
//     type: 'table',
//     required: true
//   },
//   grid_connection_points: { about: 'Grid connection points.', type: 'vector', required: false },
//   grid_connection_points_table: { about: 'Grid connection points table.', type: 'table', required: false },
//   results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
// };

// /**
// * Weibull CDF: F(V) = 1 - exp(-(V/k)^lambda)
// * @param {number} v
// * @param {number} k  scale parameter (m/s)
// * @param {number} lambda  shape parameter
// * @return {number}
// */
// function weibullCDF(v, k, lambda) {
//   if (v <= 0) return 0;
//   return 1 - Math.exp(-Math.pow(v / k, lambda));
// }

// /**
// * Analytical approximation of average turbine power (W) from Weibull parameters.
// * This is an approximation that integrates the power curve against the Weibull PDF.
// *
// * @param {number} k  Weibull scale (m/s)
// * @param {number} lambda  Weibull shape
// * @param {Object} turbine  {V_cin, V_rate, V_cout, P_rate, m, lossrate}
// * @return {number} average power (W)
// */
// function weibullAvgPower(k, lambda, turbine) {
//   var V_cin = turbine.V_cin || 3;
//   var V_rate = turbine.V_rate || 12;
//   var V_cout = turbine.V_cout || 25;
//   var P_rate = turbine.P_rate || 5000000;
//   var m = turbine.m || 1;
//   var lossrate = turbine.lossrate || 0;

//   // Use numerical integration (trapezoidal) with 200 steps
//   var n = 200;
//   function f(v) {
//     if (v < V_cin || v > V_cout) return 0;
//     if (v > V_rate) return P_rate;
//     var denom = Math.pow(V_rate, m) - Math.pow(V_cin, m);
//     if (denom <= 0) return 0;
//     return P_rate * (Math.pow(v, m) - Math.pow(V_cin, m)) / denom;
//   }
//   function pdf(v) {
//     if (v <= 0) return 0;
//     return (lambda / k) * Math.pow(v / k, lambda - 1) * Math.exp(-Math.pow(v / k, lambda));
//   }

//   var integral = 0;
//   var a = V_cin, b = V_cout;
//   var h = (b - a) / n;
//   integral += f(a) * pdf(a) * 0.5;
//   integral += f(b) * pdf(b) * 0.5;
//   for (var i = 1; i < n; i++) {
//     var v = a + i * h;
//     integral += f(v) * pdf(v);
//   }
//   integral *= h;

//   return integral * P_rate * (1 - lossrate);
// }

// /**
// * Compute wind energy density image from wind speed data and turbine parameters.
// *
// * @param {ee.Image} windData  must have band 'speed' with mean wind speed (m/s)
// * @param {Object} turbine
// * @return {ee.Image}
// */
// function computeWindEnergy(windData, turbine) {
//   var V_cin = turbine.V_cin || 3;
//   var V_rate = turbine.V_rate || 12;
//   var V_cout = turbine.V_cout || 25;
//   var P_rate = turbine.P_rate || 5000000;
//   var lossrate = turbine.lossrate || 0;
//   var m = turbine.m || 1;

//   var k = windData.select('speed').rename('k'); // use mean as Weibull scale proxy

//   // Approximate power output using piecewise linear power curve on k
//   // F(V_cin) and F(V_cout) and F(V_rate) via Weibull CDF
//   // Using a simplified approach: E[P] = P_rate * F(V_cout) * efficiency_factor
//   var fcinc = ee.Image(1).subtract(ee.Image(1).exp(ee.Image(-1).multiply(k.pow(-1).multiply(V_cin))));
//   var fcout = ee.Image(1).subtract(ee.Image(1).exp(ee.Image(-1).multiply(k.pow(-1).multiply(V_cout))));
//   var frate = ee.Image(1).subtract(ee.Image(1).exp(ee.Image(-1).multiply(k.pow(-1).multiply(V_rate))));

//   // Simplified: power is proportional to fraction of time above cut-in,
//   // with linear ramp from cut-in to rated
//   var aboveCutin = ee.Image(1).subtract(fcinc);
//   var aboveRate = fcout.subtract(fcinc);
//   var rampFactor = frate.subtract(fcinc).divide(fcout.subtract(fcinc).add(1e-10)).clamp(0, 1);

//   var avgPower = P_rate.multiply(
//     aboveCutin.multiply(rampFactor).add(aboveRate.multiply(ee.Image(1).subtract(rampFactor)))
//   ).multiply(ee.Image(1).subtract(lossrate)).clamp(0, P_rate).rename('avg_turbine_output_W');

//   return avgPower;
// }

// function run(args) {
//   utils.assert(args.wind_data, 'wind_data is required');
//   utils.assert(args.landmasses, 'landmasses is required');
//   utils.assert(args.turbine_parameters, 'turbine_parameters is required');

//   var turbine = args.turbine_parameters.value || {
//     V_cin: 3, V_rate: 12, V_cout: 25, P_rate: 5000000, m: 1, lossrate: 0
//   };

//   var landMask = args.landmasses.gt(0);
//   var windEnergy = computeWindEnergy(args.wind_data, turbine)
//     .updateMask(landMask)
//     .rename('avg_turbine_output_W');

//   var outputs = {
//     avg_turbine_output: windEnergy,
//     annual_energy: windEnergy.multiply(365 * 24).rename('annual_energy_kWh_per_turbine')
//   };

//   return { outputs: outputs, spec: SPEC };
// }

// exports.spec = SPEC;
// exports.run = run;
// exports.weibullAvgPower = weibullAvgPower;
// exports.computeWindEnergy = computeWindEnergy;
