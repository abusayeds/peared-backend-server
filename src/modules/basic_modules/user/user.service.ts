/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import { IUser, } from "./user.interface";
import { JWT_SECRET_KEY, } from "../../../config";
import { OTPModel, UserModel } from "./user.model";
import AppError from "../../../errors/AppError";
import httpStatus from "http-status";
import { sendEmail } from "./sendEmail";
import queryBuilder from "../../../builder/queryBuilder";
import { providerFeedbackModel } from "../../make_modules/providerFeedback/providerModel";

export const generateToken = (payload: any): string => {
  return jwt.sign(payload, JWT_SECRET_KEY as string, { expiresIn: "7d" });
};
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};
export const getStoredOTP = async (email: string): Promise<string | null> => {
  const otpRecord = await OTPModel.findOne({ email });
  return otpRecord ? otpRecord.otp : null;
};
export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(otp);
  return otp
};
export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return UserModel.findOne({ email }).select('+password');
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return UserModel.findById(id);
};
export const saveOTP = async (email: string, otp: string): Promise<void> => {
  await OTPModel.findOneAndUpdate(
    { email },
    { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    { upsert: true, new: true },
  );
};


// logic finctonality

const createUserDB = async (payload: IUser) => {
  const isUserRegistered = await UserModel.findOne({ email: payload.email });
  const { name, email, password, confirmPassword } = payload
  if (isUserRegistered) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "You already have an account.",
    );
  }
  if (password !== confirmPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Passwords do not match');
  }
  const result = await UserModel.create(payload)
  // await PendingUserModel.findOneAndUpdate(
  //   { email }, { name, email, password, confirmPassword, }, { upsert: true },
  // );
  // const otp = generateOTP();
  // await saveOTP(email, otp);
  // await sendOTPEmail(email, otp);
  // const token = jwt.sign({ email }, JWT_SECRET_KEY as string, { expiresIn: "7d", });
  return result
}
const joinProviderDB = async (payload: IUser) => {
 
  const isUserRegistered = await UserModel.findOne({ email: payload.email });
  const { password, confirmPassword } = payload
  if (isUserRegistered) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "You already have an account.",
    );
  }
  if (password !== confirmPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Passwords do not match');
  }
  const result = await UserModel.create({
    ...payload,
    isApproved: false,
  
  })
  return result
}


const loginDB = async (payload : any) => {
 
    
   
  const user = await findUserByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,
      "This account does not exist.",
    );
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND,
      "your account is deleted by admin.",
    );
  }

  const isPasswordValid = await bcrypt.compare(
    payload.password,
    user.password as string,
  );

  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED,
      "Wrong password!",
    );
  }
  return user
}

const forgotPasswordDB = async (email: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,
      "This account does not exist.",
    );
  }
  const otp = generateOTP();
  await saveOTP(email, otp);
    sendEmail(otp, email)
}
const verifyForgotPasswordOtpDB = async (otp: string, email: string) => {
  const otpRecord = await OTPModel.findOne({ email });
  if (!otpRecord) {
    throw new AppError(httpStatus.NOT_FOUND,
      "User not found!",
    );
  }

  const currentTime = new Date();
  if (otpRecord.expiresAt < currentTime) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "OTP has expired",
    );
  }

  if (otpRecord.otp !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Wrong OTP",
    );
  }

}

const resendOtpDB = async (email: string) => {

  const newOTP = generateOTP();
  await saveOTP(email, newOTP);
  await sendEmail(newOTP, email,);
}

const resetPasswordDB = async (payload: any, email: string) => {
 
  
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,
      "User not found.",
    );
  }
  if (payload.confirmPassword !== payload.password) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Passwords do not match');
  }
  await UserModel.findOneAndUpdate({ email: email }, {password: payload.password}, { new: true });
}

const changePasswordDB = async (payload: any, email: string) => {
  const { oldPassword, newPassword, confirmPassword } = payload
  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Please provide oldPassword, newPassword, and confirmPassword.",
    );
  }
  console.log(email);
  
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,
      "User not found.",
    );
  }
  const isMatch = await bcrypt.compare(oldPassword, user.password as string);
  if (!isMatch) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Old password is incorrect.",
    );
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "New password and confirm password do not match.",
    );
  }
  await UserModel.findOneAndUpdate({ email: email }, { password: newPassword }, { new: true });
}

const updateUserDB = async (payload: IUser,  userId: string) => {

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,
      "User not found.",
    );
  }
 
  const result = await UserModel.findByIdAndUpdate(userId, { ...payload, }, { new: true });
  return result
}

const myProfileDB = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,
      "User not found.",
    );
  }
  return user

}
const allUserDB = async (query: Record<string, unknown>,) => {
  const userQuery = new queryBuilder(UserModel.find({ role: "user" }), query).sort()
  const { totalData } = await userQuery.paginate(UserModel.find({ role: "user" }))
  const user = await userQuery.modelQuery.exec()
  const currentPage = Number(query?.page) || 1;
  const limit = Number(query.limit) || 10;
  const pagination = userQuery.calculatePagination({
    totalData,
    currentPage,
    limit,
  });
  return { pagination, user, };
}





export const                        
userService = {
  createUserDB,
  // verifyOtpDB
  loginDB,
  forgotPasswordDB,
  verifyForgotPasswordOtpDB,
  resendOtpDB,
  resetPasswordDB,
  changePasswordDB,
  updateUserDB,
  myProfileDB,
  allUserDB,
  joinProviderDB,
 
}




export const userDelete = async (id: string): Promise<void> => {
  await UserModel.findByIdAndUpdate(id, { isDeleted: true });
};




