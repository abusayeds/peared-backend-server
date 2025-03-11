import httpStatus from "http-status";

import { Request, Response } from "express";
import AppError from "../../../errors/AppError";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { AboutModel } from "./About.model";
import {
  createAboutInDB,
  getAllAboutFromDB,
  updateAboutInDB,
} from "./About.service";


export const createAbout = catchAsync(async (req: Request, res: Response) => {
  const about = AboutModel.find()
  if ((await about).length > 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "about alrade added")
  }
  const result = await createAboutInDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "About created successfully.",
    data: result,
  });
});

export const getAllAbout = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllAboutFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "About retrieved successfully.",
    data: result,
  });
});

export const updateAbout = catchAsync(async (req: Request, res: Response) => {
  const { description } = req.body; if (!description) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Description is required.",
    );
  }
  const result = await updateAboutInDB(description);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "About updated successfully.",
    data: result,
  });
});
