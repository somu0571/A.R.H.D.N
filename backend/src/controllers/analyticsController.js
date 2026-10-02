const Detection = require('../models/Detection');
const HazardEvent = require('../models/HazardEvent');
const Rover = require('../models/Rover');
const CCTV = require('../models/CCTV');
const RoadSegment = require('../models/RoadSegment');
const RepairTask = require('../models/RepairTask');
const Alert = require('../models/Alert');

exports.getOverview = async (req, res, next) => {
  try {
    const [
      totalDetections,
      totalHazardEvents,
      criticalAlerts,
      verifiedHazards,
      activeRovers,
      activeCCTV,
      roadSegments,
      openRepairTasks,
      recentDetections,
      recentAlerts,
    ] = await Promise.all([
      Detection.countDocuments({}),
      HazardEvent.countDocuments({}),
      Alert.countDocuments({ severity: 'CRITICAL', isResolved: false }),
      HazardEvent.countDocuments({ verificationStatus: 'VERIFIED' }),
      Rover.countDocuments({ status: 'ONLINE' }),
      CCTV.countDocuments({ status: 'ONLINE' }),
      RoadSegment.find({}).lean(),
      RepairTask.countDocuments({ status: { $in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] } }),
      Detection.find({}).sort('-timestamp').limit(10).lean(),
      Alert.find({ isResolved: false }).sort('-createdAt').limit(10).lean(),
    ]);

    const avgHealthScore =
      roadSegments.length > 0
        ? Math.round(roadSegments.reduce((sum, s) => sum + s.healthScore, 0) / roadSegments.length)
        : 100;

    res.json({
      totalDetections,
      totalHazardEvents,
      criticalAlerts,
      verifiedHazards,
      activeRovers,
      activeCCTV,
      roadSegmentCount: roadSegments.length,
      avgHealthScore,
      openRepairTasks,
      recentDetections,
      recentAlerts,
    });
  } catch (error) {
    next(error);
  }
};

exports.getHazardAnalytics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const [byType, bySeverity, bySource, overTime, verificationStats] = await Promise.all([
      Detection.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: '$hazardType', count: { $sum: 1 } } },
      ]),
      Detection.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      Detection.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: '$sourceType', count: { $sum: 1 } } },
      ]),
      Detection.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      HazardEvent.aggregate([
        { $match: { firstDetectedAt: { $gte: since } } },
        { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({ byType, bySeverity, bySource, overTime, verificationStats });
  } catch (error) {
    next(error);
  }
};

exports.getCoverageAnalytics = async (req, res, next) => {
  try {
    const rovers = await Rover.find({}).lean();
    const cctvs = await CCTV.find({}).lean();

    const roverCoverage = rovers.map((r) => ({
      roverId: r.roverId,
      name: r.name,
      status: r.status,
      distanceSurveyed: r.distanceSurveyed || 0,
    }));

    const cctvCoverage = cctvs.map((c) => ({
      cameraId: c.cameraId,
      name: c.name,
      status: c.status,
      hazardCount: c.hazardCount || 0,
    }));

    res.json({ roverCoverage, cctvCoverage });
  } catch (error) {
    next(error);
  }
};

exports.getRoadHealthAnalytics = async (req, res, next) => {
  try {
    const segments = await RoadSegment.find({}).sort('healthScore').lean();

    const summary = {
      totalSegments: segments.length,
      critical: segments.filter((s) => s.riskLevel === 'CRITICAL').length,
      high: segments.filter((s) => s.riskLevel === 'HIGH').length,
      medium: segments.filter((s) => s.riskLevel === 'MEDIUM').length,
      low: segments.filter((s) => s.riskLevel === 'LOW').length,
      averageHealthScore:
        segments.length > 0
          ? Math.round(segments.reduce((sum, s) => sum + s.healthScore, 0) / segments.length)
          : 100,
    };

    res.json({ segments, summary });
  } catch (error) {
    next(error);
  }
};
