"use client";

import React from "react";
import { Certificate } from "@/types/certificate";
import { QRCodeVector } from "./QRCodeVector";
import {
  Award,
  ShieldCheck,
  ExternalLink,
  Share2,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface CertificateCardProps {
  certificate: Certificate;
  onView: (certificate: Certificate) => void;
  onVerify: (certificate: Certificate) => void;
  onShare: (certificate: Certificate) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onView,
  onVerify,
  onShare,
}) => {
  const isRevoked = certificate.status === "revoked";
  const isPending = certificate.status === "pending";
  const isValid = certificate.status === "valid";

  return (
    <div className="relative group rounded-xl bg-panel border border-panel-border hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl hover:shadow-cyan-glow p-5 font-sans select-none overflow-hidden">
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          isRevoked
            ? "from-rose-500 to-red-600"
            : isPending
            ? "from-amber-400 to-orange-500"
            : "from-cyan-400 via-blue-500 to-emerald-400"
        }`}
      />

      <div className="space-y-3.5">
        {/* Header row: Badge, Status, and Token ID */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {certificate.previewUrl ? (
              <div className="w-11 h-11 rounded-xl border border-cyan-500/40 bg-black/70 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg p-1">
                <img
                  src={certificate.previewUrl}
                  alt={certificate.title}
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
            ) : (
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${certificate.badgeColor} flex items-center justify-center text-white shadow-lg flex-shrink-0`}
              >
                <Award className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="text-[10px] font-mono text-cyan-tech font-bold uppercase block tracking-wider">
                {certificate.tokenType} • {certificate.tokenId}
              </span>
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-tech transition-colors leading-snug line-clamp-1 mt-0.5">
                {certificate.title}
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            {isRevoked ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/50 text-rose-300">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                ! REVOKED
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300">
                <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                ● PENDING
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ✓ VERIFIED
              </span>
            )}
          </div>
        </div>

        {/* Category & Description snippet */}
        <div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-panel-border text-cyan-400 inline-block mb-1.5">
            {certificate.category}
          </span>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {certificate.description}
          </p>
        </div>

        {/* Metadata row with small QR code */}
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-panel-elevated border border-panel-border text-xs font-mono">
          <div className="space-y-1 text-[11px] text-slate-400">
            <div>
              ID: <span className="text-slate-200 font-bold">{certificate.id}</span>
            </div>
            <div>
              Issuer: <span className="text-slate-300">{certificate.issuerName}</span>
            </div>
            <div>
              Issued: <span className="text-slate-300">{certificate.issueDate}</span>
            </div>
          </div>

          <div
            onClick={() => onVerify(certificate)}
            className="cursor-pointer group/qr flex-shrink-0"
            title="Click to view QR and verify"
          >
            <QRCodeVector
              value={certificate.verificationUrl}
              size={44}
              includeBorder={true}
              className="group-hover/qr:border-cyan-tech transition-colors"
            />
          </div>
        </div>

        {/* Skills Tags */}
        {certificate.skills && certificate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {certificate.skills.slice(0, 4).map((s) => (
              <span
                key={s}
                className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-panel-border text-slate-300"
              >
                {s}
              </span>
            ))}
            {certificate.skills.length > 4 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                +{certificate.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-panel-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-tech" />
          <span>MST TESTNET</span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Certificate */}
          <button
            onClick={() => onView(certificate)}
            className="px-2.5 py-1.5 rounded bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-200 hover:text-cyan-tech text-xs font-mono font-semibold transition-colors flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </button>

          {/* Verify */}
          <button
            onClick={() => onVerify(certificate)}
            className="px-2.5 py-1.5 rounded bg-cyan-tech/10 hover:bg-cyan-tech/20 border border-cyan-500/40 text-cyan-tech text-xs font-mono font-semibold transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify</span>
          </button>

          {/* Share */}
          <button
            onClick={() => onShare(certificate)}
            className="p-1.5 rounded bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-400 hover:text-slate-100 text-xs transition-colors"
            title="Share Certificate"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
