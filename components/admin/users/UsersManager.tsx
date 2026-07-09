"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createAdminUser, updateAdminUserRole, setAdminUserActive } from "@/app/admin/(protected)/utenti/actions";
import type { AdminUserListItem } from "@/lib/admin/data/users";
import type { AppRole } from "@/lib/types/admin";

const roleOptions: { value: AppRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "editor", label: "Editor" },
  { value: "collaborator", label: "Collaboratore" },
];

function roleLabel(role: AppRole) {
  return roleOptions.find((r) => r.value === role)?.label ?? role;
}

function formatDateTime(iso: string | null) {
  if (!iso) return "Mai";
  return new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface Props {
  currentUserId: string;
  initialUsers: AdminUserListItem[];
}

export default function UsersManager({ currentUserId, initialUsers }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("collaborator");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const { id } = await createAdminUser({ email, fullName, role, password });
      setUsers((prev) => [
        ...prev,
        { id, email, fullName: fullName || null, role, isActive: true, lastLoginAt: null, createdAt: new Date().toISOString() },
      ]);
      setEmail("");
      setFullName("");
      setRole("collaborator");
      setPassword("");
      setShowForm(false);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: AppRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    try {
      await updateAdminUserRole(id, newRole);
    } catch (err) {
      router.refresh();
      if (err instanceof Error) alert(err.message);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive } : u)));
    try {
      await setAdminUserActive(id, isActive);
    } catch (err) {
      router.refresh();
      if (err instanceof Error) alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Utenti Admin</h1>
          <p className="text-sm text-slate-500 mt-1">{users.length} utenti totali</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-crg-red hover:bg-crg-red-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuovo utente
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-6 mb-8 space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Nome completo</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Ruolo</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AppRole)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-crg-red"
              >
                {roleOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Password iniziale</label>
              <input
                required
                minLength={8}
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Da comunicare all'utente"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red font-mono"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={creating}
              className="bg-crg-red hover:bg-crg-red-dark text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {creating ? "Creazione..." : "Crea utente"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-500 hover:text-slate-700">
              Annulla
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left font-medium text-slate-500 px-5 py-3">Utente</th>
              <th className="text-left font-medium text-slate-500 px-5 py-3">Ruolo</th>
              <th className="text-left font-medium text-slate-500 px-5 py-3">Ultimo accesso</th>
              <th className="text-left font-medium text-slate-500 px-5 py-3">Stato</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">{u.fullName || u.email}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{u.email}{u.id === currentUserId ? " · tu" : ""}</p>
                </td>
                <td className="px-5 py-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as AppRole)}
                    disabled={u.id === currentUserId}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-crg-red disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {roleOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-4 text-slate-600">{formatDateTime(u.lastLoginAt)}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => handleToggleActive(u.id, !u.isActive)}
                    disabled={u.id === currentUserId}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      u.isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {u.isActive ? "Attivo" : "Disattivato"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-3">
        {roleLabel("super_admin")}: accesso completo, incluse gestione utenti e SEO. {roleLabel("editor")}: crea e pubblica ogni contenuto. {roleLabel("collaborator")}: crea contenuti che restano in bozza fino all&rsquo;approvazione.
      </p>
    </div>
  );
}
