import jwt from "jsonwebtoken";
import httpStatus from "http-status";

import {
  createTermsInDB,
  getAllTermsFromDB,
  updateTermsInDB,
} from "./Terms.service";
import { findUserById } from "../user/user.service";
import sanitizeHtml from "sanitize-html";
import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import AppError from "../../../errors/AppError";
import { JWT_SECRET_KEY } from "../../../config";
import sendResponse from "../../../utils/sendResponse";


export const createTerms = catchAsync(async (req: Request, res: Response) => {



  const result = await createTermsInDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Terms created successfully.",
    data: result,
  });
});

export const getAllTerms = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllTermsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Terms retrieved successfully.",
    data: result,
  });
});

export const updateTerms = catchAsync(async (req: Request, res: Response) => {
  const { description } = req.body;
  if (!description) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Description is required.",
    );
  }
  const sanitizedDescription = sanitizeHtml(description,);
  const result = await updateTermsInDB(sanitizedDescription);
  if (!result) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update terms.",
    );
  }
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Terms updated successfully.",
    data: result,
  });
});
