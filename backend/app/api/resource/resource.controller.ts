import { type Request, type Response } from "express";
import asyncHandler from "express-async-handler";
import createError from "http-errors";
import * as resourceService from "./resource.service";
import { createResponse } from "../../common/helper/response.hepler";

/**
 * Public: Get master list of all resources & categories
 * GET /api/resources/catalogue
 */
export const getCatalogue = asyncHandler(async (req: Request, res: Response) => {
  const catalogue = await resourceService.getMasterCatalogue();
  res.status(200).send(
    createResponse(catalogue, "Master resource catalogue retrieved successfully", catalogue.length)
  );
});

/**
 * Public: Get live inventory of any hospital by ID (For Common Users)
 * GET /api/resources/hospital/:hospitalId
 */
export const getHospitalResources = asyncHandler(async (req: Request, res: Response) => {
  const { hospitalId } = req.params;
  const inventory = await resourceService.getHospitalInventory(hospitalId);
  res.status(200).send(
    createResponse(inventory, "Hospital inventory retrieved successfully", inventory.length)
  );
});

/**
 * Protected: Hospital Admin gets their own inventory
 * GET /api/resources/my
 */
export const getMyInventory = asyncHandler(async (req: Request, res: Response) => {
  const hospitalId = req.user?.hospital_id;
  if (!hospitalId) {
    throw createError(400, "User is not linked to any hospital profile");
  }

  const inventory = await resourceService.getHospitalInventory(hospitalId);
  res.status(200).send(
    createResponse(inventory, "My hospital inventory retrieved successfully", inventory.length)
  );
});

/**
 * Protected: Hospital Admin adds or updates a resource
 * POST /api/resources/my/update
 */
export const updateMyResource = asyncHandler(async (req: Request, res: Response) => {
  const hospitalId = req.user?.hospital_id;
  if (!hospitalId) {
    throw createError(400, "User is not linked to any hospital profile");
  }

  const updatedItem = await resourceService.upsertHospitalResource(hospitalId, req.body);
  res.status(200).send(
    createResponse(updatedItem, "Hospital resource updated successfully")
  );
});
