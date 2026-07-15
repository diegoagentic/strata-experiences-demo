import { useState } from 'react';
import ERPSyncModal from '../components/modals/ERPSyncModal';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

export default function ERPSyncBlock() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <ArrowsRightLeftIcon className="w-4 h-4" />
        Open ERP Sync Modal
      </button>
      <p className="text-xs text-muted-foreground max-w-md text-center">
        QuickBooks · CORE · NetSuite outbound sync preview. Consumed by OPS
        (invoice batch) and Dupler (transit / receiving posting).
      </p>

      <ERPSyncModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
