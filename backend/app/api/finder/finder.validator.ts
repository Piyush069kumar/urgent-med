import { query } from "express-validator";
import { body } from "express-validator";

export const searchEmergencyValidation = [
  query("lat")
    .notEmpty().withMessage("Latitude (lat) is required")
    .isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90")
    .toFloat(),

  query("long")
    .notEmpty().withMessage("Longitude (long) is required")
    .isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180")
    .toFloat(),

  query("resource_ids")
    .notEmpty().withMessage("resource_ids is required (e.g. ?resource_ids=1,3)")
    .custom((value, { req }) => {
      let ids: number[] = [];
      if (typeof value === "string") {
        ids = value.split(",").map((v) => parseInt(v.trim(), 10));
      } else if (Array.isArray(value)) {
        ids = value.map((v) => parseInt(String(v), 10));
      } else if (typeof value === "number") {
        ids = [value];
      }

      if (ids.length === 0 || ids.some((id) => isNaN(id) || id <= 0)) {
        throw new Error("resource_ids must be comma-separated positive integers (e.g. 1,3,4)");
      }
      
      // Store the parsed array so the controller/service gets clean number[]
      if (req?.query) {
        (req.query as any).parsed_resource_ids = ids;
      }
      return true;
    }),
];
