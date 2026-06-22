import SearchModal from './SearchModal';
import type { Project, Agreement, ActivityFeed } from '../types';

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
      invoices={[]}
      uploads={[]}
      approvals={[]}
      teamActivity={[]}
      deadlines={[]}
      onNavigate={onNavigate}
      onTriggerAction={onTriggerAction}
    />
  );
}
