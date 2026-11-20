import React, { useState } from 'react';
import { 
  MapPin, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Info,
  Maximize2
} from 'lucide-react';
import { UrgencyBadge } from '../common/Badge';

export default function CampusHeatmap({ heatmapData, isLoading }) {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [filterType, setFilterType] = useState('All');

  if (isLoading || !heatmapData) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center py-24">
        <span className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin inline-block mb-3" />
        <p className="text-sm text-slate-500 font-medium">Aggregating campus coordinates and severity scores...</p>
      </div>
    );
  }

  const { points = [], total_active_complaints = 0, highest_density_zone = 'None' } = heatmapData;

  const filteredPoints = points.filter((p) => {
    if (filterType === 'All') return true;
    return p.type === filterType;
  });

  const getSeverityColor = (point) => {
    if (point.critical_complaints > 0 || point.severity_score >= 6) {
      return {
        bg: 'bg-red-500',
        ring: 'ring-red-400',
        badge: 'bg-red-100 text-red-800 border-red-300',
        pulse: true,
      };
    }
    if (point.open_complaints >= 2 || point.severity_score >= 3) {
      return {
        bg: 'bg-amber-500',
        ring: 'ring-amber-300',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        pulse: false,
      };
    }
    if (point.open_complaints >= 1) {
      return {
        bg: 'bg-yellow-400',
        ring: 'ring-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        pulse: false,
      };
    }
    return {
      bg: 'bg-emerald-500',
      ring: 'ring-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      pulse: false,
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Top Header & Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-600" />
            <span>Interactive Campus Problem Heatmap</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time geospatial severity scoring based on open complaint volume and urgency weighting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            Active Issues: <strong className="text-slate-900">{total_active_complaints}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            Highest Hotspot: <strong>{highest_density_zone}</strong>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-slate-500">Filter Buildings:</span>
        {["All", "Hostel", "Academic", "Mess", "Sports"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
              filterType === t
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Campus Map Container */}
      <div className="relative w-full aspect-[16/10] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner p-4 flex flex-col justify-between">
        {/* SVG Grid and Campus Road Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#campus-grid)" />
          {/* Main campus loop road */}
          <path d="M 150 120 Q 400 80 750 150 T 800 500 T 500 650 T 150 500 Z" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="6,6" />
        </svg>

        {/* Zone Labels */}
        <div className="absolute top-4 left-6 text-[10px] font-black uppercase tracking-widest text-slate-600">
          North Campus · Residential
        </div>
        <div className="absolute top-4 right-6 text-[10px] font-black uppercase tracking-widest text-slate-600">
          East Campus · Hostels
        </div>
        <div className="absolute bottom-4 left-6 text-[10px] font-black uppercase tracking-widest text-slate-600">
          West Campus · Lecture Blocks
        </div>
        <div className="absolute bottom-4 right-6 text-[10px] font-black uppercase tracking-widest text-slate-600">
          South Campus · Recreation
        </div>

        {/* Hotspots */}
        {filteredPoints.map((point) => {
          const color = getSeverityColor(point);
          const isSelected = selectedPoint?.name === point.name;

          return (
            <div
              key={point.name}
              style={{
                left: `${point.coord_x}%`,
                top: `${point.coord_y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => setSelectedPoint(point)}
              className="absolute cursor-pointer group z-20"
            >
              {/* Outer pulsing ring for critical/high hotspots */}
              {color.pulse && (
                <span className="absolute -inset-3 rounded-full bg-red-500 opacity-40 animate-ping pointer-events-none" />
              )}

              {/* Main Hotspot Pin */}
              <div
                className={`relative flex items-center justify-center rounded-xl p-2.5 transition-all shadow-lg ${
                  isSelected
                    ? 'ring-4 ring-white scale-125 z-30 ' + color.bg
                    : `group-hover:scale-110 ring-2 ${color.ring} ` + color.bg
                } text-white font-bold text-xs`}
              >
                <Building2 className="w-4 h-4 mr-1 opacity-90" />
                <span className="font-mono">{point.building_code || point.name.slice(0, 4)}</span>
                {point.open_complaints > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full bg-black/40 text-white font-black">
                    {point.open_complaints}
                  </span>
                )}
              </div>

              {/* Label Pill */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap bg-slate-900/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                {point.name}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="relative z-10 self-start bg-slate-900/90 backdrop-blur-sm border border-slate-800 p-2.5 rounded-xl flex items-center gap-4 text-[11px] text-slate-300">
          <span className="font-bold text-slate-400">Severity:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Normal (0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span>Low (1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Medium (2-3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>Critical / Dense (4+)</span>
          </div>
        </div>
      </div>

      {/* Selected Location Detail Card */}
      {selectedPoint && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm">{selectedPoint.name}</h4>
              <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
                Zone: {selectedPoint.zone || 'Campus'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
              <span>Total Filed: <strong>{selectedPoint.total_complaints}</strong></span>
              <span>Open: <strong className="text-brand-600">{selectedPoint.open_complaints}</strong></span>
              <span>Critical: <strong className="text-red-600">{selectedPoint.critical_complaints}</strong></span>
              <span>Severity Index: <strong>{selectedPoint.severity_score}</strong></span>
            </div>

            {selectedPoint.top_issues && selectedPoint.top_issues.length > 0 && (
              <div className="mt-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Recent issues here:</span>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-500">
                  {selectedPoint.top_issues.map((iss, i) => (
                    <li key={i} className="truncate">{iss}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={() => setSelectedPoint(null)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100"
          >
            Close Detail
          </button>
        </div>
      )}
    </div>
  );
}
