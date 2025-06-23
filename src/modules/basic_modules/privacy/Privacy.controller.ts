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
import { PrivacyModel } from "./Privacy.model";
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


export const PrivacyHtmlPage = catchAsync(async (req: Request, res: Response) => {
  const [privacy] = await PrivacyModel.find().sort({ createdAt: -1 }).limit(1);

  if (!privacy) {
    return res.status(404).send("<h2>Privacy Policy not found</h2>");
  }
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Privacy Policy</title>
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 0;
      }

      .container {
        background-color: #ffffff;
        width: 50%;
        margin: 40px auto;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      h1, h2 {
        color: #0073e6;
        margin-top: 0;
      }

      ul {
        padding-left: 20px;
      }

      hr {
        margin: 24px 0;
      }

      @media (max-width: 768px) {
        .container {
          width: 90%;
          padding: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Privacy Policy</h1>
      <h2><strong>Last updated:</strong> ${new Date(privacy.updatedAt).toLocaleDateString()}</h2>
      ${privacy?.description} <!-- Ensure this is sanitized if stored as HTML -->
    </div>
  </body>
  </html>
`;



  res.send(htmlContent);
});