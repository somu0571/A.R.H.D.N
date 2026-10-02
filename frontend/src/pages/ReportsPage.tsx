import React, { useState, useEffect } from 'react';
import { reportService } from '../services/apiServices';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FileText, Download, Plus, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      const data = await reportService.getReports();
      setReports(data);
    } catch (err) {
      console.error('[ARHDN Reports] Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const newReport = await reportService.createReport({
        title: `Municipal Road Health Audit - ${new Date().toLocaleDateString()}`,
        type: 'DAILY',
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
      });
      setReports((prev) => [newReport, ...prev]);
    } catch (err) {
      console.error('[ARHDN Reports] Failed to generate report:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Compiling Municipal Road Safety Audit Archives..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F293D] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>MUNICIPAL AUDIT REPORTS & ARCHIVES</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Formal engineering digests covering road health indices, verified hazard densities & repair task completions
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-mono font-bold uppercase tracking-wider rounded-lg flex items-center space-x-2 transition-colors self-start sm:self-auto shadow-lg shadow-cyan-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>{generating ? 'Generating Digest...' : 'Generate Audit Report'}</span>
        </button>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <EmptyState
          title="No Reports Generated Yet"
          description="Click 'Generate Audit Report' to compile a comprehensive road condition performance digest."
          icon={FileText}
          actionText="Generate Audit Report"
          onAction={handleGenerateReport}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reports.map((report) => (
            <div
              key={report.reportId}
              className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      {report.reportId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 font-mono">
                      {report.title}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                    {report.status}
                  </span>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-[#0E1424] border border-[#1F293D]/60">
                    <span className="text-[10px] text-slate-500 uppercase block">Detections</span>
                    <span className="text-white font-bold">{report.summary?.totalDetections || 0}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0E1424] border border-[#1F293D]/60">
                    <span className="text-[10px] text-slate-500 uppercase block">Verified</span>
                    <span className="text-cyan-400 font-bold">{report.summary?.verifiedHazards || 0}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0E1424] border border-[#1F293D]/60">
                    <span className="text-[10px] text-slate-500 uppercase block">Critical</span>
                    <span className="text-rose-400 font-bold">{report.summary?.criticalHazards || 0}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0E1424] border border-[#1F293D]/60">
                    <span className="text-[10px] text-slate-500 uppercase block">Active Rovers</span>
                    <span className="text-blue-400 font-bold">{report.summary?.roversActive || 0}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#1F293D] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Compiled: {new Date(report.createdAt).toLocaleDateString()}</span>
                </span>

                <button
                  onClick={() => alert(`Exporting ARHDN Engineering Audit Digest: ${report.reportId}`)}
                  className="px-2.5 py-1 rounded bg-[#0E1424] hover:bg-[#1F293D] border border-[#1F293D] text-cyan-400 font-bold uppercase text-[10px] flex items-center space-x-1.5 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
