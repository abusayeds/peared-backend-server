import { z } from "zod";
const loginValidation = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required!",
        invalid_type_error: "Email must be a string",
      })
      .email(),
    password: z.string({
      required_error: "password is required!",
      invalid_type_error: "password must be a string",
    }),
  }),
});

const registerUserValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: "name is required!",
      invalid_type_error: "name must be a string",
    }),
    email: z
      .string({
        required_error: "Email is required!",
        invalid_type_error: "Email must be a string",
      })
      .email(),
    password: z
      .string({
        required_error: "password is required!",
        invalid_type_error: "password must be a string",
      })
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string({
        required_error: " confirmPassword is required!",
        invalid_type_error: " confirmPassword must be a string",
      })
      .min(6, " confirmPassword must be at least 6 characters long"),
  }),
});


const joinProviderValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required!",
      invalid_type_error: "Name must be a string",
    }).trim(),

    email: z.string({
      required_error: "Email is required!",
      invalid_type_error: "Email must be a string",
    }).email("Invalid email format"),

    password: z.string({
      required_error: "Password is required!",
      invalid_type_error: "Password must be a string",
    }).min(6, "Password must be at least 6 characters long"),

    confirmPassword: z.string({
      required_error: "Confirm password is required!",
      invalid_type_error: "Confirm password must be a string",
    }).min(6, "Confirm password must be at least 6 characters long"),
    status: z.enum(["active", "blocked"]).default("active"),
    service: z.string(

    ).nonempty("At least one service must be selected"),
    // certificate:z.string().nonempty("At least one certificate is required"),
    isDeleted: z.boolean().default(false),
  }),
});


const resetPassWordValidation = z.object({
  body: z.object({
    password: z
      .string({
        required_error: "password is required!",
        invalid_type_error: "password must be a string",
      })
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string({
        required_error: "confirmPassword is required!",
        invalid_type_error: " confirmPassword must be a string",
      })
      .min(6, "confirmPassword must be at least 6 characters long"),
  }),
});

export const userValidation = {
  registerUserValidation,
  loginValidation,
  resetPassWordValidation,

  joinProviderValidation

}
