import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { ButtonBlock } from "./nodes/button-block";
import { FaqBlock } from "./nodes/faq-block";
import { VideoBlock } from "./nodes/video-block";

/**
 * The exact Tiptap schema shared by the admin editor and the public
 * read-only renderer. Framework-agnostic (only @tiptap/core + extension
 * packages, no @tiptap/react) so the public bundle never pulls in the
 * editable ProseMirror view — see components/blog/BlockRenderer.tsx, which
 * feeds this list into generateHTML() instead of useEditor().
 *
 * The admin editor (components/admin/blog/editor-extensions.ts) imports
 * this same list and only adds interactive NodeViews on top of the custom
 * nodes — never redefines their renderHTML, so saved content always
 * displays identically in both places.
 */
export function getBlogExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
    }),
    Image,
    Link.configure({ openOnClick: false }),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    ButtonBlock,
    FaqBlock,
    VideoBlock,
  ];
}
