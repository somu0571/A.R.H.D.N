import React from 'react';
import { Detection } from '../../types';
import { X, ShieldAlert, MapPin, Clock, Camera, Cpu, Activity, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';

interface HazardDetailPanelProps {
  detection: Detection | null;
  onClose: () => void;
}

export const HazardDetailPanel: React.FC<HazardDetailPanelProps> = ({
  detection,
  onClose,
}) => {
  if (!detection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111827] border border-[#1F293D] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0E1424] border-b border-[#1F293D] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-mono font-bold text-slate-100 uppercase">
                Hazard Record: {detection.detectionId}
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                Aggregated via Common Intelligence Layer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1F293D]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 font-mono text-xs">
          {/* Main Status Chips */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0E1424] border border-[#1F293D]">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Hazard Classification</span>
              <span className="text-base font-bold text-white uppercase">{detection.hazardType}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block">Severity Rating</span>
              <Badge label={detection.severity} variant="severity" />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-slate-300">
            <div className="p-2.5 rounded bg-[#0A0E17] border border-[#1F293D]/60 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>Detection Confidence</span>
              </span>
              <div className="text-sm font-bold text-emerald-400">
                {(detection.confidence * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#0A0E17] border border-[#1F293D]/60 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                <span>Verification State</span>
              </span>
              <Badge label={detection.verificationStatus} variant="verification" size="sm" />
            </div>

            <div className="p-2.5 rounded bg-[#0A0E17] border border-[#1F293D]/60 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>Geospatial Position</span>
              </span>
              <div className="text-[11px] text-white">
                {detection.latitude.toFixed(5)}° N<br />
                {detection.longitude.toFixed(5)}° E
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#0A0E17] border border-[#1F293D]/60 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase flex items-center space-x-1">
                <Camera className="w-3 h-3 text-cyan-400" />
                <span>Sensing Platform</span>
              </span>
              <div className="text-[11px] text-white">
                {detection.sourceType}<br />
                <span className="text-slate-400">ID: {detection.sourceId}</span>
              </div>
            </div>
          </div>

          {/* Bounding Box Information */}
          <div className="p-3 rounded bg-[#0E1424] border border-[#1F293D] space-y-1.5">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">
              YOLOv12 Bounding Box [x1, y1, x2, y2]
            </div>
            <div className="text-xs text-cyan-400 font-bold font-mono">
              [{detection.boundingBox?.join(', ') || 'N/A'}]
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-[#1F293D]/60">
              <span>Latency: {detection.processingTimeMs || 118} ms</span>
              <span>Model: {detection.modelVersion || 'YOLOv12'}</span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-[#1F293D]">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Captured: {new Date(detection.timestamp).toLocaleString()}</span>
            </span>
            {detection.isDemo && (
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                Demo Mode
              </span>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-5 py-3 bg-[#0E1424] border-t border-[#1F293D] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1F293D] hover:bg-[#2A374F] text-slate-200 rounded-lg text-xs font-mono font-medium transition-colors"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
};

export default HazardDetailPanel;
