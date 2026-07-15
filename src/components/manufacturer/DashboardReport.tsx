/**
 * DashboardReport · printable KPI report (Wendy item 11 · value-add)
 *
 * Opens a clean, letter-format report of the KPI dashboard and prints only the
 * report (everything else hidden via @media print). Reuses KPI_GROUPS so the
 * report always matches the on-screen grid.
 */

import { Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { KPI_GROUPS } from './DashboardPerformanceGrid'

const STATUS_LABEL: Record<string, string> = { on: 'On Target', watch: 'Watch', below: 'Below Target' }

interface DashboardReportProps {
    isOpen: boolean
    onClose: () => void
}

export default function DashboardReport({ isOpen, onClose }: DashboardReportProps) {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[200]" onClose={onClose}>
                {/* Print isolation — only #kpi-report is visible when printing */}
                <style>{`@media print { body * { visibility: hidden !important; } #kpi-report, #kpi-report * { visibility: visible !important; } #kpi-report { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: 0 !important; } .no-print { display: none !important; } }`}</style>

                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 z-[190] bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>

                <div className="fixed inset-0 z-[200] overflow-y-auto">
                    <div className="flex min-h-full items-start justify-center p-4 py-8">
                        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl">
                                {/* The printable paper */}
                                <div id="kpi-report" className="bg-white text-zinc-900 p-8">
                                    {/* Header */}
                                    <div className="flex items-start justify-between border-b border-zinc-200 pb-4 mb-5">
                                        <div>
                                            <h1 className="text-xl font-bold tracking-tight">Inbound | Outbound — KPI Report</h1>
                                            <p className="text-xs text-zinc-500 mt-0.5">Sales · Operations &amp; Accounting · Customer Experience · Financial</p>
                                        </div>
                                        <div className="text-right text-xs text-zinc-500">
                                            <div>Period: <span className="font-semibold text-zinc-900">This week</span></div>
                                            <div>Generated: {today}</div>
                                        </div>
                                    </div>

                                    {/* KPI groups as print-friendly tables */}
                                    <div className="space-y-5">
                                        {KPI_GROUPS.map(g => (
                                            <div key={g.id}>
                                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">{g.label}</h2>
                                                <table className="w-full text-xs border-collapse">
                                                    <thead>
                                                        <tr className="text-zinc-500 text-[10px] uppercase tracking-wider">
                                                            <th className="text-left font-semibold py-1">Metric</th>
                                                            <th className="text-right font-semibold py-1">Value</th>
                                                            <th className="text-right font-semibold py-1">Target</th>
                                                            <th className="text-right font-semibold py-1">Δ</th>
                                                            <th className="text-right font-semibold py-1">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {g.metrics.map((m, i) => {
                                                            const target = m.sub.find(s => /target|ceiling/i.test(s.label))?.value ?? '—'
                                                            return (
                                                                <tr key={i} className="border-t border-zinc-100">
                                                                    <td className="py-1.5 text-zinc-900">{m.label}</td>
                                                                    <td className="py-1.5 text-right font-bold tabular-nums">{m.value}</td>
                                                                    <td className="py-1.5 text-right tabular-nums text-zinc-600">{target}</td>
                                                                    <td className={`py-1.5 text-right tabular-nums ${m.deltaUp ? 'text-green-600' : 'text-red-600'}`}>{m.delta ?? '—'}</td>
                                                                    <td className="py-1.5 text-right font-semibold">{STATUS_LABEL[m.status]}</td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-[10px] text-zinc-400 mt-6 pt-3 border-t border-zinc-200">
                                        Generated by Strata · Inbound | Outbound. Figures reflect the current week vs target.
                                    </p>
                                </div>

                                {/* Actions (hidden when printing) */}
                                <div className="no-print bg-card border-t border-border px-5 py-3 flex items-center justify-between">
                                    <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors">
                                        <XMarkIcon className="h-4 w-4" /> Close
                                    </button>
                                    <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                                        <PrinterIcon className="h-4 w-4" /> Print report
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
