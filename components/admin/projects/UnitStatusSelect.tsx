"use client";

import { useState, useTransition } from "react";
import { updateUnitStatus } from "@/app/admin/(protected)/progetti/actions";
import { unitStatusConfig, unitStatusOptions } from "@/lib/admin/project-options";
import type { UnitStatus } from "@/lib/types/project";

export default function UnitStatusSelect({ unitId, status }: { unitId: string; status: UnitStatus }) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();
  const config = unitStatusConfig(current);

  return (
    <select
      value={current}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as UnitStatus;
        setCurrent(next);
        startTransition(async () => {
          await updateUnitStatus(unitId, next);
        });
      }}
      className={`text-xs font-medium px-2.5 py-1.5 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-crg-red/40 ${config.color} disabled:opacity-60`}
    >
      {unitStatusOptions.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
