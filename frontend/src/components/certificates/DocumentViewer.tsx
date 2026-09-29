"use client";

import React, { useState } from "react";
import { DocumentMetadata } from "@/types/certificate";
import { formatBytes } from "@/lib/crypto";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  FileText,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

interface DocumentViewerProps {
  document?: DocumentMetadata;
  file?: File;
  sha256?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document: docProp,
  file,
  sha256,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedHash, setCopiedHash] = useState(false);

  const document: DocumentMetadata = docProp || {
    fileName: file?.name || "Document",
    fileType: file?.type || "application/octet-stream",
    fileSize: file?.size || 0,
    sha256: sha256 || "0x0",
    uploadedAt: new Date().toLocaleString(),
    previewUrl: file ? URL.createObjectURL(file) : undefined,
  };

  const isPdf = document.fileType.toLowerCase().includes("pdf") || document.fileName.toLowerCase().endsWith(".pdf");

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(document.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-panel border border-panel-border overflow-hidden flex flex-col font-sans select-none shadow-xl">
      {/* Top Controls Bar */}
      <div className="p-3.5 px-4 bg-panel-elevated border-b border-panel-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 truncate max-w-[280px] sm:max-w-md">
          {isPdf ? (
            <FileText className="w-4 h-4 text-rose-400 flex-shrink-0" />
          ) : (
            <ImageIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          )}
          <span className="text-slate-100 font-bold truncate">
            {document.fileName}
          </span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-lg border border-panel-border">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            className="p-1 hover:text-cyan-tech disabled:opacity-30 text-slate-400 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-slate-300 w-10 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2.5}
            className="p-1 hover:text-cyan-tech disabled:opacity-30 text-slate-400 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 hover:text-cyan-tech text-slate-400 transition-colors ml-1 border-l border-panel-border pl-1.5"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="relative bg-[#060a12] p-4 flex items-center justify-center min-h-[340px] max-h-[580px] overflow-auto">
        {document.previewUrl ? (
          isPdf ? (
            <div
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
              className="w-full h-[520px] transition-transform duration-150"
            >
              <iframe
                src={document.previewUrl}
                title={document.fileName}
                className="w-full h-full rounded-xl border border-panel-border bg-white"
              />
            </div>
          ) : (
            <div
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
              className="transition-transform duration-150 flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={document.previewUrl}
                alt={document.fileName}
                className="max-h-[500px] w-auto object-contain rounded-xl border border-panel-border shadow-2xl"
              />
            </div>
          )
        ) : (
          <div className="text-center p-8 space-y-2 text-slate-500 font-mono text-xs">
            <FileText className="w-10 h-10 mx-auto text-slate-600" />
            <p>Document preview unavailable</p>
          </div>
        )}
      </div>

      {/* Bottom Technical Metadata Bar */}
      <div className="p-3.5 bg-panel-elevated border-t border-panel-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-500 block">FILE TYPE</span>
          <span className="text-slate-200 truncate block">
            {document.fileType || "application/octet-stream"}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">FILE SIZE</span>
          <span className="text-slate-200">{formatBytes(document.fileSize)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">UPLOAD TIMESTAMP</span>
          <span className="text-slate-200 truncate block">{document.uploadedAt}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">SHA-256 FINGERPRINT</span>
          <div className="flex items-center justify-between text-cyan-400 mt-0.5">
            <span className="truncate max-w-[120px] sm:max-w-[140px]">
              {document.sha256}
            </span>
            <button
              onClick={handleCopyHash}
              className="text-slate-400 hover:text-cyan-tech p-0.5"
              title="Copy Full SHA-256"
            >
              {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
