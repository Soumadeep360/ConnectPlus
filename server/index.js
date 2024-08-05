const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const SocketService = require('./services/socket');
const { startMessageConsumer } = require('./services/kafka');
require('dotenv').config();

async function init() {
  // Initialize Kafka message consumer
  startMessageConsumer();
  
  // Initialize SocketService
  const socketService = new SocketService();
  
  const app = express();
  app.use(cors()); 
  app.use(bodyParser.json()); 
  app.use(bodyParser.urlencoded({ extended: true })); 
  app.use(morgan('dev')); // Log HTTP requests
  
  const httpServer = http.createServer(app);
  const PORT = process.env.PORT ? process.env.PORT : 8000;

  // Attach Socket.io to HTTP server
  socketService.io.attach(httpServer);

  
  app.get('/', (req, res) => {
    res.send('HTTP Server is running');
  });

  httpServer.listen(PORT, () =>
    console.log(`HTTP Server started at PORT:${PORT}`)
  );

  // Initialize socket listeners
  socketService.initListeners();
}

init();
