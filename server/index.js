const express = require('express');
const http = require('http');
const SocketService = require('./services/socket');
const { startMessageConsumer } = require('./services/kafka');

async function init() {
  startMessageConsumer();
  const socketService = new SocketService();
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = process.env.PORT ? process.env.PORT : 8000;

  socketService.io.attach(httpServer);

  app.get('/', (req, res) => {
    res.send('HTTP Server is running');
  });

  httpServer.listen(PORT, () =>
    console.log(`HTTP Server started at PORT:${PORT}`)
  );

  socketService.initListeners();
}

init();
