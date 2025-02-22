exports.emitEvent = (event, data) => {
  const { io } = require('../websocket/websocket');
  io.emit(event, data);
};
