// Capture the existing HTML canvases; does not redraw the scientific figures.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
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
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Page.navigate', { url: pathToFileURL(path.resolve(dir, '../reference/src/phonon_modes.html')).href });
  let result;
  for (let i = 0; i < 50; i++) {
    result = await send('Runtime.evaluate', { expression: `document.readyState === 'complete' && !!document.querySelector('#optical-k')`, returnByValue: true });
    if (result.result.value) break;
    await new Promise(r => setTimeout(r, 100));
  }
  await fs.mkdir(path.join(dir, 'assets'), { recursive: true });
  for (const name of ['acoustic-chain', 'optical-chain', 'dispersion-chart', 'acoustic-k', 'optical-k']) {
    const r = await send('Runtime.evaluate', { expression: `document.getElementById('${name}').toDataURL('image/png')`, returnByValue: true });
    await fs.writeFile(path.join(dir, 'assets', `${name}.png`), Buffer.from(r.result.value.split(',')[1], 'base64'));
  }
  console.log('Captured five reference canvases at qa/pi = 0.22, fixed initial time.');
  await send('Browser.close').catch(() => {});
} finally { ws?.close(); edge.kill(); }
