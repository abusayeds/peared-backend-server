/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { TErrorSoureces } from "../interface/error";
import hendleZodError from "../errors/handleZodError";
import hendleMongooseValidationError from "../errors/handleValidationError";
import hendelCastError from "../errors/handleCastError";
import handleDuplicateError from "../errors/handleDuplicateError";
import AppError from "../errors/AppError";
import { NODE_ENV } from "../config";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = err.message || "something is wrong";
  let errorSources: TErrorSoureces = [
    {
      path: "",
      message: err.message,
    },
  ];
  if (err instanceof ZodError) {
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
