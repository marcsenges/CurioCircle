import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const h=readFileSync('app.js','utf8'),catalogue=JSON.parse(readFileSync('questions.json','utf8'));
const groups=JSON.parse(h.match(/const groups=(\[\[.*?\]\]);/)[1]);
const categoryOf=id=>catalogue.questions[id]?.category??groups.findIndex(g=>g.includes(id));
const state={counts:{}};
const {mixQuestions,diversityFamilies,diversityRelated}=new Function('categoryOf','state',readFileSync('diversity.js','utf8')+'\n'+readFileSync('mix.js','utf8')+'\nreturn {mixQuestions,diversityFamilies,diversityRelated}')(categoryOf,state);
let seed=314159265;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const ids=catalogue.questions.map(q=>q.id),starts=new Set(),related=diversityRelated.map(x=>new Set(x));
assert.ok(ids.length>=307);assert.equal(diversityFamilies.length,ids.length);assert.equal(diversityRelated.length,ids.length);
assert.ok(diversityFamilies.every(x=>Number.isInteger(x)&&x>=0&&x<11));
for(let id=0;id<ids.length;id++)for(const peer of related[id]){assert.notEqual(id,peer);assert.ok(related[peer]?.has(id))}
let near=0,close=0,total=0,category5=0;
for(let i=0;i<32;i++){
 const deck=mixQuestions(ids,[],random);
 assert.equal(deck.length,ids.length);assert.equal(new Set(deck).size,ids.length);
 for(let j=1;j<deck.length;j++){
  assert.notEqual(categoryOf(deck[j]),categoryOf(deck[j-1]));
  for(let k=Math.max(0,j-10);k<j;k++){if(related[deck[j]].has(deck[k])){near++;if(j-k<5)close++}}
  if(deck.slice(Math.max(0,j-4),j).some(id=>categoryOf(id)===categoryOf(deck[j])))category5++;
  total++;
 }
 starts.add(deck.slice(0,12).join(','));
}
assert.equal(starts.size,32);assert.equal(close,0,'No close semantic repeats within four prior cards');assert.ok(near<=2,'At most two semantic conflicts in 32 complete decks');
assert.ok(category5/total<0.12,'Category mix goal');
for(const cats of [[0],[1,2],[0,2,4],[3,5,6,7],[0,1,2,3,4,5,6,7]]){
 const pool=ids.filter(id=>cats.includes(categoryOf(id))),deck=mixQuestions(pool,[],random);
 assert.equal(deck.length,pool.length);assert.equal(new Set(deck).size,pool.length);assert.ok(deck.every(id=>cats.includes(categoryOf(id))));
}
const empty=mixQuestions([],[],random);assert.deepEqual(empty,[]);
console.log('OK: 32 randomized full decks, '+total+' category transitions, '+near+' related-question pairs within 10 positions, '+close+' within 4, '+(100*category5/total).toFixed(2)+'% category returns within 4 positions; five filter combinations');
