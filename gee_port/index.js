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

var utils = require('./src/utils/index.js');
var models = require('./src/models/index.js');

/**
 * Resolve a user-supplied argument object against a model spec.
 * Missing required arguments raise a readable error.
 */
function validateArgs(args, spec) {
  var missing = [];
  Object.keys(spec).forEach(function (key) {
    if (spec[key].required && (args[key] === undefined || args[key] === null)) {
      missing.push(key);
    }
  });
  if (missing.length > 0) {
    throw new Error(
      'Missing required arguments: ' + missing.join(', '));
  }
  return args;
}

/**
 * Build a simple HTML report string for a model run.
 * In the full Workbench port this would use the Jinja2 templates in
 * reports/templates; here we produce a minimal text summary.
 */
function buildReport(modelId, args, outputs) {
  var lines = [];
  lines.push('<html><head><title>' + modelId + ' Report</title></head><body>');
  lines.push('<h1>' + modelId + ' Report</h1>');
  lines.push('<p>Model ran with ' + Object.keys(args).length + ' arguments.</p>');
  lines.push('<h2>Outputs</h2><ul>');
  Object.keys(outputs).forEach(function (k) {
    lines.push('<li><strong>' + k + '</strong></li>');
  });
  lines.push('</ul></body></html>');
  return lines.join('\n');
}

exports.utils = utils;
exports.models = models;
exports.validateArgs = validateArgs;
exports.buildReport = buildReport;
