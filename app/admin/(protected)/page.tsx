import Link from "next/link";
import { Building2, Megaphone, Newspaper, Clock, Inbox } from "lucide-react";
import { getDashboardStats } from "@/lib/data/dashboard";
import { requireAdmin } from "@/lib/auth/require-role";

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDashboardPage() {
  const [admin, stats] = await Promise.all([requireAdmin(), getDashboardStats()]);

  const cards = [
    { label: "Progetti", value: stats.projectCount, icon: Building2 },
    { label: "Comunicazioni pubblicate", value: stats.publishedCommunications, icon: Megaphone },
    { label: "Articoli del blog", value: stats.blogPostCount, icon: Newspaper },
    { label: "Ultimo accesso", value: formatDateTime(admin.last_login_at), icon: Clock, isText: true },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Bentornato, {admin.full_name ?? admin.email}.
        </p>
      </div>

      <Link
        href="/admin/richieste?stato=new"
        className={`flex items-center gap-4 rounded-xl p-5 mb-4 border transition-colors ${
          stats.newLeads > 0 ? "bg-crg-red-light border-crg-red/20 hover:bg-crg-red/10" : "bg-white border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-crg-red">
          <Inbox className="w-[18px] h-[18px]" />
        </div>
        <div>
          <div className="text-base font-semibold text-slate-900">
            {stats.newLeads === 0 ? "Nessuna nuova richiesta" : stats.newLeads === 1 ? "1 nuova richiesta da gestire" : `${stats.newLeads} nuove richieste da gestire`}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Appuntamenti, contatti, iscrizioni e documenti dal sito →</div>
        </div>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg bg-crg-red-light flex items-center justify-center text-crg-red mb-4">
                <Icon className="w-[18px] h-[18px]" />
              </div>
              <div
                className={
                  card.isText
                    ? "text-base font-semibold text-slate-900"
                    : "text-3xl font-semibold text-slate-900"
                }
              >
                {card.value}
              </div>
              <div className="text-xs text-slate-500 mt-1">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Ultimi aggiornamenti</h2>
        {stats.recentUpdates.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nessun contenuto ancora creato. Inizia da Progetti o Contenuti sito.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {stats.recentUpdates.map((update, i) => (
              <li key={i} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <span className="text-slate-900">{update.label}</span>
                  <span className="text-slate-400 ml-2">{update.type}</span>
                </div>
                <span className="text-slate-400">{formatDateTime(update.updatedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
