"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const zod_1 = require("zod");
const loginValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({
            required_error: "Email is required!",
            invalid_type_error: "Email must be a string",
        })
            .email(),
        password: zod_1.z.string({
            required_error: "password is required!",
            invalid_type_error: "password must be a string",
        }),
    }),
});
const registerUserValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: "name is required!",
            invalid_type_error: "name must be a string",
        }),
        email: zod_1.z
            .string({
            required_error: "Email is required!",
            invalid_type_error: "Email must be a string",
        })
            .email(),
        password: zod_1.z
            .string({
            required_error: "password is required!",
            invalid_type_error: "password must be a string",
        })
            .min(6, "Password must be at least 6 characters long"),
        confirmPassword: zod_1.z
            .string({
            required_error: " confirmPassword is required!",
            invalid_type_error: " confirmPassword must be a string",
        })
            .min(6, " confirmPassword must be at least 6 characters long"),
    }),
});
const joinProviderValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: "Name is required!",
            invalid_type_error: "Name must be a string",
        }).trim(),
        email: zod_1.z.string({
            required_error: "Email is required!",
            invalid_type_error: "Email must be a string",
        }).email("Invalid email format"),
        password: zod_1.z.string({
            required_error: "Password is required!",
            invalid_type_error: "Password must be a string",
        }).min(6, "Password must be at least 6 characters long"),
        confirmPassword: zod_1.z.string({
            required_error: "Confirm password is required!",
            invalid_type_error: "Confirm password must be a string",
        }).min(6, "Confirm password must be at least 6 characters long"),
        status: zod_1.z.enum(["active", "blocked"]).default("active"),
        service: zod_1.z.string().nonempty("At least one service must be selected"),
        // certificate:z.string().nonempty("At least one certificate is required"),
        isDeleted: zod_1.z.boolean().default(false),
    }),
});
const resetPassWordValidation = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z
            .string({
            required_error: "password is required!",
            invalid_type_error: "password must be a string",
        })
            .min(6, "Password must be at least 6 characters long"),
        confirmPassword: zod_1.z
            .string({
            required_error: "confirmPassword is required!",
            invalid_type_error: " confirmPassword must be a string",
        })
            .min(6, "confirmPassword must be at least 6 characters long"),
    }),
});
exports.userValidation = {
    registerUserValidation,
    loginValidation,
    resetPassWordValidation,
    joinProviderValidation
};
