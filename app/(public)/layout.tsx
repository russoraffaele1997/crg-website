import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollRestoration from "@/components/ScrollRestoration";
import { getProjects } from "@/lib/data/projects";
import { getCompanyInfoContent } from "@/lib/data/site-content";

export const revalidate = 300;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projects, companyInfo] = await Promise.all([getProjects(), getCompanyInfoContent()]);

  return (
    <>
      <ScrollRestoration />
      <Header projects={projects} />
      <main>{children}</main>
      <Footer projects={projects} companyInfo={companyInfo} />
    </>
  );
}
