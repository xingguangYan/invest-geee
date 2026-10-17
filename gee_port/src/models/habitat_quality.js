/**
 * InVEST Habitat Quality — GEE JS port.
 *
 * Ported from: src/natcap/invest/habitat_quality.py
 *
 * Computes habitat quality by combining land-cover suitability with
 * threat-distance decay.
 */

var utils = require('../utils/index.js');

var SPEC = {
  habitat: { about: 'Map of habitat suitability by LULC.', type: 'raster', required: true },
  land_cover: { about: 'Land cover map.', type: 'raster', required: true },
  threats: { about: 'Map of threats.', type: 'raster', required: false },
  weights: { about: 'Weight of each threat.', type: 'table', required: false },
  max_distance: { about: 'Maximum threat distance (m).', type: 'table', required: false },
  amplitude: { about: 'Threat decay amplitude.', type: 'table', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Compute habitat quality: quality = suitability * (1 - threat_pressure).
 * Threat pressure uses an exponential decay from each threat source.
 *
 * @param {ee.Image} habitat  suitability (0-1)
 * @param {ee.Image} threat  threat source (0-1)
 * @param {number} maxDistance  metres
 * @param {number} amplitude  decay amplitude
 * @param {number} weight  threat weight
 * @return {ee.Image}
 */
function computeHabitatQuality(habitat, threat, maxDistance, amplitude, weight) {
  maxDistance = maxDistance === undefined ? 1000 : maxDistance;
  amplitude = amplitude === undefined ? 1 : amplitude;
  weight = weight === undefined ? 1 : weight;

  var threatMask = threat.gt(0);
  var distance = threatMask.distance();
  var decay = ee.Image(amplitude).exp(ee.Image(-1).multiply(distance).divide(maxDistance));
  var threatPressure = threat.multiply(decay).multiply(weight).rename('threat_pressure');
  threatPressure = threatPressure.clamp(0, 1);

  var quality = habitat.multiply(ee.Image(1).subtract(threatPressure)).rename('habitat_quality');
  return quality;
}

function run(args) {
  utils.assert(args.habitat, 'habitat is required');
  utils.assert(args.land_cover, 'land_cover is required');

  var quality;
  if (args.threats) {
    quality = computeHabitatQuality(
      args.habitat, args.threats,
      (args.max_distance && args.max_distance.value) || 1000,
      (args.amplitude && args.amplitude.value) || 1,
      (args.weights && args.weights.value) || 1
    );
  } else {
    quality = args.habitat.rename('habitat_quality');
  }

  var outputs = {
    habitat_quality: quality
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeHabitatQuality = computeHabitatQuality;
