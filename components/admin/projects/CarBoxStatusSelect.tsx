"use client";

import { useState, useTransition } from "react";
import { updateCarBoxStatus } from "@/app/admin/(protected)/progetti/actions";
import { carBoxStatusConfig, carBoxStatusOptions } from "@/lib/admin/project-options";
import type { CarBoxStatus } from "@/lib/types/project";

export default function CarBoxStatusSelect({
  carBoxId,
  projectId,
  status,
}: {
  carBoxId: string;
  projectId: string;
  status: CarBoxStatus;
}) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();
  const config = carBoxStatusConfig(current);

  return (
    <select
      value={current}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as CarBoxStatus;
        setCurrent(next);
        startTransition(async () => {
          await updateCarBoxStatus(carBoxId, projectId, next);
        });
      }}
      className={`text-xs font-medium px-2.5 py-1.5 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-crg-red/40 ${config.color} disabled:opacity-60`}
    >
      {carBoxStatusOptions.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
