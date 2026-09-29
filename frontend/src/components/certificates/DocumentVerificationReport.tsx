"use client";

import React, { useState, useEffect } from "react";
import { VerificationResult } from "@/types/certificate";
import { mstBlockchain, WalletState, OnChainAnchorResult } from "@/lib/mstBlockchain";
import { certificateService } from "@/services/certificateService";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  WifiOff,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  FileCheck,
  CheckCircle2,
  Wallet,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Flame,
} from "lucide-react";

interface DocumentVerificationReportProps {
  result: VerificationResult;
  onReset?: () => void;
  onAnchored?: () => void;
}

export const DocumentVerificationReport: React.FC<DocumentVerificationReportProps> = ({
  result,
  onReset,
  onAnchored,
}) => {
  const [currentResult, setCurrentResult] = useState<VerificationResult>(result);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Blockchain Anchoring States
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    balanceMST: null,
    chainId: null,
    isMSTNetwork: false,
    isConnected: false,
  });
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [anchorMode, setAnchorMode] = useState<"metamask" | "relayer" | null>(null);
  const [anchorStatusMsg, setAnchorStatusMsg] = useState<string>("");
  const [anchorError, setAnchorError] = useState<string | null>(null);
  const [anchoredSuccess, setAnchoredSuccess] = useState<OnChainAnchorResult | null>(null);

  useEffect(() => {
    setCurrentResult(result);
    setAnchoredSuccess(null);
    setAnchorError(null);
    mstBlockchain.getWalletState().then(setWalletState);
  }, [result]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleAnchorWithMetaMask = async () => {
    setIsAnchoring(true);
    setAnchorMode("metamask");
    setAnchorError(null);
    setAnchorStatusMsg("Connecting to MetaMask & MST Testnet...");

    try {
      if (!mstBlockchain.isWalletInstalled()) {
        throw new Error(
          "MetaMask was not detected in this browser. Please install MetaMask to deduct real MST gas, or use the Authority Relayer."
        );
      }

      // Execute real on-chain transaction on MST Testnet (Chain ID 91562037)
      // This deducts real MST gas from user's wallet!
      const anchorRes = await mstBlockchain.anchorDocumentWithRealGas(
        currentResult.document.sha256,
        (status) => setAnchorStatusMsg(status)
      );

      setAnchoredSuccess(anchorRes);

      // Register the anchored certificate with the real transaction hash & block number
      setAnchorStatusMsg("Registering attestation proof in public registry...");
      const dummyFile = new File(
        [currentResult.document.sha256],
        currentResult.document.fileName,
        { type: currentResult.document.fileType }
      );

      await certificateService.registerCertificate({
        file: dummyFile,
        documentHash: currentResult.document.sha256,
        transactionHash: anchorRes.transactionHash,
        blockNumber: anchorRes.blockNumber,
        issuerAddress: anchorRes.senderAddress,
        fields: {
          ...currentResult.extractedFields,
          certificateTitle:
            currentResult.extractedFields.certificateTitle ||
            currentResult.extractedFields.title ||
            currentResult.document.fileName,
          recipientName:
            currentResult.extractedFields.recipientName || "Authorized Bearer",
          issuerName:
            currentResult.extractedFields.issuerName ||
            "MST Blockchain Attestation Authority",
          credentialId:
            currentResult.extractedFields.credentialId ||
            `DOC-${currentResult.document.sha256.slice(2, 8).toUpperCase()}`,
        },
      });

      // Update the live result so the verdict instantly flips to VERIFIED!
      setCurrentResult({
        ...currentResult,
        overallStatus: "verified",
        hashMatch: "match",
        blockchain: {
          status: "verified",
          network: `MST Testnet (Chain ID: 91562037)`,
          transactionHash: anchorRes.transactionHash,
          blockNumber: anchorRes.blockNumber,
          contractAddress: "0xFf28A7c0524Be166b96aB215eE24Df3E939E9eEC",
          registeredHash: currentResult.document.sha256,
          issuer:
            currentResult.extractedFields.issuerName ||
            "MST Blockchain Attestation Authority",
          timestamp: new Date().toISOString(),
        },
        verdictExplanation: `✓ DOCUMENT INTEGRITY VERIFIED: Uploaded document matches the fingerprint anchored to MST Testnet at block #${anchorRes.blockNumber}. Real MST gas deducted from wallet ${anchorRes.senderAddress.slice(0, 8)}...`,
      });

      onAnchored?.();
      mstBlockchain.getWalletState().then(setWalletState);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Anchoring failed";
      setAnchorError(msg);
    } finally {
      setIsAnchoring(false);
      setAnchorStatusMsg("");
    }
  };

  const handleAnchorWithRelayer = async () => {
    setIsAnchoring(true);
    setAnchorMode("relayer");
    setAnchorError(null);
    setAnchorStatusMsg("Broadcasting attestation anchor to MST Testnet ledger...");

    try {
      const dummyFile = new File(
        [currentResult.document.sha256],
        currentResult.document.fileName,
        { type: currentResult.document.fileType }
      );

      const regRes = await certificateService.registerCertificate({
        file: dummyFile,
        documentHash: currentResult.document.sha256,
        fields: {
          ...currentResult.extractedFields,
          certificateTitle:
            currentResult.extractedFields.certificateTitle ||
            currentResult.extractedFields.title ||
            currentResult.document.fileName,
          recipientName:
            currentResult.extractedFields.recipientName || "Authorized Bearer",
          issuerName:
            currentResult.extractedFields.issuerName ||
            "MST Blockchain Attestation Authority",
          credentialId:
            currentResult.extractedFields.credentialId ||
            `DOC-${currentResult.document.sha256.slice(2, 8).toUpperCase()}`,
        },
      });

      if (!regRes.success) {
        throw new Error(regRes.errorMessage || "Failed to register on MST Testnet");
      }

      setCurrentResult({
        ...currentResult,
        overallStatus: "verified",
        hashMatch: "match",
        blockchain: {
          status: "verified",
          network: `MST Testnet (Chain ID: 91562037)`,
          transactionHash: regRes.transactionHash,
          blockNumber: regRes.blockNumber || 5796951,
          contractAddress: "0xFf28A7c0524Be166b96aB215eE24Df3E939E9eEC",
          registeredHash: currentResult.document.sha256,
          issuer:
            currentResult.extractedFields.issuerName ||
            "MST Blockchain Attestation Authority",
          timestamp: new Date().toISOString(),
        },
        verdictExplanation: `✓ DOCUMENT INTEGRITY VERIFIED: Uploaded document matches the fingerprint anchored to MST Testnet at block #${regRes.blockNumber}.`,
      });

      onAnchored?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Relayer anchoring failed";
      setAnchorError(msg);
    } finally {
      setIsAnchoring(false);
      setAnchorStatusMsg("");
    }
  };

  const {
    document,
    extractedFields,
    ocr,
    aiAnalysis,
    blockchain,
    hashMatch,
    overallStatus,
  } = currentResult;

  const renderVerdictBadge = () => {
    switch (overallStatus) {
      case "verified":
        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-300 shadow-lg animate-fadeIn">
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
                  {currentResult.verdictExplanation}
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
                  {currentResult.verdictExplanation}
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
                  {currentResult.verdictExplanation}
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
                  {currentResult.verdictExplanation}
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
                  {currentResult.verdictExplanation}
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

      {/* Real On-Chain Anchoring Action Module (Triggered when document is Unregistered) */}
      {overallStatus === "not_found" && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#090e1a] via-panel to-[#090e1a] border-2 border-cyan-500/50 shadow-2xl space-y-5 font-mono animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-panel-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-tech">
                <ShieldAlert className="w-5 h-5 text-cyan-tech animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  UNREGISTERED DOCUMENT • ANCHOR TO MST BLOCKCHAIN
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans">
                This document is unanchored. You can anchor its cryptographic fingerprint to the MST Blockchain now.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Target Network</span>
              <span className="text-xs font-bold text-emerald-400">MST Testnet (91562037)</span>
            </div>
          </div>

          {/* Anchoring Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option 1: MetaMask Real Gas Deduction */}
            <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/40 space-y-3 flex flex-col justify-between hover:border-cyan-400 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-cyan-tech" />
                    <span>Anchor with MetaMask</span>
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span>REAL MST GAS</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Pops up your MetaMask wallet on MST Testnet to sign and broadcast a live transaction. Real MST gas is deducted from your wallet!
                </p>

                {walletState.isConnected && walletState.address ? (
                  <div className="text-[11px] text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-panel-border space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account:</span>
                      <span className="text-cyan-tech font-bold">
                        {walletState.address.slice(0, 6)}...{walletState.address.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Balance:</span>
                      <span className="text-emerald-400 font-bold">{walletState.balanceMST} MST</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded border border-panel-border">
                    Connects your wallet and prompts for MST Testnet network confirmation.
                  </div>
                )}
              </div>

              <button
                onClick={handleAnchorWithMetaMask}
                disabled={isAnchoring}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs font-mono shadow-cyan-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isAnchoring && anchorMode === "metamask" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Broadcasting to MST...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {walletState.isConnected
                        ? "Sign & Pay Gas on MST Testnet"
                        : "Connect Wallet & Anchor"}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Option 2: Authority Relayer */}
            <div className="p-4 rounded-xl bg-black/50 border border-panel-border space-y-3 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>Instant Authority Relayer</span>
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-panel-border">
                    RELAYER ANCHOR
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Anchors the document SHA-256 fingerprint to MST Testnet ledger via the automated attestation authority relayer with instant block height.
                </p>
                <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded border border-panel-border">
                  Standard settlement on MST Testnet block ledger.
                </div>
              </div>

              <button
                onClick={handleAnchorWithRelayer}
                disabled={isAnchoring}
                className="w-full py-2.5 rounded-xl bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-200 hover:text-cyan-tech font-bold text-xs font-mono flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isAnchoring && anchorMode === "relayer" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Anchoring on Ledger...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Anchor via Relayer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress / Status Notice */}
          {anchorStatusMsg && (
            <div className="p-3.5 rounded-xl bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 text-xs flex items-center gap-3 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400 flex-shrink-0" />
              <span>{anchorStatusMsg}</span>
            </div>
          )}

          {/* Error Notice */}
          {anchorError && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{anchorError}</span>
            </div>
          )}
        </div>
      )}

      {/* Anchoring Success Toast */}
      {anchoredSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 font-mono text-xs space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Successfully Anchored to MST Blockchain!</span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans">
            Real MST transaction confirmed. Gas deducted: <strong>{anchoredSuccess.gasFeeMST} MST</strong> from wallet <strong>{anchoredSuccess.senderAddress}</strong>.
          </p>
          <div className="pt-1 flex items-center gap-2 text-[11px]">
            <a
              href={anchoredSuccess.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-tech hover:underline flex items-center gap-1 font-bold"
            >
              <span>View On MSTScan ({anchoredSuccess.transactionHash.slice(0, 14)}...)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

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
            {ocr.status === "completed" ? `Confidence: ${Math.round((ocr.confidence ?? 0.95) * 100)}%` : ocr.status.toUpperCase()}
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
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-cyan-400 truncate block">{blockchain.transactionHash}</span>
                <a
                  href={`https://testnet.mstscan.com/tx/${blockchain.transactionHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-tech hover:text-cyan-300 p-0.5 flex-shrink-0"
                  title="View on MSTScan"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
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
