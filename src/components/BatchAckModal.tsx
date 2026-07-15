import { Fragment, useState } from 'react'
import { Dialog, Transition, Tab } from '@headlessui/react'
import {
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'

interface BatchAckModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock Data
const readyOrders = [
    { id: '#ORD-2056', vendor: 'Steelcase', amount: '$45,200', status: 'Matched', date: 'Today, 10:23 AM' },
    { id: '#ORD-2057', vendor: 'Herman Miller', amount: '$12,450', status: 'Matched', date: 'Today, 09:15 AM' },
    { id: '#ORD-2059', vendor: 'Knoll', amount: '$8,900', status: 'Auto-Resolved', date: 'Yesterday' },
    { id: '#ORD-2060', vendor: 'Steelcase', amount: '$156,000', status: 'Matched', date: 'Yesterday' },
]

const attentionOrders = [
    { id: '#ORD-2058', vendor: 'Haworth', amount: '$22,100', discrepancy: 'Price Mismatch (+$450)', date: 'Today, 11:00 AM' },
    { id: '#ORD-2061', vendor: 'MillerKnoll', amount: '$33,000', discrepancy: 'Date Mismatch (Late)', date: 'Yesterday' },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function BatchAckModal({ isOpen, onClose }: BatchAckModalProps) {
    const [selectedReady, setSelectedReady] = useState<string[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const toggleSelect = (id: string) => {
        if (selectedReady.includes(id)) {
            setSelectedReady(selectedReady.filter(item => item !== id))
        } else {
            setSelectedReady([...selectedReady, id])
        }
    }

    const toggleSelectAll = () => {
        if (selectedReady.length === readyOrders.length) {
            setSelectedReady([])
        } else {
            setSelectedReady(readyOrders.map(o => o.id))
        }
    }

    const handleApprove = () => {
        setIsProcessing(true)
        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false)
            setShowSuccess(true)
            setTimeout(() => {
                setShowSuccess(false)
                onClose()
                setSelectedReady([])
            }, 2000)
        }, 1500)
    }

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-card text-left shadow-2xl transition-all w-full sm:max-w-4xl border border-border">
                                {showSuccess ? (
                                    <div className="p-12 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircleIcon className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">Success!</h3>
                                        <p className="text-muted-foreground mt-2">
                                            {selectedReady.length} acknowledgements have been processed successfully.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="h-[600px] flex flex-col">
                                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/50">
                                            <div>
                                                <Dialog.Title as="h3" className="text-lg font-bold text-foreground">
                                                    Bulk Acknowledgement Processing
                                                </Dialog.Title>
                                                <p className="text-sm text-muted-foreground">Review and approve pending vendor acknowledgements</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none"
                                                onClick={onClose}
                                            >
                                                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                            </button>
                                        </div>

                                        <Tab.Group>
                                            <div className="px-6 pt-4 border-b border-border">
                                                <Tab.List className="flex space-x-6">
                                                    <Tab
                                                        className={({ selected }) =>
                                                            classNames(
                                                                'pb-3 text-sm font-medium border-b-2 outline-none transition-colors',
                                                                selected
                                                                    ? 'border-primary text-primary'
                                                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50'
                                                            )
                                                        }
                                                    >
                                                        Ready for Approval
                                                        <span className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 py-0.5 px-2 rounded-full text-xs">
                                                            {readyOrders.length}
                                                        </span>
                                                    </Tab>
                                                    <Tab
                                                        className={({ selected }) =>
                                                            classNames(
                                                                'pb-3 text-sm font-medium border-b-2 outline-none transition-colors',
                                                                selected
                                                                    ? 'border-red-500 text-red-600 dark:text-red-400'
                                                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50'
                                                            )
                                                        }
                                                    >
                                                        Attention Needed
                                                        <span className="ml-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 py-0.5 px-2 rounded-full text-xs">
                                                            {attentionOrders.length}
                                                        </span>
                                                    </Tab>
                                                </Tab.List>
                                            </div>

                                            <Tab.Panels className="flex-1 overflow-hidden bg-muted/30">
                                                {/* Ready Panel */}
                                                <Tab.Panel className="h-full flex flex-col">
                                                    <div className="flex-1 overflow-y-auto p-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    className="rounded border-zinc-300 text-primary focus:ring-primary"
                                                                    checked={selectedReady.length === readyOrders.length && readyOrders.length > 0}
                                                                    onChange={toggleSelectAll}
                                                                />
                                                                <span className="text-sm text-muted-foreground">Select All ({readyOrders.length})</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {readyOrders.map((order) => (
                                                                <div
                                                                    key={order.id}
                                                                    className={`p-4 rounded-xl border bg-card transition-all flex items-center gap-4 ${selectedReady.includes(order.id)
                                                                        ? 'border-primary ring-1 ring-primary/20 shadow-sm'
                                                                        : 'border-border hover:border-primary/50'
                                                                        }`}
                                                                    onClick={() => toggleSelect(order.id)}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-zinc-300 text-primary focus:ring-primary"
                                                                        checked={selectedReady.includes(order.id)}
                                                                        onChange={() => { }}
                                                                    />
                                                                    <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                                                                        <div className="font-semibold text-foreground">{order.id}</div>
                                                                        <div className="text-sm text-foreground">{order.vendor}</div>
                                                                        <div className="text-sm font-mono text-muted-foreground">{order.amount}</div>
                                                                        <div className="flex justify-end">
                                                                            <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
                                                                                {order.status}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="p-4 border-t border-border bg-card flex justify-between items-center">
                                                        <span className="text-sm text-muted-foreground">
                                                            {selectedReady.length} selected
                                                        </span>
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={onClose}
                                                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            {selectedReady.length > 0 && (
                                                                <button
                                                                    className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                                                                    onClick={() => { /* Placeholder for Review Action */ }}
                                                                >
                                                                    Review
                                                                </button>
                                                            )}
                                                            <button
                                                                disabled={selectedReady.length === 0 || isProcessing}
                                                                onClick={handleApprove}
                                                                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white transition-all ${selectedReady.length > 0 && !isProcessing
                                                                    ? 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg'
                                                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                {isProcessing && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                                                                {isProcessing ? 'Processing...' : `Approve (${selectedReady.length})`}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>

                                                {/* Attention Panel */}
                                                <Tab.Panel className="h-full p-6 overflow-y-auto">
                                                    <div className="space-y-3">
                                                        {attentionOrders.map((order) => (
                                                            <div key={order.id} className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 flex items-start gap-4">
                                                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <h4 className="font-semibold text-foreground">{order.id}</h4>
                                                                        <div className="flex gap-2">
                                                                            <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Request Approval</button>
                                                                            <button className="text-xs font-medium text-primary hover:underline">Review Details</button>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground mb-2">{order.vendor} • {order.amount}</p>
                                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-card border border-destructive/20 text-xs font-medium text-red-700 dark:text-red-400">
                                                                        {order.discrepancy}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Tab.Panel>
                                            </Tab.Panels>
                                        </Tab.Group>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
