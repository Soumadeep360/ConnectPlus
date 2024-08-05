require('dotenv').config();
const { Kafka } = require('kafkajs');
const fs = require('fs');
const path = require('path');
const pool = require('./db'); // Use the pool for database interactions

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKERS],
  ssl: {
    ca: [fs.readFileSync(path.resolve(process.env.KAFKA_SSL_CA), 'utf-8')],
  },
  sasl: {
    username: process.env.KAFKA_SASL_USERNAME,
    password: process.env.KAFKA_SASL_PASSWORD,
    mechanism: process.env.KAFKA_SASL_MECHANISM,
  },
});

let producer = null;

async function createProducer() {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

async function produceMessage(message) {
  const producer = await createProducer();
  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: 'MESSAGES',
  });
  return true;
}

async function startMessageConsumer() {
  console.log('Consumer is running..');
  const consumer = kafka.consumer({ groupId: 'default' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'MESSAGES', fromBeginning: true });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;
      console.log('New Message Recv..');
      try {
        await pool.query(
          'INSERT INTO messages (text) VALUES ($1)',
          [message.value.toString()]
        );
      } catch (err) {
        console.log('Something is wrong', err);
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: 'MESSAGES' }]);
        }, 60 * 1000);
      }
    },
  });
}

module.exports = {
  createProducer,
  produceMessage,
  startMessageConsumer,
  kafka,
};
