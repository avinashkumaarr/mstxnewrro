"use client";

import React, { useState } from "react";
import { Certificate } from "@/types/certificate";
import { CertificatePreview } from "./CertificatePreview";
import { CertificateEvidenceTimeline } from "./CertificateEvidenceTimeline";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Share2,
  Printer,
  AlertTriangle,
  Lock,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface CertificateDetailModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: (certificate: Certificate) => void;
  onRevokeClick: (certificate: Certificate) => void;
}

export const CertificateDetailModal: React.FC<CertificateDetailModalProps> = ({
  certificate,
  isOpen,
  onClose,
  onShare,
  onRevokeClick,
}) => {
  const [activeTab, setActiveTab] = useState<"proof" | "evidence">("proof");
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  if (!isOpen || !certificate) return null;

  const isRevoked = certificate.status === "revoked";
  const isPending = certificate.status === "pending";

  const handleCopy = (text: string, type: "tx" | "hash" | "contract") => {
    navigator.clipboard.writeText(text);
    if (type === "tx") {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    } else if (type === "hash") {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none font-sans animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-6xl rounded-2xl bg-[#090e1a] border border-cyan-500/40 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 border-b border-panel-border bg-panel flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              {certificate.tokenType}
            </span>
            <span className="text-xs font-mono text-slate-300 font-bold hidden sm:inline">
              {certificate.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onShare(certificate)}
              className="px-3 py-1.5 rounded-lg bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-200 text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-tech" />
              <span>Share</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-200 text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-purple-400" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content: Left = Certificate Preview, Right = Technical Information */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 overflow-y-auto flex-1">
          {/* LEFT: Certificate Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-start space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                RECRUITER-VERIFIED DOCUMENT
              </span>
              <span className="text-[11px] font-mono text-cyan-tech">
                Official Credential View
              </span>
            </div>

            <div className="w-full shadow-2xl">
              <CertificatePreview certificate={certificate} />
            </div>

            {/* Credential statement below certificate */}
            <div className="p-3.5 rounded-xl bg-panel/60 border border-panel-border text-xs text-slate-400 font-sans leading-relaxed">
              <strong className="text-slate-200 font-semibold">About this Credential: </strong>
              {certificate.description}
            </div>
          </div>

          {/* RIGHT: Technical Credential Information & Evidence Panel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Tab switch: Proof vs Evidence */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-panel border border-panel-border text-xs font-mono">
              <button
                onClick={() => setActiveTab("proof")}
                className={`py-2 px-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "proof"
                    ? "bg-cyan-tech text-black shadow-cyan-glow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Technical Proof</span>
              </button>

              <button
                onClick={() => setActiveTab("evidence")}
                className={`py-2 px-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "evidence"
                    ? "bg-cyan-tech text-black shadow-cyan-glow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Learning Evidence</span>
              </button>
            </div>

            {/* TAB 1: TECHNICAL INFORMATION & BLOCKCHAIN PROOF */}
            {activeTab === "proof" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Basic Metadata */}
                <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between border-b border-panel-border/60 pb-2">
                    <span className="text-slate-400">Certificate ID:</span>
                    <span className="text-cyan-tech font-bold">{certificate.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-panel-border/60 pb-2">
                    <span className="text-slate-400">Issuer:</span>
                    <span className="text-slate-200 font-bold">{certificate.issuerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-panel-border/60 pb-2">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="text-slate-200 font-bold">{certificate.recipientName}</span>
                  </div>
                  <div className="flex justify-between border-b border-panel-border/60 pb-2">
                    <span className="text-slate-400">Issue Date:</span>
                    <span className="text-slate-200">{certificate.issueDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-panel-border/60 pb-2">
                    <span className="text-slate-400">Track:</span>
                    <span className="text-slate-200">{certificate.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-panel-border/60 pb-2">
                    <span className="text-slate-400">Evaluation Score:</span>
                    <span className="text-emerald-400 font-bold">{certificate.score} / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Attestation Status:</span>
                    {isRevoked ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        REVOKED
                      </span>
                    ) : isPending ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        PENDING
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ✓ VERIFIED
                      </span>
                    )}
                  </div>
                </div>

                {/* Revocation Warning Box if revoked */}
                {isRevoked && certificate.revocation && (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-1.5 text-xs font-mono text-rose-300">
                    <div className="font-bold flex items-center gap-1.5 text-rose-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>REVOCATION RECORD</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Reason: {certificate.revocation.reason}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Revoked on {certificate.revocation.revokedAt} by {certificate.revocation.revokedBy}
                    </div>
                  </div>
                )}

                {/* BLOCKCHAIN PROOF CARD */}
                <div className="p-4 rounded-xl bg-panel-elevated border border-cyan-500/30 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-panel-border pb-2">
                    <div className="flex items-center gap-2 text-cyan-tech font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>BLOCKCHAIN PROOF</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-panel-border">
                      {certificate.network}
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">SMART CONTRACT</span>
                      <div className="flex items-center justify-between text-slate-200 mt-0.5">
                        <span className="truncate max-w-[220px]">
                          {certificate.contractAddress}
                        </span>
                        <button
                          onClick={() => handleCopy(certificate.contractAddress, "contract")}
                          className="text-slate-400 hover:text-cyan-tech p-1"
                          title="Copy Contract"
                        >
                          {copiedContract ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">TRANSACTION HASH</span>
                      <div className="flex items-center justify-between text-slate-200 mt-0.5">
                        <span className="truncate max-w-[220px] text-cyan-400">
                          {certificate.transactionHash}
                        </span>
                        <button
                          onClick={() => handleCopy(certificate.transactionHash, "tx")}
                          className="text-slate-400 hover:text-cyan-tech p-1"
                          title="Copy Transaction Hash"
                        >
                          {copiedTx ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 block text-[10px]">SETTLEMENT BLOCK</span>
                        <span className="text-slate-200 font-bold">
                          #{certificate.blockNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">ATTESTATION TYPE</span>
                        <span className="text-purple-400 font-bold">ZK-Snark ERC-5192</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">CERTIFICATE HASH (SHA-256)</span>
                      <div className="flex items-center justify-between text-slate-200 mt-0.5">
                        <span className="truncate max-w-[220px] text-slate-400">
                          {certificate.certificateHash}
                        </span>
                        <button
                          onClick={() => handleCopy(certificate.certificateHash, "hash")}
                          className="text-slate-400 hover:text-cyan-tech p-1"
                          title="Copy Certificate Hash"
                        >
                          {copiedHash ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Action Buttons */}
                  <div className="pt-2 border-t border-panel-border flex flex-col sm:flex-row gap-2">
                    <a
                      href={`/blockchain?tx=${certificate.transactionHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-lg bg-panel hover:bg-slate-800 border border-panel-border text-slate-200 hover:text-cyan-tech text-center text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View on MSTScan</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {!isRevoked && (
                      <button
                        onClick={() => onRevokeClick(certificate)}
                        className="py-2 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1.5"
                        title="Authorized Instructor Revocation"
                      >
                        <Lock className="w-3.5 h-3.5 text-rose-400" />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VERIFIED LEARNING EVIDENCE TIMELINE */}
            {activeTab === "evidence" && (
              <div className="p-4 rounded-xl bg-panel border border-panel-border max-h-[520px] overflow-y-auto animate-fadeIn">
                <CertificateEvidenceTimeline
                  evidence={certificate.evidence}
                  certificateId={certificate.id}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
