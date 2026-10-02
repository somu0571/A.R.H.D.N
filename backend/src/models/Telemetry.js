const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema(
  {
    roverId: { type: String, required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    altitude: { type: Number, default: null },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    battery: { type: Number, default: 0 },
    cpuUsage: { type: Number, default: 0 },
    ramUsage: { type: Number, default: 0 },
    temperature: { type: Number, default: 0 },
    storageUsage: { type: Number, default: 0 },
    aiFps: { type: Number, default: 0 },
    accelerometer: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
    gyroscope: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
    motionContext: { type: String, enum: ['STATIONARY', 'MOVING', 'BRAKING', 'TURNING', 'BUMP'], default: 'STATIONARY' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

telemetrySchema.index({ roverId: 1, timestamp: -1 });

module.exports = mongoose.model('Telemetry', telemetrySchema);
