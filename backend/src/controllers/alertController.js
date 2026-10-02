const Alert = require('../models/Alert');

exports.getAlerts = async (req, res, next) => {
  try {
    const { type, severity, isRead, isResolved, limit = 100 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (isResolved !== undefined) filter.isResolved = isResolved === 'true';

    const alerts = await Alert.find(filter).sort('-createdAt').limit(parseInt(limit));
    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

exports.updateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { alertId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    next(error);
  }
};
