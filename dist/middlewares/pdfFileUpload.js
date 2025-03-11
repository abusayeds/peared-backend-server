"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = require("../config");
const UPLOAD_PATH = config_1.UPLOAD_FOLDER || "public/images";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif", "application/pdf"];
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
        cb(null, true);
    }
    else {
        cb(new AppError_1.default(http_status_1.default.BAD_REQUEST, "Only image files and PDFs are allowed!"), false);
    }
};
const uploadFiles = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).fields([
    { name: "image", maxCount: 5 },
    { name: "certificate", maxCount: 5 }
]);
const handleFileUpload = (req, res, next) => {
    uploadFiles(req, res, (err) => {
        if (err) {
            return next(err);
        }
        if (req.files && req.files.image && req.files.image.length > 0) {
            req.body.image = `/images/${req.files.image[0].filename}`;
        }
        if (req.files && req.files.certificate && req.files.certificate.length > 0) {
            const certificatePaths = [];
            req.files.certificate.forEach((file) => {
                certificatePaths.push(`/images/${file.filename}`);
            });
            req.body.certificate = certificatePaths;
        }
        next();
    });
};
exports.default = handleFileUpload;
