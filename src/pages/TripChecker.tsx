import { useState, useEffect } from 'react';
import { Plane, Car, Bus, Train, TreePine, Flame, Smartphone, ArrowRight } from 'lucide-react';
import { fetchAuth } from '../utils/api';
import InsightCard from '../components/InsightCard';

export default function TripChecker() {
  const [cityPairs, setCityPairs] = useState<string[]>([]);
  const [selectedPair, setSelectedPair] = useState("");
  const [mode, setMode] = useState("flight");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchAuth('/api/city-pairs').then(setCityPairs);
  }, []);

  const handleCheck = async () => {
    if (!selectedPair) return;
    setLoading(true);
    setResult(null);
    const [origin, destination] = selectedPair.split("-");
    try {
      const data = await fetchAuth('/api/trip', {
        method: 'POST',
        body: JSON.stringify({ origin, destination, mode })
      });
      setResult(data);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-col gap-2 mb-6">
        <h1 id="trip-heading" className="text-2xl font-semibold tracking-tight text-slate-200">Trip Impact Checker</h1>
        <p className="text-sm text-slate-400">See the environmental cost of your journey before you go.</p>
      </div>

      <section aria-labelledby="trip-heading" className="bg-[#111] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="space-y-3">
          <label htmlFor="route-select" className="text-xs uppercase tracking-widest text-slate-500 font-bold block">Select Route</label>
          <select 
            id="route-select"
            className="w-full bg-[#1a1a1a] border border-slate-800 rounded-xl p-4 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            aria-required="true"
          >
            <option value="">-- Choose a city pair --</option>
            {cityPairs.map(p => <option key={p} value={p}>{p.replace("-", " to ")}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          <label id="travel-mode-label" className="text-xs uppercase tracking-widest text-slate-500 font-bold block">Travel Mode</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="group" aria-labelledby="travel-mode-label">
            {[
              { id: 'flight', icon: Plane, label: 'Flight' },
              { id: 'car', icon: Car, label: 'Car' },
              { id: 'bus', icon: Bus, label: 'Bus' },
              { id: 'train', icon: Train, label: 'Train' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={mode === m.id}
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  mode === m.id 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : 'border-slate-800 bg-[#1a1a1a] text-slate-400 hover:border-slate-600'
                }`}
              >
                <m.icon className={`h-6 w-6 mb-2 ${mode === m.id ? 'text-emerald-400' : ''}`} aria-hidden="true" />
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={!selectedPair || loading}
          aria-busy={loading}
          aria-disabled={!selectedPair || loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111] focus:ring-emerald-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
        >
          {loading ? 'Calculating...' : 'Calculate Impact'}
          {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </section>

      {loading && <InsightCard text="" loading={true} />}

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 text-center pt-10 relative mt-4">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
               {selectedPair.replace("-", " → ")} • {result.distance}km
             </div>
             <div className="text-5xl font-black text-slate-200 mb-2 font-mono tracking-tighter">{result.selectedCo2} <span className="text-2xl text-slate-500">kg</span></div>
             <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Emissions footprint</p>
          </div>

          <div className="bg-emerald-500 rounded-3xl p-6 md:p-8 flex items-center justify-between text-black flex-wrap gap-6">
            <div className="flex flex-col w-full md:w-auto">
              <span className="text-[10px] uppercase font-bold opacity-60">Impact Equivalent</span>
              <span className="text-xl font-bold tracking-tight">Your trip equals:</span>
            </div>
            <div className="flex gap-4 md:gap-8 justify-between w-full md:w-auto">
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-1">🍳</span>
                <span className="text-sm font-bold">{result.equivalents.cookingDays} Days</span>
                <span className="text-[9px] uppercase font-bold opacity-60 text-center">Cooking<br/>Gas</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-1">📱</span>
                <span className="text-sm font-bold">{result.equivalents.phoneCharges}</span>
                <span className="text-[9px] uppercase font-bold opacity-60 text-center">Phone<br/>Charges</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-1">🌳</span>
                <span className="text-sm font-bold">{result.equivalents.treesAbsorbed}</span>
                <span className="text-[9px] uppercase font-bold opacity-60 text-center">Trees<br/>Needed</span>
              </div>
            </div>
          </div>

          <InsightCard text={result.insight} />

          <div className="bg-[#111] border border-slate-800 rounded-3xl p-6 md:p-8">
            <h3 className="text-lg font-semibold mb-6">Mode Comparison</h3>
            <div className="space-y-4">
              {result.comparisons.sort((a: any, b: any) => a.co2 - b.co2).map((comp: any) => {
                const maxEmissions = Math.max(...result.comparisons.map((c:any) => c.co2));
                const percentage = (comp.co2 / maxEmissions) * 100;
                const isGreenest = comp.mode === result.greenestOption.mode;

                return (
                  <div key={comp.mode} className="relative">
                    <div className="flex justify-between items-end mb-1 text-sm">
                      <span className={`font-medium capitalize ${isGreenest ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                        {comp.mode} {isGreenest && '🌱'}
                      </span>
                      <span className={`font-mono text-sm ${isGreenest ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>{comp.co2} kg</span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                       <div 
                         className={`h-full rounded-full ${isGreenest ? 'bg-emerald-500' : 'bg-slate-500'}`} 
                         style={{ width: `${percentage}%` }}
                       ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
