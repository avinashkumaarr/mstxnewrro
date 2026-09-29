"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, Image as ImageIcon, AlertCircle, CheckCircle2, Loader2, Copy, Check } from "lucide-react";
import { calculateFileSHA256, formatBytes } from "@/lib/crypto";

interface DocumentUploaderProps {
  onFileSelected: (file: File, sha256: string) => void;
  isProcessing?: boolean;
  isVerifying?: boolean;
}

const SUPPORTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onFileSelected,
  isProcessing = false,
  isVerifying = false,
}) => {
  const activeProcessing = isProcessing || isVerifying;
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [calculatingHash, setCalculatingHash] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);

    // Validate type
    if (!SUPPORTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|png|jpe?g)$/i)) {
      setError(`Unsupported file type (${file.type || "unknown"}). Only PDF, PNG, JPG, and JPEG documents are supported.`);
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size (${formatBytes(file.size)}) exceeds maximum limit of 25MB.`);
      return;
    }

    setCurrentFile(file);
    setCalculatingHash(true);

    try {
      // Calculate real SHA-256 using Web Crypto
      const hash = await calculateFileSHA256(file);
      setCurrentHash(hash);
      setCalculatingHash(false);
      onFileSelected(file, hash);
    } catch {
      setCalculatingHash(false);
      setError("Failed to calculate SHA-256 fingerprint using Web Crypto API.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleCopyHash = () => {
    if (currentHash) {
      navigator.clipboard.writeText(currentHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? "border-cyan-400 bg-cyan-950/30 scale-[1.01]"
            : "border-panel-border bg-panel hover:border-cyan-500/50 hover:bg-panel-elevated/60"
        } ${isProcessing ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-tech shadow-cyan-glow">
            {calculatingHash ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">
              {dragActive ? "Drop document to inspect" : "Upload any certificate or document"}
            </h3>
            <p className="text-xs text-slate-400">
              Drag & drop or browse from your device • Supported: <strong className="text-slate-300">PDF, PNG, JPG, JPEG</strong> (up to 25MB)
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-[10px] font-mono text-cyan-tech bg-slate-950/80 px-3 py-1 rounded-full border border-panel-border">
            <span>Client-side Web Crypto SHA-256 fingerprinting</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected Document Metadata Bar */}
      {currentFile && currentHash && !error && (
        <div className="p-4 rounded-xl bg-panel-elevated border border-cyan-500/30 font-mono text-xs space-y-2.5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-panel-border pb-2.5">
            <div className="flex items-center gap-2 text-slate-100 font-bold truncate">
              {currentFile.type.includes("pdf") ? (
                <FileText className="w-4 h-4 text-rose-400 flex-shrink-0" />
              ) : (
                <ImageIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              )}
              <span className="truncate">{currentFile.name}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-shrink-0">
              <span>{formatBytes(currentFile.size)}</span>
              <span>•</span>
              <span className="uppercase">{currentFile.type || "FILE"}</span>
            </div>
          </div>

          {/* Real SHA-256 Fingerprint */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>DOCUMENT FINGERPRINT (SHA-256):</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Computed via crypto.subtle
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 p-2 rounded bg-black/60 border border-panel-border">
              <span className="text-cyan-400 font-mono text-[11px] truncate select-all">
                {currentHash}
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-tech transition-colors flex-shrink-0"
                title="Copy SHA-256 Hash"
              >
                {copiedHash ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
