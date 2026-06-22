import './utils/config';
import connectMongoDB from './mongodb';
import Project from './models/Project';
import Conversation from './models/Conversation';
import Message from './models/Message';
async function seedData() {
  await connectMongoDB();

  // Seed projects
  const projectsData = [
    {
      _id: 'proj-1',
      name: 'Aether Fintech',
      client: 'Aether Fintech',
      clientId: 'user-2',
      stage: 'Design System',
      health: 'healthy' as const,
      progress: 75,
      nextMilestone: 'Tokenomics Design v2',
      nextMilestoneDate: 'Friday, Jun 5',
      iconName: 'Compass',
      team: [{ name: 'Mark Thompson', avatarUrl: '' }],
      description: 'Enterprise Design Token and System structure for secure financial ledgers.',
      lastUpdated: '2 hours ago',
    },
    {
      _id: 'proj-2',
      name: 'GreenHorizon ERP',
      client: 'GreenHorizon ERP',
      clientId: 'user-2',
      stage: 'Frontend Dev',
      health: 'healthy' as const,
      progress: 40,
      nextMilestone: 'Dashboard integration',
      nextMilestoneDate: 'Wednesday, Jun 10',
      iconName: 'Leaf',
      team: [{ name: 'Admin User', avatarUrl: '' }],
      description: 'Sustainable resource planning system using solar inventory optimization pipelines.',
      lastUpdated: '5 hours ago',
    },
    {
      _id: 'proj-3',
      name: 'Neural Labs AI',
      client: 'Neural Labs AI',
      clientId: 'user-2',
      stage: 'Strategic Audit',
      health: 'warning' as const,
      progress: 90,
      nextMilestone: 'Security audit signing',
      nextMilestoneDate: 'Thursday, Jun 4',
      iconName: 'Cpu',
      team: [{ name: 'Mark Thompson', avatarUrl: '' }],
      description: 'Deep network verification checks and API leakage reviews.',
      lastUpdated: '1 day ago',
    },
    {
      _id: 'proj-4',
      name: 'SwiftShop E-com',
      client: 'SwiftShop E-com',
      clientId: 'user-2',
      stage: 'QA Testing',
      health: 'critical' as const,
      progress: 95,
      nextMilestone: 'Production launch validation',
      nextMilestoneDate: 'Tomorrow',
      iconName: 'ShoppingCart',
      team: [
        { name: 'Admin User', avatarUrl: '' },
        { name: 'Mark Thompson', avatarUrl: '' },
      ],
      description: 'Hyper-optimized headless payment gateway with ultra-low latency checkout routing.',
      lastUpdated: 'Just now',
    },
    {
      _id: 'proj-focus',
      name: 'DevDale Agency',
      client: 'DevDale Agency',
      clientId: 'user-2',
      stage: 'UI/UX Design',
      health: 'healthy' as const,
      progress: 65,
      nextMilestone: 'V1 Prototype',
      nextMilestoneDate: 'Due Friday, Oct 27',
      iconName: 'Palette',
      team: [
        { name: 'Mark Thompson', avatarUrl: '' },
        { name: 'Admin User', avatarUrl: '' },
      ],
      description: 'Comprehensive design system and operational brand visual guidelines for high-end workspace tools.',
      lastUpdated: 'Yesterday',
    },
  ];

  for (const proj of projectsData) {
    const existing = await Project.findById(proj._id);
    if (existing) {
      await Project.findByIdAndUpdate(proj._id, proj);
      console.log(`Updated project: ${proj.name}`);
    } else {
      await Project.create(proj as any);
      console.log(`Created project: ${proj.name}`);
    }
  }

  // Seed conversation for chat
  const existingConv = await Conversation.findOne({ projectId: 'proj-focus' });
  if (!existingConv) {
    const conv = await Conversation.create({
      projectId: 'proj-focus',
      projectName: 'DevDale Agency',
      clientId: 'user-2',
      clientName: 'Sarah Chen',
      adminIds: ['user-1'],
      lastMessage: {
        content: 'Hi! I had a question about the V1 prototype timeline.',
        senderId: 'user-2',
        senderRole: 'client',
        timestamp: new Date(),
      },
    });

    await Message.create({
      senderId: 'user-2',
      senderName: 'Sarah Chen',
      senderRole: 'client',
      conversationId: conv._id.toString(),
      projectId: 'proj-focus',
      content: 'Hi! I had a question about the V1 prototype timeline. When can we expect the first review?',
      deliveryStatus: 'sent',
    });

    await Message.create({
      senderId: 'user-1',
      senderName: 'Admin User',
      senderRole: 'admin',
      conversationId: conv._id.toString(),
      projectId: 'proj-focus',
      content: 'Hi Sarah! The V1 prototype is on track for Friday, Oct 27. I will share the Figma link with you by Thursday for early feedback.',
      deliveryStatus: 'read',
      isRead: true,
    });

    console.log('Created conversation with messages');
  } else {
    console.log('Conversation already exists');
  }

  console.log('Data seeded successfully');
  process.exit(0);
}

seedData().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
