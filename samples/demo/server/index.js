// eslint-disable-next-line import/no-unresolved
const EncryptJWT = require('jose/jwt/encrypt').default;
const config = require('config');
const Koa = require('koa');
const koaStatic = require('koa-static');
const path = require('path');
const Router = require('koa-router');
const koaBody = require('koa-body');
const assert = require('assert');
const docs = require('./docs');
const db = require('./db');

const app = new Koa();

const env = process.env.NODE_ENV;
console.log(env);

function getAppId(ctx) {
  return config.appId;
}

async function getAppSecret(ctx) {
  return config.appSecret;
}

async function getAccessToken(ctx, docId, permission, userId) {
  const appId = getAppId(ctx);
  const data = {
    userId,
    docId,
    appId,
    permission,
  };

  const appSecret = await getAppSecret(ctx);
  const key = Buffer.from(appSecret, 'hex');

  const accessToken = await new EncryptJWT(data)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .encrypt(key);

  return accessToken;
}

const staticPath = path.join(__dirname, '../web/dist');
app.use(koaStatic(staticPath, {
  maxAge: 60 * 60 * 1000 * 24 * 7,
  setHeaders: (res, url) => {
    if (url.endsWith('.html') || env === 'development') {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

// function

const router = new Router({
  prefix: '/api/demo',
});
//
router.use(koaBody({ multipart: true }));

router.get('/docs', async (ctx) => {
  const appId = getAppId(ctx);
  const ret = await docs.getDocs(appId);
  ctx.body = ret;
});

router.post('/docs', async (ctx) => {
  const appId = getAppId(ctx);
  const ret = await docs.createDoc(appId, ctx.request.body?.title || '');
  ctx.body = ret;
});

router.put('/docs/:docId', async (ctx) => {
  const appId = getAppId(ctx);
  const title = ctx.request.body.title;
  if (!title) {
    throw new Error('invalid title');
  }
  await docs.changeDocTitle(appId, ctx.params.docId, title);
  ctx.body = {};
});

// anyone can edit document (share document)
router.get('/token/:docId/:userId', async (ctx) => {
  const ret = await getAccessToken(ctx, ctx.params.docId, 'w', ctx.params.userId);
  ctx.body = ret;
});

router.get('/meta', async (ctx) => {
  assert(config.appId);
  ctx.body = {
    appId: config.appId,
  };
});

async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.status = 400;
    ctx.body = { error: err.message };
  }
}

app.use(errorHandler);

app.use(router.routes()).use(router.allowedMethods());

db.initDb().then(() => {
  app.listen(9002);
});
