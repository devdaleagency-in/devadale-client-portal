import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Loader2,
  Download,
  Share2,
  RefreshCw,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  History,
  XCircle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  ListChecks,
  AlertTriangle,
  Flag,
  Eye,
  ArrowUpRight,
  Copy,
} from 'lucide-react';
import { api } from '../../utils/api';

interface Summary {
  _id: string;
  summaryText: string;
  generatedAt: string;
  generatedBy: string;
  status: 'draft' | 'sent' | 'archived';
  projectName: string;
  upcomingTasks: string[];
  blockers: string[];
  deliverablesCount: number;
  metadata: {
    projectProgress: number;
    milestonesCompleted: number;
    pendingApprovals: number;
    filesUploaded: number;
    messagesCount: number;
  };
}

interface AISummaryCardProps {
  onTriggerAction: (msg: string) => void;
}

type SummaryState = 'empty' | 'loading' | 'loaded' | 'error';

const loadingMessages = [
  'Analyzing project data...',
  'Scanning recent activity...',
  'Compiling task progress...',
  'Generating AI summary...',
  'Finalizing report...',
];

export default function AISummaryCard({ onTriggerAction }: AISummaryCardProps) {
  const [state, setState] = useState<SummaryState>('empty');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailPreview, setEmailPreview] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const loadingTimer = useRef<ReturnType<typeof setInterval>>();
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (loadingTimer.current) clearInterval(loadingTimer.current);
    };
  }, []);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    setHistoryLoading(true);
    try {
      const data = await api.getSummaries();
      setSummaries(data);
      if (data.length > 0 && !summary) {
        setSummary(data[0]);
        setState('loaded');
      }
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleGenerate = async () => {
    setState('loading');
    setLoadingStep(0);
    loadingTimer.current = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const result = await api.generateSummary();
      setSummary(result);
      setState('loaded');
      setExpanded(false);
      setShowHistory(false);
      await fetchSummaries();
      onTriggerAction('AI project summary generated successfully.');
    } catch {
      setState('error');
      onTriggerAction('Failed to generate summary. Please try again.');
    } finally {
      if (loadingTimer.current) clearInterval(loadingTimer.current);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary.summaryText);
      setCopied(true);
      onTriggerAction('Summary copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onTriggerAction('Failed to copy summary.');
    }
  };

  const handleExportPdf = async () => {
    if (!summary) return;
    setExporting(true);
    try {
      const result = await api.exportSummaryPdf(summary._id);
      const blob = new Blob([result.content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename || `weekly-summary-${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);
      onTriggerAction('Summary report downloaded. Open the HTML file and use print (Ctrl+P) to save as PDF.');
    } catch {
      onTriggerAction('Failed to generate report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handlePrintPdf = () => {
    if (!summary) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      onTriggerAction('Please allow pop-ups to print the report.');
      return;
    }
    const dateStr = new Date(summary.generatedAt).toISOString().split('T')[0];
    const progressBar = (pct: number) =>
      `<div style="background:#e2e8f0;border-radius:99px;height:10px;overflow:hidden;margin:4px 0">
        <div style="background:linear-gradient(90deg,#3b82f6,#8b5cf6);width:${pct}%;height:100%;border-radius:99px"></div>
       </div>`;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Weekly Project Summary - ${dateStr}</title>
<style>
  @page { margin: 20mm 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; padding: 20px; }
  .header { text-align: center; padding: 30px 0 20px; border-bottom: 3px solid #3b82f6; margin-bottom: 24px; }
  .header h1 { font-size: 22px; font-weight: 800; color: #0f172a; }
  .header .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
  .section { margin: 20px 0; }
  .section h2 { font-size: 14px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .section p, .section li { font-size: 12px; color: #334155; }
  .section ul { padding-left: 20px; }
  .section ul li { margin-bottom: 4px; }
  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0; }
  .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
  .metric-card .val { font-size: 20px; font-weight: 800; color: #0f172a; }
  .metric-card .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-top: 2px; }
  .text-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; white-space: pre-wrap; font-size: 11px; color: #334155; line-height: 1.7; }
  .footer { text-align: center; padding-top: 20px; margin-top: 24px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <h1>Weekly Project Summary</h1>
  <div class="sub">Generated on ${dateStr} &mdash; DevDale Client Portal</div>
</div>
<div class="section">
  <h2>Progress Overview</h2>
  <div class="metrics">
    <div class="metric-card"><div class="val">${summary.metadata.projectProgress}%</div><div class="lbl">Progress</div></div>
    <div class="metric-card"><div class="val">${summary.metadata.milestonesCompleted}</div><div class="lbl">Milestones</div></div>
    <div class="metric-card"><div class="val">${summary.metadata.pendingApprovals}</div><div class="lbl">Pending</div></div>
    <div class="metric-card"><div class="val">${summary.deliverablesCount || summary.metadata.filesUploaded}</div><div class="lbl">Deliverables</div></div>
  </div>
  <p style="margin-bottom:2px;font-size:12px"><strong>Overall Progress:</strong> ${summary.metadata.projectProgress}%</p>
  ${progressBar(summary.metadata.projectProgress)}
  <p style="margin-top:8px;font-size:12px"><strong>Messages:</strong> ${summary.metadata.messagesCount}</p>
</div>
${summary.upcomingTasks?.length > 0 ? `
<div class="section">
  <h2>Upcoming Milestones</h2>
  <ul>
    ${summary.upcomingTasks.map((t: string) => `<li>${t}</li>`).join('')}
  </ul>
</div>` : ''}
${summary.blockers?.length > 0 ? `
<div class="section">
  <h2>Items Needing Attention</h2>
  <ul>
    ${summary.blockers.map((b: string) => `<li>${b}</li>`).join('')}
  </ul>
</div>` : ''}
<div class="section">
  <h2>Full Summary Report</h2>
  <div class="text-block">${summary.summaryText.replace(/\n/g, '<br>')}</div>
</div>
<div class="footer">
  DevDale Client Portal &mdash; This report was generated automatically.
</div>
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleSendEmail = async () => {
    if (!summary || !email) return;
    setSending(true);
    try {
      const result = await api.sendSummaryEmail(summary._id, email);
      setShowEmailInput(false);
      setEmail('');
      if (result.emailPreview) {
        setEmailPreview(result.emailPreview);
      }
      onTriggerAction(`Summary sent to ${email}.`);
    } catch {
      onTriggerAction('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleViewSummary = (s: Summary) => {
    setSummary(s);
    setState('loaded');
    setShowHistory(false);
    setExpanded(false);
    setEmailPreview(null);
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const shortDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const currentSummaryText = summary?.summaryText || '';
  const summaryPreview = expanded ? currentSummaryText : currentSummaryText.slice(0, 300);
  const isTruncated = currentSummaryText.length > 300;
  const lastGen = summary ? new Date(summary.generatedAt).toLocaleString() : null;

  const exportToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onTriggerAction(`${label} copied to clipboard.`);
    } catch {
      onTriggerAction(`Failed to copy ${label}.`);
    }
  }, [onTriggerAction]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 group hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-transparent to-purple-50/80 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-400/5 dark:to-purple-400/5" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-blue-400/30 to-purple-500/30 blur-sm" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                AI Project Summaries
                <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                  Beta
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Weekly client-ready summaries from projects, activity, and files.
              </p>
            </div>
          </div>

          {summaries.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                showHistory
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/20'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-3 h-3" />
              History
              <span className="px-1 py-0.5 text-[8px] rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-mono">
                {summaries.length}
              </span>
            </button>
          )}
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 p-3 max-h-56 overflow-y-auto space-y-1.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Summary History</p>
              {historyLoading && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
            </div>
            {historyLoading && summaries.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              </div>
            ) : summaries.length === 0 ? (
              <p className="text-[10px] text-slate-400 text-center py-2">No summaries yet.</p>
            ) : (
              summaries.map((s, idx) => (
                <button
                  key={s._id}
                  onClick={() => handleViewSummary(s)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between gap-2 ${
                    summary?._id === s._id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800'
                      : 'hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <p className="font-semibold truncate text-[11px]">
                        {s.projectName ? `${s.projectName}` : 'Weekly Summary'}
                      </p>
                      {s.status === 'sent' && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-slate-400">{shortDate(s.generatedAt)}</span>
                      <span className="text-[9px] text-slate-300">•</span>
                      <span className={`text-[9px] font-mono font-bold ${
                        s.metadata.projectProgress >= 70 ? 'text-emerald-500' :
                        s.metadata.projectProgress >= 40 ? 'text-amber-500' : 'text-red-400'
                      }`}>
                        {s.metadata.projectProgress}%
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100" />
                </button>
              ))
            )}
          </div>
        )}

        {/* Email Preview Modal */}
        {emailPreview && (
          <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Email sent successfully</span>
              </div>
              <button
                onClick={() => setEmailPreview(null)}
                className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
              >
                <XCircle className="w-3 h-3" />
              </button>
            </div>
            <div className="p-3 max-h-40 overflow-y-auto" ref={previewRef}>
              <div className="text-[10px] text-slate-500 leading-relaxed whitespace-pre-wrap font-mono">
                {emailPreview.replace(/<[^>]*>/g, '').slice(0, 500)}...
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {state === 'empty' && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No summaries yet</p>
            <p className="text-[10px] text-slate-400 mt-1 mb-4">Generate your first AI-powered project summary to get started.</p>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.97]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate First Summary
            </button>
          </div>
        )}

        {/* Loading State */}
        {state === 'loading' && (
          <div className="py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <div className="absolute inset-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {loadingMessages[loadingStep]}
                </p>
                <div className="flex items-center gap-1 mt-3 justify-center">
                  {loadingMessages.slice(0, loadingStep + 1).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        i === loadingStep
                          ? 'bg-blue-500 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-3">Gathering data from projects, messages, and activity logs...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Failed to generate</p>
            <p className="text-[10px] text-slate-400 mt-1 mb-4">Something went wrong. Please try again.</p>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        )}

        {/* Loaded State */}
        {state === 'loaded' && summary && (
          <div className="space-y-3">
            {/* Timestamp & Status */}
            <div className="flex items-center justify-between">
              {lastGen && (
                <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>Generated {lastGen}</span>
                </div>
              )}
              {summary.status === 'sent' && (
                <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Emailed</span>
                </div>
              )}
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Progress', value: `${summary.metadata.projectProgress}%`, icon: TrendingUp,
                  color: summary.metadata.projectProgress >= 70 ? 'text-emerald-500' : summary.metadata.projectProgress >= 40 ? 'text-amber-500' : 'text-red-400' },
                { label: 'Milestones', value: `${summary.metadata.milestonesCompleted}`, icon: Flag,
                  color: 'text-blue-400' },
                { label: 'Pending', value: `${summary.metadata.pendingApprovals}`, icon: ListChecks,
                  color: summary.metadata.pendingApprovals > 0 ? 'text-amber-400' : 'text-emerald-400' },
                { label: 'Deliverables', value: `${summary.deliverablesCount || summary.metadata.filesUploaded}`, icon: FileText,
                  color: 'text-purple-400' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-2.5 text-center relative overflow-hidden group/card hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                    <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br opacity-10 ${stat.color.replace('text-', '')}`} />
                    <div className={`flex items-center justify-center mb-1 ${stat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`text-sm font-black ${stat.color}`}>{stat.value}</p>
                    <p className="text-[8px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Completion</span>
                <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">{summary.metadata.projectProgress}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${summary.metadata.projectProgress}%`,
                    background: summary.metadata.projectProgress >= 70
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : summary.metadata.projectProgress >= 40
                      ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                      : 'linear-gradient(90deg, #ef4444, #dc2626)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[9px] text-slate-400">
                <span>{summary.metadata.messagesCount} messages exchanged</span>
                <span>{summary.metadata.milestonesCompleted} milestones</span>
              </div>
            </div>

            {/* Upcoming Milestones Section */}
            {summary.upcomingTasks && summary.upcomingTasks.length > 0 && (
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20 overflow-hidden">
                <button
                  onClick={() => toggleSection('upcoming')}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>Upcoming Milestones ({summary.upcomingTasks.length})</span>
                  </div>
                  {activeSection === 'upcoming' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {activeSection === 'upcoming' && (
                  <div className="px-3 pb-2 space-y-1">
                    {summary.upcomingTasks.map((task, i) => (
                      <div key={i} className="flex items-start gap-2 text-[10px] text-slate-600 dark:text-slate-300 py-0.5">
                        <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Blockers Section */}
            {summary.blockers && summary.blockers.length > 0 && (
              <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20 overflow-hidden">
                <button
                  onClick={() => toggleSection('blockers')}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Needs Attention ({summary.blockers.length})</span>
                  </div>
                  {activeSection === 'blockers' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {activeSection === 'blockers' && (
                  <div className="px-3 pb-2 space-y-1">
                    {summary.blockers.map((blocker, i) => (
                      <div key={i} className="flex items-start gap-2 text-[10px] text-slate-600 dark:text-slate-300 py-0.5">
                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{blocker}</span>
                      </div>
                    ))}
                    <div className="flex items-start gap-2 text-[10px] text-slate-600 dark:text-slate-300 py-0.5">
                      <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{summary.metadata.pendingApprovals} item(s) awaiting review</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Summary Preview */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Full Report</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Copy summary"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                    {copied ? 'Copied' : 'Copy'}
                  </span>
                </button>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {summaryPreview}
                {!expanded && isTruncated && '...'}
              </div>
              {isTruncated && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  {expanded ? (
                    <>Show less <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Read more <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              )}
            </div>

            {/* Quick Overview Tags */}
            <div className="flex flex-wrap gap-1.5">
              {summary.upcomingTasks && summary.upcomingTasks.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                  <Flag className="w-2.5 h-2.5" />
                  {summary.upcomingTasks.length} milestone(s)
                </span>
              )}
              {summary.blockers && summary.blockers.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-800/50">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {summary.blockers.length} item(s) needing review
                </span>
              )}
              {summary.status === 'draft' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Draft
                </span>
              )}
              {summary.status === 'sent' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Sent via email
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleGenerate}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-sm active:scale-[0.97]"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
              <button
                onClick={handleExportPdf}
                disabled={exporting}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                Download Report
              </button>
              <button
                onClick={handlePrintPdf}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg transition-all active:scale-[0.97]"
              >
                <Eye className="w-3 h-3" />
                Print PDF
              </button>
              <button
                onClick={() => setShowEmailInput(!showEmailInput)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg transition-all active:scale-[0.97]"
              >
                <Mail className="w-3 h-3" />
                Send Email
              </button>
              <button
                onClick={() => {
                  exportToClipboard(
                    `${summary?.summaryText}\n\nProgress: ${summary?.metadata.projectProgress}%\nGenerated: ${lastGen}`,
                    'Summary'
                  );
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg transition-all active:scale-[0.97]"
              >
                <Share2 className="w-3 h-3" />
                Share
              </button>
            </div>

            {/* Email Input */}
            {showEmailInput && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="flex-1 px-3 py-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={!email || sending}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-[10px] font-bold rounded-lg transition-all disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {sending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Mail className="w-3 h-3" />
                  )}
                  Send
                </button>
              </div>
            )}

            {/* Timeline of summaries */}
            {summaries.length > 1 && (
              <div className="pt-1">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-center gap-1 py-2 text-[9px] font-bold text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <History className="w-3 h-3" />
                  View all {summaries.length} summaries
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
