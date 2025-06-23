/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcrypt";

import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import queryBuilder from "../../../builder/queryBuilder";
import { JWT_SECRET_KEY, } from "../../../config";
import AppError from "../../../errors/AppError";
import { sendEmail } from "./sendEmail";
import { userSearchField } from "./user.conastant";
import { IUser, } from "./user.interface";
import { OTPModel, UserModel } from "./user.model";

import { Server as SocketIOServer } from "socket.io";
export let io: SocketIOServer;
const socketMap: Map<string, any> = new Map();
const userMap: Map<string, string> = new Map();





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
  // if (!payload.oshaCertificat) {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'OshaCertificat is required')
  // }
  // if (!payload.backgroundCertificat) {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'Background Certificat is required')
  // }
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


const loginDB = async (payload: any) => {

  const user: any = await findUserByEmail(payload.email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,
      "This account does not exist.",
    );
  }
  if (user?.isApproved === false) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Your request is awaiting admin approval.')
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
  await UserModel.findOneAndUpdate({ email: email }, { password: payload.password }, { new: true });
}

const changePasswordDB = async (payload: any, email: string) => {
  const { oldPassword, newPassword, confirmPassword } = payload
  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Please provide oldPassword, newPassword, and confirmPassword.",
    );
  }


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

const updateUserDB = async (payload: IUser, userId: string) => {

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
  const userQuery = new queryBuilder(UserModel.find({ role: "user" }), query).search(userSearchField).search(userSearchField).filter().fields().sort()
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
const confirmProviderDB = async (query: Record<string, unknown>,) => {
  const providerQuery = new queryBuilder(UserModel.find({ role: "provider", isApproved: true }), query).search(userSearchField).sort()
  const { totalData } = await providerQuery.paginate(UserModel.find({ role: "provider", isApproved: true }))
  const provider = await providerQuery.modelQuery.exec()
  const currentPage = Number(query?.page) || 1;
  const limit = Number(query.limit) || 10;
  const pagination = providerQuery.calculatePagination({
    totalData,
    currentPage,
    limit,
  });
  return { pagination, provider, };
}
const requestProviderDB = async (query: Record<string, unknown>,) => {
  const providerQuery = new queryBuilder(UserModel.find({ role: "provider", isApproved: false }), query).search(userSearchField).sort()
  const { totalData } = await providerQuery.paginate(UserModel.find({ role: "provider", isApproved: false }))
  const provider = await providerQuery.modelQuery.exec()
  const currentPage = Number(query?.page) || 1;
  const limit = Number(query.limit) || 10;
  const pagination = providerQuery.calculatePagination({
    totalData,
    currentPage,
    limit,
  });
  return { pagination, provider, };
}
const approveProviderDB = async (payload: any) => {

  const provider = await UserModel.findById(payload.providerId)
  if (!provider) {
    throw new AppError(httpStatus.NOT_FOUND,
      "User not found.",
    );
  }
  if (payload.isApprove === true) {
    provider.isApproved = true
    await provider.save()

    return true


  }

  if (!payload.isApprovee) {
    await UserModel.findByIdAndDelete(payload.providerId)
    return false
  }

}

// socket user Activity
export const updateUserActivity = async (userId: string) => {
  try {
    await UserModel.findByIdAndUpdate(
      userId, { isActive: true, }, { new: true }
    );
  } catch (error) {
    console.error('Error updating user activity:', error);
  }
};
export const setUserInactive = async (userId: string) => {
  try {
    await UserModel.findByIdAndUpdate(
      userId, { isActive: false, }, { new: true }
    );
  } catch (error) {
    console.error('Error setting user inactive:', error);
  }
};

// export const userActivity = (socket: Socket, userId: string) => {
//   updateUserActivity(userId);
//   io.emit('user-status-updated', { isActive: true, lastActive: Date.now() });
// }




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
    requestProviderDB,
    confirmProviderDB,
    approveProviderDB

  }








