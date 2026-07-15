// Export all UI components
import '../styles/index.css';

// Core components from Catalyst
export * from './catalyst';

// Theme Provider
export { ThemeProvider, useTheme, type ThemeConfig, type ThemeProviderProps } from './ThemeProvider';

// Navbar
export { default as Navbar } from './Navbar';

// File upload modal (F26.E port from canonical DS — same API, Headless UI impl)
export {
    FileUploadModal,
    type FileUploadModalProps,
    type FileUploadStep,
} from './file-upload-modal';

// Document review modal + companion primitives (F26.E.5 port from canonical)
export {
    DocumentReviewModal,
    FieldSection,
    FieldValueRow,
    ConfidenceIndicator,
    type DocumentReviewModalProps,
    type DocumentReviewTab,
    type FieldSectionProps,
    type FieldValueRowProps,
    type ConfidenceIndicatorProps,
} from './document-review-modal';

// Editable line table for line items grids (F26.E.5)
export {
    EditableLineTable,
    type EditableLineColumn,
    type EditableLineTableProps,
    type EditingCell,
} from './editable-line-table';

// Split-pane workflow review modal (F26.E.6 port from canonical)
export {
    SplitPaneReviewModal,
    type SplitPaneReviewModalProps,
} from './split-pane-review-modal';

// ── F45: 10 additional components ported from canonical ──────────────────
// Data list family
export { FilterPills, FilterPillCount,
    type FilterPillOption, type FilterPillsProps,
} from './filter-pills';
export { ViewToggle, type ViewToggleOption, type ViewToggleProps } from './view-toggle';
export { DataListToolbar, type DataListToolbarProps } from './data-list-toolbar';
export { StrataTopBar, TenantChip, ModePill,
    type StrataTopBarProps, type TenantChipProps, type ModePillProps,
} from './strata-top-bar';
export { DataListTable, type ColumnDef, type DataListTableProps } from './data-list-table';
export { DataListCard, DataListCardGrid,
    type DataListCardRow, type DataListCardProps, type DataListCardGridProps,
} from './data-list-card';
export { BulkActionBar, type BulkActionBarProps } from './bulk-action-bar';
// Funnel / pipeline
export { FunnelStepper, type FunnelStep, type FunnelStepperProps } from './funnel-stepper';
export { KanbanFunnel,
    type KanbanFunnelColumn, type KanbanFunnelProps,
} from './kanban-funnel';
// OCR / comparison
export { DiscrepancyRow, DiscrepancyComparisonBlock,
    type DiscrepancySeverity, type DiscrepancyDecision,
    type DiscrepancyComparisonBlockProps, type DiscrepancyRowProps,
} from './discrepancy-row';

// ── F4.5 · shared demo primitives (extracted from Leland canvases) ──────
export { MetricCard,
    type MetricCardProps, type MetricTone, type MetricSize,
} from './metric-card';
export { Callout,
    type CalloutProps, type CalloutTone, type CalloutVariant,
} from './callout';
export { ProgressBar,
    type ProgressBarProps, type ProgressTone, type ProgressHeight,
} from './progress-bar';
export { PageShell,
    type PageShellProps, type PageShellIconTone,
} from './page-shell';
export { PipelineRail,
    type PipelineRailProps, type PipelineRailStep,
} from './pipeline-rail';

// Tokens & Utils
export { tokens, type TokenKey } from '../tokens/tokens';
export { cn } from '../utils/cn';
