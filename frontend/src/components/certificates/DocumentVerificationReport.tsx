"use client";

import React, { useState } from "react";
import { VerificationResult } from "@/types/certificate";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Clock,
  WifiOff,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  FileCheck,
  CheckCircle2,
  Info,
  Layers,
} from "lucide-react";

interface DocumentVerificationReportProps {
  result: VerificationResult;
  onReset?: () => void;
}

export const DocumentVerificationReport: React.FC<DocumentVerificationReportProps> = ({
  result,
  onReset,
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const { document, extractedFields, ocr, aiAnalysis, blockchain, hashMatch, overallStatus } = result;

  const renderVerdictBadge = () => {
    switch (overallStatus) {
      case "verified":
        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-300 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase block text-emerald-400">
                  FINAL VERIFICATION VERDICT
                </span>
                <h3 className="text-lg font-bold text-white">
                  ✓ VERIFIED CREDENTIAL
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-xl">
                  {result.verdictExplanation}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-emerald-900 border border-emerald-400 text-emerald-200 self-start sm:self-center">
              STATUS: VALID
            </span>
          </div>
        );

      case "review":
        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/50 border border-amber-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-300 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center flex-shrink-0 text-amber-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase block text-amber-400">
                  FINAL VERIFICATION VERDICT
                </span>
                <h3 className="text-lg font-bold text-white">
                  ⚠ REVIEW RECOMMENDED
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-xl">
                  {result.verdictExplanation}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-amber-900 border border-amber-400 text-amber-200 self-start sm:self-center">
              STATUS: REVIEW REQUIRED
            </span>
          </div>
        );

      case "invalid":
        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/60 border border-rose-500/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-300 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center flex-shrink-0 text-rose-400">
                <XCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase block text-rose-400">
                  FINAL VERIFICATION VERDICT
                </span>
                <h3 className="text-lg font-bold text-white">
                  ✕ INVALID DOCUMENT
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-xl">
                  {result.verdictExplanation}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-rose-900 border border-rose-400 text-rose-200 self-start sm:self-center">
              STATUS: INVALID
            </span>
          </div>
        );

      case "not_found":
        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-panel-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-300 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-panel-border flex items-center justify-center flex-shrink-0 text-slate-400">
                <XCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase block text-slate-400">
                  FINAL VERIFICATION VERDICT
                </span>
                <h3 className="text-lg font-bold text-white">
                  ⚠ NO REGISTERED RECORD FOUND
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-xl">
                  {result.verdictExplanation}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-slate-800 border border-panel-border text-slate-300 self-start sm:self-center">
              STATUS: UNREGISTERED
            </span>
          </div>
        );

      case "unavailable":
      default:
        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-red-950/40 border border-red-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-300 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-900/30 border border-red-500 flex items-center justify-center flex-shrink-0 text-red-400">
                <WifiOff className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase block text-red-400">
                  SERVICE CONNECTIVITY STATUS
                </span>
                <h3 className="text-lg font-bold text-white">
                  ⚠ VERIFICATION SERVICE UNAVAILABLE
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-xl">
                  {result.verdictExplanation}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-red-900 border border-red-400 text-red-200 self-start sm:self-center">
              STATUS: UNAVAILABLE
            </span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans select-none animate-fadeIn">
      {/* 1. Final High-Level Verdict Banner */}
      {renderVerdictBadge()}

      {/* Authenticity Matrix Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Layer 1: Document Integrity */}
        <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">1. FILE INTEGRITY</span>
            {hashMatch === "match" ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                ✓ MATCH
              </span>
            ) : hashMatch === "mismatch" ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/40">
                ✕ MISMATCH
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-panel-border">
                {hashMatch.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            Checks whether the uploaded file byte-for-byte matches the fingerprint registered by the issuer.
          </p>
        </div>

        {/* Layer 2: Blockchain Record */}
        <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">2. BLOCKCHAIN RECORD</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded border ${
                blockchain.status === "verified"
                  ? "bg-emerald-950 text-emerald-400 border-emerald-500/40"
                  : blockchain.status === "pending"
                  ? "bg-amber-950 text-amber-400 border-amber-500/40"
                  : "bg-slate-900 text-slate-400 border-panel-border"
              }`}
            >
              {blockchain.status.toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            Checks whether a matching document fingerprint and credential record exist on the configured blockchain.
          </p>
        </div>

        {/* Layer 3: AI Analysis */}
        <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">3. AI ASSISTANCE</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded border ${
                aiAnalysis.status === "completed"
                  ? aiAnalysis.riskLevel === "low"
                    ? "bg-emerald-950 text-emerald-400 border-emerald-500/40"
                    : "bg-amber-950 text-amber-400 border-amber-500/40"
                  : "bg-slate-900 text-slate-400 border-panel-border"
              }`}
            >
              {aiAnalysis.status === "completed" ? `${aiAnalysis.riskLevel?.toUpperCase()} RISK` : aiAnalysis.status.toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            Looks for potential visual and layout anomalies. Assistive analysis layer, not proof of authenticity.
          </p>
        </div>
      </div>

      {/* 2. Section: Extracted Document Information */}
      <div className="p-5 rounded-2xl bg-panel border border-panel-border space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-panel-border pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-tech" />
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Extracted Document Metadata (OCR)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400">
            {ocr.status === "completed" ? `Confidence: ${Math.round((ocr.confidence ?? 0.9) * 100)}%` : ocr.status.toUpperCase()}
          </span>
        </div>

        {ocr.status === "unavailable" || ocr.status === "failed" ? (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-panel-border text-slate-400 space-y-1">
            <div className="text-amber-400 font-bold">⚠ OCR Service Notice:</div>
            <p className="font-sans text-[11px]">
              {ocr.errorMessage || "OCR extraction endpoint is currently unavailable from the backend. Raw document content could not be parsed."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-[11px]">
            <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border">
              <span className="text-slate-500 text-[10px] block">RECIPIENT NAME</span>
              <span className="text-slate-100 font-bold mt-0.5 block">
                {extractedFields.recipientName || <span className="text-slate-500 italic">Not detected</span>}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border">
              <span className="text-slate-500 text-[10px] block">CERTIFICATE TITLE</span>
              <span className="text-slate-100 font-bold mt-0.5 block">
                {extractedFields.certificateTitle || extractedFields.title || <span className="text-slate-500 italic">Not detected</span>}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border">
              <span className="text-slate-500 text-[10px] block">ISSUING INSTITUTION</span>
              <span className="text-slate-100 font-bold mt-0.5 block">
                {extractedFields.issuerName || extractedFields.issuer || extractedFields.organization || <span className="text-slate-500 italic">Not detected</span>}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border">
              <span className="text-slate-500 text-[10px] block">ISSUE DATE</span>
              <span className="text-slate-200 mt-0.5 block">
                {extractedFields.issueDate || <span className="text-slate-500 italic">Not detected</span>}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border">
              <span className="text-slate-500 text-[10px] block">CREDENTIAL / SERIAL ID</span>
              <span className="text-cyan-400 font-bold mt-0.5 block">
                {extractedFields.credentialId || extractedFields.registrationNumber || <span className="text-slate-500 italic">Not detected</span>}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border">
              <span className="text-slate-500 text-[10px] block">GRADE / SCORE / TRACK</span>
              <span className="text-slate-200 mt-0.5 block">
                {extractedFields.grade || extractedFields.score || extractedFields.course || extractedFields.skill || <span className="text-slate-500 italic">Not detected</span>}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Section: AI-Assisted Document Analysis */}
      <div className="p-5 rounded-2xl bg-panel border border-panel-border space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-panel-border pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              AI-Assisted Anomaly & Forgery Inspection
            </h4>
          </div>
          <span className="text-[10px] text-purple-400">
            {aiAnalysis.status === "completed" ? `Confidence: ${Math.round((aiAnalysis.confidence ?? 0.85) * 100)}%` : aiAnalysis.status.toUpperCase()}
          </span>
        </div>

        {aiAnalysis.status === "unavailable" ? (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-panel-border text-slate-400 font-sans text-[11px]">
            <span className="font-mono text-amber-400 font-bold block mb-1">AI Service Notice:</span>
            {aiAnalysis.errorMessage || "AI document anomaly endpoint is currently unreachable from backend. No automated anomaly scan could be completed."}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border">
                <span className="text-slate-500 text-[10px] block">ASSESSED RISK LEVEL</span>
                <span
                  className={`font-bold mt-0.5 block ${
                    aiAnalysis.riskLevel === "low"
                      ? "text-emerald-400"
                      : aiAnalysis.riskLevel === "medium"
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {aiAnalysis.riskLevel?.toUpperCase()} RISK (Anomaly Score: {aiAnalysis.riskScore ?? 0}/100)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border">
                <span className="text-slate-500 text-[10px] block">ASSISTIVE LAYER PURPOSE</span>
                <span className="text-slate-300 mt-0.5 block font-sans text-[11px]">
                  Pattern irregularity & font inconsistency analysis
                </span>
              </div>
            </div>

            {aiAnalysis.findings && aiAnalysis.findings.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-950 border border-panel-border space-y-1.5">
                <span className="text-[10px] text-slate-400 block font-bold">DETECTED SIGNALS:</span>
                <ul className="space-y-1 text-slate-300 text-[11px] font-sans list-disc list-inside">
                  {aiAnalysis.findings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Section: Blockchain Proof & Hash Comparison */}
      <div className="p-5 rounded-2xl bg-panel-elevated border border-cyan-500/40 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-panel-border pb-3">
          <div className="flex items-center gap-2 text-cyan-tech font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span className="uppercase tracking-wider">Blockchain Fingerprint & Integrity Check</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-panel-border">
            {blockchain.network || "MST Blockchain Testnet"}
          </span>
        </div>

        {/* Hash Comparison Matrix */}
        <div className="space-y-2.5 text-[11px]">
          <div>
            <span className="text-slate-500 text-[10px] block">1. ACTUAL UPLOADED FILE HASH (SHA-256):</span>
            <div className="flex items-center justify-between bg-black/60 p-2.5 rounded-lg border border-panel-border mt-0.5">
              <span className="text-cyan-400 break-all select-all">{document.sha256}</span>
              <button
                onClick={() => handleCopy(document.sha256, "uploaded")}
                className="text-slate-400 hover:text-cyan-tech p-1 ml-2 flex-shrink-0"
                title="Copy Uploaded Hash"
              >
                {copiedHash === "uploaded" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] block">2. ON-CHAIN REGISTERED HASH:</span>
            <div className="flex items-center justify-between bg-black/60 p-2.5 rounded-lg border border-panel-border mt-0.5">
              <span className="text-slate-200 break-all select-all">
                {blockchain.registeredHash || <span className="text-slate-500 italic">No registered on-chain hash found for this document</span>}
              </span>
              {blockchain.registeredHash && (
                <button
                  onClick={() => handleCopy(blockchain.registeredHash!, "registered")}
                  className="text-slate-400 hover:text-cyan-tech p-1 ml-2 flex-shrink-0"
                  title="Copy Registered Hash"
                >
                  {copiedHash === "registered" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Blockchain Transaction Metadata if found */}
        {blockchain.transactionHash && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-panel-border text-[11px]">
            <div>
              <span className="text-slate-500 text-[10px] block">TRANSACTION HASH</span>
              <span className="text-cyan-400 truncate block mt-0.5">{blockchain.transactionHash}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">SETTLEMENT BLOCK</span>
              <span className="text-slate-200 mt-0.5 block">#{blockchain.blockNumber}</span>
            </div>
            {blockchain.contractAddress && (
              <div className="sm:col-span-2">
                <span className="text-slate-500 text-[10px] block">SMART CONTRACT</span>
                <span className="text-slate-300 truncate block mt-0.5">{blockchain.contractAddress}</span>
              </div>
            )}
          </div>
        )}

        {blockchain.errorMessage && (
          <div className="p-3 rounded-lg bg-slate-900/80 border border-panel-border text-slate-400 font-sans text-[11px]">
            <span className="font-mono text-slate-300 font-bold block mb-0.5">Blockchain Attestation Record:</span>
            {blockchain.errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};
