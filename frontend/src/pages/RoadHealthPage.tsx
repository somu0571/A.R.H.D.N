import React, { useState, useEffect } from 'react';
import RoadHealthCard from '../components/road-health/RoadHealthCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { roadHealthService } from '../services/apiServices';
import socketService from '../services/socket';
import { RoadSegment } from '../types';
import { Activity, ShieldAlert, Route, AlertCircle, Info, RefreshCw } from 'lucide-react';

export const RoadHealthPage: React.FC = () => {
  const [segments, setSegments] = useState<RoadSegment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSegments = async () => {
    try {
      const data = await roadHealthService.getRoadSegments();
      setSegments(data);
    } catch (err) {
      console.error('[ARHDN Road Health] Error loading segments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();

    socketService.connect();
    const handleSegmentUpdate = (updatedSeg: RoadSegment) => {
      setSegments((prev) =>
        prev.map((s) => (s.roadSegmentId === updatedSeg.roadSegmentId ? updatedSeg : s))
      );
    };

    socketService.on('road-health:update', handleSegmentUpdate);
    return () => {
      socketService.off('road-health:update', handleSegmentUpdate);
    };
  }, []);

  if (loading) {
    return <LoadingSpinner label="Computing Real-Time Road Health Index Metrics..." size="lg" />;
  }

  const criticalCount = segments.filter((s) => s.riskLevel === 'CRITICAL').length;
  const highCount = segments.filter((s) => s.riskLevel === 'HIGH').length;
  const avgHealth = Math.round(
    segments.reduce((acc, s) => acc + s.healthScore, 0) / (segments.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F293D] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>ROAD HEALTH INDEX (RHI) SECTOR DIRECTORY</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Dynamic segment health scoring, pavement deterioration analysis & maintenance priority calculations
          </p>
        </div>

        <button
          onClick={fetchSegments}
          className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1F293D] border border-[#1F293D] text-slate-300 text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalculate Scores</span>
        </button>
      </div>

      {/* Mandatory Analytical Standard Notice */}
      <div className="p-4 rounded-xl bg-[#0E1424] border border-cyan-500/20 flex items-start space-x-3 text-xs font-mono text-slate-300">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-cyan-400 font-bold uppercase tracking-wider block mb-1">
            Analytical Indicator Specification:
          </span>
          The Road Health Index (RHI) is an internal ARHDN analytical score formulated for municipal resource allocation and maintenance prioritization. It does not represent an officially certified statutory government civil standard.
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F293D]">
          <span className="text-xs text-slate-400 uppercase">Sector Average Health</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{avgHealth} / 100</div>
          <span className="text-[11px] text-slate-500">Across {segments.length} surveyed arterial segments</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-rose-500/20">
          <span className="text-xs text-slate-400 uppercase">Critical Risk Segments</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{criticalCount} Sectors</div>
          <span className="text-[11px] text-slate-500">Immediate public works intervention advised</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-orange-500/20">
          <span className="text-xs text-slate-400 uppercase">High Risk Segments</span>
          <div className="text-2xl font-bold text-orange-400 mt-1">{highCount} Sectors</div>
          <span className="text-[11px] text-slate-500">Scheduled for scheduled preventative resurfacing</span>
        </div>
      </div>

      {/* Road Segment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {segments.map((segment) => (
          <RoadHealthCard key={segment.roadSegmentId} segment={segment} />
        ))}
      </div>
    </div>
  );
};

export default RoadHealthPage;
