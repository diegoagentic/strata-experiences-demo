/**
 * COMPONENT: SpecsDocViewer
 * Shared document viewer used in both Step 1.3 (DesignerResponseScene) and
 * Step 1.4 (POLaborScene). Renders the Miller Knoll specs.pdf + sif.csv
 * tabbed viewer with floor plan SVG.
 */

import { useState } from 'react'
import { FileText } from 'lucide-react'

interface SpecsDocViewerProps {
    confirmed?: boolean
}

const PDF_SPECS = [
    { code: 'HMI-WS-2400', name: 'Locale Open-Plan Workstation', qty: '×24', finish: 'White/Silver', unitPrice: '$2,840.00', listPrice: '$4,200.00' },
    { code: 'HMI-LS-500',  name: 'Brody WorkLounge',             qty: '×12', finish: 'Fog fabric',   unitPrice: '$1,960.00', listPrice: '$2,900.00' },
    { code: 'HMI-FU-300',  name: 'Lateral Filing Unit 3-Drawer', qty: '×6',  finish: 'Platinum',     unitPrice: '$740.00',   listPrice: '$1,100.00' },
]

const SIF_ROWS = [
    { code: 'HMI-WS-2400', desc: 'Locale Workstation 24W',  qty: 24, list: '$4,200.00', net: '$2,840.00', af: '4.0%' },
    { code: 'HMI-LS-500',  desc: 'Brody WorkLounge Fog',    qty: 12, list: '$2,900.00', net: '$1,960.00', af: '3.9%' },
    { code: 'HMI-FU-300',  desc: 'Lateral Filing 3-Drawer', qty: 6,  list: '$1,100.00', net: '$740.00',   af: '2.9%' },
]

