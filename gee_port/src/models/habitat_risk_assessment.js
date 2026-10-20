/**
 * InVEST Habitat Risk Assessment — GEE JS port.
 *
 * Ported from: src/natcap/invest/habitat_risk_assessment.py
 *
 * Quantifies the risk to habitat from the cumulative pressure of
 * spatially-explicit stressor layers using a distance-decay function.
 */

var utils = require('users/bqt2000204051/INVEST:src/utils/index');

var SPEC = {
  habitat: { about: 'Map of habitat suitability.', type: 'raster', required: true },
  stressor_layers: { about: 'List of stressor rasters.', type: 'raster', required: true },
  stressor_weight_table: { about: 'Table of stressor weights.', type: 'table', required: false },
  max_distance: { about: 'Maximum stressor distance (m).', type: 'table', required: false },
  amplitude: { about: 'Decay amplitude.', type: 'table', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Accumulate threat pressure from multiple stressor layers.
 *
 * @param {ee.Image} habitat  suitability (0-1)
 * @param {Array<ee.Image>} stressorLayers  one image per stressor
 * @param {Array<number>} weights  one weight per stressor
 * @param {number} maxDistance  metres
 * @param {number} amplitude  decay amplitude
 * @return {ee.Image}
 */
function computeHabitatRisk(habitat, stressorLayers, weights, maxDistance, amplitude) {
  maxDistance = maxDistance === undefined ? 1000 : maxDistance;
  amplitude = amplitude === undefined ? 1 : amplitude;

  var totalPressure = ee.Image(0);
// 修改 `computeHabitatRisk` 函数内部：
  stressorLayers.forEach(function (layer, i) {
    var w = (weights && weights[i]) || 1;
    var mask = layer.gt(0);
    // var distance = mask.distance();
    // 原代码：var distance = mask.distance();
var distance = mask.distance(ee.Kernel.euclidean(maxDistance, 'meters'));
    // 【修复】改成 .exp()
    var decay = ee.Image(-1).multiply(distance).divide(maxDistance).exp().multiply(amplitude);
    totalPressure = totalPressure.add(layer.multiply(decay).multiply(w));
  });
  totalPressure = totalPressure.clamp(0, 1).rename('threat_pressure');

  var risk = ee.Image(1).subtract(habitat.multiply(ee.Image(1).subtract(totalPressure)))
    .rename('habitat_risk');
  return risk;
}

function run(args) {
  utils.assert(args.habitat, 'habitat is required');
  utils.assert(args.stressor_layers, 'stressor_layers is required');

  var layers = args.stressor_layers;
  if (!Array.isArray(layers)) {
    layers = [layers];
  }

  var weights = (args.stressor_weight_table && args.stressor_weight_table.value) || null;
  var maxDistance = (args.max_distance && args.max_distance.value) || 1000;
  var amplitude = (args.amplitude && args.amplitude.value) || 1;

  var risk = computeHabitatRisk(args.habitat, layers, weights, maxDistance, amplitude);
  var outputs = {
    habitat_risk: risk
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeHabitatRisk = computeHabitatRisk;
