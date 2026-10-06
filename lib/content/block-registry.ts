export type FieldType = "text" | "textarea";

export interface SimpleField {
  key: string;
  label: string;
  type: FieldType;
}

export interface ArrayField {
  key: string;
  label: string;
  type: "array";
  itemLabel: string;
  fields: SimpleField[];
  /** If set, the array always has exactly this many items — no add/remove/
   * reorder in the admin UI. Used where the public component pairs each
   * item with a fixed icon/animation keyed by array position, so changing
   * the item count would silently break the design. */
  fixedLength?: number;
}

export type FieldSpec = SimpleField | ArrayField;

export interface BlockDefinition {
  page: string;
  blockKey: string;
  pageLabel: string;
  blockLabel: string;
  fields: FieldSpec[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultData: Record<string, any>;
}

export const blockDefinitions: BlockDefinition[] = [
  // ── Homepage ────────────────────────────────────────────────────────────
  {
    page: "home",
    blockKey: "hero",
    pageLabel: "Homepage",
    blockLabel: "Hero",
    fields: [
      { key: "eyebrow", label: "Sopratitolo", type: "text" },
      { key: "titleLine1", label: "Titolo — riga 1", type: "text" },
      { key: "titleLine2", label: "Titolo — riga 2 (accento rosso)", type: "text" },
      { key: "tagline", label: "Sottotitolo maiuscolo", type: "text" },
      { key: "body", label: "Testo descrittivo", type: "textarea" },
      { key: "urgencyText", label: "Testo urgenza (sopra i pulsanti progetti)", type: "text" },
    ],
    defaultData: {
      eyebrow: "Crafted Residential Group",
      titleLine1: "Dal terreno",
      titleLine2: "al valore.",
      tagline: "Acquisiamo · Costruiamo · Valorizziamo",
      body: "CRG sviluppa progetti immobiliari residenziali, commerciali e industriali, trasformando aree e fabbricati in spazi moderni, efficienti e sostenibili.",
      urgencyText: "Le nostre soluzioni abitative si esauriscono rapidamente",
    },
  },
  {
    page: "home",
    blockKey: "what_we_do",
    pageLabel: "Homepage",
    blockLabel: "Cosa facciamo",
    fields: [
      { key: "eyebrow", label: "Sopratitolo", type: "text" },
      { key: "title", label: "Titolo", type: "text" },
      {
        key: "services",
        label: "Servizi",
        type: "array",
        itemLabel: "Servizio",
        fixedLength: 3,
        fields: [
          { key: "number", label: "Numero", type: "text" },
          { key: "title", label: "Titolo", type: "text" },
          { key: "description", label: "Descrizione", type: "textarea" },
        ],
      },
    ],
    defaultData: {
      eyebrow: "Cosa facciamo",
      title: "Sviluppo immobiliare a 360°",
      services: [
        {
          number: "01",
          title: "Acquisto e valorizzazione aree",
          description:
            "Identifichiamo terreni e fabbricati con alto potenziale di sviluppo. Analizziamo ogni opportunità con approccio strategico, valutando localizzazione, normativa urbanistica e rendimento atteso.",
        },
        {
          number: "02",
          title: "Demolizione e ricostruzione",
          description:
            "Gestiamo l'intero ciclo edilizio: demolizione certificata, bonifica del sito, progettazione architettonica e strutturale, direzione lavori e controllo qualità in ogni fase.",
        },
        {
          number: "03",
          title: "Vendita e locazione immobiliare",
          description:
            "Commercializziamo direttamente i nostri sviluppi con assistenza completa. Residenze, uffici e spazi industriali disponibili all'acquisto, in locazione o con formula rent-to-buy.",
        },
      ],
    },
  },
  {
    page: "home",
    blockKey: "why_crg",
    pageLabel: "Homepage",
    blockLabel: "Perché CRG",
    fields: [
      { key: "eyebrow", label: "Sopratitolo", type: "text" },
      { key: "title", label: "Titolo", type: "text" },
      { key: "intro", label: "Testo introduttivo", type: "textarea" },
      {
        key: "features",
        label: "Caratteristiche",
        type: "array",
        itemLabel: "Caratteristica",
        fields: [
          { key: "title", label: "Titolo", type: "text" },
          { key: "description", label: "Descrizione", type: "textarea" },
        ],
      },
    ],
    defaultData: {
      eyebrow: "Perché CRG",
      title: "Il metodo che fa la differenza",
      intro:
        "Non costruiamo solo edifici. Sviluppiamo spazi che rispondono a standard elevati di qualità, sicurezza e sostenibilità, con attenzione costante al dettaglio in ogni fase del processo.",
      features: [
        { title: "Progettazione moderna", description: "Design architettonico contemporaneo in collaborazione con studi qualificati, attento a funzionalità, estetica e integrazione nel contesto urbano." },
        { title: "Strutture antisismiche", description: "Ogni edificio rispetta e supera le normative antisismiche con certificazioni strutturali indipendenti e tecnologie costruttive di ultima generazione." },
        { title: "Materiali d'eccellenza", description: "Fornitori qualificati e materiali certificati dalla struttura portante alle finiture interne. Nessun compromesso sulla qualità." },
        { title: "Efficienza energetica", description: "Classe energetica A e A+ di default. Fotovoltaico, pompe di calore, serramenti ad alte prestazioni e ventilazione meccanica controllata." },
        { title: "Controllo qualità", description: "Direzione lavori con audit continui. Ogni fase del cantiere è documentata e verificata per garantire il rispetto degli standard definiti." },
        { title: "Tempi certi", description: "Cronoprogrammi dettagliati e rispettati. Trasparenza totale su ogni aggiornamento dello stato di avanzamento lavori." },
      ],
    },
  },
  {
    page: "home",
    blockKey: "featured_projects",
    pageLabel: "Homepage",
    blockLabel: "Griglia progetti",
    fields: [
      { key: "eyebrow", label: "Sopratitolo", type: "text" },
      { key: "title", label: "Titolo (usa \\n per andare a capo)", type: "textarea" },
      { key: "tagline", label: "Testo di richiamo (sotto il titolo)", type: "text" },
    ],
    defaultData: {
      eyebrow: "I nostri progetti",
      title: "Sviluppi in corso\ne disponibili",
      tagline: "Clicca sul progetto che preferisci e scegli la tua prossima casa.",
    },
  },
  {
    page: "home",
    blockKey: "final_cta",
    pageLabel: "Homepage",
    blockLabel: "CTA finale",
    fields: [
      { key: "eyebrow", label: "Sopratitolo", type: "text" },
      { key: "title", label: "Titolo", type: "textarea" },
      { key: "body", label: "Testo", type: "textarea" },
      { key: "ctaLabel", label: "Testo pulsante", type: "text" },
    ],
    defaultData: {
      eyebrow: "Inizia ora",
      title: "Stai cercando un immobile o vuoi conoscere i nostri prossimi sviluppi?",
      body: "Il nostro team è disponibile per rispondere a ogni domanda e accompagnarti in ogni fase del processo di acquisto o locazione.",
      ctaLabel: "Prenota un appuntamento",
    },
  },
  {
    page: "home",
    blockKey: "construction_parallax",
    pageLabel: "Homepage",
    blockLabel: "Sequenza cantiere (scroll)",
    fields: [
      {
        key: "phases",
        label: "Fasi",
        type: "array",
        itemLabel: "Fase",
        fixedLength: 6,
        fields: [
          { key: "tag", label: "Etichetta fase", type: "text" },
          { key: "title", label: "Titolo (usa \\n per andare a capo)", type: "text" },
          { key: "sub", label: "Sottotitolo", type: "textarea" },
        ],
      },
    ],
    defaultData: {
      phases: [
        { tag: "01 — Acquisizione", title: "Dal terreno\nalla visione", sub: "Ogni grande progetto inizia con un'analisi attenta del territorio." },
        { tag: "02 — Cantiere", title: "Costruiamo\nvalore", sub: "Demolizione certificata e preparazione del sito con rigore tecnico." },
        { tag: "03 — Fondazioni", title: "Strutture\nantisismiche", sub: "Fondazioni certificate per resistere al tempo e garantire sicurezza." },
        { tag: "04 — Costruzione", title: "Materiali di\nultima generazione", sub: "Selezioniamo solo il meglio per qualità costruttiva duratura." },
        { tag: "05 — Efficienza", title: "Zero\nemissioni", sub: "Classe energetica A+, impianti fotovoltaici e domotica integrata." },
        { tag: "06 — Completamento", title: "Spazi pensati\nper durare", sub: "Residenze moderne, sicure e sostenibili. Costruiamo il futuro." },
      ],
    },
  },

  // ── Chi siamo ───────────────────────────────────────────────────────────
  {
    page: "chi-siamo",
    blockKey: "hero",
    pageLabel: "Chi siamo",
    blockLabel: "Hero",
    fields: [
      { key: "eyebrow", label: "Sopratitolo", type: "text" },
      { key: "titleLine1", label: "Titolo — riga 1", type: "text" },
      { key: "titleAccent", label: "Titolo — riga 2 (accento rosso)", type: "text" },
      { key: "body", label: "Testo", type: "textarea" },
    ],
    defaultData: {
      eyebrow: "Chi siamo",
      titleLine1: "Costruiamo spazi che durano,",
      titleAccent: "con metodo e visione.",
      body: "CRG | Crafted Residential Group nasce con l'obiettivo di trasformare terreni, fabbricati esistenti e aree da valorizzare in progetti immobiliari moderni, funzionali e sostenibili.",
    },
  },
  {
    page: "chi-siamo",
    blockKey: "mission",
    pageLabel: "Chi siamo",
    blockLabel: "Missione",
    fields: [
      { key: "eyebrow", label: "Sopratitolo", type: "text" },
      { key: "title", label: "Titolo (usa \\n per andare a capo)", type: "textarea" },
      { key: "paragraph1", label: "Paragrafo 1", type: "textarea" },
      { key: "paragraph2", label: "Paragrafo 2", type: "textarea" },
      { key: "paragraph3", label: "Paragrafo 3", type: "textarea" },
    ],
    defaultData: {
      eyebrow: "La nostra missione",
      title: "Ogni area ha un potenziale.\nNoi lo trasformiamo in realtà.",
      paragraph1:
        "Seguiamo ogni fase dello sviluppo: analisi dell'area, acquisizione, demolizione, progettazione, costruzione, vendita e locazione. Un processo integrato che ci permette di controllare la qualità in ogni momento.",
      paragraph2:
        "Operiamo nei segmenti residenziale, commerciale e industriale, con la stessa attenzione al dettaglio e lo stesso impegno verso l'eccellenza costruttiva.",
      paragraph3:
        "Il nostro approccio è quello di uno sviluppatore immobiliare che pensa come un investitore: ogni decisione è orientata alla creazione di valore duraturo, per i clienti e per il territorio.",
    },
  },
  {
    page: "chi-siamo",
    blockKey: "values",
    pageLabel: "Chi siamo",
    blockLabel: "I nostri valori",
    fields: [
      { key: "eyebrow", label: "Sopratitolo", type: "text" },
      { key: "title", label: "Titolo", type: "text" },
      {
        key: "items",
        label: "Valori",
        type: "array",
        itemLabel: "Valore",
        fields: [
          { key: "title", label: "Titolo", type: "text" },
          { key: "description", label: "Descrizione", type: "textarea" },
        ],
      },
    ],
    defaultData: {
      eyebrow: "I nostri valori",
      title: "Il fondamento del nostro lavoro",
      items: [
        { title: "Qualità costruttiva", description: "Materiali certificati e tecnologie costruttive all'avanguardia. Il nostro standard qualitativo non ammette compromessi, dalla fondazione all'ultima finitura." },
        { title: "Solidità finanziaria", description: "Strutture finanziarie solide e trasparenti. I nostri investimenti sono pianificati con analisi approfondite del mercato e rendimenti proiettati con rigore." },
        { title: "Sostenibilità", description: "Ogni sviluppo CRG punta alla classe energetica A o superiore, minimizzando l'impatto ambientale e massimizzando l'efficienza operativa." },
        { title: "Trasparenza", description: "Relazione chiara e diretta con clienti e partner. Ogni aggiornamento e ogni decisione progettuale viene comunicata con apertura e puntualità." },
      ],
    },
  },
  {
    page: "chi-siamo",
    blockKey: "process",
    pageLabel: "Chi siamo",
    blockLabel: "Il nostro metodo",
    fields: [
      { key: "eyebrow", label: "Sopratitolo", type: "text" },
      { key: "title", label: "Titolo", type: "text" },
      {
        key: "steps",
        label: "Fasi",
        type: "array",
        itemLabel: "Fase",
        fields: [
          { key: "number", label: "Numero", type: "text" },
          { key: "title", label: "Titolo", type: "text" },
          { key: "description", label: "Descrizione", type: "textarea" },
        ],
      },
    ],
    defaultData: {
      eyebrow: "Il nostro metodo",
      title: "Un processo chiaro, dalla visione alla consegna",
      steps: [
        { number: "01", title: "Analisi e acquisizione", description: "Identifichiamo aree con potenziale inespresso. Valutiamo ogni opportunità con analisi urbanistica, tecnica ed economica prima di procedere." },
        { number: "02", title: "Progettazione", description: "Collaboriamo con studi di architettura e ingegneria qualificati per sviluppare progetti che coniugano estetica, funzionalità e sostenibilità." },
        { number: "03", title: "Realizzazione", description: "Gestiamo l'intero processo costruttivo con squadre qualificate, controllo qualità continuo e rispetto rigoroso dei cronoprogrammi." },
        { number: "04", title: "Commercializzazione", description: "Seguiamo ogni cliente dalla prima visita alla firma del rogito, con assistenza completa e soluzioni personalizzate." },
      ],
    },
  },
  {
    page: "chi-siamo",
    blockKey: "cta",
    pageLabel: "Chi siamo",
    blockLabel: "CTA finale",
    fields: [
      { key: "title", label: "Titolo", type: "text" },
      { key: "body", label: "Testo", type: "textarea" },
      { key: "ctaLabel", label: "Testo pulsante", type: "text" },
    ],
    defaultData: {
      title: "Vuoi conoscerci meglio?",
      body: "Siamo disponibili per un incontro conoscitivo, senza impegno.",
      ctaLabel: "Contattaci",
    },
  },

  // ── Footer (global) ─────────────────────────────────────────────────────
  {
    page: "global",
    blockKey: "company_info",
    pageLabel: "Globale",
    blockLabel: "Dati aziendali (footer + contatti)",
    fields: [
      { key: "brandDescription", label: "Descrizione breve (footer)", type: "textarea" },
      { key: "address", label: "Indirizzo", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Telefono", type: "text" },
      { key: "hoursWeekday", label: "Orari — Lun-Ven", type: "text" },
      { key: "hoursSaturday", label: "Orari — Sabato", type: "text" },
      { key: "legalName", label: "Ragione sociale — compare in footer e Privacy come titolare", type: "text" },
      { key: "legalAddress", label: "Sede legale", type: "text" },
      { key: "vatNumber", label: "Partita IVA e Codice fiscale", type: "text" },
      { key: "rea", label: "Numero REA", type: "text" },
      { key: "shareCapital", label: "Capitale sociale (indicare quello effettivamente versato, art. 2250 c.c.)", type: "text" },
      { key: "pec", label: "PEC", type: "text" },
      { key: "whatsappNumber", label: "Numero WhatsApp (pulsante in homepage; vuoto = pulsante nascosto)", type: "text" },
      { key: "whatsappMessage", label: "Messaggio WhatsApp precompilato", type: "textarea" },
    ],
    defaultData: {
      whatsappNumber: "+39 331 836 4042",
      whatsappMessage:
        "Ciao CRG! 👋\nHo visitato il vostro sito e sono interessato/a all'acquisto di un immobile.\nPotreste darmi qualche informazione in più su disponibilità, prezzi e possibilità di visita?\nGrazie!",
      // From the Registro Imprese extract (visura) of 09/09/2026.
      legalName: "CRG S.R.L.",
      legalAddress: "Traversa Via Michelangelo 66, 80026 Casoria (NA)",
      vatNumber: "10800291212",
      rea: "NA-1132822",
      shareCapital: "€ 10.000,00 (versato € 2.500,00)",
      pec: "crg-srl@pec.it",
      brandDescription: "Sviluppo immobiliare residenziale, commerciale e industriale. Trasformiamo aree e fabbricati in spazi moderni, efficienti e sostenibili.",
      address: "Via Traversa Michelangelo, 66 — 80026 Casoria, NA",
      email: "clienti@crgcostruzioni.it",
      phone: "+39 331 836 4042",
      hoursWeekday: "Lun – Ven: 9:00 – 18:00",
      hoursSaturday: "Sab: 9:00 – 13:00",
    },
  },

  // ── Contatti ────────────────────────────────────────────────────────────
  {
    page: "contatti",
    blockKey: "hero",
    pageLabel: "Contatti",
    blockLabel: "Hero",
    fields: [
      { key: "eyebrow", label: "Sopratitolo", type: "text" },
      { key: "title", label: "Titolo", type: "text" },
      { key: "body", label: "Testo", type: "textarea" },
    ],
    defaultData: {
      eyebrow: "Contatti",
      title: "Siamo qui per te",
      body: "Hai domande su un progetto o vuoi un appuntamento? Scrivici, ti risponderemo entro 24 ore.",
    },
  },
  {
    page: "contatti",
    blockKey: "final_cta",
    pageLabel: "Contatti",
    blockLabel: "CTA finale",
    fields: [
      { key: "title", label: "Titolo", type: "text" },
      { key: "body", label: "Testo", type: "textarea" },
      { key: "ctaLabel", label: "Testo pulsante" , type: "text" },
    ],
    defaultData: {
      title: "Preferisci un appuntamento in sede?",
      body: "Il nostro team commerciale è a tua disposizione per mostrarti i progetti.",
      ctaLabel: "Chiamaci ora",
    },
  },

  // ── Legale ──────────────────────────────────────────────────────────────
  {
    page: "legale",
    blockKey: "privacy",
    pageLabel: "Legale",
    blockLabel: "Informativa privacy (/privacy)",
    fields: [
      { key: "title", label: "Titolo", type: "text" },
      { key: "updatedAt", label: "Ultimo aggiornamento (es. 6 ottobre 2026)", type: "text" },
      { key: "body", label: "Testo (una riga vuota separa i paragrafi; una riga che inizia con ## diventa un titoletto; {titolare}, {indirizzo}, {email} e {pec} vengono sostituiti con i Dati aziendali)", type: "textarea" },
    ],
    defaultData: {
      title: "Informativa sul trattamento dei dati personali",
      updatedAt: "6 ottobre 2026",
      body: [
        "Questa informativa spiega come trattiamo i dati personali che ci lasci attraverso questo sito, ai sensi degli articoli 13 e 14 del Regolamento UE 2016/679 (GDPR) e del Codice in materia di protezione dei dati personali (D.Lgs. 196/2003).",
        "## Titolare del trattamento",
        "{titolare}, {indirizzo}. Per qualsiasi domanda o richiesta sui tuoi dati puoi scrivere a {email}. Non abbiamo nominato un Responsabile della protezione dei dati (DPO), perché per la nostra attività non è obbligatorio.",
        "## Quali dati raccogliamo",
        "Raccogliamo solo i dati che ci dai tu compilando i moduli del sito: nome, cognome, email, telefono, giorno e fascia oraria preferiti per la visita, il messaggio che scegli di scriverci e l'eventuale progetto, unità, box auto o documento a cui sei interessato. Ti chiediamo di non inserire nel messaggio dati particolari (ad esempio sulla salute) che non servono per la tua richiesta.",
        "Il sito non usa strumenti di analisi e non raccoglie dati sulla tua navigazione. I server che ospitano il sito registrano in modo automatico, per motivi di sicurezza, dati tecnici come l'indirizzo IP e l'orario delle richieste; questi registri sono conservati per breve tempo dai nostri fornitori e non vengono usati per identificarti.",
        "## Perché usiamo i tuoi dati e su quale base",
        "Richiesta di appuntamento o di informazioni e richiesta di documenti: per risponderti, organizzare la visita e inviarti ciò che ci hai chiesto. Il trattamento è necessario per dare seguito a una tua richiesta prima di un eventuale contratto (art. 6.1.b GDPR).",
        "Iscrizione \"Avvisami\": per scriverti quando ci sono novità sul progetto che hai scelto (nuove unità, unità tornate disponibili, avanzamento del cantiere). La base è il tuo consenso (art. 6.1.a GDPR), che puoi revocare in qualsiasi momento senza conseguenze, anche solo rispondendo a una nostra email.",
        "Adempimenti di legge e tutela dei nostri diritti: possiamo conservare i dati quando lo richiede la legge o per difenderci in caso di contestazioni (art. 6.1.c e 6.1.f GDPR).",
        "Non usiamo i tuoi dati per decisioni automatizzate né per profilazione, e non li usiamo per finalità di marketing diverse da quelle descritte sopra.",
        "## È obbligatorio darci i dati?",
        "No, ma senza nome, email e consenso alla privacy non possiamo rispondere alla tua richiesta. Telefono, preferenze per la visita e messaggio sono facoltativi.",
        "## Per quanto tempo li conserviamo",
        "Richieste di appuntamento, contatto e documenti: per il tempo necessario a gestirle e, se non ne nasce una trattativa, non oltre 24 mesi dall'ultimo contatto. Se avviamo una trattativa o un contratto, i dati vengono conservati per il tempo previsto dalla legge (ad esempio 10 anni per i documenti contabili e fiscali).",
        "Iscrizioni \"Avvisami\": finché non revochi il consenso o, al più tardi, fino alla conclusione delle vendite del progetto.",
        "## Chi può vedere i tuoi dati",
        "I dati sono trattati dal nostro personale autorizzato e da fornitori tecnici che ci aiutano a far funzionare il sito, nominati responsabili del trattamento: Vercel Inc. (hosting del sito), Supabase Inc. (database, con server nell'Unione Europea, a Francoforte) e Resend (invio delle email di notifica). Non vendiamo né cediamo i tuoi dati a terzi.",
        "Alcuni di questi fornitori hanno sede negli Stati Uniti: in questi casi il trasferimento avviene sulla base del Data Privacy Framework UE-USA o delle Clausole contrattuali standard approvate dalla Commissione europea.",
        "## I tuoi diritti",
        "In qualsiasi momento puoi chiederci di accedere ai tuoi dati, correggerli, cancellarli, limitarne il trattamento, riceverli in un formato leggibile (portabilità), opporti al trattamento e revocare il consenso, senza che questo renda illecito il trattamento fatto prima della revoca. Basta scrivere a {email} oppure via PEC a {pec}: ti rispondiamo entro 30 giorni.",
        "Se ritieni che il trattamento non sia corretto, puoi presentare reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).",
        "## Cookie",
        "Cookie tecnici (sempre attivi, non richiedono consenso): i cookie di sessione che permettono agli amministratori di accedere all'area riservata e il cookie \"crg_cookie_consent\", che ricorda per 6 mesi la scelta che hai fatto nel banner. Non usiamo strumenti di analisi né cookie pubblicitari nostri.",
        "Cookie di terze parti (solo con il tuo consenso): nelle pagine dei progetti mostriamo la posizione del cantiere con una mappa di Google Maps. Caricando la mappa, Google LLC può impostare propri cookie, anche di profilazione, e trattare dati come il tuo indirizzo IP secondo la sua informativa (policies.google.com/privacy). La mappa viene caricata automaticamente solo se premi \"Accetta\" nel banner; se rifiuti o chiudi il banner con la X, vedi un riquadro e puoi caricare la singola mappa con un clic su \"Mostra la mappa\".",
        "Puoi cambiare idea in qualsiasi momento con il link \"Preferenze cookie\" in fondo a ogni pagina, e puoi cancellare o bloccare i cookie dalle impostazioni del tuo browser. Rifiutare i cookie di terze parti non ti impedisce di usare il sito.",
        "I video presenti in alcuni articoli sono incorporati nella modalità a privacy avanzata di YouTube e Vimeo: YouTube può impostare propri cookie solo se avvii la riproduzione del video. I pulsanti di condivisione sui social sono semplici link e non caricano nulla finché non li usi.",
        "## Modifiche a questa informativa",
        "Possiamo aggiornare questa informativa, ad esempio se cambiano i servizi del sito. La data dell'ultimo aggiornamento è indicata in cima alla pagina.",
      ].join("\n\n"),
    },
  },
];

export function getBlockDefinition(page: string, blockKey: string) {
  return blockDefinitions.find((b) => b.page === page && b.blockKey === blockKey);
}
