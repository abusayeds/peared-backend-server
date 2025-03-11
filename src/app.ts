/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
// Import the 'express' module
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";

import router from "./routes";
import { logger, logHttpRequests } from "./logger/logger";
import { paymentController } from "./modules/basic_modules/payment/payment.controller";


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
  const template = `<h1 style="text-align:center">Hello</h1>
    <h2 style="text-align:center">Welcome to the Server of Abu Sayed </h2>`;
  res.status(200).send(template);
});

app.all("*", notFound);
app.use(globalErrorHandler);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error occurred: ${err.message}`, { stack: err.stack });
  next(err);
});

export default app;


