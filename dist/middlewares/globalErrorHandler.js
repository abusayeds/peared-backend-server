"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const config_1 = require("../config");
const AppError_1 = __importDefault(require("../errors/AppError"));
const handleCastError_1 = __importDefault(require("../errors/handleCastError"));
const handleDuplicateError_1 = __importDefault(require("../errors/handleDuplicateError"));
const handleValidationError_1 = __importDefault(require("../errors/handleValidationError"));
const handleZodError_1 = __importDefault(require("../errors/handleZodError"));
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = err.message || "something is wrong";
    let errorSources = [
        {
            path: "",
            message: err.message,
        },
    ];
    if (err instanceof zod_1.ZodError) {
        const simplifliedError = (0, handleZodError_1.default)(err);
        statusCode = simplifliedError === null || simplifliedError === void 0 ? void 0 : simplifliedError.statusCode;
        message = simplifliedError.message;
        errorSources = simplifliedError.errorSoures;
    }
    else if ((err === null || err === void 0 ? void 0 : err.name) === "ValidationError") {
        const simplifliedError = (0, handleValidationError_1.default)(err);
        statusCode = simplifliedError === null || simplifliedError === void 0 ? void 0 : simplifliedError.statusCode;
        message = simplifliedError.message;
        errorSources = simplifliedError === null || simplifliedError === void 0 ? void 0 : simplifliedError.errorSoures;
    }
    else if ((err === null || err === void 0 ? void 0 : err.name) === "CastError") {
        const simplifliedError = (0, handleCastError_1.default)(err);
        statusCode = simplifliedError.statusCode;
        message = simplifliedError.message;
        errorSources = simplifliedError.errorSoures;
    }
    else if ((err === null || err === void 0 ? void 0 : err.code) === 11000) {
        const simplifliedError = (0, handleDuplicateError_1.default)(err);
        statusCode = simplifliedError === null || simplifliedError === void 0 ? void 0 : simplifliedError.statusCode;
        message = simplifliedError === null || simplifliedError === void 0 ? void 0 : simplifliedError.message;
        errorSources = simplifliedError === null || simplifliedError === void 0 ? void 0 : simplifliedError.errorSoures;
    }
    else if (err instanceof AppError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        message = err.message;
        errorSources = [
            {
                path: "",
                message: err.message,
            },
        ];
    }
    return res.status(statusCode).json({
        success: false,
        message,
        statusCode,
        errorSources,
        stack: config_1.NODE_ENV === "devlopment" ? err === null || err === void 0 ? void 0 : err.stack : null,
    });
};
exports.default = globalErrorHandler;
