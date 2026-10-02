import api from './api';
import {
  User,
  Detection,
  HazardEvent,
  Rover,
  CCTVCamera,
  RoadSegment,
  RepairTask,
  AlertNotification,
  DashboardOverview
} from '../types';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: { name: string; email: string; password: string; role?: string }) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.user;
  },
};

export const detectionService = {
  getDetections: async (params?: Record<string, any>) => {
    const res = await api.get('/detections', { params });
    return res.data;
  },
  getDetection: async (id: string) => {
    const res = await api.get(`/detections/${id}`);
    return res.data;
  },
  createDetection: async (data: Partial<Detection>) => {
    const res = await api.post('/detections', data);
    return res.data;
  },
  getHazardEvents: async (params?: Record<string, any>) => {
    const res = await api.get('/hazard-events', { params });
    return res.data;
  },
};

export const roverService = {
  getRovers: async () => {
    const res = await api.get<Rover[]>('/rovers');
    return res.data;
  },
  getRover: async (id: string) => {
    const res = await api.get(`/rovers/${id}`);
    return res.data;
  },
  updateRover: async (id: string, data: Partial<Rover>) => {
    const res = await api.put(`/rovers/${id}`, data);
    return res.data;
  },
};

export const cctvService = {
  getCCTVs: async () => {
    const res = await api.get<CCTVCamera[]>('/cctv');
    return res.data;
  },
  getCCTV: async (id: string) => {
    const res = await api.get(`/cctv/${id}`);
    return res.data;
  },
};

export const roadHealthService = {
  getRoadSegments: async () => {
    const res = await api.get<RoadSegment[]>('/road-health');
    return res.data;
  },
  getRoadSegment: async (id: string) => {
    const res = await api.get(`/road-health/${id}`);
    return res.data;
  },
};

export const repairService = {
  getRepairTasks: async (params?: Record<string, any>) => {
    const res = await api.get<RepairTask[]>('/repair-priority', { params });
    return res.data;
  },
  createRepairTask: async (data: Partial<RepairTask>) => {
    const res = await api.post('/repair-priority', data);
    return res.data;
  },
  updateRepairTask: async (id: string, data: Partial<RepairTask>) => {
    const res = await api.put(`/repair-priority/${id}`, data);
    return res.data;
  },
};

export const alertService = {
  getAlerts: async (params?: Record<string, any>) => {
    const res = await api.get<AlertNotification[]>('/alerts', { params });
    return res.data;
  },
  updateAlert: async (id: string, data: Partial<AlertNotification>) => {
    const res = await api.put(`/alerts/${id}`, data);
    return res.data;
  },
};

export const analyticsService = {
  getOverview: async () => {
    const res = await api.get<DashboardOverview>('/analytics/overview');
    return res.data;
  },
  getHazards: async (days?: number) => {
    const res = await api.get('/analytics/hazards', { params: { days } });
    return res.data;
  },
  getCoverage: async () => {
    const res = await api.get('/analytics/coverage');
    return res.data;
  },
  getRoadHealth: async () => {
    const res = await api.get('/analytics/road-health');
    return res.data;
  },
};

export const reportService = {
  getReports: async () => {
    const res = await api.get('/reports');
    return res.data;
  },
  createReport: async (data: any) => {
    const res = await api.post('/reports', data);
    return res.data;
  },
};
