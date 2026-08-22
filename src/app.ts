/* eslint-disable @typescript-eslint/no-explicit-any */
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";

import { logger, logHttpRequests } from "./logger/logger";
import { paymentController } from "./modules/basic_modules/payment/payment.controller";
import router from "./routes";
import { CLIENT_URLS, NODE_ENV } from "./config";


const app: Application = express();
app.set("trust proxy", 1);
app.use('/stripe/webhook', express.raw({ type: "application/json" }), paymentController.webhookController);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser / same-origin tools (no Origin header)
      if (!origin) return callback(null, true);
      if (CLIENT_URLS.length === 0) {
        // Dev / misconfigured: reflect request origin (needed for credentials)
        return callback(null, true);
      }
      if (CLIENT_URLS.includes(origin) || NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
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
  <span style="font-size: 50px; color: #ff1744; text-shadow: 3px 3px 8px rgba(0,0,0,0.4);">Peared Server V5</span>
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


