function MarginControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-[11px]">{label}</span>
      <div className="flex items-center gap-1">
        <button
          aria-label={`Reducir margen ${label.toLowerCase()}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-6 h-6 flex items-center justify-center border border-white/15 hover:bg-white/10 rounded text-xs text-white font-bold"
        >
          -
        </button>
        <span className="w-10 text-center font-mono text-xs font-bold text-white bg-slate-950/60 px-1 py-0.5 rounded border border-white/10" role="status" aria-label={`${label}: ${value} milímetros`}>
          {value}
        </span>
        <button
          aria-label={`Aumentar margen ${label.toLowerCase()}`}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-6 h-6 flex items-center justify-center border border-white/15 hover:bg-white/10 rounded text-xs text-white font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default MarginControl;
