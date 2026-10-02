const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema(
  {
    detectionId: { type: String, required: true, unique: true },
    sourceType: { type: String, enum: ['MOBILE_ROVER', 'VEHICLE', 'CCTV'], required: true },
    sourceId: { type: String, required: true },
    roverId: { type: String, default: null },
    cameraId: { type: String, default: null },
    hazardType: {
      type: String,
      enum: ['pothole', 'crack', 'waterlogging', 'damaged_surface'],
      required: true,
    },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    boundingBox: { type: [Number], default: [] },
    imageUrl: { type: String, default: null },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    altitude: { type: Number, default: null },
    speed: { type: Number, default: null },
    heading: { type: Number, default: null },
    timestamp: { type: Date, required: true },
    roadSegmentId: { type: String, default: null },
    hazardEventId: { type: String, default: null },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'VERIFIED', 'REJECTED'],
      default: 'UNVERIFIED',
    },
    verificationCount: { type: Number, default: 1 },
    status: { type: String, enum: ['ACTIVE', 'RESOLVED', 'ARCHIVED'], default: 'ACTIVE' },
    processingTimeMs: { type: Number, default: null },
    modelVersion: { type: String, default: 'YOLOv12' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

detectionSchema.index({ latitude: 1, longitude: 1 });
detectionSchema.index({ hazardType: 1, severity: 1 });
detectionSchema.index({ timestamp: -1 });
detectionSchema.index({ sourceType: 1, sourceId: 1 });

module.exports = mongoose.model('Detection', detectionSchema);
