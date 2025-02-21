import jwt from "jsonwebtoken";
import httpStatus from "http-status";


import { findUserById } from "../user/user.service";


import sanitizeHtml from "sanitize-html";

import { Request, Response } from "express";
import {
  createAboutInDB,
  getAllAboutFromDB,
  updateAboutInDB,
} from "./About.service";
import catchAsync from "../../../utils/catchAsync";
import AppError from "../../../errors/AppError";
import { JWT_SECRET_KEY } from "../../../config";
import sendResponse from "../../../utils/sendResponse";



const sanitizeOptions = {
  allowedTags: [
    "b",
    "i",
    "em",
    "strong",
    "a",
    "p",
    "br",
    "ul",
    "ol",
    "li",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "code",
    "pre",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "target"],
    img: ["src", "alt"],
  },
  allowedIframeHostnames: ["www.youtube.com"],
};

export const createAbout = catchAsync(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'No token provided or invalid format.');
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET_KEY as string) as { id: string };
  const userId = decoded.id;

  // Find the user by userId
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found.');
  }

  // Check if the user is an admin
  if (user.role !== "admin") {
    throw new AppError(httpStatus.FORBIDDEN, 'Only admins can create terms.');
  }

  const { description } = req.body;
  const sanitizedContent = sanitizeHtml(description, sanitizeOptions);
  if (!description) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Description is required!');
  }

  const result = await createAboutInDB({ sanitizedContent });

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
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'No token provided or invalid format.');

  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET_KEY as string) as { id: string };

  const userId = decoded.id;

  // Find the user by userId
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found.');
  }
  // Check if the user is an admin
  if (user.role !== "admin") {
    throw new AppError(httpStatus.FORBIDDEN, 'Only admins can update terms.');
  }

  // Sanitize the description field
  const { description } = req.body;

  if (!description) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Description is required..');
   
  }

  const sanitizedDescription = sanitizeHtml(description, sanitizeOptions);

  // Assume you're updating the terms based on the sanitized description
  const result = await updateAboutInDB(sanitizedDescription);

  if (!result) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update terms.');
   
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "About updated successfully.",
    data: result,
  });
});
