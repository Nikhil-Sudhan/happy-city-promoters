import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolve,dirname } from 'node:path';
const require=createRequire(import.meta.url);
const root=fileURLToPath(new URL('../',import.meta.url));
const vite=resolve(dirname(require.resolve('vite/package.json')),'bin/vite.js');
const children=[['portfolio','5173'],['plot-explorer','5174']].map(([folder,port])=>spawn(process.execPath,[vite,'--host','127.0.0.1','--port',port,'--strictPort'],{cwd:resolve(root,folder),stdio:'inherit',windowsHide:true}));
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;children.forEach(child=>child.kill());process.exitCode=code;}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
children.forEach(child=>{child.on('error',error=>{console.error(error.message);stop(1);});child.on('exit',code=>{if(!stopping)stop(code??1);});});
console.log('\nHappy City websites: http://127.0.0.1:5173 and http://127.0.0.1:5174\nPress Ctrl+C to stop both.\n');
