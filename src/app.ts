/* eslint-disable @typescript-eslint/no-explicit-any */
// Import the 'express' module
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";

import { logger, logHttpRequests } from "./logger/logger";
import { paymentController } from "./modules/basic_modules/payment/payment.controller";
import router from "./routes";


const app: Application = express();
app.use('/stripe/webhook', express.raw({ type: "application/json" }), paymentController.webhookController);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.static("public"));
app.use(logHttpRequests);
app.use(router);
app.get("/", (req: Request, res: Response) => {
  logger.info("Root endpoint hit");
  const template = `<h2 style="text-align:center; font-family: 'Merienda', cursive; color: #4caf50; font-size: 40px; padding: 20px; text-shadow: 3px 3px 6px rgba(0,0,0,0.3);">
  <span style="font-size: 36px; color: #ff5722;">Welcome to the</span><br>
  <span style="font-size: 50px; color: #ff1744; text-shadow: 3px 3px 8px rgba(0,0,0,0.4);">Peared Server</span>
</h2>
    `;
  res.status(200).send(template);
});

app.all("*", notFound);
app.use(globalErrorHandler);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error occurred: ${err.message}`, { stack: err.stack });
  next(err);
});

export default app;


