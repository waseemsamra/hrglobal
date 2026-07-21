"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const downloadingRef = useRef(false);
  const blobUrlRef = useRef(null);

  const fileType = getFileType(doc.contentType, doc.name);

  useEffect(() => {
    let cancelled = false;
    async function loadPreview() {
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error("Failed to load document");
        const blob = await res.blob();
        if (!blob || blob.size === 0) throw new Error("Empty document");

        const url = window.URL.createObjectURL(blob);
        blobUrlRef.current = url;

        if (!cancelled) {
          setPreviewUrl(url);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        window.URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [fileUrl]);

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

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <span className="material-symbols-outlined text-[48px] text-secondary animate-pulse">hourglass_top</span>
            <p className="text-body-md text-on-surface-variant mt-4">Loading document...</p>
          </div>
        </div>
      );
    }

    if (error || !previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-20 h-20 mb-4 rounded-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant">description</span>
          </div>
          <p className="text-headline-md font-headline-md text-on-surface mb-2">{doc.name}</p>
          <p className="text-body-md text-on-surface-variant mb-6">
            {error ? "This file could not be loaded." : "Preview is not available for this file type."}
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
      );
    }

    if (fileType === "image") {
      return (
        <img
          src={previewUrl}
          alt={doc.name}
          className="w-full h-full object-contain"
        />
      );
    }

    if (fileType === "pdf" || fileType === "doc") {
      return (
        <iframe
          src={previewUrl}
          title={doc.name}
          className="w-full h-full border-0"
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-20 h-20 mb-4 rounded-full bg-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-[40px] text-on-surface-variant">description</span>
        </div>
        <p className="text-headline-md font-headline-md text-on-surface mb-2">{doc.name}</p>
        <p className="text-body-md text-on-surface-variant mb-6">Preview is not available for this file type.</p>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined">download</span>
          {downloading ? "Downloading..." : "Download File"}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 h-full overflow-y-auto bg-surface-container">
        {renderPreview()}
      </div>

      <aside className="hidden md:block w-80 bg-surface-container-lowest border-l border-outline-variant p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-headline-md font-headline-md text-primary mb-4">Document Details</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-outline-variant bg-surface-bright flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">
                    {fileType === "pdf" ? "picture_as_pdf" : fileType === "doc" ? "description" : "image"}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-body-sm font-semibold text-primary truncate">{doc.name}</p>
                  <p className="text-label-sm text-outline">
                    {fileType === "pdf"
                      ? "PDF"
                      : fileType === "doc"
                      ? "Word"
                      : fileType === "image"
                      ? "Image"
                      : "Document"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-surface-container-low">
                  <p className="text-label-sm text-outline uppercase mb-1">Size</p>
                  <p className="text-body-sm font-medium text-on-surface">{fmtSize(doc.size)}</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low">
                  <p className="text-label-sm text-outline uppercase mb-1">Status</p>
                  <p className="text-body-sm font-medium text-on-surface">{doc.status || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-between px-4 py-3 bg-secondary text-on-secondary rounded-xl font-headline-md hover:bg-on-secondary-container transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{downloading ? "Downloading..." : "Download"}</span>
              <span className="material-symbols-outlined">download</span>
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="w-full flex items-center justify-between px-4 py-3 border-2 border-secondary text-secondary rounded-xl font-headline-md hover:bg-secondary-container transition-all active:scale-[0.98]"
              >
                <span>Back</span>
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
