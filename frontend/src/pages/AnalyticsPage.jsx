import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  BarChart3, 
  RotateCcw, 
  RefreshCw, 
  TrendingUp, 
  Sparkles, 
  ShieldAlert 
} from 'lucide-react';
import { api } from '../services/api';
import CampusHeatmap from '../components/analytics/CampusHeatmap';
import RepeatAnalytics from '../components/analytics/RepeatAnalytics';

export default function AnalyticsPage() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('heatmap'); // 'heatmap' | 'repeat'

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [hm, ov] = await Promise.all([
        api.getHeatmap(),
        api.getAnalyticsOverview(),
      ]);
      setHeatmapData(hm);
      setOverviewData(ov);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-brand-600" />
            <span>Campus Intelligence & Spatial Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Spatial problem hotspots, recurring complaint analytics, and department SLA metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveView('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'heatmap'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Campus Heatmap</span>
            </button>
            <button
              onClick={() => setActiveView('repeat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'repeat'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Repeat Analytics</span>
            </button>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeView === 'heatmap' ? (
        <div className="space-y-6">
          <CampusHeatmap heatmapData={heatmapData} isLoading={isLoading} />
        </div>
      ) : (
        <div className="space-y-6">
          <RepeatAnalytics overviewData={overviewData} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
