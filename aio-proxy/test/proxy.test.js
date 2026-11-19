const assert = require('assert');
const { main } = require('../actions/proxy');

const base = { AEM_HOST: process.env.AEM_HOST || 'https://example.invalid', ALLOWED_ORIGINS: 'https://ok.example' };
const req = (o) => main({ ...base, __ow_method: 'get', __ow_headers: { origin: 'https://ok.example' }, ...o });

(async () => {
  let r = await req({ __ow_method: 'options', __ow_path: '/graphql/execute.json/a/b' });
  assert.equal(r.statusCode, 204);
  assert.equal(r.headers['Access-Control-Allow-Origin'], 'https://ok.example');

  r = await req({ __ow_method: 'options', __ow_headers: { origin: 'https://evil.example' }, __ow_path: '/graphql/execute.json/a/b' });
  assert.equal(r.statusCode, 204);
  assert.equal(r.headers['Access-Control-Allow-Origin'], undefined);

  r = await req({ __ow_path: '/content/dam/secret' });
  assert.equal(r.statusCode, 403);
  r = await req({ __ow_path: '/graphql/execute.json/../../etc' });
  assert.equal(r.statusCode, 403);
  r = await req({ __ow_method: 'post', __ow_path: '/graphql/execute.json/a/b' });
  assert.equal(r.statusCode, 405);

  if (process.env.AEM_HOST) {
    r = await req({ __ow_path: '/graphql/execute.json/wknd-shared/adventures-all' });
    assert.equal(r.statusCode, 200);
    assert.ok(JSON.parse(r.body).data.adventureList.items.length > 0);
    assert.equal(r.headers['Access-Control-Allow-Origin'], 'https://ok.example');
    console.log('live AEM check ok');
  }
  console.log('all tests passed');
})().catch((e) => { console.error(e); process.exit(1); });
