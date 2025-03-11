"use strict";
// import { createLogger, format, transports } from "winston";
// import DailyRotateFile from "winston-daily-rotate-file";
// import path from "path";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logHttpRequests = exports.logger = void 0;
// const logger = createLogger({
//   level: "info",
//   format: format.combine(
//     format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
//     format.errors({ stack: true }),
//     format.splat(),
//     format.json(),
//   ),
//   defaultMeta: { service: "user-service" },
//   transports: [
//     // Write all logs with level `error` and below to `error.log`
//     new DailyRotateFile({
//       filename: path.join("logs", "error-%DATE%.log"),
//       datePattern: "YYYY-MM-DD",
//       level: "error",
//     }),
//     // Write all logs with level `info` and below to `combined.log`
//     new DailyRotateFile({
//       filename: path.join("logs", "combined-%DATE%.log"),
//       datePattern: "YYYY-MM-DD",
//     }),
//     // Write logs to the console as well
//     new transports.Console({
//       format: format.combine(format.colorize(), format.simple()),
//     }),
//   ],
// });
// // If we're not in production, log to the `console` with the format: `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// if (process.env.NODE_ENV !== "production") {
//   logger.add(
//     new transports.Console({
//       format: format.combine(format.colorize(), format.simple()),
//     }),
//   );
// }
// export default logger;
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
const colorette_1 = require("colorette");
exports.logger = (0, winston_1.createLogger)({
    level: "info",
    format: winston_1.format.combine(winston_1.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json()),
    transports: [
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join("logs", "error-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            level: "error",
        }),
        // Write all logs with level `info` and below to `combined.log`
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join("logs", "combined-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
        }),
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple()),
        }),
    ],
});
// Middleware to log requests and responses
const logHttpRequests = (req, res, next) => {
    const startTime = Date.now();
    res.on("finish", () => {
        const colorizeByStatusCode = (statusCode) => {
            if (statusCode >= 200 && statusCode < 300) {
                return (0, colorette_1.green)(statusCode.toString()); // Successful responses
            }
            else if (statusCode >= 400 && statusCode < 500) {
                return (0, colorette_1.red)(statusCode.toString()); // Client errors
            }
            else if (statusCode >= 500) {
                return (0, colorette_1.yellow)(statusCode.toString()); // Server errors
            }
            return (0, colorette_1.blue)(statusCode.toString()); // Default color
        };
        const colorizeByStatusUrl = (method) => {
            if (method === "GET") {
                return (0, colorette_1.green)(method); // Successful responses
            }
            else if (method === "POST") {
                return (0, colorette_1.blue)(method); // Client errors
            }
            else if (method === "PATCH") {
                return (0, colorette_1.yellow)(method); // Server errors
            }
            else if (method === "PUT") {
                return (0, colorette_1.yellowBright)(method); // Server errors
            }
            return (0, colorette_1.red)(method); // Default color
        };
        //  console.log(req)
        exports.logger.info({
            message: ` Incoming Request ${colorizeByStatusUrl(req.method)} ${colorizeByStatusCode(res.statusCode)} ${(0, colorette_1.magenta)(req.originalUrl)} ${(0, colorette_1.yellowBright)(`${Date.now() - startTime} ms`)}`,
            size: res.get("Content-Length") || 0,
        });
    });
    next();
};
exports.logHttpRequests = logHttpRequests;
