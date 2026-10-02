const { v4: uuidv4 } = require('uuid');
const Detection = require('../models/Detection');
const HazardEvent = require('../models/HazardEvent');
const RoadSegment = require('../models/RoadSegment');
const Alert = require('../models/Alert');
const RepairTask = require('../models/RepairTask');

// ---- Configuration ----
const PROXIMITY_THRESHOLD_KM = 0.05; // 50 meters
const TEMPORAL_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours
const VERIFICATION_THRESHOLD = 2; // sources needed for verification

/**
 * Haversine distance between two GPS coordinates in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate severity from detection attributes.
 * Configurable logic based on confidence, hazard type, bounding box area, and speed.
 */
function calculateSeverity(detection) {
  let score = 0;

  // Confidence contribution (0-30)
  score += detection.confidence * 30;

  // Hazard type contribution (0-25)
  const typeScores = { pothole: 20, crack: 10, waterlogging: 25, damaged_surface: 15 };
  score += typeScores[detection.hazardType] || 10;

  // Bounding box area contribution (0-25) — larger area = more severe
  if (detection.boundingBox && detection.boundingBox.length === 4) {
    const [x1, y1, x2, y2] = detection.boundingBox;
    const area = Math.abs(x2 - x1) * Math.abs(y2 - y1);
    const normalizedArea = Math.min(area / 100000, 1);
    score += normalizedArea * 25;
  }

  // Speed context (0-20) — higher speed observation = more critical road
  if (detection.speed && detection.speed > 0) {
    const speedFactor = Math.min(detection.speed / 80, 1);
    score += speedFactor * 20;
  }

  if (score >= 75) return 'CRITICAL';
  if (score >= 55) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

/**
 * Find a matching HazardEvent for deduplication / multi-source verification.
 */
async function findMatchingHazardEvent(detection) {
  const cutoff = new Date(detection.timestamp.getTime() - TEMPORAL_THRESHOLD_MS);

  const candidates = await HazardEvent.find({
    hazardType: detection.hazardType,
    status: 'ACTIVE',
    lastDetectedAt: { $gte: cutoff },
  });

  for (const candidate of candidates) {
    const dist = haversineDistance(
      detection.latitude,
      detection.longitude,
      candidate.latitude,
      candidate.longitude
    );
    if (dist <= PROXIMITY_THRESHOLD_KM) {
      return candidate;
    }
  }
  return null;
}

/**
 * Process a new detection through the Common Intelligence Layer.
 * Returns { detection, hazardEvent, alert?, repairTask? }
 */
async function processDetection(detectionData, io) {
  // 1. Calculate severity if not provided
  if (!detectionData.severity) {
    detectionData.severity = calculateSeverity(detectionData);
  }

  // 2. Assign detection ID
  detectionData.detectionId = detectionData.detectionId || `DET-${uuidv4().slice(0, 8).toUpperCase()}`;
  detectionData.timestamp = detectionData.timestamp ? new Date(detectionData.timestamp) : new Date();

  // 3. Assign road segment if possible
  const roadSegment = await findNearestRoadSegment(detectionData.latitude, detectionData.longitude);
  if (roadSegment) {
    detectionData.roadSegmentId = roadSegment.roadSegmentId;
  }

  // 4. Save detection
  const detection = await Detection.create(detectionData);

  // 5. Find or create HazardEvent (deduplication + multi-source verification)
  let hazardEvent = await findMatchingHazardEvent(detection);
  let isNewHazardEvent = false;

  if (hazardEvent) {
    // Existing hazard — associate detection
    hazardEvent.detectionIds.push(detection.detectionId);
    hazardEvent.sourceCount += 1;
    hazardEvent.verificationCount += 1;
    hazardEvent.lastDetectedAt = detection.timestamp;

    // Escalate severity if needed
    const severityRank = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    if (severityRank[detection.severity] > severityRank[hazardEvent.severity]) {
      hazardEvent.severity = detection.severity;
    }

    // Update confidence to max
    if (detection.confidence > hazardEvent.confidence) {
      hazardEvent.confidence = detection.confidence;
    }

    // Check verification threshold
    if (
      hazardEvent.verificationCount >= VERIFICATION_THRESHOLD &&
      hazardEvent.verificationStatus === 'UNVERIFIED'
    ) {
      hazardEvent.verificationStatus = 'VERIFIED';
    }

    await hazardEvent.save();
  } else {
    // New hazard event
    isNewHazardEvent = true;
    hazardEvent = await HazardEvent.create({
      hazardEventId: `HEV-${uuidv4().slice(0, 8).toUpperCase()}`,
      hazardType: detection.hazardType,
      severity: detection.severity,
      confidence: detection.confidence,
      latitude: detection.latitude,
      longitude: detection.longitude,
      firstDetectedAt: detection.timestamp,
      lastDetectedAt: detection.timestamp,
      detectionIds: [detection.detectionId],
      sourceCount: 1,
      verificationCount: 1,
      verificationStatus: 'UNVERIFIED',
      roadSegmentId: detection.roadSegmentId,
      isDemo: detection.isDemo || false,
    });
  }

  // Update detection with hazard event reference
  detection.hazardEventId = hazardEvent.hazardEventId;
  detection.verificationStatus = hazardEvent.verificationStatus;
  detection.verificationCount = hazardEvent.verificationCount;
  await detection.save();

  // 6. Update road segment health
  if (roadSegment) {
    await updateRoadSegmentHealth(roadSegment, hazardEvent);
    if (io) {
      io.emit('road-health:update', roadSegment);
    }
  }

  // 7. Generate alerts
  let alert = null;
  if (detection.severity === 'CRITICAL' || detection.severity === 'HIGH') {
    alert = await Alert.create({
      alertId: `ALT-${uuidv4().slice(0, 8).toUpperCase()}`,
      type: detection.severity === 'CRITICAL' ? 'CRITICAL_HAZARD' : 'HIGH_SEVERITY',
      title: `${detection.severity} ${detection.hazardType} detected`,
      message: `A ${detection.severity.toLowerCase()} severity ${detection.hazardType} was detected at (${detection.latitude.toFixed(4)}, ${detection.longitude.toFixed(4)}) by ${detection.sourceType} ${detection.sourceId}`,
      severity: detection.severity,
      referenceId: hazardEvent.hazardEventId,
      referenceType: 'HazardEvent',
      latitude: detection.latitude,
      longitude: detection.longitude,
      isDemo: detection.isDemo || false,
    });
    if (io) io.emit('alert:new', alert);
  }

  // Alert for verification
  if (hazardEvent.verificationStatus === 'VERIFIED' && hazardEvent.verificationCount === VERIFICATION_THRESHOLD) {
    const verAlert = await Alert.create({
      alertId: `ALT-${uuidv4().slice(0, 8).toUpperCase()}`,
      type: 'VERIFIED_HAZARD',
      title: `Hazard verified: ${hazardEvent.hazardType}`,
      message: `${hazardEvent.hazardType} at (${hazardEvent.latitude.toFixed(4)}, ${hazardEvent.longitude.toFixed(4)}) has been verified by ${hazardEvent.verificationCount} sources`,
      severity: hazardEvent.severity,
      referenceId: hazardEvent.hazardEventId,
      referenceType: 'HazardEvent',
      latitude: hazardEvent.latitude,
      longitude: hazardEvent.longitude,
      isDemo: detection.isDemo || false,
    });
    if (io) io.emit('alert:new', verAlert);
  }

  // 8. Create repair task for verified or critical hazards
  let repairTask = null;
  if (
    isNewHazardEvent &&
    (detection.severity === 'CRITICAL' || detection.severity === 'HIGH')
  ) {
    repairTask = await createRepairTask(hazardEvent);
    if (io) io.emit('repair:update', repairTask);
  }

  // 9. Emit socket events
  if (io) {
    io.emit('detection:new', detection);
    if (isNewHazardEvent) {
      io.emit('hazard:updated', hazardEvent);
    } else {
      io.emit('hazard:verified', hazardEvent);
    }
  }

  return { detection, hazardEvent, alert, repairTask };
}

async function findNearestRoadSegment(latitude, longitude) {
  const segments = await RoadSegment.find({});
  let nearest = null;
  let minDist = Infinity;

  for (const segment of segments) {
    const midLat = (segment.startLocation.latitude + segment.endLocation.latitude) / 2;
    const midLon = (segment.startLocation.longitude + segment.endLocation.longitude) / 2;
    const dist = haversineDistance(latitude, longitude, midLat, midLon);
    if (dist < minDist && dist < 1) {
      minDist = dist;
      nearest = segment;
    }
  }
  return nearest;
}

async function updateRoadSegmentHealth(segment, hazardEvent) {
  segment.hazardCount += 1;
  if (hazardEvent.severity === 'CRITICAL') segment.criticalHazards += 1;
  if (hazardEvent.verificationStatus === 'VERIFIED') segment.verifiedHazards += 1;
  segment.lastSurveyed = new Date();

  // Health score calculation: starts at 100, decreases based on hazards
  const criticalPenalty = segment.criticalHazards * 15;
  const hazardPenalty = segment.hazardCount * 3;
  segment.healthScore = Math.max(0, 100 - criticalPenalty - hazardPenalty);

  // Risk level
  if (segment.healthScore <= 25) segment.riskLevel = 'CRITICAL';
  else if (segment.healthScore <= 50) segment.riskLevel = 'HIGH';
  else if (segment.healthScore <= 75) segment.riskLevel = 'MEDIUM';
  else segment.riskLevel = 'LOW';

  // Maintenance priority (0-100, higher = more urgent)
  segment.maintenancePriority = Math.min(100, 100 - segment.healthScore + segment.criticalHazards * 10);

  await segment.save();
  return segment;
}

async function createRepairTask(hazardEvent) {
  const priorityMap = { CRITICAL: 90, HIGH: 70, MEDIUM: 40, LOW: 20 };
  let priority = priorityMap[hazardEvent.severity] || 20;
  priority += hazardEvent.verificationCount * 5;
  priority = Math.min(100, priority);

  const task = await RepairTask.create({
    taskId: `RPR-${uuidv4().slice(0, 8).toUpperCase()}`,
    hazardEventId: hazardEvent.hazardEventId,
    roadSegmentId: hazardEvent.roadSegmentId,
    hazardType: hazardEvent.hazardType,
    severity: hazardEvent.severity,
    priority,
    latitude: hazardEvent.latitude,
    longitude: hazardEvent.longitude,
    verificationCount: hazardEvent.verificationCount,
    isDemo: hazardEvent.isDemo || false,
  });

  return task;
}

async function generateSystemAlert(type, title, message, severity, io) {
  const alert = await Alert.create({
    alertId: `ALT-${uuidv4().slice(0, 8).toUpperCase()}`,
    type,
    title,
    message,
    severity,
  });
  if (io) io.emit('alert:new', alert);
  return alert;
}

module.exports = {
  processDetection,
  calculateSeverity,
  findMatchingHazardEvent,
  findNearestRoadSegment,
  updateRoadSegmentHealth,
  createRepairTask,
  generateSystemAlert,
  haversineDistance,
};
