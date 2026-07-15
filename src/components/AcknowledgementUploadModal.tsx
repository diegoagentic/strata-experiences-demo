import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
    XMarkIcon,
    ArrowUpOnSquareIcon,
    ArrowRightIcon,
    LinkIcon,
    PencilSquareIcon,
    DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface AcknowledgementUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ackOptions = [
    {
        id: 'upload',
        title: 'Upload File',
        description: 'Upload PDF or Excel acknowledgement files. We\'ll parse the data automatically.',
        icon: ArrowUpOnSquareIcon,
        estimatedTime: '1-2 mins',
        color: 'text-blue-600', // Kept for future use or internal logic
        bgColor: 'bg-blue-100',
        darkColor: 'dark:text-blue-400',
        darkBgColor: 'dark:bg-blue-900/30'
    },
    {
        id: 'order',
        title: 'From Order',
        description: 'Select an existing Purchase Order to convert into an acknowledgement.',
        icon: LinkIcon,
        estimatedTime: '2-3 mins',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        darkColor: 'dark:text-indigo-400',
        darkBgColor: 'dark:bg-indigo-900/30'
    },
    {
        id: 'manual',
        title: 'Manual Entry',
        description: 'Enter acknowledgement details line-by-line. Best for corrections or non-standard formats.',
        icon: PencilSquareIcon,
        estimatedTime: '5-10 mins',
        color: 'text-muted-foreground',
        bgColor: 'bg-zinc-100',
        darkColor: 'dark:text-muted-foreground',
        darkBgColor: 'dark:bg-zinc-800'
    }
]

// Mock Orders for Selection
const mockOrders = [
    { id: '#ORD-2055', client: 'AutoManfacture Co.', project: 'Office Renovation', date: 'Dec 20, 2025', amount: '$385,000' },
    { id: '#ORD-2054', client: 'TechDealer Solutions', project: 'HQ Upgrade', date: 'Nov 15, 2025', amount: '$62,500' },
    { id: '#ORD-2052', client: 'Global Logistics', project: 'Warehouse Expansion', date: 'Oct 15, 2025', amount: '$45,000' },
    { id: '#ORD-2051', client: 'City Builders', project: 'City Center', date: 'Jan 05, 2026', amount: '$120,000' },
]

export default function AcknowledgementUploadModal({ isOpen, onClose }: AcknowledgementUploadModalProps) {
    const [step, setStep] = useState<'selection' | 'upload' | 'order' | 'manual'>('selection')
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

    // Reset step when modal closes
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setStep('selection')
                setSelectedOrder(null)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handleOptionClick = (id: string) => {
        if (id === 'upload') setStep('upload')
        else if (id === 'order') setStep('order')
        else if (id === 'manual') setStep('manual')
    }

    const handleOrderSelect = (orderId: string) => {
        setSelectedOrder(orderId)
        // Simulate processing or navigating to next step
        console.log(`Selected order: ${orderId}`)
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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-background text-left shadow-2xl transition-all border border-border w-full sm:max-w-3xl">
                                {step === 'selection' ? (
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="max-w-2xl">
                                                <Dialog.Title as="h3" className="text-2xl font-brand font-bold text-foreground mb-2">
                                                    Process Acknowledgement
                                                </Dialog.Title>
                                                <p className="text-sm text-muted-foreground">
                                                    Choose how you would like to process this vendor acknowledgement.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none"
                                                onClick={onClose}
                                            >
                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {ackOptions.map((option) => (
                                                <div
                                                    key={option.id}
                                                    onClick={() => handleOptionClick(option.id)}
                                                    className="group relative flex items-center p-4 rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer gap-4"
                                                >
                                                    <div className={`h-12 w-12 rounded-xl ${option.bgColor} ${option.color} ${option.darkBgColor} ${option.darkColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0`}>
                                                        <option.icon className="h-6 w-6" />
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="text-sm font-bold text-foreground">{option.title}</h4>
                                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                                                                {option.estimatedTime}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{option.description}</p>
                                                    </div>

                                                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                                        <ArrowRightIcon className="h-5 w-5 text-primary" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : step === 'order' ? (
                                    <div className="p-8 h-[600px] flex flex-col">
                                        <div className="flex justify-between items-center mb-6 shrink-0">
                                            <div>
                                                <h3 className="text-2xl font-brand font-bold text-foreground mb-1">Select Order</h3>
                                                <p className="text-sm text-muted-foreground">Select the order you want to create an acknowledgement for.</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none"
                                                onClick={onClose}
                                            >
                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                            {mockOrders.map((order) => (
                                                <div
                                                    key={order.id}
                                                    onClick={() => handleOrderSelect(order.id)}
                                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedOrder === order.id
                                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                        : 'border-border hover:border-input hover:bg-muted'
                                                        }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="font-bold text-foreground">{order.id}</span>
                                                            <span className="text-xs text-muted-foreground">• {order.date}</span>
                                                        </div>
                                                        <p className="text-sm font-medium text-foreground">{order.client}</p>
                                                        <p className="text-xs text-muted-foreground">{order.project}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-bold text-foreground block">{order.amount}</span>
                                                        {selectedOrder === order.id && (
                                                            <span className="text-xs font-medium text-primary flex items-center justify-end gap-1 mt-1">
                                                                Selected <ArrowRightIcon className="w-3 h-3" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center shrink-0">
                                            <button
                                                onClick={() => setStep('selection')}
                                                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                disabled={!selectedOrder}
                                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${selectedOrder
                                                    ? 'bg-primary text-zinc-900 hover:bg-brand-400'
                                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                                                    }`}
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 flex flex-col items-center justify-center min-h-[400px] relative">
                                        <button
                                            type="button"
                                            className="absolute right-6 top-6 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none"
                                            onClick={onClose}
                                        >
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>

                                        <div className="bg-muted/50 p-6 rounded-full mb-6 animate-pulse">
                                            <DocumentMagnifyingGlassIcon className="h-12 w-12 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">
                                            {step === 'upload' ? 'Upload Interface' : 'Manual Entry Form'}
                                        </h3>
                                        <p className="text-muted-foreground text-center max-w-sm mb-8">
                                            This flow is currently being implemented. You selected <span className="font-semibold text-foreground">{step === 'upload' ? 'Upload File' : 'Manual Entry'}</span>.
                                        </p>
                                        <button
                                            onClick={() => setStep('selection')}
                                            className="px-6 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-colors"
                                        >
                                            Go Back
                                        </button>
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
