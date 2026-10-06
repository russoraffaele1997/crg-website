import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollRestoration from "@/components/ScrollRestoration";
import CookieBanner from "@/components/CookieBanner";
import StructuredData from "@/components/StructuredData";
import { getProjectSummaries } from "@/lib/data/projects";
import { getCompanyInfoContent } from "@/lib/data/site-content";

export const revalidate = 300;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projects, companyInfo] = await Promise.all([getProjectSummaries(), getCompanyInfoContent()]);

  return (
    <>
      <StructuredData company={companyInfo} />
      <ScrollRestoration />
      <Header projects={projects} />
      <main>{children}</main>
      <Footer projects={projects} companyInfo={companyInfo} />
      <CookieBanner />
    </>
  );
}
