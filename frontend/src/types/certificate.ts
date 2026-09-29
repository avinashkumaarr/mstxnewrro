/**
 * Types for Real Generic AI-Assisted Blockchain Document Verification System
 * RoboLab Chain - Strict Real Data Protocol
 */

export interface DocumentMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  sha256: string;
  uploadedAt: string;
  previewUrl?: string;
  pageCount?: number;
}

export interface ExtractedDocumentFields {
  recipientName?: string | null;
  certificateTitle?: string | null;
  title?: string | null;
  issuerName?: string | null;
  issuer?: string | null;
  issueDate?: string | null;
  credentialId?: string | null;
  organization?: string | null;
  course?: string | null;
  skill?: string | null;
  skills?: string[];
  grade?: string | null;
  score?: number | null;
  duration?: string | null;
  registrationNumber?: string | null;
  rawText?: string | null;
  [key: string]: unknown;
}

export type OCRProcessingStatus =
  | "idle"
  | "processing"
  | "completed"
  | "failed"
  | "unavailable";

export interface OCRResult {
  status: OCRProcessingStatus;
  text?: string;
  fields: ExtractedDocumentFields;
  confidence?: number;
  errorMessage?: string;
}

export type AIRiskLevel = "low" | "medium" | "high";

export type AIAnalysisStatus =
  | "idle"
  | "analyzing"
  | "completed"
  | "failed"
  | "unavailable";

export interface AIAnalysisResult {
  status: AIAnalysisStatus;
  riskLevel?: AIRiskLevel;
  riskScore?: number; // 0-100
  findings: string[];
  explanation?: string;
  confidence?: number; // 0-1
  errorMessage?: string;
}

export type BlockchainRecordStatus =
  | "verified"
  | "pending"
  | "not_found"
  | "mismatch"
  | "unavailable";

export interface BlockchainRecord {
  status: BlockchainRecordStatus;
  network?: string;
  transactionHash?: string;
  blockNumber?: number;
  contractAddress?: string;
  registeredHash?: string;
  issuer?: string;
  timestamp?: string;
  errorMessage?: string;
}

export type HashMatchStatus =
  | "match"
  | "mismatch"
  | "not_found"
  | "unavailable";

export type OverallVerificationVerdict =
  | "verified"
  | "review"
  | "invalid"
  | "not_found"
  | "unavailable";

export interface VerificationResult {
  document: DocumentMetadata;
  extractedFields: ExtractedDocumentFields;
  ocr: OCRResult;
  aiAnalysis: AIAnalysisResult;
  blockchain: BlockchainRecord;
  hashMatch: HashMatchStatus;
  overallStatus: OverallVerificationVerdict;
  verifiedAt: string;
  verdictExplanation: string;
}

export interface RegisteredCertificate {
  id: string;
  title: string;
  recipientName?: string | null;
  issuerName?: string | null;
  issueDate?: string | null;
  category?: string | null;
  documentHash: string;
  transactionHash?: string | null;
  blockNumber?: number | null;
  contractAddress?: string | null;
  network?: string | null;
  status: "valid" | "pending" | "revoked";
  verificationUrl?: string | null;
  previewUrl?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CertificateRegistrationPayload {
  file: File;
  documentHash: string;
  fields: ExtractedDocumentFields;
  issuerNotes?: string;
}

export interface RegistrationResult {
  success: boolean;
  certificateId?: string;
  transactionHash?: string;
  blockNumber?: number;
  network?: string;
  registeredHash?: string;
  timestamp?: string;
  errorMessage?: string;
}

// Supporting / Compatibility types for credential cards & legacy viewers
export interface CredentialEvidenceMilestone {
  id: string;
  title: string;
  timestamp: string;
  details: string;
  blockNumber: number;
  txHash: string;
  verified: boolean;
  status: "confirmed" | "pending" | "failed" | string;
  eventName: string;
  score?: number;
  activityId: string;
  eventHash: string;
}

export interface Certificate {
  id: string;
  tokenId: string;
  tokenType: string;
  title: string;
  description?: string;
  category: string;
  studentName: string;
  recipientName: string;
  studentWallet: string;
  recipientWallet: string;
  studentId: string;
  issueDate: string;
  issuingAuthority: string;
  issuerName: string;
  issuerWallet: string;
  issuerSigner: string;
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  blockTimestamp: string;
  status: "valid" | "pending" | "revoked";
  score?: number;
  badgeColor: string;
  skills: string[];
  revocationReason?: string;
  revokedAt?: string;
  evidence: CredentialEvidenceMilestone[];
  network: string;
  explorerUrl: string;
  qrCodeData: string;
  documentHash?: string;
  certificateHash: string;
  verificationUrl: string;
  previewUrl?: string;
  revocation?: {
    isRevoked: boolean;
    reason?: string;
    revokedAt?: string;
    revokedBy?: string;
    transactionHash?: string;
  };
}

export interface CertificateIssuancePayload {
  studentName: string;
  studentWallet: string;
  studentId: string;
  courseTitle: string;
  category: string;
  score: number;
  skills: string[];
  challengeId: string;
  issuerSigner: string;
}

export type VerificationState =
  | "valid"
  | "pending"
  | "revoked"
  | "not_found"
  | "invalid"
  | "invalid_hash"
  | "blockchain_unavailable";
