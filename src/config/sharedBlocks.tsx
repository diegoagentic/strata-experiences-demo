// ═══════════════════════════════════════════════════════════════════════════════
// Shared Building Blocks + Widgets registry — surfaces the 14 shared modules
// and 3 widgets from docs/experience-map.csv as standalone previews.
//
// A "shared block" is a slice of Strata that appears in multiple experiences
// (Dashboard, Approval Chain, Notification Center...). We surface each one as
// its own dropdown entry so stakeholders can inspect it in isolation, without
// picking a specific client demo.
//
// Rendering strategy: the app-wide providers (Auth · DemoProfile · Demo ·
// Tenant · Theme) are already mounted at src/main.tsx. Each block renders its
// existing production component under a minimal <SharedBlockShell> — no tour,
// no per-profile navigation, no role switcher.
// ═══════════════════════════════════════════════════════════════════════════════

import type { ComponentType } from 'react';

// Existing components consumed as blocks — imported directly, no re-wrapping.
import Dashboard from '../Dashboard';
import Inventory from '../Inventory';
import Transactions from '../Transactions';
import MAC from '../MAC';
import Catalogs from '../Catalogs';

import EmailSimulation from '../components/simulations/EmailSimulation';
import DealerMonitorKanban from '../components/simulations/DealerMonitorKanban';
import ExpertHubTransactions from '../components/simulations/ExpertHubTransactions';
import ConversationalSurvey from '../components/simulations/ConversationalSurvey';
import CRMSimulation from '../components/simulations/CRMSimulation';

// Standalone blocks / widgets that need a light wrapper (state, mock props).
import ApprovalChainBlock from '../blocks/ApprovalChainBlock';
import ERPSyncBlock from '../blocks/ERPSyncBlock';
import OrderCreationBlock from '../blocks/OrderCreationBlock';
import NotificationCenterBlock from '../blocks/NotificationCenterBlock';
import ThreeWayMatchBlock from '../blocks/ThreeWayMatchBlock';
import SmartQuoteHubBlock from '../blocks/SmartQuoteHubBlock';
import ConfidenceScoreBlock from '../blocks/ConfidenceScoreBlock';

export type SharedBlockKind = 'shared-block' | 'widget';

/**
 * F18.polish · determines the frame around the block preview:
 *  · 'strata-shell'     — Strata-branded compact navbar (default · Strata primitives).
 *  · 'external-preview' — warning banner "legacy tool Strata replaces" (Email/ServiceNow clones).
 *  · 'mobile-preview'   — phone-shaped frame around the body (mobile scenes).
 */
export type SharedBlockFrameMode = 'strata-shell' | 'external-preview' | 'mobile-preview';

export interface SharedBlockEntry {
  id: string;                       // stable slug (matches ?block=<id> in URL)
  kind: SharedBlockKind;
  title: string;                    // shown in dropdown + block header
  icon: string;                     // emoji
  description: string;              // one-liner shown in block header
  usedByExperiences?: string[];     // profile ids that consume this block (traceability)
  frameMode?: SharedBlockFrameMode; // rendering frame · defaults to 'strata-shell'
  component: ComponentType;
}

// Page-level components need the 4 navigation callbacks. In block mode they
// resolve to no-ops so the block does not try to escape into other pages.
const noop = () => {};
const wrapPage = (Comp: ComponentType<any>) => {
  const Wrapped = () => (
    <Comp
      onLogout={noop}
      onNavigateToDetail={noop}
      onNavigateToWorkspace={noop}
      onNavigate={noop}
    />
  );
  Wrapped.displayName = `BlockWrap(${Comp.displayName || Comp.name || 'Anon'})`;
  return Wrapped;
};

const wrapSimulation = (Comp: ComponentType<any>) => {
  // `previewMode` tells the simulation it's rendered as a standalone shared
  // block (no demo tour to gate on / advance) so it can autoplay + surface
  // its own completion state. Simulations that ignore the prop are unaffected.
  const Wrapped = () => <Comp onNavigate={noop} previewMode={true} />;
  Wrapped.displayName = `BlockWrap(${Comp.displayName || Comp.name || 'Anon'})`;
  return Wrapped;
};

