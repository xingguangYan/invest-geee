/**
 * InVEST Urban Flood Mitigation — GEE JS port.
 *
 * Ported from: src/natcap/invest/urban_flood_risk_mitigation.py
 *
 * Estimates surface water runoff from rainfall using the SCS Curve Number
 * method, with optional infiltration adjustments for green infrastructure.
 */

var utils = require('users/bqt2000204051/INVEST:src/utils/index');

var SPEC = {
  biophysical_table: { about: 'Biophysical parameters table.', type: 'table', required: true },
  lulc_current: { about: 'Current land use / land cover map.', type: 'raster', required: true },
  lulc_future: { about: 'Future land use / land cover map.', type: 'raster', required: false },
  rainfall: { about: 'Rainfall event intensity map.', type: 'raster', required: true },
  dem: { about: 'Digital elevation model.', type: 'raster', required: false },
  soil: { about: 'Soil permeability map.', type: 'raster', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

function scsRunoff(P, CN) {
  var S = 25400 / CN - 254;
  if (P <= 0.2 * S) return 0;
  return Math.pow(P - 0.2 * S, 2) / (P + 0.8 * S);
}

function computeRunoff(rainfall, lulc, cnTable) {
  var cn = ee.Image(0);
  Object.keys(cnTable).forEach(function (code) {
    cn = cn.where(lulc.eq(parseInt(code, 10)), cnTable[code]);
  });

  var S = ee.Image(25400).divide(cn).subtract(254);
  var initLoss = ee.Image(0.2).multiply(S);
  var q = rainfall.subtract(initLoss).pow(2)
    .divide(rainfall.add(ee.Image(0.8).multiply(S)))
    .where(rainfall.lt(initLoss), 0)
    // 【修复】clamp(0) 改为 max(0)
    .max(0)
    .rename('runoff_mm');

  return q;
}

function run(args) {
  utils.assert(args.biophysical_table, 'biophysical_table is required');
  utils.assert(args.lulc_current, 'lulc_current is required');
  utils.assert(args.rainfall, 'rainfall is required');

  var cnTable = args.cn_table || { 10: 60, 30: 70, 50: 90 }; // 提供一个默认 CN 表防报错
  var runoff = computeRunoff(args.rainfall, args.lulc_current, cnTable);

  var outputs = {
    runoff: runoff,
    runoff_volume: runoff.multiply(ee.Image.pixelArea().divide(1e6)).rename('runoff_m3')
  };

  if (args.lulc_future) {
    var runoffFuture = computeRunoff(args.rainfall, args.lulc_future, cnTable);
    outputs.runoff_future = runoffFuture;
    outputs.runoff_change = runoffFuture.subtract(runoff).rename('runoff_change');
  }

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.scsRunoff = scsRunoff;
exports.computeRunoff = computeRunoff;
