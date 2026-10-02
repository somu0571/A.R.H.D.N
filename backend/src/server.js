const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const setupSockets = require('./sockets');

// Routes
const authRoutes = require('./routes/auth');
const detectionRoutes = require('./routes/detections');
const hazardEventRoutes = require('./routes/hazardEvents');
const roverRoutes = require('./routes/rovers');
const cctvRoutes = require('./routes/cctv');
const roadHealthRoutes = require('./routes/roadHealth');
const repairRoutes = require('./routes/repair');
const alertRoutes = require('./routes/alerts');
const analyticsRoutes = require('./routes/analytics');
const reportRoutes = require('./routes/reports');

// Simulation
const { initializeDemoData, startSimulation } = require('./services/simulation');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);
setupSockets(io);

// ---- Middleware ----
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/detections', detectionRoutes);
app.use('/api/hazard-events', hazardEventRoutes);
app.use('/api/rovers', roverRoutes);
app.use('/api/cctv', cctvRoutes);
app.use('/api/road-health', roadHealthRoutes);
app.use('/api/repair-priority', repairRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'ARHDN Backend',
    timestamp: new Date().toISOString(),
    demoMode: config.demoMode,
  });
});

// Error handler
app.use(errorHandler);

// ---- Start ----
const start = async () => {
  await connectDB();

  if (config.demoMode) {
    await initializeDemoData();
    startSimulation(io, 5000);
  }

  server.listen(config.port, () => {
    console.log(`[ARHDN] Backend running on port ${config.port}`);
    console.log(`[ARHDN] Mode: ${config.nodeEnv}`);
    console.log(`[ARHDN] Demo: ${config.demoMode ? 'ENABLED' : 'DISABLED'}`);
  });
};

start().catch((err) => {
  console.error('[ARHDN] Failed to start server:', err);
  process.exit(1);
});
