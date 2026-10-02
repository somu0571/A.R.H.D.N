import React, { useState, useEffect } from 'react';
import { alertService } from '../services/apiServices';
import socketService from '../services/socket';
import { AlertNotification } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, Filter, Check, Clock } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNRESOLVED' | 'RESOLVED'>('UNRESOLVED');
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const data = await alertService.getAlerts({ limit: 100 });
      setAlerts(data);
    } catch (err) {
      console.error('[ARHDN Alerts] Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    socketService.connect();
    const handleNewAlert = (newAlert: AlertNotification) => {
      setAlerts((prev) => [newAlert, ...prev]);
    };

    socketService.on('alert:new', handleNewAlert);
    return () => {
      socketService.off('alert:new', handleNewAlert);
    };
  }, []);

  const handleResolve = async (alertId: string) => {
    try {
      const updated = await alertService.updateAlert(alertId, { isResolved: true, isRead: true });
      setAlerts((prev) => prev.map((a) => (a.alertId === alertId ? updated : a)));
    } catch (err) {
      console.error('[ARHDN Alerts] Error resolving alert:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Connecting to Emergency Alert Dispatcher..." size="lg" />;
  }

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter === 'UNRESOLVED' && a.isResolved) return false;
    if (statusFilter === 'RESOLVED' && !a.isResolved) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F293D] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>MUNICIPAL & SENSOR SYSTEM ALERTS</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Critical hazard alarms, sensor disconnect warnings, multi-source verifications & repair escalations
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#111827] text-slate-300 border border-[#1F293D] rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#111827] text-slate-300 border border-[#1F293D] rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="UNRESOLVED">Active / Unresolved</option>
            <option value="RESOLVED">Resolved Only</option>
            <option value="ALL">All States</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="bg-[#111827] border border-[#1F293D] rounded-xl overflow-hidden divide-y divide-[#1F293D]">
        {filteredAlerts.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Matching Alerts"
              description="All current sensor telemetry, rover links, and hazard conditions are cleared."
              icon={CheckCircle2}
            />
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.alertId}
              className={`p-4 transition-colors flex items-start justify-between space-x-4 ${
                alert.isResolved ? 'bg-[#0D121D]/60 opacity-60' : 'hover:bg-[#151D2E]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2.5">
                  <Badge label={alert.severity} variant="severity" size="sm" />
                  <span className="font-mono text-xs font-bold text-slate-200">{alert.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">[{alert.type}]</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{alert.message}</p>
                <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-500 pt-0.5">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                  </span>
                  {alert.latitude && (
                    <span>Position: {alert.latitude.toFixed(4)}°, {alert.longitude?.toFixed(4)}°</span>
                  )}
                  {alert.isDemo && (
                    <span className="text-amber-400 font-bold uppercase">Simulation Trigger</span>
                  )}
                </div>
              </div>

              {!alert.isResolved && (
                <button
                  onClick={() => handleResolve(alert.alertId)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#1F293D] hover:bg-emerald-500 hover:text-black text-slate-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors border border-[#374151]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Acknowledge</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
