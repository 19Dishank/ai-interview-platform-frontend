"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/Button";

import Image from "next/image";
import { useTheme } from "@/context/ThemeProvider";

export default function LandingNavbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* Mobile Icon */}
            <Image
              src={`/verquo-icon${theme === "dark" ? "-dark" : ""}.svg`}
              alt="Verquo Icon"
              width={28}
              loading="eager"
              height={28}
              className="w-7 h-7 object-contain sm:hidden"
            />
            {/* Desktop Lockup Logo */}
            <Image
              src={`/verquo-lockup-${theme}.svg`}
              alt="Verquo Logo"
              loading="eager"
              width={98}
              height={28}
              className="h-7 w-auto object-contain hidden sm:block"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="nav-btn-theme-toggle"
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-secondary transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="flex items-center gap-2">
            <Button
              id="nav-btn-getstarted"
              size="sm"
              onClick={() => router.push("/continue")}
            >
              Join Us
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
