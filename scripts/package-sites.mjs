import { cp, mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const output=resolve(root,'dist');
// Refuse cleanup outside this repository's generated root output directory.
if(dirname(output)!==root||output!==join(root,'dist'))throw Error('Unsafe output directory.');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
await cp(join(root,'portfolio','dist'),output,{recursive:true});
await cp(join(root,'plot-explorer','dist'),join(output,'plot-explorer'),{recursive:true});

// Check the actual deployable HTML references, including the explorer's base path.
for(const page of ['index.html','plot-explorer/index.html']){
  const html=await readFile(join(output,page),'utf8');
  for(const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)/g)){
    const path=match[1];
    if(path==='/'||path.endsWith('/'))continue;
    await stat(join(output,path.slice(1))).catch(()=>{throw Error(`Missing asset in ${page}: ${path}`);});
  }
}
async function checkProductionLinks(directory){
  for(const item of await readdir(directory,{withFileTypes:true})){
    const path=join(directory,item.name);
    if(item.isDirectory())await checkProductionLinks(path);
    else if(/\.(?:html|js)$/.test(item.name)&&/https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?/.test(await readFile(path,'utf8'))){
      throw Error(`Production output contains a localhost URL: ${path}`);
    }
  }
}
await checkProductionLinks(output);
console.log('Vercel output ready: dist/ (portfolio) and dist/plot-explorer/ (3D explorer). Asset and production-link checks passed.');
