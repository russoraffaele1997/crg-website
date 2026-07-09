import { generateHTML } from "@tiptap/html/server";
import { getBlogExtensions } from "@/lib/blog/extensions";

export default function BlockRenderer({ content }: { content: Record<string, unknown> }) {
  const html = generateHTML(content, getBlogExtensions());

  return (
    <div
      className="
        font-sans text-[15px] text-mid-gray leading-relaxed
        [&>*+*]:mt-5
        [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-charcoal [&_h2]:mt-10 [&_h2]:mb-2
        [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-charcoal [&_h3]:mt-8 [&_h3]:mb-2
        [&_h4]:font-heading [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-charcoal [&_h4]:mt-6 [&_h4]:mb-2
        [&_a]:text-crg-red [&_a]:underline [&_a]:underline-offset-2
        [&_strong]:text-charcoal [&_strong]:font-semibold
        [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
        [&_blockquote]:border-l-2 [&_blockquote]:border-crg-red [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-charcoal
        [&_img]:w-full [&_img]:h-auto [&_img]:my-2
        [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
        [&_th]:border [&_th]:border-border-warm [&_th]:bg-light-gray [&_th]:px-3 [&_th]:py-2 [&_th]:text-left
        [&_td]:border [&_td]:border-border-warm [&_td]:px-3 [&_td]:py-2
        [&_code]:bg-light-gray [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:font-mono
        [&_pre]:bg-charcoal [&_pre]:text-white [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-[13px]
        [&_hr]:border-border-warm
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
