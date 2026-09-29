"use client";

import React, { Suspense } from "react";
import { VerificationView } from "@/components/certificates/VerificationView";
import { useSearchParams } from "next/navigation";

function VerifyContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || searchParams.get("id") || "";
  return <VerificationView initialQuery={q} />;
}

export default function VerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080c14] text-slate-400 p-8 font-mono flex items-center justify-center">
          Loading Verification Engine...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
