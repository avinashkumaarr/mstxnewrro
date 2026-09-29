/**
 * Real Browser Cryptography for RoboLab Chain
 * Uses standard Web Crypto API (crypto.subtle) to compute authentic SHA-256 hashes
 * directly from uploaded file bytes.
 */

export async function calculateFileSHA256(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return calculateBufferSHA256(arrayBuffer);
}

export async function calculateBufferSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `0x${hashHex}`;
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const formatFileSize = formatBytes;
