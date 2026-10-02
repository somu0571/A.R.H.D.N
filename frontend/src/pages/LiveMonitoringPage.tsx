import React, { useState, useEffect } from 'react';
import { roverService } from '../services/apiServices';
import socketService from '../services/socket';
import { Rover, TelemetryData } from '../types';
import LiveCamera from '../components/dashboard/LiveCamera';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { Car, Cpu, Battery, Radio, Gauge, MapPin, Activity, Compass, AlertCircle } from 'lucide-react';

export const LiveMonitoringPage: React.FC = () => {
  const [rovers, setRovers] = useState<Rover[]>([]);
  const [selectedRoverId, setSelectedRoverId] = useState<string>('ARHDN-01');
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRovers = async () => {
      try {
        const data = await roverService.getRovers();
        setRovers(data);
        if (data.length > 0) {
          setSelectedRoverId(data[0].roverId);
        }
      } catch (err) {
        console.error('[ARHDN Live] Error fetching rovers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRovers();
  }, []);

  useEffect(() => {
    socketService.connect();

    const handleTelemetry = (data: TelemetryData) => {
      if (data.roverId === selectedRoverId) {
        setTelemetry(data);
      }
    };

    const handleRoverLocation = (data: { roverId: string; latitude: number; longitude: number; speed: number; heading: number }) => {
      setRovers((prev) =>
        prev.map((r) =>
          r.roverId === data.roverId
            ? { ...r, latitude: data.latitude, longitude: data.longitude, speed: data.speed, heading: data.heading }
            : r
        )
      );
    };

    socketService.on('rover:telemetry', handleTelemetry);
    socketService.on('rover:location', handleRoverLocation);

    return () => {
      socketService.off('rover:telemetry', handleTelemetry);
      socketService.off('rover:location', handleRoverLocation);
    };
  }, [selectedRoverId]);

  if (loading) {
    return <LoadingSpinner label="Calibrating Live Optical Telemetry Channels..." size="lg" />;
  }

  const activeRover = rovers.find((r) => r.roverId === selectedRoverId) || rovers[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F293D] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100 flex items-center space-x-2">
            <span>LIVE VEHICLE SENSING MONITOR</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time optical feed, OpenCV preprocessing telemetry, 6-DOF IMU dynamics & edge compute diagnostics
          </p>
        </div>

        {/* Rover Selector Pills */}
        <div className="flex items-center space-x-2">
          {rovers.map((r) => (
            <button
              key={r.roverId}
              onClick={() => setSelectedRoverId(r.roverId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center space-x-1.5 border ${
                selectedRoverId === r.roverId
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-[#111827] text-slate-400 border-[#1F293D] hover:text-slate-200'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>{r.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Video Stream + Deep Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Optical Stream (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <LiveCamera rover={activeRover} isSimulated={true} />

          {/* Environmental disclaimer */}
          <div className="p-3 bg-[#0E1424] border border-[#1F293D] rounded-xl flex items-center space-x-3 text-xs font-mono text-slate-400">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-amber-400 font-bold uppercase">Simulation Feed: </span>
              Physical camera feed replaced with simulated road scenery and YOLOv12 model detection boxes for demonstration.
            </div>
          </div>
        </div>

        {/* Detailed Sensor Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Edge Compute Metrics */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Edge Compute Node Diagnostics</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#0E1424] border border-[#1F293D] space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">Inference Frame Rate</span>
                <div className="text-lg font-bold text-cyan-400">
                  {telemetry?.aiFps ? telemetry.aiFps.toFixed(1) : activeRover?.aiFps.toFixed(1) || '14.5'} FPS
                </div>
                <span className="text-[10px] text-slate-400">Architecture: YOLOv12</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0E1424] border border-[#1F293D] space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">CPU Core Load</span>
                <div className="text-lg font-bold text-slate-200">
                  {telemetry?.cpuUsage ? telemetry.cpuUsage.toFixed(0) : activeRover?.cpuUsage.toFixed(0) || '42'}%
                </div>
                <div className="w-full bg-[#1F293D] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${telemetry?.cpuUsage || 42}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0E1424] border border-[#1F293D] space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">Thermal State</span>
                <div className="text-lg font-bold text-rose-400">
                  {telemetry?.temperature ? telemetry.temperature.toFixed(0) : activeRover?.temperature.toFixed(0) || '54'}°C
                </div>
                <span className="text-[10px] text-slate-400">Passive Heatsink Normal</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0E1424] border border-[#1F293D] space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">RAM Utilization</span>
                <div className="text-lg font-bold text-slate-200">
                  {telemetry?.ramUsage ? telemetry.ramUsage.toFixed(0) : activeRover?.ramUsage.toFixed(0) || '58'}%
                </div>
                <div className="w-full bg-[#1F293D] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${telemetry?.ramUsage || 58}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* 6-DOF IMU Motion Fusion Box */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>6-DOF IMU Motion Dynamics</span>
              </h3>
              <Badge
                label={telemetry?.motionContext || 'MOVING'}
                variant="status"
                size="sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="p-2.5 rounded bg-[#0E1424] border border-[#1F293D]">
                <span className="text-[10px] text-slate-500 block uppercase">Accel X (Lat)</span>
                <span className="text-slate-200 font-bold">
                  {telemetry?.accelerometer.x.toFixed(2) || '0.12'} m/s²
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#0E1424] border border-[#1F293D]">
                <span className="text-[10px] text-slate-500 block uppercase">Accel Y (Long)</span>
                <span className="text-slate-200 font-bold">
                  {telemetry?.accelerometer.y.toFixed(2) || '-0.05'} m/s²
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#0E1424] border border-[#1F293D]">
                <span className="text-[10px] text-slate-500 block uppercase">Accel Z (Vert)</span>
                <span className="text-cyan-400 font-bold">
                  {telemetry?.accelerometer.z.toFixed(2) || '9.81'} m/s²
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0E1424] border border-[#1F293D] flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-2 text-slate-400">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Bearing / Compass:</span>
              </div>
              <span className="text-white font-bold">
                {activeRover?.heading.toFixed(0) || '92'}° East
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoringPage;
