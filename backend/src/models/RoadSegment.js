const mongoose = require('mongoose');

const roadSegmentSchema = new mongoose.Schema(
  {
    roadSegmentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    startLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    endLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    healthScore: { type: Number, default: 100, min: 0, max: 100 },
    hazardCount: { type: Number, default: 0 },
    criticalHazards: { type: Number, default: 0 },
    verifiedHazards: { type: Number, default: 0 },
    distanceSurveyed: { type: Number, default: 0 },
    lastSurveyed: { type: Date, default: null },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
    maintenancePriority: { type: Number, default: 0, min: 0, max: 100 },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoadSegment', roadSegmentSchema);
