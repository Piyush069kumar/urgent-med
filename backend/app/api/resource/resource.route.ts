import express from "express";
import * as resourceController from "./resource.controller";
import {
  upsertResourceValidation,
  hospitalIdParamValidation,
} from "./resource.validation";
import { catchError } from "../../common/middleware/cath-error.middleware";
import {
  roleAuth,
  requireRole,
  requireVerifiedHospital,
} from "../../common/middleware/role-auth.middleware";

const router = express.Router();

// ─── 1. Public Routes ──────────────────────────────────────────────────────────

// Public master catalogue (for dropdowns / common users)
router.get("/catalogue", resourceController.getCatalogue);

// Public inventory lookup for a specific hospital (For Common Users)
router.get(
  "/hospital/:hospitalId",
  hospitalIdParamValidation,
  catchError,
  resourceController.getHospitalResources
);

// ─── 2. Protected Hospital Dashboard Routes ──────────────────────────────────
// Risk 2 Guard: Blocks unapproved/pending hospitals from modifying inventory

// Hospital Admin views their own stock
router.get(
  "/my",
  roleAuth(),
  requireRole(["hospital_admin"]),
  requireVerifiedHospital,
  resourceController.getMyInventory
);

// Hospital Admin adds or updates stock (Beds, Oxygen, ICU, etc.)
router.post(
  "/my/update",
  roleAuth(),
  requireRole(["hospital_admin"]),
  requireVerifiedHospital,
  upsertResourceValidation,
  catchError,
  resourceController.updateMyResource
);

export default router;
