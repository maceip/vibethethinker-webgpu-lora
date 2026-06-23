import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
const CHROME = process.env.CHROME_PATH || (existsSync('/usr/local/bin/google-chrome') ? '/usr/local/bin/google-chrome' : '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary');
const b = await chromium.launch({ executablePath: CHROME, headless:false, args:['--enable-unsafe-webgpu','--enable-features=WebGPU','--use-angle=metal','--no-first-run'] });
const p = await b.newPage(); const L=[];
p.on('console',m=>{const t=m.text(); if(t.startsWith('VWG')){L.push(t);console.log(t);}});
p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,200)));
await p.goto('http://localhost:8013/test/prefdiff.html');
const t0=Date.now(); while(Date.now()-t0<240000){ if(L.some(l=>l.includes('VWG DONE')||l.includes('VWG ERROR')))break; await p.waitForTimeout(500);} await b.close();
