import mongoose, { Schema } from "mongoose";
export type TCatagory = {
    catagory: string
}


const catagorySchema = new Schema<TCatagory>(
    {
        catagory: {
            type: String,
            required: true,
        },

    },
    { timestamps: true }
);
const catagoryModel = mongoose.model<TCatagory>("catagory", catagorySchema);
export default catagoryModel;