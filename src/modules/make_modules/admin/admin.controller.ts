import httpStatus from "http-status";
import sendResponse from "../../../utils/sendResponse";
import catchAsync from "../../../utils/catchAsync";
import { adminService } from "./admin.service";
import { tokenDecoded } from "../../../middlewares/decoded";

const adminDashboard = catchAsync(async (req, res) => {
  const { decoded }: any = await tokenDecoded(req, res)
    const email = decoded.user.email;
    

    const dashboard = await adminService.adminDashBoard(email)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Get dashboard`,
        data: dashboard
    });
});
export const adminController = {
    adminDashboard
}