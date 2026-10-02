const setupSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`[ARHDN] Socket connected: ${socket.id}`);

    socket.on('rover:heartbeat', (data) => {
      io.emit('rover:status', data);
    });

    socket.on('rover:telemetry', (data) => {
      io.emit('rover:telemetry', data);
    });

    socket.on('detection:submit', async (data) => {
      // Detection submitted via socket
      io.emit('detection:new', data);
    });

    socket.on('disconnect', () => {
      console.log(`[ARHDN] Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSockets;
