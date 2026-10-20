/**
 * InVEST Urban Nature Access — GEE JS port.
 *
 * Ported from: src/natcap/invest/urban_nature_access.py
 *
 * Estimates the share of the population that has access to nature
 * (vegetated area) within a walkable distance threshold.
 */

var utils = require('users/bqt2000204051/INVEST:src/utils/index');

var SPEC = {
  landcover: { about: 'Land cover map.', type: 'raster', required: true },
  population: { about: 'Population map.', type: 'raster', required: true },
  distance_threshold: { about: 'Walking distance threshold (m).', type: 'number', required: false },
  nature_lulc: { about: 'LULC codes that count as nature.', type: 'table', required: true },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

function computeNatureAccess(landcover, population, natureCodes, thresholdM) {
  thresholdM = thresholdM === undefined ? 500 : thresholdM;

  var nature = ee.Image(0);
  natureCodes.forEach(function (c) {
    nature = nature.or(landcover.eq(c));
  });

  var popMask = population.gt(0);
  // 【修复】增加 ee.Kernel.euclidean 核函数
  var dist = nature.distance(ee.Kernel.euclidean(thresholdM, 'meters')).rename('distance_to_nature');
  var within = dist.lte(thresholdM);
  var accessMap = popMask.where(within, 1).where(popMask.not(), 0)
    .rename('nature_access');

  var served = population.multiply(within).rename('population_served');

  return { access_map: accessMap, population_served: served };
}

function run(args) {
  utils.assert(args.landcover, 'landcover is required');
  utils.assert(args.population, 'population is required');

  var codes = (args.nature_lulc && args.nature_lulc.codes) || [1];
  var threshold = args.distance_threshold || 500;

  var result = computeNatureAccess(args.landcover, args.population, codes, threshold);
  var outputs = {
    nature_access: result.access_map,
    population_served: result.population_served
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeNatureAccess = computeNatureAccess;
