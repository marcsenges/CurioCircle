// Randomized semantic and category-aware deck ordering.
function mixQuestions(ids,history=[],random=Math.random){
 const unique=[...new Set(ids)], recent=Array.isArray(history)?history.slice(-12):[];
 const pool=unique.map(id=>({id,cat:categoryOf(id),family:diversityFamilies[id]??-1,related:new Set(diversityRelated[id]||[]),priority:(state.counts[id]||0)+random()*3}));
 const output=[], catCounts=new Map();
 for(const p of pool)catCounts.set(p.cat,(catCounts.get(p.cat)||0)+1);
 const lastCat=Array(8).fill(-100),lastFamily=Array(11).fill(-100),lastSeen=new Map();
 for(let i=0;i<recent.length;i++){const id=recent[i],at=i-recent.length;lastCat[categoryOf(id)]=at;lastFamily[diversityFamilies[id]??-1]=at;lastSeen.set(id,at)}
 while(pool.length){
  const at=output.length, previous=at?categoryOf(output[at-1]):recent.length?categoryOf(recent[recent.length-1]):-2;
  const otherExists=pool.some(p=>p.cat!==previous);
  let best=-Infinity,chosen=0;
  for(let i=0;i<pool.length;i++){
   const p=pool[i],catGap=at-(lastCat[p.cat]??-100),familyGap=at-(lastFamily[p.family]??-100);
   let closeGap=100;
   for(const id of p.related)if(lastSeen.has(id))closeGap=Math.min(closeGap,at-lastSeen.get(id));
   // Hard priority: prevent adjacent category repeats when any other is available.
   // Prefer at least five intervening questions before a category, and ten before close themes.
   const remaining=pool.length-1,catLeft=catCounts.get(p.cat)-1;
   let feasible=true;for(const [cat,n] of catCounts){const left=n-(cat===p.cat?1:0);if(left>remaining-left+(cat===p.cat?0:1)){feasible=false;break}}
   const score=(otherExists&&p.cat===previous?-100000:0)+(feasible?0:-10000)
      -Math.max(0,11-closeGap)*160-Math.max(0,6-catGap)*35-Math.max(0,4-familyGap)*22
      +Math.min(catGap,10)*2+Math.min(familyGap,8)*1.1+catLeft/Math.max(1,pool.length)*18-p.priority*0.6+random()*14;
   if(score>best){best=score;chosen=i}
  }
  const p=pool.splice(chosen,1)[0];output.push(p.id);lastCat[p.cat]=at;lastFamily[p.family]=at;lastSeen.set(p.id,at);catCounts.set(p.cat,catCounts.get(p.cat)-1);
 }
 return improveMix(output,recent,random)
}

function improveMix(deck,history,random){
 const n=deck.length, prefix=history.slice(-10), cat=deck.map(categoryOf), fam=deck.map(id=>diversityFamilies[id]??-1);
 const related=diversityRelated.map(ids=>new Set(ids));
 function cost(a,b,d){if(a===b)return 50000;
  let c=0;if(related[a]?.has(b)&&d<=10)c+=d<5?4000+(5-d)*1200:150+(11-d)*100;
  if(categoryOf(a)===categoryOf(b)&&d<5)c+=d===1?20000:120*(5-d);
  const f=diversityFamilies[a];if(f!==undefined&&f===diversityFamilies[b]&&d<4)c+=30*(4-d);return c;
 }
 function local(i,j){let v=0;for(const k of [i,j]){for(let t=Math.max(-prefix.length,k-10);t<=Math.min(n-1,k+10);t++){if(t===k||k===j&&t===i)continue;v+=cost(deck[k],t<0?prefix[prefix.length+t]:deck[t],Math.abs(t-k))}}return v}
 // Revisit conflict locations in shuffled order; a swap is accepted only when it reduces total penalty.
 for(let pass=0;pass<7;pass++){
  const bad=[];for(let i=0;i<n;i++){let penalty=0;for(let t=Math.max(-prefix.length,i-10);t<i;t++)penalty+=cost(deck[i],t<0?prefix[prefix.length+t]:deck[t],i-t);if(penalty)bad.push(i)}
  if(!bad.length)break;
  for(let k=bad.length-1;k>0;k--){const j=Math.floor(random()*(k+1));[bad[k],bad[j]]=[bad[j],bad[k]]}
  let changes=0;
  for(const i of bad){let best=0,bestJ=-1;
   const attempts=n<=65?n:Math.min(n,48),offset=Math.floor(random()*n);
   for(let k=0;k<attempts;k++){const j=(offset+k*17)%n;if(i===j)continue;const before=local(i,j);[deck[i],deck[j]]=[deck[j],deck[i]];const gain=before-local(i,j);[deck[i],deck[j]]=[deck[j],deck[i]];if(gain>best){best=gain;bestJ=j}}
   if(bestJ>=0){[deck[i],deck[bestJ]]=[deck[bestJ],deck[i]];changes++}
  }if(!changes)break;
 }return deck
}
