"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const feedbackSchema = new mongoose_1.default.Schema({
    heard: {
        type: String,
        required: true,
        trim: true,
    },
    enjoy: {
        type: String,
        enum: ["yes", "no"],
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    feedback: {
        type: String,
    },
    rating: {
        type: String,
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt timestamps
});
exports.FeedbackModel = mongoose_1.default.models.Feedback ||
    mongoose_1.default.model("Feedback", feedbackSchema);
