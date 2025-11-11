import mongoose, { Schema, Model } from 'mongoose';
import { IPayment } from '../../types/index.js';

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User',
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      uppercase: true,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    subscriptionType: {
      type: String,
      enum: ['premium', 'enterprise'],
      required: [true, 'Subscription type is required'],
    },
    paymentMethod: {
      type: String,
      default: 'stripe',
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
    },
    stripeSessionId: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
