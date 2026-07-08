import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProjects } from "@/lib/data/projects";

export const revalidate = 300;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projects = await getProjects();

  return (
    <>
      <Header projects={projects} />
      <main>{children}</main>
      <Footer projects={projects} />
    </>
  );
}
