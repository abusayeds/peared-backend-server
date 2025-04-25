import express from "express";
import { authMiddleware } from "../../../middlewares/auth"; import zodValidation from "../../../middlewares/zodValidationHandler";
import { role } from "../../../utils/role";
import { BitprojectValidation } from "./BitProject.validation";
import { bitController } from "./BitProject.controller";
import handleFileUpload from "../../../middlewares/pdfFileUpload";

const router = express.Router();

router.post("/create-bit-project", handleFileUpload, authMiddleware(role.provider), bitController.createBitProject);
router.get("/single-project/:bitProjectId", authMiddleware(role.user), bitController.singleProject);
router.get("/confirm-project/:projectId", authMiddleware(role.user, role.provider), bitController.confirmProject);
router.post("/bit-project-approved/:bitProjectId", authMiddleware(role.user), bitController.bitProjectApproved);

// current-projects
router.get("/current-projects", authMiddleware(role.provider), bitController.currentProjects)
router.get("/pendings-bits", authMiddleware(role.provider), bitController.pendingsBits)

//  project ok 
router.post("/workOkByProvider/:bitProjectId", authMiddleware(role.provider), bitController.ProjectOkByProvider,)
router.post("/workOkByUser/:bitProjectId", authMiddleware(role.user), bitController.ProjectOkByUser,)
router.post("/workNotOKByUser/:bitProjectId", authMiddleware(role.user), bitController.ProjectNotOk)
export const bitProjectRoutes = router;