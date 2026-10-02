const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM', 'INCIDENT'],
      default: 'CUSTOM',
    },
    dateRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    filters: {
      roadSegmentIds: [{ type: String }],
      roverIds: [{ type: String }],
      cctvIds: [{ type: String }],
      hazardTypes: [{ type: String }],
      severities: [{ type: String }],
    },
    summary: {
      totalDetections: { type: Number, default: 0 },
      totalHazardEvents: { type: Number, default: 0 },
      criticalHazards: { type: Number, default: 0 },
      verifiedHazards: { type: Number, default: 0 },
      resolvedHazards: { type: Number, default: 0 },
      averageHealthScore: { type: Number, default: 0 },
      roversActive: { type: Number, default: 0 },
      cctvActive: { type: Number, default: 0 },
    },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['GENERATING', 'COMPLETED', 'FAILED'], default: 'GENERATING' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
