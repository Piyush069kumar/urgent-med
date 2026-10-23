// 1. Raw query parameters received from the GET request
export interface ISearchEmergencyQuery {
  lat: number;
  long: number;
  resource_ids: number[]; // e.g. [1, 3, 4] parsed from query "1,3,4"
}

// 2. Resource item inside a hospital's inventory match
export interface IMatchedResourceItem {
  resource_id: number;
  resource_name: string;
  quantity: number;
}

// 3. Raw row returned by PostGIS queries
export interface ICandidateHospitalRow {
  hospital_id: string;
  hospital_name: string;
  address: string;
  pincode: string;
  hospital_lat: number;
  hospital_long: number;
  aerial_distance_meters: number;
  matched_resources_count: number;
  matched_resources: IMatchedResourceItem[];
}

// 4. Response structure from OSRM Table API (/table/v1/driving/...)
export interface IOsrmTableResponse {
  code: string;
  durations: number[][]; // durations[0][i] is duration from user to hospital i in seconds
  distances?: number[][]; // distances[0][i] in meters (if supported/requested)
}

// 5. Final hospital result object returned to the user
export interface IDiscoveryHospitalResult {
  hospital_id: string;
  hospital_name: string;
  address: string;
  pincode: string;
  hospital_lat: number;
  hospital_long: number;
  
  // Road travel metrics (from OSRM)
  road_eta_seconds: number;
  road_eta_readable: string; // e.g. "14 mins"
  road_distance_km: number;
  
  // PostGIS aerial metric (fallback / reference)
  aerial_distance_km: number;
  
  // Search metadata
  search_tier: "RING_1" | "RING_2" | "RING_3" | "KNN_FALLBACK";
  
  // Available stock details
  matched_resources_count: number;
  matched_resources: IMatchedResourceItem[];
}
