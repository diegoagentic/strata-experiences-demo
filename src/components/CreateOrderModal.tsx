import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
    XMarkIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    DocumentDuplicateIcon,
    ArrowUpOnSquareIcon,
    CheckIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline'

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const creationOptions = [
    {
        id: 'import',
        title: 'Import Files',
        description: 'Import order data from Excel, CSV, or PDF files. Ideal for bulk orders or external sources.',
        icon: ArrowUpOnSquareIcon,
        actionLabel: 'Upload Files',
        estimatedTime: '3-5 minutes',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        darkColor: 'dark:text-green-400',
        darkBgColor: 'dark:bg-green-900/30'
    },
    {
        id: 'quote',
        title: 'From Quote',
        description: 'Convert an accepted quote directly into a purchase order. All details are automatically transferred.',
        icon: DocumentTextIcon,
        actionLabel: 'Select Quote',
        estimatedTime: '2-3 minutes',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        darkColor: 'dark:text-blue-400',
        darkBgColor: 'dark:bg-blue-900/30'
    },
    {
        id: 'template',
        title: 'From Template',
        description: 'Use a pre-configured template or previous order as a starting point. Perfect for recurring orders.',
        icon: DocumentDuplicateIcon,
        actionLabel: 'Browse Templates',
        estimatedTime: '5-8 minutes',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        darkColor: 'dark:text-indigo-400',
        darkBgColor: 'dark:bg-indigo-900/30'
    },
    {
        id: 'manual',
        title: 'Manual Creation',
        description: 'Create an order from scratch by entering all details manually. Best for custom or unique orders.',
        icon: PencilSquareIcon,
        actionLabel: 'Start Manual Creation',
        estimatedTime: '10-15 minutes',
        color: 'text-muted-foreground',
        bgColor: 'bg-zinc-100',
        darkColor: 'dark:text-muted-foreground',
        darkBgColor: 'dark:bg-zinc-800'
    }
]

import OrderCreationForm, { type OrderFormData } from './forms/OrderCreationForm'
import OrderImportFlow from './forms/OrderImportFlow'
import OrderFromQuoteFlow from './forms/OrderFromQuoteFlow'

// Enhanced Mock Templates with Line Items for Autofill
const templates = [
    // ... existing templates ...
    {
        id: 1,
        name: 'Standard Monthly Restock',
        itemsSummary: 12,
        totalValue: '$4,250.00',
        lastUsed: '2 days ago',
        category: 'Restock',
        data: {
            customerId: 'CUST-002',
            projectRef: 'Monthly Depot Restock',
            shippingAddress: '123 Warehouse Dr, Industrial Park, NY 10001',
            notes: 'Please deliver to Loading Dock B.',
            items: [
                { id: 't1-1', description: 'Standard Drywall Panel 4x8', qty: 50, unitPrice: 15.00, total: 750.00 },
                { id: 't1-2', description: 'Joint Compound 5gal', qty: 10, unitPrice: 24.50, total: 245.00 },
                { id: 't1-3', description: 'Corner Bead Vinyl', qty: 100, unitPrice: 3.25, total: 325.00 },
                { id: 't1-4', description: 'Drywall Screws 1-1/4"', qty: 20, unitPrice: 45.00, total: 900.00 }
            ]
        }
    },
    {
        id: 2,
        name: 'New Dealer Initial Setup',
        itemsSummary: 45,
        totalValue: '$25,000.00',
        lastUsed: '1 week ago',
        category: 'New Setup',
        data: {
            customerId: 'CUST-004',
            projectRef: 'New Branch Opening',
            shippingAddress: '456 Retail Blvd, Shopping Center, TX 75001',
            notes: 'Call 24h before delivery. Lift gate required.',
            items: [
                { id: 't2-1', description: 'Display Rack Unit A', qty: 5, unitPrice: 1200.00, total: 6000.00 },
                { id: 't2-2', description: 'Starter Inventory Pack', qty: 1, unitPrice: 15000.00, total: 15000.00 },
                { id: 't2-3', description: 'Marketing Materials Kit', qty: 2, unitPrice: 500.00, total: 1000.00 }
            ]
        }
    },
    {
        id: 3,
        name: 'Seasonal Promo (Q1)',
        itemsSummary: 8,
        totalValue: '$1,800.00',
        lastUsed: 'Yesterday',
        category: 'Promo',
        data: {
            customerId: '',
            projectRef: 'Q1 Seasonal Promotion',
            items: [
                { id: 't3-1', description: 'Winter Insulation Roll', qty: 20, unitPrice: 45.00, total: 900.00 },
                { id: 't3-2', description: 'Weather Stripping Value Pack', qty: 50, unitPrice: 12.00, total: 600.00 }
            ]
        }
    },
    {
        id: 4,
        name: 'Urgent Parts Replacement',
        itemsSummary: 3,
        totalValue: '$450.00',
        lastUsed: '5 days ago',
        category: 'Maintenance',
        data: {
            customerId: 'CUST-001',
            projectRef: 'Urgent Repair',
            items: [
                { id: 't4-1', description: 'Replacement Motor Unit', qty: 1, unitPrice: 350.00, total: 350.00 },
                { id: 't4-2', description: 'Mounting Bracket Set', qty: 2, unitPrice: 25.00, total: 50.00 }
            ]
        }
    }
]

