import { notFound } from "next/navigation";
import { getAdminProjectById } from "@/lib/admin/data/projects";
import UnitsManager from "@/components/admin/projects/UnitsManager";

export default async function ProjectUnitaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) notFound();

  return (
    <UnitsManager
      projectId={id}
      initialUnits={project.units.map((u) => ({
        id: u.id,
        unitCode: u.unitCode,
        name: u.name,
        typology: u.typology,
        floor: u.floor,
        interno: u.interno,
        sqm: u.sqm,
        outdoorSqm: u.outdoorSqm,
        rooms: u.rooms,
        destination: u.destination,
        price: u.price,
        status: u.status,
      }))}
    />
  );
}
