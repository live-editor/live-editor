const { startServer } = require('live-editor/server');
const path = require('path');

console.log(startServer);

// ref: node_modules/live-editor/config/server.json
const options = {
  enableFakeTokenApi: true,
  serveStatic: true,
  staticDir: path.resolve('./dist'),
};

console.log(options);

startServer(options);
