
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY, } from "../../../config";
import AppError from "../../../errors/AppError";
import { tokenDecoded } from "../../../middlewares/decoded";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { paymentController } from "../payment/payment.controller";
import { UserModel } from "./user.model";
import {
  findUserById,
  generateToken,

  userDelete,
  userService,
} from "./user.service";
const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUserDB(req.body)
  const responseData = {
    id: result?._id,
    email: result?.email,
    role: result?.role
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Registration successful",
    data: responseData
  });
});
const joinProvider = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body
  const user = await UserModel.findOne({ email: email })
  if (user) {
    throw new AppError(400, "You already have an account")
  }
  if (!req.body.service) {
    throw new AppError(httpStatus.BAD_REQUEST, "service is requred")
  } else {
    req.body.service = req.body.service.split(",")
  }

  if (req.body.service.length === 0) throw new AppError(400, "Service is Required")
  const providerData = { ...req.body, role: 'provider', }

  const { url, } = await paymentController.createCheckoutSession(req.body.email, 30, providerData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "For Join as a Contractor pay $30 ",
    data: url
  });
});
// export const verifyOTP = catchAsync(async (req: Request, res: Response) => {
//   const { otp } = req.body;
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer")) {
//     throw new AppError(httpStatus.UNAUTHORIZED,
//       "No token provided or invalid format  ",
//     );
//   }
//   const token = authHeader.split(" ")[1];
//   const decoded = jwt.verify(token, JWT_SECRET_KEY as string) as { email: string; };
//   const email = decoded.email;
//   const storedOTP = await getStoredOTP(email);
//   if (!storedOTP || storedOTP !== otp) {
//     throw new AppError(httpStatus.BAD_REQUEST,
//       "Invalid or expired OTP",
//     );
//   }
//   const result = await userService.verifyOtpDB(otp, email)
//   const userMsg = "Welcome to LikeMine_App.";
//   const adminMsg = `${name} has successfully registered.`;
//   await emitNotification({
//     userId: result._id as string,
//     userMsg,
//     adminMsg,
//   });

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: "Registration successful.",
//     data: result,
//   });
// });

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.loginDB(req.body)

  const token = generateToken({ user: user });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login complete!",
    data: {
      user,
      token,
    },
  });
});
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Please provide an email.",
    );
  }
  await userService.forgotPasswordDB(email)
  const token = jwt.sign({ email, forgot: 'forgot' }, JWT_SECRET_KEY as string, { expiresIn: "7d", });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent to your email. Please check!",
    data: {
      token: token,
    },
  });
},
);

const verifyForgotPasswordOTP = catchAsync(async (req: Request, res: Response) => {
  const { otp } = req.body;
  if (!otp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'otp is required')
  }
  const { decoded }: any = await tokenDecoded(req, res)
  const email = decoded.email;
  const forgot = decoded.forgot
  if (forgot !== "forgot") {
    throw new AppError(httpStatus.BAD_REQUEST,
      "invalid token",
    );
  }
  const token = jwt.sign({ email, verifyForgot: 'verifyForgot' }, JWT_SECRET_KEY as string, { expiresIn: "7d", });
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Please provide a valid email address.",
    );
  }
  await userService.verifyForgotPasswordOtpDB(otp, email)
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP verified successfully.",
    data: {
      token: token
    },
  });
},
);
const resendOTP = catchAsync(async (req: Request, res: Response) => {
  const { decoded, }: any = await tokenDecoded(req, res)
  const email = decoded.email;
  const token = jwt.sign({ email, forgot: 'forgot' }, JWT_SECRET_KEY as string, { expiresIn: "7d", });
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Please provide a valid email address.",
    );
  }
  await userService.resendOtpDB(email)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "A new OTP has been sent to your email.",
    data: { token },
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { decoded, }: any = await tokenDecoded(req, res)
  const verifyForgot = decoded.verifyForgot
  if (verifyForgot !== "verifyForgot") {
    throw new AppError(httpStatus.BAD_REQUEST,
      "invalid token",
    );
  }
  const email = decoded.email;
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Please provide a valid email address.",
    );
  }
  await userService.resetPasswordDB(req.body, email)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully.",
    data: null,
  });


});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { decoded, }: any = await tokenDecoded(req, res)
  const email = decoded.user.email;

  await userService.changePasswordDB(req.body, email)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "You have successfully changed the password.",
    data: null,
  });
},
);

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { decoded, }: any = await tokenDecoded(req, res)
  const userId = decoded.user._id;
  const result = await userService.updateUserDB(req.body, userId)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated.",
    data: result,
  });

});

const myProfile = catchAsync(async (req: Request, res: Response) => {
  const { decoded, token }: any = await tokenDecoded(req, res)
  const userId = decoded.user._id;
  const result = await userService.myProfileDB(userId)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "profile information retrieved successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const rersult = await userService.allUserDB(req.query,)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User list retrieved successfully",
    data: rersult
  });
});
const confirmProvider = catchAsync(async (req: Request, res: Response) => {
  const rersult = await userService.confirmProviderDB(req.query)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "provider list retrieved successfully",
    data: rersult
  });
});
const requestProvider = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.requestProviderDB(req.query)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Pending provider list retrieved successfully",
    data: result
  });
});
const approveProvider = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.approveProviderDB(req.body)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ` ${result ? "Approve Provider successfully" : " Reject provider"} `,
    data: result
  });
});


export const userController = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyForgotPasswordOTP,
  resendOTP,
  resetPassword,
  changePassword,
  updateUser,
  myProfile,
  getAllUsers,
  joinProvider,
  requestProvider,
  confirmProvider,
  approveProvider
}










export const BlockUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.body;
  const { decoded, }: any = await tokenDecoded(req, res)
  const adminId = decoded.id;
  const requestingUser = await UserModel.findById(adminId);
  if (!requestingUser || requestingUser.role !== "admin") {
    throw new AppError(httpStatus.FORBIDDEN,
      "Unauthorized: Only admins can change user status.",
    );
  }
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,
      "User not found.",
    );
  }

  if (user.role === "admin") {
    throw new AppError(httpStatus.FORBIDDEN,
      "Cannot change status of an admin user.",
    );
  }
  user.status = user.status === "active" ? "blocked" : "active";
  await user.save();
  const userMsg =
    user.status === "blocked"
      ? "Your account has been blocked by an admin."
      : "Your account has been unblocked by an admin.";

  // Uncomment this when you're ready to use the notification function
  // await emitNotificationForChangeUserRole({
  //   userId,
  //   userMsg,
  // });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User status changed to ${user.status} successfully.`,
    data: null,
    pagination: undefined,
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.query?.id as string;

  const user = await findUserById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,
      "user not found .",
    );
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND,
      "user  is already deleted.",
    );
  }
  await userDelete(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "user deleted successfully",
    data: null,
  });
});


