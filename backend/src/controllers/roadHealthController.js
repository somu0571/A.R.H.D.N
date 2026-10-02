const RoadSegment = require('../models/RoadSegment');

exports.getRoadSegments = async (req, res, next) => {
  try {
    const segments = await RoadSegment.find({}).sort('healthScore');
    res.json(segments);
  } catch (error) {
    next(error);
  }
};

exports.getRoadSegment = async (req, res, next) => {
  try {
    const segment = await RoadSegment.findOne({ roadSegmentId: req.params.id });
    if (!segment) return res.status(404).json({ error: 'Road segment not found' });
    res.json(segment);
  } catch (error) {
    next(error);
  }
};
