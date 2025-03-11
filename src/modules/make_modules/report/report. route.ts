import express from "express";
import { authMiddleware } from "../../../middlewares/auth";
import { upload } from "../../../middlewares/fileUploadNormal";
import { role } from "../../../utils/role";
import { reportController } from "./report.controller";



const router = express.Router();

router.post("/create-report", authMiddleware(role.user, role.provider), upload.single("image"), reportController.createReport,);
router.get("/get-report-admin", authMiddleware(role.admin), reportController.getReportAdmin)
router.get("/single-report/:id", authMiddleware(role.admin), reportController.singleReport)
export const reportRoute = router;