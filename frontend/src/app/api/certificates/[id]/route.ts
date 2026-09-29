import { NextRequest, NextResponse } from "next/server";
import { certificateStore } from "@/lib/certificateStore";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "Certificate ID is required" }, { status: 400 });
  }

  const cert = certificateStore.getById(id) || certificateStore.getByHash(id);
  if (!cert) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  return NextResponse.json(cert);
}
