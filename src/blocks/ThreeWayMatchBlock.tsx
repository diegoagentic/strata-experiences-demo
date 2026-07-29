// F46.a (Diego 2026-07-29) · enriched preview page for the PO vs ACK Match
// widget. Adds a "How the reconciliation works" card with 3-step flow above
// the widget, plus a "Status semantics" card below explaining what Match /
// Partial / Mismatch mean. Pattern-consistent with ConfidenceScoreBlock /
// ApprovalChainBlock (context wrappers around a widget), just richer visual
// because the reconciliation flow deserves educational framing. Historical
// note explains the "three-way → PO vs ACK" post-Neocon 2026-06-05 rename.
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import ThreeWayMatchView, { type MatchLine } from '../components/widgets/ThreeWayMatchView';

const MOCK_LINES: MatchLine[] = [
  { lineItem: 'Herman Miller Aeron · Size B',      sku: 'HM-AER-B-BLK',  poValue: '$1,395.00', ackValue: '$1,395.00', invoiceValue: '$1,395.00', status: 'match' },
  { lineItem: 'Steelcase Series 1 · Task Chair',   sku: 'SC-S1-STD',     poValue: '$489.00',   ackValue: '$489.00',   invoiceValue: '$514.00',   status: 'mismatch', delta: '+$25.00 unit price' },
  { lineItem: 'Knoll Antenna Workspaces · 6-pack', sku: 'KN-AW6-WLNT',   poValue: '$8,240.00', ackValue: '$8,240.00', invoiceValue: '$4,120.00', status: 'partial',  delta: 'Received 3 of 6 units' },
  { lineItem: 'Humanscale Float · Standing Desk',  sku: 'HS-FLT-72',     poValue: '$2,180.00', ackValue: '$2,180.00', invoiceValue: '$2,180.00', status: 'match' },
];

export default function ThreeWayMatchBlock() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ─── How the reconciliation works ──────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              How the reconciliation works
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              When a dealer sends a Purchase Order (PO), the manufacturer
              responds with an Acknowledgement (ACK) confirming line items,
              prices, and delivery. Strata AI reconciles the two documents
              line-by-line and flags any exception before it reaches the
              receiving dock.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground px-2 py-1 rounded-md shrink-0">
            Manufacturer side
          </span>
        </div>

        {/* 3-step visual flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          {/* Step 1 · Dealer sends PO */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-info/10 text-info flex items-center justify-center text-xs font-bold">
                1
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Dealer
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">Sends Purchase Order</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Line items, quantities, unit prices, delivery dates.
            </p>
          </div>

          {/* Step 2 · Manufacturer confirms ACK */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-warning/10 text-warning flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Manufacturer
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">Sends Acknowledgement</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Confirms what will actually ship · flags substitutions,
              partial fills, price adjustments.
            </p>
          </div>

          {/* Step 3 · Strata reconciles */}
          <div className="rounded-xl border border-ai/30 bg-ai/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ai">
                Strata AI
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">Reconciles line-by-line</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Detects match, partial, or mismatch per line · surfaces
              exceptions before they reach the dock.
            </p>
          </div>
        </div>

        {/* Historical note · why "three-way" but only 2 columns */}
        <div className="mt-6 text-[11px] text-muted-foreground border-t border-border pt-4 leading-relaxed">
          <span className="font-semibold text-foreground">Why "three-way"?</span>
          {' '}Originally the flow reconciled PO ↔ ACK ↔ Receipt (invoice at
          dock). Post-Neocon 2026 review, the manufacturer stops at the ACK
          stage · they <span className="font-semibold text-foreground">detect</span>,
          the dealer <span className="font-semibold text-foreground">resolves</span>.
          The Receipt/Invoice column moved to a downstream dealer-side widget.
        </div>
      </div>

      {/* ─── Widget ─────────────────────────────────────────────────────── */}
      <ThreeWayMatchView orderId="PO-2044-71" lines={MOCK_LINES} />

      {/* ─── Status semantics ──────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Status semantics
        </h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Each line gets one of three statuses after reconciliation. The
          footer aggregates the counts and surfaces the dealer-facing CTA
          when exceptions exist.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Match */}
          <div className="rounded-xl border border-success/30 bg-success/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-success" />
              <span className="text-sm font-bold text-success">Match</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              PO value = ACK value across all fields. No action required ·
              the ACK ships as ordered.
            </p>
          </div>

          {/* Partial */}
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-warning" />
              <span className="text-sm font-bold text-warning">Partial</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quantity or delivery differs (e.g. 3 of 6 units received).
              Dealer decides · accept partial, expedite, or backorder.
            </p>
          </div>

          {/* Mismatch */}
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <XCircleIcon className="w-5 h-5 text-destructive" />
              <span className="text-sm font-bold text-destructive">Mismatch</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Price or SKU discrepancy (e.g. +$25.00 unit price).
              Requires dealer notification and manual resolution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
