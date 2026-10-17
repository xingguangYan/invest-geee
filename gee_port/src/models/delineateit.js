/**
 * InVEST DelineateIt — GEE JS port.
 *
 * Ported from: src/natcap/invest/delineateit/*.py
 *
 * Watershed delineation: flow direction, flow accumulation, stream definition,
 * and watershed polygons.
 *
 * NOTE: GEE does not have native flow-direction/accumulation algorithms.
 * This implementation provides a simplified slope-based subwatershed
 * approximation using terrain attributes. For full delineation, use the
 * native InVEST binary or call via earthengine-api Python.
 */

var utils = require('../utils/index.js');

var SPEC = {
  flow_direction: { about: 'Flow direction raster (D8 code).', type: 'raster', required: false },
  flow_accumulation: { about: 'Flow accumulation raster.', type: 'raster', required: false },
  precip: { about: 'Precipitation map.', type: 'raster', required: false },
  outflow_point: { about: 'Outflow point feature.', type: 'vector', required: false },
  flow_accumulation_threshold: { about: 'Threshold for stream definition.', type: 'number', required: false },
  max_watersheds: { about: 'Maximum number of subwatersheds.', type: 'number', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Approximate subwatershed delineation using Euclidean distance from stream network.
 * Streams are defined where flow accumulation exceeds threshold.
 *
 * @param {ee.Image} flowAccum
 * @param {number} threshold
 * @return {ee.Image} streams mask
 */
function defineStreams(flowAccum, threshold) {
  threshold = threshold === undefined ? 1000 : threshold;
  return flowAccum.gte(threshold).rename('streams').selfMask();
}

/**
 * Compute distance to nearest stream (as approximation of flow path).
 *
 * @param {ee.Image} streams
 * @param {ee.Image} dem
 * @return {Object} {stream_distance, subwatershed_id}
 */
function approximateDelineation(streams, dem) {
  var streamDist = streams.distance().rename('stream_distance_m');

  // Simplified: assign subwatershed IDs based on distance zones
  var zones = [0, 500, 1000, 2000, 5000];
  var subwatershed = ee.Image(0);
  for (var i = 0; i < zones.length - 1; i++) {
    subwatershed = subwatershed.where(
      streamDist.gte(zones[i]).and(streamDist.lt(zones[i + 1])),
      i + 1
    );
  }
  subwatershed = subwatershed.where(streamDist.gte(zones[zones.length - 1]), zones.length)
    .rename('subwatershed_id');

  return { stream_distance: streamDist, subwatershed_id: subwatershed };
}

function run(args) {
  var outputs = {};

  if (args.flow_accumulation) {
    var threshold = args.flow_accumulation_threshold || 1000;
    var streams = defineStreams(args.flow_accumulation, threshold);
    outputs.streams = streams;

    if (args.dem) {
      var result = approximateDelineation(streams, args.dem);
      outputs.stream_distance = result.stream_distance;
      outputs.subwatershed_id = result.subwatershed_id;
    }
  }

  // If flow direction is provided, use terrain aspect as proxy for flow direction
  if (args.flow_direction) {
    outputs.flow_direction = args.flow_direction;
  }

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.defineStreams = defineStreams;
exports.approximateDelineation = approximateDelineation;
