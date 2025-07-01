

import { z } from "zod";

export const projectValidation = z.object({
    body: z.object({
        street: z.string({ required_error: "Street is required" }).trim().min(1, "Street is required"),
        city: z.string({ required_error: "City is required" }).trim().min(1, "City is required"),
        postCode: z.string({ required_error: "Post Code is required" }).trim().min(1, "Post Code is required"),
        locationType: z.enum(["Home", "Business"], { required_error: "Location type is required" }),
        time: z.enum(
            ["Urgent(1 - 2 days)", "Within 2 weeks", "More than 2 weeks", "Not sure - still planning"],
            { required_error: "Time selection is required" }
        ),
        priceRange: z.string({ required_error: "Price range is required" }).trim().min(1, "Price range is required"),
        projectName: z.string({ required_error: "Project name is required" }).trim().min(1, "Project name is required"),
        projectCategory: z.string({ required_error: "Project category is required" }).trim().min(1, "Project category is required"),
        workDetails: z.string({ required_error: "Work details are required" })
            .trim()
            .min(1, "Work details are required")
            .max(1000, "Maximum 200 characters allowed"),
        image: z.string({ required_error: "images is required" }).trim().min(1, "image is required"),

    }),

});

