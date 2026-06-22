import mongoose, { Schema } from 'mongoose';

export interface IPayment {
  _id: string;
  invoiceId: string;
  clientId: string;
  amount: number;
  currency: string;
  gateway: 'razorpay' | 'stripe' | 'paypal' | 'bank_transfer' | 'cash' | 'other';
  gatewayTxnId: string;
  gatewayOrderId?: string;
  gatewayStatus: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  paidAt?: Date;
  refundedAt?: Date;
  metadata: Record<string, any>;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    _id: { type: String, required: true },
    invoiceId: { type: String, ref: 'Invoice', required: true, index: true },
    clientId: { type: String, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'paypal', 'bank_transfer', 'cash', 'other'],
      required: true,
    },
    gatewayTxnId: { type: String, default: '' },
    gatewayOrderId: { type: String },
    gatewayStatus: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: '' },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false }
);

paymentSchema.index({ gatewayTxnId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ invoiceId: 1, status: 1 });
paymentSchema.index({ clientId: 1, createdAt: -1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);
