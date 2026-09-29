"use client";

import React, { Suspense } from "react";
import { VerificationView } from "@/components/certificates/VerificationView";

export default function VerifyEventRoute({
  params,
}: {
  params: { eventId: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080c14] text-slate-400 p-8 font-mono flex items-center justify-center">
          Loading Verification Engine...
        </div>
      }
    >
      <VerificationView initialQuery={params?.eventId} />
    </Suspense>
  );
}
