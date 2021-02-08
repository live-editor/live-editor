const { customAlphabet } = require('nanoid');
const db = require('../db');

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_', 8);

const genId = () => nanoid();

async function createDoc(appId, title) {
  const docId = genId();
  const created = new Date();
  const modified = created;
  //
  if (!title) {
    const count = (await db.queryAllDocs(appId)).length;
    // eslint-disable-next-line no-param-reassign
    title = `untitled - ${count + 1}`;
  }
  //
  const doc = {
    appId,
    docId,
    title,
    created,
    modified,
  };
  const newDoc = await db.insertDoc(doc);
  return newDoc;
}

async function getDocs(appId) {
  const docs = await db.queryAllDocs(appId);
  return docs;
}

async function changeDocTitle(appId, docId, title) {
  await db.changeDocTitle(appId, docId, title);
}

module.exports = {
  createDoc,
  getDocs,
  changeDocTitle,
};
