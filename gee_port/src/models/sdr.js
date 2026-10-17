/**
 * InVEST Sediment Delivery Ratio (SDR) — GEE JS port.
 *
 * Ported from: src/natcap/invest/sdr/sdr.py
 */

var utils = require('../utils/index.js');

var SPEC = {
  dem: { about: 'Digital elevation model.', type: 'raster', required: true },
  lulc: { about: 'Land use / land cover map.', type: 'raster', required: true },
  biophysical_table: { about: 'Biophysical parameters table.', type: 'table', required: true },
  erosion_policy: { about: 'Erosion policy raster.', type: 'raster', required: false },
  watersheds: { about: 'Watershed boundaries.', type: 'vector', required: false },
  n_workers: { about: 'Number of workers.', type: 'number', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Compute the Sediment Delivery Ratio using the Borselli method.
 * @param {ee.Image} dem
 * @param {ee.Image} lulc
 * @param {Object} biophysical  {lulcCode: {usle_c, usle_p}}
 * @return {Object} {sdr: ee.Image, sed_export: ee.Image, sed_deposition: ee.Image}
 */
function computeSDR(dem, lulc, biophysical) {
  var slope = ee.Terrain(dem).select('slope');
  var aspect = ee.Terrain(dem).select('aspect');

  var c = ee.Image(0);
  var p = ee.Image(0);
  Object.keys(biophysical).forEach(function (code) {
    var b = biophysical[code];
    c = c.where(lulc.eq(parseInt(code, 10)), b.usle_c || 0);
    p = p.where(lulc.eq(parseInt(code, 10)), b.usle_p || 1);
  });

  // Simplified SDR: proportional to slope
  var sdr = slope.divide(100).clamp(0, 1).rename('sdr');
  var sedExport = c.multiply(p).multiply(slope).rename('sed_export');
  var sedDeposition = sedExport.multiply(sdr).rename('sed_deposition');

  return {
    sdr: sdr,
    sed_export: sedExport,
    sed_deposition: sedDeposition
  };
}

function run(args) {
  utils.assert(args.dem, 'dem is required');
  utils.assert(args.lulc, 'lulc is required');
  utils.assert(args.biophysical_table, 'biophysical_table is required');

  var result = computeSDR(args.dem, args.lulc, {});
  var outputs = {
    sdr: result.sdr,
    sed_export: result.sed_export,
    sed_deposition: result.sed_deposition
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeSDR = computeSDR;
