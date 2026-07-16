// ═══════════════════════════════════════════════════════════════════════════════
// Inbound | Outbound — Manufacturer order entry demo
//
// Target: Senator Group manufacturer pitch (presentation Sunday 2026-06-07).
// Strata Sales Director (Leland team) owns SME feedback. See:
//   docs/inbound-outbound-flow.md         · step-by-step narrative
//   /.claude/plans/cuddly-greeting-meadow.md · implementation plan
//
// PHASE 1 (Friday EOD · 12 steps · 2 flows):
//   Flow 1 · Inbound RFQ → Outbound Quote (6 steps · io-1.1 .. io-1.6)
//   Flow 2 · Inbound PO → Outbound Ack + Shipping + Invoice (6 steps · io-2.1 .. io-2.6)
//   Includes 3 Liliana-team improvements: Shipping tracking, Payments AR/AP,
//   Proforma invoice (deposit request).
//
// PHASE 2 (next week · projected · NOT YET WIRED):
//   Flow 3 · Sample requests + Textile reference (graded-in) approval.
//
// Persona: manufacturer order-entry team (Order Entry coord, Order Entry
// Manager, Production Manager, Logistics, AR/AP). Counterparty is "the dealer"
// (anonymized · could be any Strata dealer · BFI / Leland / etc).
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles'
import type { StepBehavior } from '../../components/demo/DemoStepBanner'

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const INBOUND_OUTBOUND_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1 · Inbound RFQ → Outbound Quote
    // 6 steps · Order Entry team digitizes the dealer RFQ, AI builds the quote,
    // proforma invoice triggers the deposit request before production starts.
    // ═══════════════════════════════════════════
    {
        id: 'io-1.1',
        groupId: 0,
        groupTitle: 'Flow 1: Inbound RFQ → Outbound Quote',
        title: 'Inbound RFQ arrives from dealer',
        description: 'The order entry team gets an inbound email from a dealer requesting a quote. Attached: SIF, spec sheet, and floor plan. Strata detects the RFQ intent, classifies the attachments, and surfaces the right-of-first-touch action so the coordinator does not have to manually triage.',
        app: 'email-marketplace',
        role: 'Order Entry',
    },
    {
        id: 'io-1.2',
        groupId: 0,
        groupTitle: 'Flow 1: Inbound RFQ → Outbound Quote',
        title: 'AI extraction · SIF + spec + line items',
        description: 'Five AI agents work in parallel: OCR reads the SIF PDF, TextExtract parses the spec sheet, and the line-item agent normalizes ~80 lines including textiles, finishes, and graded-in references. Confidence scores per field surface anything that needs a human look.',
        app: 'dealer-kanban',
        role: 'Order Entry',
    },
    {
        id: 'io-1.3',
        groupId: 0,
        groupTitle: 'Flow 1: Inbound RFQ → Outbound Quote',
        title: 'Quote draft · textile reference check',
        description: 'The QuoteBuilder Agent drafts pricing applying contract terms, lead times, and volume discounts. Strata flags graded-in textiles for verification (placeholder hook · Phase 2 expands this into a full approval flow). Coordinator reviews the draft side-by-side with the RFQ.',
        app: 'expert-hub',
        role: 'Order Entry',
    },
    {
        id: 'io-1.4',
        groupId: 0,
        groupTitle: 'Flow 1: Inbound RFQ → Outbound Quote',
        title: 'Approval chain · margin + lead-time gates',
        description: 'Policy Engine evaluates the draft: 32% margin (below 35% threshold) and 8-week lead time both auto-route. Order Entry Manager sees the dashboard with chain progression and can override if needed. Three-level chain runs to completion.',
        app: 'dashboard',
        role: 'Order Entry Manager',
    },
    {
        id: 'io-1.5',
        groupId: 0,
        groupTitle: 'Flow 1: Inbound RFQ → Outbound Quote',
        title: 'Outbound quote sent to dealer',
        description: 'Strata composes the outbound quote document, attaches the line-item breakdown and terms, and sends it back to the dealer via the channel of record. Pipeline view shows the new opportunity moving into "Quoted" status. Drafts only · the coordinator approves before send.',
        app: 'dashboard',
        role: 'Order Entry',
    },
    {
        id: 'io-1.6',
        groupId: 0,
        groupTitle: 'Flow 1: Inbound RFQ → Outbound Quote',
        title: 'Proforma invoice · deposit request',
        description: 'Before production can start the manufacturer needs a 30% deposit. Strata drafts the proforma invoice from the approved quote, marks it as "PROFORMA · pre-shipment", and stages it for outbound send. AR sees the expected payment date on the pipeline.',
        app: 'expert-hub',
        role: 'Order Entry',
    },

    // ═══════════════════════════════════════════
    // FLOW 2 · Inbound PO → Outbound Ack + Shipping + Invoice
    // 6 steps · The dealer accepts the quote, sends the PO, and the manufacturer
    // runs production, ships with full tracking, and closes with the invoice.
    // ═══════════════════════════════════════════
    {
        id: 'io-2.1',
        groupId: 1,
        groupTitle: 'Flow 2: Inbound PO → Outbound Ack + Shipping + Invoice',
        title: 'Inbound PO from dealer',
        description: 'Dealer accepts the quote and sends the PO via EDI/email. Strata routes it into the Order Entry queue with the originating opportunity pre-linked. Coordinator sees the PO alongside the prior quote in one unified view.',
        app: 'email-marketplace',
        role: 'Order Entry',
    },
    {
        id: 'io-2.2',
        groupId: 1,
        groupTitle: 'Flow 2: Inbound PO → Outbound Ack + Shipping + Invoice',
        title: 'PO vs Quote comparison',
        description: 'Field-by-field comparison surfaces any drift between what was quoted and what was ordered. Most discrepancies auto-resolve (color codes, alternate finishes within the same tier). Anything outside the auto-fix threshold escalates for human review.',
        app: 'expert-hub',
        role: 'Order Entry',
    },
    {
        id: 'io-2.3',
        groupId: 1,
        groupTitle: 'Flow 2: Inbound PO → Outbound Ack + Shipping + Invoice',
        title: 'Outbound Ack generated',
        description: 'Strata builds the EDI/855 acknowledgment from the validated PO with confirmed quantities, lead times per zone, and ship-date commitments. The coordinator reviews the ack draft before it goes back to the dealer.',
        app: 'expert-hub',
        role: 'Order Entry',
    },
    {
        id: 'io-2.4',
        groupId: 1,
        groupTitle: 'Flow 2: Inbound PO → Outbound Ack + Shipping + Invoice',
        title: 'Production scheduled',
        description: 'Production Manager sees the new commitment on the schedule dashboard: line, week, capacity load, and material readiness. Strata calls out any risk (textile backorder, custom hardware) so the schedule absorbs reality instead of best case.',
        app: 'dashboard',
        role: 'Production Manager',
    },
    {
        id: 'io-2.5',
        groupId: 1,
        groupTitle: 'Flow 2: Inbound PO → Outbound Ack + Shipping + Invoice',
        title: 'Shipping tracking · push to dealer',
        description: 'Logistics opens the tracking modal: timeline Plan → Manufacturing → Shipping → Install with status per milestone, carrier + tracking number, and ETA per delivery zone. The dealer sees the same view in their portal. No more "where is my order?" calls.',
        app: 'dashboard',
        role: 'Logistics',
    },
    {
        id: 'io-2.6',
        groupId: 1,
        groupTitle: 'Flow 2: Inbound PO → Outbound Ack + Shipping + Invoice',
        title: 'Outbound invoice + payment status',
        description: 'Once delivered, Strata generates the final invoice (proforma deposit credit applied), sends it to the dealer, and tracks payment status. AR sees aging, early-pay discount window, and payment confirmations all in one view. AP coordinator handles any supplier-side recon in parallel.',
        app: 'crm',
        role: 'AR/AP',
    },
]

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const INBOUND_OUTBOUND_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'io-1.1': { mode: 'interactive', userAction: 'Open the inbound RFQ and trigger the AI triage' },
    'io-1.2': { mode: 'auto',        userAction: 'Watch the AI agents extract SIF + spec + line items' },
    'io-1.3': { mode: 'interactive', userAction: 'Review the quote draft and check the graded-in textile flag' },
    'io-1.4': { mode: 'auto',        userAction: 'Watch the approval chain run · margin + lead-time gates' },
    'io-1.5': { mode: 'interactive', userAction: 'Approve the outbound quote draft and send' },
    'io-1.6': { mode: 'interactive', userAction: 'Review the proforma invoice and stage for deposit request' },

    'io-2.1': { mode: 'interactive', userAction: 'Open the inbound PO with the prior quote pre-linked' },
    'io-2.2': { mode: 'interactive', userAction: 'Review the PO vs Quote comparison · accept auto-resolutions' },
    'io-2.3': { mode: 'interactive', userAction: 'Review the outbound Ack draft and send' },
    'io-2.4': { mode: 'interactive', userAction: 'Confirm production schedule and acknowledge risks' },
    'io-2.5': { mode: 'interactive', userAction: 'Open the shipping tracker and push to the dealer portal' },
    'io-2.6': { mode: 'interactive', userAction: 'Review the final invoice and payment status' },
}

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const INBOUND_OUTBOUND_STEP_MESSAGES: Record<string, string[]> = {
    'io-1.1': [
        'Inbound email detected · classifying intent…',
        'RFQ intent confirmed · 3 attachments',
        'OCR queued for SIF and spec sheet',
        'Floor plan tagged for downstream design check',
        'Surfacing to the order entry queue',
    ],
    'io-1.2': [
        'OCR · reading the SIF PDF',
        'TextExtract · parsing the spec sheet',
        'Line-item agent · normalizing ~80 lines',
        'Textile normalizer · graded-in references flagged',
        'Confidence scoring per field · 94% average',
    ],
    'io-1.3': [
        'QuoteBuilder · applying contract pricing',
        'Volume discount agent · 12% tier triggered',
        'Lead-time engine · 8-week base + 2-week buffer',
        'Textile check · 2 graded-in references need verification',
        'Draft ready for coordinator review',
    ],
    'io-1.4': [
        'Policy Engine · evaluating margin and lead-time gates',
        'Margin 32% · below threshold · routes for review',
        'Lead time 8w · within auto-approve range',
        'Approval chain · 3 levels engaged',
        'All gates cleared',
    ],
    'io-1.5': [
        'Composing the outbound quote document',
        'Attaching line-item breakdown + terms',
        'Channel of record · email',
        'Sent · opportunity moved to "Quoted"',
    ],
    'io-1.6': [
        'Generating proforma from approved quote',
        'Applying deposit rule · 30% before production',
        'Marking document type · PROFORMA · pre-shipment',
        'Staging for outbound send',
        'AR notified · expected payment date set',
    ],
    'io-2.1': [
        'Inbound PO detected · EDI/email',
        'Linking to originating opportunity',
        'Pre-loading prior quote for comparison',
        'Routing to order entry queue',
    ],
    'io-2.2': [
        'Field-by-field PO vs Quote',
        'Color code variations · auto-resolved',
        'Alternate finishes within tier · auto-resolved',
        'Quantity variance · within threshold',
        'No escalations · ready to ack',
    ],
    'io-2.3': [
        'Building EDI/855 acknowledgment',
        'Confirming quantities per line',
        'Setting ship-date commitments per zone',
        'Validating against production capacity',
        'Draft ready for coordinator review',
    ],
    'io-2.4': [
        'Scheduling on the production line',
        'Capacity load checked · 78%',
        'Material readiness · textile backorder flagged',
        'Schedule absorbed · ship-date held',
        'Notifying logistics',
    ],
    'io-2.5': [
        'Tracking modal · loading timeline',
        'Plan → Manufacturing → Shipping → Install',
        'Carrier + tracking number per zone',
        'ETA computed per delivery point',
        'Dealer portal sync · pushed',
    ],
    'io-2.6': [
        'Generating final invoice',
        'Applying proforma deposit credit',
        'Computing early-pay discount window',
        'Sent to dealer · AR aging started',
        'AP coordinator surfaced any supplier recon',
    ],
}

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const INBOUND_OUTBOUND_SELF_INDICATED: string[] = [
    'io-1.1', 'io-1.2', 'io-1.3', 'io-1.4', 'io-1.5', 'io-1.6',
    'io-2.1', 'io-2.2', 'io-2.3', 'io-2.4', 'io-2.5', 'io-2.6',
]
