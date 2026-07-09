import { getBlogCategories, getBlogTags } from "@/lib/data/blog";
import { getAdminAuthors } from "@/lib/admin/data/blog";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";

export default async function NuovoArticoloPage() {
  const [categories, tags, authors] = await Promise.all([getBlogCategories(), getBlogTags(), getAdminAuthors()]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Nuovo articolo</h1>
      </div>
      <BlogPostForm mode="create" categories={categories} tags={tags} authors={authors} />
    </div>
  );
}
