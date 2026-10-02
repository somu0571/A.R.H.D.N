const CCTV = require('../models/CCTV');

exports.getCCTVs = async (req, res, next) => {
  try {
    const cameras = await CCTV.find({}).sort('-lastHeartbeat');
    res.json(cameras);
  } catch (error) {
    next(error);
  }
};

exports.getCCTV = async (req, res, next) => {
  try {
    const camera = await CCTV.findOne({ cameraId: req.params.id });
    if (!camera) return res.status(404).json({ error: 'CCTV camera not found' });
    res.json(camera);
  } catch (error) {
    next(error);
  }
};

exports.createCCTV = async (req, res, next) => {
  try {
    const camera = await CCTV.create(req.body);
    res.status(201).json(camera);
  } catch (error) {
    next(error);
  }
};
