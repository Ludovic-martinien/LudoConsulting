"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, FileUp, Trash2 } from "lucide-react";
import { formatFileSize } from "@/lib/document-format";

type DocRow = {
  id: number;
  titleFr: string;
  titleEn: string;
  projectSlug: string | null;
  fileName: string;
  sizeBytes: number;
  isPublished: boolean;
  createdAt: string;
};

export function AdminDocuments() {
  const router = useRouter();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/documents", { cache: "no-store" });
      if (!response.ok) throw new Error("Chargement impossible.");
      const data = await response.json() as { documents: DocRow[] };
      setDocs(data.documents);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Chargement impossible.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError(false);
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/admin/documents", { method: "POST", body: new FormData(form) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Téléversement impossible.");
      setMessage("Cahier des charges publié et visible par les membres.");
      form.reset();
      await load();
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Téléversement impossible.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(doc: DocRow) {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !doc.isPublished }),
      });
      if (!response.ok) throw new Error("Modification impossible.");
      setDocs((list) => list.map((item) => item.id === doc.id ? { ...item, isPublished: !item.isPublished } : item));
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Modification impossible.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function remove(doc: DocRow) {
    if (!window.confirm(`Supprimer définitivement « ${doc.titleFr} » ? Les membres ne pourront plus y accéder.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/documents/${doc.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Suppression impossible.");
      setDocs((list) => list.filter((item) => item.id !== doc.id));
      setMessage("Document supprimé.");
      setError(false);
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Suppression impossible.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="admin-content">
        <div className="admin-title-row">
          <div><h1>Cahiers des charges</h1><p>Téléversez les documents PDF depuis votre appareil : ils deviennent visibles par les membres connectés.</p></div>
          <span className="status-label">{docs.length} document(s)</span>
        </div>
        {message && <div className={`admin-alert${error ? " error" : ""}`} role="status">{message}</div>}
        {loading ? (
          <div className="empty-state"><h3>Chargement…</h3></div>
        ) : docs.length === 0 ? (
          <div className="empty-state"><h3>Aucun cahier des charges</h3><p>Téléversez votre premier document PDF avec le formulaire ci-dessous.</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Titre</th><th>Fichier</th><th>Projet</th><th>Ajouté le</th><th>Visible</th><th>Actions</th></tr></thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td><strong>{doc.titleFr}</strong>{doc.titleEn && <><br /><small>{doc.titleEn}</small></>}</td>
                    <td>{doc.fileName}<br /><small>{formatFileSize(doc.sizeBytes)}</small></td>
                    <td>{doc.projectSlug ?? "—"}</td>
                    <td>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(doc.createdAt))}</td>
                    <td>
                      <label className="switch-label">
                        <input type="checkbox" checked={doc.isPublished} onChange={() => void togglePublish(doc)} disabled={busy} aria-label={`Visibilité de ${doc.titleFr}`} />
                        <span>{doc.isPublished ? "Oui" : "Non"}</span>
                      </label>
                    </td>
                    <td>
                      <div className="admin-inline-form">
                        <a className="button button-outline-dark button-small" href={`/api/documents/${doc.id}/file`} target="_blank" rel="noreferrer"><Eye size={13} /> Voir</a>
                        <button type="button" className="button button-outline-dark button-small" onClick={() => void remove(doc)} disabled={busy}><Trash2 size={13} /> Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="admin-content" style={{ marginTop: 18 }}>
        <div className="admin-title-row"><div><h2>Ajouter un cahier des charges</h2><p>PDF uniquement, 4 Mo maximum. Publication immédiate sauf mention contraire.</p></div><FileUp size={19} /></div>
        <form onSubmit={upload}>
          <div className="admin-form-grid">
            <div className="admin-form-field"><label htmlFor="doc-title-fr">Titre (FR) *</label><input id="doc-title-fr" name="titleFr" required minLength={2} maxLength={240} /></div>
            <div className="admin-form-field"><label htmlFor="doc-title-en">Titre (EN)</label><input id="doc-title-en" name="titleEn" maxLength={240} /></div>
            <div className="admin-form-field"><label htmlFor="doc-project">Projet lié (slug, facultatif)</label><input id="doc-project" name="projectSlug" maxLength={180} placeholder="ex. taf-gab" /></div>
            <div className="admin-form-field"><label htmlFor="doc-file">Fichier PDF * (4 Mo max)</label><input id="doc-file" name="file" type="file" accept="application/pdf,.pdf" required /></div>
          </div>
          <label className="consent-check"><input type="checkbox" name="isPublished" defaultChecked />Visible par les membres dès l'envoi</label>
          <button className="button button-primary button-small" type="submit" disabled={busy}><FileUp size={14} /> Téléverser le document</button>
        </form>
      </section>
    </>
  );
}
