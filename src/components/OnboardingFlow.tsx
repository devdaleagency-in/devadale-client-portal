import React, { useState, ChangeEvent } from 'react';
import { 
  Building, 
  Map, 
  CalendarDays, 
  Eye, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Upload, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Trash2,
  FileText
} from 'lucide-react';
import { OnboardingData } from '../types';

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSaveForLater: () => void;
}

export default function OnboardingFlow({ onComplete, onSaveForLater }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [industryError, setIndustryError] = useState('');

  const [formData, setFormData] = useState<OnboardingData>({
    companyName: 'DevDale Agency',
    industry: 'SaaS',
    industryOther: '',
    websiteUrl: 'https://www.devdale.com',
    description: 'We are a next-generation workspace platform focusing on premium, high-density dashboard systems.',
    brandPersonality: 'Premium, trustworthy, fast, and calm.',
    targetAudience: 'Founders, operations leaders, and enterprise buyers who need clear project visibility.',
    competitors: 'Linear, SuperOkay, Notion client portals, agency portals.',
    preferredColors: 'Deep blue, slate, white, emerald success states.',
    designInspiration: 'Linear, Stripe dashboard, Vercel project pages, high-end agency case studies.',
    featureRequirements: 'Client dashboard, requirements form, file manager, approvals, live messaging, timeline.',
    functionalRequirements: 'Auto-save drafts, role permissions, revision workflow, notifications, activity log.',
    technicalRequirements: 'Next.js-style frontend, Node/Express APIs, PostgreSQL, JWT, S3 or Cloudinary, Socket.io.',
    referenceWebsites: 'https://linear.app, https://vercel.com, https://stripe.com',
    socialLinks: 'LinkedIn: /company/devdale, Instagram: @devdale',
    additionalNotes: 'White-label support and polished mobile experience are important.',
    brandAssets: [
      { name: 'logo-primary.svg', size: '2.4 MB', status: 'uploaded' },
      { name: 'fonts-spec.json', size: '14 KB', status: 'uploaded' }
    ]
  });

  // Local interaction states
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState('');
  const [projectGoals, setProjectGoals] = useState('Brand Redesign & Enterprise Scale');
  const [selectedUrgency, setSelectedUrgency] = useState('High');
  const [expandedSection, setExpandedSection] = useState('brand');

  const INDUSTRY_OTHER = 'Others';

  const industriesList = [
    'SaaS',
    'FinTech',
    'Healthcare & Biolabs',
    'E-Commerce & Logis',
    'EdTech & Classrooms',
    'AI & Automation',
    INDUSTRY_OTHER,
  ];

  const resolvedIndustry =
    formData.industry === INDUSTRY_OTHER
      ? formData.industryOther.trim()
      : formData.industry;

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'industryOther' && industryError) {
      setIndustryError('');
    }
  };

  const handleIndustrySelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      industry: value,
      industryOther: value === INDUSTRY_OTHER ? prev.industryOther : '',
    }));
    if (industryError) setIndustryError('');
  };

  const validateBusinessStep = (): boolean => {
    if (formData.industry === INDUSTRY_OTHER && !formData.industryOther.trim()) {
      setIndustryError('Please enter your industry when Others is selected.');
      return false;
    }
    setIndustryError('');
    return true;
  };

  const briefSections = [
    {
      id: 'brand',
      title: 'Brand Details',
      fields: [
        ['brandPersonality', 'Brand personality'],
        ['preferredColors', 'Preferred colors'],
        ['designInspiration', 'Design inspiration'],
      ],
    },
    {
      id: 'market',
      title: 'Audience & Competitors',
      fields: [
        ['targetAudience', 'Target audience'],
        ['competitors', 'Competitors'],
        ['referenceWebsites', 'Reference websites'],
        ['socialLinks', 'Social media links'],
      ],
    },
    {
      id: 'requirements',
      title: 'Feature, Functional & Technical Requirements',
      fields: [
        ['featureRequirements', 'Feature requirements'],
        ['functionalRequirements', 'Functional requirements'],
        ['technicalRequirements', 'Technical requirements'],
        ['additionalNotes', 'Additional notes'],
      ],
    },
  ] as const;

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        status: 'uploaded' as const
      }));
      setFormData(prev => ({
        ...prev,
        brandAssets: [...prev.brandAssets, ...newFiles]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      brandAssets: prev.brandAssets.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (step === 1 && !validateBusinessStep()) return;

    if (step < 4) {
      setStep((prev) => prev + 1);
    } else {
      onComplete({
        ...formData,
        industry: resolvedIndustry || formData.industry,
        industryOther: formData.industry === INDUSTRY_OTHER ? formData.industryOther.trim() : '',
      });
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-2 space-y-6">
      
      {/* Stepper Wizard Indicator */}
      <div className="flex items-center justify-between px-6 max-w-xl mx-auto mb-8 relative">
        <div className="absolute left-6 right-6 top-[20px] h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
        
        {[1, 2, 3, 4].map((s) => {
          const isCompleted = step > s;
          const isActive = step === s;
          const label = s === 1 ? 'Business' : s === 2 ? 'Brief' : s === 3 ? 'Timeline' : 'Review';

          return (
            <div key={s} className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => s <= step + 1 && setStep(s)}
                aria-label={
                  isCompleted
                    ? `${label} step, completed`
                    : isActive
                    ? `${label} step, current`
                    : `Go to ${label} step`
                }
                aria-current={isActive ? 'step' : undefined}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                  isCompleted 
                    ? 'bg-blue-600 border-blue-600 text-white shadow'
                    : isActive
                    ? 'bg-white dark:bg-slate-900 border-blue-600 text-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/40 shadow'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" aria-hidden="true" /> : s}
              </button>
              <span className={`text-[10px] font-bold mt-1 tracking-wider uppercase ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Form Body Panel Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 lg:p-8 shadow-xl relative overflow-hidden transition-colors">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Business Information</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Let's start with the basics of your company to tailor the client portal experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="space-y-1 md:col-span-2">
                <label htmlFor="onboarding-company-name" className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Company Name
                </label>
                <input
                  id="onboarding-company-name"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="e.g. DevDale Agency"
                />
              </div>

              {/* Industry Select */}
              <div className={`space-y-1 ${formData.industry === INDUSTRY_OTHER ? 'md:col-span-2' : ''}`}>
                <label htmlFor="onboarding-industry" className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Industry
                </label>
                <select
                  id="onboarding-industry"
                  value={formData.industry}
                  onChange={(e) => handleIndustrySelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none"
                >
                  {industriesList.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              {formData.industry === INDUSTRY_OTHER && (
                <div className="space-y-1 md:col-span-2">
                  <label
                    htmlFor="industry-other"
                    className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase"
                  >
                    Specify your industry <span className="text-red-500">*</span>
                  </label>
                  {industryError ? (
                    <input
                      id="industry-other"
                      type="text"
                      required
                      value={formData.industryOther}
                      onChange={(e) => handleInputChange('industryOther', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-red-400 dark:border-red-500 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="e.g. Real estate, nonprofit, manufacturing..."
                      aria-invalid="true"
                      aria-describedby="industry-other-error"
                    />
                  ) : (
                    <input
                      id="industry-other"
                      type="text"
                      required
                      value={formData.industryOther}
                      onChange={(e) => handleInputChange('industryOther', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="e.g. Real estate, nonprofit, manufacturing..."
                    />
                  )}
                  {industryError && (
                    <p id="industry-other-error" className="text-[10px] font-semibold text-red-600 dark:text-red-400">
                      {industryError}
                    </p>
                  )}
                </div>
              )}

              {/* Website URL */}
              <div className="space-y-1">
                <label htmlFor="onboarding-website" className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Website URL
                </label>
                <input
                  id="onboarding-website"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="https://www.devdale.com"
                />
              </div>

              {/* Business Description */}
              <div className="space-y-1 md:col-span-2">
                <label htmlFor="onboarding-description" className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Business Description
                </label>
                <textarea
                  id="onboarding-description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  placeholder="Describe your business goals and core values..."
                />
              </div>
            </div>

            {/* Brand Assets Upload Block */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                Brand Assets
              </label>

              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-900/10' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const newFiles = Array.from(e.dataTransfer.files).map((file: File) => ({
                      name: file.name,
                      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                      status: 'uploaded' as const
                    }));
                    setFormData(prev => ({ ...prev, brandAssets: [...prev.brandAssets, ...newFiles] }));
                  }
                }}
              >
                <input 
                  type="file" 
                  id="asset-upload-input" 
                  multiple 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <label htmlFor="asset-upload-input" className="cursor-pointer space-y-2 block">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">Click or drag files to upload</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Support for Logos, Typography guidelines, Images, and Swatches (Max 50MB)</span>
                  </div>
                </label>
              </div>

              {/* Assets List */}
              {formData.brandAssets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                  {formData.brandAssets.map((asset, index) => (
                    <div 
                      key={asset.name} 
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 animate-in slide-in-from-bottom-2 duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                            {asset.name}
                          </div>
                          <div className="text-[9px] text-slate-400">{asset.size} • Active Asset</div>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Project Specs</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Capture the brand, audience, reference, feature, functional, and technical requirements in a structured brief.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="onboarding-project-goals" className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Primary Goals & Deliverables
                </label>
                <input
                  id="onboarding-project-goals"
                  type="text"
                  value={projectGoals}
                  onChange={(e) => setProjectGoals(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="e.g. Redesign, Web Platform buildout, iOS prototypes"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Target Product Urgency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Normal', 'High', 'Critical'].map((urgency) => (
                    <button
                      key={urgency}
                      type="button"
                      onClick={() => setSelectedUrgency(urgency)}
                      className={`py-2 px-3 rounded-lg font-bold text-xs transition-colors border ${
                        selectedUrgency === urgency 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {urgency} Priority
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {briefSections.map((section) => {
                  const isOpen = expandedSection === section.id;
                  return (
                    <div key={section.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/60 dark:bg-slate-950/30">
                      <button
                        type="button"
                        onClick={() => setExpandedSection(isOpen ? '' : section.id)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left"
                      >
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">{section.title}</span>
                        <span className={`text-[10px] font-bold ${isOpen ? 'text-blue-600' : 'text-slate-400'}`}>
                          {isOpen ? 'Expanded' : 'Open'}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 pb-4 animate-in fade-in duration-200">
                          {section.fields.map(([field, label]) => (
                            <label key={field} className={field === 'technicalRequirements' || field === 'additionalNotes' ? 'md:col-span-2' : ''}>
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</span>
                              <textarea
                                rows={field === 'technicalRequirements' || field === 'additionalNotes' ? 3 : 2}
                                value={formData[field]}
                                onChange={(e) => handleInputChange(field, e.target.value)}
                                className="mt-1 w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                              />
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Timelines Selection</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose the design and production phase triggers that align with your operational sprints.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                Proposed Pipeline Schedule (Sprints)
              </h3>
              <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                  <span className="font-semibold">Phase 1: Brand Discovery & Sighting</span>
                  <span className="font-mono text-blue-600">Sept 15 – Oct 02</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                  <span className="font-semibold">Phase 2: UI Design & Token Blueprint</span>
                  <span className="font-mono text-blue-600">Oct 02 – Oct 27</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                  <span className="font-semibold">Phase 3: Prototype & Testing loops</span>
                  <span className="font-mono text-blue-600">Oct 27 – Nov 12</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="font-semibold">Phase 4: Golden Master Handoff</span>
                  <span className="font-mono text-blue-600">Nov 12 – Nov 15</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review Portal Details</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Verify your business registration properties. These details will render Alex's live client portal directly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Company Name</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{formData.companyName}</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Industry Area</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {resolvedIndustry || formData.industry}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 col-span-2">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Targeted Goals</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{projectGoals}</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 col-span-2">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Uploaded Assets</div>
                <div className="text-slate-500 dark:text-slate-400 mt-1 font-mono text-[10px] space-y-0.5">
                  {formData.brandAssets.map(a => (
                    <div key={a.name}>✓ {a.name} ({a.size})</div>
                  ))}
                  {formData.brandAssets.length === 0 && <div>No files attached.</div>}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 col-span-2">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Requirements Snapshot</div>
                <div className="text-slate-600 dark:text-slate-300 mt-1 text-[11px] leading-relaxed">
                  {formData.featureRequirements} {formData.functionalRequirements}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Footer Menu Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button 
            type="button" 
            onClick={onSaveForLater}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline font-semibold transition-colors"
          >
            Save for Later
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-sm"
            >
              <span>{step === 4 ? 'Complete Onboarding' : 'Continue'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Badge 1 */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
          <div className="p-1 px-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Secure Data Integration</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 leading-relaxed">
              Your business and branding parameters are fully encrypted using enterprise-grade strict security loops.
            </p>
          </div>
        </div>

        {/* Badge 2 */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
          <div className="p-1 px-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-green-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Smart Target Allocation</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 leading-relaxed">
              We leverage analytical matching algorithms to direct relevant designers and engineers on your milestones.
            </p>
          </div>
        </div>

        {/* Badge 3 */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
          <div className="p-1 px-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Fast-Track Activation</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 leading-relaxed">
              Provides direct deployment configurations into active pipelines. Bypasses exploratory discovery call blocks.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <footer className="text-center text-[10px] text-slate-400 pt-6">
        <p>© 2026 DevDale Agency. All rights reserved. <span className="hover:text-blue-500 cursor-pointer underline">Privacy Policy</span></p>
      </footer>
    </div>
  );
}
