// const { PrismaClient } = require("@prisma/client");

// const prismaClient = new PrismaClient({
//   log: ["query"],
// });

// module.exports = prismaClient;


const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.DBPORT,
  database: 'chatapp',
});

module.exports = pool;