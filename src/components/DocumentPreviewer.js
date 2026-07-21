"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

function getFileType(contentType = "", fileName = "") {
  const lower = (fileName || "").toLowerCase();
  if (contentType === "application/pdf" || /\.pdf$/i.test(lower)) return "pdf";
  if (contentType.startsWith("image/")) return "image";
  if (
    contentType === "application/msword" ||
    contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    /\.(doc|docx)$/i.test(lower)
  ) {
    return "doc";
  }
  return "other";
}

export default function DocumentPreviewer({ doc, fileUrl, onBack }) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const downloadingRef = useRef(false);
  const [previewUnsupported, setPreviewUnsupported] = useState(false);

  const fileType = getFileType(doc.contentType, doc.name);
  const isPreviewable = fileType === "pdf" || fileType === "image";

  const handleDownload = useCallback(async () => {
    if (downloadingRef.current) return;
    downloadingRef.current = true;
    setDownloading(true);
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(fileUrl, "_blank");
    } finally {
      downloadingRef.current = false;
      setDownloading(false);
    }
  }, [doc.name, fileUrl]);

  if (!isPreviewable) {
    return (
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full md:w-2/3 h-full overflow-y-auto preview-scroll bg-surface-container p-8 lg:p-12">
          <div className="max-w-[800px] mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant">description</span>
              </div>
              <p className="font-headline-md text-headline-md text-on-surface mb-2">{doc.name}</p>
              <p className="text-on-surface-variant mb-4">
                Preview is not supported for this file type. Download the file to view it.
              </p>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined">download</span>
                {downloading ? "Downloading..." : "Download File"}
              </button>
            </div>
          </div>
        </div>

        <aside className="hidden md:block w-1/3 bg-surface-container-lowest border-l border-outline-variant p-8 overflow-y-auto">
          <div className="space-y-8">
            <div>
              <h2 className="text-headline-md font-headline-md text-primary mb-6">Document Details</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-outline-variant bg-surface-bright flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px]">
                      {fileType === "pdf" ? "picture_as_pdf" : fileType === "doc" ? "description" : "image"}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-body-md font-semibold text-primary truncate">{doc.name}</p>
                    <p className="text-label-sm text-outline">
                      {fileType === "pdf"
                        ? "PDF Document"
                        : fileType === "doc"
                        ? "Word Document"
                        : fileType === "image"
                        ? "Image"
                        : doc.contentType || "Document"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-container-low">
                    <p className="text-label-sm text-outline uppercase mb-1">Last Updated</p>
                    <p className="text-body-md font-medium text-on-surface">{fmtDate(doc.updatedAt || doc.uploadedAt)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low">
                    <p className="text-label-sm text-outline uppercase mb-1">File Size</p>
                    <p className="text-body-md font-medium text-on-surface">{fmtSize(doc.size)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low">
                    <p className="text-label-sm text-outline uppercase mb-1">Category</p>
                    <p className="text-body-md font-medium text-on-surface">{doc.category || "—"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low">
                    <p className="text-label-sm text-outline uppercase mb-1">Status</p>
                    <p className="text-body-md font-medium text-on-surface">{doc.status || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-label-md font-label-md text-outline uppercase">Actions</h3>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full flex items-center justify-between px-6 py-4 bg-secondary text-on-secondary rounded-xl font-headline-md hover:bg-on-secondary-container transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span>{downloading ? "Downloading..." : "Download"}</span>
                <span className="material-symbols-outlined">download</span>
              </button>
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-full flex items-center justify-between px-6 py-4 border-2 border-secondary text-secondary rounded-xl font-headline-md hover:bg-secondary-container transition-all active:scale-[0.98]"
                >
                  <span>Back</span>
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-between px-6 py-4 bg-surface-container-high text-on-surface rounded-xl font-headline-md hover:bg-surface-container-highest transition-all active:scale-[0.98]"
              >
                <span>Print</span>
                <span className="material-symbols-outlined">print</span>
              </button>
            </div>

            <div className="pt-8 border-t border-outline-variant">
              <h3 className="text-label-md font-label-md text-outline uppercase mb-4">Integrity Check</h3>
              <div className="flex items-center gap-3 text-secondary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <span className="text-body-md font-medium">Securely Stored</span>
              </div>
              <p className="mt-2 text-label-sm text-on-surface-variant leading-relaxed">
                This document is encrypted (AES-256) and only accessible to you and verified recruiters.
              </p>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: Preview */}
      <div className="w-full md:w-2/3 h-full overflow-y-auto preview-scroll bg-surface-container p-8 lg:p-12">
        <div className="max-w-[800px] mx-auto">
          <iframe
            src={fileUrl}
            title={doc.name}
            className="w-full min-h-[80vh] bg-white rounded-xl shadow-lg"
          />
        </div>
      </div>

      {/* Right: Metadata & Actions */}
      <aside className="hidden md:block w-1/3 bg-surface-container-lowest border-l border-outline-variant p-8 overflow-y-auto">
        <div className="space-y-8">
          <div>
            <h2 className="text-headline-md font-headline-md text-primary mb-6">Document Details</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-outline-variant bg-surface-bright flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">
                    {fileType === "pdf" ? "picture_as_pdf" : fileType === "doc" ? "description" : "image"}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-body-md font-semibold text-primary truncate">{doc.name}</p>
                  <p className="text-label-sm text-outline">
                    {fileType === "pdf"
                      ? "PDF Document"
                      : fileType === "doc"
                      ? "Word Document"
                      : fileType === "image"
                      ? "Image"
                      : doc.contentType || "Document"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-container-low">
                  <p className="text-label-sm text-outline uppercase mb-1">Last Updated</p>
                  <p className="text-body-md font-medium text-on-surface">{fmtDate(doc.updatedAt || doc.uploadedAt)}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low">
                  <p className="text-label-sm text-outline uppercase mb-1">File Size</p>
                  <p className="text-body-md font-medium text-on-surface">{fmtSize(doc.size)}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low">
                  <p className="text-label-sm text-outline uppercase mb-1">Category</p>
                  <p className="text-body-md font-medium text-on-surface">{doc.category || "—"}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low">
                  <p className="text-label-sm text-outline uppercase mb-1">Status</p>
                  <p className="text-body-md font-medium text-on-surface">{doc.status || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-label-md font-label-md text-outline uppercase">Actions</h3>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-between px-6 py-4 bg-secondary text-on-secondary rounded-xl font-headline-md hover:bg-on-secondary-container transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{downloading ? "Downloading..." : "Download"}</span>
              <span className="material-symbols-outlined">download</span>
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="w-full flex items-center justify-between px-6 py-4 border-2 border-secondary text-secondary rounded-xl font-headline-md hover:bg-secondary-container transition-all active:scale-[0.98]"
              >
                <span>Back</span>
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-between px-6 py-4 bg-surface-container-high text-on-surface rounded-xl font-headline-md hover:bg-surface-container-highest transition-all active:scale-[0.98]"
            >
              <span>Print</span>
              <span className="material-symbols-outlined">print</span>
            </button>
          </div>

          <div className="pt-8 border-t border-outline-variant">
            <h3 className="text-label-md font-label-md text-outline uppercase mb-4">Integrity Check</h3>
            <div className="flex items-center gap-3 text-secondary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span className="text-body-md font-medium">Securely Stored</span>
            </div>
            <p className="mt-2 text-label-sm text-on-surface-variant leading-relaxed">
              This document is encrypted (AES-256) and only accessible to you and verified recruiters.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
