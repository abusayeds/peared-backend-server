"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDelete = exports.userService = exports.saveOTP = exports.findUserById = exports.findUserByEmail = exports.generateOTP = exports.getStoredOTP = exports.hashPassword = exports.generateToken = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const queryBuilder_1 = __importDefault(require("../../../builder/queryBuilder"));
const config_1 = require("../../../config");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const sendEmail_1 = require("./sendEmail");
const user_model_1 = require("./user.model");
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET_KEY, { expiresIn: "7d" });
};
exports.generateToken = generateToken;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return bcrypt_1.default.hash(password, 12);
});
exports.hashPassword = hashPassword;
const getStoredOTP = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const otpRecord = yield user_model_1.OTPModel.findOne({ email });
    return otpRecord ? otpRecord.otp : null;
});
exports.getStoredOTP = getStoredOTP;
const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);
    return otp;
};
exports.generateOTP = generateOTP;
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.UserModel.findOne({ email }).select('+password');
});
exports.findUserByEmail = findUserByEmail;
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.UserModel.findById(id);
});
exports.findUserById = findUserById;
const saveOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.OTPModel.findOneAndUpdate({ email }, { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }, { upsert: true, new: true });
});
exports.saveOTP = saveOTP;
// logic finctonality
const createUserDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserRegistered = yield user_model_1.UserModel.findOne({ email: payload.email });
    const { name, email, password, confirmPassword } = payload;
    if (isUserRegistered) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You already have an account.");
    }
    if (password !== confirmPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Passwords do not match');
    }
    const result = yield user_model_1.UserModel.create(payload);
    // await PendingUserModel.findOneAndUpdate(
    //   { email }, { name, email, password, confirmPassword, }, { upsert: true },
    // );
    // const otp = generateOTP();
    // await saveOTP(email, otp);
    // await sendOTPEmail(email, otp);
    // const token = jwt.sign({ email }, JWT_SECRET_KEY as string, { expiresIn: "7d", });
    return result;
});
const joinProviderDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserRegistered = yield user_model_1.UserModel.findOne({ email: payload.email });
    const { password, confirmPassword } = payload;
    if (isUserRegistered) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You already have an account.");
    }
    if (password !== confirmPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Passwords do not match');
    }
    const result = yield user_model_1.UserModel.create(Object.assign(Object.assign({}, payload), { isApproved: false }));
    return result;
});
const loginDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserByEmail)(payload.email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This account does not exist.");
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "your account is deleted by admin.");
    }
    const isPasswordValid = yield bcrypt_1.default.compare(payload.password, user.password);
    if (!isPasswordValid) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Wrong password!");
    }
    return user;
});
const forgotPasswordDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserByEmail)(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This account does not exist.");
    }
    const otp = (0, exports.generateOTP)();
    yield (0, exports.saveOTP)(email, otp);
    (0, sendEmail_1.sendEmail)(otp, email);
});
const verifyForgotPasswordOtpDB = (otp, email) => __awaiter(void 0, void 0, void 0, function* () {
    const otpRecord = yield user_model_1.OTPModel.findOne({ email });
    if (!otpRecord) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    const currentTime = new Date();
    if (otpRecord.expiresAt < currentTime) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "OTP has expired");
    }
    if (otpRecord.otp !== otp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Wrong OTP");
    }
});
const resendOtpDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const newOTP = (0, exports.generateOTP)();
    yield (0, exports.saveOTP)(email, newOTP);
    yield (0, sendEmail_1.sendEmail)(newOTP, email);
});
const resetPasswordDB = (payload, email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserByEmail)(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    if (payload.confirmPassword !== payload.password) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Passwords do not match');
    }
    yield user_model_1.UserModel.findOneAndUpdate({ email: email }, { password: payload.password }, { new: true });
});
const changePasswordDB = (payload, email) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword, confirmPassword } = payload;
    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Please provide oldPassword, newPassword, and confirmPassword.");
    }
    const user = yield (0, exports.findUserByEmail)(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    const isMatch = yield bcrypt_1.default.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Old password is incorrect.");
    }
    if (newPassword !== confirmPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "New password and confirm password do not match.");
    }
    yield user_model_1.UserModel.findOneAndUpdate({ email: email }, { password: newPassword }, { new: true });
});
const updateUserDB = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserById)(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    const result = yield user_model_1.UserModel.findByIdAndUpdate(userId, Object.assign({}, payload), { new: true });
    return result;
});
const myProfileDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserById)(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    return user;
});
const allUserDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuery = new queryBuilder_1.default(user_model_1.UserModel.find({ role: "user" }), query).sort();
    const { totalData } = yield userQuery.paginate(user_model_1.UserModel.find({ role: "user" }));
    const user = yield userQuery.modelQuery.exec();
    const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = userQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, user, };
});
const confirmProviderDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const providerQuery = new queryBuilder_1.default(user_model_1.UserModel.find({ role: "provider", isApproved: true }), query).sort();
    const { totalData } = yield providerQuery.paginate(user_model_1.UserModel.find({ role: "provider", isApproved: true }));
    const provider = yield providerQuery.modelQuery.exec();
    const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = providerQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, provider, };
});
const requestProviderDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const providerQuery = new queryBuilder_1.default(user_model_1.UserModel.find({ role: "provider", isApproved: false }), query).sort();
    const { totalData } = yield providerQuery.paginate(user_model_1.UserModel.find({ role: "provider", isApproved: false }));
    const provider = yield providerQuery.modelQuery.exec();
    const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = providerQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, provider, };
});
const approveProviderDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = yield user_model_1.UserModel.findById(payload.providerId);
    if (!provider) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    if (payload.isApprove === true) {
        provider.isApproved = true;
        yield provider.save();
        console.log(provider, 'true log');
        return true;
    }
    if (!payload.isApprovee) {
        yield user_model_1.UserModel.findByIdAndDelete(payload.providerId);
        return false;
    }
});
exports.userService = {
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
};
const userDelete = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.UserModel.findByIdAndUpdate(id, { isDeleted: true });
});
exports.userDelete = userDelete;
