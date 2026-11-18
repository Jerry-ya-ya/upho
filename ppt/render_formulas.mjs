// Render Markdown LaTeX with KaTeX MathML in an isolated local Edge session.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(process.argv[2] || path.join(dir, 'phonon_to_physics_learning.md'));
const { default: katex } = await import(process.env.KATEX_MODULE ? pathToFileURL(process.env.KATEX_MODULE).href : 'katex');
const markdown = (await fs.readFile(source, 'utf8')).replace(/\r\n/g, '\n');
const groups = markdown.split(/^---\s*$/m).filter(s => /<!-- layout: formula -->/.test(s));
const panels = groups.map((s, i) => `<section id="formula-${i + 1}">${[...s.matchAll(/\$\$\n([\s\S]*?)\n\$\$/g)].map(m => katex.renderToString(m[1], {displayMode: true, output: 'mathml', throwOnError: true})).join('')}</section>`);
await fs.mkdir(path.join(dir, '.build'), {recursive: true});
const htmlPath = path.join(dir, '.build/formulas.html');
await fs.writeFile(htmlPath, `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:white}section{box-sizing:border-box;width:1160px;padding:24px 20px;font-size:32px;color:#20242a;background:white}math{margin:22px 0}</style>${panels.join('')}`);
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'upho-ppt-edge-'));
const edge = spawn(process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ['--headless=new', '--disable-gpu', '--no-first-run', '--disable-background-networking', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'],
  { windowsHide: true, stdio: 'ignore' });
let ws;
try {
  let port;
  for (let i = 0; i < 100; i++) {
    try { port = (await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
    catch { await new Promise(r => setTimeout(r, 100)); }
  }
  if (!port) throw new Error('Edge remote debugging did not start');
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  let id = 0; const pending = new Map();
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(Error(JSON.stringify(m.error))) : p.resolve(m.result); } });
  const send = (method, params = {}) => new Promise((resolve, reject) => { pending.set(++id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  await send('Emulation.setDeviceMetricsOverride', {width: 1200, height: 2400, deviceScaleFactor: 2, mobile: false});
  await send('Page.navigate', { url: pathToFileURL(htmlPath).href });
  let result;
  for (let i = 0; i < 50; i++) {
    result = await send('Runtime.evaluate', { expression: `document.readyState === 'complete' && !!document.querySelector('#formula-1')`, returnByValue: true });
    if (result.result.value) break;
    await new Promise(r => setTimeout(r, 100));
  }
  await fs.mkdir(path.join(dir, 'assets'), { recursive: true });
  await send('Runtime.evaluate', {expression: 'document.fonts.ready', awaitPromise: true});
  for (let i = 1; i <= groups.length; i++) {
    const r = await send('Runtime.evaluate', {expression: `(() => { const r = document.getElementById('formula-${i}').getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,scale:1}; })()`, returnByValue: true});
    const shot = await send('Page.captureScreenshot', {format: 'png', captureBeyondViewport: true, clip: r.result.value});
    await fs.writeFile(path.join(dir, 'assets', `formula-${i}.png`), Buffer.from(shot.data, 'base64'));
  }
  console.log(`Rendered ${groups.length} formula panels from Markdown.`);
  await send('Browser.close').catch(() => {});
} finally { ws?.close(); edge.kill(); }
