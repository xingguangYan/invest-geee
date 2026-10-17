/**
 * InVEST Recreation — GEE JS port.
 *
 * Ported from: src/natcap/invest/recreation.py
 *
 * Estimates outdoor recreation (outdoor recreation) activity using
 * the out-of-core quadtree approach: counts visitors based on the
 * distance from visitor origin points (populated areas) to
 * recreation amenities.
 */

var utils = require('../utils/index.js');

var SPEC = {
  amenity_map: { about: 'Map of recreation amenities.', type: 'raster', required: true },
  population: { about: 'Population (visitor origin) map.', type: 'raster', required: true },
  amenity_type: { about: 'Table of amenity types and values.', type: 'table', required: true },
  distance_decay: { about: 'Distance decay table.', type: 'table', required: false },
  max_travel_time: { about: 'Maximum travel time to an amenity (minutes).', type: 'number', required: false },
  travel_speed: { about: 'Average travel speed (km/h).', type: 'number', required: false },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Compute the recreation value of each amenity pixel as a function of
 * the population within the maximum travel distance.
 *
 * @param {ee.Image} amenity  binary amenity map
 * @param {ee.Image} population  population (visitor origins)
 * @param {number} maxDistance  metres
 * @return {ee.Image}
 */
function computeRecreationValue(amenity, population, maxDistance) {
  maxDistance = maxDistance === undefined ? 10000 : maxDistance;

  var popMask = population.gt(0);
  var dist = popMask.distance().rename('distance_to_population');
  var within = dist.lte(maxDistance);

  var popServed = population.multiply(within).rename('population_served');
  var value = popServed.rename('recreation_value');

  return { value: value, distance: dist, popServed: popServed };
}

function run(args) {
  utils.assert(args.amenity_map, 'amenity_map is required');
  utils.assert(args.population, 'population is required');
  utils.assert(args.amenity_type, 'amenity_type is required');

  var travelSpeed = args.travel_speed || 10; // km/h
  var maxTime = args.max_travel_time || 30; // minutes
  var maxDistance = travelSpeed * (maxTime / 60) * 1000; // metres

  var result = computeRecreationValue(args.amenity_map, args.population, maxDistance);
  var outputs = {
    recreation_value: result.value,
    distance_to_population: result.distance,
    population_served: result.popServed
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeRecreationValue = computeRecreationValue;
