"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose = require('mongoose');
const providerSchema = new mongoose.Schema({
    providerId: {
        type: mongoose_1.Types.ObjectId,
        required: true,
        ref: "User",
    },
    amount: {
        type: Number,
        required: true
    },
    action: {
        type: String,
        enum: ['withdraw', 'paid'],
        default: 'withdraw'
    }
}, {
    timestamps: true
});
exports.withdrawModel = mongoose.model('withdraw', providerSchema);
