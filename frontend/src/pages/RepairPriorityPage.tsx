import React, { useState, useEffect } from 'react';
import RepairPriorityTable from '../components/repair/RepairPriorityTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { repairService } from '../services/apiServices';
import socketService from '../services/socket';
import { RepairTask, RepairStatus } from '../types';
import { Wrench, CheckCircle2, AlertTriangle, Plus, RefreshCw } from 'lucide-react';

export const RepairPriorityPage: React.FC = () => {
  const [tasks, setTasks] = useState<RepairTask[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const data = await repairService.getRepairTasks();
      setTasks(data);
    } catch (err) {
      console.error('[ARHDN Repair] Failed to fetch repair tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    socketService.connect();
    const handleRepairUpdate = (updatedTask: RepairTask) => {
      setTasks((prev) => {
        const idx = prev.findIndex((t) => t.taskId === updatedTask.taskId);
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = updatedTask;
          return arr;
        }
        return [updatedTask, ...prev];
      });
    };

    socketService.on('repair:update', handleRepairUpdate);
    return () => {
      socketService.off('repair:update', handleRepairUpdate);
    };
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: RepairStatus, team?: string) => {
    try {
      const payload: Partial<RepairTask> = { status: newStatus };
      if (team) payload.assignedTeam = team;
      const updated = await repairService.updateRepairTask(taskId, payload);
      setTasks((prev) => prev.map((t) => (t.taskId === taskId ? updated : t)));
    } catch (err) {
      console.error('[ARHDN Repair] Error updating task status:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Compiling Repair Priority Dispatch Queue..." size="lg" />;
  }

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
  const resolvedCount = tasks.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F293D] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100 flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-rose-400" />
            <span>MUNICIPAL REPAIR PRIORITY QUEUE</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Automated maintenance work orders generated from multi-source verified pavement distress events
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTasks}
            className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1F293D] border border-[#1F293D] text-slate-300 text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[#111827] border border-rose-500/20">
          <span className="text-slate-400 uppercase">Pending Review</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{pendingCount} Tasks</div>
          <span className="text-[11px] text-slate-500">Awaiting supervisor work order dispatch</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-blue-500/20">
          <span className="text-slate-400 uppercase">Assigned / In Progress</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{inProgressCount} Crews Active</div>
          <span className="text-[11px] text-slate-500">Asphalt patching & drainage mitigation</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-emerald-500/20">
          <span className="text-slate-400 uppercase">Resolved & Cleared</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{resolvedCount} Work Orders</div>
          <span className="text-[11px] text-slate-500">Pavement restored to nominal safety index</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs font-mono border-b border-[#1F293D] pb-2">
        {['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-colors ${
              statusFilter === status
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <RepairPriorityTable
        tasks={filteredTasks}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default RepairPriorityPage;
