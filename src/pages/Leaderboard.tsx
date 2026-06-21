import { useState, useEffect } from 'react';
import { fetchAuth } from '../utils/api';
import { Trophy, Flame, Globe } from 'lucide-react';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuth('/api/leaderboard').then(data => {
      setLeaders(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Loading Leaderboard...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 mb-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-200 flex items-center gap-2">
           <Trophy className="text-yellow-500 h-6 w-6" /> Live Leaderboard
        </h2>
        <p className="text-sm text-slate-400">See how you rank against the global community.</p>
      </div>

      <div className="bg-[#111] border border-slate-800 rounded-3xl overflow-hidden">
        {leaders.length === 0 ? (
           <div className="p-8 text-center text-slate-500 text-sm">No recorded data yet. Be the first to log an activity!</div>
        ) : (
           <div className="divide-y divide-slate-800/50">
             {leaders.map((user: any, idx: number) => {
               let badge = null;
               if (idx === 0) badge = <div className="bg-yellow-500/20 text-yellow-500 font-black rounded-lg px-3 py-1 shadow-[0_0_15px_rgba(234,179,8,0.3)]">1st</div>;
               else if (idx === 1) badge = <div className="bg-slate-300/20 text-slate-300 font-black rounded-lg px-3 py-1">2nd</div>;
               else if (idx === 2) badge = <div className="bg-orange-600/20 text-orange-500 font-black rounded-lg px-3 py-1">3rd</div>;
               else badge = <div className="text-slate-500 font-bold px-3 py-1">#{idx + 1}</div>;

               return (
                 <div key={user.id} className="flex items-center justify-between p-4 px-6 hover:bg-slate-800/20 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className="w-12 text-center flex-shrink-0">{badge}</div>
                     <img 
                       src={user.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}&backgroundColor=10b981`} 
                       alt={user.full_name} 
                       className="w-10 h-10 rounded-full border border-slate-700"
                     />
                     <div>
                       <h3 className="font-bold text-slate-200 text-sm">{user.full_name}</h3>
                       <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">
                          <Globe className="h-3 w-3" /> {user.city || 'Earth'}
                       </div>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-6">
                     <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-bold text-slate-300 inline-flex items-center gap-1">
                           <Flame className="h-4 w-4 text-orange-500" /> {user.current_streak || 0}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-slate-600">Streak</span>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-lg font-black font-mono tracking-tighter text-emerald-400">
                          {user.green_points}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-slate-600">Points</span>
                     </div>
                   </div>
                 </div>
               )
             })}
           </div>
        )}
      </div>
    </div>
  );
}
