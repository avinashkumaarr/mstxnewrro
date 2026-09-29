"use client";

import React from "react";
import { Certificate } from "@/types/certificate";
import { QRCodeVector } from "./QRCodeVector";
import { ShieldCheck, Award, Cpu, CheckCircle2, AlertTriangle } from "lucide-react";

interface CertificatePreviewProps {
  certificate: Certificate;
  compact?: boolean;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  certificate,
  compact = false,
}) => {
  const isRevoked = certificate.status === "revoked";
  const isPending = certificate.status === "pending";

  return (
    <div
      id={`certificate-preview-${certificate.id}`}
      className={`relative w-full rounded-2xl bg-gradient-to-b from-[#0b1220] via-[#080d17] to-[#05080f] text-slate-100 border-2 border-cyan-500/30 shadow-2xl overflow-hidden font-sans select-none transition-all duration-300 ${
        compact ? "p-4 sm:p-6" : "p-6 sm:p-10"
      }`}
      style={{
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7), inset 0 0 80px rgba(0, 240, 255, 0.03)",
      }}
    >
      {/* Guilloche / Circuit Geometric Background Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cert-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(0, 240, 255, 0.15)"
                strokeWidth="0.75"
              />
              <circle cx="0" cy="0" r="1.5" fill="rgba(0, 240, 255, 0.3)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cert-grid)" />
        </svg>
      </div>

      {/* Decorative Ornate Corner Borders */}
      <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
      <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

      {/* Revocation Watermark Overlay if revoked */}
      {isRevoked && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-[2px] pointer-events-none">
          <div className="transform -rotate-12 border-4 border-rose-500/80 px-8 py-3 rounded-xl bg-rose-950/80 text-rose-300 font-mono font-extrabold text-3xl tracking-widest uppercase flex items-center gap-3 shadow-2xl">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
            <span>REVOKED CREDENTIAL</span>
          </div>
        </div>
      )}

      {/* Inner Certificate Border Container */}
      <div className="relative z-10 border border-cyan-500/20 rounded-xl p-5 sm:p-8 bg-[#090e1a]/80 backdrop-blur-sm flex flex-col justify-between space-y-6">
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-panel-border pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-cyan-glow flex items-center justify-center">
              <div className="w-full h-full bg-[#080d17] rounded-[10px] flex items-center justify-center text-cyan-tech">
                <Cpu className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs tracking-widest text-cyan-tech font-bold">
                  ROBOLAB CHAIN
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-mono">
                  ACCREDITED
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {certificate.issuingAuthority || "Decentralized Document Attestation Registry"}
              </div>
            </div>
          </div>

          {/* Blockchain Verification Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-cyan-500/40 font-mono text-[11px] shadow-sm">
            {isRevoked ? (
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                REVOKED ON-CHAIN
              </span>
            ) : isPending ? (
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                BLOCKCHAIN PENDING
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                VERIFIED ON MST BLOCKCHAIN
              </span>
            )}
          </div>
        </div>

        {/* Certificate Title & Recipient Body */}
        {certificate.previewUrl ? (
          <div className="space-y-4 py-2">
            <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 bg-black/60 shadow-xl max-h-[440px] flex items-center justify-center p-3">
              <img
                src={certificate.previewUrl}
                alt={certificate.title}
                className="max-h-[400px] w-auto max-w-full object-contain rounded-lg shadow-md"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1.5 shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ORIGINAL ATTESTED DOCUMENT</span>
              </div>
            </div>

            <div className="text-center space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
                {certificate.title}
              </h2>
              <div className="text-xs font-mono text-cyan-tech">
                Cryptographic SHA-256: {certificate.documentHash || certificate.certificateHash}
              </div>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Authenticated proof anchored to MST Blockchain. Bitwise 100% cryptographic match.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3 py-2">
            <div className="text-[11px] tracking-[0.3em] font-mono text-cyan-tech/90 uppercase font-semibold">
              Official Blockchain Attestation • MST Testnet
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-100 to-slate-200 tracking-tight">
              {certificate.title}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              This official attestation cryptographically verifies the provenance, integrity, and authenticity of the anchored document on the MST Blockchain.
            </p>

            <div className="py-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-cyan-tech tracking-wide font-sans">
                {certificate.recipientName || certificate.studentName}
              </h1>
              {certificate.recipientWallet && certificate.recipientWallet !== "0x0000000000000000000000000000000000000000" && (
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Recipient / Subject:{" "}
                  <span className="text-slate-300 font-mono">
                    {certificate.recipientWallet.slice(0, 10)}...
                    {certificate.recipientWallet.slice(-8)}
                  </span>
                </div>
              )}
            </div>

            <div className="inline-block px-5 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-md">
              <span className="text-base sm:text-lg font-bold text-slate-100 block">
                {certificate.category || "Cryptographic Attestation"}
              </span>
              <span className="text-[10px] font-mono text-cyan-tech block mt-0.5">
                Document SHA-256: {certificate.documentHash || certificate.certificateHash}
              </span>
            </div>

            {certificate.skills && certificate.skills.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 max-w-lg mx-auto">
                {certificate.skills.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-panel-border text-slate-300"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Certificate Footer: Signatures, Seal & QR Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-6 border-t border-panel-border text-xs">
          {/* Left: Authorized Issuer & Signature */}
          <div className="space-y-2 text-left">
            <div className="h-8 flex items-end">
              <span className="font-serif italic text-lg sm:text-xl text-cyan-tech font-bold tracking-wider select-none">
                {certificate.issuerSigner.split("(")[0]}
              </span>
            </div>
            <div className="border-t border-slate-700 pt-1">
              <div className="text-[11px] font-bold text-slate-200">
                {certificate.issuerSigner}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {certificate.issuerName}
              </div>
              {certificate.issuerWallet &&
                certificate.issuerWallet !== "0x0000000000000000000000000000000000000000" && (
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    Auth Signature: {certificate.issuerWallet.slice(0, 14)}...
                  </div>
                )}
            </div>
          </div>

          {/* Center: Tamper-Proof Soulbound Seal */}
          <div className="flex flex-col items-center justify-center text-center space-y-1">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-400/60 p-1 flex items-center justify-center bg-cyan-950/20 shadow-cyan-glow">
              <div className="w-full h-full rounded-full border border-cyan-400/80 flex flex-col items-center justify-center text-cyan-tech">
                <Award className="w-6 h-6" />
                <span className="text-[7px] font-mono font-bold tracking-tighter">MST SEAL</span>
              </div>
            </div>
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              Block #{certificate.blockNumber}
            </div>
          </div>

          {/* Right: QR Code and Credential Meta */}
          <div className="flex items-center justify-end gap-3 text-right">
            <div>
              <div className="text-[10px] font-mono text-slate-400">CREDENTIAL ID</div>
              <div className="text-[11px] font-mono text-cyan-tech font-bold">
                {certificate.id}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">ISSUED DATE</div>
              <div className="text-[11px] font-mono text-slate-200">
                {certificate.issueDate}
              </div>
              <div className="text-[9px] font-mono text-cyan-400/80 mt-1">
                Scan to Verify On-Chain
              </div>
            </div>

            <QRCodeVector
              value={certificate.verificationUrl}
              size={64}
              includeBorder={true}
              className="flex-shrink-0"
            />
          </div>
        </div>

        {/* Verification Link Subtext */}
        <div className="text-center pt-2 font-mono text-[9px] text-slate-500 border-t border-slate-900/60 flex items-center justify-between">
          <span>Official Verification URL: {certificate.verificationUrl}</span>
          <span className="text-slate-400">Network: {certificate.network}</span>
        </div>
      </div>

      {/* Dedicated Print Media Stylesheet */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            #certificate-preview-${certificate.id},
            #certificate-preview-${certificate.id} * {
              visibility: visible !important;
            }
            #certificate-preview-${certificate.id} {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: 1px solid #00f0ff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `,
      }} />
    </div>
  );
};
