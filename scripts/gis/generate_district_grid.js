const fs = require('fs');
const turf = require('@turf/turf');

// 1. Read District Boundary
const boundaryRaw = fs.readFileSync('public/data/udupi_district_boundary.geojson', 'utf-8');
const boundary = JSON.parse(boundaryRaw);
const polygon = boundary.features[0];

// 2. Calculate bounding box
const bbox = turf.bbox(polygon);

// 3. Generate a 2km square grid over the bounding box
const cellSide = 2; // km
const options = { units: 'kilometers', mask: polygon };
const grid = turf.squareGrid(bbox, cellSide, options);

// 4. Assign dynamic properties to each grid cell
const features = [];
let col = 0;
let row = 0;
let lastX = null;

// Sort cells for logical naming
const sortedCells = grid.features.sort((a, b) => {
    const cyA = a.geometry.coordinates[0][0][1];
    const cyB = b.geometry.coordinates[0][0][1];
    if (Math.abs(cyA - cyB) > 0.01) return cyB - cyA; // North to South
    return a.geometry.coordinates[0][0][0] - b.geometry.coordinates[0][0][0]; // West to East
});

for (const cell of sortedCells) {
    const center = turf.center(cell);
    const x = Math.round(center.geometry.coordinates[0] * 100);
    
    if (lastX === null || Math.abs(x - lastX) > 1) {
        col++;
        row = 1;
        lastX = x;
    } else {
        row++;
    }

    const letter = String.fromCharCode(65 + (col % 26));
    const prefix = col >= 26 ? String.fromCharCode(64 + Math.floor(col/26)) : '';
    const zoneId = `${prefix}${letter}${row}`;

    // Simulate waste generation (higher near Udupi city center: 13.34, 74.74)
    const distToCity = turf.distance(center, turf.point([74.7421, 13.3409]));
    
    let wasteKg = 0;
    if (distToCity < 5) wasteKg = 800 + Math.random() * 400; // City core
    else if (distToCity < 15) wasteKg = 300 + Math.random() * 300; // Suburbs
    else wasteKg = 50 + Math.random() * 150; // Rural/Forest

    cell.properties = {
        zone_id: zoneId,
        waste_kg_day: Math.round(wasteKg),
        risk: wasteKg > 800 ? 'high' : wasteKg > 300 ? 'medium' : 'low'
    };
    
    features.push(cell);
}

const finalGeojson = { type: 'FeatureCollection', features };
fs.writeFileSync('public/data/ward_grid_zones.geojson', JSON.stringify(finalGeojson));
console.log(`Successfully generated ${features.length} grid cells covering the entire Udupi district!`);
