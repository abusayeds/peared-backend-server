import { Document, Schema, Types } from "mongoose";

export type IPayment = {
  sessionId: string;
  projectId?: any
  customerEmail: string;
  amount: number;
  currency: string;
  paymentStatus: "pending" | "completed" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
} & Document;

export type IPaymentResult = {
  transactionId: string;
  amount: number;
  userName: string;
  admin: string
  subscriptionName: string;
  createdAt: string;
};
