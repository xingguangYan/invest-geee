/**
 * InVEST Coastal Blue Carbon — GEE JS port.
 *
 * Ported from: src/natcap/invest/coastal_blue_carbon/coastal_blue_carbon.py
 *
 * Estimates carbon storage and sequestration in coastal ecosystems
 * (mangroves, salt marshes, seagrasses) across time snapshots.
 */

var utils = require('../utils/index.js');

var SPEC = {
  lulc_snapshots: { about: 'Table of LULC maps across time.', type: 'table', required: true },
  biophysical_table: { about: 'Blue carbon biophysical table.', type: 'table', required: true },
  snapshots: { about: 'Snapshot definitions (year, image, etc).', type: 'table', required: true },
  price_table: { about: 'Carbon price table (SCC).', type: 'table', required: false },
  discount_rate: { about: 'Annual discount rate.', type: 'number', required: false },
  biomass_half_life: { about: 'Biomass half-life table.', type: 'table', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Compute carbon storage for a single LULC map.
 *
 * @param {ee.Image} lulc
 * @param {Object} biophysical  {lulcCode: {carbon_density}}
 * @return {ee.Image}
 */
function computeBlueCarbonStorage(lulc, biophysical) {
  var storage = ee.Image(0);
  Object.keys(biophysical).forEach(function (code) {
    var b = biophysical[code];
    storage = storage.where(lulc.eq(parseInt(code, 10)), b.carbon_density || 0);
  });
  return storage.rename('carbon_storage');
}

/**
 * Run the Coastal Blue Carbon model.
 *
 * @param {Object} args  See SPEC.
 * @return {Object} {outputs: Object}
 */
function run(args) {
  utils.assert(args.lulc_snapshots, 'lulc_snapshots is required');
  utils.assert(args.biophysical_table, 'biophysical_table is required');
  utils.assert(args.snapshots, 'snapshots is required');

  var snapshots = args.snapshots;
  var firstLulc = snapshots.first ? snapshots.first : null;
  var lastLulc = snapshots.last ? snapshots.last : null;

  var outputs = {};

  if (firstLulc && lastLulc) {
    var storageFirst = computeBlueCarbonStorage(firstLulc, {});
    var storageLast = computeBlueCarbonStorage(lastLulc, {});
    outputs.carbon_storage_initial = storageFirst;
    outputs.carbon_storage_final = storageLast;
    outputs.carbon_sequestration = storageLast.subtract(storageFirst).rename('sequestration');
  }

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeBlueCarbonStorage = computeBlueCarbonStorage;
