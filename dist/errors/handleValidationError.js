"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hendleMongooseValidationError = (err) => {
    const errorSoures = Object.values(err.errors).map((val) => {
        return {
            path: val === null || val === void 0 ? void 0 : val.path,
            message: val === null || val === void 0 ? void 0 : val.message
        };
    });
    const statusCode = 500;
    return {
        statusCode,
        message: errorSoures[0].message,
        errorSoures
    };
};
exports.default = hendleMongooseValidationError;
