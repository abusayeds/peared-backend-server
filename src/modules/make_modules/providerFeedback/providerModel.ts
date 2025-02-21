import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type TProviderFeedback = {
    providerId: Types.ObjectId;
    userId: Types.ObjectId;
    rating: number;
    details: string;
    isFavourite: boolean
    createdAt: Date;
    updatedAt: Date;
}

const ProviderFeedbackSchema: Schema<TProviderFeedback> = new Schema(
    {
        providerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        details: {
            type: String,
            required: true,
            trim: true,
        },
        isFavourite: {
            type: Boolean,
            required: true,
            default : false
        }
    },
    {
        timestamps: true,
    }
);

export const providerFeedbackModel: Model<TProviderFeedback> = mongoose.model<TProviderFeedback>("ProviderFeedback", ProviderFeedbackSchema);
