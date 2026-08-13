
import { z } from "zod";

const asString = z.preprocess((val) => {
  if (Array.isArray(val)) return String(val[0] ?? "");
  if (val == null) return "";
  return String(val);
}, z.string());

export const projectValidation = z.object({
  body: z.object({
    street: asString.pipe(z.string().trim().min(1, "Street is required")),
    city: asString.pipe(z.string().trim().min(1, "City is required")),
    postCode: asString.pipe(
      z
        .string()
        .trim()
        .min(1, "Post Code is required")
        .regex(/^\d{5}(-\d{4})?$/, "Post Code must be 5 digits")
        .transform((v) => v.slice(0, 5))
    ),
    locationType: z.enum(["Home", "Business"], {
      required_error: "Location type is required",
    }),
    time: z.enum(
      [
        "Urgent(1 - 2 days)",
        "Within 2 weeks",
        "More than 2 weeks",
        "Not sure - still planning",
      ],
      { required_error: "Time selection is required" }
    ),
    priceRange: asString.pipe(
      z.string().trim().min(1, "Price range is required")
    ),
    projectName: asString.pipe(
      z.string().trim().min(1, "Project name is required")
    ),
    projectCategory: asString.pipe(
      z.string().trim().min(1, "Project category is required")
    ),
    workDetails: asString.pipe(
      z
        .string()
        .trim()
        .min(1, "Work details are required")
        .max(1000, "Maximum 1000 characters allowed")
    ),
    image: asString.pipe(z.string().trim().min(1, "image is required")),
  }),
});

