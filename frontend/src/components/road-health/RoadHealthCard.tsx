import React from 'react';
import { RoadSegment } from '../../types';
import { Activity, ShieldAlert, Route, AlertTriangle, Clock } from 'lucide-react';
import Badge from '../common/Badge';

interface RoadHealthCardProps {
  segment: RoadSegment;
}

export const RoadHealthCard: React.FC<RoadHealthCardProps> = ({ segment }) => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    if (score >= 25) return 'text-orange-400';
    return 'text-rose-400';
  };

  const getScoreBar = (score: number) => {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    if (score >= 25) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 space-y-4 hover:border-cyan-500/30 transition-all">
      {/* Title & Risk Tier */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
            {segment.roadSegmentId}
          </span>
          <h4 className="text-sm font-bold text-slate-100">{segment.name}</h4>
        </div>
        <Badge label={`RISK: ${segment.riskLevel}`} variant="severity" value={segment.riskLevel} />
      </div>

      {/* Health Score Gauge */}
      <div className="p-4 rounded-lg bg-[#0E1424] border border-[#1F293D] flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Road Health Index
          </span>
          <div className={`text-3xl font-extrabold font-mono tracking-tight ${getScoreColor(segment.healthScore)}`}>
            {segment.healthScore}
            <span className="text-xs text-slate-500 font-normal"> / 100</span>
          </div>
        </div>

        <div className="w-32 space-y-1 text-right">
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            Maintenance Priority
          </span>
          <div className="text-sm font-bold font-mono text-cyan-400">
            {segment.maintenancePriority} / 100
          </div>
          <div className="w-full bg-[#1F293D] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreBar(segment.healthScore)} transition-all duration-500`}
              style={{ width: `${segment.healthScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
        <div className="p-2 rounded bg-[#0E1424] border border-[#1F293D]/60">
          <span className="text-[10px] text-slate-500 block uppercase">Total Hazards</span>
          <span className="text-slate-200 font-bold">{segment.hazardCount}</span>
        </div>
        <div className="p-2 rounded bg-[#0E1424] border border-[#1F293D]/60">
          <span className="text-[10px] text-slate-500 block uppercase">Critical</span>
          <span className="text-rose-400 font-bold">{segment.criticalHazards}</span>
        </div>
        <div className="p-2 rounded bg-[#0E1424] border border-[#1F293D]/60">
          <span className="text-[10px] text-slate-500 block uppercase">Verified</span>
          <span className="text-cyan-400 font-bold">{segment.verifiedHazards}</span>
        </div>
      </div>

      {/* Distance Surveyed & Timestamp */}
      <div className="pt-2 border-t border-[#1F293D] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center space-x-1">
          <Route className="w-3.5 h-3.5 text-cyan-400" />
          <span>Surveyed: {segment.distanceSurveyed.toFixed(1)} km</span>
        </span>
        <span className="flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{segment.lastSurveyed ? new Date(segment.lastSurveyed).toLocaleTimeString() : 'Pending'}</span>
        </span>
      </div>
    </div>
  );
};

export default RoadHealthCard;
