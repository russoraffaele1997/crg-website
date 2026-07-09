"use client";

import { useState } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  TableIcon,
  ImageIcon,
  LinkIcon,
  Undo,
  Redo,
  MousePointerClick,
  HelpCircle,
  Video,
} from "lucide-react";
import { getEditorExtensions } from "./editor-extensions";
import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import type { MediaLibraryItem } from "@/lib/types/media";

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        active ? "bg-crg-red text-white" : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

export default function BlockEditor({
  initialContent,
  onChange,
}: {
  initialContent: JSONContent;
  onChange: (content: JSONContent) => void;
}) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[300px] focus:outline-none font-sans text-[15px] text-charcoal leading-relaxed [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-crg-red [&_blockquote]:pl-4 [&_blockquote]:italic [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_th]:bg-slate-50 [&_img]:max-w-full",
      },
    },
  });

  if (!editor) return null;

  const handleImageSelect = (media: MediaLibraryItem) => {
    editor.chain().focus().setImage({ src: media.url, alt: media.original_filename }).run();
    setImagePickerOpen(false);
  };

  const handleLink = () => {
    const url = window.prompt("URL del link:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Grassetto">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Corsivo">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Titolo 2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Titolo 3">
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Elenco puntato">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Elenco numerato">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citazione">
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={handleLink} active={editor.isActive("link")} title="Link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <ToolbarButton onClick={() => setImagePickerOpen(true)} title="Immagine">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Tabella"
        >
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().insertVideoBlock().run()} title="Video">
          <Video className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().insertButtonBlock().run()} title="Pulsante">
          <MousePointerClick className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().insertFaqBlock().run()} title="FAQ">
          <HelpCircle className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Annulla">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Ripeti">
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="p-4">
        <EditorContent editor={editor} />
      </div>

      <MediaLibraryModal
        open={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleImageSelect}
        kindFilter="image"
      />
    </div>
  );
}
