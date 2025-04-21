// Emits a websocket event to the frontend
exports.emitEvent = (event, data) => {
  const { io } = require('../websocket/websocket');
  io.emit(event, data);
};
