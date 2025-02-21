import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { providerFeedbackService } from "./providerFeedback.service";
import { tokenDecoded } from "../../../middlewares/decoded";
import AppError from "../../../errors/AppError";

const createProviderFeedback = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const userId = decoded.user._id;
    const result = await providerFeedbackService.createProviderFeedbackDB(req.body , userId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'FeedBack successfully send !',
        data: result
    });
});


const myReview = catchAsync(async (req , res ) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const providerId = decoded.user._id;
    const rersult = await providerFeedbackService.myReviewDB( req.query,  providerId)
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "provider review list retrieved successfully",
      data: rersult
    });
  });
const topReviews = catchAsync(async (req , res ) => {
   
    const {providerId} = req.params
    const rersult = await providerFeedbackService.topReviewsDB(  providerId)
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Top  reviews list retrieved successfully",
      data: rersult
    });
  });
const Isfavourite = catchAsync(async (req , res ) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const providerId = decoded.user._id;
   
    const result : any = await providerFeedbackService.IsfavouriteDB( req.body, providerId )
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `${result.isFavourite === true ? " Favourite successFully " : "UnFavourite !"}`,
      data: result
    });
  });

export const providerFeedbackController = {
    createProviderFeedback,
    myReview,
    Isfavourite,
    topReviews
}