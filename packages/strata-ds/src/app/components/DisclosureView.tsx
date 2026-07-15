import { Disclosure, DisclosureButton, DisclosurePanel } from '../../components/catalyst/disclosure';
import { CopyButton } from './CopyButton';

export function DisclosureView() {
    return (
        <div>
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Disclosure
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        A simple, accessible foundation for standard accordion and toggle patterns.
                    </p>
                </div>
            </div>

            {/* Examples */}
            <div className="grid grid-cols-1 gap-10">

                {/* Basic Disclosure */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        Basic FAQ
                    </h2>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900">
                        <div className="w-full max-w-md space-y-2">
                            <Disclosure>
                                <DisclosureButton>What is your refund policy?</DisclosureButton>
                                <DisclosurePanel>
                                    If you're unhappy with your purchase, we'll refund you in full.
                                </DisclosurePanel>
                            </Disclosure>
                            <div className="border-t border-zinc-200 dark:border-zinc-800" />
                            <Disclosure>
                                <DisclosureButton>Do you offer technical support?</DisclosureButton>
                                <DisclosurePanel>
                                    No, we don't.
                                </DisclosurePanel>
                            </Disclosure>
                        </div>
                    </div>
                    <div className="mt-4">
                        <CopyButton
                            formats={[{
                                label: 'React', value: `<Disclosure>
  <DisclosureButton>What is your refund policy?</DisclosureButton>
  <DisclosurePanel>
    If you're unhappy with your purchase, we'll refund you in full.
  </DisclosurePanel>
</Disclosure>` }]}
                        />
                    </div>
                </section>

                {/* Usage Guidelines */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        Usage Guidelines
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md p-6">
                            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Do's</h3>
                            <ul className="list-disc list-inside text-sm text-emerald-800 dark:text-emerald-200 space-y-1">
                                <li>Use for FAQs, collapsible details, or advanced filters.</li>
                                <li>Group related disclosures together.</li>
                            </ul>
                        </div>
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-6">
                            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Don'ts</h3>
                            <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                                <li>Don't use for critical content that should always be visible (privacy policies, etc.).</li>
                            </ul>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
