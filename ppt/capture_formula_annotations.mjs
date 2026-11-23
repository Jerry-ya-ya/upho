import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const runtime=process.env.ARTIFACT_NODE_MODULES;
const require=createRequire(runtime ? path.join(runtime,'package.json') : import.meta.url);
const {chromium}=require('playwright');
const root=path.resolve(dir,'../reference/src');
const output=path.resolve(process.argv[2]||path.join(dir,'assets/annotated'));
await fs.mkdir(output,{recursive:true});
const server=http.createServer(async(req,res)=>{try{const p=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!p.startsWith(root+path.sep))throw Error('path');res.setHeader('Content-Type',({'.js':'text/javascript','.json':'application/json','.html':'text/html; charset=utf-8','.css':'text/css'})[path.extname(p)]||'application/octet-stream');res.end(await fs.readFile(p));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.EDGE_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1500,height:1200},deviceScaleFactor:2});
 await page.goto(`http://127.0.0.1:${server.address().port}/pages/formulas/formulas.html?lang=zh-Hant`);
 await page.waitForSelector('.all-parameters');
 await page.addStyleTag({content:`main{width:1240px!important;max-width:none!important}.cards{display:block}.card{width:1200px;box-sizing:border-box}.equation{background:white;border:0;padding:0}.annotated-formula{width:1160px;background:white;margin:0;padding:8px 0}.parameter-callout{min-height:0!important;padding:10px 0!important;font-family:'Microsoft JhengHei',sans-serif}.all-parameters-visible .parameter-label{font-size:20px!important;line-height:1.5;padding:10px;max-width:none}.math-scroll{font-size:30px;padding:45px 12px;overflow:visible}.parameter-lines path{stroke-width:1.5}.selected-parameter{background:transparent}`});
 for(const button of await page.locator('.all-parameters').all())await button.click();
 await page.evaluate(()=>document.fonts.ready);
 const blocks=await page.locator('.annotated-formula').all();
 const meta=[];
 for(const [i,block] of blocks.entries()){
  await block.scrollIntoViewIfNeeded();
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await block.evaluate(el => {
    const formula=el.querySelector('annotation').textContent;
    for(const label of el.querySelectorAll('.parameter-label')) {
      if(label.textContent.startsWith('x：')) label.textContent=formula.includes('L_')?'x：頻率與模態本徵頻率之差。':'x：原子位置向量。';
      if(label.textContent.startsWith('w：') && !formula.includes('dagger')) label.textContent='w：模態投影或分解的權重。';
    }
  });
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const info=await block.evaluate(el=>({width:el.offsetWidth,height:el.offsetHeight,labels:el.querySelectorAll('.parameter-label').length,formula:el.querySelector('annotation').textContent,overflow:el.querySelector('math').getBoundingClientRect().width>el.offsetWidth}));
  if(info.overflow)throw Error('Formula overflows: '+i);
  await block.screenshot({path:path.join(output,`formula-${i+1}.png`)});meta.push(info);
 }
 await fs.writeFile(path.join(output,'panels.json'),JSON.stringify(meta,null,2)+'\n');console.log(`Captured ${meta.length} annotated formulas: `+meta.map(x=>x.height).join(','));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
