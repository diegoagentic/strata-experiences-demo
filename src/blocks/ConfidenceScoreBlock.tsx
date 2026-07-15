import ConfidenceScoreBadge from '../components/widgets/ConfidenceScoreBadge';

export default function ConfidenceScoreBlock() {
  return (
    <div className="p-8 flex flex-col items-center gap-8 min-h-[60vh]">
      <div className="text-center">
        <p className="text-sm text-muted-foreground max-w-md">
          AI confidence indicator reused across quote / ack / spec-check review.
          Three sizes so the same primitive scales from inline chip to card hero.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8 w-full max-w-3xl">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-card">
          <ConfidenceScoreBadge score={0.96} label="Vendor match" size="sm" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Size · sm</span>
        </div>
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-card">
          <ConfidenceScoreBadge score={0.78} label="SKU match" size="md" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Size · md</span>
        </div>
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-card">
          <ConfidenceScoreBadge score={0.42} label="Freight terms" size="lg" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Size · lg</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground max-w-md text-center">
        Score bands map to the semantic tokens: ≥0.85 success, 0.60-0.84 warning,
        &lt;0.60 destructive. Colors come from the DS, not hardcoded.
      </p>
    </div>
  );
}
