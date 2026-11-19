/*
 * Build-time snapshot of the AEM persisted query results, written to public/data.
 * Used for static hosting (GitHub Pages), where the browser cannot call AEM
 * directly because the Publish service does not send CORS headers.
 *
 * Usage: REACT_APP_HOST_URI=... REACT_APP_GRAPHQL_ENDPOINT=... node scripts/fetch-aem-data.js
 */
const fs = require('fs');
const path = require('path');

const host = process.env.REACT_APP_HOST_URI;
const endpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT;
const outDir = path.join(__dirname, '..', 'public', 'data');

if (!host || !endpoint) {
  console.error('REACT_APP_HOST_URI and REACT_APP_GRAPHQL_ENDPOINT are required');
  process.exit(1);
}

async function run(query, params) {
  const vars = Object.entries(params).map(([k, v]) => `;${k}=${encodeURIComponent(v)}`).join('');
  const url = new URL(`graphql/execute.json/${endpoint}/${query}${vars}`, host).toString();
  const res = await fetch(url);
  const body = await res.json().catch(() => null);
  if (!res.ok || !body || body.errors) {
    throw new Error(`${query} failed (${res.status}): ${JSON.stringify(body?.errors || body)}`);
  }
  return body.data;
}

(async () => {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, 'adventure'), { recursive: true });

  const all = await run('adventures-all', { imageFormat: 'PNG', imageWidth: 480, imageQuality: 80 });
  const items = all?.adventureList?.items || [];
  if (!items.length) throw new Error('adventures-all returned no adventures');
  fs.writeFileSync(path.join(outDir, 'adventures-all.json'), JSON.stringify(all));

  for (const { slug } of items) {
    const data = await run('adventure-by-slug', { slug, imageWidth: 1600, imageQuality: 95 });
    fs.writeFileSync(path.join(outDir, 'adventure', `${slug}.json`), JSON.stringify(data));
  }
  console.log(`Saved ${items.length} adventures to ${outDir}`);
})().catch((e) => { console.error(e); process.exit(1); });
