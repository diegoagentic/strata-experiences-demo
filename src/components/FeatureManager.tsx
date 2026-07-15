
import { Fragment } from 'react'
import { Dialog, Transition, Switch } from '@headlessui/react'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'

export interface Feature {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
    category: 'core' | 'analytics' | 'operations' | 'support' | 'finance';
    required?: boolean;
}

interface FeatureManagerProps {
    isOpen: boolean;
    onClose: () => void;
    features: Feature[];
    onToggleFeature: (id: string, enabled: boolean) => void;
}

export default function FeatureManager({ isOpen, onClose, features, onToggleFeature }: FeatureManagerProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
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
                    <div className="fixed inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-background p-6 text-left align-middle shadow-xl transition-all border border-border">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-bold leading-6 text-foreground"
                                        >
                                            Customize your experience
                                        </Dialog.Title>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Enable or disable features to tailor the dashboard to your workflow.
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none"
                                    >
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
                                    {['core', 'operations', 'analytics', 'support', 'finance'].map((category) => {
                                        const categoryFeatures = features.filter(f => f.category === category);
                                        if (categoryFeatures.length === 0) return null;

                                        return (
                                            <div key={category}>
                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                                </h4>
                                                <div className="space-y-3">
                                                    {categoryFeatures.map((feature) => (
                                                        <div
                                                            key={feature.id}
                                                            className={`flex items-start justify-between p-4 rounded-xl border transition-all ${feature.enabled
                                                                ? 'bg-muted/50 border-border'
                                                                : 'bg-card border-border/60 opacity-60'
                                                                }`}
                                                        >
                                                            <div className="flex-1 mr-4">
                                                                <div className="flex items-center gap-2">
                                                                    <h5 className="text-sm font-semibold text-foreground">
                                                                        {feature.title}
                                                                    </h5>
                                                                    {feature.required && (
                                                                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border">
                                                                            Essential
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    {feature.description}
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                checked={feature.enabled}
                                                                onChange={(checked) => !feature.required && onToggleFeature(feature.id, checked)}
                                                                disabled={feature.required}
                                                                className={`${feature.enabled ? 'bg-primary' : 'bg-input'}
                                          ${feature.required ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}
                                          relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
                                                            >
                                                                <span className="sr-only">Use setting</span>
                                                                <span
                                                                    aria-hidden="true"
                                                                    className={`${feature.enabled ? 'translate-x-5' : 'translate-x-0'}
                                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                                                                />
                                                            </Switch>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Browse App Marketplace
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors shadow-sm"
                                        onClick={onClose}
                                    >
                                        Done
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
