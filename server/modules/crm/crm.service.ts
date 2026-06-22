import Lead from '../../models/Lead';
import { createAuditLog } from '../../services/audit.service';

export async function listLeads(query: {
  stage?: string;
  source?: string;
  assignedTo?: string;
  page?: string;
  limit?: string;
}) {
  const filter: any = { deletedAt: null };
  if (query.stage) filter.stage = query.stage;
  if (query.source) filter.source = query.source;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;

  const page = parseInt(query.page || '1', 10);
  const limit = Math.min(parseInt(query.limit || '20', 10), 100);
  const skip = (page - 1) * limit;

  const [leads, total] = await Promise.all([
    Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    (Lead as any).countDocuments(filter).exec(),
  ]);

  return { leads, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getLead(id: string) {
  const lead = await Lead.findOne({ _id: id, deletedAt: null });
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
  return lead;
}

export async function createLead(data: any, userId: string, userRole: string) {
  const lead = await Lead.create({
    _id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...data,
  });

  await createAuditLog({
    userId,
    userRole,
    action: 'create',
    entity: 'Lead',
    entityId: lead._id,
    description: `Created lead: ${lead.name} (${lead.company})`,
  });

  return lead;
}

export async function updateLead(id: string, data: any, userId: string, userRole: string) {
  const lead = await Lead.findOne({ _id: id, deletedAt: null });
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 });

  const changes: Record<string, { from: any; to: any }> = {};
  for (const key of Object.keys(data)) {
    if ((lead as any)[key] !== undefined && (lead as any)[key] !== data[key]) {
      changes[key] = { from: (lead as any)[key], to: data[key] };
    }
  }

  Object.assign(lead, data);
  await lead.save();

  await createAuditLog({
    userId,
    userRole,
    action: 'update',
    entity: 'Lead',
    entityId: lead._id,
    description: `Updated lead: ${lead.name}`,
    changes,
  });

  return lead;
}

export async function deleteLead(id: string, userId: string, userRole: string) {
  const lead = await Lead.findOne({ _id: id, deletedAt: null });
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 });

  lead.deletedAt = new Date();
  await lead.save();

  await createAuditLog({
    userId,
    userRole,
    action: 'delete',
    entity: 'Lead',
    entityId: lead._id,
    description: `Deleted lead: ${lead.name}`,
  });
}

export async function getPipelineStats() {
  const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  const stats = await Promise.all(
    stages.map(async (stage) => {
      const count = await (Lead as any).countDocuments({ stage, deletedAt: null }).exec();
      const totalValue = await Lead.aggregate([
        { $match: { stage, deletedAt: null } },
        { $group: { _id: null, total: { $sum: '$value' } } },
      ]);
      return { stage, count, totalValue: totalValue[0]?.total || 0 };
    })
  );
  return stats;
}
