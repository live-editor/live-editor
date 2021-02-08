/* eslint-disable global-require */
const config = require('config');

if (config.store && config.store.use === 'mysql') {
  module.exports = require('./mysql');
} else {
  module.exports = require('./nedb');
}
