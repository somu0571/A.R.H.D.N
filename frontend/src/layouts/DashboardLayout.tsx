import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import socketService from '../services/socket';
import { alertService } from '../services/apiServices';
import { AlertNotification } from '../types';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    // Initial alert count
    alertService.getAlerts({ isResolved: false })
      .then((alerts) => setAlertCount(alerts.length))
      .catch(() => {});

    const socket = socketService.connect();
    setSocketConnected(socket.connected);

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    const handleNewAlert = () => {
      setAlertCount((c) => c + 1);
    };

    socketService.on('alert:new', handleNewAlert);

    return () => {
      socketService.off('alert:new', handleNewAlert);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Shell */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          socketConnected={socketConnected}
          alertCount={alertCount}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </div>
  );
};

export default DashboardLayout;
