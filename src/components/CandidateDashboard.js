"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function StarRow({ rating = 0 }) {
  return (
    <div className="flex items-center gap-1 text-secondary">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="material-symbols-outlined text-[16px]"
          style={n <= rating ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          star
        </span>
      ))}
    </div>
  );
}

const DOC_ICONS = {
  pdf: "picture_as_pdf",
  doc: "description",
  verified: "verified_user",
};

export default function CandidateDashboard({ candidate }) {
  const router = useRouter();
  const dropRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/candidates/documents")
      .then((r) => (r.ok ? r.json() : { documents: [] }))
      .then((data) => {
        if (!cancelled) {
          setDocuments(data.documents || []);
          setLoadingDocs(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingDocs(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current?.classList.add("bg-secondary-fixed");
  };
  const handleDragLeaveOrDrop = (e) => {
    e.preventDefault();
    dropRef.current?.classList.remove("bg-secondary-fixed");
  };

  const score = candidate.score || {};
  const circumference = 364.42;
  const overall = score.overall || 0;
  const dashOffset = circumference - (circumference * overall) / 100;

  return (
    <div className="p-container-padding-desktop max-w-[1440px] mx-auto">
      <div className="bento-grid">
        {/* Profile Summary Card */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col sm:flex-row gap-8 items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-3 py-1 rounded-full text-label-md font-label-md status-progress border border-secondary/20">
              {candidate.status || "Active Hiring"}
            </span>
          </div>
          {candidate.avatar ? (
            <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w-full h-full object-cover" alt={candidate.name} src={candidate.avatar} />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-surface-variant flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="text-headline-lg font-headline-lg text-on-surface">{candidate.name}</h2>
              <p className="text-body-md text-on-surface-variant">
                {candidate.role}
                {candidate.department ? ` • ${candidate.department}` : ""}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 bg-surface rounded-lg">
                <p className="text-label-md text-on-tertiary-container uppercase tracking-wider mb-1">
                  Applied Date
                </p>
                <p className="font-bold text-on-surface">{candidate.appliedDate}</p>
              </div>
              <div className="p-4 bg-surface rounded-lg">
                <p className="text-label-md text-on-tertiary-container uppercase tracking-wider mb-1">
                  Current Stage
                </p>
                <p className="font-bold text-on-surface">{candidate.stage}</p>
              </div>
              <div className="p-4 bg-surface rounded-lg">
                <p className="text-label-md text-on-tertiary-container uppercase tracking-wider mb-1">
                  Lead Recruiter
                </p>
                <p className="font-bold text-on-surface">{candidate.recruiter}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Score */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-8">
          <h3 className="text-title-md font-title-md mb-6">Evaluation Score</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  className="text-surface-container"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className="text-secondary"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="58"
                  stroke="currentColor"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeWidth="8"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-headline-lg font-headline-lg">{overall}</span>
                <span className="text-label-md text-on-tertiary-container">/ 100</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "Cultural Fit", value: score.culturalFit || 0 },
              { label: "Technical Skill", value: score.technical || 0 },
              { label: "Experience", value: score.experience || 0 },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-body-sm text-on-surface-variant">{item.label}</span>
                <div className="h-2 w-24 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Timeline */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-title-md font-title-md">Application Timeline</h3>
            <button className="text-secondary font-bold text-label-md flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span> View Calendar
            </button>
          </div>
          <div className="relative ml-2">
            <div className="timeline-line"></div>
            <div className="space-y-8">
              {(candidate.timeline || []).map((item, idx) => (
                <div
                  key={idx}
                  className={`relative pl-10 ${item.state === "future" ? "opacity-40" : ""}`}
                >
                  {item.state === "done" && (
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center z-10 border-4 border-white shadow-sm">
                      <span
                        className="material-symbols-outlined text-white text-[12px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check
                      </span>
                    </div>
                  )}
                  {item.state === "current" && (
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-2 border-secondary flex items-center justify-center z-10 shadow-sm animate-pulse">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    </div>
                  )}
                  {item.state === "future" && (
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-container-high z-10 border-4 border-white shadow-sm"></div>
                  )}
                  <div>
                    <p
                      className={`text-body-md font-bold ${
                        item.state === "current"
                          ? "text-secondary"
                          : item.state === "future"
                          ? "text-on-surface-variant"
                          : "text-on-surface"
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-label-md text-on-tertiary-container mb-2">{item.date}</p>
                    {item.state === "current" ? (
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-primary text-white text-label-md rounded-lg">
                          View Feedback
                        </button>
                        <button className="px-4 py-2 border border-outline-variant text-on-surface text-label-md rounded-lg">
                          Reschedule
                        </button>
                      </div>
                    ) : item.detail ? (
                      idx === 0 ? (
                        <div className="p-3 bg-surface rounded text-body-sm text-on-surface-variant">
                          {item.detail}
                        </div>
                      ) : (
                        <p className="text-body-sm text-on-surface-variant">{item.detail}</p>
                      )
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document Vault */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-8">
          <h3 className="text-title-md font-title-md mb-6">Document Vault</h3>
          <div className="space-y-4 mb-8">
            {(documents.length > 0 ? documents : (candidate.documents || [])).map((doc, idx) => {
              const isCandidateDoc = !!doc.id && doc.id.length === 24;
              return (
                <div
                  key={doc.id || idx}
                  className={`flex items-center justify-between p-4 border border-outline-variant rounded-lg transition-colors group ${
                    doc.verified || doc.status === "Verified" ? "bg-surface/50" : "hover:border-secondary"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded flex items-center justify-center ${
                        doc.verified || doc.status === "Verified" ? "bg-green-500/10 text-green-700" : "bg-secondary/5 text-secondary"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={doc.verified || doc.status === "Verified" ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {DOC_ICONS[doc.type] || DOC_ICONS[doc.category] || "description"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-body-sm font-bold text-on-surface">{doc.name}</p>
                        {(doc.verified || doc.status === "Verified") && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-700 font-bold uppercase">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-label-md text-on-tertiary-container">
                        {doc.status === "Pending" ? "Pending verification" : (doc.meta || doc.category || "Document")}
                      </p>
                    </div>
                  </div>
                  {isCandidateDoc && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => router.push(`/candidate/documents/${doc.id}`)}
                        title="Preview"
                        className="p-2 text-on-surface-variant hover:text-secondary"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      <a
                        href={`/api/candidates/documents/${doc.id}`}
                        download={doc.name}
                        title="Download"
                        className="p-2 text-on-surface-variant hover:text-secondary"
                        onClick={() => router.refresh()}
                      >
                        <span className="material-symbols-outlined">download</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div
            ref={dropRef}
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeaveOrDrop}
            onDrop={handleDragLeaveOrDrop}
            className="upload-zone p-10 rounded-xl flex flex-col items-center justify-center text-center"
          >
            <span className="material-symbols-outlined text-4xl text-on-tertiary-container mb-4">
              cloud_upload
            </span>
            <h4 className="text-body-md font-bold text-on-surface mb-1">Drag and drop files here</h4>
            <p className="text-label-md text-on-tertiary-container mb-4">
              Max file size 20MB. Supports PDF, DOCX, PNG.
            </p>
            <button className="px-6 py-2 bg-primary text-white text-label-md font-bold rounded-lg hover:opacity-90 transition-opacity">
              Browse Files
            </button>
          </div>
        </div>

        {/* Recent Interview Feedback */}
        <div className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-title-md font-title-md">Recent Interview Feedback</h3>
            <button className="px-4 py-2 border border-outline-variant text-label-md font-bold rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add_comment</span> Add Note
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(candidate.feedback || []).map((fb, idx) => (
              <div key={idx} className="p-6 bg-surface rounded-xl border border-outline-variant">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                  <div>
                    <p className="text-label-md font-bold text-on-surface">{fb.author}</p>
                    <p className="text-[10px] text-on-tertiary-container uppercase font-bold">
                      {fb.role}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-body-sm text-on-surface-variant mb-4 ${
                    fb.italic ? "italic" : ""
                  }`}
                >
                  {fb.italic ? `"${fb.comment}"` : fb.comment}
                </p>
                {fb.tag ? (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-bold text-on-surface-variant">
                      {fb.tag}
                    </span>
                  </div>
                ) : (
                  <StarRow rating={fb.rating} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-secondary text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group">
          <span className="material-symbols-outlined text-3xl">chat</span>
          <span className="absolute right-16 bg-on-surface text-white px-3 py-1 rounded text-label-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Message Candidate
          </span>
        </button>
      </div>
    </div>
  );
}
