import {
  getAllUsers,
  getUser,
  capitalize,
  getItems,
  submitItem,
  insertUser,
  incrementAttendance,
  validateName,
  validatePin,
  validateRaid,
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
    // 1. retrieve all users form DB
    const users = await getAllUsers(db);

    // 2. response
    res.json({ ok: true, data: users });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// Gets all items reserved for given raid
app.get('/raid', async (req, res) => {
  try {
    // 1. validate raid
    const raid = validateRaid(req.query.raid);

    // 2. get all items belonging to this raid
    const rows = await getItems(raid, db);

    // 3. response
    res.json({ ok: true, data: { raid, rows } });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// Login function
app.post('/login', async (req, res) => {
  try {
    // 1. validate name and pin
    const name = validateName(req.body.name);
    const pin = validatePin(req.body.pin);

    // 2. get the user
    const user = await getUser(name, pin, db);

    // 3. response
    res.json({ ok: true, data: user });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// register function
app.post('/register', async (req, res) => {
  try {
    // 1. validate name and pin
    const name = validateName(req.body.name);
    const pin = validatePin(req.body.pin);

    // 2. insert a new user returning the user
    const user = await insertUser(name, pin, db);

    // 3. response
    res.json({ ok: true, data: user });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

app.post('/bonus', async (req, res) => {
  try {
    // 1. destructure req.body
    const { id, raid, bonus } = req.body;

    // 2. check for missing parameters
    if (!id) throw new Error('Missing parameter: ID!');
    if (!bonus) throw new Error('Missing parameter: Bonus!');

    // 3. update the "bonus" column in selected raid at id
    const result = await incrementAttendance(id, raid, bonus, db);

    // 4. response
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// Reserves a item for given raid
app.post('/reserve', async (req, res) => {
  try {
    // 1. destructure req.body
    const { item, id, name } = req.body;

    // 2. validate the raid input
    const raid = validateRaid(req.body.raid);

    // 3. check for missing parameters
    if (!item) throw new Error('Missing parameter: item!');
    if (!id) throw new Error('Missing parameter: ID!');
    if (!name) throw new Error('Missing parameter: name!');

    // 4. data to send to database
    const data = {
      item: capitalize(item),
      id,
      raid,
      name: capitalize(name),
    };

    // 5. submit item returning the submitted item
    const result = await submitItem(data, db);

    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// TODO : ADD A DELETE FUNCTION FOR DELETING UR SR ENTIRELY! //
app.delete('/reserve', async (req, res) => {
  try {
    // 1. get id from req.body
    const id = +req.body.id;

    // 2. validate the raid from req.body
    const raid = validateRaid(req.body.raid);

    // 3. data to send to DB
    const data = { id, raid };

    // 4. delete the item returning the deleted item
    const result = await deleteItem(data, db);

    // 5. response
    res.status(202).json({ ok: true, data: result });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log('Site hosting on port: ' + port);
});
