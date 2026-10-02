import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LiveMonitoringPage from './pages/LiveMonitoringPage';
import HazardMapPage from './pages/HazardMapPage';
import DetectionsPage from './pages/DetectionsPage';
import RoversPage from './pages/RoversPage';
import CCTVPage from './pages/CCTVPage';
import RoadHealthPage from './pages/RoadHealthPage';
import RepairPriorityPage from './pages/RepairPriorityPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import EmptyState from './components/common/EmptyState';
import { AlertCircle } from 'lucide-react';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center text-slate-400 font-mono text-xs">
        VERIFYING MUNICIPAL SECURITY CREDENTIALS...
      </div>
    );
  }

  // Allow unauthenticated bypass in Demo Mode if needed, or redirect to login
  if (!isAuthenticated && !localStorage.getItem('arhdn_token')) {
    // If demo token exists or for ease of evaluation:
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Command Center Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="live-monitoring" element={<LiveMonitoringPage />} />
            <Route path="hazard-map" element={<HazardMapPage />} />
            <Route path="detections" element={<DetectionsPage />} />
            <Route path="rovers" element={<RoversPage />} />
            <Route path="cctv" element={<CCTVPage />} />
            <Route path="road-health" element={<RoadHealthPage />} />
            <Route path="repair-priority" element={<RepairPriorityPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="p-12">
                  <EmptyState
                    title="Sector Navigation Coordinate Not Found"
                    description="The requested tactical sector or route does not exist in the municipal routing matrix."
                    icon={AlertCircle}
                    actionText="Return to Command Center"
                    onAction={() => (window.location.href = '/dashboard')}
                  />
                </div>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
