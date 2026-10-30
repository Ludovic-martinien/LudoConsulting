"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ImageUp, Trash2, TriangleAlert } from "lucide-react";
import { acceptedImageLabel, mediaUrl, mediaKinds, type MediaKind } from "@/lib/media";
import { MediaImage } from "@/components/media-image";

type MediaState = { kind: string; updatedAt: Date }[];
export function AdminMedia({ versions }: { versions: MediaState }) {
  const router = useRouter();
  const versionByKind = new Map(versions.map((item) => [item.kind, item.updatedAt]));
  const [busyKind, setBusyKind] = useState<MediaKind | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  async function upload(kind: MediaKind, file: File) {
    setBusyKind(kind); setMessage(""); setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(`/api/admin/media/${kind}`, { method: "POST", body });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Téléversement impossible.");
      setMessage("Fichier enregistré. La présentation et le site utilisent désormais cette version.");
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Téléversement impossible."); }
    finally { setBusyKind(null); }
  }

  async function remove(kind: MediaKind) {
    if (!window.confirm("Retirer ce fichier ? L’emplacement réservé réapparaîtra.")) return;
    setBusyKind(kind); setMessage(""); setError("");
    try {
      const response = await fetch(`/api/admin/media/${kind}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Suppression impossible.");
      setMessage("Fichier retiré."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Suppression impossible."); }
    finally { setBusyKind(null); }
  }

  return <><section className="admin-content"><div className="admin-title-row"><div><h1>Photo & logos officiels</h1><p>Déposez ici les fichiers fournis par Ludo_Consulting. Ils sont stockés en base et affichés sans modification graphique.</p></div><span className="status-label">{versions.length} fichier(s) en base</span></div>{message && <div className="admin-alert" role="status">{message}</div>}{error && <div className="admin-alert error" role="alert">{error}</div>}<div className="admin-alert" role="note"><TriangleAlert size={14} style={{ display: "inline", marginRight: 6 }} />Aucun logo n’est redessiné ni généré automatiquement. Tant qu’un fichier officiel n’est pas déposé, un emplacement réservé est affiché. Formats acceptés : {acceptedImageLabel}, 2 Mo par logo et 5 Mo pour la photo.</div><div className="media-grid">{mediaKinds.map((definition) => {
    const version = versionByKind.get(definition.kind);
    return <article className="media-card" key={definition.kind}>
      <h2>{definition.labelFr}</h2>
      <div className={`media-preview${definition.group === "profile" ? " is-portrait" : ""}`}>
        {version ? <MediaImage src={mediaUrl(definition.kind, version)} fallbackSrc={definition.group === "profile" ? "/images/profil/responsable.jpg" : undefined} alt={definition.labelFr} /> : <span>Emplacement réservé<br /><small>Aucun fichier officiel déposé</small></span>}
      </div>
      <p>{version ? `Version du ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(version))}` : "Le contenu public restera explicitement marqué « logo officiel à intégrer »."}</p>
      <input ref={(element) => { inputs.current[definition.kind] = element; }} type="file" accept="image/jpeg,image/png,image/webp" className="hidden-field" id={`file-${definition.kind}`} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(definition.kind, file); event.target.value = ""; }} />
      <div className="media-actions"><label htmlFor={`file-${definition.kind}`} className="button button-primary button-small" aria-disabled={busyKind !== null}><ImageUp size={14} /> {busyKind === definition.kind ? "Envoi…" : version ? "Remplacer" : "Téléverser"}</label>{version && <button type="button" className="button button-outline-dark button-small" onClick={() => remove(definition.kind)} disabled={busyKind !== null}><Trash2 size={14} /> Retirer</button>}</div>
    </article>;
  })}</div></section></>;
}
