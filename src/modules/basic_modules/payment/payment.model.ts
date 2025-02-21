import mongoose, { Schema, Model } from "mongoose";
import { IPayment } from "./payment.interface"; // Adjust the import path as necessary


const paymentSchema: Schema<IPayment> = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    projectId: {
      type: String,
      required: false,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "usd",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export const PaymentModel: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);

const paymentHistorySchema = new mongoose.Schema(
  {
    historyName: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["withdraw", "deposit"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const paymentHistoryModel =  mongoose.model("PaymentHistory", paymentHistorySchema);
