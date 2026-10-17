/**
 * InVEST Nutrient Delivery Ratio (NDR) — GEE JS port.
 *
 * Ported from: src/natcap/invest/ndr/ndr.py
 */

var utils = require('../utils/index.js');

var SPEC = {
  dem: { about: 'Digital elevation model.', type: 'raster', required: true },
  lulc: { about: 'Land use / land cover map.', type: 'raster', required: true },
  biophysical_table: { about: 'Biophysical parameters table.', type: 'table', required: true },
  watersheds: { about: 'Watershed boundaries.', type: 'vector', required: false },
  n_workers: { about: 'Number of workers.', type: 'number', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Compute nutrient retention and delivery.
 * @param {ee.Image} dem
 * @param {ee.Image} lulc
 * @param {Object} biophysical  {lulcCode: {n_retention, n_export}}
 * @return {Object}
 */
function computeNDR(dem, lulc, biophysical) {
  var retention = ee.Image(0);
  var exportCoeff = ee.Image(0);
  Object.keys(biophysical).forEach(function (code) {
    var b = biophysical[code];
    retention = retention.where(lulc.eq(parseInt(code, 10)), b.n_retention || 0);
    exportCoeff = exportCoeff.where(lulc.eq(parseInt(code, 10)), b.n_export || 0);
  });

  var slope = ee.Terrain(dem).select('slope');
  var retentionAdjusted = retention.multiply(ee.Image(1).subtract(slope.divide(100))).rename('n_retention');
  var ndr = retentionAdjusted.rename('ndr');
  var exportTotal = exportCoeff.multiply(ndr).rename('n_export');
  var retentionTotal = retentionAdjusted.rename('n_retention');

  return {
    ndr: ndr,
    n_export: exportTotal,
    n_retention: retentionTotal
  };
}

function run(args) {
  utils.assert(args.dem, 'dem is required');
  utils.assert(args.lulc, 'lulc is required');
  utils.assert(args.biophysical_table, 'biophysical_table is required');

  var result = computeNDR(args.dem, args.lulc, {});
  var outputs = {
    ndr: result.ndr,
    n_export: result.n_export,
    n_retention: result.n_retention
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeNDR = computeNDR;
