const http = require('http');
const app = require('./app');
const { setupWebSocket } = require('./src/utils/websocket');
const { startCronJobs } = require('./src/utils/cron');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

setupWebSocket(server);
startCronJobs();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
