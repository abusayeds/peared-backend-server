import mongoose, { Schema, Document, Model } from 'mongoose';
import { TReport } from './report.interface';

const ReportSchema: Schema<TReport> = new Schema({
    bitProjectId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "BitProject"
    },
    repoterId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    details: { type: String, required: true },
    image: { type: String, required: true },
});


export const reportModel: Model<TReport> = mongoose.model<TReport>('Report', ReportSchema);