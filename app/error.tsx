"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle size={28} className="text-destructive" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-semibold">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while loading this page. You can try
            again, or contact support.
          </p>
        </div>

        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground bg-secondary px-3 py-1.5 rounded-md">
            Error: {error.message}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/")}
          >
            <Home size={16} /> Go home
          </Button>
          <Button variant="primary" type="button" onClick={reset}>
            <RotateCcw size={16} /> Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
