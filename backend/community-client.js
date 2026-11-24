// Staged community component. Not loaded by the public app until the owner approves activation.
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
 let endpoint='',ready=false,busy=false,lang='en',version='',question=null,root=null,formRoot=null,notice=null,formNotice=null,statusIndex=null,formStatusIndex=null;
 let data={votes:{},suggestion:null};
 try{const x=JSON.parse(localStorage.getItem(STORE));if(x&&x.votes&&typeof x.votes==='object')data=x}catch{}
 const tr=()=>texts[lang]||texts.en;
 const persist=()=>{try{localStorage.setItem(STORE,JSON.stringify(data));return true}catch{return false}};
 const receipt=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
 const el=(tag,txt)=>{const e=document.createElement(tag);if(txt)e.textContent=txt;return e};
 function btn(txt,fn){const b=el('button',txt);b.type='button';b.onclick=fn;return b}
 function say(i,form=false){if(form)formStatusIndex=i;else statusIndex=i;const e=form?formNotice:notice;if(e)e.textContent=tr()[i]||''}
 function render(){
  if(!root||!formRoot)return;
  const t=tr(),r=data.votes[question];
  root.hidden=!ready||!Number.isInteger(question)||question<0||question>=100000;
  formRoot.hidden=!ready;
  root.replaceChildren();formRoot.replaceChildren();
  if(!root.hidden){
   const label=el('p',t[0]);root.append(label);
   const details=el('details'),summary=el('summary',t[7]);details.append(summary);root.append(details);
   const actions=el('div');actions.className='cc-rating-actions';
   for(const [v,i,emoji] of [[1,1,'👍'],[-1,2,'👎']]){
    const b=btn(emoji+' '+t[i],()=>setVote(v));b.setAttribute('aria-pressed',String(r?.vote===v));actions.append(b)
   }
   if(r&&r.vote!==null)actions.append(btn(t[3],()=>setVote(null)));
   root.append(actions);notice=el('p',statusIndex===null?'':t[statusIndex]);notice.setAttribute('role','status');root.append(notice);
  }
  if(!formRoot.hidden){
   const section=el('details');section.append(el('summary',t[4]));
   const label=el('label',t[5]);const area=el('textarea');area.rows=3;area.maxLength=240;area.minLength=12;label.append(area);
   const hint=el('p',t[8]);hint.id='cc-suggestion-hint';hint.style.cssText='font-size:.78rem;line-height:1.45;color:#c4c8c6;margin:5px 0 10px';area.setAttribute('aria-describedby',hint.id);if(data.suggestion)area.value=data.suggestion.text;section.append(label,hint,btn(t[6],()=>submitSuggestion(area.value)),btn(t[17],()=>flush()));
   formNotice=el('p',formStatusIndex===null?'':t[formStatusIndex]);formNotice.setAttribute('role','status');section.append(formNotice);formRoot.append(section);
  }
 }
 async function send(path,payload){
  const response=await fetch(endpoint+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw Error(String(response.status));const out=await response.json();if(!out.ok)throw Error('response');return out;
 }
 async function flush(){
  if(!ready||busy||!navigator.onLine)return;busy=true;
  try{
   for(const [id,r] of Object.entries(data.votes)){
    if(!r.pending)continue;
    const payload={question_id:Number(id),receipt:r.receipt,revision:r.revision,vote:r.vote,language:r.language,app_version:r.app_version};
    try{
     const response=await send('/v1/vote',payload);
     if(data.votes[id]?.revision===payload.revision&&response.revision===payload.revision&&response.vote===payload.vote){data.votes[id].pending=false;persist();if(Number(id)===question)say(payload.vote===null?14:10)}
    }catch{if(Number(id)===question)say(12);break}
   }
   const s=data.suggestion;
   if(s)try{const out=await send('/v1/suggestion',s);if(data.suggestion?.receipt===s.receipt){data.suggestion=null;persist();say(out.status==='duplicate'?13:10,true)}}catch{say(12,true)}
  }finally{busy=false}
 }
 function setVote(v){
  if(!ready||question===null||question>=100000)return;
  const old=data.votes[question];if(old?.vote===v)return;
  const next={receipt:old?.receipt||receipt(),revision:(old?.revision||0)+1,vote:v,language:lang,app_version:version,pending:true};
  data.votes[question]=next;if(!persist()){if(old)data.votes[question]=old;else delete data.votes[question];say(12);return}
  statusIndex=9;render();flush();
 }
 function submitSuggestion(text){
  if(!ready)return;
  text=text.trim();if(text.length<12||text.length>240){say(16,true);return}
  if(data.suggestion&&data.suggestion.text!==text){say(12,true);return}
  const previous=data.suggestion;
  data.suggestion=previous||{receipt:receipt(),language:lang,text};if(!persist()){data.suggestion=previous;say(12,true);return}
  say(9,true);flush();
 }
 async function init(opts){
  // No request unless a reviewed deployment URL is explicitly supplied.
  if(!opts.endpoint||!/^https:\/\/curiocircle-api\.[a-z0-9-]+\.workers\.dev$/.test(opts.endpoint))return false;
  endpoint=opts.endpoint;root=opts.ratingRoot;formRoot=opts.suggestionRoot;
  try{const r=await fetch(endpoint+'/health',{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(8000)});const h=await r.json();ready=r.ok&&h.ok===true&&h.feedback_enabled===true}catch{ready=false}
  if(ready){window.addEventListener('online',flush);render();flush()}
  return ready;
 }
 return {init,render(id,language,appVersion){if(question!==id){statusIndex=null}question=id??null;lang=texts[language]?language:'en';version=appVersion;render()},retry:flush};
})();
