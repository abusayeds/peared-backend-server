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
import BitProjectModel from "../../make_modules/BitProject/BitProject.model";
import { providerFeedbackModel } from "../../make_modules/providerFeedback/providerModel";

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
  // Public register is for clients only; providers use join-provider
  const result = await UserModel.create({
    ...payload,
    role: "user",
  })
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

const updateUserDB = async (payload: any, userId: string) => {

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,
      "User not found.",
    );
  }

  if (typeof payload.service === "string") {
    payload.service = payload.service.split(",").map((s: string) => s.trim()).filter(Boolean);
  }
  if (typeof payload.education === "string") {
    payload.education = payload.education.split(",").map((s: string) => s.trim()).filter(Boolean);
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
      userId,
      { isActive: true, lastSeen: new Date() },
      { new: true }
    );
  } catch (error) {
    console.error("Error updating user activity:", error);
  }
};
export const setUserInactive = async (userId: string) => {
  try {
    await UserModel.findByIdAndUpdate(
      userId,
      { isActive: false, lastSeen: new Date() },
      { new: true }
    );
  } catch (error) {
    console.error("Error setting user inactive:", error);
  }
};

// export const userActivity = (socket: Socket, userId: string) => {
//   updateUserActivity(userId);
//   io.emit('user-status-updated', { isActive: true, lastActive: Date.now() });
// }




const publicProvidersDB = async (query: Record<string, unknown>) => {
  const filter: any = {
    role: "provider",
    isApproved: true,
    isDeleted: { $ne: true },
    status: { $ne: "blocked" },
  };

  const searchTerm = typeof query.searchTerm === "string" ? query.searchTerm.trim() : "";
  const service = typeof query.service === "string" ? query.service.trim() : "";

  if (service) {
    filter.service = { $regex: service, $options: "i" };
  }

  let mongoQuery = UserModel.find(filter).select(
    "name image city postalCode service education bio verifiedSkillset createdAt"
  );

  if (searchTerm) {
    mongoQuery = mongoQuery.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { city: { $regex: searchTerm, $options: "i" } },
        { service: { $regex: searchTerm, $options: "i" } },
        { education: { $regex: searchTerm, $options: "i" } },
        { bio: { $regex: searchTerm, $options: "i" } },
      ],
    });
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 12;
  const skip = (page - 1) * limit;
  const totalData = await UserModel.countDocuments(mongoQuery.getFilter());
  const providers = await mongoQuery.sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

  const withStats = await Promise.all(
    providers.map(async (p: any) => {
      const completedJobs = await BitProjectModel.countDocuments({
        providerId: p._id,
        isComplete: "complete",
      });
      const reviews = await providerFeedbackModel.find({ providerId: p._id });
      const ratingCount = reviews.length;
      const averageRating =
        ratingCount > 0
          ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingCount
          : 0;
      return {
        ...p,
        completedJobs,
        averageRating: Number(averageRating.toFixed(1)),
        ratingCount,
      };
    })
  );

  return {
    pagination: {
      totalData,
      currentPage: page,
      limit,
      totalPage: Math.ceil(totalData / limit) || 1,
    },
    providers: withStats,
  };
};

const publicProviderDetailsDB = async (providerId: string) => {
  const provider: any = await UserModel.findOne({
    _id: providerId,
    role: "provider",
    isApproved: true,
    isDeleted: { $ne: true },
  }).select(
    "name image city postalCode address service education bio verifiedSkillset createdAt isActive"
  );

  if (!provider) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider not found");
  }

  const completedJobs = await BitProjectModel.countDocuments({
    providerId,
    isComplete: "complete",
  });
  const reviews = await providerFeedbackModel
    .find({ providerId })
    .populate({ path: "userId", select: "name image" })
    .sort({ createdAt: -1 })
    .limit(20);
  const ratingCount = reviews.length;
  const averageRating =
    ratingCount > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingCount
      : 0;

  // Jobs done per service/category (from completed bit projects' project category)
  const completedBits: any[] = await BitProjectModel.find({
    providerId,
    isComplete: "complete",
  }).populate({ path: "projectId", select: "projectCategory" });

  const categoryMap: Record<string, number> = {};
  completedBits.forEach((bit) => {
    const cat = bit?.projectId?.projectCategory || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  return {
    provider,
    completedJobs,
    averageRating: Number(averageRating.toFixed(1)),
    ratingCount,
    reviews,
    jobsByCategory: Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count,
    })),
  };
};

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
    approveProviderDB,
    publicProvidersDB,
    publicProviderDetailsDB

  }








