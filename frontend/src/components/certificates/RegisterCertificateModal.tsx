"use client";

import React, { useState } from "react";
import {
  ExtractedDocumentFields,
  RegistrationResult,
  DocumentMetadata,
} from "@/types/certificate";
import { calculateFileSHA256, formatFileSize } from "@/lib/crypto";
import { certificateService } from "@/services/certificateService";
import {
  Award,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  X,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface RegisterCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: (result: RegistrationResult) => void;
}

export const RegisterCertificateModal: React.FC<RegisterCertificateModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [credentialId, setCredentialId] = useState("");
  const [issuerNotes, setIssuerNotes] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>("");
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setIsHashing(true);

    try {
      const hash = await calculateFileSHA256(selectedFile);
      const meta: DocumentMetadata = {
        fileName: selectedFile.name,
        fileType: selectedFile.type || "application/octet-stream",
        fileSize: selectedFile.size,
        sha256: hash,
        uploadedAt: new Date().toLocaleString(),
        previewUrl: URL.createObjectURL(selectedFile),
      };
      setMetadata(meta);

      // Attempt OCR extraction to auto-fill fields if backend is responsive
      setIsOcrLoading(true);
      try {
        const ocr = await certificateService.analyzeDocument(selectedFile);
        if (ocr.fields) {
          if (ocr.fields.certificateTitle) setTitle(ocr.fields.certificateTitle);
          if (ocr.fields.recipientName) setRecipientName(ocr.fields.recipientName);
          if (ocr.fields.issuerName) setIssuerName(ocr.fields.issuerName);
          if (ocr.fields.issueDate) setIssueDate(ocr.fields.issueDate);
          if (ocr.fields.credentialId) setCredentialId(ocr.fields.credentialId);
        }
      } catch {
        // Fallback silently if OCR backend unavailable
      } finally {
        setIsOcrLoading(false);
      }
    } catch {
      // Hashing error
    } finally {
      setIsHashing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !metadata) return;

    setIsSubmitting(true);
    setSubmitStep("Submitting registration payload to backend & MST Blockchain...");

    const fields: ExtractedDocumentFields = {
      certificateTitle: title.trim() || file.name,
      title: title.trim() || file.name,
      recipientName: recipientName.trim() || undefined,
      issuerName: issuerName.trim() || undefined,
      issuer: issuerName.trim() || undefined,
      issueDate: issueDate.trim() || undefined,
      credentialId: credentialId.trim() || undefined,
    };

    const res = await certificateService.registerCertificate({
      file,
      documentHash: metadata.sha256,
      fields,
      issuerNotes: issuerNotes.trim() || undefined,
    });

    setResult(res);
    setIsSubmitting(false);

    if (res.success && onRegistered) {
      onRegistered(res);
    }
  };

  const handleCopy = (text: string, type: "hash" | "tx") => {
    navigator.clipboard.writeText(text);
    if (type === "hash") {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  const resetForm = () => {
    setFile(null);
    setMetadata(null);
    setTitle("");
    setRecipientName("");
    setIssuerName("");
    setCredentialId("");
    setIssuerNotes("");
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none font-sans animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-panel border border-cyan-500/40 shadow-2xl p-6 space-y-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-panel-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-cyan-glow">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-tech">
                <span>ISSUER REGISTRATION</span>
                <span className="text-slate-600">/</span>
                <span>MST TESTNET ANCHOR</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Register Document on Blockchain
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Successful Registration View */}
        {result?.success ? (
          <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-500/50 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
              <div>
                <h4 className="text-base font-bold text-emerald-300">
                  Document Successfully Registered!
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  The document cryptographic SHA-256 fingerprint is permanently recorded on MST Testnet.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 font-mono text-xs pt-2">
              <div className="p-3 rounded-lg bg-black/40 border border-panel-border space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Cryptographic Document SHA-256</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-cyan-tech break-all text-[11px]">
                    {result.registeredHash || metadata?.sha256}
                  </span>
                  <button
                    onClick={() => handleCopy(result.registeredHash || metadata?.sha256 || "", "hash")}
                    className="p-1 text-slate-400 hover:text-slate-200"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {result.transactionHash && (
                <div className="p-3 rounded-lg bg-black/40 border border-panel-border space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase">MST Transaction Hash</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-emerald-400 break-all text-[11px]">
                      {result.transactionHash}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(result.transactionHash || "", "tx")}
                        className="p-1 text-slate-400 hover:text-slate-200"
                      >
                        {copiedTx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={`https://testnet.mstscan.com/tx/${result.transactionHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-cyan-tech hover:text-cyan-300"
                        title="View on MST Explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {result.blockNumber && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-panel-border text-[11px]">
                  <span className="text-slate-400">BLOCK NUMBER:</span>
                  <span className="text-slate-100 font-bold">#{result.blockNumber}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-panel-elevated hover:bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Register Another Document
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Upload Area */}
            {!file ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="p-8 border-2 border-dashed border-panel-border hover:border-cyan-500/60 rounded-2xl bg-panel-elevated/40 text-center space-y-3 cursor-pointer transition-colors"
                onClick={() => {
                  const input = document.getElementById("issuer-file-input");
                  if (input) input.click();
                }}
              >
                <input
                  id="issuer-file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-tech">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-200">
                    Click to select or drag and drop a certificate/document
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    Supports PDF, PNG, JPG, JPEG (Max 25MB)
                  </p>
                </div>
              </div>
            ) : (
              /* Selected File Card */
              <div className="p-4 rounded-xl bg-panel-elevated border border-panel-border space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-cyan-tech flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 truncate max-w-sm">
                        {file.name}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {formatFileSize(file.size)} • {file.type || "Document"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setMetadata(null);
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Change File
                  </button>
                </div>

                {isHashing ? (
                  <div className="flex items-center gap-2 text-xs text-cyan-tech">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Computing cryptographic SHA-256 hash in browser...</span>
                  </div>
                ) : metadata?.sha256 ? (
                  <div className="p-2.5 rounded-lg bg-black/50 border border-panel-border text-[11px] space-y-1">
                    <span className="text-slate-400 text-[9px] uppercase tracking-wider block">
                      Web Crypto SHA-256 Fingerprint
                    </span>
                    <span className="text-cyan-tech break-all font-mono block">
                      {metadata.sha256}
                    </span>
                  </div>
                ) : null}

                {isOcrLoading && (
                  <div className="flex items-center gap-2 text-xs text-purple-400">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Auto-extracting metadata fields with OCR...</span>
                  </div>
                )}
              </div>
            )}

            {/* Error banner if submission failed */}
            {result?.success === false && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-2.5 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <span className="font-bold block">Registration Error</span>
                  <span>{result.errorMessage || "Backend rejected the registration request."}</span>
                </div>
              </div>
            )}

            {/* Fields Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] text-slate-400 uppercase">
                  Document / Certificate Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous Robotics Systems Specialist"
                  className="w-full bg-[#080c14] border border-panel-border rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-tech"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">
                  Recipient / Subject Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Student / Candidate Full Name"
                  className="w-full bg-[#080c14] border border-panel-border rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-tech"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">
                  Issuing Organization / Authority
                </label>
                <input
                  type="text"
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  placeholder="e.g. RoboLab Academy / University Lab"
                  className="w-full bg-[#080c14] border border-panel-border rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-tech"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-[#080c14] border border-panel-border rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-tech"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">
                  Credential / Registration ID
                </label>
                <input
                  type="text"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  placeholder="e.g. RLC-CERT-2026-XXXX"
                  className="w-full bg-[#080c14] border border-panel-border rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-tech"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] text-slate-400 uppercase">
                  Issuer Notes (Optional)
                </label>
                <input
                  type="text"
                  value={issuerNotes}
                  onChange={(e) => setIssuerNotes(e.target.value)}
                  placeholder="Optional context, course challenge ID, or verification criteria"
                  className="w-full bg-[#080c14] border border-panel-border rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-tech"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-panel-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-panel-elevated hover:bg-slate-800 text-slate-400 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || !metadata || isHashing || isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-mono font-bold transition-all shadow-cyan-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering to Blockchain...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Anchor to MST Testnet</span>
                  </>
                )}
              </button>
            </div>

            {isSubmitting && (
              <p className="text-[11px] text-center text-cyan-tech font-mono animate-pulse">
                {submitStep}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
