import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { messageservice } from "./messages.service";


const getConversation = catchAsync(async (req, res) => {
    const {conversationId} = req.params
    const result = await messageservice.getConversationDB(conversationId , req.query)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: " Retrieved all message successfully",
        data: result,
    });
})   
export const messageController = {
    getConversation
}