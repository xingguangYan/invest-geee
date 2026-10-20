var utils = require('users/bqt2000204051/INVEST:src/utils/index');

var SPEC = {
  lulc_current: { about: 'Map of LULC for the current scenario.', type: 'raster', required: true },
  lulc_future: { about: 'Map of LULC for the future scenario.', type: 'raster', required: false },
  carbon_pools: { about: 'Table mapping each LULC code to carbon pool data.', type: 'table', required: true },
  calculate_sequestration: { about: 'Run sequestration analysis.', type: 'boolean', required: false },
  run_redd_scenario_analysis: { about: 'Run REDD scenario analysis.', type: 'boolean', required: false },
  lulc_redd: { about: 'Map of LULC for the REDD policy scenario.', type: 'raster', required: false },
  run_valuation_model: { about: 'Run valuation model.', type: 'boolean', required: false },
  price_of_carbon: { about: 'The present value of carbon.', type: 'number', required: false },
  annual_market_discount_rate: { about: 'Annual market discount rate.', type: 'number', required: false },
  annual_price_change: { about: 'Relative annual increase of the price of carbon.', type: 'number', required: false },
  lulc_cur_year: { about: 'Calendar year of the current scenario.', type: 'number', required: false },
  lulc_future_year: { about: 'Calendar year of the future scenario.', type: 'number', required: false }
};

// 改为服务端 remap，避免异步 evaluate 报错
function computeCarbonStorage(lulc, carbonPools) {
  var totalMap = carbonPools.map(function(f) {
    var total = ee.Number(f.get('above')).add(ee.Number(f.get('below'))).add(ee.Number(f.get('soil'))).add(ee.Number(f.get('dead')));
    return f.set('total', total);
  });
  var codes = totalMap.aggregate_array('lulc_code');
  var totals = totalMap.aggregate_array('total');
  return lulc.remap(codes, totals, 0).rename('carbon_storage');
}

function run(args) {
  utils.assert(args.lulc_current, 'lulc_current is required');
  utils.assert(args.carbon_pools, 'carbon_pools is required');

  var currentStorage = computeCarbonStorage(args.lulc_current, args.carbon_pools);

  var outputs = {
    carbon_storage: currentStorage,
    // 使用 aggregate_sum 避免 reduceRegion 报错
    total_storage: currentStorage.multiply(ee.Image.pixelArea().divide(10000)).reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: args.lulc_current.geometry(),
      scale: 30,
      bestEffort: true
    }).getNumber('carbon_storage')
  };

  if (args.calculate_sequestration && args.lulc_future) {
    var futureStorage = computeCarbonStorage(args.lulc_future, args.carbon_pools);
    outputs.carbon_sequestration = futureStorage.subtract(currentStorage).rename('carbon_sequestration');
  }
  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeCarbonStorage = computeCarbonStorage;
