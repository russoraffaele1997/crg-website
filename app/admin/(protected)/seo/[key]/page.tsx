import { notFound } from "next/navigation";
import { getStaticPageByKey } from "@/lib/seo/static-pages";
import { getAdminPageSeo } from "@/lib/admin/data/seo";
import PageSeoForm from "@/components/admin/seo/PageSeoForm";

export default async function EditPageSeoPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const staticPage = getStaticPageByKey(key);
  if (!staticPage) notFound();

  const seo = await getAdminPageSeo(staticPage.path);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">{staticPage.label}</h1>
        <p className="text-sm text-slate-500 mt-1 font-mono">{staticPage.path}</p>
      </div>

      <PageSeoForm
        pagePath={staticPage.path}
        initial={{
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          canonicalUrl: seo.canonicalUrl,
          ogTitle: seo.ogTitle,
          ogDescription: seo.ogDescription,
          twitterCard: seo.twitterCard,
        }}
      />
    </div>
  );
}
