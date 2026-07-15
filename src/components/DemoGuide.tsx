import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    XMarkIcon,
    PlayCircleIcon,
    DocumentCheckIcon,
    WrenchScrewdriverIcon,
    CalculatorIcon,
    ArrowRightIcon,
    PencilSquareIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

interface DemoGuideProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: string) => void;
}

export default function DemoGuide({ isOpen, onClose, onNavigate }: DemoGuideProps) {
    const demoFlows = [
        {
            title: "Quote Generation Flow",
            description: "End-to-end quote creation with AI analysis, catalog configuration, and PDF generation.",
            icon: CalculatorIcon,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-500/10",
            action: () => {
                onNavigate('dashboard');
                onClose();
                setTimeout(() => window.dispatchEvent(new CustomEvent('demo-highlight', { detail: 'quote-flow' })), 800);
            }
        },
        {
            title: "PO vs Acknowledgement Discrepancy",
            description: "AI Assistant resolution flow for acknowledgement exceptions (ship date & finish substitution).",
            icon: DocumentCheckIcon,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-500/10",
            action: () => {
                onNavigate('dashboard');
                onClose();
                setTimeout(() => window.dispatchEvent(new CustomEvent('demo-highlight', { detail: 'ack-urgent-action' })), 800);
            }
        },
        {
            title: "Service Center",
            description: "Moves, Adds, Changes, and warranty claim tracking with logistics assignment.",
            icon: WrenchScrewdriverIcon,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-500/10",
            action: () => {
                onNavigate('mac');
                onClose();
                setTimeout(() => window.dispatchEvent(new CustomEvent('demo-highlight', { detail: 'mac-punch-list' })), 800);
            }
        },
        {
            title: "Gen UI Scenarios",
            description: "Explore generative UI workflows using conversational prompts and pre-built scenarios.",
            icon: SparklesIcon,
            color: "text-ai",
            bg: "bg-purple-50 dark:bg-ai/10",
            action: () => {
                onNavigate('dashboard');
                onClose();
                setTimeout(() => window.dispatchEvent(new CustomEvent('demo-highlight', { detail: 'gen-ui-scenarios' })), 800);
            }
        },
        {
            title: "Dashboard Customization",
            description: "Personalize your workspace by configuring visible widgets and tools.",
            icon: PencilSquareIcon,
            color: "text-pink-500",
            bg: "bg-pink-50 dark:bg-pink-500/10",
            action: () => {
                onNavigate('dashboard');
                onClose();
                setTimeout(() => window.dispatchEvent(new CustomEvent('demo-highlight', { detail: 'dashboard-customize-tools' })), 800);
            }
        }
    ];

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-card border-l border-border shadow-2xl">
                                        <div className="px-4 py-6 sm:px-6 bg-muted/30 border-b border-border">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                                                        <PlayCircleIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                                                    </div>
                                                    <Dialog.Title className="text-lg font-semibold leading-6 text-foreground">
                                                        MM Demo Guide
                                                    </Dialog.Title>
                                                </div>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative rounded-md bg-transparent text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                                                        onClick={onClose}
                                                    >
                                                        <span className="absolute -inset-2.5" />
                                                        <span className="sr-only">Close panel</span>
                                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Select a flow below to automatically navigate to the starting point of the demonstration.
                                            </p>
                                        </div>
                                        <div className="relative flex-1 px-4 py-6 sm:px-6 space-y-6">
                                            {/* Flows List */}
                                            <div className="space-y-4">
                                                {demoFlows.map((flow, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={flow.action}
                                                        className="w-full text-left group relative flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-brand-500/50 transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        <div className={`p-2 rounded-lg shrink-0 ${flow.bg} ${flow.color}`}>
                                                            <flow.icon className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 pr-6">
                                                            <h4 className="text-sm font-semibold text-foreground mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                                                {flow.title}
                                                            </h4>
                                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                                {flow.description}
                                                            </p>
                                                        </div>
                                                        <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-600 dark:text-brand-400">
                                                            <ArrowRightIcon className="w-5 h-5" />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Note */}
                                            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Presenter Tip</h4>
                                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                                    Use this guide during live demos to quickly jump between key features without manually navigating through the application.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
