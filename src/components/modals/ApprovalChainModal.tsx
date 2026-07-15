import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export interface Approver {
    name: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected' | 'current';
    timestamp?: string;
}

interface ApprovalChainModalProps {
    isOpen: boolean;
    onClose: () => void;
    trigger: string;
    approvers: Approver[];
    onComplete?: () => void;
}

export default function ApprovalChainModal({ isOpen, onClose, trigger, approvers, onComplete }: ApprovalChainModalProps) {
    const [simulatedApprovers, setSimulatedApprovers] = useState<Approver[]>(approvers);

    useEffect(() => {
        if (!isOpen) {
            setSimulatedApprovers(approvers);
            return;
        }

        // Simulate sequential approvals
        let timeoutIds: NodeJS.Timeout[] = [];
        approvers.forEach((_, index) => {
            if (approvers[index].status === 'pending' || approvers[index].status === 'current') {
                const tid = setTimeout(() => {
                    setSimulatedApprovers(prev => prev.map((a, i) => {
                        if (i === index) return { ...a, status: 'approved' as const, timestamp: 'Just now' };
                        if (i === index + 1 && prev[i].status === 'pending') return { ...a, status: 'current' as const };
                        return a;
                    }));
                }, (index + 1) * 2000);
                timeoutIds.push(tid);
            }
        });

        return () => timeoutIds.forEach(clearTimeout);
    }, [isOpen, approvers]);

    const approvedCount = simulatedApprovers.filter(a => a.status === 'approved').length;
    const progressPercent = (approvedCount / simulatedApprovers.length) * 100;
    const isComplete = approvedCount === simulatedApprovers.length;

    useEffect(() => {
        if (isComplete && onComplete) {
            const tid = setTimeout(onComplete, 1000);
            return () => clearTimeout(tid);
        }
    }, [isComplete, onComplete]);

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[2px]" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95 translate-y-4"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 scale-95 translate-y-4"
                    >
                        <Dialog.Panel className="w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col">
                            {/* Header */}
                            <div className="relative bg-muted/30 p-6 text-center border-b border-border">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                                <Dialog.Title className="text-lg font-bold font-brand text-foreground">
                                    Approval Chain
                                </Dialog.Title>
                                <p className="text-xs text-muted-foreground mt-1">Sequential approval workflow</p>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Trigger reason */}
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-center gap-2">
                                        <ExclamationCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400">{trigger}</p>
                                    </div>
                                </div>

                                {/* Approver chain */}
                                <div className="space-y-0 relative">
                                    {simulatedApprovers.map((approver, i) => (
                                        <div key={i} className="flex items-start gap-4 relative pb-6 last:pb-0">
                                            {/* Vertical connector */}
                                            {i < simulatedApprovers.length - 1 && (
                                                <div className={clsx(
                                                    'absolute left-[15px] top-8 w-0.5 h-[calc(100%-16px)]',
                                                    approver.status === 'approved' ? 'bg-green-500' : 'bg-border'
                                                )} />
                                            )}

                                            {/* Status circle */}
                                            <div className={clsx(
                                                'w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300',
                                                approver.status === 'approved' && 'bg-green-500 text-white',
                                                approver.status === 'current' && 'bg-amber-500 text-white animate-pulse',
                                                approver.status === 'pending' && 'bg-zinc-200 dark:bg-zinc-700 text-muted-foreground',
                                                approver.status === 'rejected' && 'bg-red-500 text-white',
                                            )}>
                                                {approver.status === 'approved' && <CheckCircleIcon className="w-5 h-5" />}
                                                {approver.status === 'current' && <ClockIcon className="w-5 h-5" />}
                                                {approver.status === 'rejected' && <XMarkIcon className="w-5 h-5" />}
                                                {approver.status === 'pending' && <span className="w-2 h-2 rounded-full bg-zinc-400" />}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={clsx(
                                                        'text-sm font-bold',
                                                        approver.status === 'approved' && 'text-green-700 dark:text-green-400',
                                                        approver.status === 'current' && 'text-amber-700 dark:text-amber-400',
                                                        approver.status === 'rejected' && 'text-red-700 dark:text-red-400',
                                                        approver.status === 'pending' && 'text-muted-foreground',
                                                    )}>
                                                        {approver.name}
                                                    </span>
                                                    {approver.timestamp && (
                                                        <span className="text-[10px] text-muted-foreground">{approver.timestamp}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{approver.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress bar */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Progress</span>
                                        <span className="text-[10px] font-bold text-foreground">{approvedCount}/{simulatedApprovers.length}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={clsx(
                                                'h-full rounded-full transition-all duration-500',
                                                isComplete ? 'bg-green-500' : 'bg-primary'
                                            )}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-muted/30 border-t border-border text-center">
                                {isComplete ? (
                                    <p className="text-sm font-bold text-green-700 dark:text-green-400">All approvals complete</p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">Waiting for approvals...</p>
                                )}
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
