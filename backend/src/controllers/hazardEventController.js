const HazardEvent = require('../models/HazardEvent');

exports.getHazardEvents = async (req, res, next) => {
  try {
    const { hazardType, severity, verificationStatus, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (hazardType) filter.hazardType = hazardType;
    if (severity) filter.severity = severity;
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [events, total] = await Promise.all([
      HazardEvent.find(filter).sort('-lastDetectedAt').skip(skip).limit(parseInt(limit)),
      HazardEvent.countDocuments(filter),
    ]);

    res.json({
      hazardEvents: events,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getHazardEvent = async (req, res, next) => {
  try {
    const event = await HazardEvent.findOne({ hazardEventId: req.params.id });
    if (!event) return res.status(404).json({ error: 'Hazard event not found' });
    res.json(event);
  } catch (error) {
    next(error);
  }
};
