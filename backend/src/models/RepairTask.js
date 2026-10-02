const mongoose = require('mongoose');

const repairTaskSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true, unique: true },
    hazardEventId: { type: String, required: true },
    roadSegmentId: { type: String, default: null },
    hazardType: {
      type: String,
      enum: ['pothole', 'crack', 'waterlogging', 'damaged_surface'],
      required: true,
    },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    priority: { type: Number, default: 0, min: 0, max: 100 },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    location: { type: String, default: '' },
    verificationCount: { type: Number, default: 1 },
    assignedTeam: { type: String, default: null },
    status: {
      type: String,
      enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
      default: 'PENDING',
    },
    notes: { type: String, default: '' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

repairTaskSchema.index({ priority: -1 });
repairTaskSchema.index({ status: 1 });

module.exports = mongoose.model('RepairTask', repairTaskSchema);
