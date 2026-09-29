"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  VerificationResult,
  RegisteredCertificate,
  Certificate,
} from "@/types/certificate";
import { certificateService } from "@/services/certificateService";
import { DocumentUploader } from "@/components/certificates/DocumentUploader";
import { DocumentViewer } from "@/components/certificates/DocumentViewer";
import { DocumentVerificationReport } from "@/components/certificates/DocumentVerificationReport";
import { RegisterCertificateModal } from "@/components/certificates/RegisterCertificateModal";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { CertificateDetailModal } from "@/components/certificates/CertificateDetailModal";
import { CertificateShareModal } from "@/components/certificates/CertificateShareModal";
import { CertificateRevokeModal } from "@/components/certificates/CertificateRevokeModal";
import {
  Award,
  ShieldCheck,
  Search,
  PlusCircle,
  FileCheck2,
  AlertTriangle,
  ExternalLink,
  Layers,
  RefreshCw,
  ServerOff,
  Cpu,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState<"verify" | "registry">("verify");

  // Document verification workflow states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [computedSha256, setComputedSha256] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState<string>("");
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);

  // Registry states (Real backend data only)
  const [registeredCertificates, setRegisteredCertificates] = useState<
    RegisteredCertificate[]
  >([]);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [registryLoading, setRegistryLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [detailCert, setDetailCert] = useState<Certificate | null>(null);
  const [shareCert, setShareCert] = useState<Certificate | null>(null);
  const [revokeCert, setRevokeCert] = useState<Certificate | null>(null);

  // MST Chain Info
  const [currentBlockNumber, setCurrentBlockNumber] = useState<number | null>(
    null
  );

  useEffect(() => {
    loadRegistry();
    fetchChainHeight();
  }, []);

  const fetchChainHeight = async () => {
    try {
      const res = await fetch("/api/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result) {
          setCurrentBlockNumber(parseInt(json.result, 16));
        }
      }
    } catch {
      // Ignore RPC connection errors silently
    }
  };

  const loadRegistry = async () => {
    setRegistryLoading(true);
    const res = await certificateService.getCertificates();
    setRegisteredCertificates(res.certificates);
    setIsBackendOnline(res.isBackendOnline);
    setBackendError(res.errorMessage || null);
    setRegistryLoading(false);
  };

  const handleFileSelected = (file: File, sha256: string) => {
    setSelectedFile(file);
    setComputedSha256(sha256);
    setVerificationResult(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setComputedSha256("");
    setVerificationResult(null);
  };

  const handleRunVerification = async () => {
    if (!selectedFile) return;
    setIsVerifying(true);
    setVerificationProgress("Initializing verification workflow...");

    try {
      const result = await certificateService.verifyUploadedFile(
        selectedFile,
        (step) => setVerificationProgress(step)
      );
      setVerificationResult(result);
    } catch (err: unknown) {
      console.error("Verification execution error:", err);
    } finally {
      setIsVerifying(false);
      setVerificationProgress("");
    }
  };

  // Convert RegisteredCertificate to Certificate for display in cards
  const mappedCertificates: Certificate[] = registeredCertificates.map((c) => ({
    id: c.id,
    tokenId: c.id,
    tokenType: "ERC-5192",
    title: c.title,
    category: c.category || "Document & Credential Attestation",
    studentName: c.recipientName || "Unspecified",
    studentWallet:
      (c.metadata?.studentWallet as string) ||
      "0x0000000000000000000000000000000000000000",
    studentId: (c.metadata?.studentId as string) || c.id,
    issueDate: c.issueDate || c.createdAt,
    issuingAuthority: c.issuerName || "Document Attestation Authority",
    issuerSigner: c.issuerName || "Document Attestation Authority",
    contractAddress:
      c.contractAddress ||
      process.env.NEXT_PUBLIC_CONTRACT_ROBOT_EVENT_LEDGER ||
      "0xFf28A7c0524Be166b96aB215eE24Df3E939E9eEC",
    transactionHash: c.transactionHash || "",
    blockNumber: c.blockNumber || 0,
    blockTimestamp: c.createdAt,
    status: c.status,
    badgeColor: "from-cyan-500 to-blue-600",
    skills: Array.isArray(c.metadata?.skills)
      ? (c.metadata.skills as string[])
      : [],
    evidence: [],
    network: c.network || "MST Testnet",
    explorerUrl: `https://testnet.mstscan.com/tx/${c.transactionHash}`,
    qrCodeData: c.verificationUrl || `https://testnet.mstscan.com/cert/${c.id}`,
    documentHash: c.documentHash,
    certificateHash: c.documentHash,
    verificationUrl: c.verificationUrl || `https://testnet.mstscan.com/cert/${c.id}`,
    recipientName: c.recipientName || "Unspecified",
    recipientWallet: (c.metadata?.studentWallet as string) || "0x0000000000000000000000000000000000000000",
    issuerName: c.issuerName || "Document Attestation Authority",
    issuerWallet: "0x0000000000000000000000000000000000000000",
    previewUrl: (c.metadata?.previewUrl as string) || (c.previewUrl as string) || undefined,
  }));

  const filteredCertificates = mappedCertificates.filter((cert) => {
    const q = searchQuery.toLowerCase();
    return (
      cert.title.toLowerCase().includes(q) ||
      cert.id.toLowerCase().includes(q) ||
      cert.studentName.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-panel-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-tech font-bold uppercase tracking-wider">
              <span>DOCUMENT ATTESTATION</span>
              <span className="text-slate-600">/</span>
              <span>MST TESTNET (CHAIN 91562037)</span>
              <span className="text-slate-600">/</span>
              <span className="text-purple-400">AI-ASSISTED BITWISE VERIFIER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
              DOCUMENT & CERTIFICATE VERIFICATION
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verify the authenticity and integrity of ANY robotics certificate, degree, or lab document against the MST Blockchain.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/verify"
              className="px-3.5 py-2 rounded-xl bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-200 hover:text-cyan-tech text-xs font-mono font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-tech" />
              <span>Public Verifier</span>
            </Link>

            <button
              onClick={() => setRegisterModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-cyan-glow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Document</span>
            </button>
          </div>
        </div>

        {/* Live Network Banner */}
        <div className="p-3.5 rounded-xl bg-panel border border-panel-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-bold">MST Testnet Live</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Chain ID: <strong className="text-cyan-tech">91562037</strong></span>
            {currentBlockNumber && (
              <>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Height: <strong className="text-slate-200">#{currentBlockNumber}</strong></span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Backend:</span>
            {isBackendOnline ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 font-bold text-[10px]">
                ONLINE (PORT 8000)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-rose-950/60 border border-rose-500/50 text-rose-400 font-bold text-[10px] flex items-center gap-1">
                <ServerOff className="w-3 h-3" />
                OFFLINE
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-panel-border pb-2">
          <button
            onClick={() => setActiveTab("verify")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "verify"
                ? "bg-cyan-tech text-black shadow-cyan-glow"
                : "text-slate-400 hover:text-slate-200 bg-panel border border-panel-border"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>VERIFY ANY DOCUMENT</span>
          </button>

          <button
            onClick={() => setActiveTab("registry")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "registry"
                ? "bg-cyan-tech text-black shadow-cyan-glow"
                : "text-slate-400 hover:text-slate-200 bg-panel border border-panel-border"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>ATTESTED REGISTRY ({registeredCertificates.length})</span>
          </button>
        </div>

        {/* TAB 1: VERIFY ANY DOCUMENT WORKFLOW */}
        {activeTab === "verify" && (
          <div className="space-y-6">
            {/* Step 1: Upload or Document Preview */}
            {!selectedFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-tech" />
                    <span>STEP 1: UPLOAD DOCUMENT FOR BITWISE AUDIT</span>
                  </h2>
                  <span className="text-[11px] font-mono text-slate-500">
                    PDF, PNG, JPG, JPEG (Max 25MB)
                  </span>
                </div>

                <DocumentUploader
                  onFileSelected={handleFileSelected}
                  isVerifying={isVerifying}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-panel border border-panel-border">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-cyan-tech font-bold uppercase tracking-wider">
                      ACTIVE DOCUMENT UNDER AUDIT
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 font-mono truncate max-w-lg">
                      {selectedFile.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearFile}
                      disabled={isVerifying}
                      className="px-3.5 py-2 rounded-xl bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors"
                    >
                      Upload Different Document
                    </button>

                    <button
                      onClick={handleRunVerification}
                      disabled={isVerifying}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-mono font-bold transition-all shadow-cyan-glow disabled:opacity-50 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isVerifying ? "Auditing Document..." : "Analyze & Verify on Blockchain"}</span>
                    </button>
                  </div>
                </div>

                {/* Progress banner when actively auditing */}
                {isVerifying && (
                  <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/50 flex items-center gap-3 text-cyan-300 font-mono text-xs animate-pulse">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <div className="space-y-0.5">
                      <span className="font-bold block">Executing Real Dynamic Audit...</span>
                      <span className="text-cyan-200/80 text-[11px]">{verificationProgress}</span>
                    </div>
                  </div>
                )}

                {/* Grid: Document Viewer + Live Report */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Document Viewer (5 cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                      Document Visual Preview
                    </h3>
                    <DocumentViewer
                      file={selectedFile}
                      sha256={computedSha256}
                    />
                  </div>

                  {/* Right Column: Verification Report or Action Card (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    {verificationResult ? (
                      <DocumentVerificationReport
                        result={verificationResult}
                        onReset={handleClearFile}
                      />
                    ) : (
                      <div className="p-6 rounded-2xl bg-panel border border-panel-border text-center space-y-4 font-mono">
                        <Cpu className="w-10 h-10 mx-auto text-cyan-tech" />
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-slate-200">
                            Ready to Execute Cryptographic Attestation
                          </h4>
                          <p className="text-xs text-slate-400 max-w-md mx-auto">
                            The document SHA-256 fingerprint has been computed in your browser using the Web Crypto API. Click the button below to extract OCR fields, perform AI anomaly analysis, and check anchor records on MST Testnet.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-black/40 border border-panel-border text-left space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase">Computed SHA-256</span>
                          <span className="text-cyan-tech break-all text-xs font-mono block">
                            {computedSha256}
                          </span>
                        </div>

                        <button
                          onClick={handleRunVerification}
                          disabled={isVerifying}
                          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-cyan-glow flex items-center gap-2 mx-auto"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Run Complete Verification Pipeline</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ATTESTED REGISTRY */}
        {activeTab === "registry" && (
          <div className="space-y-6">
            {/* Search & Refresh Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, recipient, ID..."
                  className="w-full bg-[#070a12] border border-panel-border rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-tech"
                />
              </div>

              <button
                onClick={loadRegistry}
                disabled={registryLoading}
                className="px-3.5 py-2 rounded-xl bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-300 text-xs font-mono flex items-center gap-2 justify-center"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    registryLoading ? "animate-spin text-cyan-tech" : ""
                  }`}
                />
                <span>Refresh Registry</span>
              </button>
            </div>

            {/* Backend offline warning banner */}
            {!isBackendOnline && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/50 flex items-start gap-3 text-amber-300 font-mono text-xs">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <span className="font-bold block">Backend Database Offline</span>
                  <p className="text-slate-300 mt-0.5">
                    {backendError || "Backend API is unreachable at http://localhost:8000. Start backend with 'uvicorn main:app --reload --port 8000'."}
                  </p>
                  <p className="text-[11px] text-amber-400/80 mt-1">
                    No mock certificates are being displayed to preserve strict authenticity.
                  </p>
                </div>
              </div>
            )}

            {/* Certificates List */}
            {registryLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-xl bg-panel border border-panel-border"
                  />
                ))}
              </div>
            ) : filteredCertificates.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-panel border border-panel-border space-y-3 font-mono">
                <Award className="w-10 h-10 mx-auto text-slate-600" />
                <h3 className="text-sm font-bold text-slate-300">
                  {isBackendOnline
                    ? "No certificates registered in database yet"
                    : "No records available (Backend offline)"}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isBackendOnline
                    ? "Register a new document using the 'Register Document' button to anchor its SHA-256 fingerprint on MST Testnet."
                    : "Start the backend server on port 8000 or register a document directly to populate this registry."}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setRegisterModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold font-mono shadow-cyan-glow"
                  >
                    Register First Document
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertificates.map((cert) => (
                  <CertificateCard
                    key={cert.id}
                    certificate={cert}
                    onView={(c) => setDetailCert(c)}
                    onVerify={(c) => {
                      window.location.href = `/verify/${c.id}`;
                    }}
                    onShare={(c) => setShareCert(c)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <RegisterCertificateModal
          isOpen={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          onRegistered={() => {
            loadRegistry();
          }}
        />

        <CertificateDetailModal
          certificate={detailCert}
          isOpen={Boolean(detailCert)}
          onClose={() => setDetailCert(null)}
          onShare={(c) => setShareCert(c)}
          onRevokeClick={(c) => setRevokeCert(c)}
        />

        <CertificateShareModal
          certificate={shareCert}
          isOpen={Boolean(shareCert)}
          onClose={() => setShareCert(null)}
        />

        <CertificateRevokeModal
          certificate={revokeCert}
          isOpen={Boolean(revokeCert)}
          onClose={() => setRevokeCert(null)}
          onRevoked={() => {
            loadRegistry();
          }}
        />
      </div>
    </DashboardLayout>
  );
}
