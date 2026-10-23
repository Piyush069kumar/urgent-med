import { type Request, type Response } from "express";
import asyncHandler from "express-async-handler";
import createError from "http-errors";
import * as adminService from "./admin.service";
import { createResponse } from "../../common/helper/response.hepler";

/**
 * GET /api/admin/hospitals/pending
 * List all hospitals waiting in the verification queue
 */
export const getPendingQueue = asyncHandler(async (req: Request, res: Response) => {
  const pendingHospitals = await adminService.getPendingHospitals();
  res.status(200).send(
    createResponse(
      pendingHospitals,
      "Pending verification queue retrieved successfully",
      pendingHospitals.length
    )
  );
});

/**
 * GET /api/admin/hospitals
 * Directory of all facilities with optional filters (?status=true, ?search=apollo)
 */
export const listHospitals = asyncHandler(async (req: Request, res: Response) => {
  const statusParam = req.query.status;
  const status = statusParam === "true" ? true : statusParam === "false" ? false : undefined;
  const stateId = req.query.state_id ? parseInt(req.query.state_id as string, 10) : undefined;
  const districtId = req.query.district_id ? parseInt(req.query.district_id as string, 10) : undefined;
  const search = req.query.search as string | undefined;

  const hospitals = await adminService.getAllHospitals({
    status,
    state_id: stateId,
    district_id: districtId,
    search,
  });

  res.status(200).send(
    createResponse(hospitals, "Hospitals directory retrieved successfully", hospitals.length)
  );
});

/**
 * PATCH /api/admin/hospitals/:id/verify
 * Approve hospital accreditation and publish to live network
 */
export const approveHospital = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const hospital = await adminService.verifyHospital(id);

  if (!hospital) {
    throw createError(404, "Hospital not found");
  }

  res.status(200).send(
    createResponse(hospital, "Hospital verified and published to live emergency routing")
  );
});

/**
 * PATCH /api/admin/hospitals/:id/reject
 * Reject or deactivate hospital
 */
export const rejectHospital = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const hospital = await adminService.rejectHospital(id);

  if (!hospital) {
    throw createError(404, "Hospital not found");
  }

  res.status(200).send(
    createResponse(hospital, "Hospital registration rejected and deactivated")
  );
});
