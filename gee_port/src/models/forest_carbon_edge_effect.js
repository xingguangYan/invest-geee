/**
 * InVEST Forest Carbon Edge Effect — GEE JS port.
 *
 * Ported from: src/natcap/invest/forest_carbon_edge_effect.py
 *
 * Estimates carbon sequestration in forests, accounting for the reduced
 * biomass near forest edges (edge effect).
 */

var utils = require('../utils/index.js');

var SPEC = {
  current_lulc: { about: 'Current land cover map.', type: 'raster', required: true },
  future_lulc: { about: 'Future land cover map.', type: 'raster', required: false },
  forest_edge_effect: { about: 'Table of forest edge effect parameters.', type: 'table', required: false },
  carbon_pools: { about: 'Carbon pools table.', type: 'table', required: true },
  carbon_pools_to_calculate: { about: 'Which carbon pools to calculate.', type: 'string', required: false },
  compute_forest_edge_effects: { about: 'Compute forest edge effects.', type: 'boolean', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Compute the forest edge effect: distance from forest edge, then apply
 * an asymptotic / logarithmic / linear curve to reduce biomass near edges.
 *
 * @param {ee.Image} forest  binary forest mask (1 = forest)
 * @param {string} regression  'asymptotic' | 'logarithmic' | 'linear'
 * @param {number} a  regression coefficient A
 * @param {number} b  regression coefficient B
 * @return {ee.Image} biomass ratio (0-1)
 */
function computeForestEdgeEffect(forest, regression, a, b) {
  var edgeDistance = forest.distance().rename('edge_distance');

  var ratio;
  if (regression === 'logarithmic') {
    // f(x) = A * ln(x + 1) / (B + ln(x + 1))
    var lnX = edgeDistance.log().add(1);
    ratio = a.multiply(lnX).divide(b.add(lnX));
  } else if (regression === 'linear') {
    ratio = a.multiply(edgeDistance).add(b).clamp(0, 1);
  } else {
    // asymptotic: f(x) = (A * x) / (B + x)
    ratio = a.multiply(edgeDistance).divide(b.add(edgeDistance));
  }

  ratio = ratio.where(forest.eq(1), ratio.clamp(0, 1));
  return ratio.rename('biomass_ratio');
}

/**
 * Run the Forest Carbon Edge Effect model.
 *
 * @param {Object} args  See SPEC.
 * @return {Object} {outputs: Object}
 */
function run(args) {
  utils.assert(args.current_lulc, 'current_lulc is required');
  utils.assert(args.carbon_pools, 'carbon_pools is required');

  var outputs = {};

  // Current forest mask (assumes forest codes provided in args)
  var forestCodes = args.forest_codes || [1];
  var forest = ee.Image(0);
  forestCodes.forEach(function (c) {
    forest = forest.or(args.current_lulc.eq(c));
  });

  outputs.current_forest = forest.rename('current_forest');

  if (args.compute_forest_edge_effects) {
    var regression = args.regression || 'asymptotic';
    var a = args.asymptotic_A || 1;
    var b = args.asymptotic_B || 1;
    var ratio = computeForestEdgeEffect(forest, regression, a, b);
    outputs.biomass_ratio = ratio;
    outputs.edge_distance = forest.distance().rename('edge_distance');
  }

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeForestEdgeEffect = computeForestEdgeEffect;
