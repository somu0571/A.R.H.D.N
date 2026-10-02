import React from 'react';
import { RepairTask, RepairStatus } from '../../types';
import { Wrench, CheckCircle2, UserCheck, Clock, AlertTriangle } from 'lucide-react';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';

interface RepairPriorityTableProps {
  tasks: RepairTask[];
  onUpdateStatus?: (taskId: string, newStatus: RepairStatus, team?: string) => void;
}

export const RepairPriorityTable: React.FC<RepairPriorityTableProps> = ({
  tasks,
  onUpdateStatus,
}) => {
  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        title="Repair Queue Empty"
        description="No active repair work orders currently pending for municipal road crews."
        icon={CheckCircle2}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#1F293D] bg-[#111827]">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#0E1424] border-b border-[#1F293D] text-slate-400 font-mono uppercase tracking-wider">
            <th className="py-3 px-4">Task ID</th>
            <th className="py-3 px-4">Hazard Type</th>
            <th className="py-3 px-4">Severity</th>
            <th className="py-3 px-4">Priority Score</th>
            <th className="py-3 px-4">Coordinates</th>
            <th className="py-3 px-4">Verification</th>
            <th className="py-3 px-4">Assigned Team</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Action Workflow</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1F293D] font-mono text-slate-300">
          {tasks.map((task) => (
            <tr key={task.taskId} className="hover:bg-[#151D2E] transition-colors">
              <td className="py-3 px-4 text-pink-400 font-bold">{task.taskId}</td>
              <td className="py-3 px-4 uppercase text-white font-bold">{task.hazardType}</td>
              <td className="py-3 px-4">
                <Badge label={task.severity} variant="severity" size="sm" />
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-rose-400">{task.priority}</span>
                  <div className="w-16 bg-[#1F293D] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${task.priority}%` }}
                    ></div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-[11px] text-slate-400">
                {task.latitude.toFixed(4)}°, {task.longitude.toFixed(4)}°
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
                  {task.verificationCount} Sources
                </span>
              </td>
              <td className="py-3 px-4 text-slate-300">
                {task.assignedTeam || (
                  <span className="text-slate-500 italic">Unassigned</span>
                )}
              </td>
              <td className="py-3 px-4">
                <Badge label={task.status} variant="status" size="sm" />
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end space-x-1.5">
                  {task.status === 'PENDING' && onUpdateStatus && (
                    <button
                      onClick={() => onUpdateStatus(task.taskId, 'ASSIGNED', 'Delhi Public Works Crew 03')}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/40 rounded text-[10px] uppercase font-bold"
                    >
                      Assign Crew
                    </button>
                  )}
                  {task.status === 'ASSIGNED' && onUpdateStatus && (
                    <button
                      onClick={() => onUpdateStatus(task.taskId, 'IN_PROGRESS')}
                      className="px-2 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40 rounded text-[10px] uppercase font-bold"
                    >
                      Start Work
                    </button>
                  )}
                  {task.status === 'IN_PROGRESS' && onUpdateStatus && (
                    <button
                      onClick={() => onUpdateStatus(task.taskId, 'RESOLVED')}
                      className="px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 rounded text-[10px] uppercase font-bold"
                    >
                      Resolve
                    </button>
                  )}
                  {task.status === 'RESOLVED' && (
                    <span className="text-emerald-400 text-[11px] font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RepairPriorityTable;
