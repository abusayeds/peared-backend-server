"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketTokenDecoded = exports.tokenDecoded = void 0;
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const AppError_1 = __importDefault(require("../errors/AppError"));
const tokenDecoded = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "No token provided or invalid format.");
    }
    const token = authHeader.split(" ")[1];
    const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET_KEY);
    return { decoded, token };
});
exports.tokenDecoded = tokenDecoded;
const socketTokenDecoded = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token || typeof token !== 'string') {
        return { decoded: null, token };
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET_KEY);
        return { decoded, token };
    }
    catch (error) {
        return { decoded: null, token };
    }
});
exports.socketTokenDecoded = socketTokenDecoded;
