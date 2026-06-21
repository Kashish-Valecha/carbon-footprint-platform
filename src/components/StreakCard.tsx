import { Flame } from 'lucide-react';

export default function StreakCard({ streak, totalPoints }: { streak: number; totalPoints: number }) {
  return (
    <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 flex items-center justify-between">
      <div>
        <h3 className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Total Green Points</h3>
        <div className="text-3xl font-bold text-slate-200 flex items-baseline gap-1">
          {totalPoints} <span className="text-sm font-bold text-emerald-500">XP</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="relative">
          <Flame className={`h-12 w-12 ${streak > 0 ? 'text-orange-500' : 'text-slate-700'}`} />
          {streak > 0 && (
            <div className="absolute -top-2 -right-2 bg-[#1a1a1a] border border-slate-800 rounded-full h-7 w-7 flex items-center justify-center text-xs font-bold text-slate-200 shadow-sm">
              {streak}
            </div>
          )}
        </div>
        <span className="text-[10px] uppercase text-slate-500 font-bold mt-2 tracking-widest">Day Streak</span>
      </div>
    </div>
  );
}
