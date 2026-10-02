import React, { useState, useEffect } from 'react';
import HazardMap from '../components/dashboard/HazardMap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  detectionService,
  roverService,
  cctvService,
  roadHealthService,
  repairService,
} from '../services/apiServices';
import socketService from '../services/socket';
import { Detection, Rover, CCTVCamera, RoadSegment, RepairTask } from '../types';
import { Map, Layers, ShieldAlert, Car, Camera, Wrench } from 'lucide-react';

export const HazardMapPage: React.FC = () => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [rovers, setRovers] = useState<Rover[]>([]);
  const [cctvs, setCctvs] = useState<CCTVCamera[]>([]);
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([]);
  const [repairTasks, setRepairTasks] = useState<RepairTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detData, roverData, cctvData, segmentData, repairData] = await Promise.all([
          detectionService.getDetections({ limit: 100 }),
          roverService.getRovers(),
          cctvService.getCCTVs(),
          roadHealthService.getRoadSegments(),
          repairService.getRepairTasks(),
        ]);

        if (detData?.detections) setDetections(detData.detections);
        setRovers(roverData);
        setCctvs(cctvData);
        setRoadSegments(segmentData);
        setRepairTasks(repairData);
      } catch (err) {
        console.error('[ARHDN Map] Failed to load spatial data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    socketService.connect();

    const handleNewDetection = (newDet: Detection) => {
      setDetections((prev) => [newDet, ...prev]);
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

    socketService.on('detection:new', handleNewDetection);
    socketService.on('rover:location', handleRoverLocation);

    return () => {
      socketService.off('detection:new', handleNewDetection);
      socketService.off('rover:location', handleRoverLocation);
    };
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading Geospatial GIS Layers..." size="lg" />;
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F293D] pb-3">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100 flex items-center space-x-2">
            <Map className="w-5 h-5 text-cyan-400" />
            <span>FULL GEOSPATIAL GIS MAP</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Interactive multi-layered spatial analysis of pavement distress, rover paths & fixed CCTV infrastructure
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Hazards ({detections.length})</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Rovers ({rovers.length})</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>CCTV ({cctvs.length})</span>
          </span>
        </div>
      </div>

      {/* Main Map */}
      <HazardMap
        detections={detections}
        rovers={rovers}
        cctvs={cctvs}
        roadSegments={roadSegments}
        repairTasks={repairTasks}
        height="76vh"
        showFilters={true}
      />
    </div>
  );
};

export default HazardMapPage;
