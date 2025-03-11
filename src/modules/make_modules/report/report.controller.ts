import httpStatus from "http-status";
import { tokenDecoded } from "../../../middlewares/decoded";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { reportService } from "./report.servise";

const createReport = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)

    const email = decoded.user.email;
    const repoterId = decoded.user._id;
    const payload = {
        ...req.body,
        repoterId: repoterId
    }
    const result = await reportService.createReportDB(payload, email)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Report send  successfully ! ",
        data: result
    });
})
const getReportAdmin = catchAsync(async (req, res) => {
    const result = await reportService.getReportAdminDB()
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Get all report ! ",
        data: result
    });
})
const singleReport = catchAsync(async (req, res) => {
    const { id } = req.params
    const result = await reportService.singleReportBD(id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Single report  ! ",
        data: result
    });
})

export const reportController = {
    createReport,
    getReportAdmin,
    singleReport
}