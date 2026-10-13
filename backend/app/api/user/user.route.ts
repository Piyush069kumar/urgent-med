import express from "express";
import * as userController from "./user.controller";
import { hospitalRegisterValidation, loginValidation } from "./user.validation";
import { catchError } from "../../common/middleware/cath-error.middleware";
import {
  roleAuth,
  requireRole,
  requireVerifiedHospital,
} from "../../common/middleware/role-auth.middleware";

const router = express.Router();

// ─── 1. Public Routes ──────────────────────────────────────────────────────────

// Register hospital (Validates inputs -> Catches errors -> Controller)
router.post(
  "/register",
  hospitalRegisterValidation,
  catchError,
  userController.registerHospital
);

// Login (Validates inputs -> Catches errors -> Passport authenticate)
router.post(
  "/login",
  loginValidation,
  catchError,
  userController.loginUser
);

// ─── 2. Authenticated Routes (Any valid user/hospital) ────────────────────────

router.get("/me", roleAuth(), userController.getProfile);

// ─── 3. Admin Routes (Restricted to platform superadmins) ─────────────────────

// Verify/Approve a pending hospital
router.patch(
  "/hospitals/:id/verify",
  roleAuth(),
  requireRole(["admin"]),
  userController.verifyHospital
);

export default router;
