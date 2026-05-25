import SearchModal from './SearchModal';
import type { Project, Agreement, ActivityFeed } from '../types';
import {
  INITIAL_INVOICES,
  INITIAL_UPLOADS,
  INITIAL_APPROVALS,
  INITIAL_TEAM_ACTIVITY,
} from '../data';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  agreements: Agreement[];
  activity: ActivityFeed[];
  onNavigate: (tab: string) => void;
  onTriggerAction: (msg: string) => void;
}

export default function GlobalSearch({ isOpen, onClose, projects, agreements, activity, onNavigate, onTriggerAction }: GlobalSearchProps) {
  return (
    <SearchModal
      isOpen={isOpen}
      onClose={onClose}
      projects={projects}
      agreements={agreements}
      activity={activity}
      invoices={INITIAL_INVOICES}
      uploads={INITIAL_UPLOADS}
      approvals={INITIAL_APPROVALS}
      teamActivity={INITIAL_TEAM_ACTIVITY}
      onNavigate={onNavigate}
      onTriggerAction={onTriggerAction}
    />
  );
}
