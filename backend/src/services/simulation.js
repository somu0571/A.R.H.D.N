const { v4: uuidv4 } = require('uuid');
const Rover = require('../models/Rover');
const CCTV = require('../models/CCTV');
const RoadSegment = require('../models/RoadSegment');
const Telemetry = require('../models/Telemetry');
const { processDetection } = require('./intelligenceLayer');

// ---- Delhi NCR coordinates for simulation ----
const DEMO_CENTER = { lat: 28.6139, lon: 77.2090 };
const HAZARD_TYPES = ['pothole', 'crack', 'waterlogging', 'damaged_surface'];
const MOTION_CONTEXTS = ['MOVING', 'BRAKING', 'TURNING', 'BUMP'];

const DEMO_ROAD_SEGMENTS = [
  {
    roadSegmentId: 'RS-001',
    name: 'Rajpath - India Gate to Rashtrapati Bhavan',
    startLocation: { latitude: 28.6129, longitude: 77.2295 },
    endLocation: { latitude: 28.6143, longitude: 77.1994 },
  },
  {
    roadSegmentId: 'RS-002',
    name: 'Ring Road - AIIMS to Ashram',
    startLocation: { latitude: 28.5672, longitude: 77.2100 },
    endLocation: { latitude: 28.5805, longitude: 77.2539 },
  },
  {
    roadSegmentId: 'RS-003',
    name: 'NH-48 - Dhaula Kuan to Mahipalpur',
    startLocation: { latitude: 28.5922, longitude: 77.1545 },
    endLocation: { latitude: 28.5517, longitude: 77.1218 },
  },
  {
    roadSegmentId: 'RS-004',
    name: 'Outer Ring Road - Nehru Place to Sarita Vihar',
    startLocation: { latitude: 28.5491, longitude: 77.2533 },
    endLocation: { latitude: 28.5344, longitude: 77.2891 },
  },
  {
    roadSegmentId: 'RS-005',
    name: 'Vikas Marg - ITO to Laxmi Nagar',
    startLocation: { latitude: 28.6304, longitude: 77.2406 },
    endLocation: { latitude: 28.6311, longitude: 77.2787 },
  },
];

const DEMO_ROVERS = [
  { roverId: 'ARHDN-01', name: 'Alpha Scout' },
  { roverId: 'ARHDN-02', name: 'Beta Patrol' },
  { roverId: 'ARHDN-03', name: 'Gamma Surveyor' },
];

const DEMO_CCTVS = [
  { cameraId: 'CCTV-001', name: 'India Gate Junction', location: 'India Gate Circle', latitude: 28.6129, longitude: 77.2295 },
  { cameraId: 'CCTV-002', name: 'AIIMS Flyover', location: 'AIIMS Ring Road', latitude: 28.5672, longitude: 77.2100 },
  { cameraId: 'CCTV-003', name: 'Dhaula Kuan Underpass', location: 'Dhaula Kuan', latitude: 28.5922, longitude: 77.1545 },
  { cameraId: 'CCTV-004', name: 'Nehru Place Crossing', location: 'Nehru Place', latitude: 28.5491, longitude: 77.2533 },
];

// ---- Rover movement state ----
const roverState = {};

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function initializeDemoData() {
  console.log('[ARHDN] Initializing demo data...');

  // Create road segments
  for (const seg of DEMO_ROAD_SEGMENTS) {
    await RoadSegment.findOneAndUpdate(
      { roadSegmentId: seg.roadSegmentId },
      {
        ...seg,
        healthScore: Math.floor(randomBetween(45, 95)),
        hazardCount: 0,
        criticalHazards: 0,
        verifiedHazards: 0,
        distanceSurveyed: randomBetween(1, 10),
        lastSurveyed: new Date(),
        riskLevel: 'LOW',
        maintenancePriority: 0,
        isDemo: true,
      },
      { upsert: true, new: true }
    );
  }

  // Create rovers
  for (const r of DEMO_ROVERS) {
    const seg = randomItem(DEMO_ROAD_SEGMENTS);
    const lat = seg.startLocation.latitude + randomBetween(-0.005, 0.005);
    const lon = seg.startLocation.longitude + randomBetween(-0.005, 0.005);

    await Rover.findOneAndUpdate(
      { roverId: r.roverId },
      {
        ...r,
        status: 'ONLINE',
        battery: Math.floor(randomBetween(60, 100)),
        latitude: lat,
        longitude: lon,
        speed: randomBetween(10, 40),
        heading: randomBetween(0, 360),
        cameraStatus: 'CONNECTED',
        gpsStatus: 'CONNECTED',
        imuStatus: 'CONNECTED',
        aiStatus: 'RUNNING',
        networkStatus: 'CONNECTED',
        cpuUsage: randomBetween(30, 70),
        ramUsage: randomBetween(40, 75),
        temperature: randomBetween(40, 65),
        storageUsage: randomBetween(20, 60),
        aiFps: randomBetween(8, 15),
        lastHeartbeat: new Date(),
      },
      { upsert: true, new: true }
    );

    roverState[r.roverId] = { lat, lon, heading: randomBetween(0, 360) };
  }

  // Create CCTVs
  for (const c of DEMO_CCTVS) {
    await CCTV.findOneAndUpdate(
      { cameraId: c.cameraId },
      {
        ...c,
        status: 'ONLINE',
        streamUrl: `rtsp://demo.arhdn.local/${c.cameraId}/stream`,
        lastHeartbeat: new Date(),
        hazardCount: 0,
      },
      { upsert: true, new: true }
    );
  }

  console.log('[ARHDN] Demo data initialized.');
}

