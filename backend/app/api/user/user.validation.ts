import { body } from "express-validator";

// Your email regex pattern
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const hospitalRegisterValidation = [
  // 1. Credentials
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .matches(emailRegex).withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

  // 2. Hospital Details
  body("hospital_name")
    .trim()
    .notEmpty().withMessage("Hospital name is required"),

  body("licence_number")
    .trim()
    .notEmpty().withMessage("Licence number is required"),

  body("address")
    .trim()
    .notEmpty().withMessage("Address is required"),

  body("state_id")
    .isInt({ min: 1 }).withMessage("Valid state ID is required"),

  body("district_id")
    .isInt({ min: 1 }).withMessage("Valid district ID is required"),

  body("pincode")
    .trim()
    .notEmpty().withMessage("Pincode is required"),

  // 3. Geographic Coordinates (Must be valid lat/long numbers)
  body("hospital_lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("hospital_lat must be a valid latitude between -90 and 90"),

  body("hospital_long")
    .isFloat({ min: -180, max: 180 })
    .withMessage("hospital_long must be a valid longitude between -180 and 180"),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .matches(emailRegex).withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];
