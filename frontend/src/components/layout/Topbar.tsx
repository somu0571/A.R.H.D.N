import React from 'react';
import { Menu, Bell, Wifi, WifiOff, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onToggleSidebar: () => void;
  socketConnected: boolean;
  alertCount?: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  socketConnected,
  alertCount = 0,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-[#0B0F19]/90 backdrop-blur-md border-b border-[#1F293D] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left items */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#121929] border border-[#1F293D]"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest">
            Municipal Command Console
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
            DELHI-NCR SURVEILLANCE SECTOR
          </span>
        </div>
      </div>

      {/* Center prominent Simulation Mode Banner */}
      <div className="flex items-center space-x-2">
        <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span className="text-[11px] font-mono font-bold tracking-wider text-amber-400 uppercase">
            SIMULATION MODE ACTIVE
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-4">
        {/* Socket Gateway Indicator */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono border ${
            socketConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
          title={socketConnected ? 'Gateway Live Connected' : 'Gateway Disconnected'}
        >
          {socketConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden md:inline text-[11px]">
            {socketConnected ? 'GATEWAY LIVE' : 'GATEWAY OFFLINE'}
          </span>
        </div>

        {/* Alerts Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#121929] border border-[#1F293D]"
          aria-label="View Alerts"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* User Profile Badge */}
        {user ? (
          <div className="flex items-center space-x-3 pl-2 border-l border-[#1F293D]">
            <div className="text-right hidden md:block">
              <div className="text-xs font-semibold text-slate-200">{user.name}</div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase flex items-center justify-end space-x-1">
                <Shield className="w-2.5 h-2.5" />
                <span>{user.role}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-[#1F293D] transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold font-mono uppercase tracking-wider transition-colors"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
