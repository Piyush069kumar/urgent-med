import axios from "axios";
import { pool } from "../../common/services/sql.service";
import {
  ICandidateHospitalRow,
  IDiscoveryHospitalResult,
  IOsrmTableResponse,
} from "./finder.dto";

interface IRingBand {
  minMeters: number;
  maxMeters: number;
  tier: "RING_1" | "RING_2" | "RING_3";
}

const RINGS: IRingBand[] = [
  { minMeters: 0, maxMeters: 15000, tier: "RING_1" },
  { minMeters: 15000, maxMeters: 30000, tier: "RING_2" },
  { minMeters: 30000, maxMeters: 45000, tier: "RING_3" },
];

/**
 * 1. Query hospitals within a specific distance band [min_meters, max_meters]
 */
const queryRingBand = async (
  lat: number,
  long: number,
  resourceIds: number[],
  minMeters: number,
  maxMeters: number
): Promise<ICandidateHospitalRow[]> => {
  const query = `
    SELECT 
      h.id AS hospital_id,
      h.hospital_name,
      h.address,
      h.pincode,
      h.hospital_lat,
      h.hospital_long,
      ROUND(ST_Distance(h.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)) AS aerial_distance_meters,
      COUNT(DISTINCT hr.resource_id) AS matched_resources_count,
      json_agg(
        json_build_object(
          'resource_id', r.id,
          'resource_name', r.name,
          'quantity', hr.quantity
        )
      ) AS matched_resources
    FROM hospital h
    JOIN hospital_resource hr ON hr.hospital_id = h.id
    JOIN resource r ON r.id = hr.resource_id
    WHERE h.status = TRUE 
      AND h.is_active = TRUE
      AND hr.resource_id = ANY($3::int[])
      AND hr.is_available = TRUE 
      AND hr.quantity > 0
      AND ST_DWithin(h.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $5)
      AND ST_Distance(h.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) > $4
    GROUP BY h.id, h.hospital_name, h.address, h.pincode, h.hospital_lat, h.hospital_long, h.location
    ORDER BY matched_resources_count DESC, aerial_distance_meters ASC
    LIMIT 10;
  `;

  const values = [long, lat, resourceIds, minMeters, maxMeters];
  const { rows } = await pool.query(query, values);
  return rows;
};

/**
 * 2. KNN Safety Net: Finds the closest hospital with stock anywhere in DB
 */
const queryKnnFallback = async (
  lat: number,
  long: number,
  resourceIds: number[]
): Promise<ICandidateHospitalRow[]> => {
  const query = `
    SELECT 
      h.id AS hospital_id,
      h.hospital_name,
      h.address,
      h.pincode,
      h.hospital_lat,
      h.hospital_long,
      ROUND(ST_Distance(h.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)) AS aerial_distance_meters,
      COUNT(DISTINCT hr.resource_id) AS matched_resources_count,
      json_agg(
        json_build_object(
          'resource_id', r.id,
          'resource_name', r.name,
          'quantity', hr.quantity
        )
      ) AS matched_resources
    FROM hospital h
    JOIN hospital_resource hr ON hr.hospital_id = h.id
    JOIN resource r ON r.id = hr.resource_id
    WHERE h.status = TRUE 
      AND h.is_active = TRUE
      AND hr.resource_id = ANY($3::int[])
      AND hr.is_available = TRUE 
      AND hr.quantity > 0
    GROUP BY h.id, h.hospital_name, h.address, h.pincode, h.hospital_lat, h.hospital_long, h.location
    ORDER BY h.location <-> ST_SetSRID(ST_MakePoint($1, $2), 4326) ASC
    LIMIT 5;
  `;

  const values = [long, lat, resourceIds];
  const { rows } = await pool.query(query, values);
  return rows;
};

/**
 * 3. OSRM Table Service: Computes road driving durations and distances in 1 HTTP call
 */
