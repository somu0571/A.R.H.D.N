import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Map,
  ShieldAlert,
  Car,
  Camera,
  BarChart3,
  Activity,
  CheckCircle,
  Bell,
  FileText,
  Settings,
  Radio,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { path: '/live-monitoring', label: 'Live Monitoring', icon: Video },
  { path: '/hazard-map', label: 'Hazard GIS Map', icon: Map },
  { path: '/detections', label: 'Detections Registry', icon: ShieldAlert },
  { path: '/rovers', label: 'Rover Platforms', icon: Car },
  { path: '/cctv', label: 'Roadside CCTV', icon: Camera },
  { path: '/road-health', label: 'Road Health Index', icon: Activity },
  { path: '/repair-priority', label: 'Repair Priority Queue', icon: CheckCircle },
  { path: '/analytics', label: 'Analytics & Trends', icon: BarChart3 },
  { path: '/alerts', label: 'System Alerts', icon: Bell },
  { path: '/reports', label: 'Municipal Reports', icon: FileText },
  { path: '/settings', label: 'System Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B0F19] border-r border-[#1F293D] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#1F293D] bg-[#0E1424]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm tracking-wider text-slate-100 font-mono">ARHDN</span>
              <span className="text-[10px] px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono border border-cyan-500/30 font-semibold">
                v1.2
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">Autonomous Sensing</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Core Operations
        </div>
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121929]'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Sensing Fleet
        </div>
        {navItems.slice(4, 6).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121929]'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Intelligence & Action
        </div>
        {navItems.slice(6).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121929]'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Edge Node Hardware Telemetry Footer */}
      <div className="p-3 border-t border-[#1F293D] bg-[#0E1424]">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Architecture</span>
          </span>
          <span className="text-cyan-400 font-semibold">YOLOv12</span>
        </div>
        <div className="w-full bg-[#1F293D] h-1.5 rounded-full overflow-hidden">
          <div className="bg-cyan-500 h-full w-[85%] rounded-full animate-pulse"></div>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 font-mono flex justify-between">
          <span>Inference: Edge Engine</span>
          <span className="text-emerald-400 font-semibold">Active</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
