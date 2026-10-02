import React, { useState } from 'react';
import { Detection } from '../../types';
import { Search, Filter, ShieldAlert, ArrowUpDown, Eye, ExternalLink } from 'lucide-react';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';

interface DetectionTableProps {
  detections: Detection[];
  onSelectDetection?: (detection: Detection) => void;
}

export const DetectionTable: React.FC<DetectionTableProps> = ({
  detections,
  onSelectDetection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hazardFilter, setHazardFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = detections.filter((d) => {
    if (searchTerm) {
      const matchId = d.detectionId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchHazard = d.hazardType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSource = d.sourceId.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchId && !matchHazard && !matchSource) return false;
    }
    if (hazardFilter !== 'ALL' && d.hazardType !== hazardFilter) return false;
    if (severityFilter !== 'ALL' && d.severity !== severityFilter) return false;
    if (sourceFilter !== 'ALL' && d.sourceType !== sourceFilter) return false;
    if (verificationFilter !== 'ALL' && d.verificationStatus !== verificationFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-[#111827] border border-[#1F293D] rounded-xl overflow-hidden flex flex-col space-y-4 p-5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Detection ID, Hazard, or Source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0E1424] text-slate-100 placeholder-slate-500 pl-9 pr-4 py-2 rounded-lg border border-[#1F293D] font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={hazardFilter}
            onChange={(e) => setHazardFilter(e.target.value)}
            className="bg-[#0E1424] text-slate-300 border border-[#1F293D] rounded-lg px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Hazards</option>
            <option value="pothole">Pothole</option>
            <option value="crack">Crack</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="damaged_surface">Damaged Surface</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#0E1424] text-slate-300 border border-[#1F293D] rounded-lg px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-[#0E1424] text-slate-300 border border-[#1F293D] rounded-lg px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Sources</option>
            <option value="MOBILE_ROVER">Mobile Rover</option>
            <option value="VEHICLE">Fleet Vehicle</option>
            <option value="CCTV">Roadside CCTV</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="bg-[#0E1424] text-slate-300 border border-[#1F293D] rounded-lg px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Verification</option>
            <option value="VERIFIED">Verified</option>
            <option value="UNVERIFIED">Unverified</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-lg border border-[#1F293D]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0E1424] border-b border-[#1F293D] text-slate-400 font-mono uppercase tracking-wider">
              <th className="py-3 px-4">Detection ID</th>
              <th className="py-3 px-4">Hazard</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Coordinates</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Verification</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F293D] font-mono text-slate-300">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <EmptyState
                    title="No Matching Detections Found"
                    description="Adjust search queries or active filters to inspect recorded pavement distress events."
                    icon={ShieldAlert}
                  />
                </td>
              </tr>
            ) : (
              paginated.map((d) => (
                <tr
                  key={d.detectionId}
                  className="hover:bg-[#151D2E] transition-colors"
                >
                  <td className="py-3 px-4 text-cyan-400 font-bold">{d.detectionId}</td>
                  <td className="py-3 px-4 uppercase text-slate-100 font-bold">{d.hazardType}</td>
                  <td className="py-3 px-4 text-emerald-400">{(d.confidence * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4">
                    <Badge label={d.severity} variant="severity" size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    <span className="text-white">{d.sourceType}</span>
                    <span className="text-[10px] text-slate-500 block">[{d.sourceId}]</span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-400">
                    {d.latitude.toFixed(4)}° N, {d.longitude.toFixed(4)}° E
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-400">
                    {new Date(d.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge label={d.verificationStatus} variant="verification" size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectDetection && onSelectDetection(d)}
                      className="p-1.5 rounded hover:bg-[#1F293D] text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Inspect Detection Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2">
        <div>
          Showing <span className="text-white font-bold">{filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
          <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of{' '}
          <span className="text-white font-bold">{filtered.length}</span> detections
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-[#0E1424] border border-[#1F293D] rounded disabled:opacity-30 hover:border-cyan-500 text-slate-300"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-[#0E1424] border border-[#1F293D] rounded disabled:opacity-30 hover:border-cyan-500 text-slate-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetectionTable;
