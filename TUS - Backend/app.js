const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const globalErrorHandeler = require('./src/controllers/errorControllers');
const appError = require('./src/utils/appError');

const app = express();

app.set('trust proxy', 1); // Fix IP detection on Render

// MIDDLEWARE

// cors
app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGIN,
    credentials: true, // Allow credentials (cookies, headers, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed HTTP methods
  })
);

// limiter setup
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: { error: 'Too many requests, please try again in 15 minutes.' },
});

app.use((req, res, next) => {
  console.log(req.ip);

  next();
});

// mounting limiter
app.use(limiter);

// Parse req.body
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' })); // To parse URL-encoded data (form submissions)

// Parse cookies on req
app.use(cookieParser());

// Data sanitization against XSS
app.use(xss());

// prevent parameter polution
app.use(hpp());

const raidRouter = require('./src/routes/raidRoute');
const userRouter = require('./src/routes/userRoute');

app.use('/api/v1/raids', raidRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  const message = `No path found for ${req.originalUrl}`;
  next(new appError(message, 404));
});

app.use(globalErrorHandeler);

module.exports = app;
