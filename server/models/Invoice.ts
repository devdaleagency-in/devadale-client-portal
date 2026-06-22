import mongoose, { Schema } from 'mongoose';

export interface IInvoice {
  _id: string;
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  issuedDate: Date;
  paidAt?: Date;
  viewedAt?: Date;
  notes: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    _id: { type: String, required: true },
    clientId: { type: String, ref: 'User', required: true, index: true },
    projectId: { type: String, ref: 'Project', index: true },
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    amount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    dueDate: { type: Date, required: true },
    issuedDate: { type: Date, default: Date.now },
    paidAt: { type: Date },
    viewedAt: { type: Date },
    notes: { type: String, default: '' },
    lineItems: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        amount: { type: Number, required: true },
      },
    ],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false }
);

invoiceSchema.index({ status: 1, deletedAt: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ clientId: 1, status: 1 });

export default mongoose.model<IInvoice>('Invoice', invoiceSchema);
