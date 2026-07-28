/**
 * COMPONENT: ContinuaOfficeRelocation
 * PURPOSE: Continua step 2.4 · FM Quick Action Office Relocation · Committed
 *          confirmation banner (post-modal). Notification + modal state
 *          machinery viven en Inventory · el modal `RelocateAssetModal` es
 *          separado. Este componente solo renderea la fase 'committed'.
 *
 * USED BY: Inventory.tsx · isContinua && stepId === '2.4' branch.
 * Extracted from Inventory.tsx L1230-1250 en F42.d.2 (2026-07-27).
 */

import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface Props {
    fmRelocPhase: 'notification' | 'modal-open' | 'committed';
}

export default function ContinuaOfficeRelocation({ fmRelocPhase }: Props) {
    return (
        <div className="space-y-4 mb-6">
            {/* F42.a · Notification "Quick Action — Office Relocation" migrado al
                ActionCenter (continua-2.4-relocation). El listener avanza a
                modal-open al click Start relocation. */}
            {fmRelocPhase === 'committed' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-3">
                    <div className="p-3 rounded-xl bg-success/10 border border-success/30 dark:border-success/30">
                        <div className="flex items-start gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-success">Assets Relocated Successfully</p>
                                <p className="text-[10px] text-success mt-1">Office 3-214 → Office 3-216. Inventory updated.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
