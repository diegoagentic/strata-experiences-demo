import { Fragment, useMemo, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, FolderTree, Folder, FileText, Sparkles, Copy, ExternalLink, Users, CheckCircle2 } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import {
    ASSET_TYPE_META,
    SHAREPOINT_FOLDER_URL,
    type AssetEntry,
} from './shared/assetSeedingData'

interface CLCSharePointFolderModalProps {
    isOpen: boolean
    onClose: () => void
    /** Effective assets in the published folder · drives the tree + counts. */
    assets: AssetEntry[]
    /** Display date shown on the published banner. */
    publishedDate?: string
}

type AssetTypeKey = AssetEntry['type']

/**
 * Live SharePoint folder viewer · simulates the folder browser the
 * installer would see after the demo publishes the consolidated assets.
 * Replaces the previous `<a href={url}>Open folder</a>` that 404'd
 * because the URL is a demo mock · per Diego: "ese open folder es una
 * simulación y debería ser un modal".
 *
 * Mirrors the folder-tree shape of `PublishLeft` (CLCAssetConsolidationModal)
 * but standalone and clickable · each asset row opens an inline PDF
 * preview using the same pattern as the consolidation modal.
 */
export default function CLCSharePointFolderModal({
    isOpen, onClose, assets, publishedDate = 'Jun 2, 2026',
}: CLCSharePointFolderModalProps) {
    const [previewAsset, setPreviewAsset] = useState<AssetEntry | null>(null)
    // Sidebar-aware offset · same pattern as the consolidation modal so
    // the viewer doesn't sit flush against the tour panel.
    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:pl-96' : ''

    const grouped = useMemo(() => {
        const map: Record<AssetTypeKey, AssetEntry[]> = {
            'shop-drawing': [], 'ack': [], 'site-plan': [], 'runbook': [],
        }
        for (const a of assets) map[a.type].push(a)
        return map
    }, [assets])

    const totalSizeKb = assets.reduce((s, a) => s + a.sizeKb, 0)
    const flaggedCount = assets.filter(a => a.aiFlagged).length

    const copyUrl = () => {
        navigator.clipboard?.writeText(SHAREPOINT_FOLDER_URL).catch(() => {})
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[250]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" />
                </TransitionChild>
                <div className={`fixed inset-0 flex items-center justify-center p-4 ${offsetClass}`}>
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <DialogPanel className="w-full max-w-[960px] h-[82vh] max-h-[780px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
                            {/* ─── Header ─── */}
                            <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-4">
                                <div className="flex items-start gap-2.5 min-w-0">
                                    <div className="h-9 w-9 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
                                        <FolderTree className="h-4 w-4 text-success" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base font-bold text-foreground truncate">Fairport-Library-Phase1</h2>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <code className="text-[10px] text-muted-foreground font-mono truncate">{SHAREPOINT_FOLDER_URL}</code>
                                            <button
                                                onClick={copyUrl}
                                                title="Copy URL"
                                                className="p-0.5 rounded hover:bg-muted transition-colors shrink-0"
                                            >
                                                <Copy className="h-3 w-3 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={onClose} aria-label="Close" className="p-1.5 -m-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* ─── Published banner ─── */}
                            <div className="px-5 py-2.5 border-b border-border bg-success/5 flex items-start gap-2 flex-wrap">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                                <p className="text-xs text-foreground leading-snug flex-1 min-w-0">
                                    <strong className="text-foreground">Live</strong> · published {publishedDate} · {assets.length} asset{assets.length !== 1 ? 's' : ''} · {(totalSizeKb / 1024).toFixed(1)} MB
                                    {flaggedCount > 0 && (
                                        <span className="text-amber-700 dark:text-amber-300"> · {flaggedCount} flagged · operator verified</span>
                                    )}
                                </p>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <Users className="h-3 w-3" />
                                    Install crew + Director of Operations
                                </span>
                            </div>

                            {/* ─── Folder browser body ─── */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-3">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                                    Folder contents · click any file to preview
                                </div>
                                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border">
                                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs font-mono text-foreground">Fairport-Library-Phase1/</span>
                                    </div>
                                    <div className="p-3 space-y-3">
                                        {(Object.keys(grouped) as AssetTypeKey[]).map(type => {
                                            if (grouped[type].length === 0) return null
                                            const folderName = ASSET_TYPE_META[type].label.toLowerCase().replace(' ', '-') + 's'
                                            return (
                                                <div key={type}>
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <Folder className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                        <span className="text-xs font-mono font-bold text-foreground">{folderName}/</span>
                                                        <span className="text-[10px] text-muted-foreground">{grouped[type].length} file{grouped[type].length !== 1 ? 's' : ''}</span>
                                                    </div>
                                                    <div className="ml-5 space-y-0.5">
                                                        {grouped[type].map(a => (
                                                            <button
                                                                key={a.id}
                                                                onClick={() => setPreviewAsset(a)}
                                                                className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/30 transition-colors text-left"
                                                            >
                                                                <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                                                                <span className="font-mono text-[11px] text-foreground truncate flex-1">{a.name}</span>
                                                                {a.aiFlagged && (
                                                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 uppercase tracking-wider">
                                                                        <Sparkles className="h-2.5 w-2.5" />
                                                                        Flag
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{a.sizeKb.toLocaleString()} KB</span>
                                                                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* ─── Footer ─── */}
                            <div className="border-t border-border px-5 py-2.5 bg-muted/20 flex items-center justify-between gap-3 flex-wrap">
                                <div className="text-[11px] text-muted-foreground italic">
                                    Strata-published · install crew has access via the iPad link.
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-md text-foreground border border-border hover:bg-muted transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>

            {/* Inline PDF preview · same pattern as CLCAssetConsolidationModal */}
            <Transition show={previewAsset !== null} as={Fragment}>
                <Dialog onClose={() => setPreviewAsset(null)} className="relative z-[270]">
                    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" />
                    <div className={`fixed inset-0 flex items-center justify-center p-3 ${offsetClass}`}>
                        <DialogPanel className="w-full h-[88vh] max-w-[1000px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="font-mono text-sm font-semibold text-foreground truncate">{previewAsset?.name}</span>
                                    {previewAsset && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${ASSET_TYPE_META[previewAsset.type].colorClass}`}>
                                            {ASSET_TYPE_META[previewAsset.type].label}
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => setPreviewAsset(null)} aria-label="Close preview" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 bg-muted/40 flex items-center justify-center text-muted-foreground">
                                <div className="text-center max-w-sm p-8">
                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-sm font-semibold text-foreground mb-1">{previewAsset?.name}</p>
                                    <p className="text-xs">PDF preview (mock) · in production this renders the actual document inline from SharePoint.</p>
                                    {previewAsset?.aiFlagged && (
                                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 p-3 text-left">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Sparkles className="h-3.5 w-3.5 text-zinc-800 dark:text-zinc-200" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Strata AI flag</span>
                                            </div>
                                            <p className="text-xs text-foreground">{previewAsset.flagReason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            </Transition>
        </Transition>
    )
}
