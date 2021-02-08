const mysql = require('mysql');
const config = require('config');
const assert = require('assert');
//
class DbClient {
  constructor(mysqlConfig) {
    this.pool = mysql.createPoolCluster({
      canRetry: true,
      removeNodeErrorCount: 5,
      restoreNodeTimeout: 0,
      defaultSelector: 'RR',
    });
    //
    const {
      host, port, user, password, database, connectionLimit, connectTimeout, acquireTimeout, waitForConnections, charset,
    } = mysqlConfig;
    if (host instanceof Array) {
      for (let i = 0; i < host.length; i++) {
        const hostI = host[i];
        const portI = port[i];
        this.pool.add({
          host: hostI, port: portI, user, password, database, connectionLimit, connectTimeout, acquireTimeout, waitForConnections, charset,
        });
      }
    } else {
      this.pool.add({
        host, port, user, password, database, connectionLimit, connectTimeout, acquireTimeout, waitForConnections, charset,
      });
    }
    //
    this.pool.query = (sql, values, callback) => {
      this.pool.of('*', 'RR').query(sql, values, callback);
    };
  }

  //
  query(sql, values, conn) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-param-reassign
      conn = conn || this.pool;
      conn.query(sql, values, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * @returns {mysql.PoolConnection}
   */
  _getConnection() {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, conn) => {
        if (err) {
          reject(err);
        } else {
          resolve(conn);
        }
      });
    });
  }

  /**
   * @param {mysql.PoolConnection} conn
   */
  _beginTransaction(conn) {
    return new Promise((resolve, reject) => {
      conn.beginTransaction((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * @param {mysql.PoolConnection} conn
   */
  _commit(conn) {
    return new Promise((resolve, reject) => {
      conn.commit((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * @param {mysql.PoolConnection} conn
   */
  _rollback(conn) {
    return new Promise((resolve, reject) => {
      conn.rollback((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * @param {mysql.PoolConnection} conn
   */
  _release(conn) {
    conn.release();
  }

  //
  async queryInTransaction(callback) {
    const conn = await this._getConnection();
    try {
      await this._beginTransaction(conn);
      await callback(conn);
      await this._commit(conn);
    } catch (err) {
      await this._rollback(conn);
      throw err;
    } finally {
      this._release(conn);
    }
  }
}
//
class DbFactory {
  constructor() {
    this._dbClients = {};
  }

  /**
   * @param {string} name service name
   * @returns {DbClient} db client
   */
  client(name) {
    if (!this._dbClients[name]) {
      const mysqlConfig = config[name] && config[name].mysql;
      assert(mysqlConfig, `no mysql config for name: ${name}`);
      this._dbClients[name] = new DbClient(mysqlConfig);
    }
    return this._dbClients[name];
  }
}
//
const dbFactory = new DbFactory();
//
module.exports = dbFactory;
