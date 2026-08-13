import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { catalogService } from "./catalog.service";

const searchServices = catchAsync(async (req, res) => {
  const data = await catalogService.searchServicesDB(
    String(req.query.q || ""),
    Number(req.query.limit) || 40
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Services retrieved",
    data,
  });
});

const findOrCreateService = catchAsync(async (req, res) => {
  const name = req.body?.name || req.body?.catagory || req.body?.service;
  const data = await catalogService.findOrCreateServiceDB(name);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service ready",
    data,
  });
});

const searchEducations = catchAsync(async (req, res) => {
  const data = await catalogService.searchEducationsDB(
    String(req.query.q || ""),
    Number(req.query.limit) || 40
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Educations retrieved",
    data,
  });
});

const findOrCreateEducation = catchAsync(async (req, res) => {
  const data = await catalogService.findOrCreateEducationDB(req.body?.name);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Education ready",
    data,
  });
});

export const catalogController = {
  searchServices,
  findOrCreateService,
  searchEducations,
  findOrCreateEducation,
};
