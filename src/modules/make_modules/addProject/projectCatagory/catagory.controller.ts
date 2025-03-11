import httpStatus from "http-status";
import catchAsync from "../../../../utils/catchAsync";
import sendResponse from "../../../../utils/sendResponse";
import catagoryModel from "./ctegory.model";

const createCategory = catchAsync(async (req, res) => {

    const result = await catagoryModel.create(req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Create a category successfully ',
        data: result
    });
});
const AllCatagory = catchAsync(async (req, res) => {
    const result = await catagoryModel.find()
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All category recived successfully ',
        data: result
    });
});
const updateCatagory = catchAsync(async (req, res) => {
    const { catagoryId } = req.params
    const result = await catagoryModel.findByIdAndUpdate(catagoryId, { catagory: req.body.catagory }, { new: true })
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ' category update successfully ',
        data: result
    });
});

export const catagoryController = {
    AllCatagory,
    createCategory,
    updateCatagory

}