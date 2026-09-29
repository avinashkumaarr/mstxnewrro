"use client";

import React, { useState } from "react";
import { Certificate, CertificateIssuancePayload } from "@/types/certificate";
import { certificateService } from "@/services/certificateService";
import {
  Award,
  CheckCircle2,
  X,
  Loader2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Cpu,
  FileCheck,
} from "lucide-react";

interface CertificateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssued: (newCert: Certificate) => void;
}

export const CertificateIssueModal: React.FC<CertificateIssueModalProps> = ({
  isOpen,
  onClose,
  onIssued,
}) => {
  const [studentName, setStudentName] = useState("Souvik Jana");
  const [studentWallet, setStudentWallet] = useState(
    "0x71A4B82F09a89CD1842b0129384910248102919"
  );
  const [courseTitle, setCourseTitle] = useState("Advanced Robotics Navigation");
  const [score, setScore] = useState(94);
  const [step, setStep] = useState<
    "review" | "preview" | "issuing" | "recording" | "completed"
  >("review");
  const [issuedCertificate, setIssuedCertificate] = useState<Certificate | null>(
    null
  );

  if (!isOpen) return null;

  const handleStartIssuance = async () => {
    setStep("issuing");
    await new Promise((resolve) => setTimeout(resolve, 800));

    setStep("recording");
    await new Promise((resolve) => setTimeout(resolve, 900));

    const payload: CertificateIssuancePayload = {
      studentName,
      studentWallet,
      studentId: "STU-88219",
      courseTitle,
      category: "Autonomous Systems",
      score,
      skills: [
        "RVO Avoidance",
        "Costmap2D",
        "Dynamic Kinematics",
        "ROS2 Nav2",
        "LiDAR Fusion",
      ],
      challengeId: "challenge-07",
      issuerSigner: "Dr. Alicia Vance (Lead Robotics Chair)",
    };

    const newCert = await certificateService.requestCertificateIssuance(payload);
    setIssuedCertificate(newCert);
    setStep("completed");
    onIssued(newCert);
  };

  const handleReset = () => {
    setStep("review");
    setIssuedCertificate(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none font-sans animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-panel border border-cyan-500/40 shadow-2xl p-6 sm:p-7 space-y-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-panel-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-cyan-glow">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-tech">
                <span>INSTRUCTOR AUTHORIZATION</span>
                <span className="text-slate-600">/</span>
                <span>MST TESTNET</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Issue Blockchain Certificate
              </h3>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 font-mono text-xs">
          <div
            className={`p-2.5 rounded-lg border text-center transition-colors ${
              step === "review"
                ? "bg-cyan-950/60 border-cyan-500 text-cyan-tech font-bold"
                : "bg-panel-elevated border-panel-border text-slate-400"
            }`}
          >
            1. Eligibility Review
          </div>
          <div
            className={`p-2.5 rounded-lg border text-center transition-colors ${
              step === "preview"
                ? "bg-cyan-950/60 border-cyan-500 text-cyan-tech font-bold"
                : "bg-panel-elevated border-panel-border text-slate-400"
            }`}
          >
            2. Preview & Sign
          </div>
          <div
            className={`p-2.5 rounded-lg border text-center transition-colors ${
              step === "issuing" || step === "recording" || step === "completed"
                ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold"
                : "bg-panel-elevated border-panel-border text-slate-400"
            }`}
          >
            3. MST Settlement
          </div>
        </div>

        {/* STEP 1: REVIEW */}
        {step === "review" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-panel-elevated border border-panel-border space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-panel-border pb-2.5">
                <span className="text-slate-400">STUDENT RECIPIENT</span>
                <span className="text-slate-100 font-bold text-sm">
                  {studentName}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-panel-border pb-2.5">
                <span className="text-slate-400">ACHIEVEMENT TRACK</span>
                <span className="text-cyan-tech font-bold">{courseTitle}</span>
              </div>
              <div className="flex items-center justify-between border-b border-panel-border pb-2.5">
                <span className="text-slate-400">EVALUATION SCORE</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {score} / 100 (Pass with Distinction)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">STUDENT WALLET</span>
                <span className="text-slate-300 text-[11px]">
                  {studentWallet.slice(0, 10)}...{studentWallet.slice(-8)}
                </span>
              </div>
            </div>

            {/* Eligibility Checklist */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-panel-border space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-300">
                Eligibility Audit Verification
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>All required simulation challenges cleared with zero collisions</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Minimum score threshold satisfied (&ge; 85%)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Authorized instructor review completed and endorsed</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-300 text-xs font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("preview")}
                className="px-5 py-2 rounded-lg bg-cyan-tech hover:bg-cyan-tech-dark text-black font-mono font-bold text-xs transition-colors flex items-center gap-1.5 shadow-cyan-glow"
              >
                <span>Proceed to Preview</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW */}
        {step === "preview" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-center space-y-2">
              <span className="text-[10px] font-mono text-cyan-tech uppercase tracking-widest font-bold">
                Certificate Preview Summary
              </span>
              <h3 className="text-xl font-extrabold text-slate-100">
                {courseTitle}
              </h3>
              <p className="text-xs text-slate-300">
                Awarded to <strong className="text-cyan-tech">{studentName}</strong>
              </p>
              <div className="text-[11px] font-mono text-slate-400">
                Authorized Signer: Dr. Alicia Vance (Lead Robotics Chair)
              </div>
              <div className="text-[10px] font-mono text-purple-400 pt-1">
                Token Standard: Soulbound Non-Transferable ERC-5192 on MST Testnet
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep("review")}
                className="px-4 py-2 rounded-lg bg-panel-elevated hover:bg-slate-800 border border-panel-border text-slate-300 text-xs font-mono transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleStartIssuance}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs transition-colors flex items-center gap-2 shadow-cyan-glow"
              >
                <FileCheck className="w-4 h-4" />
                <span>ISSUE CERTIFICATE</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 & 4: ISSUING / RECORDING */}
        {(step === "issuing" || step === "recording") && (
          <div className="py-8 text-center space-y-4 font-mono">
            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center text-cyan-tech animate-pulse shadow-cyan-glow">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-100">
                {step === "issuing"
                  ? "ISSUING CREDENTIAL..."
                  : "RECORDING ON MST BLOCKCHAIN..."}
              </h4>
              <p className="text-xs text-slate-400">
                {step === "issuing"
                  ? "Generating tamper-proof cryptographic attestation..."
                  : "Broadcasting soulbound token transaction to MST Testnet validators..."}
              </p>
            </div>

            <div className="text-[11px] text-cyan-tech/80 bg-slate-900/80 p-2.5 rounded-lg max-w-sm mx-auto border border-panel-border">
              Simulated deterministic block confirmation in progress
            </div>
          </div>
        )}

        {/* STEP 5: COMPLETED */}
        {step === "completed" && issuedCertificate && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-center space-y-2 animate-fadeIn">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-emerald-300">
                ✓ CERTIFICATE ISSUED & ANCHORED
              </h4>
              <p className="text-xs text-slate-300">
                The credential has been permanently minted as an ERC-5192 Soulbound Token to {studentName}.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-panel-elevated border border-panel-border space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Certificate ID:</span>
                <span className="text-cyan-tech font-bold">
                  {issuedCertificate.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Hash:</span>
                <span className="text-slate-200 truncate max-w-[240px]">
                  {issuedCertificate.transactionHash}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Settlement Block:</span>
                <span className="text-slate-200">
                  #{issuedCertificate.blockNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Network:</span>
                <span className="text-slate-200">{issuedCertificate.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-200">{issuedCertificate.issueDate}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-lg bg-cyan-tech hover:bg-cyan-tech-dark text-black font-mono font-bold text-xs transition-colors shadow-cyan-glow"
            >
              Done & View Certificates
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
