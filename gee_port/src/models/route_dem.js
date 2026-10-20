var utils = require('users/bqt2000204051/INVEST:src/utils/index');

var SPEC = {
  dem: { about: 'Digital elevation model.', type: 'raster', required: true },
  origin_points: { about: 'Origin point features.', type: 'vector', required: true },
  destination_mask: { about: 'Binary mask of destination areas.', type: 'raster', required: true },
  max_distance: { about: 'Maximum travel distance (m).', type: 'number', required: false },
  cost_slope_factor: { about: 'Factor to weight slope in cost calculation.', type: 'number', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

function computeCostSurface(dem, slopeFactor) {
  slopeFactor = slopeFactor === undefined ? 1.0 : slopeFactor;
  var slope = ee.Terrain.slope(dem); 
  var slopeRad = slope.multiply(Math.PI / 180);
  // 【修复】将 slopeFactor 包装为 ee.Image
  var cost = ee.Image(1).add(ee.Image(slopeFactor).multiply(slopeRad.tan()));
  return cost.rename('cost');
}

function computeCostDistance(cost, origins, maxDistance) {
  maxDistance = maxDistance === undefined ? 10000 : maxDistance;
  var accessibility = ee.Image.pixelArea()
    .divide(cost.add(1e-6))
    .clamp(0, maxDistance)
    .rename('accessibility_score');
  return accessibility;
}

function run(args) {
  utils.assert(args.dem, 'dem is required');
  utils.assert(args.origin_points, 'origin_points is required');
  utils.assert(args.destination_mask, 'destination_mask is required');

  var slopeFactor = args.cost_slope_factor || 1.0;
  var maxDist = args.max_distance || 10000;

  var cost = computeCostSurface(args.dem, slopeFactor);
  var costDist = computeCostDistance(cost, args.origin_points, maxDist);

  var outputs = {
    cost_surface: cost,
    cost_distance: costDist,
    route_dem: costDist.multiply(args.destination_mask).rename('route_dem')
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeCostSurface = computeCostSurface;
exports.computeCostDistance = computeCostDistance;
