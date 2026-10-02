const mongoose = require('mongoose');

const hazardEventSchema = new mongoose.Schema(
  {
    hazardEventId: { type: String, required: true, unique: true },
    hazardType: {
      type: String,
      enum: ['pothole', 'crack', 'waterlogging', 'damaged_surface'],
      required: true,
    },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    firstDetectedAt: { type: Date, required: true },
    lastDetectedAt: { type: Date, required: true },
    detectionIds: [{ type: String }],
    sourceCount: { type: Number, default: 1 },
    verificationCount: { type: Number, default: 1 },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'VERIFIED', 'REJECTED'],
      default: 'UNVERIFIED',
    },
    roadSegmentId: { type: String, default: null },
    status: { type: String, enum: ['ACTIVE', 'RESOLVED', 'ARCHIVED'], default: 'ACTIVE' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

hazardEventSchema.index({ latitude: 1, longitude: 1 });
hazardEventSchema.index({ hazardType: 1, severity: 1 });

module.exports = mongoose.model('HazardEvent', hazardEventSchema);
