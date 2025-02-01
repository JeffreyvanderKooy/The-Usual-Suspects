const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config(); // init dotenv

const controller = require('./pathHandlers.js');

const app = express();
const port = process.env.PORT || 3000; // Render will provide the port in process.env.PORT

// Use body-parser middleware
app.use(bodyParser.json()); // To parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded data (form submissions)

app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGIN,
    credentials: true, // Allow credentials (cookies, headers, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed HTTP methods
  })
);

app.route('/users').get(controller.fetchUsers);
app.route('/raid').get(controller.fetchRaid);
app.route('/login').post(controller.loginUser);
app.route('/register').post(controller.registerUser);
app.route('/bonus').patch(controller.patchBonus);
app
  .route('/reserve')
  .post(controller.reserveItem)
  .delete(controller.deleteItem);

app.listen(port, () => {
  console.log('Site hosting on port: ' + port);
});
