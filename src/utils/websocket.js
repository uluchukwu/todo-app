const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

const clients = new Map(); // userId (string) -> WebSocket

const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Token required');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId.toString();
      clients.set(userId, ws);
      logger.info('WebSocket connected', { userId });

      ws.on('close', () => {
        clients.delete(userId);
        logger.info('WebSocket disconnected', { userId });
      });
    } catch {
      ws.close(1008, 'Invalid token');
    }
  });

  return wss;
};

const notifyUser = (userId, data) => {
  const ws = clients.get(userId.toString());
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(data));
  }
};

module.exports = { setupWebSocket, notifyUser };
