import React, { Suspense } from "react";
import JoinSessionClient from "./join-session-client";
import { Loader2 } from "lucide-react";

export default function JoinSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-background flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      }
    >
      <JoinSessionClient />
    </Suspense>
  );
}