export default function SpecsDocViewer({ confirmed = false }: SpecsDocViewerProps) {
    const [activeTab, setActiveTab] = useState<'pdf' | 'sif'>('pdf')

    return (
        <div className="border border-border rounded-xl overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-muted/40">
                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex-1">
                    Attached Documents · specs.pdf + sif.csv
                </span>
                <span className="text-[9px] text-muted-foreground">View only</span>
            </div>

            <div className="border-t border-border">
                {/* Tab bar */}
                <div className="flex border-b border-border bg-muted/20">
                    {(['pdf', 'sif'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors border-b-2 -mb-px ${
                                activeTab === tab
                                    ? 'text-foreground border-foreground'
                                    : 'text-muted-foreground border-transparent hover:text-foreground'
                            }`}
                        >
                            {tab === 'pdf' ? 'specs.pdf' : 'sif.csv'}
                        </button>
                    ))}
                </div>

                {/* PDF tab */}
                {activeTab === 'pdf' && (
                    <div className="p-2 bg-muted dark:bg-zinc-950">
                        <div className="bg-card rounded border border-border overflow-hidden">
                            {/* Document header */}
                            <div className="px-3 pt-2.5 pb-2 border-b border-border flex items-start justify-between gap-2">
                                <div>
                                    <div className="text-[7px] text-muted-foreground dark:text-muted-foreground font-mono uppercase tracking-wide">Product Specification</div>
                                    <div className="text-[7px] text-muted-foreground dark:text-muted-foreground font-mono">Q-2026-0089 · DOE-2847</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-wide text-foreground">MILLER KNOLL</div>
                                    <div className="text-[7px] text-muted-foreground dark:text-muted-foreground font-mono">Account Manager Bly · Rep</div>
                                </div>
                            </div>
                            {/* Band */}
                            <div className="bg-zinc-800 dark:bg-zinc-700 px-3 py-1">
                                <span className="text-[7px] font-bold uppercase text-zinc-200">
                                    PRODUCT SPECIFICATIONS{confirmed ? ' · CONFIRMED' : ''}
                                </span>
                            </div>
                            <div className="p-3 space-y-2 text-[10px]">
                                {/* Spec rows */}
                                <div className="space-y-1.5">
                                    <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                                        Product Specifications
                                    </div>
                                    <div className="space-y-1.5">
                                        {PDF_SPECS.map(item => (
                                            <div key={item.code} className="flex gap-2 items-start">
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-100">
                                                        {item.code} · {item.name} {item.qty}
                                                    </div>
                                                    <div className="text-[9px] text-muted-foreground">
                                                        Finish: {item.finish}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-100">{item.unitPrice}</div>
                                                    <div className="text-[8px] text-muted-foreground dark:text-muted-foreground">List {item.listPrice}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Floor plan */}
                                <div className="pt-2 border-t border-border mt-1">
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                                        Architectural Layout · 52 Chambers St · Floor 12
                                    </div>
                                    <svg viewBox="0 0 300 145" width="100%" className="block rounded border border-zinc-300 bg-white">
                                        <rect x="0.5" y="0.5" width="299" height="144" fill="#f9f9f9" stroke="#52525b" strokeWidth="1.5"/>
                                        <line x1="188" y1="0.5" x2="188" y2="144.5" stroke="#52525b" strokeWidth="1.5"/>
                                        <line x1="188" y1="73" x2="299.5" y2="73" stroke="#52525b" strokeWidth="1.5"/>
                                        <line x1="8" y1="65" x2="185" y2="65" stroke="#a1a1aa" strokeWidth="0.4" strokeDasharray="4,3"/>
                                        <line x1="93" y1="14" x2="93" y2="140" stroke="#a1a1aa" strokeWidth="0.4" strokeDasharray="4,3"/>
                                        <text x="6" y="11" fontSize="5" fill="#71717a" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">ZONE A · WORKSTATIONS ×24</text>
                                        {([[8,18],[100,18],[8,78],[100,78]] as [number,number][]).map(([px,py],pi) => (
                                            <g key={pi}>
                                                {[0,1,2].map(i => (
                                                    <g key={i}>
                                                        <rect x={px+i*27} y={py} width={24} height={10} fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8" rx="0.5"/>
                                                        <rect x={px+i*27+8} y={py+11} width={8} height={4} fill="#d4d4d8" stroke="#71717a" strokeWidth="0.4" rx="0.5"/>
                                                        <rect x={px+i*27+8} y={py+19} width={8} height={4} fill="#d4d4d8" stroke="#71717a" strokeWidth="0.4" rx="0.5"/>
                                                        <rect x={px+i*27} y={py+24} width={24} height={10} fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8" rx="0.5"/>
                                                    </g>
                                                ))}
                                            </g>
                                        ))}
                                        <text x="193" y="11" fontSize="5" fill="#71717a" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">ZONE B · LOUNGE ×12</text>
                                        <rect x="192" y="17" width="50" height="20" rx="3" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8"/>
                                        <rect x="192" y="17" width="7" height="20" rx="2" fill="#d4d4d8" stroke="#71717a" strokeWidth="0.5"/>
                                        <rect x="235" y="17" width="7" height="20" rx="2" fill="#d4d4d8" stroke="#71717a" strokeWidth="0.5"/>
                                        <line x1="199" y1="30" x2="235" y2="30" stroke="#71717a" strokeWidth="0.4" strokeDasharray="2,2"/>
                                        <ellipse cx="217" cy="48" rx="13" ry="6" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
                                        <rect x="192" y="42" width="10" height="13" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
                                        <rect x="242" y="42" width="10" height="13" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
                                        <rect x="204" y="58" width="11" height="8" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
                                        <rect x="219" y="58" width="11" height="8" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
                                        <text x="193" y="82" fontSize="5" fill="#71717a" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">ZONE C · FILING ×6</text>
                                        {[0,1,2,3,4,5].map(i => (
                                            <g key={i}>
                                                <rect x={193+i*18} y={89} width={15} height={22} fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7" rx="0.5"/>
                                                <line x1={193+i*18} y1={100} x2={208+i*18} y2={100} stroke="#71717a" strokeWidth="0.4"/>
                                                <circle cx={200.5+i*18} cy={95} r="1.2" fill="#71717a"/>
                                                <circle cx={200.5+i*18} cy={106} r="1.2" fill="#71717a"/>
                                            </g>
                                        ))}
                                    </svg>
                                    <div className="text-[7px] text-muted-foreground dark:text-muted-foreground mt-1">
                                        NYC Dept. of Education · DOE-2847 · by Account Manager Bly · Miller Knoll
                                    </div>
                                </div>
                            </div>
                            <div className="text-[9px] text-muted-foreground mt-2 pb-2 text-center">Read-only · Submitted by Account Manager Bly · Miller Knoll</div>
                        </div>
                    </div>
                )}

                {/* SIF tab */}
                {activeTab === 'sif' && (
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-900">
                        <div className="bg-card rounded border border-border overflow-hidden">
                            <div className="px-3 py-2 bg-muted border-b border-border">
                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                                    SIF · Standard Industry Format · DOE-2847
                                </div>
                                <div className="text-[8px] text-muted-foreground dark:text-muted-foreground mt-0.5">
                                    Validated by Quote Tool · May 3, 2026
                                </div>
                            </div>
                            <div className="grid grid-cols-6 gap-1 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border-b border-border">
                                {['Code', 'Description', 'Qty', 'List', 'Net', 'AF%'].map(h => (
                                    <div key={h} className="text-[8px] font-bold text-muted-foreground uppercase">{h}</div>
                                ))}
                            </div>
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                                {SIF_ROWS.map(row => (
                                    <div key={row.code} className="grid grid-cols-6 gap-1 px-3 py-2">
                                        <div className="text-[9px] font-mono text-muted-foreground col-span-1">{row.code}</div>
                                        <div className="text-[9px] text-muted-foreground col-span-1">{row.desc}</div>
                                        <div className="text-[9px] text-muted-foreground">{row.qty}</div>
                                        <div className="text-[9px] text-muted-foreground">{row.list}</div>
                                        <div className="text-[9px] font-semibold text-muted-foreground">{row.net}</div>
                                        <div className="text-[9px] text-muted-foreground">{row.af}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-2 text-center">Read-only · Validated by Quote Tool</div>
                    </div>
                )}
            </div>
        </div>
    )
}
