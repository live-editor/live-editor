const Datastore = require('nedb');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const util = require('util');

// in query selector, should not starts with number.
const dataPath = path.join(os.homedir(), 'editor-data');
fs.ensureDirSync(dataPath);

const db = new Datastore({ filename: path.join(dataPath, 'docs.db') });

async function initDb() {
  await util.promisify(db.loadDatabase).bind(db)();
}

async function insertDoc(doc) {
  const newDoc = await util.promisify(db.insert).bind(db)(doc);
  return newDoc;
}

async function queryAllDocs(appId) {
  const docs = await util.promisify(db.find).bind(db)({
    appId,
  });
  return docs;
}

async function changeDocTitle(appId, docId, title) {
  await util.promisify(db.update).bind(db)({ appId, docId }, { $set: { title } }, {});
}

module.exports = {
  initDb,
  insertDoc,
  queryAllDocs,
  changeDocTitle,
};
