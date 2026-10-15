import {cp,mkdir,rm} from 'node:fs/promises';
import path from 'node:path';
import './customize.cjs';
// Validate the generated directory before replacing it, so removed assets cannot survive a build.
const output=path.resolve('dist');
if(output!==path.join(process.cwd(),'dist'))throw Error('Invalid build output directory');
await rm(output,{recursive:true,force:true});
await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true});
console.log('Build estático criado em dist/.');
