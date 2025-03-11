import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import {
  createPrivacyInDB,
  getAllPrivacyFromDB,
  updatePrivacyInDB,
} from "./Privacy.service";
import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import AppError from "../../../errors/AppError";
import sendResponse from "../../../utils/sendResponse";
export const createPrivacy = catchAsync(async (req: Request, res: Response) => {
  const result = await createPrivacyInDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Privacy created successfully.",
    data: result,
  });
});

export const getAllPrivacy = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllPrivacyFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Privacy retrieved successfully.",
    data: result,
  });
});
export const updatePrivacy = catchAsync(async (req: Request, res: Response) => {
  const { description } = req.body;
  if (!description) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Description is required.",
    );
  }
  const result = await updatePrivacyInDB(description);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Privacy updated successfully.",
    data: result,
  });
});
