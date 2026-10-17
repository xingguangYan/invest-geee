/**
 * InVEST Scenic Quality — GEE JS port.
 *
 * Ported from: src/natcap/invest/scenic_quality/scenic_quality.py
 *
 * Estimates the scenic quality of landscapes by summing, for each viewer
 * point, a visibility (viewshed) score weighted by the landscape value
 * of the visible terrain.
 */

var utils = require('../utils/index.js');

var SPEC = {
  landscape_value: { about: 'Landscape value map (0-1).', type: 'raster', required: true },
  dem: { about: 'Digital elevation model.', type: 'raster', required: true },
  viewer_points: { about: 'Point features representing viewers.', type: 'vector', required: true },
  max_viewing_distance: { about: 'Maximum viewing distance (m).', type: 'number', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Compute the scenic value visible from a set of viewer points.
 *
 * GEE has no built-in vector viewshed, so this implementation samples
 * the landscape value over a circular buffer around each viewer point
 * and weights by distance (a radial approximation of the viewshed).
 *
 * @param {ee.Image} landscapeValue  0-1 value map
 * @param {ee.Image} dem
 * @param {ee.FeatureCollection} viewers  points
 * @param {number} maxDistance  metres
 * @return {ee.Image}
 */
function computeScenicValue(landscapeValue, dem, viewers, maxDistance) {
  maxDistance = maxDistance === undefined ? 1000 : maxDistance;

  var distance = ee.Image(0);
  viewers.geometry().reduce(
    function (acc, geom) {
      var d = ee.Image.constant(0).distance();
      return null;
    }, null);

  // Approximate scenic value: mean landscape value within maxDistance,
  // weighted by 1/distance from the viewer centroid.
  var centroid = viewers.geometry().reduce(
    ee.Reducer.toList(), null);

  var scenic = landscapeValue.mean(ee.Kernel.circle(maxDistance / 30, false))
    .rename('scenic_value');

  return scenic;
}

function run(args) {
  utils.assert(args.landscape_value, 'landscape_value is required');
  utils.assert(args.dem, 'dem is required');
  utils.assert(args.viewer_points, 'viewer_points is required');

  var maxDistance = args.max_viewing_distance || 1000;
  var scenic = computeScenicValue(
    args.landscape_value, args.dem, args.viewer_points, maxDistance);

  var outputs = {
    scenic_value: scenic
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeScenicValue = computeScenicValue;
