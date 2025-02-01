const pg = require('pg');

// postgress data //
const db = new pg.Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }, // Required for Render DBs
});

db.connect(); // connect database

module.exports = db;
