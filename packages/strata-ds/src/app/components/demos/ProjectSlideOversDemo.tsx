import { useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "../ui/sheet"
import { Button } from "../ui/button"
import { ClockIcon, DocumentTextIcon, CheckIcon, PencilIcon } from '@heroicons/react/24/outline'

export function ProjectSlideOversDemo() {
    return (
        <div className="space-y-8">
            {/* Context Sidebar Pattern */}
            <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Contextual Sidebar (Right Sheet)</h4>
                <div className="p-6 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/10">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline">Open Context Sidebar</Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px]">
                            <SheetHeader className="mb-6">
                                <SheetTitle>Item Context</SheetTitle>
                                <SheetDescription>
                                    Actions and updates related to the selected item.
                                </SheetDescription>
                            </SheetHeader>

                            {/* Extracted from Detail.tsx Sidebar */}
                            <div className="space-y-8">
                                <div className="p-5 border rounded-xl bg-muted/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</h3>
                                        <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center border border-orange-200 dark:border-orange-500/30">
                                            <ClockIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Pending Review</p>
                                            <p className="text-xs text-muted-foreground">Waiting for Final Approval</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Suggested Actions</h4>
                                    <div className="space-y-3">
                                        <button className="w-full group relative flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500/50 hover:shadow-md transition-all text-left">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-600 dark:text-indigo-400">
                                                <DocumentTextIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Process Quote</p>
                                                <p className="text-[10px] text-muted-foreground">Analyze PDF & Extract Data</p>
                                            </div>
                                        </button>

                                        <button className="w-full group relative flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-green-500/50 hover:shadow-md transition-all text-left">
                                            <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors text-green-600 dark:text-green-400">
                                                <CheckIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Approve Order</p>
                                                <p className="text-[10px] text-muted-foreground">Move to Production</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </SheetContent>
                    </Sheet>
                    <p className="mt-4 text-xs text-zinc-500">
                        Based on the 'Contextual Quick Actions Sidebar' from the Detail page. Implemented here as a Slide-over (Sheet) for better reuse in other contexts.
                    </p>
                </div>
            </div>
        </div>
    )
}
