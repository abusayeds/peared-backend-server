import mongoose, { Types } from "mongoose";


const providerSchema = new mongoose.Schema({
  providerId: {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
  amount: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    enum: ['withdraw', 'paid'],
    default: 'withdraw'
  }
}, {
  timestamps: true
});

export const withdrawModel = mongoose.model('withdraw', providerSchema);


