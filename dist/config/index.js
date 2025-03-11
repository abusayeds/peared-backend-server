"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_ENV = exports.STRIPE_SECRET_KEY = exports.STRIPE_WEBHOOK_SECRET = exports.max_file_size = exports.UPLOAD_FOLDER = exports.Nodemailer_GMAIL_PASSWORD = exports.Nodemailer_GMAIL = exports.JWT_SECRET_KEY = exports.DATABASE_URL = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join((process.cwd(), ".env")) });
exports.PORT = process.env.PORT || 5000;
exports.DATABASE_URL = process.env.DATABASE_URL;
exports.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
exports.Nodemailer_GMAIL = process.env.Nodemailer_GMAIL;
exports.Nodemailer_GMAIL_PASSWORD = process.env.Nodemailer_GMAIL_PASSWORD;
exports.UPLOAD_FOLDER = process.env.UPLOAD_FOLDER;
exports.max_file_size = Number(process.env.max_file_size);
exports.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
exports.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
exports.NODE_ENV = process.env.NODE_ENV;
