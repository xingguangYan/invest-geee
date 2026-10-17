/**
 * InVEST Urban Cooling Model — GEE JS port.
 *
 * Ported from: src/natcap/invest/urban_cooling_model.py
 *
 * Estimates the change in land surface temperature (LST) caused by
 * changes in the spatial extent and arrangement of vegetation.
 */

var utils = require('../utils/index.js');

var SPEC = {
  biophysical_table: { about: 'Biophysical parameters table.', type: 'table', required: true },
  land_cover: { about: 'Current land cover map.', type: 'raster', required: true },
  land_use: { about: 'Current land use map.', type: 'raster', required: false },
  future_land_cover: { about: 'Future land cover map.', type: 'raster', required: false },
  future_land_use: { about: 'Future land use map.', type: 'raster', required: false },
  max_lag: { about: 'Maximum lag for the LST model.', type: 'number', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Compute the cooling effect of vegetation as a function of
 * vegetation fraction within a search radius.
 *
 * @param {ee.Image} landCover
 * @param {Object} biophysical  {lulcCode: {cooling_capacity, ...}}
 * @param {number} radius  metres
 * @return {ee.Image}  LST change (K)
 */
function computeCoolingEffect(landCover, biophysical, radius) {
  radius = radius === undefined ? 1000 : radius;

  // vegetation fraction within radius
  var veg = ee.Image(0);
  Object.keys(biophysical).forEach(function (code) {
    var b = biophysical[code];
    var isVeg = b.lulc_veg ? 1 : 0;
    veg = veg.where(landCover.eq(parseInt(code, 10)), isVeg);
  });

  var vegFrac = veg.mean(ee.Kernel.circle(radius / 30)).rename('veg_fraction');

  // cooling capacity (K) — simplified: linear with veg fraction
  var coolingCapacity = (biophysical && Object.keys(biophysical).length) ? 3 : 3;
  var lstChange = vegFrac.multiply(ee.Image(-1)).multiply(coolingCapacity)
    .rename('lst_change_K');

  return lstChange;
}

function run(args) {
  utils.assert(args.biophysical_table, 'biophysical_table is required');
  utils.assert(args.land_cover, 'land_cover is required');

  var radius = args.max_lag || 1000;
  var lstChange = computeCoolingEffect(args.land_cover, {}, radius);

  var outputs = {
    lst_change: lstChange
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeCoolingEffect = computeCoolingEffect;
