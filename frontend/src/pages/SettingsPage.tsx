import React, { useState } from 'react';
import { Settings, Cpu, Database, Sliders, Shield, Save, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [modelPath, setModelPath] = useState('./models/best.pt');
  const [confThreshold, setConfThreshold] = useState(0.40);
  const [iouThreshold, setIouThreshold] = useState(0.45);
  const [device, setDevice] = useState('auto');
  const [proximityMeters, setProximityMeters] = useState(50);
  const [verificationSources, setVerificationSources] = useState(2);
  const [demoMode, setDemoMode] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#1F293D] pb-4">
        <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>SYSTEM & ALGORITHM CONFIGURATION</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Tune YOLOv12 inference parameters, spatial deduplication radii & multi-source verification thresholds
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AI / Computer Vision Configuration */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider border-b border-[#1F293D] pb-3">
            <Cpu className="w-4 h-4" />
            <span>YOLOv12 Neural Detection Engine Parameters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 uppercase">
                Model Weights Checkpoint Path
              </label>
              <input
                type="text"
                value={modelPath}
                onChange={(e) => setModelPath(e.target.value)}
                className="w-full bg-[#0A0E17] text-white px-3 py-2 rounded-lg border border-[#1F293D] focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 uppercase">
                Target Hardware Acceleration Device
              </label>
              <select
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="w-full bg-[#0A0E17] text-white px-3 py-2 rounded-lg border border-[#1F293D] focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="auto">Auto-Select (CUDA GPU if present, else CPU)</option>
                <option value="cuda">Force NVIDIA CUDA (cuda:0)</option>
                <option value="cpu">Force CPU Vector Processing</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 uppercase">
                Confidence Threshold: {(confThreshold * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.10"
                max="0.95"
                step="0.05"
                value={confThreshold}
                onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500">
                Minimum classification confidence required to register a detection.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 uppercase">
                IoU NMS Overlap Threshold: {(iouThreshold * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.20"
                max="0.80"
                step="0.05"
                value={iouThreshold}
                onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500">
                Non-Maximum Suppression threshold for overlapping bounding boxes.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Common Intelligence Layer Configuration */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider border-b border-[#1F293D] pb-3">
            <Sliders className="w-4 h-4" />
            <span>Common Intelligence Layer Association Rules</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 uppercase">
                Spatial Clustering Proximity Radius (Meters)
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={proximityMeters}
                onChange={(e) => setProximityMeters(parseInt(e.target.value, 10))}
                className="w-full bg-[#0A0E17] text-white px-3 py-2 rounded-lg border border-[#1F293D] focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-500">
                Haversine distance within which repeated detections merge into a single HazardEvent.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 uppercase">
                Verification Source Threshold
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={verificationSources}
                onChange={(e) => setVerificationSources(parseInt(e.target.value, 10))}
                className="w-full bg-[#0A0E17] text-white px-3 py-2 rounded-lg border border-[#1F293D] focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-500">
                Independent observations needed to elevate a hazard to VERIFIED status.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Simulation Environment */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider border-b border-[#1F293D] pb-3">
            <Database className="w-4 h-4" />
            <span>Simulation & Demonstration Framework</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <div className="space-y-1">
              <span className="font-bold text-slate-200 uppercase block">Active Simulation Daemon</span>
              <p className="text-[11px] text-slate-400 font-sans">
                Generates dynamic rover paths, virtual sensor telemetry, and CCTV hazard events across Delhi NCR road segments.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#1F293D] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold">
              <Check className="w-4 h-4" />
              <span>Configuration successfully committed to runtime.</span>
            </div>
          )}
          {!saved && <div />}

          <button
            type="submit"
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-lg flex items-center space-x-2 transition-colors shadow-lg shadow-cyan-500/10"
          >
            <Save className="w-4 h-4" />
            <span>Commit Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
