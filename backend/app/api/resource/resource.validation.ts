import { body, param } from "express-validator";

/**
 * Validates payload for adding or updating hospital resource inventory
 * Risk 1 Mitigation: Quantity cannot be negative
 */
export const upsertResourceValidation = [
  body("resource_id")
    .notEmpty().withMessage("resource_id is required")
    .isInt({ min: 1 }).withMessage("resource_id must be a valid positive integer"),

  body("quantity")
    .notEmpty().withMessage("quantity is required")
    .isInt({ min: 0 }).withMessage("quantity must be an integer greater than or equal to 0"),

  body("is_available")
    .optional()
    .isBoolean().withMessage("is_available must be a boolean (true or false)"),
];

/**
 * Validates hospitalId param for public inventory lookups
 */
export const hospitalIdParamValidation = [
  param("hospitalId")
    .notEmpty().withMessage("hospitalId is required")
    .isUUID().withMessage("hospitalId must be a valid UUID"),
];
