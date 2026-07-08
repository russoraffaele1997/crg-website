import { isSupabaseConfigured } from "@/lib/config";
import { requireAdmin } from "@/lib/auth/require-role";
import AdminShell from "@/components/admin/AdminShell";

// Every admin page is per-request (auth session + live DB data) and must
// never be statically prerendered at build time.
export const dynamic = "force-dynamic";

function SetupRequired() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-5">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold text-white mb-3">
          Supabase non ancora collegato
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Crea un progetto su supabase.com, quindi copia URL, anon key e
          service role key in <code className="text-slate-300">.env.local</code>{" "}
          (vedi <code className="text-slate-300">.env.local.example</code>).
          L&rsquo;area amministrazione si attiverà automaticamente.
        </p>
      </div>
    </div>
  );
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured) {
    return <SetupRequired />;
  }

  const admin = await requireAdmin();

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
