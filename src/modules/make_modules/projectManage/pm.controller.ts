import httpStatus from "http-status";
import { tokenDecoded } from "../../../middlewares/decoded";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { pmService } from "./pm.service";

const actor = async (req: any, res: any) => {
  const { decoded }: any = await tokenDecoded(req, res);
  return decoded.user;
};

const listProjects = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  if (req.query.eligible) {
    const result = await pmService.listEligible(user);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "In-progress projects retrieved",
      data: result,
    });
    return;
  }
  const result = await pmService.listProjects(user, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Projects retrieved",
    pagination: result.pagination as any,
    data: { stats: result.stats, projects: result.projects },
  });
});

const listEligible = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.listEligible(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "In-progress projects retrieved",
    data: result,
  });
});

const createProject = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.createProject(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project created",
    data: result,
  });
});

const getProject = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.getProject(user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project details",
    data: result,
  });
});

const updateProject = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.updateProject(user, req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project updated",
    data: result,
  });
});

const deleteProject = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.deleteProject(user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project deleted",
    data: result,
  });
});

const listStages = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.listStages(
    user,
    String(req.query.type || "")
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stages retrieved",
    data: result,
  });
});

const createStage = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.createStage(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stage created",
    data: result,
  });
});

const updateStage = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.updateStage(user, req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stage updated",
    data: result,
  });
});

const reorderStages = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.reorderStages(user, req.body.ids || []);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stages reordered",
    data: result,
  });
});

const deleteStage = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.deleteStage(user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stage deleted",
    data: result,
  });
});

const createTask = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.createTask(user, req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task created",
    data: result,
  });
});

const updateTask = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.updateTask(user, req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task updated",
    data: result,
  });
});

const deleteTask = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.deleteTask(user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task deleted",
    data: result,
  });
});

const createBug = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.createBug(user, req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bug created",
    data: result,
  });
});

const updateBug = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.updateBug(user, req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bug updated",
    data: result,
  });
});

const deleteBug = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.deleteBug(user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bug deleted",
    data: result,
  });
});

const createMilestone = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.createMilestone(user, req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Milestone created",
    data: result,
  });
});

const updateMilestone = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.updateMilestone(user, req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Milestone updated",
    data: result,
  });
});

const deleteMilestone = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.deleteMilestone(user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Milestone deleted",
    data: result,
  });
});

const addAttachment = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.addAttachment(user, req.params.id, {
    url: req.body.image,
    name: req.file?.originalname || req.body.name || "Attachment",
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Attachment uploaded",
    data: result,
  });
});

const deleteAttachment = catchAsync(async (req, res) => {
  const user = await actor(req, res);
  const result = await pmService.deleteAttachment(user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Attachment deleted",
    data: result,
  });
});

const assignableProviders = catchAsync(async (req, res) => {
  const result = await pmService.assignableProviders();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Providers retrieved",
    data: result,
  });
});

export const pmController = {
  listProjects,
  listEligible,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  listStages,
  createStage,
  updateStage,
  reorderStages,
  deleteStage,
  createTask,
  updateTask,
  deleteTask,
  createBug,
  updateBug,
  deleteBug,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  addAttachment,
  deleteAttachment,
  assignableProviders,
};
