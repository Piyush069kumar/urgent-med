import { Request, Response, NextFunction } from "express";

export const parseAddressFields = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (typeof req.body.permanentAddress === "string") {
      req.body.permanentAddress = JSON.parse(req.body.permanentAddress);
    }
    if (typeof req.body.correspondenceAddress === "string") {
      req.body.correspondenceAddress = JSON.parse(
        req.body.correspondenceAddress
      );
    }
    if (typeof req.body.address === "string") {
      req.body.address = JSON.parse(req.body.address);
    }
  } catch (err) {
    res.status(400).json({ message: "Invalid JSON in address fields" });
    return;
  }
  next();
};
