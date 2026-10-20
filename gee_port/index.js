/**
 * InVEST on Google Earth Engine — GEE JS API port
 * -----------------------------------------------------------------------------
 * This file is the single entry point.  Import it from any GEE Code Editor
 * script or App with:
 *
 *     var invest = require('projects/your-account/invest');
 *
 * It exposes a `models` namespace containing every InVEST model ported to
 * GEE JavaScript, plus a handful of shared utilities.
 *
 * All model functions return an `ee.Image` (or a dictionary / feature collection
 * for tabular outputs) and accept plain JavaScript argument objects whose keys
 * match the InVEST model spec argument names.  Raster inputs must be given as
 * `ee.Image` objects; vector inputs as `ee.FeatureCollection`.
 */

var models = require('users/bqt2000204051/INVEST:src/models/index');
var utils = require('users/bqt2000204051/INVEST:src/utils/index');

exports.models = models;
exports.utils = utils;
