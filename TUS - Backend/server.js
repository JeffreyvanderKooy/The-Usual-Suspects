const dotenv = require('dotenv');

dotenv.config(); // init dotenv

const app = require('./app');

const port = process.env.PORT || 3000; // Render will provide the port in process.env.PORT
app.listen(port, () => {
  console.log('Site hosting on port: ' + port);
});
