"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { key: "", label: "Generale" },
  { key: "gallery", label: "Gallery" },
  { key: "caratteristiche", label: "Caratteristiche" },
  { key: "unita", label: "Unità" },
  { key: "timeline", label: "Avanzamento" },
  { key: "diario", label: "Diario" },
  { key: "documenti", label: "Documenti" },
  { key: "chi-realizza", label: "Chi realizza" },
  { key: "messaggi", label: "Messaggi" },
];

export default function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/admin/progetti/${projectId}`;

  return (
    <div className="flex gap-1 border-b border-slate-200 mb-8 overflow-x-auto">
      {tabs.map((tab) => {
        const href = tab.key ? `${base}/${tab.key}` : base;
        const active = pathname === href;
        return (
          <Link
            key={tab.key}
            href={href}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              active
                ? "border-crg-red text-crg-red"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
