import { CubeIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useGenUI } from '../../../context/GenUIContext';

export default function LayoutProposalArtifact({ data }: { data: any }) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const { sendMessage } = useGenUI();

    const handleSelect = (option: string) => {
        setSelectedOption(option);
    };

    const handleConfirm = () => {
        if (!selectedOption) return;
        sendMessage(`System: "${selectedOption}" layout selected. Created new Project Board: "Office Expansion - ${selectedOption}".`);
    };

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 border-b border-indigo-100 dark:border-indigo-800 flex items-center gap-2">
                <Square3Stack3DIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-500" />
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 text-sm">Layout Generator</h4>
            </div>

            <div className="p-4 space-y-4">
                <div className="text-xs text-muted-foreground flex justify-between">
                    <span>Dimensions: <strong>{data.dimensions}</strong></span>
                    <span>Target Cap: <strong>{data.capacity} ppl</strong></span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {data.options.map((opt: string) => (
                        <button
                            key={opt}
                            onClick={() => handleSelect(opt)}
                            className={`aspect-square rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${selectedOption === opt
                                ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 ring-1 ring-indigo-500'
                                : 'bg-muted dark:bg-zinc-800 border-border hover:border-indigo-300'
                                }`}
                        >
                            <CubeIcon className={`w-6 h-6 ${selectedOption === opt ? 'text-indigo-600' : 'text-muted-foreground'}`} />
                            <span className={`text-[10px] font-medium ${selectedOption === opt ? 'text-indigo-700 dark:text-indigo-300' : 'text-muted-foreground'}`}>{opt}</span>
                        </button>
                    ))}
                </div>

                <div className="bg-muted dark:bg-zinc-800/50 p-3 rounded-lg text-xs text-muted-foreground border border-zinc-100 dark:border-zinc-700">
                    {selectedOption ? (
                        <p><strong>{selectedOption} Analysis:</strong> Optimized for collaboration. Density ratio 1:120sqft. Includes 2 breakout zones.</p>
                    ) : (
                        <p className="italic">Select a layout option to see analysis...</p>
                    )}
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={!selectedOption}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 ${selectedOption
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                >
                    Generate Project Board
                </button>
            </div>
        </div>
    );
}
