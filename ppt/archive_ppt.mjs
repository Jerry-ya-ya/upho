// Archive an existing PPTX without changing its bytes; render a matching PDF.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const dir = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(process.argv[2] || '');
if (!process.argv[2] || path.extname(source).toLowerCase() !== '.pptx') throw Error('Usage: node ppt/archive_ppt.mjs input.pptx [vNNN]');
const versions = path.join(dir, 'versions');
await fs.mkdir(versions, { recursive: true });
const existing = (await fs.readdir(versions)).filter(x => /^v\d+$/.test(x));
const version = process.argv[3] || `v${String(Math.max(0, ...existing.map(x => +x.slice(1))) + 1).padStart(3, '0')}`;
if (!/^v\d{3,}$/.test(version)) throw Error('Version must be vNNN');
const target = path.join(versions, version);
try { await fs.access(target); throw Error('Version already exists: ' + target); } catch (e) { if (e.code !== 'ENOENT') throw e; }
const runtime = process.env.ARTIFACT_NODE_MODULES;
if (runtime) process.env.RUNTIME_NODE_MODULES ??= runtime;
const { PresentationFile, FileBlob } = await import(runtime ? pathToFileURL(path.join(runtime, '@oai/artifact-tool/dist/artifact_tool.mjs')).href : '@oai/artifact-tool');
const bytes = await fs.readFile(source);
const hash = data => createHash('sha256').update(data).digest('hex');
const deck = await PresentationFile.importPptx(await FileBlob.load(source));
await fs.mkdir(path.join(dir, '.build'), { recursive: true });
const staging = await fs.mkdtemp(path.join(dir, '.build', 'archive-'));
const renders = path.join(staging, 'renders'); await fs.mkdir(renders);
for (const [i, slide] of deck.slides.items.entries()) {
  const png = await deck.export({ slide, format: 'png', scale: 1.5 });
  await fs.writeFile(path.join(renders, `slide-${String(i + 1).padStart(3, '0')}.png`), new Uint8Array(await png.arrayBuffer()));
}
const stem = `phonon_to_physics_learning_${version}`;
execFileSync(process.env.ARTIFACT_PYTHON || 'python', [path.join(dir, 'export_pdf.py'), renders, path.join(staging, stem + '.pdf')], { stdio: 'inherit' });
// Publish only after both rendering and PDF validation succeed.
await fs.mkdir(target);
await fs.copyFile(source, path.join(target, stem + '.pptx'));
await fs.copyFile(path.join(staging, stem + '.pdf'), path.join(target, stem + '.pdf'));
if (hash(await fs.readFile(path.join(target, stem + '.pptx'))) !== hash(bytes)) throw Error('Archived PPTX checksum mismatch');
await fs.writeFile(path.join(target, 'manifest.json'), JSON.stringify({ version, originalName: path.basename(source), slides: deck.slides.items.length, sha256: hash(bytes), pdf: stem + '.pdf', pdfRendering: 'Artifact Tool, 1.5x raster pages; text is not selectable', archivedAt: new Date().toISOString() }, null, 2) + '\n');
// Never remove an input changed by another process during the render.
if (hash(await fs.readFile(source)) !== hash(bytes)) throw Error('Source changed; kept source');
await fs.unlink(source);
console.log(`Archived ${version}: ${target}; previews: ${renders}`);
