import express from "express";
import { paymentController } from "./payment.controller";
import { role } from "../../../utils/role";
import { authMiddleware } from "../../../middlewares/auth";
const router = express.Router();
router.post('/', express.raw({ type: "application/json" }), paymentController.webhookController)

router.post('/add-balance', authMiddleware(role.user, role.provider), paymentController.addBalance)
router.get("/my-wallat", authMiddleware(role.user, role.provider), paymentController.myWallat);
router.get("/my-payment-history", authMiddleware(role.user), paymentController.paymentHistory);


// withdraw rerquest 

router.post("/provider-withdraw", authMiddleware(role.provider), paymentController.providerWithdraw)

router.post('/payByAdmin', authMiddleware(role.provider),)


export const paymentRoutes = router;
