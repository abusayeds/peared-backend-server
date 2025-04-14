import { Document } from "mongoose";

export type IPendingUser = {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  role: "user" | "admin";
} & Document;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address?: string;
  city?: string;
  image?: string;
  verifiedSkillset: boolean;
  oshaCertificat?: string;
  backgroundCertificat?: string;
  certificate: string[];
  postalCode: string;
  role: "admin" | "user" | "provider";
  accountId?: string
  status: "active" | "blocked";
  service: string[];
  isApproved: boolean
  isDeleted: boolean;
}

export type IOTP = {
  email: string;
  otp: string;
  expiresAt: Date;
} & Document;
