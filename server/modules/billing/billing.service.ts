import Invoice from '../../models/Invoice';
import Payment from '../../models/Payment';
import { createAuditLog } from '../../services/audit.service';

let invoiceCounter = Date.now();

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const num = (++invoiceCounter).toString().slice(-6);
  return `INV-${year}-${num}`;
}

export async function listInvoices(query: {
  clientId?: string;
  projectId?: string;
  status?: string;
  page?: string;
  limit?: string;
}, userId?: string, userRole?: string) {
  const filter: Record<string, any> = { deletedAt: null };
  if (userRole === 'client' && userId) {
    filter.clientId = userId;
  }
  if (query.clientId && userRole !== 'client') filter.clientId = query.clientId;
  if (query.projectId) filter.projectId = query.projectId;
  if (query.status) filter.status = query.status;

  const page = parseInt(query.page || '1', 10);
  const limit = Math.min(parseInt(query.limit || '20', 10), 100);
  const skip = (page - 1) * limit;

  const now = new Date();
  await Invoice.updateMany(
    { deletedAt: null, status: { $in: ['sent', 'viewed', 'partially_paid'] }, dueDate: { $lt: now } },
    { $set: { status: 'overdue' } },
  );

  const [invoices, total] = await Promise.all([
    Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Invoice.countDocuments(filter),
  ]);

  return { invoices, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getInvoice(id: string, userId?: string, userRole?: string) {
  const invoice = await Invoice.findOne({ _id: id, deletedAt: null });
  if (!invoice) throw Object.assign(new Error('Invoice not found'), { statusCode: 404 });
  if (userRole === 'client' && userId && invoice.clientId !== userId) {
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  }
  if (userRole === 'client' && invoice.status === 'sent') {
    invoice.status = 'viewed';
    invoice.viewedAt = new Date();
    await invoice.save();
  }
  return invoice;
}

export async function createInvoice(data: any, userId: string, userRole: string) {
  const invoiceNumber = generateInvoiceNumber();
  const invoice = await Invoice.create({
    _id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    invoiceNumber,
    clientId: data.clientId,
    projectId: data.projectId,
    amount: data.amount,
    tax: data.tax || 0,
    cgst: data.cgst || 0,
    sgst: data.sgst || 0,
    igst: data.igst || 0,
    total: data.total,
    currency: data.currency || 'INR',
    dueDate: new Date(data.dueDate),
    issuedDate: new Date(),
    status: 'draft',
    notes: data.notes || '',
    lineItems: data.lineItems || [],
  });

  await createAuditLog({
    userId,
    userRole,
    action: 'create',
    entity: 'Invoice',
    entityId: invoice._id,
    description: `Created invoice ${invoice.invoiceNumber} for ${data.amount} ${data.currency || 'INR'}`,
  });

  return invoice;
}

export async function updateInvoice(id: string, data: any, userId: string, userRole: string) {
  const invoice = await getInvoice(id, userId, userRole);

  if (data.status === 'cancelled' && (invoice.status === 'paid' || invoice.status === 'partially_paid')) {
    throw Object.assign(new Error('Cannot cancel a paid or partially paid invoice'), { statusCode: 400 });
  }

  const oldStatus = invoice.status;
  Object.assign(invoice, data);
  if (data.status === 'paid') invoice.paidAt = new Date();
  await invoice.save();

  await createAuditLog({
    userId,
    userRole,
    action: 'update',
    entity: 'Invoice',
    entityId: invoice._id,
    description: `Updated invoice ${invoice.invoiceNumber}: status ${oldStatus} -> ${invoice.status}`,
    changes: { status: { from: oldStatus, to: invoice.status } },
  });

  return invoice;
}

export async function deleteInvoice(id: string, userId: string, userRole: string) {
  const invoice = await getInvoice(id, userId, userRole);
  if (invoice.status === 'paid') {
    throw Object.assign(new Error('Cannot delete a paid invoice'), { statusCode: 400 });
  }
  invoice.deletedAt = new Date();
  invoice.status = 'cancelled';
  await invoice.save();

  await createAuditLog({
    userId,
    userRole,
    action: 'delete',
    entity: 'Invoice',
    entityId: invoice._id,
    description: `Deleted invoice ${invoice.invoiceNumber}`,
  });
}

export async function recordPayment(data: any, userId: string, userRole: string) {
  const invoice = await getInvoice(data.invoiceId, userId, userRole);

  if (invoice.status === 'paid') {
    throw Object.assign(new Error('Invoice is already paid'), { statusCode: 400 });
  }

  const payment = await Payment.create({
    _id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    invoiceId: data.invoiceId,
    clientId: invoice.clientId,
    amount: data.amount,
    currency: data.currency || invoice.currency,
    gateway: data.gateway,
    gatewayTxnId: data.gatewayTxnId || '',
    status: data.status || 'completed',
    paidAt: data.status === 'completed' ? new Date() : undefined,
  });

  if (payment.status === 'completed') {
    const totalPaidResult = await Payment.aggregate([
      { $match: { invoiceId: invoice._id, status: 'completed', deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalPaid = totalPaidResult[0]?.total || 0;
    const remaining = (invoice.total || invoice.amount) - totalPaid;
    invoice.status = remaining <= 0 ? 'paid' : 'partially_paid';
    if (remaining <= 0) invoice.paidAt = payment.paidAt;
    await invoice.save();
  }

  await createAuditLog({
    userId,
    userRole,
    action: 'payment',
    entity: 'Payment',
    entityId: payment._id,
    description: `Payment of ${data.amount} ${data.currency || invoice.currency} via ${data.gateway} for invoice ${invoice.invoiceNumber}`,
  });

  return { payment, invoice };
}

export async function getInvoicePayments(invoiceId: string) {
  return Payment.find({ invoiceId, deletedAt: null }).sort({ createdAt: -1 });
}

export async function getBillingStats() {
  const [totalInvoices, paidInvoices, overdueInvoices, partiallyPaidInvoices, totalRevenue] = await Promise.all([
    Invoice.countDocuments({ deletedAt: null }),
    Invoice.aggregate([
      { $match: { status: 'paid', deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Invoice.countDocuments({ status: 'overdue', deletedAt: null }),
    Invoice.countDocuments({ status: 'partially_paid', deletedAt: null }),
    Payment.aggregate([
      { $match: { status: 'completed', deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  return {
    totalInvoices,
    paidInvoices: paidInvoices[0]?.count || 0,
    totalPaidAmount: paidInvoices[0]?.total || 0,
    overdueInvoices,
    partiallyPaidInvoices,
    totalRevenue: totalRevenue[0]?.total || 0,
  };
}
