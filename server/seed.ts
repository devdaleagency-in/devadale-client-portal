import './utils/config';
import User from './models/User';
import connectMongoDB from './mongodb';
import Deadline from './models/Deadline';

const ADMIN_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTGfS3cEGwSdGHDpZygaZHGvsFDG9hJ_mxMdfuCR9-6-rHjngZY3OJTrZVbAe1naOlohIYGfK15ABf9PYuOClXXBjsA6Oir3ftkGivisjWfUXralh-xgdoaaybgiL3dvTZhkmNEze9bcCAZeVBfArYUPUZNplkkgrowcQFi3u-mMPOzCWyL7JoBCxT3eulu3aBJ1zk_H6Xa4Cu7zVJe4Zagkpr2h7BVhiIIiqr8U2iNAIHQ8KIvpKdsCCuyRWsyZ0EhhxoiGvgcqc';
const CLIENT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTGfS3cEGwSdGHDpZygaZHGvsFDG9hJ_mxMdfuCR9-6-rHjngZY3OJTrZVbAe1naOlohIYGfK15ABf9PYuOClXXBjsA6Oir3ftkGivisjWfUXralh-xgdoaaybgiL3dvTZhkmNEze9bcCAZeVBfArYUPUZNplkkgrowcQFi3u-mMPOzCWyL7JoBCxT3eulu3aBJ1zk_H6Xa4Cu7zVJe4Zagkpr2h7BVhiIIiqr8U2iNAIHQ8KIvpKdsCCuyRWsyZ0EhhxoiGvgcqc';

async function seedUsers() {
  await connectMongoDB();

  const upsertUser = async (data: any) => {
    const existing = await User.findById(data._id);
    if (existing) {
      const { password, ...rest } = data;
      Object.assign(existing, rest);
      await existing.save();
      console.log(`Updated user: ${data.username}`);
    } else {
      await User.create(data);
      console.log(`Created user: ${data.username}`);
    }
  };

  await upsertUser({
    _id: 'user-1',
    name: 'Admin User',
    username: 'admin',
    email: 'admin@devdale.com',
    password: 'Admin123!',
    role: 'admin',
    avatarUrl: ADMIN_AVATAR,
    title: 'Corporate Director',
    isEmailVerified: true,
    isActive: true,
  });

  await upsertUser({
    _id: 'user-2',
    name: 'Sarah Chen',
    username: 'sarah',
    email: 'sarah@devdale.com',
    password: 'Client456!',
    role: 'client',
    avatarUrl: CLIENT_AVATAR,
    title: 'Engineering & PM Director',
    isEmailVerified: true,
    isActive: true,
  });

  console.log('Users seeded successfully');

  await Deadline.deleteMany({});
  
  const today = new Date();
  const overdueDate = new Date(today);
  overdueDate.setDate(today.getDate() - 2);
  
  const tomorrowDate = new Date(today);
  tomorrowDate.setDate(today.getDate() + 1);

  await Deadline.insertMany([
    {
      task: 'Finalize UX Research',
      dueDate: overdueDate,
      projectId: 'proj-1',
      project: 'Aether Fintech',
      clientId: 'user-2',
      assignee: 'Mark Thompson',
      priority: 'high',
      status: 'overdue'
    },
    {
      task: 'Client Approval Meeting',
      dueDate: today,
      projectId: 'proj-1',
      project: 'Aether Fintech',
      clientId: 'user-2',
      assignee: 'Sarah Chen',
      priority: 'critical',
      status: 'today'
    },
    {
      task: 'Deploy QA Environment',
      dueDate: tomorrowDate,
      projectId: 'proj-2',
      project: 'GreenHorizon ERP',
      clientId: 'user-2',
      assignee: 'Admin User',
      priority: 'medium',
      status: 'this-week'
    }
  ]);
  console.log('Deadlines seeded successfully');
  process.exit(0);
}

seedUsers().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
