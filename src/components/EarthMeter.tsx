import { Globe } from 'lucide-react';

export default function EarthMeter({ percent }: { percent: number }) {
  // Cap at 100% for the visual meter
  const displayPercent = Math.min(100, Math.max(0, percent));
  
  // Color logic
  let ringColor = 'text-emerald-500';
  if (displayPercent > 100) ringColor = 'text-red-500';
  else if (displayPercent > 80) ringColor = 'text-orange-500';
  else if (displayPercent > 50) ringColor = 'text-yellow-500';

  let emoji = '🌍';
  if (percent > 100) emoji = '🔥';
  else if (percent > 80) emoji = '🥵';

  return (
    <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
      <h2 className="text-sm text-slate-400 uppercase tracking-widest mb-6">Earth Damage Meter</h2>
      
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            className="text-slate-800 stroke-current"
            strokeWidth="8"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
          ></circle>
          <circle
            className={`${ringColor} stroke-current transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (251.2 * displayPercent) / 100}
          ></circle>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold">{percent}%</span>
          <span className={`text-[10px] uppercase font-bold tracking-tighter ${ringColor}`}>
            {percent > 100 ? "Danger" : "Safe Zone"}
          </span>
        </div>
      </div>
      
      <div className="mt-6 text-center flex flex-col items-center">
        <span className="text-2xl mb-2">{emoji}</span>
        <p className="text-xs text-slate-500 text-center max-w-[240px]">
          {percent > 100 
            ? "You've exceeded the average weekly carbon limit!" 
            : "Percent of the average Indian weekly carbon footprint used."}
        </p>
      </div>
    </div>
  );
}
