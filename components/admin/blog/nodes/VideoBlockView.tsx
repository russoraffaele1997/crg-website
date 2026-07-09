import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export default function VideoBlockView({ node, updateAttributes, selected }: NodeViewProps) {
  return (
    <NodeViewWrapper
      className={`my-4 border-2 border-dashed rounded-lg p-4 ${selected ? "border-crg-red" : "border-slate-300"}`}
    >
      <p className="text-[10px] tracking-wider uppercase text-slate-400 mb-3">Blocco video</p>
      <input
        value={node.attrs.url}
        onChange={(e) => updateAttributes({ url: e.target.value })}
        placeholder="URL YouTube, Vimeo o video diretto (.mp4)"
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red"
      />
      {node.attrs.url && (
        <p className="text-xs text-slate-400 mt-2 truncate">{node.attrs.url}</p>
      )}
    </NodeViewWrapper>
  );
}
