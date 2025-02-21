import { role } from './../../../utils/role';
import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { UserModel } from "../../basic_modules/user/user.model";
import { providerFeedbackModel, TProviderFeedback } from "./providerModel";
import queryBuilder from '../../../builder/queryBuilder';

const createProviderFeedbackDB = async (payload: TProviderFeedback, userId: string) => {
    const provider = await UserModel.findById(payload.providerId)
    if (!provider) {
        throw new AppError(httpStatus.NOT_FOUND, "Provider not found !")
    }
    if (provider.role !== "provider") {
        throw new AppError(httpStatus.NOT_FOUND, "Only the provider can give feedback.")
    }
    const result = await providerFeedbackModel.create({
        ...payload, userId: userId
    })
    return result

}
const myReviewDB = async (query: Record<string, unknown>, providerId: string) => {
    const provider = await UserModel.findById(providerId)
    if (!provider) {
        throw new AppError(httpStatus.NOT_FOUND,
            "Provider not found.",
        );
    }
    const userQuery = new queryBuilder(providerFeedbackModel.find({ providerId: providerId }).populate({
        path: "userId",
        select: "name image          ",
    }), query).sort()
    const { totalData } = await userQuery.paginate(providerFeedbackModel.find({ providerId: providerId }))
    const data = await userQuery.modelQuery.exec()
    const currentPage = Number(query?.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = userQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, data, };
}
const topReviewsDB = async ( providerId: string) => {
    const provider = await UserModel.findById(providerId)
    if (!provider) {
        throw new AppError(httpStatus.NOT_FOUND,
            "Provider not found.",
        );
    }
    const reviews = await providerFeedbackModel.find({
        isFavourite : true,
        providerId : provider
    }).populate({
        path: "userId",
        select: "image",
    })
   
 return reviews
  
}
const IsfavouriteDB = async (payload: any, providerId: string) => {
    console.log(payload);
    
    const provider = await UserModel.findById(providerId)
    if (!provider) {
        throw new AppError(httpStatus.NOT_FOUND,
            "Provider not found.",
        );
    }
    if (!payload.reviewId || payload.isFavourite === undefined) {
        throw new AppError(400, 'reviewId & isFavourite are required!');
    }
    const feedback = await providerFeedbackModel.findById(payload.reviewId)
    if (!feedback) {
        throw new AppError(httpStatus.NOT_FOUND,
            "feedback not found.",
        );
    }
    if (payload.isFavourite === true) {
        const favouriteLimit = await providerFeedbackModel.find({
            providerId: providerId,
            isFavourite: true
        })
        if (favouriteLimit.length > 3) {
            throw new AppError(httpStatus.NOT_FOUND,
                "You cannot have more than three favorites.",
            );
        }
    }
    const review = await providerFeedbackModel.findByIdAndUpdate(
        payload.reviewId,
        { isFavourite: payload.isFavourite },
        { new: true }
    );

    return review

}
export const providerFeedbackService = {
    createProviderFeedbackDB,
    myReviewDB,
    IsfavouriteDB,
    topReviewsDB
} 