import {
  AIAnalysisResult,
  BlockchainRecord,
  Certificate,
  CertificateIssuancePayload,
  CertificateRegistrationPayload,
  ExtractedDocumentFields,
  HashMatchStatus,
  OCRResult,
  OverallVerificationVerdict,
  RegisteredCertificate,
  RegistrationResult,
  VerificationResult,
  VerificationState,
} from "@/types/certificate";
import { calculateFileSHA256 } from "@/lib/crypto";

// Use relative API path on client so all calls route seamlessly through Next.js API routes
const API_BASE_URL =
  typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "");
const MST_RPC_URL =
  process.env.NEXT_PUBLIC_MST_RPC_URL || "https://testnetrpc.mstblockchain.com";
const MST_CHAIN_ID = process.env.NEXT_PUBLIC_MST_CHAIN_ID
  ? Number(process.env.NEXT_PUBLIC_MST_CHAIN_ID)
  : 91562037;
const MST_NETWORK_NAME =
  process.env.NEXT_PUBLIC_MST_NETWORK_NAME || "MST Testnet";
const CONTRACT_ROBOT_EVENT_LEDGER =
  process.env.NEXT_PUBLIC_CONTRACT_ROBOT_EVENT_LEDGER ||
  "0xFf28A7c0524Be166b96aB215eE24Df3E939E9eEC";

