import express from "express";
import { authMiddleware } from "../../../../middlewares/auth";
import { role } from "../../../../utils/role";
import { catagoryController } from "./catagory.controller";


const router = express.Router();

router.post("/create-catagory", authMiddleware(role.admin), catagoryController.createCategory);
router.get("/all-catagory", catagoryController.AllCatagory);
router.post("/update-catagory/:catagoryId", authMiddleware(role.admin), catagoryController.updateCatagory);

export const catagoryRoutes = router;
