import React, { useState } from 'react';
import { Project } from '../types';
import { X, Sparkles } from 'lucide-react';

type ProjectStage = string;
type ProjectHealth = 'healthy' | 'warning' | 'critical';

interface NewProjectModalProps {
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id'>) => void;
}

export default function NewProjectModal({ onClose, onSubmit }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [stage, setStage] = useState<ProjectStage>('Discovery');
  const [health, setHealth] = useState<ProjectHealth>('healthy');
  const [nextMilestone, setNextMilestone] = useState('');
  const [nextMilestoneDate, setNextMilestoneDate] = useState('');
  const [iconName, setIconName] = useState('palette');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('UI/UX Design');
  const [otherIndustry, setOtherIndustry] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (industry === 'Others' && !otherIndustry.trim()) {
      alert('Please specify your category/service when selecting "Others"');
      return;
    }

    const finalIndustry = industry === 'Others' ? otherIndustry : industry;

    onSubmit({
      name,
      stage,
      health,
      client: name,
      description,
      progress: stage === 'Discovery' ? 15 : stage === 'UI/UX Design' ? 45 : stage === 'Development' ? 70 : stage === 'Testing & QA' ? 85 : 100,
      nextMilestone: nextMilestone || 'Milestone Discovery Call',
      nextMilestoneDate: nextMilestoneDate || 'Oct 23',
      lastUpdated: 'Just now',
      iconName,
      team: [
        { name: 'Sarah Chen', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTGfS3cEGwSdGHDpZygaZHGvsFDG9hJ_mxMdfuCR9-6-rHjngZY3OJTrZVbAe1naOlohIYGfK15ABf9PYuOClXXBjsA6Oir3ftkGivisjWfUXralh-xgdoaaybgiL3dvTZhkmNEze9bcCAZeVBfArYUPUZNplkkgrowcQFi3u-mMPOzCWyL7JoBCxT3eulu3aBJ1zk_H6Xa4Cu7zVJe4Zagkpr2h7BVhiIIiqr8U2iNAIHQ8KIvpKdsCCuyRWsyZ0EhhxoiGvgcqc' }
      ]
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs uppercase tracking-wider">Initialize Project Pipeline</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">

          {/* Client / Project Name */}
          <div className="space-y-1">
            <label htmlFor="new-project-name" className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Project / Client Name</label>
            <input
              id="new-project-name"
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              placeholder="e.g. Vertex Crypto Platform"
            />
          </div>

          {/* Category / Service Type */}
          <div className="space-y-1">
            <label htmlFor="new-project-industry" className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Project Category / Service Type</label>
            <select
              id="new-project-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="Web Development">Web Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Mobile App Development">Mobile App Development</option>
              <option value="Branding & Identity">Branding & Identity</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Other Category - conditional field */}
          {industry === 'Others' && (
            <div className="space-y-1">
              <label htmlFor="new-project-other-industry" className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Specify Your Category / Service <span className="text-red-500">*</span>
              </label>
              <input
                id="new-project-other-industry"
                required={industry === 'Others'}
                type="text"
                value={otherIndustry}
                onChange={(e) => setOtherIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                placeholder="e.g. SEO Audit, Consulting, etc."
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Stage */}
            <div className="space-y-1">
              <label htmlFor="new-project-stage" className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Stage</label>
              <select
                id="new-project-stage"
                value={stage}
                onChange={(e) => setStage(e.target.value as ProjectStage)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="Discovery">Discovery</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Development">Development</option>
                <option value="Testing & QA">Testing & QA</option>
                <option value="Completed & Launched">Completed & Launched</option>
              </select>
            </div>

            {/* Health */}
            <div className="space-y-1">
              <label htmlFor="new-project-health" className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Health Indicator</label>
              <select
                id="new-project-health"
                value={health}
                onChange={(e) => setHealth(e.target.value as ProjectHealth)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="healthy">Healthy (Green)</option>
                <option value="warning">Warning (Amber)</option>
                <option value="critical">Critical (Red)</option>
              </select>
            </div>
          </div>

          {/* Next Milestone */}
          <div className="space-y-1">
            <label htmlFor="new-project-milestone" className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Next Major Milestone</label>
            <input
              id="new-project-milestone"
              type="text"
              value={nextMilestone}
              onChange={(e) => setNextMilestone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              placeholder="e.g. Wireframe review, Sprint Planning v1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Target Date */}
            <div className="space-y-1">
              <label htmlFor="new-project-date" className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Target Date</label>
              <input
                id="new-project-date"
                type="text"
                value={nextMilestoneDate}
                onChange={(e) => setNextMilestoneDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                placeholder="e.g. Friday, Nov 10"
              />
            </div>

            {/* Icon representation */}
            <div className="space-y-1">
              <label htmlFor="new-project-icon" className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Branding Icon</label>
              <select
                id="new-project-icon"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="palette">Design & UI/UX (Palette)</option>
                <option value="globe">Web Development (Globe)</option>
                <option value="smartphone">Mobile App (Phone)</option>
                <option value="rocket">Marketing & Launch (Rocket)</option>
                <option value="cpu">Core Microchip</option>
                <option value="shoppingcart">Cart / E-commerce</option>
              </select>
            </div>
          </div>

          {/* Project Description */}
          <div className="space-y-1">
            <label htmlFor="new-project-description" className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Project Description
            </label>
            <textarea
              id="new-project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
              placeholder="Enter a brief description of the project..."
            />
          </div>
          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-[11px] text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-[11px] shadow-sm"
            >
              Deploy Project
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