export default function CreateOrderModal({ isOpen, onClose }: CreateOrderModalProps) {
    const [step, setStep] = useState<'selection' | 'templates' | 'import' | 'quote' | 'form'>('selection')
    const [initialFormData, setInitialFormData] = useState<Partial<OrderFormData> | undefined>(undefined)
    const [isTemplateMode, setIsTemplateMode] = useState(false)

    // Reset step when modal closes
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setStep('selection')
                setInitialFormData(undefined)
                setIsTemplateMode(false)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handleOptionClick = (id: string) => {
        if (id === 'template') {
            setStep('templates')
        } else if (id === 'import') {
            setStep('import')
        } else if (id === 'quote') {
            setStep('quote')
        } else if (id === 'manual') {
            setIsTemplateMode(false)
            setInitialFormData(undefined)
            setStep('form')
        }
    }

    const handleTemplateSelect = (template: typeof templates[0]) => {
        setInitialFormData(template.data as any);
        setIsTemplateMode(true);
        setStep('form');
    }

    const handleDataSelect = (data: OrderFormData) => {
        setInitialFormData(data);
        setIsTemplateMode(false); // It's not a template, but pre-filled data
        setStep('form');
    }

    const handleFormSubmit = (data: OrderFormData) => {
        console.log('Order Created:', data);
        onClose();
        // In a real app, this would trigger an API call and show a success toast
    }

    const getModalSize = () => {
        if (step === 'form' || step === 'import' || step === 'quote') return 'sm:max-w-6xl h-[90vh]';
        return 'sm:max-w-3xl';
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
                            <Dialog.Panel className={`relative transform overflow-hidden rounded-2xl bg-background text-left shadow-2xl transition-all border border-border w-full ${getModalSize()}`}>
                                {/* Close Button logic - Hide in sub-flows that have their own navigation */}
                                {step === 'selection' && (
                                    <div className="absolute right-6 top-6 z-10">
                                        <button
                                            type="button"
                                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none"
                                            onClick={onClose}
                                        >
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                )}

                                {step === 'selection' ? (
                                    <div className="p-8">
                                        <div className="max-w-2xl">
                                            <Dialog.Title as="h3" className="text-2xl font-brand font-bold text-foreground mb-2">
                                                Create New Order
                                            </Dialog.Title>
                                            <p className="text-sm text-muted-foreground mb-6">
                                                Choose how you would like to start this order. Select the option that best fits your current workflow.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {creationOptions.map((option) => (
                                                <div
                                                    key={option.id}
                                                    onClick={() => handleOptionClick(option.id)}
                                                    className="group relative flex flex-col p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className={`h-12 w-12 rounded-xl ${option.bgColor} ${option.color} ${option.darkBgColor} ${option.darkColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                                                            <option.icon className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex justify-end">
                                                            <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                                                                {option.estimatedTime}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <h4 className="text-lg font-bold text-foreground mb-1">{option.title}</h4>
                                                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{option.description}</p>

                                                    <div className="mt-auto">
                                                        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-foreground/10 hover:border-foreground text-foreground font-medium transition-all group-hover:bg-foreground group-hover:text-background text-sm">
                                                            <span>{option.actionLabel}</span>
                                                            <ArrowRightIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : step === 'templates' ? (
                                    <div className="p-8 h-[600px] flex flex-col">
                                        <div className="flex items-center gap-4 mb-6">
                                            <button
                                                onClick={() => setStep('selection')}
                                                className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <ArrowRightIcon className="h-5 w-5 rotate-180 text-muted-foreground" />
                                            </button>
                                            <div>
                                                <Dialog.Title as="h3" className="text-2xl font-brand font-bold text-foreground">
                                                    Select a Template
                                                </Dialog.Title>
                                                <p className="text-sm text-muted-foreground">
                                                    Choose from your saved templates to quickly create a new order.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto -mx-2 px-2">
                                            <div className="grid grid-cols-1 gap-4">
                                                {templates.map((template) => (
                                                    <div
                                                        key={template.id}
                                                        onClick={() => handleTemplateSelect(template)}
                                                        className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                                <DocumentDuplicateIcon className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-foreground">{template.name}</h4>
                                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                                    <span className="bg-muted px-2 py-0.5 rounded-full">{template.category}</span>
                                                                    <span>{template.itemsSummary} Items</span>
                                                                    <span>•</span>
                                                                    <span>Last used {template.lastUsed}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="font-medium text-foreground">{template.totalValue}</span>
                                                            <button className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100">
                                                                <ArrowRightIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                                            <p className="text-sm text-muted-foreground">
                                                Showing {templates.length} templates
                                            </p>
                                            <button className="text-sm font-medium text-primary hover:underline">
                                                Manage Templates
                                            </button>
                                        </div>
                                    </div>
                                ) : step === 'import' ? (
                                    <OrderImportFlow
                                        onImportComplete={handleDataSelect}
                                        onCancel={() => setStep('selection')}
                                    />
                                ) : step === 'quote' ? (
                                    <OrderFromQuoteFlow
                                        onOrderCreate={handleFormSubmit}
                                        onEditDetails={handleDataSelect}
                                        onCancel={() => setStep('selection')}
                                    />
                                ) : (
                                    <OrderCreationForm
                                        initialData={initialFormData}
                                        isTemplate={isTemplateMode}
                                        onSubmit={handleFormSubmit}
                                        onCancel={() => setStep('selection')} // Always go back to selection if cancelled from main form
                                    />
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
