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
      { key: "ctaPrimaryLabel", label: "CTA primaria — testo", type: "text" },
      { key: "ctaPrimaryHref", label: "CTA primaria — link", type: "text" },
      { key: "ctaSecondaryLabel", label: "CTA secondaria — testo", type: "text" },
      { key: "ctaSecondaryHref", label: "CTA secondaria — link", type: "text" },
      {
        key: "stats",
        label: "Statistiche",
        type: "array",
        itemLabel: "Statistica",
        fields: [
          { key: "value", label: "Valore", type: "text" },
          { key: "label", label: "Etichetta", type: "text" },
        ],
      },
    ],
    defaultData: {
      eyebrow: "Crafted Residential Group",
      titleLine1: "Dal terreno",
      titleLine2: "al valore.",
      tagline: "Acquisiamo · Costruiamo · Valorizziamo",
      body: "CRG sviluppa progetti immobiliari residenziali, commerciali e industriali, trasformando aree e fabbricati in spazi moderni, efficienti e sostenibili.",
      ctaPrimaryLabel: "Scopri Palazzo Rue",
      ctaPrimaryHref: "/progetti/palazzo-rue",
      ctaSecondaryLabel: "Prenota un appuntamento",
      ctaSecondaryHref: "/contatti",
      stats: [
        { value: "1", label: "Progetto" },
        { value: "5", label: "Unità" },
        { value: "NZEB", label: "Energetico" },
      ],
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
    blockKey: "palazzo_rue_spotlight",
    pageLabel: "Homepage",
    blockLabel: "Progetto in evidenza",
    fields: [
      { key: "eyebrow", label: "Sopratitolo", type: "text" },
      { key: "titleLine1", label: "Titolo — riga 1", type: "text" },
      { key: "titleLine2", label: "Titolo — riga 2 (accento rosso)", type: "text" },
      { key: "paragraph1", label: "Paragrafo 1", type: "textarea" },
      { key: "paragraph2", label: "Paragrafo 2", type: "textarea" },
      { key: "ctaPrimaryLabel", label: "CTA primaria — testo", type: "text" },
      { key: "ctaPrimaryHref", label: "CTA primaria — link", type: "text" },
      { key: "ctaSecondaryLabel", label: "CTA secondaria — testo", type: "text" },
      { key: "badge", label: "Etichetta (località — anno)", type: "text" },
      {
        key: "specs",
        label: "Dati tecnici",
        type: "array",
        itemLabel: "Dato",
        fields: [
          { key: "value", label: "Valore", type: "text" },
          { key: "label", label: "Etichetta", type: "text" },
        ],
      },
      { key: "availabilityLabel", label: "Etichetta disponibilità", type: "text" },
      { key: "availabilityNote", label: "Nota disponibilità", type: "text" },
    ],
    defaultData: {
      eyebrow: "Progetto in evidenza",
      titleLine1: "Palazzo",
      titleLine2: "Rue",
      paragraph1:
        "Cinque residenze esclusive a Casoria (NA), nate dalla valorizzazione di un palazzo storico. Finiture artigianali su misura, domotica integrata e standard energetici NZEB.",
      paragraph2:
        "L'attico al quinto e sesto piano offre 105 mq interni e un terrazzo panoramico esclusivo da 260 mq — l'unica unità ancora disponibile.",
      ctaPrimaryLabel: "Vedi disponibilità",
      ctaPrimaryHref: "/progetti/palazzo-rue",
      ctaSecondaryLabel: "Richiedi informazioni",
      badge: "Casoria, NA — 2026",
      specs: [
        { value: "5", label: "Unità residenziali" },
        { value: "109", label: "Mq per appartamento" },
        { value: "260", label: "Mq terrazzo attico" },
        { value: "NZEB", label: "Classe energetica" },
      ],
      availabilityLabel: "Attico E05 — Disponibile",
      availabilityNote: "4 su 5 venduti",
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
    ],
    defaultData: {
      brandDescription: "Sviluppo immobiliare residenziale, commerciale e industriale. Trasformiamo aree e fabbricati in spazi moderni, efficienti e sostenibili.",
      address: "Via Traversa Michelangelo, 66 — 80026 Casoria, NA",
      email: "crgsrl2025@gmail.com",
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
];

export function getBlockDefinition(page: string, blockKey: string) {
  return blockDefinitions.find((b) => b.page === page && b.blockKey === blockKey);
}
