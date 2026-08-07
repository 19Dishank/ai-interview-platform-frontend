"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { logout } from "@/services/auth/auth.services";
import { useAuth } from "@/context/AuthContext";

export function UserMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name || user?.email || "User";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const profilePath =
    user?.role === "CANDIDATE"
      ? "/candidate/profile/build"
      : `/${user?.role?.toLowerCase()}/profile`;

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
  };

  // Close when clicking outside the menu container
  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-secondary text-sm transition-colors cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
          {initials}
        </div>
        <span className="hidden sm:block text-sm">{displayName}</span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <Link
            href={profilePath}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
          >
            <User size={14} />
            <span>Profile</span>
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
          >
            <Settings size={14} />
            <span>Settings</span>
          </Link>
          <hr className="border-border" />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary text-destructive transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}

