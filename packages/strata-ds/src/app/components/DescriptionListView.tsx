import { DescriptionList, DescriptionTerm, DescriptionDetails } from '../../components/catalyst/description-list';
import { CopyButton } from './CopyButton';

export function DescriptionListView() {
    return (
        <div>
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Description List
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Displays a list of key-value pairs, often used for entity details.
                    </p>
                </div>
            </div>

            {/* Examples */}
            <div className="grid grid-cols-1 gap-10">

                {/* Striped List */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        Application Details
                    </h2>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
                        <div className="px-4 py-6 sm:px-6">
                            <h3 className="text-base font-semibold leading-7 text-zinc-900 dark:text-white">Applicant Information</h3>
                            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">Personal details and application.</p>
                        </div>
                        <div className="border-t border-zinc-200 dark:border-zinc-800">
                            <DescriptionList>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <DescriptionTerm>Full name</DescriptionTerm>
                                    <DescriptionDetails>Margot Foster</DescriptionDetails>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <DescriptionTerm>Application for</DescriptionTerm>
                                    <DescriptionDetails>Backend Developer</DescriptionDetails>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <DescriptionTerm>Email address</DescriptionTerm>
                                    <DescriptionDetails>margotfoster@example.com</DescriptionDetails>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <DescriptionTerm>Salary expectation</DescriptionTerm>
                                    <DescriptionDetails>$120,000</DescriptionDetails>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <DescriptionTerm>About</DescriptionTerm>
                                    <DescriptionDetails>
                                        Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident.
                                    </DescriptionDetails>
                                </div>
                            </DescriptionList>
                        </div>
                    </div>
                    <div className="mt-4">
                        <CopyButton
                            formats={[{
                                label: 'React', value: `<DescriptionList>
  <div className="grid grid-cols-3 gap-4">
    <DescriptionTerm>Full name</DescriptionTerm>
    <DescriptionDetails>Margot Foster</DescriptionDetails>
  </div>
</DescriptionList>` }]}
                        />
                    </div>
                </section>

            </div>
        </div>
    );
}
