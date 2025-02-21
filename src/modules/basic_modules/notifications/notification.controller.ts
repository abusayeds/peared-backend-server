import httpStatus from "http-status";

import jwt from "jsonwebtoken";

import { Request, Response } from "express";

import { findUserById } from "../user/user.service";
import { NotificationModel } from "./notification.model";
import catchAsync from "../../../utils/catchAsync";
import AppError from "../../../errors/AppError";
import sendResponse from "../../../utils/sendResponse";


export const getMyNotification = catchAsync(
  async (req: Request, res: Response) => {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(httpStatus.UNAUTHORIZED,
        "No token provided or invalid format.",
      );
    }

    const token = authHeader.split(" ")[1]; // Get the token part from 'Bearer <token>'

    try {
      // Decode the token to get the user ID
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY as string,
      ) as { id: string };
      const userId = decoded.id;

      // Find the user by userId
      const user = await findUserById(userId);
      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND,
          "User not found.",
        );
      }

      // Pagination logic
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const skip = (page - 1) * limit;

      let notifications;
      let totalNotifications;

      if (user.role === "admin") {
        // For admin, fetch all admin messages
        notifications = await NotificationModel.find({
          adminMsg: { $exists: true },
        })
          .select("adminMsg createdAt updatedAt")
          .sort({ createdAt: -1 }) // Sort by createdAt in descending order
          .skip(skip)
          .limit(limit);

        totalNotifications = await NotificationModel.countDocuments({
          adminMsg: { $exists: true },
        });
      } else {
        // For regular users, fetch their specific notifications
        notifications = await NotificationModel.find({ userId: userId })
          .select("userId userMsg createdAt updatedAt")
          .sort({ createdAt: -1 }) // Sort by createdAt in descending order
          .skip(skip)
          .limit(limit);

        totalNotifications = await NotificationModel.countDocuments({
          userId: userId,
        });
      }

      // Calculate total pages
      const totalPages = Math.ceil(totalNotifications / limit);

      // Format the notifications
      const formattedNotifications = notifications.map((notification) => ({
        _id: notification._id,
        msg:
          user.role === "admin" ? notification.adminMsg : notification.userMsg,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      }));

      // Check if notifications is empty
      if (formattedNotifications.length === 0) {
        return sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "You have no notifications.",
          data: {
            notifications: [],
            currentPage: page,
            totalPages,
            totalNotifications,
            limit,
          },
        });
      }

      // Pagination logic for prevPage and nextPage
      const prevPage = page > 1 ? page - 1 : null;
      const nextPage = page < totalPages ? page + 1 : null;

      // Send response with pagination details
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Here is your notifications.",
        data: {
          notifications: formattedNotifications,
          pagination: {
            totalPages,
            currentPage: page,
            prevPage: prevPage ?? 1,
            nextPage: nextPage ?? 1,
            limit,
            totalNotifications,
          },
        },
      });
    } catch (error) {
      throw new AppError(httpStatus.UNAUTHORIZED, 
        "Invalid token or token expired.",
      );
    }
  },
);
