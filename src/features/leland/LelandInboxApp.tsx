// ═══════════════════════════════════════════════════════════════════════════════
// LelandInboxApp — HubSpot mock (intake + tickets)
//
// Renders BriefingCanvas during step l0.1 (the "before Strata" friction).
// During other steps the inbox shows a quiet idle state since this app is
// only highlighted by the demo at the briefing beat.
// ═══════════════════════════════════════════════════════════════════════════════

import { Mail } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import LelandPageShell from './components/LelandPageShell';
import BriefingCanvas from './components/BriefingCanvas';

export default function LelandInboxApp() {
    const { currentStep, isDemoActive } = useDemo();
    const isBriefing = currentStep?.id === 'l0.1';

    return (
        <LelandPageShell
            title="Inbox"
            subtitle="Support pipeline · where new orders arrive"
            icon={<Mail className="size-5" />}
            iconTone="blue"
        >
            {isDemoActive && isBriefing ? (
                <BriefingCanvas />
            ) : (
                <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
                    <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Inbox idle
                    </div>
                    <p className="mt-2 text-[13px] text-muted-foreground max-w-xl mx-auto">
                        The inbox is the entry point at step <span className="font-mono">l0.1</span> — Strata picks the PO up and the rest of the flow runs in the PO Workspace.
                    </p>
                </section>
            )}
        </LelandPageShell>
    );
}
