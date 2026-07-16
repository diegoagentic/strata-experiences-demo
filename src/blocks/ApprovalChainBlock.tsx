import { useState } from 'react';
import ApprovalChainModal, { type Approver } from '../components/modals/ApprovalChainModal';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';

const MOCK_APPROVERS: Approver[] = [
  { name: 'Account Manager Kai',    role: 'Account Manager', status: 'approved', timestamp: '10:12 AM' },
  { name: 'Sales Director Rio',  role: 'Sales Director',  status: 'approved', timestamp: '10:34 AM' },
  { name: 'Finance Lead Wren',   role: 'Finance Lead',    status: 'current' },
  { name: 'CFO Osen',     role: 'CFO',             status: 'pending' },
];

export default function ApprovalChainBlock() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <CheckBadgeIcon className="w-4 h-4" />
        Open Approval Chain Modal
      </button>
      <p className="text-xs text-muted-foreground max-w-md text-center">
        Demo of the multi-level approval widget. In production it is triggered
        from a Quote / PO / Order detail — here it renders with mock approvers
        so you can see the layout & interaction pattern.
      </p>

      <ApprovalChainModal
        isOpen={open}
        onClose={() => setOpen(false)}
        trigger="Quote Q-84210 · $142,300"
        approvers={MOCK_APPROVERS}
      />
    </div>
  );
}
