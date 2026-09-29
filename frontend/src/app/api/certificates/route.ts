import { NextResponse } from "next/server";
import { certificateStore } from "@/lib/certificateStore";

export async function GET() {
  const certificates = certificateStore.getAll();
  return NextResponse.json({
    certificates,
    total: certificates.length,
    network: "MST Testnet",
  });
}
