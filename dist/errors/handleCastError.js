"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hendelCastError = (err) => {
    const errorSoures = [
        {
            path: err.path,
            message: err.message,
        },
    ];
    const statusCode = 400;
    return {
        statusCode,
        message: errorSoures[0].message,
        errorSoures,
    };
};
exports.default = hendelCastError;
