import jwt from "jsonwebtoken";
import { type NextFunction, type Request, type Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import process from "process";
import { IAuthUser, UserRole } from "../../api/user/user.dto";

// Extend Express Request interface to properly type req.user
declare global {
  namespace Express {
    interface User extends IAuthUser {}
  }
}

/**
 * 1. Authenticates the Bearer JWT token and attaches req.user
 */
export const roleAuth = (publicRoutes: string[] = []) =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (publicRoutes.includes(req.path)) {
        next();
        return;
      }

      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

      if (!token) {
        throw createHttpError(401, { message: "Access token is missing or invalid" });
      }

      // Verify JWT
      let decodedUser: IAuthUser;
      try {
        decodedUser = jwt.verify(token, process.env.JWT_SECRET!) as IAuthUser;
      } catch (err) {
        throw createHttpError(401, { message: "Invalid or expired token" });
      }

      req.user = decodedUser;
      next();
    }
  );

/**
 * 2. RBAC Guard: Restricts endpoint access to specific roles
 * Example usage: requireRole(["admin"])
 */
export const requireRole = (allowedRoles: UserRole[] = []) =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const role = req.user?.role;

      if (allowedRoles.length === 0 || (role && allowedRoles.includes(role))) {
        next();
        return;
      }

      console.warn(`[RBAC] Access denied for role: "${role}"`);
      throw createHttpError(403, { message: "Forbidden: insufficient permissions" });
    }
  );

/**
 * 3. Verification Guard: Blocks unapproved hospitals from operational routes
 * If hospital_admin's hospital_status is false, blocks with 403.
 * Platform admins bypass this check automatically.
 */
export const requireVerifiedHospital = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // If the authenticated user is a hospital_admin, ensure they are verified
    if (req.user?.role === "hospital_admin" && !req.user?.hospital_status) {
      throw createHttpError(403, {
        message: "Action forbidden: Hospital profile is pending admin approval.",
      });
    }
    next();
  }
);



// flowchart LR
//     A[Incoming Request] --> B[1. roleAuth: Who are you?]
//     B -->|Valid JWT| C[2. requireRole: Are you an Admin or Hospital?]
//     C -->|Authorized Role| D[3. requireVerifiedHospital: Is hospital approved?]
//     D -->|Approved| E[Controller Business Logic]
    
//     B -->|No/Expired Token| F[401 Unauthorized]
//     C -->|Wrong Role| G[403 Forbidden]
//     D -->|Status = false| H[403 Forbidden: Pending Approval]
