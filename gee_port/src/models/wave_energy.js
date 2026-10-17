/**
 * InVEST Wave Energy — GEE JS port.
 *
 * Ported from: src/natcap/invest/wave_energy.py
 *
 * Estimates wave energy density using the global WaveWatchIII dataset.
 */

var utils = require('../utils/index.js');

var SPEC = {
  wave_watch: { about: 'WaveWatchIII global gridded dataset.', type: 'raster', required: true },
  model_resolution: { about: 'Model resolution.', type: 'number', required: false },
  landmasses: { about: 'Land mask.', type: 'raster', required: true },
  results_suffix: { about: 'Suffix for output names.', type: 'string', required: false }
};

/**
 * Wave energy density (W/m):
 *   E = 0.5 * rho * g * Hs^2  (J/m^2)
 *   P = E * c  (W/m),  c = wave celerity
 * Simplified celerity: c ≈ g*T/(2*pi) for deep water.
 *
 * @param {ee.Image} waveWatch  must have bands: Hs (significant wave height), Tp (peak period)
 * @return {ee.Image}  wave energy density (W/m)
 */
function computeWaveEnergy(waveWatch) {
  var g = 9.81;
  var rho = 1025; // seawater density (kg/m^3)

  var hs = waveWatch.select('Hs').rename('Hs');
  var tp = waveWatch.select('Tp').rename('Tp');

  var energy = 0.5.multiply(rho).multiply(g).multiply(hs.pow(2)); // J/m^2
  var celerity = g.multiply(tp).divide(2 * Math.PI); // m/s
  var power = energy.multiply(celerity).rename('wave_power_Wm');

  return power;
}

function run(args) {
  utils.assert(args.wave_watch, 'wave_watch is required');
  utils.assert(args.landmasses, 'landmasses is required');

  var ocean = args.landmasses.eq(0);
  var waveEnergy = computeWaveEnergy(args.wave_watch)
    .updateMask(ocean)
    .rename('wave_energy_density');

  var outputs = {
    wave_energy_density: waveEnergy
  };

  return { outputs: outputs, spec: SPEC };
}

exports.spec = SPEC;
exports.run = run;
exports.computeWaveEnergy = computeWaveEnergy;
