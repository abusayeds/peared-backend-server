import mongoose, { Schema } from "mongoose";
import { TBitProject } from "./BitProject.interface";



const BitProjectSchema = new Schema<TBitProject>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Project'
        },
        providerId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        price: {
            type: Number,
            required: true,
        },
        serviceTime: {
            type: Number,
            required: true
        },
        Workdetails: {
            type: String,
            required: true
        },
        certificate: {
            type: [String], trim: true, required: false, default: undefined
        },
        estimatedServiceTime: {
            type: Boolean,
            required: false
        },

        startTime: {
            type: Date,
            default: Date.now
        },
        isComplete: {
            type: String,
            enum: ["pending", "running", "complete"],
            default: "pending",
        }

    },
    { timestamps: true }
);

const BitProjectModel = mongoose.model<TBitProject>("BitProject", BitProjectSchema);

export default BitProjectModel;