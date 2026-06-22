import type { Project, Agreement, ActivityFeed, Deadline, Invoice, UploadedFile, ApprovalItem, TeamActivity } from '../types';

function toClientStatus(status: string): string {
  const map: Record<string, string> = {
    draft: 'Preparing',
    sent: 'Received',
    viewed: 'Under Review',
    paid: 'Paid',
    partially_paid: 'Partially Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
}

export interface SearchResultItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  icon: string;
  timestamp?: string;
  status?: string;
  owner?: string;
  priority?: string;
  tab: string;
  highlights?: { title: number[]; subtitle: number[] };
}

export interface SearchFilters {
  category: string | null;
  project: string | null;
  status: string | null;
  owner: string | null;
}

const DEFAULT_FILTERS: SearchFilters = {
  category: null,
  project: null,
  status: null,
  owner: null,
};

function getHighlightIndices(text: string, query: string): number[] {
  if (!query) return [];
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const indices: number[] = [];
  let idx = lower.indexOf(q);
  while (idx !== -1) {
    indices.push(idx);
    idx = lower.indexOf(q, idx + q.length);
  }
  return indices;
}

function matchesQuery(query: string, ...fields: (string | undefined)[]): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;
  return fields.some((field) => field?.toLowerCase().includes(q));
}

export function searchAll(
  query: string,
  projects: Project[],
  agreements: Agreement[],
  activity: ActivityFeed[],
  invoices: Invoice[],
  uploads: UploadedFile[],
  approvals: ApprovalItem[],
  teamActivity: TeamActivity[],
  deadlines: Deadline[],
  filters?: Partial<SearchFilters>,
): SearchResultItem[] {
  const q = query.trim();
  if (!q) return [];

  const activeFilters = { ...DEFAULT_FILTERS, ...filters };
  const results: SearchResultItem[] = [];

  function addIfMatch(
    category: string,
    id: string,
    title: string,
    subtitle: string,
    icon: string,
    tab: string,
    opts: {
      timestamp?: string;
      status?: string;
      owner?: string;
      priority?: string;
      projectName?: string;
    },
    searchableFields: string[],
  ) {
    if (!matchesQuery(q, ...searchableFields)) return;
    if (activeFilters.category && activeFilters.category !== category) return;
    if (activeFilters.project && opts.projectName !== activeFilters.project) return;
    if (activeFilters.status && opts.status !== activeFilters.status) return;
    if (activeFilters.owner && opts.owner !== activeFilters.owner) return;

    results.push({
      id,
      category,
      title,
      subtitle,
      icon,
      timestamp: opts.timestamp,
      status: opts.status,
      owner: opts.owner,
      priority: opts.priority,
      tab,
      highlights: {
        title: getHighlightIndices(title, q),
        subtitle: getHighlightIndices(subtitle, q),
      },
    });
  }

  for (const p of projects) {
    addIfMatch('Projects', p.id, p.name, `${p.client} · ${p.stage} · ${p.progress}% complete`, 'FolderKanban', 'dashboard', {
      timestamp: p.lastUpdated,
      status: p.health,
      owner: p.client,
      projectName: p.name,
    }, [p.name, p.client, p.stage, p.description, p.nextMilestone]);
  }

  for (const f of uploads) {
    addIfMatch('Files', f.id, f.name, `${f.size} · ${f.project}`, 'FileText', 'deliverables', {
      timestamp: f.uploadedAt,
      owner: f.uploadedBy,
      projectName: f.project,
    }, [f.name, f.project, f.uploadedBy]);
  }

  for (const m of teamActivity) {
    addIfMatch('Activity', m.id, `${m.user.name} ${m.action} ${m.target}`, m.timestamp, 'Activity', 'dashboard', {
      timestamp: m.timestamp,
      owner: m.user.name,
    }, [m.user.name, m.action, m.target]);
  }

  for (const inv of invoices) {
    const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(inv.amount);
    const clientStatus = toClientStatus(inv.status);
    addIfMatch('Invoices', inv.id, `${inv.number} · ${amount}`, `${inv.client} · Due ${inv.dueDate}`, 'DollarSign', 'agreements', {
      timestamp: inv.issuedDate,
      status: clientStatus,
      owner: inv.client,
      projectName: inv.client,
    }, [inv.number, inv.client, clientStatus, inv.dueDate]);
  }

  for (const a of agreements) {
    addIfMatch('Agreements', a.id, a.name, `${a.client} · ${a.status}`, 'FileSignature', 'agreements', {
      timestamp: a.date,
      status: a.status,
      owner: a.client,
      projectName: a.client,
    }, [a.name, a.client, a.status]);
  }

  for (const dl of deadlines) {
    addIfMatch('Tasks', dl.id, dl.task, `${dl.project} · ${dl.assignee}`, 'CalendarCheck', 'dashboard', {
      timestamp: dl.dueDate,
      status: dl.status,
      owner: dl.assignee,
      priority: dl.priority,
      projectName: dl.project,
    }, [dl.task, dl.project, dl.assignee]);
  }

  for (const ap of approvals) {
    addIfMatch('Deliverables', ap.id, ap.title, `${ap.type} · ${ap.submittedBy}`, 'CheckSquare', 'deliverables', {
      timestamp: ap.submittedAt,
      status: ap.status,
      owner: ap.submittedBy,
    }, [ap.title, ap.type, ap.description, ap.submittedBy]);
  }

  for (const act of activity) {
    addIfMatch('Activity', act.id, act.message, `${act.actor} · ${act.timestamp}`, 'Bell', 'dashboard', {
      timestamp: act.timestamp,
      owner: act.actor,
    }, [act.message, act.actor]);
  }

  return results;
}

export function getFilterOptions(
  projects: Project[],
  uploads: UploadedFile[],
  invoices: Invoice[],
  approvals: ApprovalItem[],
) {
  const categories = ['Projects', 'Files', 'Invoices', 'Agreements', 'Tasks', 'Deliverables', 'Activity'];
  const projectNames = [...new Set(projects.map((p) => p.name))];
  const statuses = [...new Set([...invoices.map((i) => i.status), ...approvals.map((a) => a.status)])];
  const owners = [...new Set([...uploads.map((u) => u.uploadedBy), ...approvals.map((a) => a.submittedBy)])];
  return { categories, projectNames, statuses, owners };
}

export function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem('global-search-recent');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string) {
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem('global-search-recent', JSON.stringify(recent.slice(0, 8)));
}

export function clearRecentSearches() {
  localStorage.removeItem('global-search-recent');
}
