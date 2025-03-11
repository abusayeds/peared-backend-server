"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import the 'express' module
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const globalErrorHandler_1 = __importDefault(require("./middlewares/globalErrorHandler"));
const notFound_1 = __importDefault(require("./middlewares/notFound"));
const routes_1 = __importDefault(require("./routes"));
const logger_1 = require("./logger/logger");
const payment_controller_1 = require("./modules/basic_modules/payment/payment.controller");
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
    const template = `<h1 style="text-align:center">Hello</h1>
    <h2 style="text-align:center">Welcome to the Server of Abu Sayed </h2>`;
    res.status(200).send(template);
});
app.all("*", notFound_1.default);
app.use(globalErrorHandler_1.default);
app.use((err, req, res, next) => {
    logger_1.logger.error(`Error occurred: ${err.message}`, { stack: err.stack });
    next(err);
});
exports.default = app;
