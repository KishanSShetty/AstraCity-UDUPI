/**
 * Facilities API — Serve Udupi CMC facility GeoJSON data.
 * PRD §8.1: /api/facilities
 */
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const FACILITY_FILES: Record<string, string> = {
  dwcc: 'dwcc_locations.geojson',
  bmu: 'bmu_locations.geojson',
  wpu: 'wpu_locations.geojson',
  dumpyard: 'dumpyard_locations.geojson',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const radiusKm = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : null;
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
  const hsrOnly = searchParams.get('hsr_only') === 'true';

  try {
    // If type specified, return that file; otherwise return all
    const filesToRead = type && FACILITY_FILES[type]
      ? { [type]: FACILITY_FILES[type] }
      : FACILITY_FILES;

    const result: Record<string, unknown> = {};

    for (const [facilityType, filename] of Object.entries(filesToRead)) {
      const filePath = path.join(process.cwd(), 'data', filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      let geojson = JSON.parse(fileContent);

      // Filter by HSR only
      if (hsrOnly) {
        geojson = {
          ...geojson,
          features: geojson.features.filter((f: { properties: { _in_hsr?: boolean } }) => f.properties._in_hsr),
        };
      }

      // Filter by radius from point
      if (radiusKm && lat && lng) {
        geojson = {
          ...geojson,
          features: geojson.features.filter((f: { properties: { _dist_to_hsr_km?: number } }) =>
            (f.properties._dist_to_hsr_km || 0) <= radiusKm
          ),
        };
      }

      result[facilityType] = geojson;
    }

    // If single type requested, return just that GeoJSON
    if (type && result[type]) {
      return NextResponse.json(result[type]);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Facilities API error:', error);
    return NextResponse.json(
      { error: 'Failed to load facility data' },
      { status: 500 }
    );
  }
}
