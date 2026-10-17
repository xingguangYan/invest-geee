/**
 * InVEST Crop Pollination — GEE JS port.
 *
 * Ported from: src/natcap/invest/pollination.py
 *
 * Estimates crop pollination value using a distance-decay kernel from
 * suitable habitat to crops.
 */

var utils = require('../utils/index.js');

var SPEC = {
  crop: { about: 'Map of crops.', type: 'raster', required: true },
  pollinators: { about: 'Map of pollinator habitat suitability.', type: 'raster', required: true },
  distance: { about: 'Maximum distance for pollinator movement.', type: 'number', required: false },
  decay: { about: 'Decay parameter for the kernel.', type: 'number', required: false },
  pollination_dependence: { about: 'Table of crop pollination dependence.', type: 'table', required: false },
  economic_values: { about: 'Economic values table.', type: 'table', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Compute pollination value using a radial distance-decay kernel.
 * @param {ee.Image} crop
 * @param {ee.Image} pollinator  suitability (0-1)
 * @param {number} maxDistance  metres
 * @param {number} decay  exponent
 * @return {ee.Image}
 */
function computePollinationValue(crop, pollinator, maxDistance, decay) {
  maxDistance = maxDistance === undefined ? 1000 : maxDistance;
  decay = decay === undefined ? 1 : decay;

  var cropMask = crop.gt(0);
  var distance = cropMask.distance();
  var kernel = ee.Image(1).subtract(distance.divide(maxDistance).pow(decay));
  kernel = kernel.where(distance.gte(maxDistance), 0).rename('kernel');

  var pollination = pollinator.multiply(kernel).rename('pollination');
  return pollination;
}

function run(args) {
  utils.assert(args.crop, 'crop is required');
  utils.assert(args.pollinators, 'pollinators is required');

  var maxDistance = args.distance || 1000;
  var decay = args.decay || 1;

  var pollination = computePollinationValue(args.crop, args.pollinators, maxDistance, decay);
  var outputs = {
    pollination: pollination,
    pollination_value: pollination.rename('pollination_value')
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computePollinationValue = computePollinationValue;
