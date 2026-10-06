"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { adminNavItems } from "@/lib/admin/nav-config";
import LogoutButton from "./LogoutButton";
import type { AdminUser } from "@/lib/types/admin";

const roleLabels: Record<AdminUser["role"], string> = {
  super_admin: "Super Admin",
  editor: "Editor",
  collaborator: "Collaboratore",
};

function NavLinks({ pathname, role, onNavigate }: { pathname: string; role: AdminUser["role"]; onNavigate?: () => void }) {
  const items = adminNavItems.filter((item) => !item.roles || item.roles.includes(role));
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active
                ? "bg-crg-red text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({
  admin,
  children,
}: {
  admin: AdminUser;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-slate-900 flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Image
            src="/brand/crg-logo-bianco.svg"
            alt="CRG"
            width={64}
            height={48}
            className="h-12 w-auto"
            unoptimized
          />
          <span className="ml-2.5 text-[10px] tracking-[0.2em] uppercase text-slate-500">
            Admin
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <NavLinks pathname={pathname} role={admin.role} />
        </div>
        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm text-white truncate">{admin.full_name ?? admin.email}</p>
            <p className="text-xs text-slate-500">{roleLabels[admin.role]}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-slate-900 flex items-center justify-between px-4 z-40">
        <Image
          src="/brand/crg-logo-bianco.svg"
          alt="CRG"
          width={56}
          height={42}
          className="h-11 w-auto"
          unoptimized
        />
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white p-2"
          aria-label="Apri menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-slate-900 flex flex-col">
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
              <span className="text-[10px] tracking-[0.2em] uppercase text-slate-500">
                Admin
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Chiudi menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-5">
              <NavLinks pathname={pathname} role={admin.role} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="px-3 py-4 border-t border-white/10">
              <div className="px-3 py-2 mb-1">
                <p className="text-sm text-white truncate">{admin.full_name ?? admin.email}</p>
                <p className="text-xs text-slate-500">{roleLabels[admin.role]}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
