const mysql = require('../utils/mysql');

const db = mysql.client('store');

const tables = [
  `CREATE TABLE IF NOT EXISTS live_editor_docs (
    id int(11) unsigned NOT NULL AUTO_INCREMENT,
    app_id varchar(50) NOT NULL DEFAULT '',
    doc_id varchar(50) NOT NULL DEFAULT '',
    title varchar(200) NOT NULL DEFAULT '',
    created datetime NOT NULL,
    modified datetime NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY app_docs (app_id, doc_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
];

async function initDb() {
  await db.queryInTransaction(async (conn) => {
    console.log('begin init db ...');
    // eslint-disable-next-line no-restricted-syntax
    for (const table of tables) {
      // eslint-disable-next-line no-await-in-loop
      await db.query(table, [], conn);
    }
    console.log('end init db ...');
  });
}

async function insertDoc(doc) {
  const sql = 'insert into live_editor_docs (app_id, doc_id, title, created, modified) values(?, ?, ?, ?, ?)';
  const {
    appId,
    docId,
    title,
    created,
    modified,
  } = doc;
  const values = [appId, docId, title, new Date(created), new Date(modified)];
  await db.query(sql, values);
  return doc;
}

async function sqlToDocs(conditions, values) {
  const sql = `select app_id as appId, doc_id as docId, title, created, modified from live_editor_docs ${conditions}`;
  const docs = await db.query(sql, values);
  docs.forEach((doc) => {
    const d = doc;
    d.created = new Date(doc.created).valueOf();
    d.modified = new Date(doc.modified).valueOf();
  });
  return docs;
}

async function queryAllDocs(appId) {
  const conditions = 'where app_id=?';
  const values = [appId];
  const docs = await sqlToDocs(conditions, values);
  return docs;
}

async function changeDocTitle(appId, docId, title) {
  const sql = 'update live_editor_docs set title=? where app_id=? and doc_id=?';
  const values = [title, appId, docId];
  await db.query(sql, values);
}

module.exports = {
  initDb,
  insertDoc,
  queryAllDocs,
  changeDocTitle,
};