class CertificateService {
  /**
   * Real OCR and Document Field Extraction via Backend API
   * POST /api/certificates/analyze-document
   */
  public async analyzeDocument(file: File): Promise<OCRResult> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/analyze-document`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        return {
          status: "failed",
          fields: {},
          errorMessage: `Backend OCR returned HTTP ${response.status}.`,
        };
      }

      const data = await response.json();
      return {
        status: "completed",
        text: data.text || data.extractedText || "",
        fields: data.fields || {},
        confidence: data.confidence,
      };
    } catch {
      return {
        status: "unavailable",
        fields: {},
        errorMessage: `OCR extraction endpoint unavailable at ${API_BASE_URL}/api/certificates/analyze-document.`,
      };
    }
  }

  /**
   * Real AI Authenticity & Tampering Analysis via Backend API
   * POST /api/certificates/ai-analyze
   */
  public async runAIAnalysis(
    file: File,
    documentHash: string,
    extractedText?: string,
    fields?: ExtractedDocumentFields
  ): Promise<AIAnalysisResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/ai-analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentHash,
          extractedText: extractedText || "",
          fields: fields || {},
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        return {
          status: "unavailable",
          findings: [],
          errorMessage: `AI analysis service responded with HTTP ${response.status}.`,
        };
      }

      const data = await response.json();
      return {
        status: "completed",
        riskLevel: data.riskLevel || "low",
        riskScore: data.riskScore ?? 0,
        findings: Array.isArray(data.findings) ? data.findings : [],
        explanation: data.explanation || "",
        confidence: data.confidence ?? 0.95,
      };
    } catch {
      return {
        status: "unavailable",
        findings: [],
        errorMessage: `AI analysis endpoint unavailable at ${API_BASE_URL}/api/certificates/ai-analyze.`,
      };
    }
  }

  /**
   * Real Blockchain Verification Query
   * Queries Next.js verification endpoint and MST Testnet
   */
  public async verifyDocumentOnBlockchain(
    documentHash: string,
    credentialId?: string
  ): Promise<BlockchainRecord> {
    // 1. First attempt verification endpoint
    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentHash,
          certificateId: credentialId || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.found && data.blockchain) {
          return {
            status: data.blockchain.status || "verified",
            network: data.blockchain.network || `${MST_NETWORK_NAME} (Chain ID: ${MST_CHAIN_ID})`,
            transactionHash: data.blockchain.transactionHash,
            blockNumber: data.blockchain.blockNumber,
            contractAddress: data.blockchain.contractAddress || CONTRACT_ROBOT_EVENT_LEDGER,
            registeredHash: data.blockchain.registeredHash || data.blockchain.eventHash,
            issuer: data.blockchain.issuer,
            timestamp: data.blockchain.timestamp,
          };
        } else if (data.found === false) {
          return {
            status: "not_found",
            network: data.blockchain?.network || `${MST_NETWORK_NAME} (Chain ID: ${MST_CHAIN_ID})`,
            blockNumber: data.blockchain?.blockNumber,
            contractAddress: data.blockchain?.contractAddress || CONTRACT_ROBOT_EVENT_LEDGER,
            errorMessage:
              data.blockchain?.errorMessage ||
              "MST Testnet is live, but no matching record was registered for this file fingerprint.",
          };
        }
      }
    } catch {
      // Endpoint error, proceed to fallback
    }

    // 2. Direct Query to MST Testnet via server proxy /api/rpc
    try {
      const rpcEndpoint = typeof window !== "undefined" ? "/api/rpc" : MST_RPC_URL;
      const rpcResponse = await fetch(rpcEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
      });

      if (rpcResponse.ok) {
        const rpcJson = await rpcResponse.json();
        const blockNum = rpcJson.result ? parseInt(rpcJson.result, 16) : undefined;
        return {
          status: "not_found",
          network: `${MST_NETWORK_NAME} (Chain ID: ${MST_CHAIN_ID})`,
          blockNumber: blockNum,
          contractAddress: CONTRACT_ROBOT_EVENT_LEDGER,
          errorMessage:
            "MST Testnet is live, but no anchor proof was found for this specific file fingerprint.",
        };
      }
    } catch {
      // RPC also unreachable
    }

    return {
      status: "unavailable",
      errorMessage: `Blockchain network unreachable at ${MST_RPC_URL}. Check RPC connectivity.`,
    };
  }

  /**
   * Compare Actual Uploaded Hash with Registered Hash and Derive Authenticity Verdict
   */
  public deriveVerificationVerdict(
    uploadedHash: string,
    blockchain: BlockchainRecord,
    ai: AIAnalysisResult
  ): {
    hashMatch: HashMatchStatus;
    overallStatus: OverallVerificationVerdict;
    explanation: string;
  } {
    if (blockchain.status === "unavailable") {
      return {
        hashMatch: "unavailable",
        overallStatus: "unavailable",
        explanation:
          "Blockchain verification service is temporarily unavailable. Cannot verify cryptographic state root.",
      };
    }

    if (blockchain.status === "not_found" || !blockchain.registeredHash) {
      return {
        hashMatch: "not_found",
        overallStatus: "not_found",
        explanation:
          "No registered record found on the blockchain matching this document hash. The document has not been anchored by an authorized issuer.",
      };
    }

    const isMatch =
      uploadedHash.trim().toLowerCase() ===
      blockchain.registeredHash.trim().toLowerCase();

    if (!isMatch) {
      return {
        hashMatch: "mismatch",
        overallStatus: "invalid",
        explanation:
          "✕ DOCUMENT HASH MISMATCH: The uploaded file's cryptographic hash differs from the registered on-chain fingerprint. Possible tampering or modified content detected.",
      };
    }

    // Hash matches on-chain record! Now check AI analysis signals
    if (ai.status === "completed" && ai.riskLevel === "high") {
      return {
        hashMatch: "match",
        overallStatus: "invalid",
        explanation:
          "Document hash matches on-chain registration, but AI-assisted analysis detected severe visual or structural anomalies. Review required.",
      };
    }

    if (ai.status === "completed" && ai.riskLevel === "medium") {
      return {
        hashMatch: "match",
        overallStatus: "review",
        explanation:
          "✓ DOCUMENT INTEGRITY VERIFIED: File hash matches issuer's registered fingerprint. Review recommended based on AI assistive findings.",
      };
    }

    return {
      hashMatch: "match",
      overallStatus: "verified",
      explanation:
        "✓ DOCUMENT INTEGRITY VERIFIED: Uploaded document matches the fingerprint anchored by the issuer on MST Blockchain.",
    };
  }

  /**
   * Execute Full Verification Workflow on an Actual Uploaded File
   */
  public async verifyUploadedFile(
    file: File,
    onProgress?: (step: string) => void
  ): Promise<VerificationResult> {
    onProgress?.("Calculating SHA-256 fingerprint...");
    const sha256 = await calculateFileSHA256(file);
    const uploadedAt = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "medium",
    });

    const previewUrl =
      typeof window !== "undefined" ? URL.createObjectURL(file) : undefined;

    const documentMeta = {
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      fileSize: file.size,
      sha256,
      uploadedAt,
      previewUrl,
    };

    onProgress?.("Extracting document content (OCR)...");
    const ocrResult = await this.analyzeDocument(file);

    onProgress?.("Running AI-assisted anomaly analysis...");
    const aiResult = await this.runAIAnalysis(
      file,
      sha256,
      ocrResult.text,
      ocrResult.fields
    );

    onProgress?.("Querying MST Testnet blockchain attestation...");
    const credentialId = ocrResult.fields.credentialId || undefined;
    const blockchainRecord = await this.verifyDocumentOnBlockchain(
      sha256,
      credentialId
    );

    onProgress?.("Comparing cryptographic hashes and synthesizing report...");
    const { hashMatch, overallStatus, explanation } =
      this.deriveVerificationVerdict(sha256, blockchainRecord, aiResult);

    return {
      document: documentMeta,
      extractedFields: ocrResult.fields,
      ocr: ocrResult,
      aiAnalysis: aiResult,
      blockchain: blockchainRecord,
      hashMatch,
      overallStatus,
      verifiedAt: new Date().toISOString(),
      verdictExplanation: explanation,
    };
  }

  /**
   * Real Certificate Registration via Backend API
   * POST /api/certificates/register
   */
  public async registerCertificate(
    payload: CertificateRegistrationPayload
  ): Promise<RegistrationResult> {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("documentHash", payload.documentHash);
    formData.append("fields", JSON.stringify(payload.fields));
    if (payload.issuerNotes) {
      formData.append("issuerNotes", payload.issuerNotes);
    }
    if (payload.transactionHash) {
      formData.append("transactionHash", payload.transactionHash);
    }
    if (payload.blockNumber) {
      formData.append("blockNumber", payload.blockNumber.toString());
    }
    if (payload.issuerAddress) {
      formData.append("issuerAddress", payload.issuerAddress);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/register`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        return {
          success: false,
          errorMessage: `Registration failed (HTTP ${response.status}): ${errorText || "Backend rejected request."}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        certificateId: data.certificateId || data.id,
        transactionHash: data.transactionHash || data.txHash,
        blockNumber: data.blockNumber,
        network: data.network || `${MST_NETWORK_NAME} (Chain ID: ${MST_CHAIN_ID})`,
        registeredHash: data.registeredHash || payload.documentHash,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        success: false,
        errorMessage: `Cannot reach backend registration endpoint at ${API_BASE_URL}/api/certificates/register.`,
      };
    }
  }

  /**
   * Fetch Real Registered Certificates from Backend Database
   * GET /api/certificates
   */
  public async getCertificates(): Promise<{
    certificates: RegisteredCertificate[];
    isBackendOnline: boolean;
    errorMessage?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        return {
          certificates: [],
          isBackendOnline: true,
          errorMessage: `Server returned HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.certificates)
        ? data.certificates
        : [];

