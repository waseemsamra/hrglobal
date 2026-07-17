"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function extOf(name = "") {
  const m = (name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}
function iconFor(category = "") {
  const c = (category || "").toLowerCase();
  if (c.includes("resume") || c.includes("cover")) return "description";
  if (c.includes("identif") || c.includes("badge")) return "badge";
  if (c.includes("education") || c.includes("cert")) return "school";
  if (c.includes("reference")) return "group";
  return "description";
}
function fmtSize(bytes = 0) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
function fmtDate(d) {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CandidateVault({ candidate }) {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState("All Files");
  const [msg, setMsg] = useState({ type: "idle", text: "" });
  const [primaryId, setPrimaryId] = useState(null);
  const fileInputRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/candidates/documents");
      const data = await res.json();
      const docs = data.documents || [];
      setDocuments(docs);
      const prim = docs.find((d) => d.isPrimary);
      setPrimaryId(prim?.id || null);
    } catch {
      setMsg({ type: "error", text: "Failed to load documents." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadFiles(files) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMsg({ type: "idle", text: "" });
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/candidates/documents", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.error || "Upload failed." });
        setUploading(false);
        return;
      }
      setMsg({ type: "success", text: "Documents uploaded." });
      await load();
      router.refresh();
    } catch {
      setMsg({ type: "error", text: "Upload failed." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function remove(id) {
    if (!confirm("Delete this document?")) return;
    try {
      const res = await fetch(`/api/candidates/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMsg({ type: "success", text: "Document deleted." });
      await load();
    } catch {
      setMsg({ type: "error", text: "Failed to delete." });
    }
  }

  async function view(id) {
    router.push(`/candidate/documents/${id}`);
  }

  const verified = documents.filter((d) => d.status === "Verified").length;
  const totalMB = documents.reduce((s, d) => s + (d.size || 0), 0) / (1024 * 1024);
  const usedPct = Math.min(100, (totalMB / 50) * 100);

  const displayed = tab === "Recent" ? documents.slice(0, 3) : documents;

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    uploadFiles(e.dataTransfer.files);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className="px-margin-desktop max-w-container-max space-y-8">
      {/* Security Banner */}
      <div className="bg-surface-container-high rounded-xl p-4 flex items-center justify-between border border-outline-variant">
        <div className="flex items-center space-x-3">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified_user
          </span>
          <div>
            <p className="text-label-md font-label-md text-on-surface">Secure Document Storage</p>
            <p className="text-label-sm font-label-sm text-on-surface-variant">
              Your files are encrypted with AES-256 and only accessible to verified recruiters.
            </p>
          </div>
        </div>
        <button className="px-4 py-2 text-secondary text-label-md font-label-md hover:bg-secondary-container rounded-full transition-colors">
          Learn More
        </button>
      </div>

      {msg.type === "success" && (
        <div className="bg-secondary/10 text-secondary rounded-lg px-4 py-2 text-body-md">{msg.text}</div>
      )}
      {msg.type === "error" && (
        <div className="bg-error-container text-on-error-container rounded-lg px-4 py-2 text-body-md">{msg.text}</div>
      )}

      {/* Drag & Drop Zone */}
      <section>
        <div
          id="drop-zone"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative overflow-hidden group border-2 border-dashed bg-surface-container-lowest rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-secondary cursor-pointer ${
            dragActive ? "drop-zone-active border-secondary bg-surface-container-low scale-[1.01]" : "border-outline-variant"
          }`}
        >
          <div className="relative z-10">
            <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mb-4 mx-auto transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-on-secondary-container text-3xl">upload_file</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface mb-2">
              {uploading ? "Uploading…" : "Drag and drop documents here"}
            </h3>
            <p className="text-body-md text-on-surface-variant max-w-md mx-auto mb-6">
              Upload your Resume, Cover Letter, or Certifications. Supported formats: PDF, DOCX (Max 10MB)
            </p>
            <button
              type="button"
              disabled={uploading}
              className="bg-secondary text-on-secondary px-8 py-3 rounded-full font-label-md hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-60"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,image/*"
              onChange={(e) => uploadFiles(e.target.files)}
            />
          </div>
        </div>
      </section>

      {/* Categorized File List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-headline-md font-headline-md text-on-surface">Your Documents</h4>
          <div className="flex bg-surface-container-high p-1 rounded-lg">
            {["All Files", "Recent"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-label-md rounded-md font-semibold transition-all ${
                  tab === t ? "bg-surface-container-lowest shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Document Name</th>
                <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Date Uploaded</th>
                <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">Loading…</td>
                </tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                    No documents yet. Upload your resume to get started.
                  </td>
                </tr>
              ) : (
                displayed.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${d.isPrimary ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-on-surface-variant"}`}>
                          <span className="material-symbols-outlined">{iconFor(d.category)}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-on-surface">{d.name}</span>
                            {d.isPrimary && (
                              <span className="bg-primary-container text-on-primary-container text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-label-sm text-on-surface-variant">
                            {fmtSize(d.size)} • {d.ext ? d.ext.toUpperCase() : "FILE"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-body-md text-on-surface">{d.category}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-body-md text-on-surface">{fmtDate(d.uploadedAt)}</span>
                    </td>
                    <td className="px-6 py-5">
                      {d.status === "Verified" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-secondary/10 text-secondary border border-secondary/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-highest text-on-surface-variant border border-outline-variant">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline mr-1.5 animate-pulse"></span>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <button onClick={() => view(d.id)} title="View" className="p-2 text-on-surface-variant hover:text-secondary hover:bg-secondary-container rounded-lg transition-all">
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </button>
                      <button onClick={() => remove(d.id)} title="Delete" className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-all">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Primary Resume + Vault Statistics */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant flex flex-col justify-between">
          <div>
            <h5 className="text-headline-md font-headline-md text-on-surface mb-2">Primary Resume Selection</h5>
            <p className="text-body-md text-on-surface-variant mb-6">
              Choose which resume is shown to employers by default when you apply to new positions.
            </p>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border border-outline-variant">
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-secondary">check_circle</span>
              <span className="font-semibold text-on-surface">
                {primaryId ? documents.find((d) => d.id === primaryId)?.name : "No resume set"}
              </span>
            </div>
            <button className="text-secondary font-label-md hover:underline">Change</button>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-secondary/5 rounded-full"></div>
          <h5 className="text-headline-md font-headline-md text-on-surface mb-2">Vault Statistics</h5>
          <div className="space-y-4 relative z-10 mt-4">
            <div className="flex justify-between items-end">
              <span className="text-label-md text-on-surface-variant">Storage Capacity</span>
              <span className="text-label-md font-bold text-on-surface">{totalMB.toFixed(1)} MB / 50 MB</span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: `${usedPct}%` }}></div>
            </div>
            <div className="flex space-x-4 pt-2">
              <div className="flex-1 p-3 bg-surface-container-low rounded-lg text-center">
                <p className="text-headline-md font-bold text-on-surface">{documents.length}</p>
                <p className="text-label-sm text-on-surface-variant">Total Files</p>
              </div>
              <div className="flex-1 p-3 bg-surface-container-low rounded-lg text-center">
                <p className="text-headline-md font-bold text-secondary">{verified}</p>
                <p className="text-label-sm text-on-surface-variant">Verified</p>
              </div>
              <div className="flex-1 p-3 bg-surface-container-low rounded-lg text-center">
                <p className="text-headline-md font-bold text-on-surface-variant">{Math.min(3, documents.length)}</p>
                <p className="text-label-sm text-on-surface-variant">Recent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Card */}
      <section className="bg-primary-container text-on-primary-fixed rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
        <div className="flex-1">
          <h4 className="text-headline-lg font-headline-lg text-on-primary mb-4">Control Who Sees Your Documents</h4>
          <p className="text-body-lg text-on-primary-container mb-6">
            Set granular permissions for your uploaded documents. Toggle visibility for recruiters, specific companies, or public job boards.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-on-primary-fixed-variant/20 border border-on-primary-fixed-variant/30 text-on-primary rounded-full text-label-md flex items-center">
              <span className="material-symbols-outlined mr-2 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
              Recruiters: On
            </span>
            <span className="px-4 py-2 bg-on-primary-fixed-variant/20 border border-on-primary-fixed-variant/30 text-on-primary rounded-full text-label-md flex items-center">
              <span className="material-symbols-outlined mr-2 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              Hidden for 3 Domains
            </span>
          </div>
        </div>
        <div className="w-full md:w-64 h-48 bg-white/10 rounded-lg backdrop-blur-md flex flex-col p-4 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-label-md text-on-primary">Privacy Mode</span>
            <div className="w-10 h-5 bg-secondary rounded-full relative">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-white/20 rounded w-full"></div>
            <div className="h-3 bg-white/10 rounded w-3/4"></div>
            <div className="h-3 bg-white/10 rounded w-5/6"></div>
          </div>
          <div className="mt-auto">
            <button className="w-full py-2 bg-white text-primary-container rounded-md text-label-md font-bold hover:bg-surface-bright transition-colors">
              Manage Access
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
