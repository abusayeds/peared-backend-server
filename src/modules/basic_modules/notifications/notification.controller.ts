import httpStatus from "http-status";
import queryBuilder from "../../../builder/queryBuilder";
import { tokenDecoded } from "../../../middlewares/decoded";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { NotificationModel } from "./notification.model";
import { notificationService } from "./notification.service";


export const getMyNotification = catchAsync(async (req, res) => {
  const { decoded }: any = await tokenDecoded(req, res)
  const userId = decoded.user._id;
  const result = await notificationService.getMyNotification(userId, req.query)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Get all notifications successfully.",
    data: result
  });
  await NotificationModel.updateMany(
    { status: "admin", seen: false },
    { $set: { seen: true } }
  );
});



