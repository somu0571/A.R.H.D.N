const RepairTask = require('../models/RepairTask');

exports.getRepairTasks = async (req, res, next) => {
  try {
    const { status, severity, hazardType, sort = '-priority' } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (hazardType) filter.hazardType = hazardType;

    const tasks = await RepairTask.find(filter).sort(sort);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.createRepairTask = async (req, res, next) => {
  try {
    const task = await RepairTask.create(req.body);
    const io = req.app.get('io');
    if (io) io.emit('repair:update', task);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

exports.updateRepairTask = async (req, res, next) => {
  try {
    const task = await RepairTask.findOneAndUpdate(
      { taskId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: 'Repair task not found' });

    const io = req.app.get('io');
    if (io) io.emit('repair:update', task);

    res.json(task);
  } catch (error) {
    next(error);
  }
};
