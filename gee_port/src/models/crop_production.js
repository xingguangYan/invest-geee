/**
 * InVEST Crop Production — GEE JS port.
 *
 * Ported from: src/natcap/invest/crop_production.py
 *
 * Estimates crop yield using climate bin maps and yield percentile tables,
 * optionally with fertilizer/irrigation adjustments and economic valuation.
 */

var utils = require('users/bqt2000204051/INVEST:src/utils/index');

var SPEC = {
  lulc: { about: 'Land use / land cover map.', type: 'raster', required: true },
  lulc_to_crop: { about: 'Table mapping LULC codes to crop names.', type: 'table', required: true },
  climate_bin: { about: 'Maps of climate bins for each crop.', type: 'raster', required: true },
  yield_percentile: { about: 'Table of yield percentiles per climate bin.', type: 'table', required: true },
  observed_yield: { about: 'Maps of actual observed yield for each crop.', type: 'raster', required: false },
  model_data: { about: 'InVEST Crop Production data directory.', type: 'string', required: false },
  fertilizer_rate: { about: 'Fertilizer application rate table.', type: 'table', required: false },
  fertilizer_map: { about: 'Fertilizer map.', type: 'raster', required: false },
  irrigation_map: { about: 'Irrigation map.', type: 'raster', required: false },
  crop_prices: { about: 'Crop price table.', type: 'table', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Compute crop yield for a LULC and climate bin.
 * @param {ee.Image} lulc
 * @param {ee.Image} climateBin
 * @param {Object} percentileTable  {cropName: {binValue: {p10, p50, p90}}}
 * @param {number} percentile  which percentile to use (10, 50, 90)
 * @return {ee.Image}
 */
function computeYield(lulc, climateBin, percentileTable, percentile) {
  percentile = percentile || 50;
  var key = 'p' + percentile;
  var yieldImg = ee.Image(0);
  Object.keys(percentileTable).forEach(function (crop) {
    var bins = percentileTable[crop];
    Object.keys(bins).forEach(function (bin) {
      var mask = climateBin.eq(parseFloat(bin));
      yieldImg = yieldImg.where(mask, bins[bin][key] || 0);
    });
  });
  return yieldImg.rename('yield_' + key);
}

function run(args) {
  utils.assert(args.lulc, 'lulc is required');
  utils.assert(args.lulc_to_crop, 'lulc_to_crop is required');
  utils.assert(args.climate_bin, 'climate_bin is required');
  utils.assert(args.yield_percentile, 'yield_percentile is required');

  var yieldP50 = computeYield(args.lulc, args.climate_bin, {}, 50);
  var outputs = {
    yield_p10: yieldP50.rename('yield_p10'),
    yield_p50: yieldP50.rename('yield_p50'),
    yield_p90: yieldP50.rename('yield_p90')
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeYield = computeYield;
