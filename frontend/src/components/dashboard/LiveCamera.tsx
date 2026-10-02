import React, { useState, useEffect } from 'react';
import { Rover } from '../../types';
import { Camera, Cpu, Zap, Activity, Radio, AlertTriangle } from 'lucide-react';
import Badge from '../common/Badge';

interface LiveCameraProps {
  rover?: Rover;
  isSimulated?: boolean;
}

export const LiveCamera: React.FC<LiveCameraProps> = ({
  rover,
  isSimulated = true,
}) => {
  const [pulseBox, setPulseBox] = useState<{ x: number; y: number; w: number; h: number; type: string; conf: number }>({
    x: 180,
    y: 220,
    w: 160,
    h: 90,
    type: 'pothole',
    conf: 0.94,
  });

  // Dynamic simulated bounding box jitter representing active YOLOv12 inference tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseBox((prev) => ({
        x: Math.max(80, Math.min(320, prev.x + (Math.random() * 20 - 10))),
        y: Math.max(160, Math.min(280, prev.y + (Math.random() * 14 - 7))),
        w: Math.max(120, Math.min(220, prev.w + (Math.random() * 10 - 5))),
        h: Math.max(70, Math.min(130, prev.h + (Math.random() * 8 - 4))),
        type: Math.random() > 0.4 ? 'pothole' : 'crack',
        conf: parseFloat((0.85 + Math.random() * 0.12).toFixed(2)),
      }));
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#111827] border border-[#1F293D] rounded-xl overflow-hidden flex flex-col">
      {/* Stream Header */}
      <div className="px-4 py-3 bg-[#0E1424] border-b border-[#1F293D] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold text-slate-200 uppercase">
            {rover ? `${rover.name} (${rover.roverId})` : 'Primary Road Rover'} - Forward Cam
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isSimulated && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              SIMULATION FEED
            </span>
          )}
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">LIVE</span>
        </div>
      </div>

      {/* Camera Viewport Canvas with Dark Road Scene */}
      <div className="relative aspect-video bg-[#05070B] overflow-hidden select-none">
        {/* Road Perspective Graphical Canvas */}
        <svg className="w-full h-full" viewBox="0 0 640 360" preserveAspectRatio="none">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="100%" stopColor="#1C2541" />
            </linearGradient>
            <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E232A" />
              <stop offset="100%" stopColor="#0E1116" />
            </linearGradient>
          </defs>

          {/* Sky / Horizon */}
          <rect width="640" height="150" fill="url(#skyGrad)" />
          <line x1="0" y1="150" x2="640" y2="150" stroke="#3A506B" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

          {/* Pavement Surface */}
          <polygon points="260,150 380,150 640,360 0,360" fill="url(#roadGrad)" />

          {/* Road Lane Markings */}
          <line x1="320" y1="150" x2="320" y2="180" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="10 15" opacity="0.6" />
          <line x1="320" y1="190" x2="320" y2="250" stroke="#E2E8F0" strokeWidth="3" strokeDasharray="16 20" opacity="0.8" />
          <line x1="320" y1="270" x2="320" y2="360" stroke="#E2E8F0" strokeWidth="5" strokeDasharray="24 24" />

          {/* Simulated Pavement Distress Pattern on Road */}
          <ellipse cx="270" cy="275" rx="45" ry="18" fill="#050608" stroke="#374151" strokeWidth="2" opacity="0.9" />
          <path d="M240 270 Q 270 280 295 272" stroke="#4B5563" strokeWidth="2" fill="none" />
        </svg>

        {/* AI Bounding Box Overlay */}
        <div
          className="absolute border-2 border-cyan-400 bg-cyan-500/10 transition-all duration-700 ease-out"
          style={{
            left: `${(pulseBox.x / 640) * 100}%`,
            top: `${(pulseBox.y / 360) * 100}%`,
            width: `${(pulseBox.w / 640) * 100}%`,
            height: `${(pulseBox.h / 360) * 100}%`,
          }}
        >
          {/* Label Tag */}
          <div className="absolute -top-6 left-0 bg-cyan-500 text-black px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1 shadow">
            <span>{pulseBox.type}</span>
            <span>{(pulseBox.conf * 100).toFixed(0)}%</span>
          </div>
          {/* Corner target Reticles */}
          <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-300"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-300"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-300"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-300"></div>
        </div>

        {/* HUD Telemetry Overlay on Video */}
        <div className="absolute top-3 left-3 bg-[#0B0F19]/80 backdrop-blur border border-[#1F293D] rounded px-2.5 py-1.5 font-mono text-[11px] text-cyan-400 space-y-0.5">
          <div>MODEL: <span className="text-white font-bold">YOLOv12-RoadHazards</span></div>
          <div>INFERENCE: <span className="text-emerald-400 font-bold">{rover?.aiFps || 14.2} FPS</span></div>
          <div>RES: <span className="text-slate-300">640x640 (OpenCV CLAHE)</span></div>
        </div>

        <div className="absolute bottom-3 right-3 bg-[#0B0F19]/80 backdrop-blur border border-[#1F293D] rounded px-2.5 py-1.5 font-mono text-[11px] text-slate-300 space-y-0.5 text-right">
          <div>LAT: <span className="text-white font-bold">{rover?.latitude?.toFixed(4) || '28.6139'}° N</span></div>
          <div>LON: <span className="text-white font-bold">{rover?.longitude?.toFixed(4) || '77.2090'}° E</span></div>
          <div>SPEED: <span className="text-cyan-400 font-bold">{rover?.speed?.toFixed(1) || '32.4'} km/h</span></div>
        </div>
      </div>

      {/* Sensor Health and Diagnostics Bar */}
      <div className="p-3 bg-[#0E1424] border-t border-[#1F293D] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Battery:</span>
          <span className="text-slate-200 font-bold">{rover?.battery || 88}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">CPU Load:</span>
          <span className="text-slate-200 font-bold">{rover?.cpuUsage?.toFixed(0) || 48}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-slate-400">Temp:</span>
          <span className="text-slate-200 font-bold">{rover?.temperature?.toFixed(0) || 52}°C</span>
        </div>
        <div className="flex items-center space-x-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Network:</span>
          <span className="text-emerald-400 font-bold">{rover?.networkStatus || 'CONNECTED'}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveCamera;
