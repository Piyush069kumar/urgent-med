import express from "express";
import * as finderController from "./finder.controller";
import { searchEmergencyValidation } from "./finder.validator";
import { catchError } from "../../common/middleware/cath-error.middleware";

const router = express.Router();

/**
 * Public Route: Fast emergency discovery for patients, public, & ambulance drivers
 * No authentication required!
 */
router.get(
  "/emergency",
  searchEmergencyValidation,
  catchError,
  finderController.searchEmergency
);

export default router;
