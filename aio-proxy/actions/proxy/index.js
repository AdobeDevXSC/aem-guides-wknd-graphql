/*
 * Adobe I/O Runtime web action: a read-only CORS proxy for AEM Publish persisted queries.
 *
 * Browser -> https://<namespace>.adobeioruntime.net/api/v1/web/aem-proxy/proxy/graphql/execute.json/<config>/<query>
 *         -> ${AEM_HOST}/graphql/execute.json/<config>/<query>
 *
 * Only GET/HEAD/OPTIONS for /graphql/execute.json/ paths are forwarded, and only
 * browsers on ALLOWED_ORIGINS get CORS headers.
 */
const ALLOWED_PREFIX = '/graphql/execute.json/';

function corsHeaders(origin, allowed) {
  if (!origin || !allowed.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

async function main(params) {
  const allowed = (params.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
  const host = (params.AEM_HOST || '').replace(/\/+$/, '');
  const headers = params.__ow_headers || {};
  const method = (params.__ow_method || 'get').toUpperCase();
  const cors = corsHeaders(headers.origin, allowed);

  if (!host) return { statusCode: 500, headers: cors, body: { error: 'AEM_HOST is not configured' } };
  if (method === 'OPTIONS') return { statusCode: 204, headers: cors };
  if (method !== 'GET' && method !== 'HEAD') {
    return { statusCode: 405, headers: cors, body: { error: 'Method not allowed' } };
  }

  const path = params.__ow_path || '';
  if (!path.startsWith(ALLOWED_PREFIX) || path.includes('..')) {
    return { statusCode: 403, headers: cors, body: { error: 'Path not allowed' } };
  }

  const url = host + path + (params.__ow_query ? `?${params.__ow_query}` : '');
  try {
    const res = await fetch(url, { method, headers: { Accept: 'application/json' } });
    const out = { ...cors, 'Content-Type': res.headers.get('content-type') || 'application/json' };
    const cc = res.headers.get('cache-control');
    if (cc) out['Cache-Control'] = cc;
    return { statusCode: res.status, headers: out, body: method === 'HEAD' ? '' : await res.text() };
  } catch (e) {
    return { statusCode: 502, headers: cors, body: { error: 'Upstream request failed' } };
  }
}

exports.main = main;
