import { NextRequest, NextResponse } from "next/server";
import { certificateStore } from "@/lib/certificateStore";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reason } = await req.json();
    const cert = certificateStore.revoke(params.id, reason || "Revocation requested");

    if (!cert) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transactionHash: `0x${Math.random().toString(36).substring(2, 15).padStart(64, "0")}`,
      status: "revoked",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Revocation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
