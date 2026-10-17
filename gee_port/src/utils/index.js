/**
 * Shared utility functions used across all InVEST GEE ports.
 */

/**
 * Clamp a numeric value between min and max.
 */
function clamp(value, min, max) {
  if (min === undefined) min = -Infinity;
  if (max === undefined) max = Infinity;
  return Math.max(min, Math.min(max, value));
}

/**
 * Return the unique values of an array.
 */
function unique(arr) {
  return arr.filter(function (v, i) { return arr.indexOf(v) === i; });
}

/**
 * Sum a list of numbers.
 */
function sum(arr) {
  return arr.reduce(function (a, b) { return a + b; }, 0);
}

/**
 * Mean of a list of numbers.
 */
function mean(arr) {
  return arr.length ? sum(arr) / arr.length : 0;
}

/**
 * Convert an ee.Image to a list of pixel values sampled at given points.
 * Used for calibration / validation helpers.
 */
function sampleImage(image, points, scale, band) {
  var sel = band ? image.select(band) : image;
  return sel.sampleRegions({
    collection: points,
    scale: scale || 30,
    geometries: true
  });
}

/**
 * Compute the zonal mean of an image over each feature in a collection.
 */
function zonalMean(image, zones, scale, band) {
  var sel = band ? image.select(band) : image;
  var reduced = sel.reduceRegions({
    reducer: ee.Reducer.mean(),
    collection: zones,
    scale: scale || 30
  });
  return reduced.select(['mean'], null, false);
}

/**
 * Reclassify an image using a lookup table.
 * @param {ee.Image} image
 * @param {Object} lookup  {fromValue: toValue}
 * @param {number} fromBand  band name to reclassify (default first band)
 * @param {number} toValue  default value when no match
 */
function reclassify(image, lookup, fromBand, toValue) {
  var band = fromBand ? image.select(fromBand) : image.select(0);
  var keys = Object.keys(lookup);
  var result = ee.Image(toValue === undefined ? 0 : toValue);
  keys.forEach(function (k) {
    var mask = band.eq(parseFloat(k));
    result = result.where(mask, lookup[k]);
  });
  return result;
}

/**
 * Create a constant image filled with a value.
 */
function constantImage(value) {
  return ee.Image.constant(value);
}

/**
 * Mask an image with another image's non-zero pixels.
 */
function maskNonZero(image, mask) {
  return image.updateMask(mask.mask(mask.gt(0)));
}

/**
 * Compute the normalized difference between two bands.
 */
function ndvi(image, red, nir) {
  var r = image.select(red);
  var n = image.select(nir);
  return n.subtract(r).divide(n.add(r)).rename('NDVI');
}

/**
 * Compute the area (in square metres) of a binary mask at a given scale.
 */
function areaOfMask(mask, scale) {
  scale = scale || 30;
  var pixelArea = ee.Image.pixelArea();
  return mask.multiply(pixelArea).rename('area_m2');
}

/**
 * Convert square metres to hectares.
 */
function m2ToHa(img) {
  return img.divide(10000).rename(img.bandNames().get(0) + '_ha');
}

/**
 * Format a number as a human-readable string with given precision.
 */
function formatNumber(n, precision) {
  precision = precision === undefined ? 2 : precision;
  var factor = Math.pow(10, precision);
  return (Math.round(n * factor) / factor).toFixed(precision);
}

/**
 * Log a message to the GEE console and return the value (for chaining).
 */
function log(value, label) {
  if (label !== undefined) {
    print(label + ': ' + String(value));
  } else {
    print(String(value));
  }
  return value;
}

/**
 * Assert that a condition is true; throw if not.
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

exports.clamp = clamp;
exports.unique = unique;
exports.sum = sum;
exports.mean = mean;
exports.sampleImage = sampleImage;
exports.zonalMean = zonalMean;
exports.reclassify = reclassify;
exports.constantImage = constantImage;
exports.maskNonZero = maskNonZero;
exports.ndvi = ndvi;
exports.areaOfMask = areaOfMask;
exports.m2ToHa = m2ToHa;
exports.formatNumber = formatNumber;
exports.log = log;
exports.assert = assert;
