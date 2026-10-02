import React, { useState, useEffect } from 'react';
import CCTVCard from '../components/cctv/CCTVCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { cctvService } from '../services/apiServices';
import { CCTVCamera } from '../types';
import { Camera, RefreshCw, AlertCircle, Plus } from 'lucide-react';

export const CCTVPage: React.FC = () => {
  const [cctvs, setCctvs] = useState<CCTVCamera[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCCTV = async () => {
    try {
      const data = await cctvService.getCCTVs();
      setCctvs(data);
    } catch (err) {
      console.error('[ARHDN CCTV] Error fetching cameras:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCCTV();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Connecting to Municipal Traffic CCTV Ingest Gateways..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F293D] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100 flex items-center space-x-2">
            <Camera className="w-5 h-5 text-purple-400" />
            <span>ROADSIDE CCTV SURVEILLANCE NODES</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Static traffic camera feeds feeding the Common Intelligence Layer for stationary pavement defect surveillance
          </p>
        </div>

        <button
          onClick={fetchCCTV}
          className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1F293D] border border-[#1F293D] text-slate-300 text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Streams</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-[#0E1424] border border-[#1F293D] flex items-center space-x-3 text-xs font-mono text-slate-400">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div>
          <span className="text-amber-400 font-bold uppercase">Hybrid Sensing Ingest: </span>
          Both mobile rover feeds and roadside CCTV feeds are normalized through the Common Intelligence Layer, enabling continuous multi-source verification.
        </div>
      </div>

      {/* CCTV Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cctvs.map((cam) => (
          <CCTVCard key={cam.cameraId} cctv={cam} />
        ))}
      </div>
    </div>
  );
};

export default CCTVPage;
