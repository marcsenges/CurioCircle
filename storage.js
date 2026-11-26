// Local backup boundary. No community receipts or consent are imported.
const CCStorage=(()=>{
 const langs=['en','de','es','fr','pt','it'], maxBackupBytes=5*1024*1024;
 const object=o=>!!o&&typeof o==='object'&&!Array.isArray(o)&&Object.getPrototypeOf(o)===Object.prototype;
 const count=n=>Number.isSafeInteger(n)&&n>=0;
 const id=n=>count(n);
 const fail=()=>{throw Error('Invalid backup')};
 const array=(v,p,max=100000)=>Array.isArray(v)&&v.length<=max&&v.every(p);
 function validateBackup(b){
  if(!object(b)||b.format!==1||!object(b.state))fail();
  const s=b.state;
  if(!langs.includes(s.lang)||!array(s.fav,id)||!object(s.counts)||!Object.entries(s.counts).every(([k,v])=>/^(0|[1-9]\d*)$/.test(k)&&id(Number(k))&&count(v)))fail();
  const custom=s.custom===undefined?[]:s.custom, players=s.players===undefined?[]:s.players;
  if(!array(custom,q=>object(q)&&id(q.id)&&q.id>=100000&&langs.some(k=>typeof q[k]==='string'&&q[k].trim())&&langs.every(k=>q[k]==null||typeof q[k]==='string'&&q[k].length<=240),10000)||new Set(custom.map(q=>q.id)).size!==custom.length)fail();
  if(!array(players,p=>typeof p==='string'&&p.length<=240,240))fail();
  if(s.mode!==undefined&&!['free','everyone','rotate'].includes(s.mode))fail();
  if(s.turn!==undefined&&!count(s.turn))fail();
  if(s.category!==undefined&&(!Number.isInteger(s.category)||s.category< -1||s.category>7))fail();
  if(s.categories!==undefined&&!array(s.categories,c=>Number.isInteger(c)&&c>=0&&c<=7,8))fail();
  if(s.filter!==undefined&&!['all','fav','new'].includes(s.filter))fail();
  if(s.awake!==undefined&&typeof s.awake!=='boolean')fail();
  if(s.achievements!==undefined&&!object(s.achievements))fail();
  const customIds=new Set(custom.map(q=>q.id)),known=n=>n<100000||customIds.has(n);
  if(!s.fav.every(known)||!Object.keys(s.counts).every(k=>known(Number(k))))fail();
  const clean={lang:s.lang,fav:[...new Set(s.fav)],counts:{...s.counts},custom:custom.map(q=>Object.fromEntries([['id',q.id],...langs.filter(k=>typeof q[k]==='string').map(k=>[k,q[k]])])),players:[...players],mode:s.mode??'free',turn:players.length?(s.turn??0)%players.length:0,awake:s.awake===true,category:s.category??-1,filter:s.filter??(s.only===true?'fav':'all')};
  if(s.categories!==undefined)clean.categories=[...new Set(s.categories)];
  if(s.achievements!==undefined)clean.achievements=s.achievements; // Existing achievement normaliser validates individual fields.
  return clean;
 }
 return {validateBackup,maxBackupBytes};
})();
