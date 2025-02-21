import mongoose, { Schema } from "mongoose";
import { IPendingUser, IUser, IOTP } from "./user.interface";
import bcrypt from "bcrypt";
const PendingUserSchema = new Schema<IPendingUser>(
  {
    email: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    role: { type: String, enum: ["user", "admin"], },
  },
  { timestamps: true },
);

export const PendingUserModel = mongoose.model<IPendingUser>(
  "PendingUser",
  PendingUserSchema,
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 3,
      set: (v: string) => bcrypt.hashSync(v, bcrypt.genSaltSync(12)),
      select: false,
    },
    address: { type: String, trim: true, required: false },
    city: { type: String, trim: true, required: false },
    image: { type: String, trim: true, default: "public/images/user.png", required: false },

    certificate: {
      type: [String], trim: true, required: false, default: undefined
    },
    postalCode : {
      type : String , 
      required : false
    },
    role: {
      type: String,
      enum: ["admin", "user", "provider"],
      default: "user",
    },
     accountId : {
      type : String , 
      default : null
     },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    service: {
      type: [String], trim: true, required: false,
      enum: ["Residential Cleaning", "Commercial Cleaning", "Painting", "Landscaping", "Carpentry"],
      default: undefined
    },
    isApproved :   {
       type  :Boolean ,   required: false, default: undefined
    }, 
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);



export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

const OTPSchema = new Schema<IOTP>({
  email: { type: String, required: true, trim: true },
  otp: { type: String, required: true, trim: true },
  expiresAt: { type: Date, required: true },
});

export const OTPModel = mongoose.model<IOTP>("OTP", OTPSchema);
