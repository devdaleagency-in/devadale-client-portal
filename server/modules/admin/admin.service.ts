import User from '../../models/User';
import Project from '../../models/Project';
import Invoice from '../../models/Invoice';
import Payment from '../../models/Payment';
import PortalSettings from '../../models/PortalSettings';
import Session from '../../models/Session';

export async function listTeamMembers() {
  return User.find({ role: { $in: ['admin', 'team_member'] } })
    .select('-password')
    .sort({ createdAt: -1 });
}

export async function listClients(query: { page?: string; limit?: string; search?: string }) {
  const filter: Record<string, any> = { role: 'client' };
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { username: { $regex: query.search, $options: 'i' } },
    ];
  }

  const page = parseInt(query.page || '1', 10);
  const limit = Math.min(parseInt(query.limit || '20', 10), 100);
  const skip = (page - 1) * limit;

  const [clients, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { clients, total, page, totalPages: Math.ceil(total / limit) };
}

export async function updateClientStatus(clientId: string, isActive: boolean) {
  const user = await User.findById(clientId);
  if (!user || user.role !== 'client') {
    throw Object.assign(new Error('Client not found'), { statusCode: 404 });
  }
  user.isActive = isActive;
  await user.save();

  if (!isActive) {
    await Session.deleteMany({ userId: clientId });
  }

  return user;
}

export async function getPortalSettings() {
  let settings = await PortalSettings.findOne();
  if (!settings) {
    settings = await PortalSettings.create({});
  }
  return settings;
}

export async function updatePortalSettings(data: {
  clientPortalEnabled?: boolean;
  whiteLabelMode?: boolean;
  agencyName?: string;
  clientWelcomeMessage?: string;
}) {
  let settings = await PortalSettings.findOne();
  if (!settings) {
    settings = new PortalSettings();
  }
  if (data.clientPortalEnabled !== undefined) settings.clientPortalEnabled = data.clientPortalEnabled;
  if (data.whiteLabelMode !== undefined) settings.whiteLabelMode = data.whiteLabelMode;
  if (data.agencyName !== undefined) settings.agencyName = data.agencyName;
  if (data.clientWelcomeMessage !== undefined) settings.clientWelcomeMessage = data.clientWelcomeMessage;
  settings.updatedAt = new Date();
  await settings.save();
  return settings;
}

export async function getDashboardStats() {
  const [totalClients, activeProjects, totalInvoices, totalRevenue] = await Promise.all([
    User.countDocuments({ role: 'client', isActive: true }),
    Project.countDocuments(),
    Invoice.countDocuments({ status: { $ne: 'cancelled' }, deletedAt: null }),
    Payment.aggregate([
      { $match: { status: 'completed', deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  return {
    totalClients,
    activeProjects,
    totalInvoices,
    totalRevenue: totalRevenue[0]?.total || 0,
  };
}
