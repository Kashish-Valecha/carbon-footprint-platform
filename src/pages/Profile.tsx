import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { fetchAuth } from '../utils/api';
import { Trophy, Award, Target, Flame } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function Profile() {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    fetchAuth('/api/profile').then(setProfileData).catch(console.error);
    fetchAuth('/api/stats').then(setStats).catch(console.error);
  }, []);

  if (!profileData) return <div className="text-center py-20 text-slate-500 animate-pulse">Loading Profile...</div>;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-center bg-[#111] p-8 border border-slate-800 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-emerald-300"></div>
        <img 
          src={profileData.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}&backgroundColor=10b981`} 
          alt="Profile" 
          className="w-24 h-24 rounded-full border-4 border-slate-900 shadow-xl"
        />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-black tracking-tight text-white">{profileData.full_name}</h1>
          <p className="text-emerald-400 font-mono text-sm mt-1">{profileData.email}</p>
          <div className="flex gap-4 items-center justify-center md:justify-start mt-4">
             <div className="bg-slate-800/50 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-slate-300">
               {profileData.city}, {profileData.country}
             </div>
             <button onClick={logout} className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 font-bold transition-colors">
               Sign Out
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Achievements Card */}
        <div className="bg-[#111] border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
             <h2 className="font-bold text-lg text-slate-200">Achievements</h2>
             <Trophy className="h-5 w-5 text-yellow-500" aria-hidden="true" />
          </div>
          {profileData.achievements && profileData.achievements.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
               {profileData.achievements.map((acc: any) => (
                 <div key={acc.achievement_name} className="flex flex-col items-center justify-center p-4 bg-[#1a1a1a] rounded-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                    <Award className="h-6 w-6 text-emerald-400 mb-2" />
                    <span className="text-xs font-bold text-center leading-tight">{acc.achievement_name}</span>
                 </div>
               ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">No achievements yet. Start logging your green actions!</div>
          )}
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-2 gap-4 auto-rows-min">
          <div className="bg-[#111] border border-slate-800 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
            <Target className="h-6 w-6 text-emerald-500 mb-2" />
            <span className="text-3xl font-black font-mono tracking-tighter text-white">{profileData.green_points}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Green Points</span>
          </div>
          <div className="bg-[#111] border border-slate-800 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
            <Flame className="h-6 w-6 text-orange-500 mb-2" />
            <span className="text-3xl font-black font-mono tracking-tighter text-white">{profileData.streak?.longest_streak || 0}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Longest Streak</span>
          </div>
          <div className="col-span-2 bg-[#111] border border-slate-800 rounded-3xl p-6">
             <h2 className="font-bold text-sm text-slate-400 mb-6 uppercase tracking-widest">CO2 Emissions Trend</h2>
             <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={stats}>
                   <defs>
                     <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" stroke="#334155" fontSize={10} tickMargin={10} minTickGap={30} />
                   <YAxis stroke="#334155" fontSize={10} width={30} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#111', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                     itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                   />
                   <Area type="monotone" dataKey="emissions" stroke="#10b981" fillOpacity={1} fill="url(#colorPv)" strokeWidth={2} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