const enrichWithRoadRouting = async (
  userLat: number,
  userLong: number,
  hospitals: ICandidateHospitalRow[],
  searchTier: "RING_1" | "RING_2" | "RING_3" | "KNN_FALLBACK"
): Promise<IDiscoveryHospitalResult[]> => {
  // Format coordinate string: user_long,user_lat;hosp1_long,hosp1_lat;hosp2_long,hosp2_lat...
  const hospitalCoords = hospitals
    .map((h) => `${h.hospital_long},${h.hospital_lat}`)
    .join(";");
  const fullCoordString = `${userLong},${userLat};${hospitalCoords}`;

  const osrmUrl = `http://router.project-osrm.org/table/v1/driving/${fullCoordString}?sources=0&annotations=duration,distance`;

  try {
    const response = await axios.get<IOsrmTableResponse>(osrmUrl, { timeout: 3000 });

    if (response.data.code === "Ok" && response.data.durations && response.data.durations[0]) {
      const durations = response.data.durations[0]; // duration from source 0 to each coord
      const distances = response.data.distances?.[0]; // distances in meters

      return hospitals.map((h, index) => {
        // Index + 1 because index 0 is the user themselves
        const roadSeconds = Math.round(durations[index + 1] ?? 0);
        const roadDistanceMeters = Math.round(distances?.[index + 1] ?? h.aerial_distance_meters * 1.3);
        const roadKm = parseFloat((roadDistanceMeters / 1000).toFixed(1));
        const mins = Math.ceil(roadSeconds / 60);

        return {
          hospital_id: h.hospital_id,
          hospital_name: h.hospital_name,
          address: h.address,
          pincode: h.pincode,
          hospital_lat: h.hospital_lat,
          hospital_long: h.hospital_long,
          road_eta_seconds: roadSeconds,
          road_eta_readable: mins < 60 ? `${mins} mins` : `${Math.floor(mins / 60)}h ${mins % 60}m`,
          road_distance_km: roadKm,
          aerial_distance_km: parseFloat((h.aerial_distance_meters / 1000).toFixed(1)),
          search_tier: searchTier,
          matched_resources_count: Number(h.matched_resources_count),
          matched_resources: h.matched_resources,
        };
      });
    }
  } catch (err: any) {
    console.warn("[OSRM] Fallback to aerial estimation due to:", err.message);
  }

  // Graceful Fallback if OSRM is unreachable: Estimate road time using ~40km/h average ambulance speed
  return hospitals.map((h) => {
    const estDistanceKm = parseFloat(((h.aerial_distance_meters * 1.35) / 1000).toFixed(1));
    const estSeconds = Math.round((estDistanceKm / 40) * 3600);
    const mins = Math.ceil(estSeconds / 60);

    return {
      hospital_id: h.hospital_id,
      hospital_name: h.hospital_name,
      address: h.address,
      pincode: h.pincode,
      hospital_lat: h.hospital_lat,
      hospital_long: h.hospital_long,
      road_eta_seconds: estSeconds,
      road_eta_readable: `~${mins} mins (est.)`,
      road_distance_km: estDistanceKm,
      aerial_distance_km: parseFloat((h.aerial_distance_meters / 1000).toFixed(1)),
      search_tier: searchTier,
      matched_resources_count: Number(h.matched_resources_count),
      matched_resources: h.matched_resources,
    };
  });
};

/**
 * Master Discovery Orchestrator
 */
export const searchNearestHospitals = async (
  lat: number,
  long: number,
  resourceIds: number[]
) => {
  let candidates: ICandidateHospitalRow[] = [];
  let resolvedTier: "RING_1" | "RING_2" | "RING_3" | "KNN_FALLBACK" = "RING_1";

  // 1. Try progressive distance bands (0-15km, 15-30km, 30-45km)
  for (const ring of RINGS) {
    candidates = await queryRingBand(lat, long, resourceIds, ring.minMeters, ring.maxMeters);
    if (candidates.length > 0) {
      resolvedTier = ring.tier;
      break;
    }
  }

  // 2. If nothing found within 45 km, trigger the KNN Safety Net
  if (candidates.length === 0) {
    candidates = await queryKnnFallback(lat, long, resourceIds);
    resolvedTier = "KNN_FALLBACK";
  }

  // If literally no hospital in the entire database has the resource
  if (candidates.length === 0) {
    return {
      search_tier: resolvedTier,
      hospitals: [],
      message: "No hospital in the system currently has this resource in stock.",
    };
  }

  // 3. Compute road routes with OSRM
  const enriched = await enrichWithRoadRouting(lat, long, candidates, resolvedTier);

  // 4. Sort primarily by quickest Road ETA, secondary by resource match completeness
  enriched.sort((a, b) => a.road_eta_seconds - b.road_eta_seconds);

  return {
    search_tier: resolvedTier,
    total_found: enriched.length,
    hospitals: enriched,
  };
};
