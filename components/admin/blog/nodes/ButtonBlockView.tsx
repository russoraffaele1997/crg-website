import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export default function ButtonBlockView({ node, updateAttributes, selected }: NodeViewProps) {
  return (
    <NodeViewWrapper
      className={`my-4 border-2 border-dashed rounded-lg p-4 ${selected ? "border-crg-red" : "border-slate-300"}`}
    >
      <p className="text-[10px] tracking-wider uppercase text-slate-400 mb-3">Blocco pulsante</p>
      <div className="flex gap-3 mb-3">
        <input
          value={node.attrs.label}
          onChange={(e) => updateAttributes({ label: e.target.value })}
          placeholder="Testo pulsante"
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red"
        />
        <input
          value={node.attrs.href}
          onChange={(e) => updateAttributes({ href: e.target.value })}
          placeholder="Link (es. /contatti)"
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red"
        />
      </div>
      <span className="inline-flex items-center justify-center px-8 py-3.5 bg-crg-red text-white font-sans text-xs tracking-[0.18em] uppercase">
        {node.attrs.label || "Testo pulsante"}
      </span>
    </NodeViewWrapper>
  );
}
