import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Plus, X } from "lucide-react";
import type { FaqItem } from "@/lib/blog/nodes/faq-block";

export default function FaqBlockView({ node, updateAttributes, selected }: NodeViewProps) {
  const items: FaqItem[] = node.attrs.items ?? [];

  const setItems = (next: FaqItem[]) => updateAttributes({ items: next });

  return (
    <NodeViewWrapper
      className={`my-4 border-2 border-dashed rounded-lg p-4 ${selected ? "border-crg-red" : "border-slate-300"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] tracking-wider uppercase text-slate-400">Blocco FAQ</p>
        <button
          type="button"
          onClick={() => setItems([...items, { question: "", answer: "" }])}
          className="flex items-center gap-1 text-xs text-crg-red hover:text-crg-red-dark"
          contentEditable={false}
        >
          <Plus className="w-3.5 h-3.5" />
          Aggiungi
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start bg-slate-50 rounded-lg p-3">
            <div className="flex-1 space-y-2">
              <input
                value={item.question}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], question: e.target.value };
                  setItems(next);
                }}
                placeholder="Domanda"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-crg-red"
              />
              <textarea
                value={item.answer}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], answer: e.target.value };
                  setItems(next);
                }}
                placeholder="Risposta"
                rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-crg-red"
              />
            </div>
            <button
              type="button"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="text-slate-400 hover:text-red-600 p-1"
              contentEditable={false}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NodeViewWrapper>
  );
}
