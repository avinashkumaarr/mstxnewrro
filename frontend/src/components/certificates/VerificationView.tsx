"use client";

import React, { useState, useEffect } from "react";
import {
  Certificate,
  VerificationResult,
  VerificationState,
} from "@/types/certificate";
import { certificateService } from "@/services/certificateService";
import { DocumentUploader } from "./DocumentUploader";
import { DocumentViewer } from "./DocumentViewer";
import { DocumentVerificationReport } from "./DocumentVerificationReport";
import { CertificatePreview } from "./CertificatePreview";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Clock,
  XCircle,
  WifiOff,
  ArrowLeft,
  Upload,
  Hash,
  Cpu,
} from "lucide-react";
import Link from "next/link";

interface VerificationViewProps {
  initialQuery?: string;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  initialQuery = "",
}) => {
  const [activeMode, setActiveMode] = useState<"file" | "hash">(
    initialQuery ? "hash" : "file"
  );

  // File upload workflow
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSha256, setFileSha256] = useState<string>("");
  const [isVerifyingFile, setIsVerifyingFile] = useState(false);
  const [fileProgress, setFileProgress] = useState<string>("");
  const [fileResult, setFileResult] = useState<VerificationResult | null>(null);

  // Query lookup workflow
  const [query, setQuery] = useState(initialQuery);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    state: VerificationState;
    message: string;
    certificate?: Certificate | null;
  } | null>(null);

  const [copiedTx, setCopiedTx] = useState(false);
  const [isAnchoring, setIsAnchoring] = useState(false);

  const handleInstantAnchor = async () => {
    if (!query.trim()) return;
    setIsAnchoring(true);
    try {
      const dummyBlob = new Blob([query], { type: "text/plain" });
      const dummyFile = new File([dummyBlob], "document.pdf", { type: "application/pdf" });
      await certificateService.registerCertificate({
        file: dummyFile,
        documentHash: query.trim(),
        fields: {
          certificateTitle: `Cryptographic Attestation (${query.trim().slice(0, 10)}...)`,
          title: `Cryptographic Attestation (${query.trim().slice(0, 10)}...)`,
          recipientName: "Document Bearer",
          issuerName: "MST Blockchain Attestation Authority",
          issueDate: new Date().toISOString().split("T")[0],
          credentialId: `DOC-${query.trim().slice(2, 8).toUpperCase()}`,
        },
      });
      await handleHashLookup(query.trim());
    } catch (e) {
      console.error("Instant anchor error:", e);
    } finally {
      setIsAnchoring(false);
    }
  };

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery);
      setActiveMode("hash");
      handleHashLookup(initialQuery);
    }
  }, [initialQuery]);

  const handleFileSelected = (file: File, sha256: string) => {
    setSelectedFile(file);
    setFileSha256(sha256);
    setFileResult(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileSha256("");
    setFileResult(null);
  };

  const handleRunFileVerification = async () => {
    if (!selectedFile) return;
    setIsVerifyingFile(true);
    setFileProgress("Initializing bitwise verification...");

    try {
      const res = await certificateService.verifyUploadedFile(
        selectedFile,
        (step) => setFileProgress(step)
      );
      setFileResult(res);
    } catch (err: unknown) {
      console.error("Verification execution error:", err);
    } finally {
      setIsVerifyingFile(false);
      setFileProgress("");
    }
  };

  const handleHashLookup = async (qOverride?: string) => {
    const q = (qOverride !== undefined ? qOverride : query).trim();
    if (!q) return;

    setIsQuerying(true);
    const res = await certificateService.verifyCertificate(q);
    setQueryResult(res);
    setIsQuerying(false);
  };

  const handleCopyTx = (tx: string) => {
    navigator.clipboard.writeText(tx);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const renderStateBanner = (state: VerificationState, message: string) => {
    switch (state) {
      case "valid":
        return (
          <div className="p-4 sm:p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-300 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase block text-emerald-400">
                  ATTESTATION AUDIT: PASSED
                </span>
                <h3 className="text-base font-bold text-slate-100">
                  ✓ VERIFIED CREDENTIAL • VALID
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  {message}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-400 text-emerald-200 font-bold">
                MST TESTNET ANCHORED
              </span>
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="p-4 sm:p-5 rounded-xl bg-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-300 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center flex-shrink-0 text-amber-400">
                <Clock className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase block text-amber-400">
                  BLOCKCHAIN SETTLEMENT
                </span>
                <h3 className="text-base font-bold text-slate-100">
                  ● VERIFICATION PENDING
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  {message}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-amber-900/60 border border-amber-400 text-amber-200 font-bold self-start sm:self-center">
              AWAITING INCLUSION
            </span>
          </div>
        );

      case "revoked":
        return (
          <div className="p-4 sm:p-5 rounded-xl bg-rose-950/40 border border-rose-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-300 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center flex-shrink-0 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase block text-rose-400">
                  ISSUER ACTION
                </span>
                <h3 className="text-base font-bold text-white">
                  ! CREDENTIAL REVOKED
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  {message}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-rose-900/60 border border-rose-400 text-rose-200 font-bold self-start sm:self-center">
              INVALIDATED
            </span>
          </div>
        );

      case "not_found":
        return (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-3 text-slate-300 animate-fadeIn">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center flex-shrink-0 text-slate-400">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase block text-slate-400">
                LOOKUP RESULT
              </span>
              <h3 className="text-base font-bold text-slate-100">
                × NOT FOUND ON MST BLOCKCHAIN
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                {message}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 font-sans select-none antialiased">
      {/* Top Navbar */}
      <header className="border-b border-panel-border bg-panel/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/certificates"
              className="flex items-center gap-2 text-slate-400 hover:text-cyan-tech transition-colors font-mono text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </Link>
            <div className="h-4 w-px bg-panel-border" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-tech" />
              <span className="font-mono text-sm font-bold tracking-wider text-slate-100">
                ROBOLAB CHAIN
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                PUBLIC VERIFIER
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400 hidden sm:inline">Network:</span>
            <span className="px-2 py-0.5 rounded bg-panel-elevated border border-panel-border text-emerald-400 font-bold">
              MST Testnet • Chain ID: 91562037
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Verification Hero Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono text-cyan-tech uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MST Cryptographic Proof Verifier</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            VERIFY ANY CERTIFICATE OR DOCUMENT
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Upload any PDF or image certificate to compute its Web Crypto SHA-256 fingerprint, extract OCR fields, run AI tampering detection, and verify proof on the MST Blockchain.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setActiveMode("file")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
              activeMode === "file"
                ? "bg-cyan-tech text-black shadow-cyan-glow"
                : "text-slate-400 hover:text-slate-200 bg-panel border border-panel-border"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>UPLOAD DOCUMENT (RECOMMENDED)</span>
          </button>

          <button
            onClick={() => setActiveMode("hash")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
              activeMode === "hash"
                ? "bg-cyan-tech text-black shadow-cyan-glow"
                : "text-slate-400 hover:text-slate-200 bg-panel border border-panel-border"
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>SEARCH BY HASH / ID</span>
          </button>
        </div>

        {/* MODE 1: FILE UPLOAD VERIFICATION */}
        {activeMode === "file" && (
          <div className="space-y-6">
            {!selectedFile ? (
              <DocumentUploader
                onFileSelected={handleFileSelected}
                isVerifying={isVerifyingFile}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-panel border border-panel-border">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-cyan-tech font-bold uppercase tracking-wider">
                      UPLOADED FILE UNDER VERIFICATION
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 font-mono truncate max-w-lg">
                      {selectedFile.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearFile}
                      disabled={isVerifyingFile}
                      className="px-3.5 py-2 rounded-xl bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors"
                    >
                      Upload Different File
                    </button>

                    <button
                      onClick={handleRunFileVerification}
                      disabled={isVerifyingFile}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-mono font-bold transition-all shadow-cyan-glow disabled:opacity-50 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isVerifyingFile ? "Auditing Document..." : "Execute Verification"}</span>
                    </button>
                  </div>
                </div>

                {isVerifyingFile && (
                  <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/50 flex items-center gap-3 text-cyan-300 font-mono text-xs animate-pulse">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <div>
                      <span className="font-bold block">Running Verification Pipeline...</span>
                      <span className="text-cyan-200/80 text-[11px]">{fileProgress}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5 space-y-3">
                    <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                      Document Visual Preview
                    </h4>
                    <DocumentViewer
                      file={selectedFile}
                      sha256={fileSha256}
                    />
                  </div>

                  <div className="lg:col-span-7 space-y-4">
                    {fileResult ? (
                      <DocumentVerificationReport
                        result={fileResult}
                        onReset={handleClearFile}
                      />
                    ) : (
                      <div className="p-6 rounded-2xl bg-panel border border-panel-border text-center space-y-4 font-mono">
                        <Cpu className="w-10 h-10 mx-auto text-cyan-tech" />
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-slate-200">
                            Cryptographic Fingerprint Generated
                          </h4>
                          <p className="text-xs text-slate-400 max-w-md mx-auto">
                            The document SHA-256 has been generated locally in your browser. Click the button below to query MST Testnet, extract OCR text, and run AI authenticity analysis.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-black/40 border border-panel-border text-left space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase">Computed SHA-256</span>
                          <span className="text-cyan-tech break-all text-xs font-mono block">
                            {fileSha256}
                          </span>
                        </div>

                        <button
                          onClick={handleRunFileVerification}
                          disabled={isVerifyingFile}
                          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-cyan-glow flex items-center gap-2 mx-auto"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verify on MST Blockchain</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: HASH / ID QUERY */}
        {activeMode === "hash" && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-panel border border-cyan-500/30 shadow-xl space-y-4 font-mono">
              <label className="text-xs text-slate-300 block font-bold">
                ENTER DOCUMENT SHA-256, CREDENTIAL ID, OR TRANSACTION HASH:
              </label>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleHashLookup()}
                    placeholder="e.g. 0x8e31... or certificate UUID"
                    className="w-full bg-[#070a12] border border-panel-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-cyan-tech font-mono focus:outline-none focus:border-cyan-tech transition-colors shadow-inner"
                  />
                </div>
                <button
                  onClick={() => handleHashLookup()}
                  disabled={isQuerying || !query.trim()}
                  className="px-6 py-2.5 rounded-xl bg-cyan-tech hover:bg-cyan-tech-dark text-black font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-cyan-glow disabled:opacity-50 flex-shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isQuerying ? "Querying MST Chain..." : "Query Record"}</span>
                </button>
              </div>
            </div>

            {queryResult && (
              <div className="space-y-6">
                {renderStateBanner(queryResult.state, queryResult.message)}

                {queryResult.state === "not_found" && (
                  <div className="p-5 rounded-2xl bg-panel border border-cyan-500/40 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                    <div className="space-y-1">
                      <span className="text-[10px] text-cyan-tech uppercase font-bold tracking-wider block">
                        UNANCHORED HASH DETECTED
                      </span>
                      <h4 className="text-sm font-bold text-slate-100">
                        Anchor this Document to MST Testnet Now
                      </h4>
                      <p className="text-slate-400 text-xs">
                        This cryptographic hash is currently unanchored. You can anchor its state root directly to the MST Blockchain ledger with 1 click.
                      </p>
                    </div>

                    <button
                      onClick={handleInstantAnchor}
                      disabled={isAnchoring}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs font-mono shadow-cyan-glow flex items-center justify-center gap-2 flex-shrink-0 transition-all disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isAnchoring ? "Anchoring on MST..." : "Anchor & Verify on Blockchain"}</span>
                    </button>
                  </div>
                )}

                {queryResult.certificate && (
                  <div className="p-6 rounded-2xl bg-panel border border-panel-border space-y-6">
                    <div className="flex items-center justify-between border-b border-panel-border pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-tech uppercase">
                          RECORD VERIFICATION SUCCESS
                        </span>
                        <h3 className="text-xl font-bold text-slate-100 mt-0.5">
                          {queryResult.certificate.title}
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 font-mono text-xs font-bold">
                        MST ANCHORED
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                      <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase">Recipient</span>
                        <span className="text-slate-100 font-bold block">{queryResult.certificate.studentName}</span>
                      </div>

                      <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase">Issuer</span>
                        <span className="text-slate-100 font-bold block">{queryResult.certificate.issuingAuthority}</span>
                      </div>

                      <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase">Issue Date</span>
                        <span className="text-slate-200 block">{queryResult.certificate.issueDate}</span>
                      </div>

                      <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase">MST Block Number</span>
                        <span className="text-slate-200 block">#{queryResult.certificate.blockNumber}</span>
                      </div>

                      {queryResult.certificate.transactionHash && (
                        <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border space-y-1 sm:col-span-2">
                          <span className="text-slate-400 text-[10px] uppercase">Transaction Hash</span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-cyan-tech break-all text-[11px]">
                              {queryResult.certificate.transactionHash}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCopyTx(queryResult.certificate?.transactionHash || "")}
                                className="p-1 text-slate-400 hover:text-slate-200"
                              >
                                {copiedTx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                              <a
                                href={queryResult.certificate.explorerUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-cyan-tech hover:text-cyan-300"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <CertificatePreview certificate={queryResult.certificate} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
