import { type ErrorRequestHandler } from "express";
import { type ErrorResponse } from "../helper/response.hepler";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("[ERROR]", err);
  const response: ErrorResponse = {
    success: false,
    error_code: (err?.status ?? (err?.name === "MulterError" ? 400 : 500)) as number,
    message: (err?.message ?? "Something went wrong!") as string,
    data: {
        ...(err?.data ?? {}),
        field: (err as any).field
    },
  };

  res.status(response.error_code).send(response);
};

export default errorHandler;
