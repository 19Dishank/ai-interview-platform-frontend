"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/context/ThemeProvider";

export function ThemedToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      richColors
      duration={1500}
      position="top-right"
      toastOptions={{
        classNames: {
          title: "font-medium text-sm",
          description: "text-muted-foreground text-xs",
          actionButton: "bg-primary! text-primary-foreground!",
          cancelButton: "bg-secondary! text-secondary-foreground!",
        },
      }}
    />
  );
}
