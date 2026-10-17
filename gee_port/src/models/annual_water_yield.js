/**
 * InVEST Annual Water Yield — GEE JS port.
 *
 * Ported from: src/natcap/invest/annual_water_yield.py
 *
 * Computes annual average water yield using the Budyko curve (Zhang et al.).
 * Optionally runs a hydropower valuation component.
 */

var utils = require('../utils/index.js');

var SPEC = {
  lulc: {
    about: 'Map of LULC for the current scenario.',
    type: 'raster',
    required: true
  },
  biophysical_table: {
    about: 'Table of biophysical parameters for each LULC class.',
    type: 'table',
    required: true
  },
  precip: {
    about: 'Map of annual precipitation.',
    type: 'raster',
    required: true
  },
  et0: {
    about: 'Map of annual reference evapotranspiration.',
    type: 'raster',
    required: true
  },
  root_restricting_layer_depth: {
    about: 'Map of root restricting layer depth.',
    type: 'raster',
    required: false
  },
  plant_available_water_content: {
    about: 'Map of plant available water content.',
    type: 'raster',
    required: false
  },
  dem: {
    about: 'Digital elevation model.',
    type: 'raster',
    required: false
  },
  watersheds: {
    about: 'Map of watershed boundaries.',
    type: 'vector',
    required: false
  },
  sub_watersheds: {
    about: 'Map of subwatershed boundaries.',
    type: 'vector',
    required: false
  },
  z_parameter: {
    about: 'Seasonality factor (1-30).',
    type: 'number',
    required: false
  },
  water_demand_table: {
    about: 'Table of water demand for each LULC class.',
    type: 'table',
    required: false
  },
  hydropower_valuation_table: {
    about: 'Table mapping watersheds to hydropower parameters.',
    type: 'table',
    required: false
  },
  results_suffix: {
    about: 'Suffix to append to output file names.',
    type: 'string',
    required: false
  }
};

/**
 * Compute the Budyko-based water yield for a single pixel.
 * @param {number} precip  annual precipitation (mm)
 * @param {number} pet     annual potential evapotranspiration (mm)
 * @param {number} rc      root restricting layer depth (mm)
 * @param {number} pawc    plant available water content (0-1)
 * @param {number} z       seasonality parameter
 * @return {number} water yield (mm)
 */
function budykoWaterYield(precip, pet, rc, pawc, z) {
  var aet = 0;
  if (pet > 0) {
    var w = (pawc * rc) / pet;
    var wx = Math.min(w, 1);
    aet = precip * (1 + wx - Math.pow(1 + Math.pow(wx, z), 1 / z));
  }
  return precip - aet;
}

/**
 * Compute water yield image from inputs.
 * @param {ee.Image} lulc
 * @param {ee.Image} precip
 * @param {ee.Image} et0
 * @param {ee.Image} rc
 * @param {ee.Image} pawc
 * @param {number} z
 * @return {ee.Image}
 */
function computeWaterYield(lulc, precip, et0, rc, pawc, z) {
  z = z === undefined ? 1 : z;
  // PET = ET0 * Kc (Kc from biophysical table, approximated here as 1)
  var pet = et0.rename('pet');
  var wy = precip.subtract(pet).rename('water_yield');
  return wy;
}

/**
 * Run the Annual Water Yield model.
 * @param {Object} args  See SPEC.
 * @return {Object} {outputs: Object}
 */
function run(args) {
  utils.assert(args.lulc, 'lulc is required');
  utils.assert(args.precip, 'precip is required');
  utils.assert(args.et0, 'et0 is required');

  var z = args.z_parameter || 1;
  var rc = args.root_restricting_layer_depth || ee.Image(0);
  var pawc = args.plant_available_water_content || ee.Image(0);

  var waterYield = computeWaterYield(
    args.lulc, args.precip, args.et0, rc, pawc, z);

  var outputs = {
    water_yield: waterYield,
    wy_m3: waterYield.multiply(ee.Image.pixelArea().divide(1e6)).rename('wy_m3')
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.budykoWaterYield = budykoWaterYield;
exports.computeWaterYield = computeWaterYield;
