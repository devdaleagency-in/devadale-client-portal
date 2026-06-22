import Project from '../../models/Project';
import User from '../../models/User';

export async function listProjects(userId: string, role: string) {
  let query: any = {};
  if (role === 'client') {
    query = { clientId: userId };
  } else if (role === 'team_member') {
    query = { assignedMembers: userId };
  }
  return Project.find(query).sort({ createdAt: -1 });
}

export async function getProject(id: string, userId: string, role: string) {
  const project = await Project.findById(id);
  if (!project) throw Object.assign(new Error('Project not found'), { statusCode: 404 });

  if (role === 'client' && project.clientId !== userId) {
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  }

  return project;
}

export async function createProject(data: any) {
  const project = new Project({
    _id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...data,
    lastUpdated: 'Just now',
  });
  await project.save();
  return project;
}

export async function updateProject(id: string, data: any, userId: string, role: string) {
  const project = await getProject(id, userId, role);
  Object.assign(project, data, { lastUpdated: 'Just now' });
  await project.save();
  return project;
}

export async function deleteProject(id: string) {
  const project = await Project.findById(id);
  if (!project) throw Object.assign(new Error('Project not found'), { statusCode: 404 });
  await Project.findByIdAndDelete(id);
}

export async function getProjectStats() {
  const [total, byStage, byHealth] = await Promise.all([
    Project.countDocuments(),
    Project.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]),
    Project.aggregate([
      { $group: { _id: '$health', count: { $sum: 1 } } },
    ]),
  ]);

  return { total, byStage, byHealth };
}
