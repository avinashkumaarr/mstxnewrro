"use client";

import React, { useState } from "react";
import { Certificate } from "@/types/certificate";
import { QRCodeVector } from "./QRCodeVector";
import {
  X,
  Copy,
  Check,
  Download,
  Share2,
  Printer,
  ExternalLink,
  ShieldCheck,
  QrCode,
  Sparkles,
} from "lucide-react";

interface CertificateShareModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
  onPrintPreview?: () => void;
}

export const CertificateShareModal: React.FC<CertificateShareModalProps> = ({
  certificate,
  isOpen,
  onClose,
  onPrintPreview,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);

  if (!isOpen || !certificate) return null;

  const verificationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${certificate.id}`
      : certificate.verificationUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const embedSnippet = `<iframe src="${verificationUrl}" width="600" height="400" frameborder="0"></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleDownloadQR = () => {
    // Generates simple SVG download for the QR code
    const svgElement = document.querySelector("#share-qr-container svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QR-${certificate.id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = () => {
    setDownloadingImage(true);
    // Trigger print or direct image save
    setTimeout(() => {
      window.print();
      setDownloadingImage(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-sans animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-panel border border-panel-border shadow-2xl p-6 space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-panel-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-tech/10 border border-cyan-500/40 flex items-center justify-center text-cyan-tech">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Share Credential</h3>
              <p className="text-xs text-slate-400 font-mono">
                {certificate.id} • {certificate.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-5 rounded-xl bg-panel-elevated border border-panel-border flex flex-col sm:flex-row items-center gap-5">
          <div id="share-qr-container" className="flex-shrink-0">
            <QRCodeVector value={verificationUrl} size={110} includeBorder={true} />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-mono text-cyan-tech uppercase font-bold tracking-wider block">
              Cryptographic QR Code
            </span>
            <h4 className="text-xs font-bold text-slate-200">
              Anyone with this QR code can instantly verify this credential.
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Scan with any mobile camera or QR reader to authenticate against MST Blockchain state proof.
            </p>
            <button
              onClick={handleDownloadQR}
              className="text-xs font-mono text-cyan-tech hover:underline flex items-center justify-center sm:justify-start gap-1 pt-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SVG QR Code</span>
            </button>
          </div>
        </div>

        {/* Verification Link Copy Field */}
        <div className="space-y-1.5 font-mono text-xs">
          <label className="text-[11px] text-slate-400 block font-bold">
            PUBLIC VERIFICATION LINK
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={verificationUrl}
              className="w-full bg-[#070a12] border border-panel-border rounded-lg px-3 py-2 text-xs text-cyan-tech font-mono focus:outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-lg bg-cyan-tech hover:bg-cyan-tech-dark text-black font-bold text-xs transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-cyan-glow"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Export Actions: Print / PDF / Image */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              if (onPrintPreview) onPrintPreview();
              else window.print();
            }}
            className="p-3 rounded-xl bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-200 hover:text-cyan-tech font-mono text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print / Save as PDF</span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={downloadingImage}
            className="p-3 rounded-xl bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-200 hover:text-cyan-tech font-mono text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>{downloadingImage ? "Rendering..." : "Export Certificate"}</span>
          </button>
        </div>

        {/* Embed code snippet toggle */}
        <div className="border-t border-panel-border pt-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Portfolio / Website Embed:</span>
            <button
              onClick={handleCopyEmbed}
              className="text-cyan-tech hover:underline flex items-center gap-1 text-[11px]"
            >
              {copiedEmbed ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedEmbed ? "Snippet Copied" : "Copy iframe"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
