/**
 * InVEST models namespace.
 *
 * Each model is exposed as `models.<MODEL_ID>` and is a plain object with:
 *   - spec: argument specification (name, about, type, required, ...)
 *   - run:  function(args) -> {outputs: Object}
 *
 * Import with:
 *     var invest = require('projects/your-account/invest');
 *     invest.models.annual_water_yield.run({...args...});
 */

var utils = require('../utils/index.js');

/**
 * Carbon Storage & Sequestration
 */
var carbon = require('./carbon.js');

/**
 * Annual Water Yield
 */
var annualWaterYield = require('./annual_water_yield.js');

/**
 * Seasonal Water Yield
 */
var seasonalWaterYield = require('./seasonal_water_yield.js');

/**
 * Sediment Delivery Ratio (SDR)
 */
var sdr = require('./sdr.js');

/**
 * Nutrient Delivery Ratio (NDR)
 */
var ndr = require('./ndr.js');

/**
 * Crop Production
 */
var cropProduction = require('./crop_production.js');

/**
 * Crop Pollination
 */
var cropPollination = require('./crop_pollination.js');

/**
 * Habitat Quality
 */
var habitatQuality = require('./habitat_quality.js');

/**
 * Habitat Risk Assessment
 */
var habitatRiskAssessment = require('./habitat_risk_assessment.js');

/**
 * Coastal Vulnerability
 */
var coastalVulnerability = require('./coastal_vulnerability.js');

/**
 * Coastal Blue Carbon
 */
var coastalBlueCarbon = require('./coastal_blue_carbon.js');

/**
 * Forest Carbon Edge Effect
 */
var forestCarbonEdge = require('./forest_carbon_edge_effect.js');

/**
 * Urban Cooling Model
 */
var urbanCoolingModel = require('./urban_cooling_model.js');

/**
 * Urban Nature Access
 */
var urbanNatureAccess = require('./urban_nature_access.js');

/**
 * Urban Mental Health
 */
var urbanMentalHealth = require('./urban_mental_health.js');

/**
 * Urban Flood Mitigation
 */
var urbanFloodMitigation = require('./urban_flood_mitigation.js');

/**
 * Urban Stormwater Runoff
 */
var urbanStormwater = require('./urban_stormwater.js');

/**
 * Recreation
 */
var recreation = require('./recreation.js');

/**
 * Scenic Quality
 */
var scenicQuality = require('./scenic_quality.js');

/**
 * Wave Energy
 */
var waveEnergy = require('./wave_energy.js');

/**
 * Wind Energy
 */
var windEnergy = require('./wind_energy.js');

/**
 * RouteDEM
 */
var routeDEM = require('./route_dem.js');

/**
 * DelineateIt
 */
var delineateIt = require('./delineateit.js');

/**
 * Scenario Generator — Proximity
 */
var scenarioGenProximity = require('./scenario_gen_proximity.js');

/**
 * Reservoir Hydropower Production
 */
var reservoirHydropower = require('./reservoir_hydropower_production.js');

exports.carbon = carbon;
exports.annualWaterYield = annualWaterYield;
exports.seasonalWaterYield = seasonalWaterYield;
exports.sdr = sdr;
exports.ndr = ndr;
exports.cropProduction = cropProduction;
exports.cropPollination = cropPollination;
exports.habitatQuality = habitatQuality;
exports.habitatRiskAssessment = habitatRiskAssessment;
exports.coastalVulnerability = coastalVulnerability;
exports.coastalBlueCarbon = coastalBlueCarbon;
exports.forestCarbonEdge = forestCarbonEdge;
exports.urbanCoolingModel = urbanCoolingModel;
exports.urbanNatureAccess = urbanNatureAccess;
exports.urbanMentalHealth = urbanMentalHealth;
exports.urbanFloodMitigation = urbanFloodMitigation;
exports.urbanStormwater = urbanStormwater;
exports.recreation = recreation;
exports.scenicQuality = scenicQuality;
exports.waveEnergy = waveEnergy;
exports.windEnergy = windEnergy;
exports.routeDEM = routeDEM;
exports.delineateIt = delineateIt;
exports.scenarioGenProximity = scenarioGenProximity;
exports.reservoirHydropower = reservoirHydropower;
