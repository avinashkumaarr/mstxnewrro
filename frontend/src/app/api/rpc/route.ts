import { NextRequest, NextResponse } from "next/server";

const MST_RPC_URL =
  process.env.NEXT_PUBLIC_MST_RPC_URL || "https://testnetrpc.mstblockchain.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(MST_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { jsonrpc: "2.0", id: body.id || 1, error: { code: -32000, message: `RPC error: ${response.statusText}` } },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "RPC proxy request failed";
    return NextResponse.json(
      { jsonrpc: "2.0", id: 1, error: { code: -32603, message } },
      { status: 500 }
    );
  }
}
