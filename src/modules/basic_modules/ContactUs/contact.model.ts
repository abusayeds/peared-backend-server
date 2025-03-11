import mongoose, { Schema, Model, Types } from "mongoose";
import { TContact } from "./contact-interface";


const ContactSchema: Schema<TContact> = new mongoose.Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    },
);

export const ContactkModel: Model<TContact> = mongoose.model<TContact>("Contact", ContactSchema);
