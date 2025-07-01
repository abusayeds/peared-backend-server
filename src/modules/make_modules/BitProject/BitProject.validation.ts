import { Types } from "mongoose";
import { z } from "zod";

export const BitprojectValidation = z.object({
    body: z.object({
        projectId: z.string({
            required_error: "Project ID is required",
        }).refine(val => Types.ObjectId.isValid(val), {
            message: "Invalid project ID",
        }).transform(val => new Types.ObjectId(val)),

        price: z.number({
            required_error: "Price is required",
        }).min(1, "Price must be greater than 0"),

        serviceTime: z.number(
            { required_error: "Service time is required" }
        ),

        startTime: z.string({
            required_error: "Start time is required"
        }).refine(val => !isNaN(Date.parse(val)), {
            message: "Invalid date format"
        }).transform(val => new Date(val)),

        Workdetails: z.string({
            required_error: "Work details are required",
        }).trim().min(1, "Work details are required").max(1000, "Maximum 200 characters allowed"),
    }),
});
