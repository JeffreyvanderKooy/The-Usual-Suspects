const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// MIDDLEWARE
app.use(bodyParser.json()); // To parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded data (form submissions)
app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGIN,
    credentials: true, // Allow credentials (cookies, headers, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed HTTP methods
  })
);

const raidRouter = require('./src/routes/raidRoute');
const userRouter = require('./src/routes/userRoute');

app.use('/api/v1/raids', raidRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
