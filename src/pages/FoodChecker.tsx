import { useState, useEffect } from 'react';
import { UtensilsLine, RefreshCcw, ArrowRight } from 'lucide-react';
import { fetchAuth } from '../utils/api';
import InsightCard from '../components/InsightCard';

export default function FoodChecker() {
  const [foodOptions, setFoodOptions] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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

  const handleCheck = async () => {
    if (selectedItems.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await fetchAuth('/api/food', {
        method: 'POST',
        body: JSON.stringify({ items: selectedItems })
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
        <h1 id="food-heading" className="text-2xl font-semibold tracking-tight text-slate-200">Food Carbon Checker</h1>
        <p className="text-sm text-slate-400">Select what you plan to eat to see its environmental impact.</p>
      </div>

      <section aria-labelledby="food-heading" className="bg-[#111] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="space-y-3">
          <label id="food-items-label" className="text-xs uppercase tracking-widest text-slate-500 font-bold block">Select Meal Items</label>
          <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="food-items-label">
            {foodOptions.map((item) => {
              const isSelected = selectedItems.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleItem(item)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                      : 'border-slate-800 bg-[#1a1a1a] text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className="text-sm font-medium">{item}</span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={selectedItems.length === 0 || loading}
          aria-busy={loading}
          aria-disabled={selectedItems.length === 0 || loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111] focus:ring-emerald-500 outline-none"
        >
          {loading ? 'Calculating...' : 'Calculate Meal Impact'}
          {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </section>

      {loading && <InsightCard text="" loading={true} />}

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 text-center pt-8 relative mt-4">
             <div className="text-5xl font-black text-slate-200 mb-2 font-mono tracking-tighter">{result.totalCo2} <span className="text-2xl text-slate-500">kg</span></div>
             <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Footprint for {selectedItems.length} items</p>
          </div>

          {result.swapSuggestion && (
            <div className="bg-[#1a1a1a] border border-slate-800 rounded-2xl p-5 flex items-start gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg mt-0.5">
                <RefreshCcw className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-emerald-400 font-bold mb-1 text-sm tracking-wide">Smart Swap</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{result.swapSuggestion}</p>
              </div>
            </div>
          )}

          <InsightCard text={result.insight} />
        </div>
      )}
    </div>
  );
}
