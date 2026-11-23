import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// The readable Markdown is the sole source of slide text, tables and notes.
const dir = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(process.argv[2] || path.join(dir, 'phonon_to_physics_learning.md'));
const output = path.resolve(process.argv[3] || path.join(dir, 'phonon_to_physics_learning.pptx'));
const runtime = process.env.ARTIFACT_NODE_MODULES;
if (runtime) process.env.RUNTIME_NODE_MODULES ??= runtime;
const api = runtime ? pathToFileURL(path.join(runtime, '@oai/artifact-tool/dist/artifact_tool.mjs')).href : '@oai/artifact-tool';
const { Presentation, PresentationFile } = await import(api);
const build = path.join(dir, '.build');
await fs.mkdir(build, { recursive: true });
await fs.mkdir(path.dirname(output), { recursive: true });
const font = 'Microsoft JhengHei';
const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const markdown = (await fs.readFile(source, 'utf8')).replace(/\r\n/g, '\n');
const parts = markdown.split(/^---\s*$/m).filter(s => s.trim());
const tableSlides = [];
let formulaIndex = 0;
function text(slide, value, x, y, w, h, size = 26, bold = false) {
  const shape = slide.shapes.add({ geometry: 'textbox', position: { left: x, top: y, width: w, height: h }, fill: 'none', line: { fill: 'none', width: 0 } });
  shape.text = value;
  shape.text.style = { typeface: font, fontSize: size, bold, color: '#20242a' };
  return shape;
}
async function picture(slide, item, box) {
  const imagePath = path.resolve(path.dirname(source), item.src);
  const bytes = await fs.readFile(imagePath);
  const gif = bytes.toString('ascii', 0, 3) === 'GIF';
  if (!gif && bytes.toString('ascii', 1, 4) !== 'PNG') throw new Error(`Expected PNG or GIF: ${imagePath}`);
  const iw = gif ? bytes.readUInt16LE(6) : bytes.readUInt32BE(16), ih = gif ? bytes.readUInt16LE(8) : bytes.readUInt32BE(20);
  const scale = Math.min(box.width / iw, box.height / ih);
  slide.images.add({ blob: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), contentType: gif ? 'image/gif' : 'image/png', alt: item.alt,
    position: { left: box.left + (box.width - iw * scale) / 2, top: box.top + (box.height - ih * scale) / 2, width: iw * scale, height: ih * scale } });
}
for (const [index, part] of parts.entries()) {
  const notes = part.match(/::: notes\n([\s\S]*?)\n:::/)?.[1]?.trim() || '';
  const body = part.replace(/::: notes\n[\s\S]*?\n:::/g, '');
  const title = body.match(/^# (.+)$/m)?.[1];
  const layout = body.match(/<!-- layout: (\w+) -->/)?.[1];
  if (!title || !['cover', 'image', 'table', 'pair', 'spectrum', 'formula', 'annotated', 'image_table', 'pair_split', 'pair_tall', 'dispersion', 'diagram', 'text'].includes(layout)) throw new Error(`Missing title/layout on slide ${index + 1}`);
  const images = [...body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map(m => ({ alt: m[1], src: m[2] }));
  const prose = body.replace(/\$\$\n[\s\S]*?\n\$\$/g, '').split('\n').filter(l => l.trim() && !/^(# |<!--|!\[|\|)/.test(l));
  const slide = presentation.slides.add(); slide.background.fill = '#ffffff';
  const latex = [...body.matchAll(/\$\$\n([\s\S]*?)\n\$\$/g)].map(m => m[1]).join('\n\n');
  slide.speakerNotes.text = notes + (latex ? '\n\nLaTeX：\n' + latex : '');
  text(slide, String(index + 1), 1200, 679, 42, 25, 16);
  if (layout === 'cover') {
    text(slide, title, 65, 100, 1150, 95, 54, true);
    text(slide, prose.slice(0, 2).join('\n'), 70, 220, 1100, 100, 30);
    text(slide, prose.slice(2).join('\n'), 70, 410, images.length ? 800 : 1140, 160, 43, true);
    if(images.length){
      await picture(slide, images[0], {left:930,top:350,width:245,height:245});
      text(slide,'掃碼開啟互動網頁',920,600,300,35,23);
      text(slide,'jerry-ya-ya.github.io/upho/#home',850,642,365,28,18);
    }
    continue;
  }
  text(slide, title, 48, 27, 1184, 72, title.length > 48 ? 34 : 40, true);
  if (layout === 'pair_tall') {
    for(const [j,item] of images.entries()){
      text(slide,item.alt,50+j*610,115,575,40,27,true);
      await picture(slide,item,{left:40+j*620,top:160,width:580,height:435});
    }
    text(slide,prose.join('\n'),55,608,1150,65,23);
  } else if (layout === 'dispersion') {
    await picture(slide, images[0], {left: 50, top: 115, width: 650, height: 280});
    const sections=prose.join('\n').split('===');
    text(slide, sections[0].trim(), 740, 125, 490, 300, 26);
    text(slide, sections[1].trim(), 65, 445, 1150, 200, 26);
  } else if (layout === 'diagram') {
    await picture(slide, images[0], {left: 40, top: 110, width: 1200, height: 550});
  } else if (layout === 'annotated') {
    if (images.length !== 1) throw Error('Annotated formula needs one image');
    await picture(slide, images[0], {left: 45, top: 112, width: 1190, height: 545});
  } else if (layout === 'formula') {
    await picture(slide, {src: `assets/formula-${++formulaIndex}.png`, alt: latex}, {left: 55, top: 120, width: 1170, height: 300});
    text(slide, prose.join('\n'), 65, 470, 1150, 175, 26);
  } else if (layout === 'text') {
    text(slide, prose.map((line, i) => line + (i % 2 ? '\n' : '')).join('\n'), 65, 145, 1150, 490, 28);
  } else if (layout === 'table' || layout === 'image_table') {
    const combined = layout === 'image_table';
    if (combined) await picture(slide, images[0], {left: 60, top: 100, width: 1160, height: 300});
    const values = body.split('\n').filter(l => l.startsWith('|') && !/^\|[\s:|-]+\|$/.test(l)).map(l => l.split('|').slice(1, -1).map(s => s.trim()));
    if (!values.length || values.some(r => r.length !== values[0].length)) throw new Error('Invalid Markdown table');
    const table = slide.tables.add({ rows: values.length, columns: values[0].length, left: 60, top: combined ? 405 : 160, width: 1160, height: combined ? 210 : 320, columnWidths: [280, 610, 270], values });
    table.borders.assign({ fill: '#b5bbc2', width: 1, style: 'solid' });
    for (let r = 0; r < values.length; r++) for (let c = 0; c < values[r].length; c++) {
      const cell = table.getCell(r, c); cell.fill = r ? '#ffffff' : '#e8edf1';
      cell.text.style = { typeface: font, fontSize: combined ? 23 : 27, bold: r === 0, color: '#20242a' };
    }
    text(slide, prose.join('\n'), 60, combined ? 630 : 540, 1160, combined ? 40 : 100, combined ? 20 : 26);
    tableSlides.push(index + 1);
  } else if (layout === 'pair' || layout === 'pair_split') {
    if (images.length !== 2) throw new Error('Pair layout needs two images');
    for (const [j, item] of images.entries()) {
      text(slide, item.alt, 50 + j * 610, 145, 575, 58, 25, true);
      await picture(slide, item, { left: 40 + j * 620, top: 215, width: 580, height: 235 });
    }
    if (layout === 'pair_split') {
      const columns=prose.join('\n').split('===');
      if(columns.length!==2) throw Error('pair_split requires === between descriptions');
      text(slide, columns[0].trim(), 55, 485, 560, 175, 23);
      text(slide, columns[1].trim(), 675, 485, 550, 175, 23);
    } else text(slide, prose.join('\n'), 55, 490, 1170, 165, 26);
  } else {
    if (images.length !== 1) throw new Error('Image layout needs one image');
    await picture(slide, images[0], { left: 50, top: 100, width: 1180, height: layout === 'spectrum' ? 530 : 425 });
    text(slide, prose.join('\n'), 55, layout === 'spectrum' ? 638 : 550, 1160, layout === 'spectrum' ? 38 : 100, layout === 'spectrum' ? 22 : 27);
  }
}
await (await PresentationFile.exportPptx(presentation)).save(path.join(build, 'candidate.pptx'));
for (const [i, slide] of presentation.slides.items.entries()) {
  const png = await presentation.export({ slide, format: 'png', scale: 1 });
  await fs.writeFile(path.join(build, `slide-${String(i + 1).padStart(2, '0')}.png`), new Uint8Array(await png.arrayBuffer()));
}
if (process.env.PRESENTATIONS_SKILL_DIR) {
  const skill = process.env.PRESENTATIONS_SKILL_DIR;
  const { finalizePresentation } = await import(pathToFileURL(path.join(skill, 'container_tools/artifact_tool_utils.mjs')).href);
  const checkedDir = await fs.mkdtemp(path.join(build, 'validated-'));
  const checkedOutput = path.join(checkedDir, path.basename(output));
  await finalizePresentation({ workspaceDir: dir, candidatePath: path.join(build, 'candidate.pptx'), finalPath: checkedOutput,
    pythonExecutable: process.env.ARTIFACT_PYTHON || 'python',
    integrityValidatorPath: path.join(skill, 'container_tools/inspect_presentation_package_integrity.py'),
    layoutValidatorPath: path.join(skill, 'container_tools/inspect_presentation_layout_geometry.py'),
    layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-heading-fit', ...tableSlides.flatMap(n => ['--require-native-table-slide', String(n)])],
    explicitTotalSlideCount: parts.length, requiredNativeTableOwnerSlides: tableSlides,
    fontPolicy: { basis: 'design', families: [font] }, verifyArtifactToolImport: true,
    receiptPath: path.join(build, `${path.basename(checkedDir)}.validation.json`) });
  await fs.copyFile(checkedOutput, output, (await import('node:fs')).constants.COPYFILE_EXCL);
} else {
  // Never silently overwrite manual edits to an existing presentation.
  await fs.copyFile(path.join(build, 'candidate.pptx'), output, (await import('node:fs')).constants.COPYFILE_EXCL);
}
console.log(`Exported ${parts.length} slides to ${output}`);
