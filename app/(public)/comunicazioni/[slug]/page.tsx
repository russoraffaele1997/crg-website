import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Download } from "lucide-react";
import { getCommunicationBySlug, getCommunications } from "@/lib/data/communications";
import { getEntitySeoBySlug } from "@/lib/data/seo";
import { buildMetadata } from "@/lib/seo/build-metadata";
import ClientImage from "@/components/ClientImage";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const communications = await getCommunications();
  return communications.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [communication, seo] = await Promise.all([getCommunicationBySlug(slug), getEntitySeoBySlug("communications", slug)]);
  if (!communication) return {};
  return buildMetadata(seo, {
    title: `${communication.title} — CRG | Crafted Residential Group`,
    description: communication.excerpt ?? communication.title,
  });
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function ComunicazioneDetailPage({ params }: Props) {
  const { slug } = await params;
  const communication = await getCommunicationBySlug(slug);
  if (!communication) notFound();

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[380px] flex items-end bg-charcoal overflow-hidden">
        <ClientImage
          src={communication.coverImage ?? ""}
          alt={communication.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          fallbackClass="absolute inset-0 w-full h-full bg-gradient-to-br from-stone-400 to-stone-600"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-crg-red" />

        <div className="container-custom relative z-10 pb-14">
          <div className="flex flex-wrap gap-3 mb-5">
            {communication.category && (
              <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-crg-red">
                {communication.category.name}
              </span>
            )}
            <span className="text-white/30">·</span>
            <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-white/50">
              {formatDate(communication.publishedAt)}
            </span>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-5xl text-white mb-3 leading-tight max-w-3xl">
            {communication.title}
          </h1>
          {communication.subtitle && (
            <p className="font-sans text-sm text-white/45 max-w-2xl">{communication.subtitle}</p>
          )}
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border-warm">
        <div className="container-custom py-4">
          <nav className="font-sans text-xs text-mid-gray flex items-center gap-2">
            <Link href="/" className="hover:text-crg-red transition-colors">Home</Link>
            <span>›</span>
            <Link href="/comunicazioni" className="hover:text-crg-red transition-colors">Comunicazioni</Link>
            <span>›</span>
            <span className="text-charcoal">{communication.title}</span>
          </nav>
        </div>
      </div>

      {/* Body */}
      <section className="py-16 bg-cream">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="font-sans text-[15px] text-mid-gray leading-relaxed space-y-4">
              {communication.body.split("\n").filter(Boolean).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {communication.attachments.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border-warm">
                <h2 className="font-heading text-lg font-bold text-charcoal mb-5">Allegati</h2>
                <div className="space-y-3">
                  {communication.attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 border border-border-warm px-5 py-4 hover:border-crg-red transition-colors group"
                    >
                      <FileText className="w-4 h-4 text-mid-gray group-hover:text-crg-red shrink-0" />
                      <span className="font-sans text-sm text-charcoal flex-1 truncate">{a.filename}</span>
                      <Download className="w-4 h-4 text-mid-gray group-hover:text-crg-red shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-border-warm">
              <Link
                href="/comunicazioni"
                className="font-sans text-xs tracking-[0.25em] uppercase text-charcoal border-b border-charcoal pb-0.5 hover:text-crg-red hover:border-crg-red transition-colors"
              >
                ← Tutte le comunicazioni
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
