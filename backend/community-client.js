// Community beta: explicit submissions only; no accounts or analytics.
const CCCommunity=(()=>{
 const STORE='curiocircle-community-v1';
 const texts={
 de:['Frage bewerten (freiwillig)','Gefällt mir','Gefällt mir nicht','Bewertung entfernen','Neue Frage vorschlagen','Dein Fragenvorschlag','Vorschlag senden','Nur Fragen-ID, Bewertung, Sprache, App-Version und ein zufälliger Schlüssel je Frage werden gesendet. Keine Spielernamen oder Antworten.','Nur für Fragenvorschläge. Bitte keine persönlichen Daten eingeben. Vorschläge werden vor der Veröffentlichung geprüft.','Gespeichert; wird bei Verbindung gesendet.','Vielen Dank!','Noch nicht verfügbar.','Nicht gesendet. Bitte erneut versuchen.','Vorschlag bereits vorhanden.','Bewertung zurückgenommen.','Bewertung ändern','Mindestens 12, höchstens 240 Zeichen.','Ausstehende Übertragungen erneut versuchen'],
 en:['Rate this question (optional)','Like','Dislike','Remove rating','Suggest a question','Your question suggestion','Send suggestion','Only the question ID, rating, language, app version and a random key for this question are sent. No player names or answers.','For question suggestions only. Please do not include personal data. Suggestions are reviewed before publication.','Saved; will send when connected.','Thank you!','Not available yet.','Not sent. Please try again.','Suggestion already received.','Rating removed.','Change rating','12–240 characters.','Retry pending submissions'],
 es:['Valora esta pregunta (opcional)','Me gusta','No me gusta','Retirar valoración','Proponer una pregunta','Tu propuesta de pregunta','Enviar propuesta','Solo se envían el ID de la pregunta, la valoración, el idioma, la versión de la app y una clave aleatoria por pregunta. No se envían nombres ni respuestas.','Solo para sugerir preguntas. No incluyas datos personales. Las propuestas se revisan antes de publicarse.','Guardado; se enviará al recuperar la conexión.','¡Gracias!','Aún no disponible.','No se ha enviado. Inténtalo de nuevo.','Ya hemos recibido esta propuesta.','Valoración retirada.','Cambiar valoración','Entre 12 y 240 caracteres.','Reintentar envíos pendientes'],
 fr:['Évalue cette question (facultatif)','J’aime','Je n’aime pas','Retirer mon avis','Proposer une question','Ta proposition de question','Envoyer la proposition','Seuls l’identifiant de la question, l’avis, la langue, la version de l’application et une clé aléatoire propre à cette question sont transmis. Aucun nom de joueur ni réponse.','Uniquement pour proposer des questions. N’indique pas de données personnelles. Les propositions sont examinées avant publication.','Enregistré ; envoi dès le retour de la connexion.','Merci !','Pas encore disponible.','Envoi impossible. Réessaie.','Cette proposition a déjà été reçue.','Avis retiré.','Modifier mon avis','12 à 240 caractères.','Réessayer les envois en attente'],
 pt:['Avalie esta pergunta (opcional)','Gostei','Não gostei','Retirar avaliação','Sugerir uma pergunta','Sua sugestão de pergunta','Enviar sugestão','Enviamos apenas o ID da pergunta, a avaliação, o idioma, a versão do app e uma chave aleatória por pergunta. Nenhum nome ou resposta de jogador.','Apenas para sugestões de perguntas. Não inclua dados pessoais. As sugestões são analisadas antes da publicação.','Salvo; será enviado quando houver conexão.','Obrigado pelo feedback!','Ainda não disponível.','Não foi enviado. Tente novamente.','Já recebemos esta sugestão.','Avaliação removida.','Alterar avaliação','De 12 a 240 caracteres.','Tentar novamente os envios pendentes'],
 it:['Valuta questa domanda (facoltativo)','Mi piace','Non mi piace','Rimuovi valutazione','Suggerisci una domanda','La tua proposta di domanda','Invia proposta','Vengono inviati solo l’ID della domanda, la valutazione, la lingua, la versione dell’app e una chiave casuale per ogni domanda. Nessun nome o risposta dei giocatori.','Solo per suggerire domande. Non inserire dati personali. Le proposte vengono esaminate prima della pubblicazione.','Salvato; verrà inviato quando tornerà la connessione.','Grazie!','Non ancora disponibile.','Invio non riuscito. Riprova.','Proposta già ricevuta.','Valutazione rimossa.','Modifica valutazione','Da 12 a 240 caratteri.','Riprova gli invii in sospeso']
 };
 const betaPolicy={"de":"Beta-Test: Übermittle nur Testbewertungen und unverfängliche Fragen. Bewertungen und Vorschläge werden von der CurioCircle-Administration ausgewertet. Keine Spielernamen, Antworten oder Favoriten werden übertragen. Cloudflare verarbeitet technische Verbindungsdaten; die Datenbank liegt in der EU. Testdaten können über die Administration gelöscht werden. Der Testlink ist keine Zugangssperre; bitte noch nicht öffentlich verbreiten.","en":"Beta test: submit only test ratings and non-personal questions. Ratings and suggestions are reviewed by the CurioCircle administrators. No player names, answers or favourites are transmitted. Cloudflare processes technical connection data; the database is in the EU. Test data can be deleted by the administrators. This test link is not an access control; please do not share it publicly yet.","es":"Prueba beta: envía solo valoraciones de prueba y preguntas sin datos personales. La administración de CurioCircle revisa las valoraciones y propuestas. No se envían nombres, respuestas ni favoritas. Cloudflare trata datos técnicos de conexión; la base de datos está en la UE. La administración puede borrar los datos de prueba. El enlace no restringe el acceso; no lo compartas públicamente todavía.","fr":"Test bêta : envoie uniquement des avis de test et des questions sans données personnelles. L’administration de CurioCircle examine les avis et propositions. Aucun nom, réponse ou favori n’est transmis. Cloudflare traite des données techniques de connexion ; la base de données est dans l’UE. L’administration peut supprimer les données de test. Ce lien ne restreint pas l’accès ; ne le partage pas publiquement pour le moment.","pt":"Teste beta: envie apenas avaliações de teste e perguntas sem dados pessoais. A administração do CurioCircle analisa as avaliações e sugestões. Nenhum nome, resposta ou favorito é enviado. A Cloudflare processa dados técnicos de conexão; o banco de dados fica na UE. A administração pode excluir os dados de teste. O link não restringe o acesso; não o compartilhe publicamente ainda.","it":"Test beta: invia solo valutazioni di prova e domande senza dati personali. L’amministrazione di CurioCircle esamina valutazioni e proposte. Non vengono inviati nomi, risposte o preferiti. Cloudflare tratta dati tecnici di connessione; il database è nell’UE. L’amministrazione può eliminare i dati di prova. Il link non limita l’accesso; per ora non condividerlo pubblicamente."};
 const extra={
 de:['Ausstehende Sendungen verwerfen','Noch nie übertragene Bewertungen verwerfen? Bereits versuchte Übertragungen bleiben erhalten und können einzeln zurückgenommen werden.','Feedback ist freiwillig. Cloudflare verarbeitet technische Verbindungsdaten. Die Datenbank liegt in der EU. Bewertungen lassen sich mit dem lokalen Schlüssel ändern oder zurücknehmen.','Feedback verwalten','Feedback aktivieren','Übertragung läuft …','Vorschlag nur online senden','Keine ausstehenden Sendungen.'],
 en:['Discard pending submissions','Discard ratings that have never been sent? Ratings with attempted transmissions remain available for individual withdrawal.','Feedback is optional. Cloudflare processes technical connection data. The database is in the EU. Ratings can be changed or withdrawn with the locally stored key.','Manage feedback','Enable feedback','Sending…','Send suggestion online only','No pending submissions.'],
 es:['Descartar envíos pendientes','¿Descartar valoraciones que aún no se han intentado enviar? Las que ya se han intentado enviar se pueden retirar de forma individual.','Las valoraciones son voluntarias. Cloudflare trata datos técnicos de conexión. La base de datos está en la UE. Puedes cambiar o retirar una valoración con la clave guardada en tu dispositivo.','Gestionar valoraciones','Activar valoraciones','Enviando…','Enviar propuestas solo con conexión','No hay envíos pendientes.'],
 fr:['Annuler les envois en attente','Annuler les avis dont l’envoi n’a jamais été tenté ? Les autres restent disponibles et peuvent être retirés individuellement.','Les avis sont facultatifs. Cloudflare traite des données techniques de connexion. La base de données est dans l’UE. La clé conservée sur ton appareil permet de modifier ou retirer tes avis.','Gérer les avis','Activer les avis','Envoi en cours…','Envoyer les propositions uniquement en ligne','Aucun envoi en attente.'],
 pt:['Descartar envios pendentes','Descartar avaliações cujo envio ainda não foi tentado? As demais podem ser retiradas individualmente.','O feedback é opcional. A Cloudflare processa dados técnicos de conexão. O banco de dados fica na UE. Você pode alterar ou retirar avaliações com a chave armazenada no aparelho.','Gerenciar feedback','Ativar feedback','Enviando…','Enviar sugestões somente online','Nenhum envio pendente.'],
 it:['Annulla gli invii in sospeso','Annullare le valutazioni per cui non è ancora stato tentato l’invio? Le altre possono essere ritirate singolarmente.','Il feedback è facoltativo. Cloudflare tratta dati tecnici di connessione. Il database è nell’UE. Puoi modificare o ritirare le valutazioni con la chiave salvata sul dispositivo.','Gestisci feedback','Attiva feedback','Invio in corso…','Invia proposte solo online','Nessun invio in sospeso.']
 };
 let endpoint='',ready=false,busy=false,lang='en',version='',question=null,root=null,formRoot=null,notice=null,formNotice=null,formSection=null,area=null,draft='',statusIndex=null,formStatusIndex=null,retryRequested=false,configured=false;
 let data={votes:{},enabled:false};
 const validRecord=(r)=>r&&typeof r.receipt==='string'&&/^[a-f0-9]{64}$/.test(r.receipt)&&Number.isSafeInteger(r.revision)&&r.revision>=1&&[-1,1,null].includes(r.vote)&&Object.hasOwn(texts,r.language)&&typeof r.app_version==='string';
 try{const x=JSON.parse(localStorage.getItem(STORE));if(x&&x.votes&&typeof x.votes==='object'){data.enabled=x.enabled===true;for(const [id,r] of Object.entries(x.votes))if(/^\d+$/.test(id)&&Number(id)<100000&&validRecord(r))data.votes[id]={...r,pending:r.pending===true,attempted:r.attempted!==false}}}catch{}
 const tr=()=>texts[lang]||texts.en;
 const ex=()=>extra[lang]||extra.en;
 const persist=()=>{try{localStorage.setItem(STORE,JSON.stringify(data));return true}catch{return false}};
 const receipt=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
 const el=(tag,txt)=>{const e=document.createElement(tag);if(txt)e.textContent=txt;return e};
 function btn(txt,fn){const b=el('button',txt);b.type='button';b.onclick=fn;return b}
 function say(i,form=false){if(form)formStatusIndex=i;else statusIndex=i;const e=form?formNotice:notice;if(e)e.textContent=tr()[i]||''}
 function render(){
  if(!root||!formRoot)return;
  const t=tr(),x=ex(),r=data.votes[question],open=formSection?.open||false;
  if(area)draft=area.value;
  root.hidden=!configured||!Number.isInteger(question)||question<0||question>=100000;
  formRoot.hidden=!configured;
  root.replaceChildren();formRoot.replaceChildren();notice=null;formNotice=null;area=null;
  if(!root.hidden){
   const actions=el('div');actions.className='cc-rating-actions';
   for(const [v,i] of [[1,1],[-1,2]]){
    const b=btn('',()=>rate(v));b.className='cc-thumb';b.setAttribute('aria-label',t[i]);b.title=t[i];b.setAttribute('aria-pressed',String(r?.vote===v));
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    const g=document.createElementNS(ns,'g');if(v===-1)g.setAttribute('transform','rotate(180 12 12)');
    for(const d of ['M7 10v10H3V10h4Z','M7 10l4-7a3 3 0 0 1 2 3l-1 4h6a3 3 0 0 1 3 3l-2 5a3 3 0 0 1-3 2H7']){const p=document.createElementNS(ns,'path');p.setAttribute('d',d);g.append(p)}svg.append(g);b.append(svg);actions.append(b)
   }
   root.append(actions);const label=el('p',t[0]);label.className='cc-rating-label';root.append(label);
   if(r&&r.vote!==null){const remove=btn(t[3],()=>setVote(null));remove.className='cc-remove-rating';root.append(remove)}
   notice=el('p',r?.pending?t[9]:(statusIndex===null?'':t[statusIndex]));notice.setAttribute('role','status');root.append(notice);
  }
  if(!formRoot.hidden){
   formSection=el('details');formSection.open=open;formSection.append(el('summary',t[4]));
   const disclosure=el('p',t[7]+' '+x[2]+' '+betaPolicy[lang]);disclosure.className='cc-community-note';formSection.append(disclosure);
   
   const label=el('label',t[5]);area=el('textarea');area.rows=3;area.maxLength=240;area.minLength=12;area.value=draft;label.append(area);
   const hint=el('p',t[8]+' '+x[6]+'.');hint.id='cc-suggestion-hint';hint.className='cc-community-note';area.setAttribute('aria-describedby',hint.id);
   const submit=btn(t[6],()=>suggest(area.value));submit.disabled=busy;
   formSection.append(label,hint,submit,btn(t[17],()=>flush()),btn(x[0],discardPending));
   formNotice=el('p',formStatusIndex===null?'':t[formStatusIndex]);formNotice.setAttribute('role','status');formSection.append(formNotice);formRoot.append(formSection);
  }
 }
 async function send(path,payload){
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
  try{const response=await fetch(endpoint+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});
   if(!response.ok)throw Error(String(response.status));const out=await response.json();if(!out.ok)throw Error('response');return out
  }finally{clearTimeout(timeout)}
 }
 async function check(){
  if(!navigator.onLine)return data.enabled;
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
  try{const r=await fetch(endpoint+'/health',{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});const h=await r.json();return r.ok&&h.ok===true&&h.feedback_enabled===true}catch{return false}finally{clearTimeout(timeout)}
 }
 async function enable(){
  if(!configured)return false;
  ready=await check();
  if(ready){data.enabled=true;if(!persist()){ready=false;data.enabled=false}}
  formStatusIndex=ready?null:11;render();if(ready)flush();return ready
 }
 async function rate(v){
  if(!configured)return;
  const id=question,language=lang;
  if(!ready){if(!confirm(tr()[7]+'\n\n'+betaPolicy[lang]))return;if(!await enable()){say(11);return}}
  if(question===id&&lang===language)setVote(v)
 }
 async function suggest(text){
  if(!configured)return;
  draft=text;
  if(!ready){if(!confirm(tr()[8]+'\n\n'+betaPolicy[lang]))return;if(!await enable()){say(11,true);return}}
  await submitSuggestion(text)
 }
 async function flush(){
  if(!ready||!navigator.onLine)return;if(busy){retryRequested=true;return}busy=true;
  try{
   for(const id of Object.keys(data.votes)){
    const r=data.votes[id];if(!r?.pending)continue;
    if(!r.attempted){r.attempted=true;if(!persist()){r.attempted=false;if(Number(id)===question)say(12);break}}
    const payload={question_id:Number(id),receipt:r.receipt,revision:r.revision,vote:r.vote,language:r.language,app_version:r.app_version};
    try{
     const response=await send('/v1/vote',payload);
     if(data.votes[id]?.revision===payload.revision){
      if(response.revision===payload.revision&&response.vote===payload.vote){data.votes[id]={...r,pending:false,confirmed:{vote:r.vote,revision:r.revision,language:r.language,app_version:r.app_version}};persist();if(Number(id)===question)say(payload.vote===null?14:10)}
      else if(response.revision>payload.revision){data.votes[id]={...r,revision:response.revision,vote:response.vote,pending:false,confirmed:{vote:response.vote,revision:response.revision,language:r.language,app_version:r.app_version}};persist()}
     }else retryRequested=true
    }catch{if(Number(id)===question)say(12);break}
   }
  }finally{busy=false;if(retryRequested){retryRequested=false;void flush()}}
 }
 function setVote(v){
  if(!ready||!Number.isInteger(question)||question<0||question>=100000)return;
  const old=data.votes[question];if(old?.vote===v){if(old.pending)flush();return}
  const next={receipt:old?.receipt||receipt(),revision:(old?.revision||0)+1,vote:v,language:lang,app_version:version,pending:true,attempted:!!(old?.pending&&old?.attempted),confirmed:old?.confirmed||null};
  data.votes[question]=next;if(!persist()){if(old)data.votes[question]=old;else delete data.votes[question];say(12);return}
  statusIndex=9;render();flush()
 }
 function discardPending(){
  if(busy){say(12,true);return}
  if(!Object.values(data.votes).some(r=>r.pending&&!r.attempted)){if(formNotice)formNotice.textContent=ex()[7];return}
  if(!confirm(ex()[1]))return;
  const old=data.votes;const next={};
  for(const [id,r] of Object.entries(old)){if(!r.pending||r.attempted)next[id]=r;else if(r.confirmed)next[id]={...r,...r.confirmed,pending:false,revision:r.revision}}
  data.votes=next;if(!persist()){data.votes=old;say(12,true);return}statusIndex=null;render()
 }
 let suggestionAttempt=null;
 async function submitSuggestion(text){
  if(!ready||busy||!navigator.onLine){say(12,true);return}
  text=text.trim();if(text.length<12||text.length>240){say(16,true);return}
  busy=true;draft=text;if(formNotice)formNotice.textContent=ex()[5];
  try{
   if(!suggestionAttempt||suggestionAttempt.text!==text||suggestionAttempt.language!==lang)suggestionAttempt={receipt:receipt(),language:lang,text};
   const out=await send('/v1/suggestion',suggestionAttempt);suggestionAttempt=null;draft='';if(area)area.value='';say(out.status==='duplicate'?13:10,true)
  }catch{say(12,true)}finally{busy=false;if(retryRequested){retryRequested=false;void flush()}}
 }
 async function init(opts){
  if(!opts.endpoint||!/^https:\/\/curiocircle-api\.[a-z0-9-]+\.workers\.dev$/.test(opts.endpoint))return false;
  endpoint=opts.endpoint;root=opts.ratingRoot;formRoot=opts.suggestionRoot;configured=opts.enabled===true;
  if(!configured)return false;
  render();
  if(data.enabled)ready=await check();
  window.addEventListener('online',async()=>{if(data.enabled){ready=await check();render();if(ready)flush()}});
  render();if(ready)flush();return ready
 }
 return {init,render(id,language,appVersion){const nextId=id??null,nextLang=texts[language]?language:'en';const changed=question!==nextId||lang!==nextLang||version!==appVersion;if(question!==nextId)statusIndex=null;question=nextId;lang=nextLang;version=appVersion;if(changed)render()},retry:flush,summary(){const rows=Object.values(data.votes).map(r=>r.confirmed).filter(r=>r&&r.vote!==null);return {rated:rows.length,positive:rows.filter(r=>r.vote===1).length,negative:rows.filter(r=>r.vote===-1).length,pending:Object.values(data.votes).filter(r=>r.pending).length}}};
})();
