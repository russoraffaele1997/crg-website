import type { LucideIcon } from "lucide-react";

export default function ComingSoon({
  title,
  description,
  icon: Icon,
  phase,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  phase: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">{title}</h1>
      <p className="text-sm text-slate-500 mb-8">{description}</p>

      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-crg-red-light flex items-center justify-center text-crg-red mb-4">
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-slate-700">Sezione in arrivo</p>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">{phase}</p>
      </div>
    </div>
  );
}
