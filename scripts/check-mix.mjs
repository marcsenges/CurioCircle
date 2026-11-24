import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const h=readFileSync('index.html','utf8'),catalogue=JSON.parse(readFileSync('questions.json','utf8'));
const groups=JSON.parse(h.match(/const groups=(\[\[.*?\]\]);/)[1]);
const categoryOf=id=>catalogue.questions[id]?.category??groups.findIndex(g=>g.includes(id));
const state={counts:{}};
const mix=new Function('categoryOf','state',h.slice(h.indexOf('function mixQuestions('),h.indexOf('function eligibleQuestionIds('))+';return mixQuestions')(categoryOf,state);
let seed=314159265;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const ids=catalogue.questions.map(q=>q.id),starts=new Set();
assert.equal(ids.length,305);
for(let i=0;i<1000;i++){
 const prev=i%8,deck=mix(ids,prev,random);
 assert.equal(deck.length,305);assert.equal(new Set(deck).size,305);assert.notEqual(categoryOf(deck[0]),prev);
 for(let j=1;j<deck.length;j++)assert.notEqual(categoryOf(deck[j]),categoryOf(deck[j-1]));
 starts.add(deck.slice(0,12).join(','));
}
assert.equal(starts.size,1000);
for(let cat=0;cat<8;cat++){const pool=ids.filter(id=>categoryOf(id)===cat);const deck=mix(pool,cat,random);assert.equal(deck.length,pool.length);assert.equal(new Set(deck).size,pool.length);}
console.log('OK: 1000 randomized complete decks, no adjacent category repeats, no missing IDs, single-category filters work');
