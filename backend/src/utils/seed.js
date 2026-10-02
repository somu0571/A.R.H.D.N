const mongoose = require('mongoose');
const User = require('../models/User');
const Rover = require('../models/Rover');
const CCTV = require('../models/CCTV');
const RoadSegment = require('../models/RoadSegment');
const HazardEvent = require('../models/HazardEvent');
const Detection = require('../models/Detection');
const RepairTask = require('../models/RepairTask');
const Alert = require('../models/Alert');
const config = require('../config');

const seedData = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[ARHDN Seed] Connected to MongoDB');

    // Clean existing demo data if needed
    console.log('[ARHDN Seed] Seeding Default Users...');
    await User.deleteMany({ email: { $in: ['admin@arhdn.gov', 'operator@arhdn.gov', 'viewer@arhdn.gov'] } });

    await User.create([
      {
        name: 'Municipal Admin',
        email: 'admin@arhdn.gov',
        password: 'adminPassword123!',
        role: 'ADMIN',
        isActive: true,
      },
      {
        name: 'Road Ops Officer',
        email: 'operator@arhdn.gov',
        password: 'operatorPassword123!',
        role: 'OPERATOR',
        isActive: true,
      },
      {
        name: 'Public Works Viewer',
        email: 'viewer@arhdn.gov',
        password: 'viewerPassword123!',
        role: 'VIEWER',
        isActive: true,
      },
    ]);

    console.log('[ARHDN Seed] Default users created:');
    console.log(' - admin@arhdn.gov / adminPassword123! [ADMIN]');
    console.log(' - operator@arhdn.gov / operatorPassword123! [OPERATOR]');
    console.log(' - viewer@arhdn.gov / viewerPassword123! [VIEWER]');

    console.log('[ARHDN Seed] Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('[ARHDN Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
