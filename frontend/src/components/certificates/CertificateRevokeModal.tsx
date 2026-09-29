"use client";

import React, { useState } from "react";
import { Certificate } from "@/types/certificate";
import { certificateService } from "@/services/certificateService";
import {
  AlertTriangle,
  X,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface CertificateRevokeModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
  onRevoked: (updatedCert: Certificate) => void;
}

export const CertificateRevokeModal: React.FC<CertificateRevokeModalProps> = ({
  certificate,
  isOpen,
  onClose,
  onRevoked,
}) => {
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [revokingState, setRevokingState] = useState<
    "idle" | "pending" | "broadcasting" | "success"
  >("idle");
  const [revokedResult, setRevokedResult] = useState<Certificate | null>(null);

  if (!isOpen || !certificate) return null;

  const handleRevoke = async () => {
    if (!reason.trim() || confirmText !== certificate.id) return;

    setRevokingState("pending");
    await new Promise((resolve) => setTimeout(resolve, 600));

    setRevokingState("broadcasting");
    try {
      const updated = await certificateService.requestCertificateRevocation(
        certificate.id,
        reason
      );
      setRevokedResult(updated);
      setRevokingState("success");
      onRevoked(updated);
    } catch (e) {
      setRevokingState("idle");
    }
  };

  const resetAndClose = () => {
    setReason("");
    setConfirmText("");
    setRevokingState("idle");
    setRevokedResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none font-sans animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-panel border border-rose-500/40 shadow-2xl p-6 space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-panel-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Revoke Credential Attestation</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                  DANGER ZONE
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {certificate.id} • {certificate.recipientName}
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {revokingState === "success" && revokedResult ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>CREDENTIAL SUCCESSFULLY REVOKED</span>
              </div>
              <p className="text-xs text-slate-300">
                The public verification state has been transitioned to <strong>REVOKED</strong> on MST Testnet. The historical issuance trail remains immutable for auditability.
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono bg-panel-elevated p-3 rounded-lg border border-panel-border">
              <div className="flex justify-between">
                <span className="text-slate-400">Revocation Timestamp:</span>
                <span className="text-slate-200">{revokedResult.revocation?.revokedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Authorized Issuer:</span>
                <span className="text-slate-200">{revokedResult.revocation?.revokedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Revocation Reason:</span>
                <span className="text-rose-300">{revokedResult.revocation?.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Revocation TX:</span>
                <span className="text-cyan-400 truncate max-w-[220px]">
                  {revokedResult.revocation?.transactionHash}
                </span>
              </div>
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-2.5 rounded-lg bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-200 text-xs font-mono font-bold transition-colors"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Warning Box */}
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed space-y-1">
                <p className="font-semibold text-rose-300">
                  Revoking a certificate changes its public verification status.
                </p>
                <p className="text-[11px] text-slate-400">
                  The original issuance record remains auditable on the blockchain, but future verification queries will return <strong>REVOKED</strong> with your stated reason.
                </p>
              </div>
            </div>

            {/* Reason Field */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-slate-300 block font-bold">
                AUDITABLE REVOCATION REASON <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Telemetry divergence identified during offline simulation replay audit."
                className="w-full bg-[#070a12] border border-panel-border rounded-lg p-2.5 text-xs text-slate-200 font-sans focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Confirmation Field */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-slate-300 block font-bold">
                TYPE <span className="text-cyan-tech">{certificate.id}</span> TO CONFIRM
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={certificate.id}
                className="w-full bg-[#070a12] border border-panel-border rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2 rounded-lg bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-300 text-xs font-mono transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  !reason.trim() ||
                  confirmText !== certificate.id ||
                  revokingState !== "idle"
                }
                onClick={handleRevoke}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-mono font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-900/30"
              >
                {revokingState === "pending" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>REVOCATION PENDING...</span>
                  </>
                ) : revokingState === "broadcasting" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                    <span>BROADCASTING TO MST...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>CONFIRM REVOCATION</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
