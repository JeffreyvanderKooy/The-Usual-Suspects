import {
  getAllUsers,
  getUser,
  capitalize,
  getItems,
  submitItem,
  insertUser,
  incrementAttendance,
  validateInput,
} from './helper.js';

import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3000; // Render will provide the port in process.env.PORT

dotenv.config(); // init dotenv

// Use body-parser middleware
app.use(bodyParser.json()); // To parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded data (form submissions)

app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGIN,
    credentials: true, // Allow credentials (cookies, headers, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  })
);

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

// Gets all users on pageload
app.get('/users', async (_, res) => {
  try {
    const users = await getAllUsers(db);

    res.send({ ok: true, data: users });
  } catch (error) {
    res.status(400).send({ ok: false, message: error.message });
  }
});

// Gets all items reserved for given raid
app.get('/raid', async (req, res) => {
  try {
    const { raid } = req.query;

    if (!raid)
      throw new Error('Could not find a target raid. Please try again.');

    const { rows } = await getItems(raid, db);

    res.send({ ok: true, data: { raid: raid, rows } });
  } catch (error) {
    res.status(400).send({ ok: false, message: error.message });
  }
});

// Login function
app.post('/login', async (req, res) => {
  try {
    const { name, pin } = validateInput(req.body);

    const user = await getUser(name.toLowerCase(), pin, db);

    res.send({ ok: true, data: user });
  } catch (error) {
    res.status(400).send({ ok: false, message: error.message });
  }
});

// register function
app.post('/register', async (req, res) => {
  try {
    const { name, pin } = validateInput(req.body);

    const user = await insertUser(name.toLowerCase(), pin, db);

    res.send({ ok: true, data: user });
  } catch (error) {
    res.status(400).send({ ok: false, message: error.message });
  }
});

app.post('/bonus', async (req, res) => {
  try {
    const { id, raid, bonus } = req.body;

    if (!id) throw new Error('Missing parameter: ID!');
    if (!raid) throw new Error('Missing parameter: Raid!');
    if (!bonus) throw new Error('Missing parameter: Bonus!');

    const response = await incrementAttendance(id, raid, bonus, db);

    res.send({ ok: true, data: response });
  } catch (error) {
    res.status(400).send({ ok: false, message: error.message });
  }
});

// Reserves a item for given raid
app.post('/reserve', async (req, res) => {
  try {
    const { item, id, name, raid } = req.body;

    // validate payload
    if (!item) throw new Error('Missing parameter: item!');
    if (!id) throw new Error('Missing parameter: ID!');
    if (!name) throw new Error('Missing parameter: name!');
    if (!raid) throw new Error('Missing parameter: raid!');

    const data = {
      item: capitalize(item),
      id,
      raid,
      name: capitalize(name),
    };

    const { rows } = await submitItem(data, db);

    res.send({ ok: true, result: rows });
  } catch (error) {
    res.status(400).send({ ok: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log('Site hosting on port: ' + port);
});
