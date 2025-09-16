import mongoose, { Schema } from "mongoose";
import { TProject } from "./project-interface";


const projectSchema = new Schema<TProject>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        postCode: { type: String, required: true, trim: true, match: [/^\d{5}$/, "Post Code must be exactly 5 digits"] },
        locationType: { type: String, enum: ["Home", "Business"], required: true },
        time: {
            type: String,
            enum: ["Urgent(1 - 2 days)", "Within 2 weeks", "More than 2 weeks", "Not sure - still planning"],
            required: true
        },
        priceRange: { type: String, required: true, trim: true },
        image: { type: String, required: true },
        projectName: { type: String, required: true, trim: true },
        projectCategory: { type: String, required: true, trim: true },
        workDetails: {
            type: String,
            required: true,
            trim: true
        },
        backgroundCertificate: { type: Boolean, required: false, },
        oshaCertificate: { type: Boolean, required: false, },
        payment: {
            type: Boolean,
            default: true
        },
        isApprove: {
            type: Boolean,
            default: false
        },
        isComplete: { type: Boolean, default: false },
        expiredDate: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    },
    { timestamps: true }
);
const projectModel = mongoose.model<TProject>("Project", projectSchema);
export default projectModel;