import React from 'react';
import { Rover } from '../../types';
import { Car, Battery, Cpu, Radio, MapPin, Gauge, Activity, Clock } from 'lucide-react';
import Badge from '../common/Badge';

interface RoverCardProps {
  rover: Rover;
  onSelect?: (roverId: string) => void;
}

export const RoverCard: React.FC<RoverCardProps> = ({ rover, onSelect }) => {
  return (
    <div
      onClick={() => onSelect && onSelect(rover.roverId)}
      className="bg-[#111827] border border-[#1F293D] hover:border-cyan-500/40 rounded-xl p-5 transition-all cursor-pointer space-y-4 hover:shadow-xl hover:shadow-black/40"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 font-mono">{rover.name}</h4>
            <span className="text-[11px] font-mono text-cyan-400">{rover.roverId}</span>
          </div>
        </div>
        <Badge label={rover.status} variant="status" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2 rounded bg-[#0E1424] border border-[#1F293D]/60 flex items-center space-x-2">
          <Battery className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-[10px] text-slate-500 block">Battery</span>
            <span className="text-slate-200 font-bold">{rover.battery}%</span>
          </div>
        </div>

        <div className="p-2 rounded bg-[#0E1424] border border-[#1F293D]/60 flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-[10px] text-slate-500 block">Ground Speed</span>
            <span className="text-slate-200 font-bold">{rover.speed.toFixed(1)} km/h</span>
          </div>
        </div>

        <div className="p-2 rounded bg-[#0E1424] border border-[#1F293D]/60 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <div>
            <span className="text-[10px] text-slate-500 block">YOLOv12 Rate</span>
            <span className="text-slate-200 font-bold">{rover.aiFps.toFixed(1)} FPS</span>
          </div>
        </div>

        <div className="p-2 rounded bg-[#0E1424] border border-[#1F293D]/60 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-rose-400" />
          <div>
            <span className="text-[10px] text-slate-500 block">Core Temp</span>
            <span className="text-slate-200 font-bold">{rover.temperature.toFixed(0)}°C</span>
          </div>
        </div>
      </div>

      {/* Hardware Subsystem Badges */}
      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
        <div className={`p-1 rounded border ${rover.cameraStatus === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          CAM
        </div>
        <div className={`p-1 rounded border ${rover.gpsStatus === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          GPS
        </div>
        <div className={`p-1 rounded border ${rover.imuStatus === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          IMU
        </div>
        <div className={`p-1 rounded border ${rover.aiStatus === 'RUNNING' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
          AI
        </div>
      </div>

      {/* Geolocation & Heartbeat Footer */}
      <div className="pt-3 border-t border-[#1F293D] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-1 truncate max-w-[170px]">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="truncate">
            {rover.latitude ? `${rover.latitude.toFixed(4)}, ${rover.longitude?.toFixed(4)}` : 'GPS Searching'}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{rover.lastHeartbeat ? new Date(rover.lastHeartbeat).toLocaleTimeString() : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default RoverCard;
