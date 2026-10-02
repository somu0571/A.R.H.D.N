export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type HazardType = 'pothole' | 'crack' | 'waterlogging' | 'damaged_surface';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SourceType = 'MOBILE_ROVER' | 'VEHICLE' | 'CCTV';
export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RepairStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

export interface Detection {
  detectionId: string;
  sourceType: SourceType;
  sourceId: string;
  roverId?: string;
  cameraId?: string;
  hazardType: HazardType;
  confidence: number;
  severity: SeverityLevel;
  boundingBox: number[];
  imageUrl?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
  roadSegmentId?: string;
  hazardEventId?: string;
  verificationStatus: VerificationStatus;
  verificationCount: number;
  processingTimeMs?: number;
  modelVersion?: string;
  isDemo?: boolean;
}

export interface HazardEvent {
  hazardEventId: string;
  hazardType: HazardType;
  severity: SeverityLevel;
  confidence: number;
  latitude: number;
  longitude: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  detectionIds: string[];
  sourceCount: number;
  verificationCount: number;
  verificationStatus: VerificationStatus;
  roadSegmentId?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED';
  isDemo?: boolean;
}

export interface Rover {
  roverId: string;
  name: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR';
  battery: number;
  latitude: number | null;
  longitude: number | null;
  speed: number;
  heading: number;
  cameraStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  gpsStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  imuStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  aiStatus: 'RUNNING' | 'STOPPED' | 'ERROR' | 'LOADING';
  networkStatus: 'CONNECTED' | 'DISCONNECTED' | 'WEAK';
  cpuUsage: number;
  ramUsage: number;
  temperature: number;
  storageUsage: number;
  aiFps: number;
  distanceSurveyed: number;
  lastHeartbeat: string | null;
}

export interface CCTVCamera {
  cameraId: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR';
  streamUrl: string;
  lastHeartbeat: string | null;
  lastDetection: string | null;
  hazardCount: number;
}

export interface RoadSegment {
  roadSegmentId: string;
  name: string;
  startLocation: { latitude: number; longitude: number };
  endLocation: { latitude: number; longitude: number };
  healthScore: number;
  hazardCount: number;
  criticalHazards: number;
  verifiedHazards: number;
  distanceSurveyed: number;
  lastSurveyed: string | null;
  riskLevel: RiskLevel;
  maintenancePriority: number;
  isDemo?: boolean;
}

export interface RepairTask {
  taskId: string;
  hazardEventId: string;
  roadSegmentId?: string;
  hazardType: HazardType;
  severity: SeverityLevel;
  priority: number;
  latitude: number;
  longitude: number;
  location?: string;
  verificationCount: number;
  assignedTeam?: string;
  status: RepairStatus;
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AlertNotification {
  alertId: string;
  type: string;
  title: string;
  message: string;
  severity: SeverityLevel;
  referenceId?: string;
  referenceType?: string;
  latitude?: number;
  longitude?: number;
  isRead: boolean;
  isResolved: boolean;
  isDemo?: boolean;
  createdAt: string;
}

export interface TelemetryData {
  roverId: string;
  latitude: number | null;
  longitude: number | null;
  speed: number;
  heading: number;
  battery: number;
  cpuUsage: number;
  ramUsage: number;
  temperature: number;
  storageUsage: number;
  aiFps: number;
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  motionContext: 'STATIONARY' | 'MOVING' | 'BRAKING' | 'TURNING' | 'BUMP';
  timestamp: string;
}

export interface DashboardOverview {
  totalDetections: number;
  totalHazardEvents: number;
  criticalAlerts: number;
  verifiedHazards: number;
  activeRovers: number;
  activeCCTV: number;
  roadSegmentCount: number;
  avgHealthScore: number;
  openRepairTasks: number;
  recentDetections: Detection[];
  recentAlerts: AlertNotification[];
}
