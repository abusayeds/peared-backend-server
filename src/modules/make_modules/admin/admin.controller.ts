import httpStatus from "http-status";
import sendResponse from "../../../utils/sendResponse";
import catchAsync from "../../../utils/catchAsync";
import { adminService } from "./admin.service";
import { tokenDecoded } from "../../../middlewares/decoded";

const adminDashboard = catchAsync(async (req, res) => {
    const dashboard = await adminService.adminDashBoard()
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Get dashboard`,
        data: dashboard
    });
});
const earnings = catchAsync(async (req, res) => {
    const dashboard = await adminService.earningsDB()
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Get earnings`,
        data: dashboard
    });
});
const adminIncome = catchAsync(async (req, res) => {
    const year = Number(req.params.year)
    const dashboard = await adminService.adminIncomeDB(year)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Get All income `,
        data: dashboard
    });
});
const adminTransaction = catchAsync(async (req, res) => {
    const year = Number(req.params.year)
    const dashboard = await adminService.adminTransactionDB(year)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Get All transaction `,
        data: dashboard
    });
});
export const adminController = {
    adminDashboard,
    adminIncome,
    adminTransaction,
    earnings
}