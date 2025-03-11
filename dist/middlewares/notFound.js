"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../errors/AppError"));
const notFound = (req, res) => {
    throw new AppError_1.default(404, `Route Not Found for ${req.originalUrl}`);
};
exports.default = notFound;