export const SHARED_BLOCKS: SharedBlockEntry[] = [
  // ─── SHARED (14) ───────────────────────────────────────────────────────────
  {
    id: 'email-ingestion',
    kind: 'shared-block',
    title: 'Email Ingestion',
    icon: '📧',
    description: 'RFQ email intake · auto-queues for AI processing.',
    usedByExperiences: ['coi', 'acme'],
    frameMode: 'external-preview',
    component: wrapSimulation(EmailSimulation),
  },
  {
    id: 'dealer-kanban',
    kind: 'shared-block',
    title: 'Dealer Kanban Pipeline',
    icon: '📋',
    description: 'AI extraction · normalization · SIF quote-draft generation.',
    usedByExperiences: ['coi', 'acme', 'continua', 'ops'],
    component: wrapSimulation(DealerMonitorKanban),
  },
  {
    id: 'expert-hub-tx',
    kind: 'shared-block',
    title: 'Expert Hub Transactions',
    icon: '🔀',
    description: 'HITL review & reconciliation of quotes & acknowledgements.',
    usedByExperiences: ['coi', 'acme', 'continua', 'ops'],
    component: wrapPage(ExpertHubTransactions),
  },
  {
    id: 'mac',
    kind: 'shared-block',
    title: 'MAC / Service Center',
    icon: '🛠️',
    description: 'Warranty & labor-claim HITL processing.',
    usedByExperiences: ['coi', 'acme', 'continua'],
    component: wrapPage(MAC),
  },
  {
    id: 'dashboard-shell',
    kind: 'shared-block',
    title: 'Dashboard Shell',
    icon: '📊',
    description: 'Approvals · role-based notifications · financial rollups.',
    usedByExperiences: ['coi', 'acme', 'continua', 'ops', 'dupler'],
    component: wrapPage(Dashboard),
  },
  {
    id: 'crm-sim',
    kind: 'shared-block',
    title: 'CRM Simulation',
    icon: '👥',
    description: 'Project auto-create · Customer 360 · budget-vs-actual widget.',
    usedByExperiences: ['coi', 'ops', 'continua'],
    component: wrapSimulation(CRMSimulation),
  },
  {
    id: 'approval-chain',
    kind: 'shared-block',
    title: 'Approval Chain Modal',
    icon: '✅',
    description: 'Multi-level policy-engine approval UI.',
    usedByExperiences: ['coi', 'leland', 'wrg'],
    component: ApprovalChainBlock,
  },
  {
    id: 'conv-survey',
    kind: 'shared-block',
    title: 'Conversational Survey',
    icon: '💬',
    description: 'Structured AI-guided survey (post-occupancy / intake).',
    usedByExperiences: ['continua', 'clc'],
    frameMode: 'mobile-preview',
    component: wrapSimulation(ConversationalSurvey),
  },
  {
    id: 'inventory-mgmt',
    kind: 'shared-block',
    title: 'Inventory Management',
    icon: '📦',
    description: 'Forecasting · reuse cataloging · multi-location sync · receiving/QC.',
    usedByExperiences: ['continua', 'dupler'],
    component: wrapPage(Inventory),
  },
  {
    id: 'tx-screen',
    kind: 'shared-block',
    title: 'Transactions Screen',
    icon: '🔄',
    description: 'Multi-vendor PO / ACK / receiving order lifecycle.',
    usedByExperiences: ['continua', 'inbound-outbound'],
    component: wrapPage(Transactions),
  },
  {
    id: 'catalog-rules',
    kind: 'shared-block',
    title: 'Catalog / Rule Builder',
    icon: '📚',
    description: 'Quote setup · client policy & rule governance.',
    usedByExperiences: ['coi', 'acme'],
    component: wrapPage(Catalogs),
  },
  {
    id: 'order-forms',
    kind: 'shared-block',
    title: 'Order Creation Forms',
    icon: '📝',
    description: 'Order creation & import-from-quote flows.',
    usedByExperiences: ['coi', 'acme', 'ops'],
    component: OrderCreationBlock,
  },
  {
    id: 'erp-sync',
    kind: 'shared-block',
    title: 'ERP Sync Modal',
    icon: '🔗',
    description: 'QuickBooks / CORE sync confirmation & batch preview.',
    usedByExperiences: ['ops', 'dupler'],
    component: ERPSyncBlock,
  },
  {
    id: 'notif-center',
    kind: 'shared-block',
    title: 'Notification / Action Center',
    icon: '🔔',
    description: 'Role-based notification digest & chat view.',
    usedByExperiences: ['all'],
    component: NotificationCenterBlock,
  },

  // ─── WIDGETS (3) ───────────────────────────────────────────────────────────
  {
    id: 'three-way-match',
    kind: 'widget',
    title: 'Three-Way Match View',
    icon: '⚖️',
    description: 'PO ↔ ACK ↔ Receipt reconciliation widget.',
    usedByExperiences: ['ops'],
    component: ThreeWayMatchBlock,
  },
  {
    id: 'smart-quote-hub',
    kind: 'widget',
    title: 'Smart Quote Hub',
    icon: '💰',
    description: 'Generic quoting hub widget reused across experiences.',
    usedByExperiences: ['coi', 'acme', 'leland'],
    component: SmartQuoteHubBlock,
  },
  {
    id: 'confidence-score',
    kind: 'widget',
    title: 'Confidence Score Badge',
    icon: '🎯',
    description: 'AI confidence indicator reused across quote & ack review.',
    usedByExperiences: ['coi', 'ops', 'dupler', 'mbi'],
    component: ConfidenceScoreBlock,
  },
];

// Lookup helper — used by App.tsx to resolve ?block=<id> in the URL.
export const findSharedBlock = (id: string | null | undefined): SharedBlockEntry | undefined =>
  id ? SHARED_BLOCKS.find(b => b.id === id) : undefined;
