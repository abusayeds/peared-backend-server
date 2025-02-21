import express from "express";
import { role } from "../../../utils/role";
import { authMiddleware } from "../../../middlewares/auth";
import { withDrawController } from "./withdraw.controller";
const router = express.Router();


router.get('/all-withdraw-req' , authMiddleware(role.admin) , withDrawController.allWithWraw   )
router.post('/withdraw/:withDrawId' , authMiddleware(role.admin) , withDrawController.payByAdmin   )

 

export const withDrawRoutes = router;
