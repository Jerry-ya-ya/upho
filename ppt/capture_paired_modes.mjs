import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const require=createRequire(path.join(process.env.ARTIFACT_NODE_MODULES,'package.json'));
const {chromium}=require('playwright');
const root=path.resolve('reference/src'), output=path.resolve('ppt/.build/paired-frames');
await fs.mkdir(output,{recursive:true});
const server=http.createServer(async(req,res)=>{try{
 const p=path.resolve(root,'.'+req.url.split('?')[0]);if(!p.startsWith(root+path.sep))throw Error('path');
 let bytes=await fs.readFile(p);
 if(p.endsWith('modes.js'))bytes=Buffer.from(bytes.toString().replace(/\r\n/g,'\n').replace('      updatePlayback();\n    })();',`      updatePlayback();
 window.capturePair=(index,time)=>{
   playing=false;updatePlayback();selectWavevector(.22);elapsed=time;renderChains();
   const curve=document.querySelector('#'+modes[index].name+'-k');
   const chain=modes[index].context.canvas;
   const result={};
   for(const kind of ['combined','curve','chain']){
     const c=document.createElement('canvas');c.width=720;c.height=kind==='combined'?540:kind==='curve'?360:160;
     const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,c.width,c.height);
     if(kind==='combined'){x.drawImage(curve,0,0);x.drawImage(chain,0,380);}
     else x.drawImage(kind==='curve'?curve:chain,0,0);
     result[kind]=c.toDataURL('image/png').split(',')[1];
   }
   return result;
 };
    })();`));
 res.setHeader('Content-Type',({'.js':'text/javascript','.json':'application/json','.css':'text/css','.html':'text/html; charset=utf-8'})[path.extname(p)]||'application/octet-stream');res.end(bytes);
}catch(e){res.statusCode=404;res.end(String(e));}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:1000}});
 await page.goto(`http://127.0.0.1:${server.address().port}/pages/modes/modes.html?lang=zh-Hant`);
 await page.waitForFunction(()=>!!window.capturePair);await page.evaluate(()=>document.fonts.ready);
 for(const [index,mode] of ['acoustic','optical'].entries())for(let frame=0;frame<120;frame++){
  const frames=await page.evaluate(({index,frame})=>window.capturePair(index,frame*.2),{index,frame});
  for(const [kind,data] of Object.entries(frames))await fs.writeFile(path.join(output,`${mode}-${kind}-${String(frame).padStart(3,'0')}.png`),Buffer.from(data,'base64'));
 }
 await page.locator('.bz-path svg').screenshot({path:'ppt/assets/bz-path-v007.png'});
 await page.goto('file:///'+path.resolve('ppt/assets/upho-formula-flow-v007.html').replaceAll('\\','/'));
 await page.locator('.flow').screenshot({path:'ppt/assets/upho-formula-flow-v007.png'});
}finally{await browser?.close();await new Promise(r=>server.close(r));}
execFileSync(process.env.ARTIFACT_PYTHON,['ppt/encode_paired_modes.py'],{stdio:'inherit'});
