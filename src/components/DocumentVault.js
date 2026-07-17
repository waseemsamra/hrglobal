"use client";

import { useEffect, useRef, useState } from "react";

const STATUS_STYLES = {
  Verified: "bg-green-50 text-green-700 border-green-100",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-100",
  Pending: "bg-slate-100 text-slate-700 border-slate-200",
};

const TYPE_ICON = {
  "PDF Document": { icon: "picture_as_pdf", cls: "bg-red-50 text-red-600" },
  Identification: { icon: "image", cls: "bg-blue-50 text-blue-600" },
  "Word Document": { icon: "description", cls: "bg-indigo-50 text-indigo-600" },
  Certification: { icon: "verified_user", cls: "bg-orange-50 text-orange-600" },
  Other: { icon: "text_snippet", cls: "bg-slate-100 text-slate-600" },
};

function formatSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function timeAgo(date) {
  if (!date) return "";
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 172800) return "Yesterday";
  return `${Math.floor(diff / 86400)} days ago`;
}

export default function DocumentVault() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]); // {name, progress, error}
  const [candidate, setCandidate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [dragActive, setDragActive] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const fileInputRef = useRef(null);

  const loadDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (e) {
      console.error("Failed to load documents:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const uploadFiles = (fileList) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    files.forEach((file) => {
      const uploadId = `${file.name}-${Date.now()}-${Math.random()}`;
      setUploads((prev) => [...prev, { id: uploadId, name: file.name, progress: 0, error: null }]);

      const formData = new FormData();
      formData.append("files", file);
      formData.append("candidate", candidate.trim() || "Unassigned");
      formData.append("status", status);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/documents");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, progress: pct } : u))
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploads((prev) => prev.filter((u) => u.id !== uploadId));
          loadDocuments();
        } else {
          let msg = "Upload failed";
          try {
            msg = JSON.parse(xhr.responseText).error || msg;
          } catch {}
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, error: msg } : u))
          );
        }
      };

      xhr.onerror = () => {
        setUploads((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, error: "Network error" } : u))
        );
      };

      xhr.send(formData);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  };

  const handleDelete = async (id) => {
    setOpenMenu(null);
    if (!confirm("Delete this document permanently?")) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const totalBytes = documents.reduce((sum, d) => sum + (d.size || 0), 0);
  const totalGB = 25;
  const usedGB = totalBytes / (1024 * 1024 * 1024);
  const usedPct = Math.min((usedGB / totalGB) * 100, 100);

  return (
    <div className="max-w-[1440px] mx-auto p-container-padding-desktop">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-stack-lg gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Document Vault</h1>
          <p className="text-body-md text-on-surface-variant mt-2">
            Manage candidate compliance and employment verification records.
          </p>
        </div>
        <div className="flex gap-stack-md">
          <button className="bg-white border border-outline-variant px-6 py-2.5 rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">filter_list</span> Filter
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:bg-opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-lg">upload</span> Bulk Upload
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) uploadFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left column */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          {/* Upload card */}
          <div className="bg-white border border-outline-variant rounded-xl p-stack-lg transition-all">
            <h3 className="font-title-md text-title-md mb-stack-md">Upload Documents</h3>

            {/* Optional metadata */}
            <div className="space-y-2 mb-stack-md">
              <input
                type="text"
                value={candidate}
                onChange={(e) => setCandidate(e.target.value)}
                placeholder="Candidate name (optional)"
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-secondary outline-none"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-secondary outline-none"
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Verified</option>
              </select>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-stack-lg flex flex-col items-center justify-center text-center group cursor-pointer transition-all ${
                dragActive
                  ? "border-secondary bg-secondary/5"
                  : "border-outline-variant hover:bg-surface-container-low"
              }`}
            >
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-stack-md transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-secondary text-3xl">cloud_upload</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface mb-1">Click or drag files here</p>
              <p className="text-body-sm text-on-surface-variant">PDF, DOCX or JPG (Max 10MB)</p>
              <span className="mt-stack-md text-secondary font-label-md text-label-md hover:underline">
                Browse Files
              </span>
            </div>

            {/* Active uploads */}
            {uploads.length > 0 && (
              <div className="mt-stack-lg space-y-stack-md">
                {uploads.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 bg-surface-container-lowest border border-outline-variant rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-on-surface-variant">
                          description
                        </span>
                        <span className="text-body-sm font-semibold truncate max-w-[150px]">
                          {u.name}
                        </span>
                      </div>
                      <span className={`text-label-md ${u.error ? "text-error" : "text-secondary"}`}>
                        {u.error ? "Failed" : `${u.progress}%`}
                      </span>
                    </div>
                    {u.error ? (
                      <p className="text-[11px] text-error">{u.error}</p>
                    ) : (
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-secondary rounded-full transition-all"
                          style={{ width: `${u.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Storage summary */}
          <div className="bg-primary text-white rounded-xl p-stack-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-on-secondary-fixed opacity-70 text-label-md font-label-md mb-1 uppercase tracking-wider">
                  Vault Usage
                </p>
                <h4 className="text-3xl font-bold">{usedGB.toFixed(2)} GB</h4>
              </div>
              <span className="material-symbols-outlined opacity-50 text-3xl">database</span>
            </div>
            <div className="h-2 w-full bg-white/20 rounded-full mb-4">
              <div
                className="h-full bg-secondary-fixed rounded-full"
                style={{ width: `${usedPct}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-label-md font-label-md opacity-80">
              <span>Used: {usedGB.toFixed(2)} GB</span>
              <span>Total: {totalGB.toFixed(1)} GB</span>
            </div>
          </div>
        </div>

        {/* Right column: table */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden">
            <div className="px-stack-lg py-stack-md border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-title-md text-title-md">Recent Documents</h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-50 rounded-lg material-symbols-outlined text-on-surface-variant">
                  view_list
                </button>
                <button className="p-2 hover:bg-slate-50 rounded-lg material-symbols-outlined text-on-surface-variant">
                  grid_view
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-outline-variant">
                    <th className="px-stack-lg py-4 font-label-md text-label-md text-on-surface-variant">NAME</th>
                    <th className="px-stack-lg py-4 font-label-md text-label-md text-on-surface-variant">CANDIDATE</th>
                    <th className="px-stack-lg py-4 font-label-md text-label-md text-on-surface-variant">TYPE</th>
                    <th className="px-stack-lg py-4 font-label-md text-label-md text-on-surface-variant">STATUS</th>
                    <th className="px-stack-lg py-4 font-label-md text-label-md text-on-surface-variant text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-stack-lg py-10 text-center text-on-surface-variant">
                        Loading documents...
                      </td>
                    </tr>
                  ) : documents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-stack-lg py-10 text-center text-on-surface-variant">
                        No documents yet. Upload your first file above.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => {
                      const icon = TYPE_ICON[doc.type] || TYPE_ICON.Other;
                      const statusCls = STATUS_STYLES[doc.status] || STATUS_STYLES.Pending;
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-stack-lg py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${icon.cls}`}>
                                <span className="material-symbols-outlined">{icon.icon}</span>
                              </div>
                              <div>
                                <p className="text-body-sm font-semibold">{doc.name}</p>
                                <p className="text-[11px] text-on-surface-variant">
                                  {formatSize(doc.size)} • {timeAgo(doc.uploadedAt)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-stack-lg py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-slate-200"></div>
                              <span className="text-body-sm">{doc.candidate}</span>
                            </div>
                          </td>
                          <td className="px-stack-lg py-4 text-body-sm">{doc.type}</td>
                          <td className="px-stack-lg py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusCls}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-stack-lg py-4 text-right relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === doc.id ? null : doc.id)}
                              className="material-symbols-outlined text-on-surface-variant hover:text-primary"
                            >
                              more_vert
                            </button>
                            {openMenu === doc.id && (
                              <div className="absolute right-8 top-10 z-20 bg-white border border-outline-variant rounded-lg shadow-lg py-1 w-40 text-left">
                                <a
                                  href={`/api/documents/${doc.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setOpenMenu(null)}
                                  className="flex items-center gap-2 px-4 py-2 text-body-sm hover:bg-slate-50"
                                >
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                  View
                                </a>
                                <a
                                  href={`/api/documents/${doc.id}?download=1`}
                                  onClick={() => setOpenMenu(null)}
                                  className="flex items-center gap-2 px-4 py-2 text-body-sm hover:bg-slate-50"
                                >
                                  <span className="material-symbols-outlined text-[18px]">download</span>
                                  Download
                                </a>
                                <button
                                  onClick={() => handleDelete(doc.id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-body-sm text-error hover:bg-red-50"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-stack-lg py-stack-md bg-slate-50 border-t border-outline-variant flex justify-between items-center text-label-md font-label-md">
              <span className="text-on-surface-variant">
                Showing {documents.length} document{documents.length === 1 ? "" : "s"}
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-outline-variant rounded hover:bg-white transition-colors">
                  Previous
                </button>
                <button className="px-3 py-1 border border-outline-variant bg-white rounded shadow-sm">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
