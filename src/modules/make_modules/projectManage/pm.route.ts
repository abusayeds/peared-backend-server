import express from "express";
import { authMiddleware } from "../../../middlewares/auth";
import { uploadSingle } from "../../../middlewares/fileUploadNormal";
import { role } from "../../../utils/role";
import { pmController } from "./pm.controller";

const router = express.Router();
const both = authMiddleware(role.user, role.provider, role.admin);

router.get("/projects", both, pmController.listProjects);
router.get("/eligible", both, pmController.listEligible);
router.post("/projects", both, pmController.createProject);
router.get("/projects/:id", both, pmController.getProject);
router.patch("/projects/:id", both, pmController.updateProject);
router.delete("/projects/:id", both, pmController.deleteProject);

router.get("/stages", both, pmController.listStages);
router.post("/stages", both, pmController.createStage);
router.patch("/stages/reorder", both, pmController.reorderStages);
router.patch("/stages/:id", both, pmController.updateStage);
router.delete("/stages/:id", both, pmController.deleteStage);

router.post("/projects/:id/tasks", both, pmController.createTask);
router.patch("/tasks/:id", both, pmController.updateTask);
router.delete("/tasks/:id", both, pmController.deleteTask);

router.post("/projects/:id/bugs", both, pmController.createBug);
router.patch("/bugs/:id", both, pmController.updateBug);
router.delete("/bugs/:id", both, pmController.deleteBug);

router.post("/projects/:id/milestones", both, pmController.createMilestone);
router.patch("/milestones/:id", both, pmController.updateMilestone);
router.delete("/milestones/:id", both, pmController.deleteMilestone);

router.post(
  "/projects/:id/attachments",
  both,
  ...uploadSingle("file"),
  pmController.addAttachment
);
router.delete("/attachments/:id", both, pmController.deleteAttachment);

router.get("/assignable-providers", both, pmController.assignableProviders);

export const pmRoutes = router;
