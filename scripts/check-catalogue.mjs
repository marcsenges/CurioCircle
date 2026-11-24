// No external dependencies. Run from the repository root: node scripts/check-catalogue.mjs
// Add --write to regenerate the offline snapshot from questions.json.
import {readFileSync,writeFileSync} from 'node:fs';
const langs=['en','de','es','fr','pt','it'];
const catalogue=JSON.parse(readFileSync('questions.json','utf8'));
const loc=readFileSync('localisation.js','utf8');
const marker='const bundledCatalogue=';
const split=loc.indexOf(marker);
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
assert(split>=0,'Missing offline snapshot marker');
assert(Number.isInteger(catalogue.version)&&catalogue.version>0,'Invalid catalogue version');
assert(/^\d{4}-\d{2}-\d{2}$/.test(catalogue.published)&&Number.isFinite(Date.parse(catalogue.published+'T00:00:00Z')),'Invalid publication date');
assert(Array.isArray(catalogue.questions)&&catalogue.questions.length>=305,'Catalogue must preserve existing questions');
const previous=JSON.parse(loc.slice(split+marker.length).trim().replace(/;$/,''));
assert(catalogue.version>=previous.version,'Catalogue version regressed');
assert(catalogue.questions.length>=previous.questions.length,'Questions removed');
const groups=[[0,2,6,9,13,17,19,35,38,40,44,47,62,67,71,84,88,98],[1,5,14,23,30,42,61,66,76,79,92],[3,8,11,15,20,25,29,32,34,37,45,49,53,57,60,73,77,81,87,90,96],[4,7,10,12,16,18,21,24,26,27,31,33,39,46,50,55,58,59,64,69,74,75,85,89,95,97],[36,43,48,51,54,56,63,65,72,80,83,86,93,94],[22,28,41,52,68,70,78,82,91,99]];
for(const [i,q] of catalogue.questions.entries()){
 assert(q.id===i,'Invalid or non-sequential ID '+i);
 const cat=q.category??(i<100?groups.findIndex(g=>g.includes(i)):-1);
 assert(Number.isInteger(cat)&&cat>=0&&cat<8,'Invalid category '+i);
 for(const k of langs)assert(typeof q[k]==='string'&&q[k].trim(),'Missing translation '+i+' '+k);
}
for(const k of langs){
 const seen=new Set();
 for(const q of catalogue.questions){const v=q[k].trim().normalize('NFC').toLocaleLowerCase(k);assert(!seen.has(v),'Exact duplicate in '+k+' at '+q.id);seen.add(v)}
}
if(JSON.stringify(catalogue.questions)!==JSON.stringify(previous.questions)){
 assert(catalogue.version>previous.version,'Changed questions require a catalogue version bump');
 for(const [i,q] of previous.questions.entries())assert(catalogue.questions[i]?.id===q.id,'Existing ID changed '+i);
}
const generated=loc.slice(0,split)+marker+JSON.stringify(catalogue)+';\n';
if(process.argv.includes('--write'))writeFileSync('localisation.js',generated);
else assert(JSON.stringify(previous)===JSON.stringify(catalogue),'Offline snapshot differs: run with --write');
console.log('OK: '+catalogue.questions.length+' questions, '+catalogue.questions.length*langs.length+' translations, catalogue v'+catalogue.version);
