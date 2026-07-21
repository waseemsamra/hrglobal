"use client";

import { useEffect, useState } from "react";
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
function isPdf(contentType = "") {
  return contentType === "application/pdf";
}
function isImage(contentType = "") {
  return contentType.startsWith("image/");
}
function isDoc(contentType = "") {
  return (
    contentType === "application/msword" ||
    contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    /\.(doc|docx)$/i.test(contentType)
  );
}

export default function DocumentPreviewer({ doc, fileUrl, onBack }) {
  const router = useRouter();
  const [previewError, setPreviewError] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // Validate the file is a real, non-empty PDF before handing it to the
  // browser's PDF viewer (an empty/corrupt file only yields a cryptic error).
  useEffect(() => {
    if (!isPdf(doc.contentType)) return;
    let cancelled = false;
    fetch(fileUrl)
      .then(async (r) => {
        if (!r.ok) throw new Error("bad status");
        const buf = await r.arrayBuffer();
        const head = new Uint8Array(buf.slice(0, 5));
        const validPdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;
        if (!cancelled && (!validPdf || buf.byteLength === 0)) setPreviewError(true);
      })
      .catch(() => !cancelled && setPreviewError(true));
    return () => {
      cancelled = true;
    };
  }, [fileUrl, doc.contentType]);

  const getDocPreviewUrl = () => {
    // Use Google Docs Viewer for DOC files
    // Note: This requires the file to be publicly accessible.
    // For localhost, it may not work, so we show a fallback.
    const encodedUrl = encodeURIComponent(window.location.origin + fileUrl);
    return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
  };

  const renderPreview = () => {
    if (isImage(doc.contentType)) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fileUrl}
          alt={doc.name}
          className="w-full rounded-xl bg-white shadow-lg object-contain"
        />
      );
    }

    if (isPdf(doc.contentType) && !previewError) {
      return (
        <iframe
          src={`${fileUrl}#toolbar=1&view=FitH`}
          title={doc.name}
          className="w-full min-h-[80vh] bg-white rounded-xl shadow-lg"
        />
      );
    }

    if (isPdf(doc.contentType) && previewError) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-error-container text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">picture_as_pdf</span>
          </div>
          <p className="font-headline-md text-headline-md text-on-surface mb-2">{doc.name}</p>
          <p className="text-on-surface-variant">
            This PDF could not be previewed. It may be empty or corrupted. Use Download to view the file.
          </p>
        </div>
      );
    }

    if (isDoc(doc.contentType) && !iframeError) {
      return (
        <iframe
          src={getDocPreviewUrl()}
          title={doc.name}
          className="w-full min-h-[80vh] bg-white rounded-xl shadow-lg"
          onError={() => setIframeError(true)}
          sandbox="allow-scripts allow-same-origin"
        />
      );
    }

    // Fallback for unsupported types or iframe errors
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-[36px] text-on-surface-variant">
            description
          </span>
        </div>
        <p className="font-headline-md text-headline-md text-on-surface mb-2">{doc.name}</p>
        <p className="text-on-surface-variant mb-4">
          Preview not available for this file type. Use Download to view the file.
        </p>
        <a
          href={fileUrl}
          download={doc.name}
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-lg font-bold hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined">download</span>
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: Preview */}
      <div className="w-full md:w-2/3 h-full overflow-y-auto preview-scroll bg-surface-container p-8 lg:p-12">
        <div className="max-w-[800px] mx-auto">{renderPreview()}</div>
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
                    {isPdf(doc.contentType) ? "picture_as_pdf" : isDoc(doc.contentType) ? "description" : "image"}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-body-md font-semibold text-primary truncate">{doc.name}</p>
                  <p className="text-label-sm text-outline">
                    {isPdf(doc.contentType)
                      ? "PDF Document"
                      : isDoc(doc.contentType)
                      ? "Word Document"
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
            <a
              href={fileUrl}
              download={doc.name}
              className="w-full flex items-center justify-between px-6 py-4 bg-secondary text-on-secondary rounded-xl font-headline-md hover:bg-on-secondary-container transition-all active:scale-[0.98]"
            >
              <span>Download</span>
              <span className="material-symbols-outlined">download</span>
            </a>
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
