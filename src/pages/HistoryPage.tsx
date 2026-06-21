import { useState, useEffect } from 'react';
import { fetchAuth } from '../utils/api';
import { Download, Plane, Car, Bus, Train, Utensils, Zap } from 'lucide-react';

export default function HistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuth('/api/history')
       .then(data => { setLogs(data); setLoading(false); })
       .catch(console.error);
  }, []);

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Transport,Distance,CO2(kg),Points\n"
      + logs.map(l => `${l.date},${l.transport_mode||'None'},${l.distance_km||0},${l.total_co2_kg},${l.green_points}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ecosense_history.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Loading history...</div>;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-end mb-6">
         <div>
           <h2 className="text-2xl font-semibold tracking-tight text-slate-200">Activity History</h2>
           <p className="text-sm text-slate-400">Review your past logs and calculate your trends.</p>
         </div>
         <button onClick={exportCSV} className="flex items-center gap-2 hover:bg-slate-800 transition-colors p-2 px-4 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 border border-slate-700">
           <Download className="h-4 w-4" /> Export CSV
         </button>
       </div>
       
       <div className="bg-[#111] border border-slate-800 rounded-3xl overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left text-sm whitespace-nowrap">
             <thead className="bg-[#1a1a1a] text-xs uppercase tracking-widest font-bold text-slate-500">
               <tr>
                 <th className="px-6 py-4">Date</th>
                 <th className="px-6 py-4">Transport</th>
                 <th className="px-6 py-4">Meals</th>
                 <th className="px-6 py-4">Power</th>
                 <th className="px-6 py-4 text-right">CO2 (kg)</th>
                 <th className="px-6 py-4 text-right">Points</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-800/50">
               {logs.length === 0 && (
                 <tr><td colSpan={6} className="text-center py-8 text-slate-500">No logs found.</td></tr>
               )}
               {logs.map(log => {
                 const meals = log.meals_json ? JSON.parse(log.meals_json) : [];
                 return (
                   <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                     <td className="px-6 py-4 text-slate-300 font-medium">{log.date}</td>
                     <td className="px-6 py-4 text-slate-400 capitalize flex items-center gap-2">
                       {log.transport_mode === 'flight' && <Plane className="h-4 w-4 text-slate-500"/>}
                       {log.transport_mode === 'car' && <Car className="h-4 w-4 text-slate-500"/>}
                       {log.transport_mode === 'bus' && <Bus className="h-4 w-4 text-slate-500"/>}
                       {log.transport_mode === 'train' && <Train className="h-4 w-4 text-slate-500"/>}
                       {log.transport_mode ? `${log.transport_mode} (${log.distance_km}km)` : '-'}
                     </td>
                     <td className="px-6 py-4 text-slate-400">
                       <div className="flex items-center gap-2">
                         {meals.length > 0 ? <><Utensils className="h-4 w-4 text-orange-400 opacity-50"/> {meals.length} items</> : '-'}
                       </div>
                     </td>
                     <td className="px-6 py-4 text-slate-400">
                       {log.electricity_kwh ? <div className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-500"/> {log.electricity_kwh} kWh</div> : '-'}
                     </td>
                     <td className="px-6 py-4 text-right font-mono font-bold text-slate-200">{log.total_co2_kg}</td>
                     <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">+{log.green_points}</td>
                   </tr>
                 )
               })}
             </tbody>
           </table>
         </div>
       </div>
    </div>
  );
}
