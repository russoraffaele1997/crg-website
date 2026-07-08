import { notFound } from "next/navigation";
import { getAdminProjectById } from "@/lib/admin/data/projects";
import ProjectTabs from "@/components/admin/projects/ProjectTabs";

export default async function ProjectEditLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{project.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{project.location}</p>
      </div>
      <ProjectTabs projectId={id} />
      {children}
    </div>
  );
}
