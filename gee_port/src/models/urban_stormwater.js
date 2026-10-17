/**
 * InVEST Urban Stormwater Runoff — GEE JS port.
 *
 * Ported from: src/natcap/invest/stormwater.py
 *
 * Estimates annual urban stormwater runoff and the benefits of
 * green infrastructure (LID) using the rational method.
 */

var utils = require('../utils/index.js');

var SPEC = {
  lulc: { about: 'Land use / land cover map.', type: 'raster', required: true },
  rainfall: { about: 'Annual rainfall map.', type: 'raster', required: true },
  runoff_coefficients: { about: 'Table of runoff coefficients per LULC.', type: 'table', required: true },
  lid_table: { about: 'LID implementation table (optional).', type: 'table', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Rational method runoff: Q = C * i * A
 * Per pixel, with C from LULC and i from rainfall.
 *
 * @param {ee.Image} rainfall  annual rainfall (mm)
 * @param {ee.Image} lulc
 * @param {Object} cTable  {lulcCode: runoffCoefficient}
 * @return {ee.Image}  runoff depth (mm)
 */
function computeStormwater(rainfall, lulc, cTable) {
  var c = ee.Image(0);
  Object.keys(cTable).forEach(function (code) {
    c = c.where(lulc.eq(parseInt(code, 10)), cTable[code]);
  });
  return rainfall.multiply(c).rename('stormwater_runoff_mm');
}

function run(args) {
  utils.assert(args.lulc, 'lulc is required');
  utils.assert(args.rainfall, 'rainfall is required');
  utils.assert(args.runoff_coefficients, 'runoff_coefficients is required');

  var cTable = {};
  if (args.runoff_coefficients && args.runoff_coefficients.value) {
    var rows = args.runoff_coefficients.value;
    rows.forEach(function (r) {
      cTable[r.lulc_code] = r.runoff_coefficient;
    });
  }

  var runoff = computeStormwater(args.rainfall, args.lulc, cTable);
  var outputs = {
    stormwater_runoff: runoff,
    stormwater_volume: runoff.multiply(ee.Image.pixelArea().divide(1e6)).rename('stormwater_m3')
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeStormwater = computeStormwater;
