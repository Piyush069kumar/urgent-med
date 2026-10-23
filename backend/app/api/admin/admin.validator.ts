import { param, query } from "express-validator";

/**
 * Validates :id UUID parameter for verify and reject actions
 */
export const hospitalIdParamValidation = [
  param("id")
    .notEmpty().withMessage("Hospital ID is required")
    .isUUID().withMessage("Hospital ID must be a valid UUID"),
];

/**
 * Validates query parameters when listing hospitals directory
 */
export const listHospitalsValidation = [
  query("status")
    .optional()
    .isBoolean().withMessage("status must be true or false"),

  query("state_id")
    .optional()
    .isInt({ min: 1 }).withMessage("state_id must be a valid integer"),

  query("district_id")
    .optional()
    .isInt({ min: 1 }).withMessage("district_id must be a valid integer"),

  query("search")
    .optional()
    .trim(),
];
