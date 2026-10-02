import React, { useState, useEffect } from 'react';
import RoverCard from '../components/rovers/RoverCard';
import LiveCamera from '../components/dashboard/LiveCamera';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { roverService, detectionService } from '../services/apiServices';
import socketService from '../services/socket';
import { Rover, Detection } from '../types';
import { Car, RefreshCw, Plus, ShieldAlert, Cpu } from 'lucide-react';
import DetectionTable from '../components/detections/DetectionTable';

export const RoversPage: React.FC = () => {
  const [rovers, setRovers] = useState<Rover[]>([]);
  const [selectedRoverId, setSelectedRoverId] = useState<string | null>(null);
  const [roverDetections, setRoverDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRovers = async () => {
    try {
      const data = await roverService.getRovers();
      setRovers(data);
      if (data.length > 0 && !selectedRoverId) {
        setSelectedRoverId(data[0].roverId);
      }
    } catch (err) {
      console.error('[ARHDN Rovers] Failed to load rovers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRovers();

    socketService.connect();
    const handleRoverLocation = (data: { roverId: string; latitude: number; longitude: number; speed: number; heading: number }) => {
      setRovers((prev) =>
        prev.map((r) =>
          r.roverId === data.roverId
            ? { ...r, latitude: data.latitude, longitude: data.longitude, speed: data.speed, heading: data.heading }
            : r
        )
      );
    };

    socketService.on('rover:location', handleRoverLocation);
    return () => {
      socketService.off('rover:location', handleRoverLocation);
    };
  }, []);

  // Fetch detections specific to selected rover
  useEffect(() => {
    if (!selectedRoverId) return;
    const fetchRoverDets = async () => {
      try {
        const res = await detectionService.getDetections({ roverId: selectedRoverId, limit: 30 });
        if (res?.detections) {
          setRoverDetections(res.detections);
        }
      } catch (err) {
        console.error('[ARHDN Rovers] Error loading rover detections:', err);
      }
    };
    fetchRoverDets();
  }, [selectedRoverId]);

  if (loading) {
    return <LoadingSpinner label="Auditing Mobile Rover Sensor Fleets..." size="lg" />;
  }

  const selectedRover = rovers.find((r) => r.roverId === selectedRoverId) || rovers[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F293D] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100 flex items-center space-x-2">
            <Car className="w-5 h-5 text-cyan-400" />
            <span>MOBILE SENSING PLATFORMS (ROVERS & FLEETS)</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Fleet health, optical sensor arrays, 6-DOF IMUs & edge YOLOv12 inference runtimes
          </p>
        </div>

        <button
          onClick={fetchRovers}
          className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1F293D] border border-[#1F293D] text-slate-300 text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Rovers Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rovers.map((rover) => (
          <div
            key={rover.roverId}
            className={`transition-all rounded-xl ${
              selectedRoverId === rover.roverId
                ? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/10'
                : ''
            }`}
          >
            <RoverCard
              rover={rover}
              onSelect={(id) => setSelectedRoverId(id)}
            />
          </div>
        ))}
      </div>

      {/* Selected Rover Detail Hub */}
      {selectedRover && (
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1F293D] pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
                  Active Vehicle Stream: {selectedRover.name} [{selectedRover.roverId}]
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Live forward sensor link & historical hazard detections
                </p>
              </div>
            </div>
          </div>

          {/* Video Feed */}
          <div className="max-w-3xl mx-auto">
            <LiveCamera rover={selectedRover} isSimulated={true} />
          </div>

          {/* Detections by this rover */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Detections Logged by {selectedRover.name}</span>
            </h4>
            <DetectionTable detections={roverDetections} />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoversPage;
