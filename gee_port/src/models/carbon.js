/**
 * InVEST Carbon Storage & Sequestration — GEE JS port.
 *
 * Computes carbon storage in four pools (aboveground, belowground, soil, dead
 * matter) for a LULC map, optionally running a sequestration scenario by
 * comparing two LULC maps, and optionally running a valuation component.
 *
 * Ported from: src/natcap/invest/carbon.py
 */

var utils = require('../utils/index.js');

var SPEC = {
  lulc_current: {
    about: 'Map of LULC for the current scenario.',
    type: 'raster',
    required: true
  },
  lulc_future: {
    about: 'Map of LULC for the future scenario.',
    type: 'raster',
    required: false
  },
  carbon_pools: {
    about: 'Table mapping each LULC code to carbon pool data.',
    type: 'table',
    required: true
  },
  calculate_sequestration: {
    about: 'Run sequestration analysis.',
    type: 'boolean',
    required: false
  },
  run_redd_scenario_analysis: {
    about: 'Run REDD scenario analysis.',
    type: 'boolean',
    required: false
  },
  lulc_redd: {
    about: 'Map of LULC for the REDD policy scenario.',
    type: 'raster',
    required: false
  },
  run_valuation_model: {
    about: 'Run valuation model.',
    type: 'boolean',
    required: false
  },
  price_of_carbon: {
    about: 'The present value of carbon.',
    type: 'number',
    required: false
  },
  annual_market_discount_rate: {
    about: 'Annual market discount rate.',
    type: 'number',
    required: false
  },
  annual_price_change: {
    about: 'Relative annual increase of the price of carbon.',
    type: 'number',
    required: false
  },
  lulc_cur_year: {
    about: 'Calendar year of the current scenario.',
    type: 'number',
    required: false
  },
  lulc_future_year: {
    about: 'Calendar year of the future scenario.',
    type: 'number',
    required: false
  }
};

/**
 * Load the carbon pools table as an ee.FeatureCollection.
 * @param {ee.FeatureCollection} carbonPools
 * @return {Object} lookup map {lulcCode: {above, below, soil, dead}}
 */
function loadCarbonPools(carbonPools) {
  var lookup = {};
  carbonPools.aggregate_array('lulc_code').evaluate(function (codes) {
    codes.forEach(function (c) { lookup[c] = null; });
  });
  return lookup;
}

/**
 * Compute total carbon density for a LULC map given a pools table.
 * @param {ee.Image} lulc
 * @param {Object} pools  {lulcCode: {above, below, soil, dead}}
 * @param {Array<string>} poolNames
 * @return {ee.Image} total carbon density (Mg/ha)
 */
function computeCarbonStorage(lulc, pools, poolNames) {
  poolNames = poolNames || ['above', 'below', 'soil', 'dead'];
  var result = ee.Image(0);
  Object.keys(pools).forEach(function (code) {
    var p = pools[code];
    var total = poolNames.reduce(function (s, name) { return s + (p[name] || 0); }, 0);
    result = result.where(lulc.eq(parseInt(code, 10)), total);
  });
  return result.rename('carbon_storage').copyProperties(lulc);
}

/**
 * Run the Carbon model.
 * @param {Object} args  See SPEC above.
 * @return {Object} {outputs: Object}
 */
function run(args) {
  utils.assert(args.lulc_current, 'lulc_current is required');
  utils.assert(args.carbon_pools, 'carbon_pools is required');

  var pools = loadCarbonPools(args.carbon_pools);
  var currentStorage = computeCarbonStorage(args.lulc_current, pools);

  var outputs = {
    carbon_storage: currentStorage,
    total_storage: currentStorage.reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: args.lulc_current.geometry(),
      scale: 30,
      bestEffort: true
    }).get('carbon_storage')
  };

  if (args.calculate_sequestration && args.lulc_future) {
    var futureStorage = computeCarbonStorage(args.lulc_future, pools);
    var sequestration = futureStorage.subtract(currentStorage)
      .rename('carbon_sequestration');
    outputs.carbon_sequestration = sequestration;
    outputs.sequestration = sequestration;
  }

  if (args.run_redd_scenario_analysis && args.lulc_redd) {
    var reddStorage = computeCarbonStorage(args.lulc_redd, pools);
    var reddSeq = reddStorage.subtract(currentStorage)
      .rename('redd_sequestration');
    outputs.redd_sequestration = reddSeq;
  }

  if (args.run_valuation_model && args.price_of_carbon !== undefined) {
    var price = args.price_of_carbon;
    var storageHa = currentStorage.divide(10000); // Mg/ha -> Mg/pixel at 30m
    var value = storageHa.multiply(price).rename('carbon_value');
    outputs.carbon_value = value;
  }

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.loadCarbonPools = loadCarbonPools;
exports.computeCarbonStorage = computeCarbonStorage;
