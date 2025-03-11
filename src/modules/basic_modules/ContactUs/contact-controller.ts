import httpStatus from "http-status";
import { tokenDecoded } from "../../../middlewares/decoded";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { contactService } from "./contact.service";

const createContact = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const userId = decoded.user._id;
    const contactPayload = {
        ...req.body,
        userId: userId
    }
    const result = await contactService.createContactDB(contactPayload);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Send Meassage successfully",
        data: result,
    });
});
const getContactUserMessage = catchAsync(async (req, res) => {
    const userId = req.params.userId
    const result = await contactService.getContactUserMessageDB(userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Get User Meassage successfully",
        data: result,
    });
});
const getContactMessage = catchAsync(async (req, res) => {
    const result = await contactService.getContactMessageDB();
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Send Meassage successfully",
        data: result,
    });
});

export const contactController = {
    createContact,
    getContactUserMessage,
    getContactMessage
}