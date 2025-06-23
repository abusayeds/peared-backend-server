import express from "express";
import { getMyNotification, NotificationFalseCount, } from "./notification.controller";
const router = express.Router();
router.get("/", getMyNotification);
router.get("/unseen", NotificationFalseCount);
export const NotificationRoutes = router;
