import { useEffect, useState } from 'react';
import EarthMeter from '../components/EarthMeter';
import StreakCard from '../components/StreakCard';
import InsightCard from '../components/InsightCard';
import { ArrowRight, Utensils, Navigation, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAuth } from '../utils/api';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuth('/api/dashboard')
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return <div className="text-center py-20 text-slate-500 animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-2">
        <h1 id="dashboard-heading" className="text-2xl font-semibold tracking-tight text-slate-200">Your Impact Dashboard</h1>
        <p className="text-sm text-slate-400">Track your carbon footprint and earn green points.</p>
      </div>

      <section aria-labelledby="dashboard-heading" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StreakCard streak={data.streak} totalPoints={data.totalPoints} />
        
        <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 flex flex-col justify-center">
          <h2 className="text-[10px] uppercase text-slate-500 font-bold mb-2 tracking-widest">Weekly Grade</h2>
          <div className="flex flex-col">
            <span className={`text-4xl tracking-tight font-bold ${
              data.weeklyGrade === 'A' ? 'text-emerald-400' : 
              data.weeklyGrade === 'B' ? 'text-yellow-400' :
              data.weeklyGrade === 'C' ? 'text-orange-500' : 
              data.weeklyGrade === 'D' ? 'text-red-500' : 'text-slate-600'
            }`}>
              Grade {data.weeklyGrade}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium bg-slate-900 border border-slate-800 w-fit px-3 py-1 rounded-full">
            <strong className="text-slate-300">{data.weeklyCo2}kg CO2</strong> emitted this week
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EarthMeter percent={data.earthMeterPercent} />
        
        <div className="flex flex-col gap-6">
          <InsightCard text={data.insight} />

          <div className="bg-[#111] border border-slate-800 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/trip" className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a1a] border border-slate-800 hover:border-slate-700 transition-colors group">
                <div className="flex items-center gap-4">
                   <div className="bg-slate-800/50 p-2 rounded-lg"><Navigation className="h-5 w-5 text-emerald-400" /></div>
                   <span className="font-medium text-sm text-slate-300 group-hover:text-slate-200">Check Trip Impact</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-500 transition-colors" />
              </Link>
              
              <Link to="/food" className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a1a] border border-slate-800 hover:border-slate-700 transition-colors group">
                <div className="flex items-center gap-4">
                   <div className="bg-slate-800/50 p-2 rounded-lg"><Utensils className="h-5 w-5 text-orange-400" /></div>
                   <span className="font-medium text-sm text-slate-300 group-hover:text-slate-200">Check Food Impact</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-orange-500 transition-colors" />
              </Link>

              <Link to="/log" className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors group">
                <div className="flex items-center gap-4">
                   <div className="bg-emerald-500/20 p-2 rounded-lg"><CheckCircle2 className="h-5 w-5 text-emerald-400" /></div>
                   <span className="font-medium text-sm text-emerald-400 group-hover:text-emerald-300">Log Daily Activity</span>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
