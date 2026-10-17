/**
 * InVEST Scenario Generator — Proximity — GEE JS port.
 *
 * Ported from: src/natcap/invest/scenario_proximity.py
 *
 * Generates land cover scenarios by reclassifying pixels within a
 * specified distance of target features (urban expansion, conservation, etc.).
 */

var utils = require('../utils/index.js');

var SPEC = {
  current_scenario: { about: 'Current LULC scenario.', type: 'raster', required: true },
  target_features: { about: 'Vector features defining target areas.', type: 'vector', required: true },
  distance_band_width: { about: 'Width of each distance band (m).', type: 'number', required: false },
  num_bands: { about: 'Number of distance bands.', type: 'number', required: false },
  scenario_rules: { about: 'Rules for reclassification per band.', type: 'table', required: true },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Compute distance bands around target features.
 *
 * @param {ee.FeatureCollection} targets
 * @param {number} bandWidth  metres
 * @param {number} numBands
 * @return {ee.Image} distance bands (integer codes 1..numBands)
 */
function computeDistanceBands(targets, bandWidth, numBands) {
  bandWidth = bandWidth === undefined ? 1000 : bandWidth;
  numBands = numBands === undefined ? 5 : numBands;

  // Compute distance to nearest target
  var dist = targets.distance().rename('distance');

  // Create bands: band i = pixels with distance in [(i-1)*width, i*width)
  var bands = ee.Image(0);
  for (var i = 1; i <= numBands; i++) {
    var lower = (i - 1) * bandWidth;
    var upper = i * bandWidth;
    var bandMask = dist.gte(lower).and(dist.lt(upper));
    bands = bands.where(bandMask, i);
  }
  // Pixels beyond last band get code numBands+1
  bands = bands.where(dist.gte(numBands * bandWidth), numBands + 1)
    .rename('distance_band');

  return bands;
}

/**
 * Apply scenario rules to generate future LULC scenario.
 *
 * @param {ee.Image} currentLULC
 * @param {ee.Image} distanceBands
 * @param {Array} rules  [{band: N, new_lulc: M}, ...]
 * @return {ee.Image}
 */
function applyScenarioRules(currentLULC, distanceBands, rules) {
  var result = currentLULC;
  rules.forEach(function (rule) {
    var bandMask = distanceBands.eq(rule.band);
    result = result.where(bandMask, rule.new_lulc);
  });
  return result.rename('scenario_lulc');
}

function run(args) {
  utils.assert(args.current_scenario, 'current_scenario is required');
  utils.assert(args.target_features, 'target_features is required');
  utils.assert(args.scenario_rules, 'scenario_rules is required');

  var bandWidth = args.distance_band_width || 1000;
  var numBands = args.num_bands || 5;

  var distanceBands = computeDistanceBands(args.target_features, bandWidth, numBands);
  var scenario = applyScenarioRules(args.current_scenario, distanceBands, args.scenario_rules.value || []);

  var outputs = {
    distance_bands: distanceBands,
    scenario_lulc: scenario
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeDistanceBands = computeDistanceBands;
exports.applyScenarioRules = applyScenarioRules;
