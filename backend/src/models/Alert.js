const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    alertId: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: [
        'CRITICAL_HAZARD',
        'HIGH_SEVERITY',
        'REPEATED_HAZARD',
        'VERIFIED_HAZARD',
        'ROVER_OFFLINE',
        'GPS_UNAVAILABLE',
        'CAMERA_UNAVAILABLE',
        'AI_UNAVAILABLE',
        'CCTV_OFFLINE',
        'NETWORK_FAILURE',
        'REPAIR_ESCALATION',
        'SYSTEM',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    referenceId: { type: String, default: null },
    referenceType: { type: String, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    isRead: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

alertSchema.index({ createdAt: -1 });
alertSchema.index({ isRead: 1, isResolved: 1 });

module.exports = mongoose.model('Alert', alertSchema);
