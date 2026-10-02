import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Detection, Rover, CCTVCamera, RoadSegment, RepairTask } from '../../types';
import { ShieldAlert, Car, Camera, Wrench, Filter } from 'lucide-react';
import Badge from '../common/Badge';

// Helper to create custom HTML/SVG icons without emojis
const createCustomIcon = (type: 'hazard' | 'rover' | 'cctv' | 'repair', severity?: string) => {
  let color = '#06B6D4';
  if (type === 'hazard') {
    if (severity === 'CRITICAL') color = '#EF4444';
    else if (severity === 'HIGH') color = '#F97316';
    else if (severity === 'MEDIUM') color = '#F59E0B';
    else color = '#10B981';
  } else if (type === 'rover') {
    color = '#3B82F6';
  } else if (type === 'cctv') {
    color = '#8B5CF6';
  } else if (type === 'repair') {
    color = '#EC4899';
  }

  const svgContent = `
    <div style="
      background-color: ${color}22;
      border: 2px solid ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 10px ${color}88;
    ">
      <div style="width: 8px; height: 8px; background-color: ${color}; border-radius: 50%;"></div>
    </div>
  `;

  return L.divIcon({
    html: svgContent,
    className: 'custom-map-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

interface HazardMapProps {
  detections?: Detection[];
  rovers?: Rover[];
  cctvs?: CCTVCamera[];
  roadSegments?: RoadSegment[];
  repairTasks?: RepairTask[];
  height?: string;
  showFilters?: boolean;
}

export const HazardMap: React.FC<HazardMapProps> = ({
  detections = [],
  rovers = [],
  cctvs = [],
  roadSegments = [],
  repairTasks = [],
  height = '500px',
  showFilters = true,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showRovers, setShowRovers] = useState<boolean>(true);
  const [showCCTV, setShowCCTV] = useState<boolean>(true);
  const [showRepairs, setShowRepairs] = useState<boolean>(true);

  // Center Delhi coordinates
  const defaultCenter: [number, number] = [28.6139, 77.2090];

  const filteredDetections = detections.filter((d) => {
    if (selectedSeverity !== 'ALL' && d.severity !== selectedSeverity) return false;
    if (selectedType !== 'ALL' && d.hazardType !== selectedType) return false;
    return true;
  });

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#1F293D] bg-[#0B0F19]">
      {showFilters && (
        <div className="p-3 bg-[#0E1424] border-b border-[#1F293D] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono uppercase font-semibold">GIS Layer Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-[#111827] text-slate-200 border border-[#1F293D] rounded px-2.5 py-1 font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#111827] text-slate-200 border border-[#1F293D] rounded px-2.5 py-1 font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Hazard Types</option>
              <option value="pothole">Pothole</option>
              <option value="crack">Crack</option>
              <option value="waterlogging">Waterlogging</option>
              <option value="damaged_surface">Damaged Surface</option>
            </select>

            <button
              onClick={() => setShowRovers(!showRovers)}
              className={`px-2.5 py-1 rounded font-mono text-xs border transition-colors ${
                showRovers
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : 'bg-[#111827] text-slate-500 border-[#1F293D]'
              }`}
            >
              Rovers ({rovers.length})
            </button>

            <button
              onClick={() => setShowCCTV(!showCCTV)}
              className={`px-2.5 py-1 rounded font-mono text-xs border transition-colors ${
                showCCTV
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                  : 'bg-[#111827] text-slate-500 border-[#1F293D]'
              }`}
            >
              CCTV ({cctvs.length})
            </button>

            <button
              onClick={() => setShowRepairs(!showRepairs)}
              className={`px-2.5 py-1 rounded font-mono text-xs border transition-colors ${
                showRepairs
                  ? 'bg-pink-500/20 text-pink-400 border-pink-500/40'
                  : 'bg-[#111827] text-slate-500 border-[#1F293D]'
              }`}
            >
              Repairs ({repairTasks.length})
            </button>
          </div>
        </div>
      )}

      {/* Map Surface */}
      <div style={{ height }}>
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          {/* CartoDB Dark Matter Tiles for sleek command center UI */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Road Segment Polylines */}
          {roadSegments.map((segment) => {
            const positions: [number, number][] = [
              [segment.startLocation.latitude, segment.startLocation.longitude],
              [segment.endLocation.latitude, segment.endLocation.longitude],
            ];
            let color = '#10B981';
            if (segment.riskLevel === 'CRITICAL') color = '#EF4444';
            else if (segment.riskLevel === 'HIGH') color = '#F97316';
            else if (segment.riskLevel === 'MEDIUM') color = '#F59E0B';

            return (
              <React.Fragment key={segment.roadSegmentId}>
                <Polyline positions={positions} pathOptions={{ color, weight: 4, opacity: 0.8 }} />
                <Circle
                  center={positions[0]}
                  radius={200}
                  pathOptions={{ color, fillOpacity: 0.15, stroke: false }}
                />
              </React.Fragment>
            );
          })}

          {/* Hazard Detections */}
          {filteredDetections.map((det) => (
            <Marker
              key={det.detectionId}
              position={[det.latitude, det.longitude]}
              icon={createCustomIcon('hazard', det.severity)}
            >
              <Popup>
                <div className="p-1 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[#1F293D] pb-1">
                    <span className="font-mono font-bold text-cyan-400 uppercase">{det.hazardType}</span>
                    <Badge label={det.severity} variant="severity" size="sm" />
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    <div>Source: <span className="text-white">{det.sourceType} ({det.sourceId})</span></div>
                    <div>Confidence: <span className="text-emerald-400">{(det.confidence * 100).toFixed(1)}%</span></div>
                    <div>Status: <Badge label={det.verificationStatus} variant="verification" size="sm" /></div>
                    <div>Time: <span className="text-slate-400">{new Date(det.timestamp).toLocaleTimeString()}</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Rovers */}
          {showRovers &&
            rovers.map((rover) => {
              if (rover.latitude === null || rover.longitude === null) return null;
              return (
                <Marker
                  key={rover.roverId}
                  position={[rover.latitude, rover.longitude]}
                  icon={createCustomIcon('rover')}
                >
                  <Popup>
                    <div className="p-1 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between font-bold text-blue-400 border-b border-[#1F293D] pb-1">
                        <span>{rover.name} ({rover.roverId})</span>
                        <Badge label={rover.status} variant="status" size="sm" />
                      </div>
                      <div>Battery: <span className="text-emerald-400 font-bold">{rover.battery}%</span></div>
                      <div>Speed: {rover.speed.toFixed(1)} km/h | Heading: {rover.heading.toFixed(0)}°</div>
                      <div>AI Inference: <span className="text-cyan-400">{rover.aiFps.toFixed(1)} FPS</span></div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* CCTVs */}
          {showCCTV &&
            cctvs.map((cctv) => (
              <Marker
                key={cctv.cameraId}
                position={[cctv.latitude, cctv.longitude]}
                icon={createCustomIcon('cctv')}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between font-bold text-purple-400 border-b border-[#1F293D] pb-1">
                      <span>{cctv.name}</span>
                      <Badge label={cctv.status} variant="status" size="sm" />
                    </div>
                    <div>Location: {cctv.location}</div>
                    <div>Hazards Identified: <span className="text-amber-400 font-bold">{cctv.hazardCount}</span></div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Repair Tasks */}
          {showRepairs &&
            repairTasks.map((task) => (
              <Marker
                key={task.taskId}
                position={[task.latitude, task.longitude]}
                icon={createCustomIcon('repair')}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between font-bold text-pink-400 border-b border-[#1F293D] pb-1">
                      <span>Work Order: {task.taskId}</span>
                      <Badge label={task.status} variant="status" size="sm" />
                    </div>
                    <div>Hazard: {task.hazardType} ({task.severity})</div>
                    <div>Priority: <span className="text-rose-400 font-bold">{task.priority}/100</span></div>
                    <div>Assigned: {task.assignedTeam || 'Unassigned'}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default HazardMap;
