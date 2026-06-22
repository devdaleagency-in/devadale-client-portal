import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize, adminOnly, adminOrTeamMember } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import * as projectsController from './projects.controller';
import { createProjectSchema, updateProjectSchema } from './projects.validators';

const router = Router();

router.use(authenticate);

router.get('/projects/stats', authorize('admin', 'team_member'), projectsController.getProjectStats);
router.get('/projects', projectsController.listProjects);
router.get('/projects/:id', projectsController.getProject);
router.post('/projects', adminOrTeamMember, validate(createProjectSchema), projectsController.createProject);
router.put('/projects/:id', validate(updateProjectSchema), projectsController.updateProject);
router.delete('/projects/:id', adminOnly, projectsController.deleteProject);

export default router;
