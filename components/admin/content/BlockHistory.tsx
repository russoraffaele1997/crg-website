"use client";

import { useEffect, useState } from "react";
import { X, RotateCcw, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { getBlockHistory, restoreBlockRevision, type BlockRevisionSummary } from "@/app/admin/(protected)/contenuti/actions";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SnapshotPreview({ snapshot }: { snapshot: Record<string, unknown> }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 mt-2 space-y-2">
      {Object.entries(snapshot).map(([key, value]) => (
        <div key={key} className="text-xs">
          <span className="text-slate-400">{key}: </span>
          <span className="text-slate-700">
            {Array.isArray(value) ? `${value.length} elementi` : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BlockHistory({
  page,
  blockKey,
  open,
  onClose,
  onRestored,
}: {
  page: string;
  blockKey: string;
  open: boolean;
  onClose: () => void;
  onRestored: (data: Record<string, unknown>) => void;
}) {
  const [revisions, setRevisions] = useState<BlockRevisionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getBlockHistory(page, blockKey)
      .then(setRevisions)
      .finally(() => setLoading(false));
  }, [open, page, blockKey]);

  if (!open) return null;

  const handleRestore = async (revisionId: string, snapshot: Record<string, unknown>) => {
    if (!confirm("Ripristinare questa versione? Verrà creata una nuova voce nella cronologia.")) return;
    setRestoringId(revisionId);
    try {
      await restoreBlockRevision(page, blockKey, revisionId);
      onRestored(snapshot);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Cronologia modifiche</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : revisions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-12">
              Nessuna modifica precedente registrata. La cronologia si popola dal prossimo salvataggio.
            </p>
          ) : (
            <div className="space-y-2">
              {revisions.map((rev) => (
                <div key={rev.id} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedId((id) => (id === rev.id ? null : rev.id))}
                      className="flex items-center gap-2 text-left flex-1"
                    >
                      {expandedId === rev.id ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <div>
                        <p className="text-sm text-slate-800">{rev.editedByName}</p>
                        <p className="text-xs text-slate-400">{formatDateTime(rev.editedAt)}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRestore(rev.id, rev.snapshot)}
                      disabled={restoringId === rev.id}
                      className="flex items-center gap-1.5 text-xs font-medium text-crg-red hover:text-crg-red-dark disabled:opacity-50 shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Ripristina
                    </button>
                  </div>
                  {expandedId === rev.id && <SnapshotPreview snapshot={rev.snapshot} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
