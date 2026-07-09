import { notFound } from "next/navigation";
import { getAdminBlogPostById, getAdminAuthors } from "@/lib/admin/data/blog";
import { getBlogCategories, getBlogTags } from "@/lib/data/blog";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";
import BlogGalleryManager from "@/components/admin/blog/BlogGalleryManager";

export default async function EditArticoloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories, tags, authors] = await Promise.all([
    getAdminBlogPostById(id),
    getBlogCategories(),
    getBlogTags(),
    getAdminAuthors(),
  ]);
  if (!post) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">{post.title}</h1>
      </div>

      <BlogPostForm
        mode="edit"
        postId={id}
        categories={categories}
        tags={tags}
        authors={authors}
        initial={{
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          contentJson: post.contentJson,
          categoryId: post.categoryId,
          authorId: post.authorId,
          tagIds: post.tagIds,
          publishStatus: post.publishStatus as "draft" | "published" | "archived",
          publishedAt: post.publishedAt,
          seoMetaTitle: post.seoMetaTitle,
          seoMetaDescription: post.seoMetaDescription,
          ogTitle: post.ogTitle,
          ogDescription: post.ogDescription,
          coverImage: post.coverImage
            ? {
                id: post.coverImage.id,
                url: post.coverImage.url,
                original_filename: post.coverImage.original_filename,
                kind: post.coverImage.kind as "image" | "video" | "pdf" | "document",
                storage_path: "",
                bucket: "media",
                mime_type: "",
                size_bytes: 0,
                width: null,
                height: null,
                alt_text: null,
              }
            : null,
        }}
      />

      <div className="mt-12 pt-8 border-t border-slate-200">
        <BlogGalleryManager
          postId={id}
          initialItems={post.gallery.map((g) => ({
            id: g.id,
            media: g.media ? { id: g.media.id, url: g.media.url, original_filename: g.media.original_filename } : null,
          }))}
        />
      </div>
    </div>
  );
}
