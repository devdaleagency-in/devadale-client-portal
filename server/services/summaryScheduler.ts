import Project from '../models/Project';
import Summary from '../models/Summary';

const SCHEDULE_INTERVAL = 7 * 24 * 60 * 60 * 1000;

export function startSummaryScheduler() {
  console.log('Summary scheduler started (weekly auto-generation)');

  const generate = async () => {
    try {
      const projects: any[] = await Project.find().sort({ createdAt: -1 });
      if (projects.length === 0) return;

      const totalProgress = Math.round(
        projects.reduce((a: number, p) => a + (p.progress || 0), 0) / projects.length
      );
      const milestonesCompleted = projects.filter((p) => p.progress >= 100).length;
      const hasActiveProjects = projects.filter((p) => p.progress > 0 && p.progress < 100).length;
      const projectNames = projects.map((p) => p.name).filter(Boolean);

      const upcomingTasks: string[] = [];
      const blockersList: string[] = [];
      for (const p of projects) {
        if (p.nextMilestone && p.nextMilestone !== 'N/A' && p.nextMilestone !== 'TBD') {
          upcomingTasks.push(`${p.name}: ${p.nextMilestone}`);
        }
        if (p.progress < 100 && p.stage && !['Completed', 'Launched', 'Done'].includes(p.stage)) {
          blockersList.push(`${p.name} is in ${p.stage} stage (${p.progress}% complete)`);
        }
      }

      const lines: string[] = [];
      lines.push('WEEKLY PROJECT SUMMARY');
      lines.push('');
      lines.push('Hello from the DevDale team! Here is your automated weekly project update.');
      lines.push('');
      lines.push('--- OVERVIEW ---');
      lines.push(`We are currently managing ${projects.length} active project(s). Overall progress stands at ${totalProgress}% completion.`);
      if (milestonesCompleted > 0) lines.push(`${milestonesCompleted} milestone(s) completed.`);
      lines.push('');
      lines.push('--- PROJECT PROGRESS ---');
      if (projectNames.length > 0) {
        for (const name of projectNames) {
          lines.push(`• ${name}`);
        }
      }
      lines.push('');
      lines.push('--- NEXT STEPS ---');
      lines.push('• Review projects on your dashboard.');
      lines.push('• Approve any pending items.');
      lines.push('• Contact your team with questions.');
      lines.push('');
      lines.push('— The DevDale Team');

      await Summary.create({
        projectId: 'default',
        projectName: projectNames.join(', ') || 'All Projects',
        summaryText: lines.join('\n'),
        generatedAt: new Date(),
        generatedBy: 'system',
        status: 'draft',
        metadata: {
          projectProgress: totalProgress,
          milestonesCompleted,
          pendingApprovals: hasActiveProjects,
          filesUploaded: 0,
          messagesCount: 0,
        },
        upcomingTasks,
        blockers: blockersList,
        deliverablesCount: 0,
      });

      console.log(`[SummaryScheduler] Weekly summary generated (${projects.length} projects)`);
    } catch (err) {
      console.error('[SummaryScheduler] Error:', err);
    }
  };

  const tick = () => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    if ((day === 5 && hours === 18) || (day === 1 && hours === 9)) {
      generate();
    }
  };

  tick();
  setInterval(tick, 60 * 60 * 1000);
}
