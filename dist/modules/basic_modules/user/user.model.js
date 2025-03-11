"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPModel = exports.UserModel = exports.PendingUserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const PendingUserSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    role: { type: String, enum: ["user", "admin"], },
}, { timestamps: true });
exports.PendingUserModel = mongoose_1.default.model("PendingUser", PendingUserSchema);
const UserSchema = new mongoose_1.Schema({
    name: { type: String, trim: true, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 3,
        set: (v) => bcrypt_1.default.hashSync(v, bcrypt_1.default.genSaltSync(12)),
        select: false,
    },
    address: { type: String, trim: true, required: false },
    city: { type: String, trim: true, required: false },
    image: { type: String, trim: true, default: "", required: false },
    certificate: {
        type: [String], trim: true, required: false, default: undefined
    },
    postalCode: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ["admin", "user", "provider"],
        default: "user",
    },
    accountId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["active", "blocked"],
        default: "active",
    },
    service: {
        type: [String], trim: true, required: false,
        default: undefined
    },
    isApproved: {
        type: Boolean, required: false, default: undefined
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", UserSchema);
const OTPSchema = new mongoose_1.Schema({
    email: { type: String, required: true, trim: true },
    otp: { type: String, required: true, trim: true },
    expiresAt: { type: Date, required: true },
});
exports.OTPModel = mongoose_1.default.model("OTP", OTPSchema);
