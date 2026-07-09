"use client";

import { useEffect, useState } from "react";
import { X, RotateCcw, Loader2 } from "lucide-react";
import { getBlogPostHistory, restoreBlogPostRevision, type PostRevisionSummary } from "@/app/admin/(protected)/blog/actions";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function BlogHistory({
  postId,
  open,
  onClose,
  onRestored,
}: {
  postId: string;
  open: boolean;
  onClose: () => void;
  onRestored: () => void;
}) {
  const [revisions, setRevisions] = useState<PostRevisionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getBlogPostHistory(postId).then(setRevisions).finally(() => setLoading(false));
  }, [open, postId]);

  if (!open) return null;

  const handleRestore = async (revisionId: string) => {
    if (!confirm("Ripristinare questa versione? Verrà creata una nuova voce nella cronologia.")) return;
    setRestoringId(revisionId);
    try {
      await restoreBlogPostRevision(postId, revisionId);
      onRestored();
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Cronologia articolo</h2>
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
            <p className="text-sm text-slate-500 text-center py-12">Nessuna modifica precedente registrata.</p>
          ) : (
            <div className="space-y-2">
              {revisions.map((rev) => (
                <div key={rev.id} className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
                  <div>
                    <p className="text-sm text-slate-800">{rev.editedByName}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(rev.editedAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRestore(rev.id)}
                    disabled={restoringId === rev.id}
                    className="flex items-center gap-1.5 text-xs font-medium text-crg-red hover:text-crg-red-dark disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Ripristina
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
