"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
const sendError = (res, statusCode, errorData) => {
    res.status(statusCode).send(Object.assign({ success: false }, errorData));
};
exports.default = sendError;
