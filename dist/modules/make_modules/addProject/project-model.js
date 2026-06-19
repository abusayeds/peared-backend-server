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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const projectSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postCode: { type: String, required: true, trim: true, match: [/^\d{5}$/, "Post Code must be exactly 5 digits"] },
    locationType: { type: String, enum: ["Home", "Business"], required: true },
    time: {
        type: String,
        enum: ["Urgent(1 - 2 days)", "Within 2 weeks", "More than 2 weeks", "Not sure - still planning"],
        required: true
    },
    priceRange: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    projectName: { type: String, required: true, trim: true },
    projectCategory: { type: String, required: true, trim: true },
    workDetails: {
        type: String,
        required: true,
        trim: true
    },
    backgroundCertificate: { type: Boolean, required: false, },
    oshaCertificate: { type: Boolean, required: false, },
    payment: {
        type: Boolean,
        default: true
    },
    isApprove: {
        type: Boolean,
        default: false
    },
    isComplete: { type: Boolean, default: false },
    expiredDate: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
}, { timestamps: true });
const projectModel = mongoose_1.default.model("Project", projectSchema);
exports.default = projectModel;
