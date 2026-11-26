// Localised design and navigation copy; no additional tracking.
const CCDesign=(()=>{const labels={
  "de": {
    "answered": "Beantwortet",
    "settings": "Einstellungen",
    "settingsIntro": "Gestalte dein persönliches Spielerlebnis.",
    "groups": [
      [
        "Spiel",
        "Spielmodus, Spieler & Kategorien"
      ],
      [
        "Meine Fragen",
        "Favoriten & eigene Fragen"
      ],
      [
        "Meine Erfolge",
        "Statistiken & Auszeichnungen"
      ],
      [
        "App",
        "Sprache, Updates & Datensicherung"
      ],
      [
        "Datenschutz & Community",
        "Privatsphäre, Vorschläge & Feedback"
      ]
    ],
    "shareHeadline": "Gemeinsam ist es schöner.",
    "shareIntro": "Mehr Neugier. Mehr Lachen. Mehr gemeinsame Erinnerungen.",
    "qr": "Scannen & mitspielen",
    "shareGoal": "CurioCircle-Botschafter",
    "report": "Unangemessene Frage melden",
    "reportConfirm": "Diese Frage zur redaktionellen Prüfung melden? Nur die Fragen-ID, Sprache, App-Version und ein zufälliger Übertragungsschlüssel werden gesendet. Keine Antworten oder Spielernamen.",
    "contact": "Kontakt zum Projektteam: Nutze das App-Feedback. Vorschläge und Meldungen werden vor einer Veröffentlichung oder Änderung geprüft."
  },
  "en": {
    "answered": "Answered",
    "settings": "Settings",
    "settingsIntro": "Make the game your own.",
    "groups": [
      [
        "Game",
        "Game mode, players & categories"
      ],
      [
        "My questions",
        "Favourites & your own questions"
      ],
      [
        "My achievements",
        "Statistics & milestones"
      ],
      [
        "App",
        "Language, updates & backup"
      ],
      [
        "Privacy & community",
        "Privacy, suggestions & feedback"
      ]
    ],
    "shareHeadline": "Better together.",
    "shareIntro": "More curiosity. More laughter. More shared memories.",
    "qr": "Scan & play",
    "shareGoal": "CurioCircle ambassador",
    "report": "Report inappropriate question",
    "reportConfirm": "Report this question for editorial review? Only the question ID, language, app version and a random submission key are sent. No answers or player names.",
    "contact": "Contact the project team via app feedback. Suggestions and reports are reviewed before publication or changes."
  },
  "es": {
    "answered": "Respondida",
    "settings": "Ajustes",
    "settingsIntro": "Personaliza tu experiencia de juego.",
    "groups": [
      [
        "Juego",
        "Modo, jugadores y categorías"
      ],
      [
        "Mis preguntas",
        "Favoritas y preguntas propias"
      ],
      [
        "Mis logros",
        "Estadísticas y logros"
      ],
      [
        "App",
        "Idioma, actualizaciones y copias de seguridad"
      ],
      [
        "Privacidad y comunidad",
        "Privacidad, propuestas y comentarios"
      ]
    ],
    "shareHeadline": "Juntos es mejor.",
    "shareIntro": "Más curiosidad, más risas y más recuerdos juntos.",
    "qr": "Escanea y juega",
    "shareGoal": "Embajador de CurioCircle",
    "report": "Denunciar pregunta inapropiada",
    "reportConfirm": "¿Quieres enviar esta pregunta para que la revisemos? Solo se envían el ID de la pregunta, el idioma, la versión de la app y una clave aleatoria de envío. No se envían respuestas ni nombres de jugadores.",
    "contact": "Contacta con el equipo del proyecto a través de los comentarios sobre la app. Revisamos las propuestas y los avisos antes de publicar o modificar preguntas."
  },
  "fr": {
    "answered": "Répondu",
    "settings": "Paramètres",
    "settingsIntro": "Personnalise ton expérience de jeu.",
    "groups": [
      [
        "Jeu",
        "Mode, joueurs et catégories"
      ],
      [
        "Mes questions",
        "Favoris et questions personnelles"
      ],
      [
        "Mes réussites",
        "Statistiques et objectifs"
      ],
      [
        "Application",
        "Langue, mises à jour et sauvegarde"
      ],
      [
        "Confidentialité et communauté",
        "Confidentialité, suggestions et avis"
      ]
    ],
    "shareHeadline": "C’est mieux ensemble.",
    "shareIntro": "Plus de curiosité, de rires et de souvenirs partagés.",
    "qr": "Scanne et joue",
    "shareGoal": "Ambassadeur CurioCircle",
    "report": "Signaler une question inappropriée",
    "reportConfirm": "Signaler cette question pour examen ? Seuls son identifiant, la langue, la version de l’application et une clé d’envoi aléatoire sont transmis. Aucun nom de joueur ni réponse.",
    "contact": "Contacte l’équipe via les avis sur l’application. Les suggestions et signalements sont examinés avant publication ou modification."
  },
  "pt": {
    "answered": "Respondida",
    "settings": "Configurações",
    "settingsIntro": "Personalize sua experiência de jogo.",
    "groups": [
      [
        "Jogo",
        "Modo, jogadores e categorias"
      ],
      [
        "Minhas perguntas",
        "Favoritas e perguntas próprias"
      ],
      [
        "Minhas conquistas",
        "Estatísticas e conquistas"
      ],
      [
        "App",
        "Idioma, atualizações e backup"
      ],
      [
        "Privacidade e comunidade",
        "Privacidade, sugestões e feedback"
      ]
    ],
    "shareHeadline": "Juntos é melhor.",
    "shareIntro": "Mais curiosidade, risadas e memórias compartilhadas.",
    "qr": "Escaneie e jogue",
    "shareGoal": "Embaixador do CurioCircle",
    "report": "Denunciar pergunta inadequada",
    "reportConfirm": "Denunciar esta pergunta para revisão? Enviamos apenas o ID da pergunta, o idioma, a versão do app e uma chave aleatória de envio. Nenhuma resposta ou nome de jogador.",
    "contact": "Entre em contato com a equipe pelo feedback do app. Sugestões e denúncias são revisadas antes de publicações ou alterações."
  },
  "it": {
    "answered": "Risposto",
    "settings": "Impostazioni",
    "settingsIntro": "Personalizza la tua esperienza di gioco.",
    "groups": [
      [
        "Gioco",
        "Modalità, giocatori e categorie"
      ],
      [
        "Le mie domande",
        "Preferiti e domande personali"
      ],
      [
        "I miei traguardi",
        "Statistiche e traguardi"
      ],
      [
        "App",
        "Lingua, aggiornamenti e backup"
      ],
      [
        "Privacy e community",
        "Privacy, proposte e feedback"
      ]
    ],
    "shareHeadline": "Insieme è più bello.",
    "shareIntro": "Più curiosità, risate e ricordi condivisi.",
    "qr": "Scansiona e gioca",
    "shareGoal": "Ambasciatore CurioCircle",
    "report": "Segnala una domanda inappropriata",
    "reportConfirm": "Segnalare questa domanda per una revisione? Inviamo solo l’ID della domanda, la lingua, la versione dell’app e una chiave casuale di invio. Nessuna risposta o nome dei giocatori.",
    "contact": "Contatta il team tramite il feedback sull’app. Le proposte e le segnalazioni vengono esaminate prima di pubblicazioni o modifiche."
  }
};return {copy:language=>labels[language]||labels.en}})();
