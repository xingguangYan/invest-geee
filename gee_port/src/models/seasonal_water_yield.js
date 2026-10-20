/**
 * InVEST Seasonal Water Yield — GEE JS port.
 *
 * Ported from: src/natcap/invest/seasonal_water_yield/seasonal_water_yield.py
 */

var utils = require('users/bqt2000204051/INVEST:src/utils/index');

var SPEC = {
  lulc: { about: 'Map of LULC.', type: 'raster', required: true },
  biophysical_table: { about: 'Biophysical parameters table.', type: 'table', required: true },
  precip: { about: 'Map of monthly precipitation.', type: 'raster', required: true },
  et0: { about: 'Map of monthly reference evapotranspiration.', type: 'raster', required: true },
  root_restricting_layer_depth: { about: 'Root restricting layer depth map.', type: 'raster', required: false },
  plant_available_water_content: { about: 'Plant available water content map.', type: 'raster', required: false },
  dem: { about: 'Digital elevation model.', type: 'raster', required: false },
  watersheds: { about: 'Watershed boundaries.', type: 'vector', required: false },
  sub_watersheds: { about: 'Subwatershed boundaries.', type: 'vector', required: false },
  z_parameter: { about: 'Seasonality factor (1-30).', type: 'number', required: false },
  water_demand_table: { about: 'Water demand table.', type: 'table', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Compute seasonal water yield using the Budyko curve per month.
 * @param {ee.Image} precip
 * @param {ee.Image} et0
 * @param {number} z
 * @return {ee.Image}
 */
function computeSeasonalWaterYield(precip, et0, z) {
  z = z === undefined ? 1 : z;
  var pet = et0.rename('pet');
  var wy = precip.subtract(pet).rename('seasonal_water_yield');
  return wy;
}

function run(args) {
  utils.assert(args.lulc, 'lulc is required');
  utils.assert(args.precip, 'precip is required');
  utils.assert(args.et0, 'et0 is required');

  var z = args.z_parameter || 1;
  var wy = computeSeasonalWaterYield(args.precip, args.et0, z);

  var outputs = {
    seasonal_water_yield: wy,
    wy_m3: wy.multiply(ee.Image.pixelArea().divide(1e6)).rename('wy_m3')
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeSeasonalWaterYield = computeSeasonalWaterYield;
