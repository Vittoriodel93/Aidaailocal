// AIDA — server per PC / NAS / Docker. Nessuna dipendenza: serve il sito, la funzione AI
// (stessa di Netlify) e un piccolo archivio per sincronizzare memoria e chat tra i dispositivi.
import http from 'node:http';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chat from '../netlify/functions/chat.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WEB = path.resolve(process.env.WEB_DIR || path.join(ROOT, 'web'));
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
const PORT = Number(process.env.PORT || 8080), HOST = process.env.HOST || '0.0.0.0';
const CODE = process.env.ACCESS_CODE || '';
const SYNC_FILE = path.join(DATA_DIR, 'aida-sync.json');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
const SEC = { 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin' };

const send = (res, status, body, type = 'application/json') => { res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', ...SEC }); res.end(typeof body === 'string' ? body : JSON.stringify(body)); };
const readBody = (req, max) => new Promise((ok, ko) => { const c = []; let n = 0; req.on('data', d => { n += d.length; if (n > max) { ko(Object.assign(new Error('troppo grande'), { status: 413 })); req.destroy(); } else c.push(d); }); req.on('end', () => ok(Buffer.concat(c))); req.on('error', ko); });
const clientIp = req => String(req.headers['tailscale-user-login'] || (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '?');
const authorized = req => !CODE || req.headers['x-aida-code'] === CODE;

if (!CODE && (process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY)) console.warn('ATTENZIONE: ci sono chiavi AI ma ACCESS_CODE non è impostato: chiunque raggiunga il server può usarle.');
let store = { updated: 0, data: null };
try { store = JSON.parse(await fs.readFile(SYNC_FILE, 'utf8')); } catch {}
async function saveStore() { await fs.mkdir(DATA_DIR, { recursive: true }); const tmp = SYNC_FILE + '.tmp'; await fs.writeFile(tmp, JSON.stringify(store)); await fs.rename(tmp, SYNC_FILE); }

async function handleChat(req, res, url) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (v !== undefined && !['connection', 'content-length', 'transfer-encoding', 'host'].includes(k)) headers.set(k, Array.isArray(v) ? v.join(',') : v);
  headers.set('x-nf-client-connection-ip', clientIp(req));
  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await readBody(req, 64 * 1024);
  const resp = await chat(new Request('http://localhost' + url, { method: req.method, headers, body }));
  res.writeHead(resp.status, Object.fromEntries(resp.headers));
  if (resp.body) {
    res.on('close', () => { try { resp.body.cancel(); } catch {} });
    try { for await (const chunk of resp.body) res.write(chunk); } catch {}
  }
  res.end();
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/health') return send(res, 200, { ok: true, sync: true, locked: !!CODE, version: '0.8' });
  if (pathname === '/api/sync') {
    if (!authorized(req)) return send(res, 401, { error: 'Codice di accesso errato.' });
    if (req.method === 'GET') return send(res, 200, store);
    if (req.method === 'PUT') {
      let b; try { b = JSON.parse((await readBody(req, 2 * 1024 * 1024)).toString('utf8')); } catch (e) { return send(res, e.status || 400, { error: 'Richiesta non valida.' }); }
      if (typeof b.updated !== 'number' || !b.data || typeof b.data !== 'object' || Array.isArray(b.data)) return send(res, 400, { error: 'Dati non validi.' });
      if (b.updated <= store.updated) return send(res, 409, { error: 'conflitto', updated: store.updated });
      store = { updated: b.updated, data: b.data }; await saveStore();
      return send(res, 200, { updated: store.updated });
    }
    return send(res, 405, { error: 'Metodo non consentito.' });
  }
  return send(res, 404, { error: 'Non trovato.' });
}

async function serveStatic(req, res, pathname) {
  let p; try { p = decodeURIComponent(pathname); } catch { return send(res, 400, 'Richiesta non valida', 'text/plain'); }
  if (p.endsWith('/')) p += 'index.html';
  const file = path.normalize(path.join(WEB, p));
  if (file !== WEB && !file.startsWith(WEB + path.sep)) return send(res, 403, 'Vietato', 'text/plain');
  try {
    const st = await fs.stat(file); if (!st.isFile()) throw 0;
    const ext = path.extname(file).toLowerCase();
    const noCache = ext === '.html' || path.basename(file) === 'sw.js';
    res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'content-length': st.size, 'cache-control': noCache ? 'no-cache' : 'public, max-age=300', ...SEC });
    if (req.method === 'HEAD') return res.end();
    createReadStream(file).pipe(res);
  } catch { send(res, 404, 'Non trovato', 'text/plain'); }
}

http.createServer(async (req, res) => {
  try {
    const url = req.url || '/', pathname = url.split('?')[0];
    if (pathname === '/.netlify/functions/chat') return await handleChat(req, res, url);
    if (pathname.startsWith('/api/')) return await handleApi(req, res, pathname);
    if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, 'Metodo non consentito', 'text/plain');
    return await serveStatic(req, res, pathname);
  } catch (e) { if (!res.headersSent) send(res, e.status || 500, { error: 'Errore del server.' }); else res.end(); }
}).listen(PORT, HOST, () => console.log(`AIDA 0.8 in ascolto su http://${HOST}:${PORT}  (dati: ${DATA_DIR})`));
