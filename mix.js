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
 return output
}
