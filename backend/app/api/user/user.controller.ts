import { type Request, type Response, type NextFunction } from "express";
import asyncHandler from "express-async-handler";
import passport from "passport";
import createError from "http-errors";
import * as userService from "./user.service";
import { createUserTokens } from "../../common/services/passport-jwt.service";
import { createResponse } from "../../common/helper/response.hepler";
import { IAuthUser } from "./user.dto";

/**
 * 1. Register a new hospital
 * Public endpoint: POST /api/users/register
 */
export const registerHospital = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.createHospitalUser(req.body);

  res.status(201).send(
    createResponse(result.hospital, result.message)
  );
});

/**
 * 2. Authenticate user & issue JWT
 * Public endpoint: POST /api/users/login
 */
export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "login",
    { session: false },
    (err: Error | null, user: IAuthUser | false, info: { message?: string } | undefined) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(createError(401, info?.message || "Authentication failed"));
      }

      // Generate JWT containing user identity & hospital status
      const tokens = createUserTokens(user);

      res.status(200).send(
        createResponse(
          {
            user,
            accessToken: tokens.accessToken,
          },
          "Login successful"
        )
      );
    }
  )(req, res, next);
});

/**
 * 3. Get current authenticated user profile
 * Protected endpoint: GET /api/users/me
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError(401, "User not authenticated");
  }

  res.status(200).send(
    createResponse(req.user, "User profile retrieved successfully")
  );
});

/**
 * 4. Admin verifies/approves a pending hospital
 * Admin-only endpoint: PATCH /api/users/hospitals/:id/verify
 */
export const verifyHospital = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw createError(400, "Hospital ID is required");
  }

  const updatedHospital = await userService.verifyHospital(id);
  if (!updatedHospital) {
    throw createError(404, "Hospital not found");
  }

  res.status(200).send(
    createResponse(updatedHospital, "Hospital approved successfully")
  );
});
