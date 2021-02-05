const { startServer } = require('live-editor/server');
const path = require('path');

console.log(startServer);

const options = {
  enableFakeTokenApi: true,
  serveStatic: true,
  staticDir: path.resolve('./dist'),
  storage: {
    webhook: {
      enable: true,
      latestVersionDelay: 20,
      // latestVersionURL: 'http://localhost:9000', // push document to search engine
    },
  },
};

console.log(options);

startServer(options);
