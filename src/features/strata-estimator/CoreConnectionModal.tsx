// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — CORE Connection Modal
// v8 · Paso A · Replaces the v7 FileImportModal with a multi-phase flow that
// mimics David logging into CORE, browsing the estimating queue, selecting
// the JPS project, and pulling the attached files into Strata.
//
// Phases (orchestrated by the Shell):
//   source-picker       → choose "Connect to CORE" vs manual upload
//   core-login          → embedded CORE login screen
//   core-connecting     → handshake spinner
//   core-dashboard      → embedded CORE queue with 5 pending projects
//   core-project-detail → embedded CORE project view (site constraints + PDFs)
//   extracting-*        → same four beats as the legacy FileImportModal
//                         (uploading → parsing → extracting → done)
//
// Simulated cursor targets the active element per phase so the audience can
// see the click happen. The Shell drives phase + progress + cursor state.
// ═══════════════════════════════════════════════════════════════════════════════

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import { useDemo } from '../../context/DemoContext'
import {
    Activity,
    Bell,
    Building2,
    Check,
    CheckCircle2,
    ChevronRight,
    Database,
    FileText,
    Folder,
    KeyRound,
    Lock,
    MousePointer2,
    Search,
    Shield,
    Sparkles,
    Stethoscope,
    UploadCloud,
    User,
} from 'lucide-react'
import { clsx } from 'clsx'

export type CorePhase =
    | 'source-picker'
    | 'core-login'
    | 'core-connecting'
    | 'core-dashboard'
    | 'core-project-detail'
    | 'extracting-uploading'
    | 'extracting-parsing'
    | 'extracting-extracting'
    | 'extracting-done'

export type CursorTarget =
    | 'connect-core'
    | 'core-authenticate'
    | 'project-jps'
    | 'pull-project'
    | null

interface CoreConnectionModalProps {
    isOpen: boolean
    phase: CorePhase
    progress: number
    cursorTarget: CursorTarget
    cursorClicked: boolean
}

interface CoreProject {
    id: string
    customer: string
    location: string
    items: number
    received: string
    priority: 'High' | 'Standard'
    status: 'New' | 'In progress' | 'Awaiting review'
    highlighted?: boolean
}

const CORE_QUEUE: CoreProject[] = [
    {
        id: 'JPS_116719',
        customer: 'JPS Health Network',
        location: 'Fort Worth, TX',
        items: 24,
        received: '2 min ago',
        priority: 'High',
        status: 'New',
        highlighted: true,
    },
    {
        id: 'TCA_118204',
        customer: 'Tarrant County Admin',
        location: 'Fort Worth, TX',
        items: 18,
        received: '1 hr ago',
        priority: 'Standard',
        status: 'New',
    },
    {
        id: 'FROST_117882',
        customer: 'Frost Bank HQ',
        location: 'Dallas, TX',
        items: 42,
        received: '3 hr ago',
        priority: 'Standard',
        status: 'In progress',
    },
    {
        id: 'THR_117640',
        customer: 'Texas Health Resources',
        location: 'Arlington, TX',
        items: 31,
        received: '6 hr ago',
        priority: 'High',
        status: 'Awaiting review',
    },
    {
        id: 'MISD_117512',
        customer: 'Mesquite ISD',
        location: 'Mesquite, TX',
        items: 12,
        received: 'Yesterday',
        priority: 'Standard',
        status: 'In progress',
    },
]

const JPS_FILES = [
    { name: 'JPS_PSS_ANCILLARY.pdf', size: '5.4 MB', type: 'Product Selection Sheet' },
    { name: 'JPS_Spec_Sheet.pdf',    size: '2.8 MB', type: 'Product Spec Sheet' },
    { name: 'JPS_Contract.pdf',      size: '680 KB', type: 'Contract / MSA' },
]

const JPS_SITE_CONSTRAINTS = [
    { label: 'Venue type',     value: 'Hospital campus',       flagged: true },
    { label: 'Location',       value: 'Downtown Fort Worth',   flagged: true },
    { label: 'Floor',          value: '2nd floor',             flagged: false },
    { label: 'Loading dock',   value: 'None (elevator access)', flagged: true },
    { label: 'Push distance',  value: '~180 ft',               flagged: false },
    { label: 'After hours',    value: 'No',                    flagged: false },
    { label: 'Transport',      value: '32 mi · Dallas → Fort Worth', flagged: false },
]

