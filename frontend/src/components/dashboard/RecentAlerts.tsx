import React from 'react';
import { AlertNotification } from '../../types';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';

interface RecentAlertsProps {
  alerts: AlertNotification[];
  onAcknowledge?: (alertId: string) => void;
}

export const RecentAlerts: React.FC<RecentAlertsProps> = ({
  alerts,
  onAcknowledge,
}) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5">
        <div className="flex items-center space-x-2 mb-4">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Emergency & Sensor Alerts
          </h3>
        </div>
        <EmptyState
          title="No Active Alerts"
          description="All road segments and vehicle sensing platforms are operating within nominal thresholds."
          icon={CheckCircle2}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-[#1F293D] rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 bg-[#0E1424] border-b border-[#1F293D] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Recent System Alerts
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {alerts.length} Pending Actions
        </span>
      </div>

      <div className="divide-y divide-[#1F293D] overflow-y-auto max-h-[380px]">
        {alerts.map((alert) => (
          <div
            key={alert.alertId}
            className="p-3.5 hover:bg-[#151D2E] transition-colors flex items-start justify-between space-x-3"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge label={alert.severity} variant="severity" size="sm" />
                <span className="text-xs font-semibold text-slate-200">{alert.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{alert.message}</p>
              <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                {alert.isDemo && (
                  <span className="text-amber-500/80 font-bold uppercase">Demo Simulation</span>
                )}
              </div>
            </div>

            {onAcknowledge && !alert.isResolved && (
              <button
                onClick={() => onAcknowledge(alert.alertId)}
                className="flex-shrink-0 px-2 py-1 text-[10px] font-mono uppercase bg-[#1F293D] hover:bg-cyan-500 hover:text-black text-slate-300 rounded border border-[#374151] transition-colors"
              >
                Acknowledge
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAlerts;
