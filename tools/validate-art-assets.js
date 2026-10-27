#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const manifestPath=path.join(root,'assets/data/art-manifest.json');
const production=process.argv.includes('--production');
const strictFiles=process.argv.includes('--strict-files')||production;
const errors=[],warnings=[];
const allowedTypes=new Set(['character','portrait','enemy','boss','effect','background','ui','building','prop','icon']);
const allowedStatus=new Set(['placeholder','review','approved','deprecated']);
const requiredFields=['id','type','faction','variant','asset','status','sourceOwner','licence','required'];
const forbidden=['final','new','copy','test','capybara','redive','carbot'];
const fileRegex=/^[a-z0-9]+(?:-[a-z0-9]+)*\.(webp|png|svg|json)$/;
function fail(msg){errors.push(msg);}function warn(msg){warnings.push(msg);}
function readJson(file){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){fail(`Invalid JSON: ${path.relative(root,file)}: ${e.message}`);return null;}}
const manifest=readJson(manifestPath);
if(!manifest){finish();}
if(!Array.isArray(manifest.assets))fail('Manifest assets must be an array.');
const ids=new Set(),assetPaths=new Set(),hashes=new Map();
for(const [i,a] of (manifest.assets||[]).entries()){
 const label=`assets[${i}]`;
 for(const f of requiredFields)if(a[f]===undefined||a[f]===null||a[f]==='')fail(`${label} missing ${f}`);
 if(ids.has(a.id))fail(`Duplicate id: ${a.id}`);ids.add(a.id);
 if(!allowedTypes.has(a.type))fail(`${a.id}: invalid type ${a.type}`);
 if(!allowedStatus.has(a.status))fail(`${a.id}: invalid status ${a.status}`);
 if(production&&a.required&&a.status!=='approved')fail(`${a.id}: required production asset is not approved`);
 if(a.sourceOwner!=='project-original')warn(`${a.id}: sourceOwner requires licence review: ${a.sourceOwner}`);
 if(a.licence!=='project-owned')warn(`${a.id}: licence requires review: ${a.licence}`);
 if(typeof a.asset!=='string'||!a.asset.startsWith('assets/art/'))fail(`${a.id}: asset path must start assets/art/`);
 const base=path.basename(a.asset||'');
 if(!fileRegex.test(base))fail(`${a.id}: invalid filename ${base}`);
 const lower=base.toLowerCase();
 if(base!==lower)fail(`${a.id}: filename must be lowercase: ${base}`);
 if(/[ _]/.test(base))fail(`${a.id}: spaces and underscores are forbidden: ${base}`);
 for(const word of forbidden)if(new RegExp(`(^|-)${word}(-|\\.)`).test(lower))fail(`${a.id}: prohibited term '${word}' in ${base}`);
 if(assetPaths.has(a.asset))fail(`Duplicate asset path: ${a.asset}`);assetPaths.add(a.asset);
 const absolute=path.join(root,a.asset);
 if(!fs.existsSync(absolute)){(strictFiles?fail:warn)(`${a.id}: missing file ${a.asset}`);continue;}
 const stat=fs.statSync(absolute);if(!stat.isFile())fail(`${a.id}: asset is not a file`);
 if(stat.size===0)fail(`${a.id}: asset is empty`);
 const hash=crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
 if(hashes.has(hash))fail(`${a.id}: duplicate binary content with ${hashes.get(hash)}`);else hashes.set(hash,a.id);
 if(base.endsWith('.svg')){
  const svg=fs.readFileSync(absolute,'utf8');
  if(/<script\b/i.test(svg))fail(`${a.id}: SVG contains script`);
  if(/(?:href|xlink:href)\s*=\s*["']https?:/i.test(svg))fail(`${a.id}: SVG contains external URL`);
  if(!/viewBox\s*=/.test(svg))fail(`${a.id}: SVG missing viewBox`);
 }
 if(a.metadata){const meta=path.join(root,a.metadata);if(!fs.existsSync(meta))(strictFiles?fail:warn)(`${a.id}: missing metadata ${a.metadata}`);}
 if(a.dimensions){for(const k of ['width','height','maxWidth','maxHeight'])if(a.dimensions[k]!==undefined&&(!Number.isInteger(a.dimensions[k])||a.dimensions[k]<=0))fail(`${a.id}: invalid dimensions.${k}`);}
}
const mandatoryRoles=['defender','assault','ranged','support'];
for(const role of mandatoryRoles)if(!(manifest.assets||[]).some(a=>a.type==='character'&&a.role===role&&a.required))fail(`Missing required squad role: ${role}`);
for(const faction of ['bug','machine']){
 const standard=(manifest.assets||[]).filter(a=>a.type==='enemy'&&a.faction===faction&&a.variant==='standard').length;
 const elite=(manifest.assets||[]).filter(a=>a.type==='enemy'&&a.faction===faction&&a.variant==='elite').length;
 const boss=(manifest.assets||[]).filter(a=>a.type==='boss'&&a.faction===faction).length;
 if(standard<4)fail(`${faction}: requires at least 4 standard enemies`);if(elite<2)fail(`${faction}: requires at least 2 elite enemies`);if(boss<1)fail(`${faction}: requires at least 1 boss`);
}
function walk(dir){if(!fs.existsSync(dir))return[];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const f of walk(path.join(root,'assets/art'))){const rel=path.relative(root,f).replaceAll('\\','/');if(!assetPaths.has(rel))warn(`Unlisted production asset: ${rel}`);}
finish();
function finish(){for(const x of warnings)console.warn(`WARN ${x}`);for(const x of errors)console.error(`ERROR ${x}`);console.log(`Art validation: ${errors.length} error(s), ${warnings.length} warning(s). Mode: ${production?'production':strictFiles?'strict-files':'manifest'}.`);process.exitCode=errors.length?1:0;}
