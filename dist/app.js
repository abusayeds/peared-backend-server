"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
// Import the 'express' module
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const globalErrorHandler_1 = __importDefault(require("./middlewares/globalErrorHandler"));
const notFound_1 = __importDefault(require("./middlewares/notFound"));
const logger_1 = require("./logger/logger");
const payment_controller_1 = require("./modules/basic_modules/payment/payment.controller");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use('/stripe/webhook', express_1.default.raw({ type: "application/json" }), payment_controller_1.paymentController.webhookController);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.static("public"));
app.use(logger_1.logHttpRequests);
app.use(routes_1.default);
app.get("/", (req, res) => {
    logger_1.logger.info("Root endpoint hit");
    const template = `<h2 style="text-align:center; font-family: 'Merienda', cursive; color: #4caf50; font-size: 40px; padding: 20px; text-shadow: 3px 3px 6px rgba(0,0,0,0.3);">
  <span style="font-size: 36px; color: #ff5722;">Welcome to the</span><br>
  <span style="font-size: 50px; color: #ff1744; text-shadow: 3px 3px 8px rgba(0,0,0,0.4);">Peared Server V1</span>
</h2>
    `;
    res.status(200).send(template);
});
app.all("*", notFound_1.default);
app.use(globalErrorHandler_1.default);
app.use((err, req, res, next) => {
    logger_1.logger.error(`Error occurred: ${err.message}`, { stack: err.stack });
    next(err);
});
exports.default = app;
