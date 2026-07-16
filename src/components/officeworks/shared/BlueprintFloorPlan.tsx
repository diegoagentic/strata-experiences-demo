/**
 * COMPONENT: BlueprintFloorPlan (shared · officeworks-scoped extraction)
 * PURPOSE: Architectural-style SVG floor plan lifted from BFI SpecsDocViewer
 *          so Officeworks (and any other profile) can render the same look
 *          with profile-specific zone labels + footer attribution.
 *
 * Visual: 3 zones laid out 300×145.
 *   - ZONE A · workstations grid (top-left + bottom-left, 24 desks)
 *   - ZONE B · lounge / meeting area (top-right)
 *   - ZONE C · filing / storage cabinets (bottom-right)
 *
 * The SVG geometry is fixed (no dynamic counts) — only the labels surrounding
 * it change. That keeps reuse cheap while keeping the rendering identical to
 * the BFI flow.
 */

interface Props {
    locationLabel?: string
    zoneALabel?: string
    zoneBLabel?: string
    zoneCLabel?: string
    footerLabel?: string
}

export default function BlueprintFloorPlan({
    locationLabel = 'Architectural Layout',
    zoneALabel = 'ZONE A · WORKSTATIONS ×24',
    zoneBLabel = 'ZONE B · LOUNGE ×12',
    zoneCLabel = 'ZONE C · FILING ×6',
    footerLabel,
}: Props) {
    return (
        <div className="pt-2">
            <div className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                {locationLabel}
            </div>
            <svg viewBox="0 0 300 145" width="100%" className="block rounded border border-zinc-300 bg-white">
                <rect x="0.5" y="0.5" width="299" height="144" fill="#f9f9f9" stroke="#52525b" strokeWidth="1.5" />
                <line x1="188" y1="0.5" x2="188" y2="144.5" stroke="#52525b" strokeWidth="1.5" />
                <line x1="188" y1="73" x2="299.5" y2="73" stroke="#52525b" strokeWidth="1.5" />
                <line x1="8" y1="65" x2="185" y2="65" stroke="#a1a1aa" strokeWidth="0.4" strokeDasharray="4,3" />
                <line x1="93" y1="14" x2="93" y2="140" stroke="#a1a1aa" strokeWidth="0.4" strokeDasharray="4,3" />

                {/* Zone A · workstations */}
                <text x="6" y="11" fontSize="5" fill="#71717a" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">{zoneALabel}</text>
                {([[8, 18], [100, 18], [8, 78], [100, 78]] as [number, number][]).map(([px, py], pi) => (
                    <g key={pi}>
                        {[0, 1, 2].map(i => (
                            <g key={i}>
                                <rect x={px + i * 27} y={py} width={24} height={10} fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8" rx="0.5" />
                                <rect x={px + i * 27 + 8} y={py + 11} width={8} height={4} fill="#d4d4d8" stroke="#71717a" strokeWidth="0.4" rx="0.5" />
                                <rect x={px + i * 27 + 8} y={py + 19} width={8} height={4} fill="#d4d4d8" stroke="#71717a" strokeWidth="0.4" rx="0.5" />
                                <rect x={px + i * 27} y={py + 24} width={24} height={10} fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8" rx="0.5" />
                            </g>
                        ))}
                    </g>
                ))}

                {/* Zone B · lounge */}
                <text x="193" y="11" fontSize="5" fill="#71717a" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">{zoneBLabel}</text>
                <rect x="192" y="17" width="50" height="20" rx="3" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8" />
                <rect x="192" y="17" width="7" height="20" rx="2" fill="#d4d4d8" stroke="#71717a" strokeWidth="0.5" />
                <rect x="235" y="17" width="7" height="20" rx="2" fill="#d4d4d8" stroke="#71717a" strokeWidth="0.5" />
                <line x1="199" y1="30" x2="235" y2="30" stroke="#71717a" strokeWidth="0.4" strokeDasharray="2,2" />
                <ellipse cx="217" cy="48" rx="13" ry="6" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7" />
                <rect x="192" y="42" width="10" height="13" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7" />
                <rect x="242" y="42" width="10" height="13" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7" />
                <rect x="204" y="58" width="11" height="8" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7" />
                <rect x="219" y="58" width="11" height="8" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7" />

                {/* Zone C · filing */}
                <text x="193" y="82" fontSize="5" fill="#71717a" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">{zoneCLabel}</text>
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <g key={i}>
                        <rect x={193 + i * 18} y={89} width={15} height={22} fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7" rx="0.5" />
                        <line x1={193 + i * 18} y1={100} x2={208 + i * 18} y2={100} stroke="#71717a" strokeWidth="0.4" />
                        <circle cx={200.5 + i * 18} cy={95} r="1.2" fill="#71717a" />
                        <circle cx={200.5 + i * 18} cy={106} r="1.2" fill="#71717a" />
                    </g>
                ))}
            </svg>
            {footerLabel && (
                <div className="text-[7px] text-zinc-400 dark:text-zinc-500 mt-1">
                    {footerLabel}
                </div>
            )}
        </div>
    )
}
