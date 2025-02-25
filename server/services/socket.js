require('dotenv').config();
const { Server } = require('socket.io');
const Redis = require('ioredis');
const prismaClient = require('./db');
const { produceMessage } = require('./kafka');

const pub = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

const sub = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

class SocketService {
  constructor() {
    console.log('Init Socket Service...');
    this._io = new Server({
      cors: {
        allowedHeaders: ['*'],
        origin: '*',
      },
    });
    sub.subscribe('MESSAGES');
  }

  initListeners() {
    const io = this.io;
    console.log('Init Socket Listeners...');

    io.on('connect', (socket) => {
      console.log('New Socket Connected', socket.id);
      socket.on('event:message', async ({ message }) => {
        console.log('New Message Rec.', message);
        // publish this message to redis
        await pub.publish('MESSAGES', JSON.stringify({ message }));
      });
    });

    sub.on('message', async (channel, message) => {
      if (channel === 'MESSAGES') {
        console.log('new message from redis', message);
        io.emit('message', message);
        await produceMessage(message);
        console.log('Message Produced to Kafka Broker');
      }
    });
  }

  get io() {
    return this._io;
  }
}

module.exports = SocketService;
