import React, { useState, useEffect, useRef } from 'react';
import { CloudArrowUpIcon, ServerStackIcon, DocumentTextIcon, ArrowPathIcon, CheckCircleIcon, XMarkIcon, ArrowLeftIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useGenUI } from '../../../context/GenUIContext';

export default function ModeSelectionArtifact() {
    const { sendMessage } = useGenUI();
    const [view, setView] = useState<'upload' | 'processing'>('upload');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string | null>(null);

    // Drag and Drop state
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Simulate Processing
    useEffect(() => {
        if (view === 'processing') {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 2; // Increment progress
                });
            }, 30); // 30ms * 50 steps = 1.5s approx

            return () => clearInterval(interval);
        }
    }, [view]);

    const hasSent = useRef(false);

    // Trigger completion when progress hits 100
    useEffect(() => {
        if (progress === 100 && !hasSent.current) {
            hasSent.current = true;
            setTimeout(() => {
                sendMessage(`Processed Upload: ${fileName || 'Document.pdf'}`);
            }, 800); // Small delay to show 100% complete
        }
    }, [progress, fileName, sendMessage]);

    const handleFileSelect = (name: string) => {
        setFileName(name);
        setView('processing');
    };

    // Drag and drop handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0].name);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0].name);
        }
    };

    if (view === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center p-8 w-full max-w-lg mx-auto bg-card rounded-2xl border border-border shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 relative">
                    {progress < 100 ? (
                        <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
                    ) : (
                        <CheckCircleIcon className="w-8 h-8 text-green-500 animate-in zoom-in duration-300" />
                    )}
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                    {progress < 100 ? 'Analyzing Document...' : 'Extraction Complete'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 text-center">
                    {progress < 100
                        ? 'IDENTIFYING SKUS, QUANTITIES, AND VARIANTS'
                        : 'REDIRECTING TO ASSET REVIEW...'}
                </p>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-75 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between w-full mt-2 text-xs text-muted-foreground">
                    <span>{fileName}</span>
                    <span>{progress}%</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full max-w-lg mx-auto bg-card rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center shrink-0">
                    <CloudArrowUpIcon className="w-4 h-4" />
                </div>
                <div>
                    <span className="font-semibold text-sm text-foreground">Intelligent Ingestion</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Drag & drop or select existing data</p>
                </div>
            </div>

            <div className="p-6">
                <div
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group mb-6 ${dragActive ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-900/10' : 'border-zinc-300 dark:border-zinc-700 hover:border-brand-400 hover:bg-muted dark:hover:bg-zinc-800/50'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        multiple={true}
                        onChange={handleChange}
                    />

                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform ${dragActive ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 scale-110' : 'bg-muted text-muted-foreground group-hover:scale-110 group-hover:text-brand-500'}`}>
                        <ArrowUpTrayIcon className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-semibold text-foreground">Drop PDF, Excel or Email</h4>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                        I will automatically extract all line items and requirements
                    </p>

                    <button className="px-5 py-2 bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:bg-brand-400 dark:hover:bg-brand-600/50 rounded-lg text-sm font-semibold shadow-sm transition-all pointer-events-none">
                        Browse Files
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Relevant Recent Files</p>
                    </div>

                    <button
                        onClick={() => handleFileSelect('Office_Renovation_Specs.pdf')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted dark:hover:bg-zinc-800/50 transition-colors border border-zinc-100 dark:border-zinc-800 hover:border-brand-300 dark:hover:border-brand-600/50 text-left group shadow-sm hover:shadow"
                    >
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                            <DocumentTextIcon className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Office_Renovation_Specs.pdf</p>
                            <p className="text-xs text-muted-foreground">2.4 MB • Today, 10:23 AM</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleFileSelect('Q1_Requirements.xlsx')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted dark:hover:bg-zinc-800/50 transition-colors border border-zinc-100 dark:border-zinc-800 hover:border-brand-300 dark:hover:border-brand-600/50 text-left group shadow-sm hover:shadow"
                    >
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                            <DocumentTextIcon className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Q1_Requirements.xlsx</p>
                            <p className="text-xs text-muted-foreground">1.1 MB • Yesterday</p>
                        </div>
                    </button>
                </div>

                <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Or import from system</p>
                            <p className="text-xs text-muted-foreground">Pull active POs directly</p>
                        </div>
                        <button
                            onClick={() => sendMessage("Mode Selected: Connect ERP")}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground dark:text-zinc-200 bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-700/80 rounded-lg transition-colors border border-border"
                        >
                            <ServerStackIcon className="w-4 h-4" />
                            Auto-Sync ERP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
