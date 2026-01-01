const { Pool } = require('pg');
require('dotenv').config();

// Database se judne ki settings
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('40 Years of Dev Experience: Connection Established with the Fortress (Database)!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};