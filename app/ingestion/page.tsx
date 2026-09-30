"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FieldIngestion() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/data-ingestion");
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center p-12 bg-slate-50 text-slate-500 font-medium text-sm">
      Redirecting to Municipal Field Ingestion Console...
    </div>
  );
}
