import React from 'react';
import { Rover } from '../../types';
import { Car, Battery, Wifi, Cpu, Camera, Radio } from 'lucide-react';
import Badge from '../common/Badge';

interface RoverStatusProps {
  rovers: Rover[];
  onSelectRover?: (roverId: string) => void;
}

export const RoverStatus: React.FC<RoverStatusProps> = ({
  rovers,
  onSelectRover,
}) => {
  return (
    <div className="bg-[#111827] border border-[#1F293D] rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 bg-[#0E1424] border-b border-[#1F293D] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Car className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Active Mobile Sensing Fleets
          </h3>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 font-semibold">
          {rovers.filter((r) => r.status === 'ONLINE').length} / {rovers.length} Online
        </span>
      </div>

      <div className="divide-y divide-[#1F293D] overflow-y-auto max-h-[380px]">
        {rovers.map((rover) => (
          <div
            key={rover.roverId}
            onClick={() => onSelectRover && onSelectRover(rover.roverId)}
            className="p-3.5 hover:bg-[#151D2E] transition-colors cursor-pointer space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 font-mono">{rover.name}</span>
                <span className="ml-2 text-[10px] font-mono text-slate-500">[{rover.roverId}]</span>
              </div>
              <Badge label={rover.status} variant="status" size="sm" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-200">{rover.battery}%</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200">{rover.aiFps.toFixed(1)} FPS</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Radio className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-200">{rover.speed.toFixed(0)} km/h</span>
              </div>
            </div>

            {/* Subsystem status indicators */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-[#1F293D]/60">
              <span className="flex items-center space-x-1">
                <span className={`w-1.5 h-1.5 rounded-full ${rover.cameraStatus === 'CONNECTED' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span>CAM</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className={`w-1.5 h-1.5 rounded-full ${rover.gpsStatus === 'CONNECTED' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span>GPS</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className={`w-1.5 h-1.5 rounded-full ${rover.imuStatus === 'CONNECTED' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span>IMU</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className={`w-1.5 h-1.5 rounded-full ${rover.aiStatus === 'RUNNING' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span>YOLOv12</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoverStatus;
