import express from "express";
import * as adminController from "./admin.controller";
import {
  hospitalIdParamValidation,
  listHospitalsValidation,
} from "./admin.validator";
import { catchError } from "../../common/middleware/cath-error.middleware";
import {
  roleAuth,
  requireRole,
} from "../../common/middleware/role-auth.middleware";

const router = express.Router();

// Strict RBAC: All admin endpoints require a valid token AND 'admin' role
router.use(roleAuth(), requireRole(["admin"]));

// 1. Pending Verification Queue
router.get("/hospitals/pending", adminController.getPendingQueue);

// 2. All Hospitals Directory
router.get(
  "/hospitals",
  listHospitalsValidation,
  catchError,
  adminController.listHospitals
);

// 3. Approve Hospital Accreditation
router.patch(
  "/hospitals/:id/verify",
  hospitalIdParamValidation,
  catchError,
  adminController.approveHospital
);

// 4. Reject / Deactivate Hospital
router.patch(
  "/hospitals/:id/reject",
  hospitalIdParamValidation,
  catchError,
  adminController.rejectHospital
);

export default router;
