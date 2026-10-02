const mongoose = require('mongoose');

const cctvSchema = new mongoose.Schema(
  {
    cameraId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, default: '' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: { type: String, enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR'], default: 'OFFLINE' },
    streamUrl: { type: String, default: '' },
    lastHeartbeat: { type: Date, default: null },
    lastDetection: { type: Date, default: null },
    hazardCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CCTV', cctvSchema);
