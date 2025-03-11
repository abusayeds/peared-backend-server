"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectValidation = void 0;
const zod_1 = require("zod");
exports.projectValidation = zod_1.z.object({
    body: zod_1.z.object({
        street: zod_1.z.string({ required_error: "Street is required" }).trim().min(1, "Street is required"),
        city: zod_1.z.string({ required_error: "City is required" }).trim().min(1, "City is required"),
        postCode: zod_1.z.string({ required_error: "Post Code is required" }).trim().min(1, "Post Code is required"),
        locationType: zod_1.z.enum(["Home", "Business"], { required_error: "Location type is required" }),
        time: zod_1.z.enum(["Urgent(1 - 2 days)", "Within 2 weeks", "More than 2 weeks", "Not sure - still planning"], { required_error: "Time selection is required" }),
        priceRange: zod_1.z.string({ required_error: "Price range is required" }).trim().min(1, "Price range is required"),
        projectName: zod_1.z.string({ required_error: "Project name is required" }).trim().min(1, "Project name is required"),
        projectCategory: zod_1.z.string({ required_error: "Project category is required" }).trim().min(1, "Project category is required"),
        workDetails: zod_1.z.string({ required_error: "Work details are required" })
            .trim()
            .min(1, "Work details are required")
            .max(200, "Maximum 200 characters allowed"),
        image: zod_1.z.string({ required_error: "images is required" }).trim().min(1, "image is required"),
    }),
});
