import { Sparkles } from 'lucide-react';

export default function InsightCard({ text, loading }: { text: string; loading?: boolean }) {
  if (loading) {
    return (
      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-6 flex gap-3 items-start animate-pulse relative">
        <div className="absolute -top-3 left-6 bg-emerald-500 text-black text-[10px] font-bold px-2 py-1 rounded">CLAUDE INSIGHT</div>
        <div className="bg-emerald-500/20 p-2 rounded-lg mt-0.5">
          <Sparkles className="h-5 w-5 text-emerald-500 opacity-50" />
        </div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!text) return null;

  return (
    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-6 flex gap-3 items-start shadow-sm transition-all hover:border-emerald-500/40 relative mt-3">
      <div className="absolute -top-3 left-6 bg-emerald-500 text-black text-[10px] font-bold px-2 py-1 rounded">CLAUDE INSIGHT</div>
      <div className="bg-emerald-500/20 p-2 rounded-lg mt-0.5">
        <Sparkles className="h-5 w-5 text-emerald-400" />
      </div>
      <p className="text-slate-300 leading-relaxed text-sm italic">{text}</p>
    </div>
  );
}
