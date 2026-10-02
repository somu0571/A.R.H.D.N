const Detection = require('../models/Detection');
const { processDetection } = require('../services/intelligenceLayer');

exports.getDetections = async (req, res, next) => {
  try {
    const {
      hazardType, severity, sourceType, roverId, cameraId,
      verificationStatus, status, startDate, endDate,
      search, page = 1, limit = 50, sort = '-timestamp',
    } = req.query;

    const filter = {};
    if (hazardType) filter.hazardType = hazardType;
    if (severity) filter.severity = severity;
    if (sourceType) filter.sourceType = sourceType;
    if (roverId) filter.roverId = roverId;
    if (cameraId) filter.cameraId = cameraId;
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { detectionId: { $regex: search, $options: 'i' } },
        { hazardType: { $regex: search, $options: 'i' } },
        { sourceId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [detections, total] = await Promise.all([
      Detection.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Detection.countDocuments(filter),
    ]);

    res.json({
      detections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getDetection = async (req, res, next) => {
  try {
    const detection = await Detection.findOne({ detectionId: req.params.id });
    if (!detection) return res.status(404).json({ error: 'Detection not found' });
    res.json(detection);
  } catch (error) {
    next(error);
  }
};

exports.createDetection = async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const result = await processDetection(req.body, io);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateDetection = async (req, res, next) => {
  try {
    const detection = await Detection.findOneAndUpdate(
      { detectionId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!detection) return res.status(404).json({ error: 'Detection not found' });

    const io = req.app.get('io');
    if (io) io.emit('detection:new', detection);

    res.json(detection);
  } catch (error) {
    next(error);
  }
};
