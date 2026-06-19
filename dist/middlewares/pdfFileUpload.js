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
const http_status_1 = __importDefault(require("http-status"));
const multer_1 = __importDefault(require("multer"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const cloudinary_1 = require("../utils/cloudinary");
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/gif",
        "application/pdf",
    ];
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
        cb(null, true);
    }
    else {
        cb(new AppError_1.default(http_status_1.default.BAD_REQUEST, "Only image files and PDFs are allowed!"), false);
    }
};
const uploadFiles = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).fields([
    { name: "image", maxCount: 5 },
    { name: "certificate", maxCount: 5 },
    { name: "backgroundCertificat", maxCount: 1 },
    { name: "oshaCertificat", maxCount: 1 },
]);
const handleFileUpload = (req, res, next) => {
    uploadFiles(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (err) {
            return next(err);
        }
        try {
            if (((_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.image) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                req.body.image = yield (0, cloudinary_1.uploadToCloudinary)(req.files.image[0], "peared/images");
            }
            if (((_d = (_c = req.files) === null || _c === void 0 ? void 0 : _c.certificate) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                const certificateUrls = [];
                for (const file of req.files.certificate) {
                    certificateUrls.push(yield (0, cloudinary_1.uploadToCloudinary)(file, "peared/certificates"));
                }
                req.body.certificate = certificateUrls;
            }
            if (((_f = (_e = req.files) === null || _e === void 0 ? void 0 : _e.oshaCertificat) === null || _f === void 0 ? void 0 : _f.length) > 0) {
                const oshaCertificat = req.files.oshaCertificat[0];
                if (oshaCertificat.mimetype !== "application/pdf") {
                    return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, "PDF only for OSAH Certificat."));
                }
                req.body.oshaCertificat = yield (0, cloudinary_1.uploadToCloudinary)(oshaCertificat, "peared/certificates");
            }
            if (((_h = (_g = req.files) === null || _g === void 0 ? void 0 : _g.backgroundCertificat) === null || _h === void 0 ? void 0 : _h.length) > 0) {
                const backgroundCertificat = req.files.backgroundCertificat[0];
                if (backgroundCertificat.mimetype !== "application/pdf") {
                    return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, "PDF only for Background Certificat."));
                }
                req.body.backgroundCertificat = yield (0, cloudinary_1.uploadToCloudinary)(backgroundCertificat, "peared/certificates");
            }
            next();
        }
        catch (error) {
            next(error);
        }
    }));
};
exports.default = handleFileUpload;
