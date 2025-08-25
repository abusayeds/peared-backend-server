import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import { withDarwService } from "./withdraw.servise";
import sendResponse from "../../../utils/sendResponse";

const allWithWraw = catchAsync(async (req, res) => {
    const allWithdraReq = await withDarwService.allWithWrawDB(req.query)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `All withdraw rerquest  `,
        data: allWithdraReq
    });

})
const payByAdmin = catchAsync(async (req, res) => {
    const { withDrawId } = req.params
    const result = await withDarwService.payByAdminDB(withDrawId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `payment send  ! `,
        data: result
    });

})

export const withDrawController = {
    payByAdmin,
    allWithWraw
}