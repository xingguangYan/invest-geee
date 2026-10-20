/**
 * GEE Application entry point — demo of the InVEST port.
 *
 * This script demonstrates how to call the InVEST models ported from
 * D:\软件\INVEST\gee_port using public Earth Engine datasets.
 *
 * Upload the whole `gee_port/` tree to a GEE Code Editor project, then
 * paste this script into a new `.js` file (e.g. `main.js`) in the same
 * project.  Open the console and click **Run** to see the results.
 *
 * Required models are available via:
 *     var invest = require('projects/your-account/gee_port');
 *
 * You can replace the sample datasets with your own local assets or
 * Drive-mounted rasters.
 */

/**
 * GEE Application entry point — demo of the InVEST port.
 * 放在根目录的 main 文件里运行
 */

// ---------------------------------------------------------------------------
// 1.  Import the InVEST library
// ---------------------------------------------------------------------------
var invest = require('users/bqt2000204051/INVEST:index');

// ---------------------------------------------------------------------------
// 2.  Define sample inputs from publicly available GEE collections
// ---------------------------------------------------------------------------

// --- Land use / land cover (LCMAPS 30m, 2021) ------------------------------
var lulc_2021 = ee.Image('projects/gcp-public-dataset-forestry/assets/LCMAPS_LCMAPS_CONSTANT_COVERAGE_L8_v13_12')
                  .select('land_cover')
                  .clipToCollection(ee.FeatureCollection('USDOS/LSIB/2017'));

// --- Digital elevation model (SRTM 90m) ----------------------------------
var dem = ee.Image('CGIAR/SRTM90_V4').select('elevation').clipToCollection(ee.FeatureCollection('USDOS/LSIB/2017'));

// --- Climate (CHIRPS 2021 monthly precipitation, sum to annual) ----------
var chirpsYear = ee.ImageCollection('UCSB-CHG/CHIRPS/MONTHLY')
                   .filterDate('2021-01-01', '2021-12-31')
                   .sum()
                   .clipToCollection(ee.FeatureCollection('USDOS/LSIB/2017'))
                   .rename('precip');

// --- ET0 (ERA5-Land 2021) ------------------------------------------------
// 【修正】ERA5-Land 是 ImageCollection，不能用 ee.Image 直接取
var et0 = ee.ImageCollection('ECMWF/ERA5_LAND/MONTHLY')
            .filterDate('2021-01-01', '2021-12-31')
            .select('potential_evaporation_sum') // 【修正】正确的波段名
            .sum()
            .multiply(1000) // m 转 mm
            .clipToCollection(ee.FeatureCollection('USDOS/LSIB/2017'))
            .rename('et0');

// --- Population (WorldPop 100 m, 2020) ----------------------------------
// 【修正】WorldPop 是 ImageCollection，且路径不同
var pop = ee.ImageCollection('WorldPop/GP/100m/pop')
            .filter(ee.Filter.eq('year', 2020))
            .mosaic()
            .clipToCollection(ee.FeatureCollection('USDOS/LSIB/2017'))
            .rename('population');

// --- Simple biophysical table (hardcoded for demonstration) --------------
var carbonPools = ee.FeatureCollection([
  ee.Feature(null, {lulc_code: 1, above: 150, below: 20, soil: 80, dead: 10}),
  ee.Feature(null, {lulc_code: 2, above: 10, below: 5,  soil: 60, dead:  2}),
  ee.Feature(null, {lulc_code: 3, above:  0, below: 0,  soil: 40, dead:  0}),
]);
var biophysicalTable = ee.FeatureCollection([
  ee.Feature(null, {lulc_code: 1, lulc_veg: 1, kc: 0.6, pa: 0.3}),
  ee.Feature(null, {lulc_code: 2, lulc_veg: 1, kc: 0.9, pa: 0.2}),
  ee.Feature(null, {lulc_code: 3, lulc_veg: 0, kc: 0.2, pa: 0.05}),
]);

// --- AOI: continental US -------------------------------------------------
var aoi = ee.FeatureCollection('USDOS/LSIB/2017')
              .filter(ee.Filter.eq('COUNTRY_NAM', 'United States of America'));

// ---------------------------------------------------------------------------
// 3.  Run selected models
// ---------------------------------------------------------------------------

print('===  A.  CARBON STORAGE  ===');
var carbonOut = invest.models.carbon.run({
  lulc_current: lulc_2021,
  carbon_pools: carbonPools,
  calculate_sequestration: false
});
print('Carbon storage output keys:', Object.keys(carbonOut.outputs));
Map.addLayer(carbonOut.outputs.carbon_storage.clip(aoi),
             {min: 0, max: 300, palette: ['brown','green']},
             'carbon_storage');

print('\n===  B.  ANNUAL WATER YIELD  ===');
var awyOut = invest.models.annualWaterYield.run({
  lulc: lulc_2021,
  precip: chirpsYear,
  et0: et0,
  biophysical_table: biophysicalTable,
  z_parameter: 1.0
});
print('AWY output keys:', Object.keys(awyOut.outputs));
Map.addLayer(awyOut.outputs.water_yield.clip(aoi),
             {min: 0, max: 1000}, 'water_yield_mm');

print('\n===  C.  HABITAT QUALITY  ===');
var habitatSuit = lulc_2021.where(lulc_2021.eq(3), 0) // urban -> 0
                            .where(lulc_2021.eq(2), 0.5)
                            .where(lulc_2021.eq(1), 1)
                            .rename('habitat');
var habitatOut = invest.models.habitatQuality.run({
  habitat: habitatSuit,
  land_cover: lulc_2021,
  threats: lulc_2021.eq(3).multiply(0.5).add(lulc_2021.eq(2).multiply(0.2))
      .rename('threats')
});
Map.addLayer(habitatOut.outputs.habitat_quality.clip(aoi),
             {min: 0, max: 1, palette: ['red','yellow','green']},
             'habitat_quality');

print('\n===  D.  URBAN NATURE ACCESS  ===');
var natureAccess = invest.models.urbanNatureAccess.run({
  landcover: lulc_2021,
  population: pop,
  distance_threshold: 500,
  nature_lulc: {codes: [1]}   // forests only
});
Map.addLayer(natureAccess.outputs.nature_access.clip(aoi),
             {min: 0, max: 1}, 'nature_access');

print('\n===  E.  SEDIMENT DELIVERY RATIO (SDR)  ===');
var sdrOut = invest.models.sdr.run({
  dem: dem,
  lulc: lulc_2021,
  biophysical_table: biophysicalTable
});
Map.addLayer(sdrOut.outputs.sdr.clip(aoi),
             {min: 0, max: 1, palette: ['blue','white','red']},
             'sdr');

print('\n===  F.  RECREATION VALUE  ===');
var parks = ee.FeatureCollection('USDAS/NRSS/TLDBoundary')
                .filter(ee.Filter.eq('USE', 'National Parks'));
// 【修正】reduceToImage 参数写法，改为更稳妥的 paint 方法
var amenity = ee.Image().paint(parks, 1).reproject('EPSG:4326', null, 30).rename('amenity');

var recOut = invest.models.recreation.run({
  amenity_map: amenity,
  population: pop,
  amenity_type: {},
  max_travel_time: 30
});
Map.addLayer(recOut.outputs.recreation_value.clip(aoi),
             {min: 0, max: 10000}, 'recreation_value');

// ---------------------------------------------------------------------------
// 4.  Fit to view
// ---------------------------------------------------------------------------
Map.setCenter(-98.5, 39.8, 5);
print('Done. All runs completed successfully.');
