const dotenv = require('dotenv');

dotenv.config(); // init dotenv

const { server } = require('./src/websocket/websocket');

const port = process.env.PORT || 3000; // Render will provide the port in process.env.PORT
server.listen(port, () => {
  console.log('Site hosting on port: ' + port);
});
