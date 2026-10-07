import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({command,mode})=>{
  const env=loadEnv(mode,process.cwd(),'VITE_');
  return {base:command==='serve'?'/':env.VITE_BASE_PATH||'/plot-explorer/'};
});
