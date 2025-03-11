"use strict";
// import { ZodError, ZodIssue } from "zod";
// import { IErrorResponse } from "../interface/error";
Object.defineProperty(exports, "__esModule", { value: true });
const hendleZodError = (err) => {
    const errorSoures = err.issues.map((issue) => {
        return {
            path: issue.path[issue.path.length - 1],
            message: issue.message,
        };
    });
    const statusCode = 400;
    return {
        statusCode,
        message: errorSoures[0].message,
        errorSoures,
    };
};
exports.default = hendleZodError;
