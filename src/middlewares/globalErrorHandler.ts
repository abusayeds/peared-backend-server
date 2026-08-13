/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { NODE_ENV } from "../config";
import AppError from "../errors/AppError";
import hendelCastError from "../errors/handleCastError";
import handleDuplicateError from "../errors/handleDuplicateError";
import hendleMongooseValidationError from "../errors/handleValidationError";
import hendleZodError from "../errors/handleZodError";
import { TErrorSoureces } from "../interface/error";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Always log server-side so create-project failures are visible in the terminal
  console.error("[API Error]", req.method, req.originalUrl, err?.name || "Error", err?.message);

  let statusCode = 500;
  let message = err.message || "something is wrong";
  let errorSources: TErrorSoureces = [
    {
      path: "",
      message: err.message,
    },
  ];
  if (err instanceof ZodError || err?.name === "ZodError") {
    const simplifliedError = hendleZodError(err);
    statusCode = simplifliedError?.statusCode;
    message = simplifliedError.message;
    errorSources = simplifliedError.errorSoures;
  } else if (err?.name === "ValidationError") {
    const simplifliedError = hendleMongooseValidationError(err);
    statusCode = simplifliedError?.statusCode;
    message = simplifliedError.message;
    errorSources = simplifliedError?.errorSoures;
  } else if (err?.name === "CastError") {
    const simplifliedError = hendelCastError(err);
    statusCode = simplifliedError.statusCode;
    message = simplifliedError.message;
    errorSources = simplifliedError.errorSoures;
  } else if (err?.code === 11000) {
    const simplifliedError = handleDuplicateError(err);
    statusCode = simplifliedError?.statusCode;
    message = simplifliedError?.message;
    errorSources = simplifliedError?.errorSoures;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    errorSources,
    stack: NODE_ENV === "devlopment" ? err?.stack : null,
  });
};
export default globalErrorHandler;
