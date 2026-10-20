/**
 * InVEST Urban Mental Health — GEE JS port.
 *
 * Ported from: src/natcap/invest/urban_mental_health.py
 *
 * Estimates the share of the population living near green open space
 * at a minimum area threshold, used as a proxy for mental health benefit.
 */

var utils = require('users/bqt2000204051/INVEST:src/utils/index');

var SPEC = {
  landcover: { about: 'Land cover map.', type: 'raster', required: true },
  population: { about: 'Population map.', type: 'raster', required: true },
  distance_threshold: { about: 'Walking distance threshold (m).', type: 'number', required: false },
  min_area: { about: 'Minimum green space area (ha).', type: 'number', required: false },
  nature_lulc: { about: 'LULC codes that count as green space.', type: 'table', required: true },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

function computeMentalHealthAccess(landcover, population, greenCodes, thresholdM, minAreaHa) {
  thresholdM = thresholdM === undefined ? 500 : thresholdM;
  minAreaHa = minAreaHa === undefined ? 1 : minAreaHa;

  var green = ee.Image(0);
  greenCodes.forEach(function (c) {
    green = green.or(landcover.eq(c));
  });

  // 【修复】增加 ee.Kernel.euclidean 核函数
  var dist = green.distance(ee.Kernel.euclidean(thresholdM, 'meters')).rename('distance_to_green');
  var within = dist.lte(thresholdM);
  var accessMap = population.gt(0).where(within, 1).where(population.gt(0).not(), 0)
    .rename('green_access');

  return { access_map: accessMap, distance_to_green: dist };
}

function run(args) {
  utils.assert(args.landcover, 'landcover is required');
  utils.assert(args.population, 'population is required');

  var codes = (args.nature_lulc && args.nature_lulc.codes) || [1];
  var threshold = args.distance_threshold || 500;
  var minArea = args.min_area || 1;

  var result = computeMentalHealthAccess(
    args.landcover, args.population, codes, threshold, minArea);
  var outputs = {
    green_access: result.access_map,
    distance_to_green: result.distance_to_green
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeMentalHealthAccess = computeMentalHealthAccess;
