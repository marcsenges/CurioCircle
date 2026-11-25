// Opt-in only, aggregate events. No persistent identifiers, no replay queue.
const CCUsage=(()=>{
 const key='curiocircle-usage-choice-v1';
 const endpoint='https://curiocircle-api.marc-senges-vlc.workers.dev/v1/usage';
 const labels={
 de:['Freiwillige Nutzungsstatistik','Hilf uns, CurioCircle zu verbessern. Nur Tageszähler für Nutzung und Teilen, ohne Nutzer-ID, Namen oder Antworten. Cloudflare verarbeitet technische Verbindungsdaten. Jederzeit deaktivierbar.','Nutzungsstatistik erlauben','Statistik ausschalten'],
 en:['Optional usage statistics','Help us improve CurioCircle. Only daily usage and sharing counts, with no user ID, names or answers. Cloudflare processes technical connection data. Turn off at any time.','Allow usage statistics','Turn off statistics'],
 es:['Estadísticas de uso opcionales','Ayúdanos a mejorar CurioCircle. Solo recuentos diarios de uso y de acciones para compartir, sin ID de usuario, nombres ni respuestas. Cloudflare trata datos técnicos de conexión. Puedes desactivarlas en cualquier momento.','Permitir estadísticas de uso','Desactivar estadísticas'],
 fr:['Statistiques d’utilisation facultatives','Aide-nous à améliorer CurioCircle. Uniquement des compteurs quotidiens d’utilisation et de partage, sans identifiant utilisateur, nom ni réponse. Cloudflare traite des données techniques de connexion. Désactivables à tout moment.','Autoriser les statistiques','Désactiver les statistiques'],
 pt:['Estatísticas de uso opcionais','Ajude a melhorar o CurioCircle. Apenas contagens diárias de uso e compartilhamento, sem ID de usuário, nomes ou respostas. A Cloudflare processa dados técnicos de conexão. Desative quando quiser.','Permitir estatísticas de uso','Desativar estatísticas'],
 it:['Statistiche di utilizzo facoltative','Aiutaci a migliorare CurioCircle. Solo conteggi giornalieri di utilizzo e condivisione, senza ID utente, nomi o risposte. Cloudflare tratta dati tecnici di connessione. Disattivabili in qualsiasi momento.','Consenti le statistiche','Disattiva le statistiche']
 };
 let enabled=false,opened=false,started=false,source='';
 try{enabled=localStorage.getItem(key)==='yes'}catch{}
 try{const url=new URL(location.href),s=url.searchParams.get('src');if(['qr','whatsapp','link','share'].includes(s))source=s;if(url.searchParams.has('src')){url.searchParams.delete('src');history.replaceState(history.state,'',url.href)}}catch{}
 const track=(event,dimension='')=>{
  if(!enabled||!navigator.onLine)return;
  // No retries or offline queue: failed transmissions are deliberately not counted again.
  void fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,dimension}),credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',keepalive:true}).catch(()=>{});
 };
 function open(language){if(!enabled||opened)return;opened=true;track('app_open');track('language',language);if(source)track(source+'_open');source=''}
 function choose(value,language){try{localStorage.setItem(key,value?'yes':'no')}catch{if(value)return false}enabled=value;if(value)open(language);else source='';return enabled}
 function advance(answer){if(!enabled)return;if(!started){started=true;track('round_start')}track(answer?'answer':'skip')}
 function newRound(){started=false}
 function categories(ids){for(const id of ids)if(Number.isInteger(id)&&id>=0&&id<=7)track('category',String(id))}
 return {track,open,choose,advance,newRound,categories,enabled:()=>enabled,copy:language=>labels[language]||labels.en};
})();
