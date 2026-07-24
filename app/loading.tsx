"use client";

import { useEffect, useState } from "react";

const loadingSteps = [
  "Connecting securely to Verquo",
  "Preparing your workspace",
  "Loading interview environment",
  "Verifying session credentials",
];

export default function Loading() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % loadingSteps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-300">
      <div className="flex flex-col items-center max-w-xs text-center px-6">
        {/* Wordmark */}
        <h2 className="font-display text-2xl tracking-tight mb-6">Verquo</h2>

        {/* Verification line: draws left to right, then a check tick settles at the end */}
        <div className="relative w-40 h-6 mb-6 flex items-center">
          <svg
            viewBox="0 0 160 24"
            className="w-full h-full overflow-visible"
            aria-hidden="true"
          >
            {/* Track: gentle soundwave, nodding to the voice interview */}
            <path
              d="M4,12 C20,2 30,22 46,12 C62,2 72,22 88,12 C104,2 114,22 130,12 L140,12"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Drawing progress wave */}
            <path
              d="M4,12 C20,2 30,22 46,12 C62,2 72,22 88,12 C104,2 114,22 130,12 L140,12"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="142"
              strokeDashoffset="142"
              className="animate-verquo-draw"
            />
            {/* Check mark that settles in after the line completes */}
            <path
              d="M144 12 L150 18 L158 6"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="20"
              strokeDashoffset="20"
              className="animate-verquo-check"
            />
          </svg>
        </div>

        {/* Status text, cross-fading between steps */}
        <div className="h-5 flex items-center justify-center">
          <p
            key={stepIndex}
            className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider animate-verquo-fade"
          >
            {loadingSteps[stepIndex]}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes verquo-draw {
          0% {
            stroke-dashoffset: 142;
          }
          55% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes verquo-check {
          0%,
          55% {
            stroke-dashoffset: 20;
            opacity: 0;
          }
          65% {
            opacity: 1;
          }
          85% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          95%,
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        @keyframes verquo-fade {
          0% {
            opacity: 0;
            transform: translateY(2px);
          }
          15% {
            opacity: 1;
            transform: translateY(0);
          }
          85% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-2px);
          }
        }
        .animate-verquo-draw {
          animation: verquo-draw 3s ease-in-out infinite;
        }
        .animate-verquo-check {
          animation: verquo-check 3s ease-in-out infinite;
        }
        .animate-verquo-fade {
          animation: verquo-fade 1.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
