const Rover = require('../models/Rover');
const Telemetry = require('../models/Telemetry');

exports.getRovers = async (req, res, next) => {
  try {
    const rovers = await Rover.find({}).sort('-lastHeartbeat');
    res.json(rovers);
  } catch (error) {
    next(error);
  }
};

exports.getRover = async (req, res, next) => {
  try {
    const rover = await Rover.findOne({ roverId: req.params.id });
    if (!rover) return res.status(404).json({ error: 'Rover not found' });

    const telemetry = await Telemetry.find({ roverId: req.params.id })
      .sort('-timestamp')
      .limit(100);

    res.json({ rover, telemetry });
  } catch (error) {
    next(error);
  }
};

exports.createRover = async (req, res, next) => {
  try {
    const rover = await Rover.create(req.body);
    res.status(201).json(rover);
  } catch (error) {
    next(error);
  }
};

exports.updateRover = async (req, res, next) => {
  try {
    const rover = await Rover.findOneAndUpdate(
      { roverId: req.params.id },
      { ...req.body, lastHeartbeat: new Date() },
      { new: true, runValidators: true }
    );
    if (!rover) return res.status(404).json({ error: 'Rover not found' });

    const io = req.app.get('io');
    if (io) io.emit('rover:status', rover);

    res.json(rover);
  } catch (error) {
    next(error);
  }
};
