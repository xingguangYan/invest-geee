var utils = require('users/bqt2000204051/INVEST:src/utils/index');

var SPEC = {
  current_lulc: { about: 'Current land cover map.', type: 'raster', required: true },
  future_lulc: { about: 'Future land cover map.', type: 'raster', required: false },
  forest_edge_effect: { about: 'Table of forest edge effect parameters.', type: 'table', required: false },
  carbon_pools: { about: 'Carbon pools table.', type: 'table', required: true },
  carbon_pools_to_calculate: { about: 'Which carbon pools to calculate.', type: 'string', required: false },
  compute_forest_edge_effects: { about: 'Compute forest edge effects.', type: 'boolean', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

function computeForestEdgeEffect(forest, regression, a, b) {
  // var edgeDistance = forest.distance().rename('edge_distance');
  // 原代码：var edgeDistance = forest.distance().rename('edge_distance');
var edgeDistance = forest.distance(ee.Kernel.euclidean(1000, 'meters')).rename('edge_distance'); // 给个 10km 范围
  var ratio;
  // 【修复】将普通数字转为 ee.Image
  var aImg = ee.Image(a);
  var bImg = ee.Image(b);
  
  if (regression === 'logarithmic') {
    var lnX = edgeDistance.log().add(1);
    ratio = aImg.multiply(lnX).divide(bImg.add(lnX));
  } else if (regression === 'linear') {
    ratio = aImg.multiply(edgeDistance).add(bImg).clamp(0, 1);
  } else {
    ratio = aImg.multiply(edgeDistance).divide(bImg.add(edgeDistance));
  }
  ratio = ratio.where(forest.eq(1), ratio.clamp(0, 1));
  return ratio.rename('biomass_ratio');
}

function run(args) {
  utils.assert(args.current_lulc, 'current_lulc is required');
  utils.assert(args.carbon_pools, 'carbon_pools is required');

  var outputs = {};
  var forestCodes = args.forest_codes || [1];
  var forest = ee.Image(0);
  forestCodes.forEach(function (c) {
    forest = forest.or(args.current_lulc.eq(c));
  });
  outputs.current_forest = forest.rename('current_forest');

  if (args.compute_forest_edge_effects) {
    var ratio = computeForestEdgeEffect(forest, args.regression || 'asymptotic', args.asymptotic_A || 1, args.asymptotic_B || 1);
    outputs.biomass_ratio = ratio;
    outputs.edge_distance = forest.distance().rename('edge_distance');
  }
  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeForestEdgeEffect = computeForestEdgeEffect;