const EXTRACTING_LABELS: Record<string, string> = {
    'extracting-uploading':  'Downloading CORE attachments · 3 files (8.9 MB)',
    'extracting-parsing':    'Parsing PDFs · reading line items and rooms',
    'extracting-extracting': 'Extracting 24 products · mapping to labor categories',
    'extracting-done':       'CORE import complete · opening JPS dossier',
}

export default function CoreConnectionModal({
    isOpen,
    phase,
    progress,
    cursorTarget,
    cursorClicked,
}: CoreConnectionModalProps) {
    const isExtracting = phase.startsWith('extracting')
    const { isDemoActive, isSidebarCollapsed } = useDemo()
    // When the demo guide sidebar is visible (fixed left-0 top-0 w-80 z-[110]),
    // offset the modal so the backdrop and the centered panel sit in the
    // remaining viewport space and never cover the guide.
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:left-80' : ''

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={() => {}}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={clsx('fixed inset-0 bg-zinc-950/80 backdrop-blur-md', offsetClass)} />
                </TransitionChild>

                <div className={clsx('fixed inset-0 flex items-center justify-center p-4', offsetClass)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-4xl bg-card dark:bg-zinc-900 rounded-2xl border border-border shadow-2xl overflow-hidden">

                            {/* Global modal header — same across phases */}
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-foreground dark:text-primary shrink-0">
                                    <Database className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                        Strata Estimator · New project ingestion
                                    </p>
                                    <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                                        {phaseTitle(phase)}
                                    </p>
                                </div>
                                <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                    <Sparkles className="w-3 h-3" />
                                    AI Agent
                                </span>
                            </div>

                            {/* Phase-specific body */}
                            <div className="relative">
                                {phase === 'source-picker' && (
                                    <SourcePicker
                                        cursorTarget={cursorTarget}
                                        cursorClicked={cursorClicked}
                                    />
                                )}
                                {phase === 'core-login' && (
                                    <CoreLogin
                                        cursorTarget={cursorTarget}
                                        cursorClicked={cursorClicked}
                                    />
                                )}
                                {phase === 'core-connecting' && <CoreConnecting />}
                                {phase === 'core-dashboard' && (
                                    <CoreDashboard
                                        cursorTarget={cursorTarget}
                                        cursorClicked={cursorClicked}
                                    />
                                )}
                                {phase === 'core-project-detail' && (
                                    <CoreProjectDetail
                                        cursorTarget={cursorTarget}
                                        cursorClicked={cursorClicked}
                                    />
                                )}
                                {isExtracting && (
                                    <ExtractingPhase
                                        phase={phase}
                                        progress={progress}
                                    />
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Phase sub-components
// ═══════════════════════════════════════════════════════════════════════════════

function phaseTitle(phase: CorePhase): string {
    switch (phase) {
        case 'source-picker':        return 'Choose a source'
        case 'core-login':           return 'Sign in to CORE'
        case 'core-connecting':      return 'Connecting to CORE'
        case 'core-dashboard':       return 'CORE · Estimating queue'
        case 'core-project-detail':  return 'CORE · Project detail'
        case 'extracting-uploading':
        case 'extracting-parsing':
        case 'extracting-extracting':
        case 'extracting-done':      return 'Importing into Strata'
    }
}

function SimulatedCursor({
    active,
    clicked,
    className,
}: {
    active: boolean
    clicked: boolean
    className?: string
}) {
    if (!active) return null
    return (
        <MousePointer2
            className={clsx(
                'absolute w-5 h-5 text-foreground drop-shadow-lg pointer-events-none transition-all duration-300',
                clicked
                    ? 'translate-x-0 translate-y-0 scale-90'
                    : 'translate-x-1 translate-y-1 animate-bounce',
                className
            )}
            aria-hidden
        />
    )
}

// ─── Phase 1 · Source picker ──────────────────────────────────────────────

function SourcePicker({
    cursorTarget,
    cursorClicked,
}: {
    cursorTarget: CursorTarget
    cursorClicked: boolean
}) {
    const coreActive = cursorTarget === 'connect-core'
    return (
        <div className="p-8 bg-muted dark:bg-muted/10 dark:bg-zinc-900 min-h-[420px]">
            <p className="text-xs text-muted-foreground text-center mb-6">
                Strata can pull the estimating request directly from CORE, or you
                can upload the PDFs manually.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Connect to CORE */}
                <div
                    className={clsx(
                        'relative rounded-2xl p-6 border-2 transition-all duration-300',
                        coreActive
                            ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-4 ring-primary/30 shadow-lg shadow-primary/20'
                            : 'border-border bg-card dark:bg-zinc-800 hover:border-primary/40',
                        cursorClicked && coreActive && 'scale-[0.98]'
                    )}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                            <Database className="w-5 h-5 text-foreground dark:text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">Connect to CORE</p>
                            <p className="text-[10px] text-muted-foreground">Recommended · ERP handshake</p>
                        </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug mb-4">
                        Pull the estimating queue from CORE, select the project,
                        and auto-download the attached Product Selection Sheet +
                        spec PDFs.
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-foreground dark:text-primary">
                        <Sparkles className="w-3 h-3" />
                        Full sync available
                    </div>
                    <SimulatedCursor
                        active={coreActive}
                        clicked={cursorClicked}
                        className="right-4 bottom-4"
                    />
                </div>

                {/* Manual upload */}
                <div className="rounded-2xl p-6 border-2 border-border bg-card dark:bg-zinc-800 opacity-60">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center">
                            <UploadCloud className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">Manual upload</p>
                            <p className="text-[10px] text-muted-foreground">Fallback · drag &amp; drop PDFs</p>
                        </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                        Use this if CORE is offline or the request came in outside
                        of the normal queue.
                    </p>
                </div>
            </div>
        </div>
    )
}

// ─── Phase 2 · CORE login ─────────────────────────────────────────────────

function CoreLogin({
    cursorTarget,
    cursorClicked,
}: {
    cursorTarget: CursorTarget
    cursorClicked: boolean
}) {
    const authActive = cursorTarget === 'core-authenticate'
    return (
        <div className="p-8 bg-muted/10 dark:bg-zinc-900 min-h-[420px] flex items-center justify-center">
            {/* Embedded CORE login card */}
            <div className="w-full max-w-sm rounded-2xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 shadow-2xl overflow-hidden">
                <div className="px-6 pt-6 pb-4 text-center border-b border-zinc-800">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-base font-black text-foreground dark:text-white tracking-tight">
                            CORE
                        </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        WRG Texas · Dealer Management System
                    </p>
                </div>
                <div className="px-6 py-5 space-y-3">
                    <div>
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            Email
                        </label>
                        <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 dark:bg-zinc-900 border border-border dark:border-zinc-800">
                            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs text-foreground dark:text-white font-mono truncate">
                                dpark@wrgtexas.com
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            Password
                        </label>
                        <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 dark:bg-zinc-900 border border-border dark:border-zinc-800">
                            <KeyRound className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs text-foreground dark:text-white font-mono tracking-[0.2em]">
                                ••••••••••
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <button
                            type="button"
                            disabled
                            className={clsx(
                                'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-600 text-foreground dark:text-white shadow-lg transition-all duration-200 mt-2',
                                authActive && cursorClicked && 'scale-95 ring-4 ring-blue-400/50'
                            )}
                        >
                            <Shield className="w-3.5 h-3.5" />
                            Authenticate
                        </button>
                        <SimulatedCursor
                            active={authActive}
                            clicked={cursorClicked}
                            className="right-2 -bottom-2"
                        />
                    </div>
                </div>
                <div className="px-6 pb-4 text-center">
                    <p className="text-[9px] text-muted-foreground">
                        Session secured by WRG IT · SSO enabled
                    </p>
                </div>
            </div>
        </div>
    )
}

// ─── Phase 3 · Connecting spinner ─────────────────────────────────────────

function CoreConnecting() {
    return (
        <div className="p-10 bg-muted/10 dark:bg-zinc-900 min-h-[420px] flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 flex items-center justify-center ring-4 ring-blue-500/20">
                <Shield className="w-7 h-7 text-blue-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-foreground dark:text-white">
                    Establishing secure session with CORE…
                </p>
            </div>
            <p className="text-[11px] text-muted-foreground">
                Authenticating · fetching permissions · loading estimating queue
            </p>
        </div>
    )
}

// ─── Phase 4 · CORE dashboard ─────────────────────────────────────────────

function CoreDashboard({
    cursorTarget,
    cursorClicked,
}: {
    cursorTarget: CursorTarget
    cursorClicked: boolean
}) {
    const jpsActive = cursorTarget === 'project-jps'
    return (
        <div className="bg-muted/10 dark:bg-zinc-900 min-h-[420px]">
            {/* Fake CORE navbar */}
            <div className="flex items-center gap-3 px-5 py-3 bg-card dark:bg-zinc-950 border-b border-border dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-sm font-black text-foreground dark:text-white tracking-tight">
                        CORE
                    </span>
                </div>
                <div className="h-4 w-px bg-zinc-800" />
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Folder className="w-3 h-3" />
                    <span>Projects</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground dark:text-white">Estimating queue</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800 text-[10px] text-muted-foreground">
                        <Search className="w-3 h-3" />
                        Search projects…
                    </div>
                    <div className="relative">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
                        <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-foreground dark:text-white">
                            DP
                        </div>
                        <span className="text-[10px] text-foreground dark:text-white">David Park</span>
                    </div>
                </div>
            </div>

            {/* Queue table */}
            <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">
                        My estimating queue
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                        5 pending · sorted by priority
                    </p>
                </div>
                <div className="rounded-lg bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 overflow-hidden">
                    {/* Column headers */}
                    <div className="grid grid-cols-[1.8fr_1fr_0.5fr_0.8fr_0.7fr_0.8fr] gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Customer</span>
                        <span>Location</span>
                        <span className="text-right">Items</span>
                        <span>Received</span>
                        <span>Priority</span>
                        <span>Status</span>
                    </div>
                    {/* Rows */}
                    {CORE_QUEUE.map((project) => {
                        const isJps = project.id === 'JPS_116719'
                        const activeRow = isJps && jpsActive
                        return (
                            <div
                                key={project.id}
                                className={clsx(
                                    'relative grid grid-cols-[1.8fr_1fr_0.5fr_0.8fr_0.7fr_0.8fr] gap-2 px-4 py-2.5 border-b border-zinc-800 last:border-b-0 text-[11px] transition-all duration-300',
                                    project.highlighted && 'bg-blue-500/5',
                                    activeRow &&
                                        'bg-blue-500/15 ring-1 ring-inset ring-blue-500/40',
                                    cursorClicked && activeRow && 'scale-[0.995]'
                                )}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    {project.customer.includes('Health') ||
                                    project.customer.includes('Resources') ? (
                                        <Stethoscope className="w-3 h-3 text-blue-400 shrink-0" />
                                    ) : (
                                        <Building2 className="w-3 h-3 text-muted-foreground shrink-0" />
                                    )}
                                    <span className="text-foreground dark:text-white font-semibold truncate">
                                        {project.customer}
                                    </span>
                                    {project.status === 'New' && (
                                        <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                                            New
                                        </span>
                                    )}
                                </div>
                                <span className="text-muted-foreground truncate">
                                    {project.location}
                                </span>
                                <span className="text-right text-muted-foreground tabular-nums">
                                    {project.items}
                                </span>
                                <span className="text-muted-foreground">{project.received}</span>
                                <span
                                    className={clsx(
                                        'font-semibold',
                                        project.priority === 'High'
                                            ? 'text-red-400'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    {project.priority}
                                </span>
                                <span className="text-muted-foreground truncate">
                                    {project.status}
                                </span>
                                {activeRow && (
                                    <SimulatedCursor
                                        active
                                        clicked={cursorClicked}
                                        className="right-4 bottom-1"
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ─── Phase 5 · Project detail ─────────────────────────────────────────────

function CoreProjectDetail({
    cursorTarget,
    cursorClicked,
}: {
    cursorTarget: CursorTarget
    cursorClicked: boolean
}) {
    const pullActive = cursorTarget === 'pull-project'
    return (
        <div className="bg-muted/10 dark:bg-zinc-900 min-h-[420px]">
            {/* CORE breadcrumb bar */}
            <div className="flex items-center gap-2 px-5 py-2.5 bg-card dark:bg-zinc-950 border-b border-border dark:border-zinc-800 text-[10px] text-muted-foreground">
                <Folder className="w-3 h-3" />
                <span>Projects</span>
                <ChevronRight className="w-3 h-3" />
                <span>Estimating queue</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground dark:text-white font-semibold">JPS Health Network</span>
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold uppercase tracking-wider">
                    New · assigned to you
                </span>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left · Customer + attached files */}
                <div className="space-y-3">
                    <div className="rounded-xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Stethoscope className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Customer
                            </span>
                        </div>
                        <p className="text-sm font-bold text-foreground dark:text-white">
                            JPS Health Network
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Health Center for Women · Fort Worth, TX
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Project #JPS_116719 · 24 line items
                        </p>
                    </div>

                    <div className="rounded-xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Attached files
                            </span>
                        </div>
                        <ul className="space-y-1.5">
                            {JPS_FILES.map((file) => (
                                <li
                                    key={file.name}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded bg-zinc-900/80 border border-zinc-800"
                                >
                                    <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-foreground dark:text-white font-semibold truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground truncate">
                                            {file.type}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-[9px] text-muted-foreground tabular-nums">
                                        {file.size}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right · Site constraints + pull CTA */}
                <div className="flex flex-col gap-3">
                    <div className="rounded-xl bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 p-4 flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <Activity className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Site constraints · set by sales
                            </span>
                        </div>
                        <ul className="space-y-1.5">
                            {JPS_SITE_CONSTRAINTS.map((row) => (
                                <li
                                    key={row.label}
                                    className="flex items-center justify-between gap-2 text-[10px]"
                                >
                                    <span className="text-muted-foreground">{row.label}</span>
                                    <span
                                        className={clsx(
                                            'font-semibold truncate flex items-center gap-1',
                                            row.flagged ? 'text-amber-400' : 'text-foreground dark:text-white'
                                        )}
                                    >
                                        {row.flagged && <Sparkles className="w-2.5 h-2.5" />}
                                        {row.value}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative">
                        <button
                            type="button"
                            disabled
                            className={clsx(
                                'w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/40 transition-all duration-200',
                                pullActive && cursorClicked &&
                                    'scale-95 ring-4 ring-primary/60 shadow-xl shadow-primary/50'
                            )}
                        >
                            <Database className="w-4 h-4" />
                            Pull into Strata
                        </button>
                        <SimulatedCursor
                            active={pullActive}
                            clicked={cursorClicked}
                            className="right-4 -bottom-3"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Phase 6-9 · Extracting ───────────────────────────────────────────────

function ExtractingPhase({
    phase,
    progress,
}: {
    phase: CorePhase
    progress: number
}) {
    const clamped = Math.min(100, Math.max(0, progress))
    const isDone = phase === 'extracting-done'
    return (
        <div className="p-8 bg-muted dark:bg-muted/10 dark:bg-zinc-900 min-h-[420px] flex flex-col items-center justify-center">
            <div
                className={clsx(
                    'w-16 h-16 rounded-2xl flex items-center justify-center ring-4 transition-all duration-300',
                    isDone
                        ? 'bg-green-500/15 ring-green-500/30'
                        : 'bg-primary/15 ring-primary/30'
                )}
            >
                {isDone ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                ) : (
                    <Database className="w-8 h-8 text-foreground dark:text-primary animate-pulse" />
                )}
            </div>

            <p className="mt-5 text-sm font-bold text-foreground">
                CORE · Project JPS_116719
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
                {EXTRACTING_LABELS[phase] ?? ''}
            </p>

            <div className="w-full max-w-md mt-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Progress
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider tabular-nums">
                        {Math.round(clamped)}%
                    </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${clamped}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 mt-5 text-[10px] text-muted-foreground">
                {isDone ? (
                    <Check className="w-3 h-3 text-green-500" />
                ) : (
                    <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
                <span>
                    3 files · JPS_PSS_ANCILLARY.pdf · JPS_Spec_Sheet.pdf · JPS_Contract.pdf
                </span>
            </div>
        </div>
    )
}
