import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Car,
  Camera,
  Activity,
  Wrench,
  Radio,
  TrendingUp,
} from 'lucide-react';
import KpiCard from '../components/dashboard/KpiCard';
import HazardMap from '../components/dashboard/HazardMap';
import LiveCamera from '../components/dashboard/LiveCamera';
import RecentAlerts from '../components/dashboard/RecentAlerts';
import RoverStatus from '../components/dashboard/RoverStatus';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  analyticsService,
  detectionService,
  roverService,
  cctvService,
  roadHealthService,
  repairService,
  alertService,
} from '../services/apiServices';
import socketService from '../services/socket';
import {
  Detection,
  Rover,
  CCTVCamera,
  RoadSegment,
  RepairTask,
  AlertNotification,
  DashboardOverview,
} from '../types';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [rovers, setRovers] = useState<Rover[]>([]);
  const [cctvs, setCctvs] = useState<CCTVCamera[]>([]);
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([]);
  const [repairTasks, setRepairTasks] = useState<RepairTask[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          overviewData,
          detData,
          roverData,
          cctvData,
          segmentData,
          repairData,
          alertData,
        ] = await Promise.all([
          analyticsService.getOverview().catch(() => null),
          detectionService.getDetections({ limit: 40 }).catch(() => ({ detections: [] })),
          roverService.getRovers().catch(() => []),
          cctvService.getCCTVs().catch(() => []),
          roadHealthService.getRoadSegments().catch(() => []),
          repairService.getRepairTasks().catch(() => []),
          alertService.getAlerts({ limit: 10, isResolved: false }).catch(() => []),
        ]);

        if (overviewData) setOverview(overviewData);
        if (detData?.detections) setDetections(detData.detections);
        if (roverData) setRovers(roverData);
        if (cctvData) setCctvs(cctvData);
        if (segmentData) setRoadSegments(segmentData);
        if (repairData) setRepairTasks(repairData);
        if (alertData) setAlerts(alertData);
      } catch (err) {
        console.error('[ARHDN Dashboard] Error fetching telemetry:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Real-time WebSocket Listeners
  useEffect(() => {
    socketService.connect();

    const handleNewDetection = (newDet: Detection) => {
      setDetections((prev) => [newDet, ...prev.slice(0, 49)]);
      setOverview((prev) =>
        prev ? { ...prev, totalDetections: prev.totalDetections + 1 } : null
      );
    };

    const handleNewAlert = (newAlert: AlertNotification) => {
      setAlerts((prev) => [newAlert, ...prev.slice(0, 19)]);
      if (newAlert.severity === 'CRITICAL') {
        setOverview((prev) =>
          prev ? { ...prev, criticalAlerts: prev.criticalAlerts + 1 } : null
        );
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

    const handleRoverTelemetry = (telemetry: any) => {
      setRovers((prev) =>
        prev.map((r) =>
          r.roverId === telemetry.roverId
            ? {
                ...r,
                battery: telemetry.battery,
                cpuUsage: telemetry.cpuUsage,
                temperature: telemetry.temperature,
                aiFps: telemetry.aiFps,
              }
            : r
        )
      );
    };

    const handleRepairUpdate = (task: RepairTask) => {
      setRepairTasks((prev) => {
        const idx = prev.findIndex((t) => t.taskId === task.taskId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = task;
          return updated;
        }
        return [task, ...prev];
      });
    };

    socketService.on('detection:new', handleNewDetection);
    socketService.on('alert:new', handleNewAlert);
    socketService.on('rover:location', handleRoverLocation);
    socketService.on('rover:telemetry', handleRoverTelemetry);
    socketService.on('repair:update', handleRepairUpdate);

    return () => {
      socketService.off('detection:new', handleNewDetection);
      socketService.off('alert:new', handleNewAlert);
      socketService.off('rover:location', handleRoverLocation);
      socketService.off('rover:telemetry', handleRoverTelemetry);
      socketService.off('repair:update', handleRepairUpdate);
    };
  }, []);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await alertService.updateAlert(alertId, { isResolved: true, isRead: true });
      setAlerts((prev) => prev.filter((a) => a.alertId !== alertId));
    } catch (err) {
      console.error('[ARHDN] Failed to acknowledge alert:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Connecting to Municipal Command Intelligence Grid..." size="lg" />;
  }

  const primaryRover = rovers.find((r) => r.status === 'ONLINE') || rovers[0];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F293D] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100 flex items-center space-x-2">
            <span>MUNICIPAL COMMAND CENTER</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              SECTOR 1
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time Autonomous Road Hazard Ingestion, Multi-Source Verification & Maintenance Operations
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F293D] text-slate-300 flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>AI INFERENCE: <strong className="text-cyan-400">YOLOv12</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard
          title="Total Hazards"
          value={overview?.totalDetections || detections.length}
          icon={ShieldAlert}
          color="cyan"
          subtitle="All Sources"
        />
        <KpiCard
          title="Critical Alerts"
          value={overview?.criticalAlerts || 0}
          icon={AlertTriangle}
          color="rose"
          subtitle="Action Req."
        />
        <KpiCard
          title="Verified"
          value={overview?.verifiedHazards || detections.filter((d) => d.verificationStatus === 'VERIFIED').length}
          icon={CheckCircle}
          color="emerald"
          subtitle="Multi-Source"
        />
        <KpiCard
          title="Active Rovers"
          value={rovers.filter((r) => r.status === 'ONLINE').length}
          icon={Car}
          color="blue"
          subtitle={`of ${rovers.length} deployed`}
        />
        <KpiCard
          title="Active CCTV"
          value={cctvs.filter((c) => c.status === 'ONLINE').length}
          icon={Camera}
          color="cyan"
          subtitle={`of ${cctvs.length} nodes`}
        />
        <KpiCard
          title="Avg Health"
          value={`${overview?.avgHealthScore || 78}/100`}
          icon={Activity}
          color="amber"
          subtitle="Road Index"
        />
        <KpiCard
          title="Repair Queue"
          value={repairTasks.filter((t) => t.status !== 'RESOLVED').length}
          icon={Wrench}
          color="rose"
          subtitle="Open Tasks"
        />
      </div>

      {/* Live Map & Real-Time Camera Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Hazard GIS Map (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Live Geospatial Hazard Map
            </h3>
            <span className="text-[11px] font-mono text-cyan-400">
              {detections.length} Markers Plotted
            </span>
          </div>
          <HazardMap
            detections={detections}
            rovers={rovers}
            cctvs={cctvs}
            roadSegments={roadSegments}
            repairTasks={repairTasks}
            height="460px"
          />
        </div>

        {/* Live Rover Camera & HUD (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Forward Vehicle Edge AI Feed
            </h3>
            <span className="text-[11px] font-mono text-emerald-400">
              YOLOv12 Active
            </span>
          </div>
          <LiveCamera rover={primaryRover} isSimulated={true} />
        </div>
      </div>

      {/* Bottom Operational Telemetry & Alert Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAlerts alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
        <RoverStatus rovers={rovers} />
      </div>
    </div>
  );
};

export default DashboardPage;
