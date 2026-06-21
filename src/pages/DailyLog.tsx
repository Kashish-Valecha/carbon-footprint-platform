import { useState, useEffect } from 'react';
import { fetchAuth } from '../utils/api';
import { Calendar, Check, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function DailyLog() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [transportMode, setTransportMode] = useState('');
  const [distance, setDistance] = useState('');
  const [electricity, setElectricity] = useState('');
  
  const [foodOptions, setFoodOptions] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    fetchAuth('/api/food-options').then(setFoodOptions);
  }, []);

  const toggleItem = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessData(null);
    try {
      const data = await fetchAuth('/api/log', {
        method: 'POST',
        body: JSON.stringify({
          date,
          transport_mode: transportMode || null,
          distance_km: distance ? parseFloat(distance) : null,
          meals_json: JSON.stringify(selectedItems),
          electricity_kwh: electricity ? parseFloat(electricity) : 0,
        })
      });
      setSuccessData(data);
      // Reset form on success
      setTransportMode('');
      setDistance('');
      setElectricity('');
      setSelectedItems([]);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-col gap-2 mb-6">
        <h1 id="log-heading" className="text-2xl font-semibold tracking-tight text-slate-200">Log Daily Activity</h1>
        <p className="text-sm text-slate-400">Record your choices to build your green streak.</p>
      </div>

      {successData && (
        <div role="alert" aria-live="polite" className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 mb-6 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
          <div className="bg-emerald-500 p-3 rounded-full mb-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Check className="h-8 w-8 text-black" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-emerald-400 mb-2">Activity Logged Successfully!</h2>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-slate-300 font-mono"><span className="text-slate-100 font-bold">{successData.totalCo2}</span> kg CO₂</div>
            <div className="text-slate-600">•</div>
            <div className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full">+{successData.points} XP</div>
          </div>
          {successData.newCurrent > 0 && (
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Day {successData.newCurrent} Streak 🔥</p>
          )}
        </div>
      )}

      <form onSubmit={handleLog} aria-labelledby="log-heading" className="bg-[#111] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8">
        {/* Date Selector */}
        <div className="space-y-3">
          <label htmlFor="log-date" className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
            <Calendar className="h-4 w-4" aria-hidden="true" /> Activity Date
          </label>
          <input 
            id="log-date"
            type="date"
            required
            aria-required="true"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-slate-800 rounded-xl p-4 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors [&::-webkit-calendar-picker-indicator]:filter-invert"
          />
        </div>

        <hr className="border-slate-800/50" />

        {/* Transport */}
        <div className="space-y-4">
          <h3 id="transport-mode-label" className="text-sm font-bold text-slate-300 uppercase tracking-wider">Transport</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="group" aria-labelledby="transport-mode-label">
            {['flight', 'car', 'bus', 'train'].map((m) => (
              <button
                type="button"
                key={m}
                aria-pressed={transportMode === m}
                onClick={() => setTransportMode(m === transportMode ? '' : m)}
                className={`px-3 py-3 rounded-xl border transition-all text-sm capitalize font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 outline-none ${
                  transportMode === m
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : 'border-slate-800 bg-[#1a1a1a] text-slate-400 hover:border-slate-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {transportMode && (
            <div className="mt-2 space-y-2">
               <label htmlFor="distance-input" className="sr-only">Distance in km</label>
               <input 
                 id="distance-input"
                 type="number"
                 min="0"
                 placeholder="Distance in km"
                 value={distance}
                 onChange={(e) => setDistance(e.target.value)}
                 className="w-full bg-[#1a1a1a] border border-slate-800 rounded-xl p-4 text-slate-300 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
               />
            </div>
          )}
        </div>

        <hr className="border-slate-800/50" />

        {/* Meals */}
        <div className="space-y-4">
          <h3 id="meals-label" className="text-sm font-bold text-slate-300 uppercase tracking-wider">Meals Eaten</h3>
          <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="meals-label">
            {foodOptions.map((item) => (
               <label key={item} className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-slate-600 cursor-pointer transition-colors bg-[#1a1a1a] focus-within:ring-2 focus-within:ring-emerald-500">
                 <input 
                   type="checkbox"
                   checked={selectedItems.includes(item)}
                   onChange={() => toggleItem(item)}
                   className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-[#1a1a1a] bg-slate-800/50"
                 />
                 <span className="text-sm text-slate-300 font-medium">{item}</span>
               </label>
            ))}
          </div>
        </div>

        <hr className="border-slate-800/50" />

        {/* Electricity */}
        <div className="space-y-4">
          <label htmlFor="electricity-input" className="text-sm font-bold text-slate-300 uppercase tracking-wider flex justify-between items-center w-full">
            <span>Electricity Usage</span>
            <span className="text-[10px] text-slate-500 font-bold opacity-60">Avg ~4 units/day</span>
          </label>
          <input 
            id="electricity-input"
            type="number"
            min="0"
            step="0.5"
            placeholder="Units (kWh) used"
            value={electricity}
            onChange={(e) => setElectricity(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-slate-800 rounded-xl p-4 text-slate-300 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || (!transportMode && selectedItems.length === 0 && !electricity)}
          aria-busy={loading}
          aria-disabled={loading || (!transportMode && selectedItems.length === 0 && !electricity)}
          className="w-full bg-emerald-500 hover:bg-emerald-400 focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111] focus:ring-emerald-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-8"
        >
          {loading ? 'Saving...' : 'Save to Log'}
          {!loading && <Send className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>
    </div>
  );
}
