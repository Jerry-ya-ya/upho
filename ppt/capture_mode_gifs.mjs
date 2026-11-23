import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(path.join(process.env.ARTIFACT_NODE_MODULES,'package.json'));
const {chromium}=require('playwright');
const root=path.resolve(dir,'../reference/src');
const output=path.join(dir,'.build/mode-frames');await fs.mkdir(output,{recursive:true});
const server=http.createServer(async(req,res)=>{try{const p=path.resolve(root,'.'+req.url.split('?')[0]);if(!p.startsWith(root+path.sep))throw Error('path');let data=await fs.readFile(p);if(p.endsWith('modes.js'))data=Buffer.from(data.toString().replace(/\r\n/g,'\n').replace('      updatePlayback();\n    })();',`      updatePlayback();
      window.captureModeFrame = (index,phase) => {
        playing=false; updatePlayback();
        const data=normalModes(0.15)[index];
        drawChain(modes[index],data,0.15,phase/data.frequency);
        const original=modes[index].context.canvas;
        const result=document.createElement('canvas');result.width=720;result.height=160;
        const ctx=result.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,720,160);ctx.translate(0,160);ctx.rotate(-Math.PI/2);ctx.drawImage(original,0,0);
        return result.toDataURL('image/png').split(',')[1];
      };
    })();`));res.setHeader('Content-Type',({'.js':'text/javascript','.json':'application/json','.css':'text/css','.html':'text/html; charset=utf-8'})[path.extname(p)]||'application/octet-stream');res.end(data);}catch(e){res.statusCode=404;res.end(String(e));}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/pages/modes/modes.html?lang=zh-Hant`);await page.waitForFunction(()=>!!window.captureModeFrame);await page.evaluate(()=>document.fonts.ready);
for(const [index,mode] of ['acoustic','optical'].entries())for(let i=0;i<60;i++){const data=await page.evaluate(({index,i})=>window.captureModeFrame(index,i/60*2*Math.PI),{index,i});await fs.writeFile(path.join(output,`${mode}-${String(i).padStart(3,'0')}.png`),Buffer.from(data,'base64'));}
console.log('Captured 60 frames per mode at qa/pi = 0.15, independently normalized cycle.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}

execFileSync(process.env.ARTIFACT_PYTHON || 'python', [path.join(dir, 'encode_mode_gifs.py')], {stdio:'inherit'});
