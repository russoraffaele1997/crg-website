import { ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Placeholder from "@tiptap/extension-placeholder";
import { ButtonBlock } from "@/lib/blog/nodes/button-block";
import { FaqBlock } from "@/lib/blog/nodes/faq-block";
import { VideoBlock } from "@/lib/blog/nodes/video-block";
import ButtonBlockView from "./nodes/ButtonBlockView";
import FaqBlockView from "./nodes/FaqBlockView";
import VideoBlockView from "./nodes/VideoBlockView";

/**
 * Editor-only extension list: same base nodes as lib/blog/extensions.ts
 * (kept in sync manually — the three custom nodes are `.extend()`-ed here
 * only to attach an interactive NodeView, their renderHTML/attrs are
 * inherited unchanged so saved JSON renders identically via the public
 * BlockRenderer).
 */
export function getEditorExtensions() {
  return [
    StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
    Image,
    Link.configure({ openOnClick: false }),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({ placeholder: "Scrivi il contenuto dell'articolo..." }),
    ButtonBlock.extend({
      addNodeView() {
        return ReactNodeViewRenderer(ButtonBlockView);
      },
    }),
    FaqBlock.extend({
      addNodeView() {
        return ReactNodeViewRenderer(FaqBlockView);
      },
    }),
    VideoBlock.extend({
      addNodeView() {
        return ReactNodeViewRenderer(VideoBlockView);
      },
    }),
  ];
}
