// ─── Step behavior metadata ───────────────────────────────────────────────────
// Type definition for step behavior. Actual data lives in profile configs
// (src/config/profiles/*.ts) and is consumed via useDemoProfile().

export interface StepBehavior {
    mode: 'auto' | 'interactive';
    duration?: number;     // approximate seconds for auto steps
    aiSummary?: string;    // what AI is doing (auto steps)
    userAction?: string;   // what user should do (interactive steps)
}

// ─── Component ────────────────────────────────────────────────────────────────
// Replaced by DemoAIIndicator — an inline, non-overlapping indicator rendered
// inside the main content area. This component now returns null to avoid
// the fixed-position overlay that caused visual overlap issues.

export default function DemoStepBanner() {
    return null;
}