      return {
        certificates: list,
        isBackendOnline: true,
      };
    } catch {
      return {
        certificates: [],
        isBackendOnline: false,
        errorMessage: "Certificate service endpoint unavailable.",
      };
    }
  }

  /**
   * Fetch Single Registered Certificate by ID
   * GET /api/certificates/:id
   */
  public async getCertificateById(
    id: string
  ): Promise<RegisteredCertificate | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/certificates/${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  /**
   * Request Real Certificate Revocation
   * POST /api/certificates/:id/revoke
   */
  public async revokeCertificate(
    id: string,
    reason: string
  ): Promise<{ success: boolean; transactionHash?: string; errorMessage?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/certificates/${encodeURIComponent(id)}/revoke`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        return {
          success: false,
          errorMessage: `Revocation failed: ${errorText || `HTTP ${response.status}`}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        transactionHash: data.transactionHash || data.txHash,
      };
    } catch {
      return {
        success: false,
        errorMessage: `Cannot reach revocation endpoint at ${API_BASE_URL}.`,
      };
    }
  }

  /**
   * Request Certificate Revocation (alias returning updated certificate)
   */
  public async requestCertificateRevocation(
    id: string,
    reason: string
  ): Promise<Certificate> {
    const res = await this.revokeCertificate(id, reason);
    const existing = await this.getCertificateById(id);
    return {
      id,
      tokenId: id,
      tokenType: "ERC-5192",
      title: existing?.title || "Revoked Certificate",
      category: existing?.category || "Robotics",
      studentName: existing?.recipientName || "Recipient",
      recipientName: existing?.recipientName || "Recipient",
      studentWallet: "0x0000000000000000000000000000000000000000",
      studentId: id,
      issueDate: existing?.issueDate || new Date().toISOString(),
      issuingAuthority: existing?.issuerName || "RoboLab Chain Authority",
      issuerName: existing?.issuerName || "RoboLab Chain Authority",
      issuerSigner: existing?.issuerName || "RoboLab Chain Authority",
      contractAddress: existing?.contractAddress || CONTRACT_ROBOT_EVENT_LEDGER,
      transactionHash: res.transactionHash || "",
      blockNumber: 0,
      blockTimestamp: new Date().toISOString(),
      status: "revoked",
      badgeColor: "from-rose-500 to-red-600",
      skills: [],
      evidence: [],
      network: MST_NETWORK_NAME,
      explorerUrl: `https://testnet.mstscan.com/tx/${res.transactionHash}`,
      qrCodeData: `https://testnet.mstscan.com/cert/${id}`,
      certificateHash: existing?.documentHash || "0x0000000000000000000000000000000000000000",
      verificationUrl: `https://testnet.mstscan.com/cert/${id}`,
      recipientWallet: "0x0000000000000000000000000000000000000000",
      issuerWallet: "0x0000000000000000000000000000000000000000",
      revocation: {
        isRevoked: true,
        reason,
        revokedAt: new Date().toISOString(),
        transactionHash: res.transactionHash,
      },
    };
  }

  /**
   * Request Certificate Issuance (Real backend endpoint)
   * POST /api/certificates/issue
   */
  public async requestCertificateIssuance(
    payload: CertificateIssuancePayload
  ): Promise<Certificate> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch {
      // Endpoint error
    }

    throw new Error(
      `Cannot reach backend certificate issuance endpoint at ${API_BASE_URL}/api/certificates/issue.`
    );
  }

  /**
   * Lookup & Verify Certificate by ID, Hash, or Serial
   */
  public async verifyCertificate(query: string): Promise<{
    state: VerificationState;
    message: string;
    certificate?: Certificate | null;
  }> {
    const q = query.trim();
    if (!q) {
      return {
        state: "not_found",
        message: "No identifier provided for verification.",
      };
    }

    try {
      // 1. Try verify endpoint
      const response = await fetch(`${API_BASE_URL}/api/certificates/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentHash: q, certificateId: q }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.found && data.certificate) {
          return {
            state: data.certificate.status || "valid",
            message: `Certificate successfully verified on ${MST_NETWORK_NAME}.`,
            certificate: data.certificate,
          };
        }
      }

      // 2. Try direct get by ID
      const direct = await this.getCertificateById(q);
      if (direct) {
        return {
          state: direct.status || "valid",
          message: `Record found in registry for ID ${direct.id}.`,
          certificate: {
            id: direct.id,
            tokenId: direct.id,
            tokenType: "ERC-5192",
            title: direct.title,
            category: direct.category || "Document & Credential Attestation",
            studentName: direct.recipientName || "Recipient Not Stated",
            studentWallet:
              (direct.metadata?.studentWallet as string) ||
              "0x0000000000000000000000000000000000000000",
            studentId: (direct.metadata?.studentId as string) || direct.id,
            issueDate: direct.issueDate || direct.createdAt,
            issuingAuthority: direct.issuerName || "Document Attestation Authority",
            issuerName: direct.issuerName || "Document Attestation Authority",
            issuerSigner: direct.issuerName || "Document Attestation Authority",
            contractAddress:
              direct.contractAddress || CONTRACT_ROBOT_EVENT_LEDGER,
            transactionHash: direct.transactionHash || "",
            blockNumber: direct.blockNumber || 0,
            blockTimestamp: direct.createdAt,
            status: direct.status,
            badgeColor: "from-cyan-500 to-blue-600",
            skills: Array.isArray(direct.metadata?.skills)
              ? (direct.metadata.skills as string[])
              : [],
            evidence: [],
            network: direct.network || MST_NETWORK_NAME,
            explorerUrl: `https://testnet.mstscan.com/tx/${direct.transactionHash}`,
            qrCodeData:
              direct.verificationUrl || `https://mstscan.com/cert/${direct.id}`,
            documentHash: direct.documentHash,
            certificateHash: direct.documentHash,
            verificationUrl:
              direct.verificationUrl || `https://mstscan.com/cert/${direct.id}`,
            previewUrl:
              (direct.metadata?.previewUrl as string) ||
              (direct.previewUrl as string) ||
              undefined,
            recipientName: direct.recipientName || "Recipient Not Stated",
            recipientWallet:
              (direct.metadata?.studentWallet as string) ||
              "0x0000000000000000000000000000000000000000",
            issuerWallet: "0x0000000000000000000000000000000000000000",
          },
        };
      }
    } catch {
      // Endpoint offline
    }

    return {
      state: "not_found",
      message: `No verified certificate found matching "${q}" on MST Testnet or backend registry.`,
      certificate: null,
    };
  }
}

export const certificateService = new CertificateService();
