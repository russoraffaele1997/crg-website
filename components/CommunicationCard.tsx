import Link from "next/link";
import ClientImage from "./ClientImage";
import type { CommunicationListItem } from "@/lib/data/communications";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

export default function CommunicationCard({ communication }: { communication: CommunicationListItem }) {
  return (
    <article className="group bg-white border border-border-warm hover:shadow-lg transition-all duration-500 flex flex-col">
      <div className="relative overflow-hidden aspect-[4/3]">
        <ClientImage
          src={communication.coverImage ?? ""}
          alt={communication.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          fallbackClass="w-full h-full bg-gradient-to-br from-stone-400 to-stone-600"
        />
        {communication.category && (
          <span className="absolute top-4 left-4 font-sans text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 bg-white/95 text-charcoal border border-border-warm">
            {communication.category.name}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-7">
        <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-mid-gray mb-3">
          {formatDate(communication.publishedAt)}
        </span>
        <h3 className="font-heading text-xl font-bold text-charcoal mb-3 group-hover:text-crg-red transition-colors duration-300">
          {communication.title}
        </h3>
        {communication.excerpt && (
          <p className="font-sans text-sm text-mid-gray leading-relaxed flex-1 mb-6">
            {communication.excerpt}
          </p>
        )}
        <Link
          href={`/comunicazioni/${communication.slug}`}
          className="font-sans text-xs tracking-[0.25em] uppercase text-charcoal border-b border-charcoal pb-0.5 hover:text-crg-red hover:border-crg-red transition-colors duration-300 self-start"
        >
          Leggi →
        </Link>
      </div>
    </article>
  );
}
