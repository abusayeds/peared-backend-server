"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitprojectValidation = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
exports.BitprojectValidation = zod_1.z.object({
    body: zod_1.z.object({
        projectId: zod_1.z.string({
            required_error: "Project ID is required",
        }).refine(val => mongoose_1.Types.ObjectId.isValid(val), {
            message: "Invalid project ID",
        }).transform(val => new mongoose_1.Types.ObjectId(val)),
        price: zod_1.z.number({
            required_error: "Price is required",
        }).min(1, "Price must be greater than 0"),
        serviceTime: zod_1.z.number({ required_error: "Service time is required" }),
        startTime: zod_1.z.string({
            required_error: "Start time is required"
        }).refine(val => !isNaN(Date.parse(val)), {
            message: "Invalid date format"
        }).transform(val => new Date(val)),
        Workdetails: zod_1.z.string({
            required_error: "Work details are required",
        }).trim().min(1, "Work details are required").max(1000, "Maximum 200 characters allowed"),
    }),
});