/**
 * Simulate rover movement, telemetry, and detections.
 */
async function simulationTick(io) {
  for (const r of DEMO_ROVERS) {
    const state = roverState[r.roverId];
    if (!state) continue;

    // Move rover
    const speed = randomBetween(15, 45);
    state.heading += randomBetween(-15, 15);
    const moveKm = speed / 3600; // ~1 second tick
    const dLat = (moveKm * Math.cos((state.heading * Math.PI) / 180)) / 111;
    const dLon = (moveKm * Math.sin((state.heading * Math.PI) / 180)) / (111 * Math.cos((state.lat * Math.PI) / 180));
    state.lat += dLat;
    state.lon += dLon;

    // Keep near Delhi
    if (Math.abs(state.lat - DEMO_CENTER.lat) > 0.08) state.heading += 180;
    if (Math.abs(state.lon - DEMO_CENTER.lon) > 0.08) state.heading += 180;

    const battery = Math.max(20, Math.floor(randomBetween(55, 98)));
    const cpuUsage = randomBetween(30, 75);
    const ramUsage = randomBetween(40, 70);
    const temperature = randomBetween(42, 68);
    const aiFps = randomBetween(8, 16);

    // Update rover in DB
    await Rover.findOneAndUpdate(
      { roverId: r.roverId },
      {
        latitude: state.lat,
        longitude: state.lon,
        speed,
        heading: state.heading % 360,
        battery,
        cpuUsage,
        ramUsage,
        temperature,
        aiFps,
        lastHeartbeat: new Date(),
      }
    );

    // Create telemetry
    const telemetry = await Telemetry.create({
      roverId: r.roverId,
      latitude: state.lat,
      longitude: state.lon,
      speed,
      heading: state.heading % 360,
      battery,
      cpuUsage,
      ramUsage,
      temperature,
      storageUsage: randomBetween(20, 60),
      aiFps,
      accelerometer: { x: randomBetween(-2, 2), y: randomBetween(-1, 1), z: randomBetween(9, 11) },
      gyroscope: { x: randomBetween(-0.5, 0.5), y: randomBetween(-0.5, 0.5), z: randomBetween(-0.5, 0.5) },
      motionContext: randomItem(MOTION_CONTEXTS),
      timestamp: new Date(),
    });

    // Emit telemetry
    if (io) {
      io.emit('rover:telemetry', telemetry);
      io.emit('rover:location', {
        roverId: r.roverId,
        latitude: state.lat,
        longitude: state.lon,
        speed,
        heading: state.heading % 360,
      });
    }

    // Random detection (30% chance per tick per rover)
    if (Math.random() < 0.3) {
      const hazardType = randomItem(HAZARD_TYPES);
      const confidence = parseFloat(randomBetween(0.55, 0.98).toFixed(2));
      const bbSize = Math.floor(randomBetween(50, 300));
      const bx = Math.floor(randomBetween(0, 640 - bbSize));
      const by = Math.floor(randomBetween(0, 480 - bbSize));

      await processDetection(
        {
          sourceType: 'MOBILE_ROVER',
          sourceId: r.roverId,
          roverId: r.roverId,
          hazardType,
          confidence,
          boundingBox: [bx, by, bx + bbSize, by + bbSize],
          latitude: state.lat + randomBetween(-0.001, 0.001),
          longitude: state.lon + randomBetween(-0.001, 0.001),
          speed,
          heading: state.heading % 360,
          timestamp: new Date(),
          processingTimeMs: Math.floor(randomBetween(80, 200)),
          modelVersion: 'YOLOv12',
          isDemo: true,
        },
        io
      );
    }
  }

  // CCTV detections (10% chance per tick per camera)
  for (const c of DEMO_CCTVS) {
    if (Math.random() < 0.1) {
      const hazardType = randomItem(HAZARD_TYPES);
      const confidence = parseFloat(randomBetween(0.50, 0.95).toFixed(2));

      await processDetection(
        {
          sourceType: 'CCTV',
          sourceId: c.cameraId,
          cameraId: c.cameraId,
          hazardType,
          confidence,
          boundingBox: [100, 100, 350, 300],
          latitude: c.latitude + randomBetween(-0.002, 0.002),
          longitude: c.longitude + randomBetween(-0.002, 0.002),
          timestamp: new Date(),
          processingTimeMs: Math.floor(randomBetween(100, 250)),
          modelVersion: 'YOLOv12',
          isDemo: true,
        },
        io
      );

      await CCTV.findOneAndUpdate(
        { cameraId: c.cameraId },
        { lastDetection: new Date(), lastHeartbeat: new Date(), $inc: { hazardCount: 1 } }
      );
    }
  }
}

let simulationInterval = null;

function startSimulation(io, intervalMs = 5000) {
  if (simulationInterval) return;
  console.log(`[ARHDN] Simulation started (interval: ${intervalMs}ms)`);
  simulationInterval = setInterval(() => simulationTick(io), intervalMs);
  if (io) io.emit('system:status', { simulation: true, message: 'SIMULATION MODE ACTIVE' });
}

function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('[ARHDN] Simulation stopped');
  }
}

module.exports = {
  initializeDemoData,
  simulationTick,
  startSimulation,
  stopSimulation,
};
