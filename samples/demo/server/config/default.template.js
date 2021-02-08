module.exports = {
  appId: '', // your app id
  appSecret: '', // your app secret
  store: {
    use: '',
    mysql: {
      host: 'localhost',
      user: 'root',
      password: 'pass',
      database: 'live-editor-demo',
      connectionLimit: 50,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      waitForConnections: true,
      charset: 'utf8mb4',
    },
  },
};
