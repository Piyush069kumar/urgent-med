import { type Request, type Response } from "express";
import asyncHandler from "express-async-handler";
import { createResponse } from "../../common/helper/response.hepler";
import * as finder from "./finder.service"

/**
 * Public Emergency Search Endpoint
 * GET /api/finder/emergency?lat=28.36&long=77.31&resource_ids=1,3
 */
export const searchEmergency = asyncHandler(async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const long = parseFloat(req.query.long as string);
  const resourceIds = (req.query.parsed_resource_ids as unknown as number[]) || [];

  const result = await finder.searchNearestHospitals(lat, long, resourceIds);

  res.status(200).send( 
    createResponse(
      result,
      result.search_tier === "KNN_FALLBACK"
        ? "No facilities within 45 km. Showing nearest available facilities via statewide search."
        : "Nearest emergency facilities retrieved successfully",
      result.total_found
    )
  );
});
