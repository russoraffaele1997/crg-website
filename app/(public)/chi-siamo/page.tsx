import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi siamo — CRG | Crafted Residential Group",
  description:
    "CRG nasce con l'obiettivo di trasformare terreni e fabbricati in progetti immobiliari moderni, funzionali e sostenibili. Scopri la nostra storia e il nostro metodo.",
};

const values = [
  {
    title: "Qualità costruttiva",
    description:
      "Materiali certificati e tecnologie costruttive all'avanguardia. Il nostro standard qualitativo non ammette compromessi, dalla fondazione all'ultima finitura.",
  },
  {
    title: "Solidità finanziaria",
    description:
      "Strutture finanziarie solide e trasparenti. I nostri investimenti sono pianificati con analisi approfondite del mercato e rendimenti proiettati con rigore.",
  },
  {
    title: "Sostenibilità",
    description:
      "Ogni sviluppo CRG punta alla classe energetica A o superiore, minimizzando l'impatto ambientale e massimizzando l'efficienza operativa.",
  },
  {
    title: "Trasparenza",
    description:
      "Relazione chiara e diretta con clienti e partner. Ogni aggiornamento e ogni decisione progettuale viene comunicata con apertura e puntualità.",
  },
];

const steps = [
  {
    number: "01",
    title: "Analisi e acquisizione",
    description:
      "Identifichiamo aree con potenziale inespresso. Valutiamo ogni opportunità con analisi urbanistica, tecnica ed economica prima di procedere.",
  },
  {
    number: "02",
    title: "Progettazione",
    description:
      "Collaboriamo con studi di architettura e ingegneria qualificati per sviluppare progetti che coniugano estetica, funzionalità e sostenibilità.",
  },
  {
    number: "03",
    title: "Realizzazione",
    description:
      "Gestiamo l'intero processo costruttivo con squadre qualificate, controllo qualità continuo e rispetto rigoroso dei cronoprogrammi.",
  },
  {
    number: "04",
    title: "Commercializzazione",
    description:
      "Seguiamo ogni cliente dalla prima visita alla firma del rogito, con assistenza completa e soluzioni personalizzate.",
  },
];

export default function ChiSiamoPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-40 pb-24 bg-charcoal">
        <div className="container-custom">
          <span className="section-label block mb-6">Chi siamo</span>
          <h1 className="section-title-light max-w-3xl leading-[1.08] mb-8">
            Costruiamo spazi che durano,<br />
            <span className="text-crg-red">con metodo e visione.</span>
          </h1>
          <p className="font-sans text-base text-white/40 max-w-2xl leading-relaxed">
            CRG | Crafted Residential Group nasce con l&rsquo;obiettivo di trasformare
            terreni, fabbricati esistenti e aree da valorizzare in progetti
            immobiliari moderni, funzionali e sostenibili.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-cream">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="aspect-[4/5] bg-gradient-to-br from-stone-200 to-stone-400 relative overflow-hidden">
                <div className="absolute inset-4 border border-charcoal/10" />
                <div className="absolute top-8 left-8">
                  <div className="w-12 h-1 bg-crg-red mb-2" />
                  <div className="w-6 h-1 bg-crg-red/40" />
                </div>
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="font-heading font-bold text-6xl text-white/20">CRG</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <span className="section-label block mb-4">La nostra missione</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-6 leading-tight">
                Ogni area ha un potenziale.<br />Noi lo trasformiamo in realtà.
              </h2>
              <div className="space-y-4 font-sans text-[15px] text-mid-gray leading-relaxed">
                <p>
                  Seguiamo ogni fase dello sviluppo: analisi dell&rsquo;area,
                  acquisizione, demolizione, progettazione, costruzione, vendita
                  e locazione. Un processo integrato che ci permette di
                  controllare la qualità in ogni momento.
                </p>
                <p>
                  Operiamo nei segmenti residenziale, commerciale e industriale,
                  con la stessa attenzione al dettaglio e lo stesso impegno
                  verso l&rsquo;eccellenza costruttiva.
                </p>
                <p>
                  Il nostro approccio è quello di uno sviluppatore immobiliare
                  che pensa come un investitore: ogni decisione è orientata alla
                  creazione di valore duraturo, per i clienti e per il territorio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-light-gray">
        <div className="container-custom">
          <span className="section-label block mb-4">I nostri valori</span>
          <h2 className="section-title mb-14 max-w-md">
            Il fondamento del nostro lavoro
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-warm">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white p-10 group hover:bg-crg-red-light transition-colors duration-300"
              >
                <div className="w-8 h-[2px] bg-crg-red mb-6 group-hover:w-14 transition-all duration-500" />
                <h3 className="font-heading text-xl font-bold text-charcoal mb-3">
                  {value.title}
                </h3>
                <p className="font-sans text-sm text-mid-gray leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-anthracite">
        <div className="container-custom">
          <span className="section-label block mb-4">Il nostro metodo</span>
          <h2 className="section-title-light mb-16 max-w-lg">
            Un processo chiaro, dalla visione alla consegna
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/8">
            {steps.map((step) => (
              <div key={step.number} className="bg-anthracite p-8 group hover:bg-charcoal transition-colors duration-300">
                <div className="font-heading font-bold text-5xl text-crg-red/20 mb-4">
                  {step.number}
                </div>
                <h3 className="font-heading text-lg font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-white/35 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-cream">
        <div className="container-custom text-center">
          <h2 className="section-title mb-4 max-w-xl mx-auto">
            Vuoi conoscerci meglio?
          </h2>
          <p className="font-sans text-sm text-mid-gray mb-10 max-w-md mx-auto">
            Siamo disponibili per un incontro conoscitivo, senza impegno.
          </p>
          <a href="/contatti" className="btn-primary">Contattaci</a>
        </div>
      </section>
    </>
  );
}
