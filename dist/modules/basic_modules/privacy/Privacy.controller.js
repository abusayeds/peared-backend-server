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
exports.PrivacyHtmlPage = exports.updatePrivacy = exports.getAllPrivacy = exports.createPrivacy = void 0;
const http_status_1 = __importDefault(require("http-status"));
const Privacy_service_1 = require("./Privacy.service");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const Privacy_model_1 = require("./Privacy.model");
exports.createPrivacy = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, Privacy_service_1.createPrivacyInDB)(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Privacy created successfully.",
        data: result,
    });
}));
exports.getAllPrivacy = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, Privacy_service_1.getAllPrivacyFromDB)();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Privacy retrieved successfully.",
        data: result,
    });
}));
exports.updatePrivacy = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description } = req.body;
    if (!description) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Description is required.");
    }
    const result = yield (0, Privacy_service_1.updatePrivacyInDB)(description);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Privacy updated successfully.",
        data: result,
    });
}));
exports.PrivacyHtmlPage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [privacy] = yield Privacy_model_1.PrivacyModel.find().sort({ createdAt: -1 }).limit(1);
    if (!privacy) {
        return res.status(404).send("<h2>Privacy Policy not found</h2>");
    }
    const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Privacy Policy</title>
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 0;
      }

      .container {
        background-color: #ffffff;
        width: 50%;
        margin: 40px auto;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      h1, h2 {
        color: #0073e6;
        margin-top: 0;
      }

      ul {
        padding-left: 20px;
      }

      hr {
        margin: 24px 0;
      }

      @media (max-width: 768px) {
        .container {
          width: 90%;
          padding: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Privacy Policy</h1>
      <h2><strong>Last updated:</strong> ${new Date(privacy.updatedAt).toLocaleDateString()}</h2>
      ${privacy === null || privacy === void 0 ? void 0 : privacy.description} <!-- Ensure this is sanitized if stored as HTML -->
    </div>
  </body>
  </html>
`;
    res.send(htmlContent);
}));
