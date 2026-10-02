import React from 'react';
import { CCTVCamera } from '../../types';
import { Camera, MapPin, ShieldAlert, Clock, Radio } from 'lucide-react';
import Badge from '../common/Badge';

interface CCTVCardProps {
  cctv: CCTVCamera;
}

export const CCTVCard: React.FC<CCTVCardProps> = ({ cctv }) => {
  return (
    <div className="bg-[#111827] border border-[#1F293D] rounded-xl overflow-hidden flex flex-col space-y-3">
      {/* Header */}
      <div className="p-4 bg-[#0E1424] border-b border-[#1F293D] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono text-slate-100 uppercase">{cctv.name}</h4>
            <span className="text-[10px] font-mono text-slate-400">{cctv.cameraId}</span>
          </div>
        </div>
        <Badge label={cctv.status} variant="status" size="sm" />
      </div>

      {/* Simulated Live Stream Preview Area */}
      <div className="relative aspect-video bg-[#05070B] mx-4 rounded-lg overflow-hidden border border-[#1F293D] flex items-center justify-center">
        {/* Road intersection representation */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#0F172A] to-[#050811] relative">
          <div className="absolute inset-x-0 h-10 bg-[#1E293B]/70 top-1/2 -translate-y-1/2 border-y border-[#334155] border-dashed"></div>
          <div className="absolute inset-y-0 w-10 bg-[#1E293B]/70 left-1/2 -translate-x-1/2 border-x border-[#334155] border-dashed"></div>

          {/* Simulation Overlay Tag */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            RTSP SIMULATED
          </div>

          <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-400 flex items-center space-x-1">
            <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
            <span>OPTICAL SENSOR</span>
          </div>
        </div>
      </div>

      {/* Metadata Metrics */}
      <div className="px-4 pb-4 space-y-2 text-xs font-mono">
        <div className="flex items-center space-x-1.5 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="truncate">{cctv.location}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1F293D]/60 text-[11px]">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Hazards Logged</span>
            <span className="text-amber-400 font-bold">{cctv.hazardCount} Detected</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Last Observation</span>
            <span className="text-slate-300">
              {cctv.lastDetection ? new Date(cctv.lastDetection).toLocaleTimeString() : 'None'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CCTVCard;
