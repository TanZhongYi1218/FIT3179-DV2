// scripts/make_centroids.js
const fs = require('fs');
const topojson = require('topojson-client');
const turf = require('@turf/turf');

// 1) Read TopoJSON
const topo = JSON.parse(fs.readFileSync('data/malaysia_map_file.topojson', 'utf8'));

// 2) Convert the correct object to GeoJSON FeatureCollection
//    Use the EXACT object key from your file. In your screenshot it looked like:
const obj = topo.objects["malaysia map geoJSon file"]; // <-- keep exact casing/spaces
if (!obj) {
  throw new Error('Could not find TopoJSON object "malaysia map geoJSon file". Check your object name.');
}
const fc = topojson.feature(topo, obj); // GeoJSON FeatureCollection

// 3) Build CSV rows
const rows = ["State,lon,lat"];
for (const f of fc.features) {
  // pick the correct name field:
  const name = (f.properties && (f.properties.name || f.properties.NAME_1)) || f.name;
  if (!name) continue;

  // Use pointOnFeature so the point is inside the polygon
  const pt = turf.pointOnFeature(f);
  const [lon, lat] = pt.geometry.coordinates;

  rows.push(`${name},${lon},${lat}`);
}

// 4) Write CSV
fs.writeFileSync('data/state_centroids.csv', rows.join('\n'));
console.log('Wrote data/state_centroids.csv with', rows.length - 1, 'rows');
