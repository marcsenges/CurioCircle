// Personal milestones only. No networking, identifiers or new storage keys.
const CCAchievements=(()=>{
 const languages=['de','en','es','fr','pt','it'];
 const groups=[
  {id:'answers',levels:[10,25,50,100,250,500],icon:'✦'},
  {id:'distinct',levels:[25,50,100,200,'all'],icon:'◈'},
  {id:'days',levels:[1,5,10,25,50],icon:'☀'},
  {id:'shares',levels:[1,3,5,10],icon:'↗'},
  {id:'favourites',levels:[5,10,25,50],icon:'♥'},
  {id:'categories',levels:[1,3,5,8],icon:'✿'},
  {id:'languages',levels:[2,3,6],icon:'◎'}
 ];
 const copy={
 de:['Meine Erfolge','Nur auf diesem Gerät gespeichert.','Antworten insgesamt','Verschiedene Fragen','Spieltage','Teilen-Aktionen','Favoriten','Erkundete Kategorien','Spielsprachen','Alle Fragen','Nächstes Ziel','Freigeschaltet','Alle Ziele erreicht','Neuer Erfolg!','Erfolge feiern','Mindestens 10 verschiedene beantwortete Fragen pro Kategorie.','Ein Kopieren oder Teilen zählt als Aktion, nicht als erreichte Person.','Sprache zählt erst bei einer beantworteten Frage.','Spieltage zählen ab der ersten Antwort.'],
 en:['My achievements','Stored on this device only.','Answers in total','Different questions','Days played','Sharing actions','Favourites','Categories explored','Languages played','All questions','Next milestone','Unlocked','All milestones reached','New achievement!','Celebrate achievements','At least 10 different questions answered per category.','Copying or sharing counts as an action, not a person reached.','A language counts after an answer in that language.','A play day starts with the first answer.'],
 es:['Mis logros','Solo se guardan en este dispositivo.','Respuestas en total','Preguntas distintas','Días de juego','Acciones para compartir','Favoritas','Categorías exploradas','Idiomas de juego','Todas las preguntas','Próximo objetivo','Desbloqueado','Todos los objetivos alcanzados','¡Nuevo logro!','Celebrar los logros','Al menos 10 preguntas distintas respondidas por categoría.','Copiar o compartir cuenta como una acción, no como una persona alcanzada.','Un idioma cuenta al responder una pregunta en él.','Un día de juego cuenta desde la primera respuesta.'],
 fr:['Mes réussites','Enregistrées uniquement sur cet appareil.','Réponses au total','Questions différentes','Jours de jeu','Actions de partage','Favoris','Catégories explorées','Langues utilisées','Toutes les questions','Prochain objectif','Débloqué','Tous les objectifs atteints','Nouvelle réussite !','Fêter les réussites','Au moins 10 questions différentes avec une réponse par catégorie.','Copier ou partager compte comme une action, pas une personne touchée.','Une langue compte après une réponse dans cette langue.','Un jour de jeu compte dès la première réponse.'],
 pt:['Minhas conquistas','Salvas apenas neste dispositivo.','Respostas no total','Perguntas diferentes','Dias de jogo','Ações de compartilhamento','Favoritas','Categorias exploradas','Idiomas de jogo','Todas as perguntas','Próxima meta','Desbloqueado','Todas as metas alcançadas','Nova conquista!','Celebrar conquistas','Pelo menos 10 perguntas diferentes respondidas por categoria.','Copiar ou compartilhar conta como uma ação, não como uma pessoa alcançada.','Um idioma conta após uma resposta nesse idioma.','Um dia de jogo conta a partir da primeira resposta.'],
 it:['I miei traguardi','Salvati solo su questo dispositivo.','Risposte totali','Domande diverse','Giorni di gioco','Azioni di condivisione','Preferiti','Categorie esplorate','Lingue di gioco','Tutte le domande','Prossimo traguardo','Sbloccato','Tutti i traguardi raggiunti','Nuovo traguardo!','Celebra i traguardi','Almeno 10 domande diverse con una risposta per categoria.','Copiare o condividere conta come azione, non come persona raggiunta.','Una lingua conta dopo una risposta in quella lingua.','Un giorno di gioco conta dalla prima risposta.']
 };
 const keys=new Set(groups.flatMap(g=>g.levels.map(v=>g.id+':'+v)));
 const validCount=n=>Number.isSafeInteger(n)&&n>=0?n:0;
 function normalise(state){
  const old=state.achievements&&typeof state.achievements==='object'?state.achievements:{};
  const clean={version:1,shares:validCount(old.shares),days:[...new Set((Array.isArray(old.days)?old.days:[]).filter(d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)))].slice(-20000),languages:languages.filter(l=>Array.isArray(old.languages)&&old.languages.includes(l)),unlocked:[...new Set((Array.isArray(old.unlocked)?old.unlocked:[]).filter(k=>keys.has(k)))],effects:old.effects!==false};
  state.achievements=clean;return clean
 }
 function metrics(state,size,categoryOf){
  const a=normalise(state),counts=state.counts&&typeof state.counts==='object'?state.counts:{};
  const answered=Object.entries(counts).filter(([k,v])=>/^\d+$/.test(k)&&validCount(v)>0);
  const distinct=answered.map(([k])=>Number(k)).filter(id=>Number.isSafeInteger(id)&&id>=0&&id<size);
  const perCategory=Array(8).fill(0);for(const id of distinct){const c=categoryOf(id);if(Number.isInteger(c)&&c>=0&&c<8)perCategory[c]++}
  return {answers:answered.reduce((sum,[,n])=>Math.min(Number.MAX_SAFE_INTEGER,sum+n),0),distinct:distinct.length,days:a.days.length,shares:a.shares,favourites:new Set((state.fav||[]).filter(id=>Number.isInteger(id)&&id>=0&&(id<size||(state.custom||[]).some(q=>q.id===id)))).size,categories:perCategory.filter(n=>n>=10).length,languages:a.languages.length,perCategory};
 }
 function evaluate(state,size,categoryOf){
  const m=metrics(state,size,categoryOf),a=state.achievements,known=new Set(a.unlocked),added=[];
  for(const g of groups)for(const level of g.levels){const target=level==='all'?size:level,key=g.id+':'+level;if(target>0&&m[g.id]>=target&&!known.has(key)){known.add(key);added.push(key)}}
  a.unlocked=[...known];return {metrics:m,added,unlocked:a.unlocked};
 }
 function answered(state,lang,date=new Date()){
  const a=normalise(state),day=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  if(!a.days.includes(day))a.days.push(day);if(languages.includes(lang)&&!a.languages.includes(lang))a.languages.push(lang)
 }
 function share(state){const a=normalise(state);a.shares=Math.min(Number.MAX_SAFE_INTEGER,a.shares+1)}
 function labels(lang){return copy[lang]||copy.en}
 return {groups,normalise,metrics,evaluate,answered,share,labels,total:keys.size};
})();
