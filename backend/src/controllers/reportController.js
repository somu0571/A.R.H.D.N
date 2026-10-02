const { v4: uuidv4 } = require('uuid');
const Report = require('../models/Report');
const Detection = require('../models/Detection');
const HazardEvent = require('../models/HazardEvent');
const Rover = require('../models/Rover');
const CCTV = require('../models/CCTV');

exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({}).sort('-createdAt').limit(50);
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

exports.createReport = async (req, res, next) => {
  try {
    const { title, type, dateRange, filters } = req.body;
    const start = new Date(dateRange?.start || Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = new Date(dateRange?.end || Date.now());

    const detFilter = { timestamp: { $gte: start, $lte: end } };
    if (filters?.hazardTypes?.length) detFilter.hazardType = { $in: filters.hazardTypes };
    if (filters?.severities?.length) detFilter.severity = { $in: filters.severities };

    const [totalDetections, totalHazardEvents, criticalHazards, verifiedHazards, resolvedHazards, roversActive, cctvActive] =
      await Promise.all([
        Detection.countDocuments(detFilter),
        HazardEvent.countDocuments({ firstDetectedAt: { $gte: start, $lte: end } }),
        HazardEvent.countDocuments({ severity: 'CRITICAL', firstDetectedAt: { $gte: start, $lte: end } }),
        HazardEvent.countDocuments({ verificationStatus: 'VERIFIED', firstDetectedAt: { $gte: start, $lte: end } }),
        HazardEvent.countDocuments({ status: 'RESOLVED', firstDetectedAt: { $gte: start, $lte: end } }),
        Rover.countDocuments({ status: 'ONLINE' }),
        CCTV.countDocuments({ status: 'ONLINE' }),
      ]);

    const report = await Report.create({
      reportId: `RPT-${uuidv4().slice(0, 8).toUpperCase()}`,
      title: title || `Report - ${start.toISOString().split('T')[0]}`,
      type: type || 'CUSTOM',
      dateRange: { start, end },
      filters: filters || {},
      summary: {
        totalDetections,
        totalHazardEvents,
        criticalHazards,
        verifiedHazards,
        resolvedHazards,
        roversActive,
        cctvActive,
      },
      generatedBy: req.user?._id,
      status: 'COMPLETED',
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};
