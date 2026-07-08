import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBlockDefinition } from "@/lib/content/block-registry";
import { getAdminBlock } from "@/lib/admin/data/site-content";
import BlockForm from "@/components/admin/content/BlockForm";

export default async function EditBlockPage({
  params,
}: {
  params: Promise<{ page: string; blockKey: string }>;
}) {
  const { page, blockKey } = await params;
  const def = getBlockDefinition(page, blockKey);
  if (!def) notFound();

  const block = await getAdminBlock(page, blockKey);

  return (
    <div>
      <Link
        href="/admin/contenuti"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Contenuti sito
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">{def.blockLabel}</h1>
        <p className="text-sm text-slate-500 mt-1">{def.pageLabel}</p>
      </div>

      <BlockForm page={page} blockKey={blockKey} fields={def.fields} initialData={block.data} />
    </div>
  );
}
