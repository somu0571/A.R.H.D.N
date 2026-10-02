import React, { useState, useEffect } from 'react';
import DetectionTable from '../components/detections/DetectionTable';
import HazardDetailPanel from '../components/hazards/HazardDetailPanel';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { detectionService } from '../services/apiServices';
import socketService from '../services/socket';
import { Detection } from '../types';
import { ShieldAlert, Download, RefreshCw } from 'lucide-react';

export const DetectionsPage: React.FC = () => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetections = async () => {
    setLoading(true);
    try {
      const data = await detectionService.getDetections({ limit: 150 });
      if (data?.detections) {
        setDetections(data.detections);
      }
    } catch (err) {
      console.error('[ARHDN Detections] Error loading detections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();

    socketService.connect();
    const handleNewDetection = (newDet: Detection) => {
      setDetections((prev) => [newDet, ...prev]);
    };

    socketService.on('detection:new', handleNewDetection);

    return () => {
      socketService.off('detection:new', handleNewDetection);
    };
  }, []);

  const exportCSV = () => {
    if (detections.length === 0) return;
    const headers = ['detectionId', 'hazardType', 'severity', 'confidence', 'sourceType', 'sourceId', 'latitude', 'longitude', 'timestamp', 'verificationStatus'];
    const rows = detections.map((d) => [
      d.detectionId,
      d.hazardType,
      d.severity,
      d.confidence,
      d.sourceType,
      d.sourceId,
      d.latitude,
      d.longitude,
      d.timestamp,
      d.verificationStatus,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `arhdn_detections_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F293D] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>ROAD HAZARD DETECTIONS REGISTRY</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Complete historical and real-time observation log from mobile rovers, municipal vehicles & CCTV cameras
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDetections}
            className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1F293D] border border-[#1F293D] text-slate-300 text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner label="Querying Distributed Pavement Distress Records..." size="lg" />
      ) : (
        <DetectionTable
          detections={detections}
          onSelectDetection={(d) => setSelectedDetection(d)}
        />
      )}

      {/* Detail Modal */}
      <HazardDetailPanel
        detection={selectedDetection}
        onClose={() => setSelectedDetection(null)}
      />
    </div>
  );
};

export default DetectionsPage;
