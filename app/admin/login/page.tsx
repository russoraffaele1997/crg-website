import type { Metadata } from "next";
import Image from "next/image";
import { isSupabaseConfigured } from "@/lib/config";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Accedi — Admin CRG",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image
            src="/brand/crg-logo-bianco.svg"
            alt="CRG"
            width={134}
            height={100}
            className="h-16 w-auto"
            unoptimized
            priority
          />
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8">
          <h1 className="text-lg font-semibold text-white mb-1">Area amministrazione</h1>
          <p className="text-sm text-slate-400 mb-6">Accedi con le tue credenziali CRG.</p>

          {isSupabaseConfigured ? (
            <LoginForm />
          ) : (
            <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
              Il progetto Supabase non è stato ancora collegato. Configura le
              variabili d&rsquo;ambiente in <code>.env.local</code> per
              abilitare l&rsquo;accesso.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
