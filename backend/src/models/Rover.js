const mongoose = require('mongoose');

const roverSchema = new mongoose.Schema(
  {
    roverId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    status: { type: String, enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR'], default: 'OFFLINE' },
    battery: { type: Number, default: 0, min: 0, max: 100 },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    altitude: { type: Number, default: null },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    cameraStatus: { type: String, enum: ['CONNECTED', 'DISCONNECTED', 'ERROR'], default: 'DISCONNECTED' },
    gpsStatus: { type: String, enum: ['CONNECTED', 'DISCONNECTED', 'ERROR'], default: 'DISCONNECTED' },
    imuStatus: { type: String, enum: ['CONNECTED', 'DISCONNECTED', 'ERROR'], default: 'DISCONNECTED' },
    aiStatus: { type: String, enum: ['RUNNING', 'STOPPED', 'ERROR', 'LOADING'], default: 'STOPPED' },
    networkStatus: { type: String, enum: ['CONNECTED', 'DISCONNECTED', 'WEAK'], default: 'DISCONNECTED' },
    cpuUsage: { type: Number, default: 0 },
    ramUsage: { type: Number, default: 0 },
    temperature: { type: Number, default: 0 },
    storageUsage: { type: Number, default: 0 },
    aiFps: { type: Number, default: 0 },
    distanceSurveyed: { type: Number, default: 0 },
    lastHeartbeat: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rover', roverSchema);
