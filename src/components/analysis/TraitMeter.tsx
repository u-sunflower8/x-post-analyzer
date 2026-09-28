export function TraitMeter({ label, score, reason }: { label: string; score: number; reason: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-secondary-foreground">{label}</span>
        <span className="text-xs font-mono text-muted-foreground/80">{score}/5</span>
      </div>
      <div className="mb-1.5 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < score ? "bg-primary" : "bg-secondary"}`}
          />
        ))}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{reason}</p>
    </div>
  );
}
