import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {rollup} from 'rollup';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import ts from 'typescript';
const root=path.dirname(fileURLToPath(import.meta.url));
const bundle=await rollup({input:path.join(root,'worker.ts'),plugins:[{name:'local-sources',resolveId(s,importer){if(s.endsWith('?raw')||s.endsWith('.css')||s.endsWith('.svg'))return path.resolve(path.dirname(importer),s);if(s.startsWith('.')&&importer&& !path.extname(s))return path.resolve(path.dirname(importer),s+'.ts');},async load(id){if(id.endsWith('?raw')||id.endsWith('.css')||id.endsWith('.svg'))return 'export default '+JSON.stringify(await fs.readFile(id.replace(/\?raw$/,''),'utf8'));},transform(code,id){if(id.endsWith('.ts'))return {code:ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText,map:null};}},nodeResolve({browser:true,preferBuiltins:false})],onwarn(w){if(w.code!=='CIRCULAR_DEPENDENCY')console.warn(w.message);}});
await fs.mkdir(path.join(root,'../dist'),{recursive:true});await bundle.write({file:path.join(root,'../dist/_worker.js'),format:'es',sourcemap:false});await bundle.close();console.log('Built Pages worker: '+(await fs.stat(path.join(root,'../dist/_worker.js'))).size+' bytes');
