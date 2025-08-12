import React from "react";
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "YouTube Lyrics Transcriber",
  description: "Transcribe rap lyrics from YouTube videos with accurate timing.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="text-gray-900 dark:text-gray-100 antialiased selection:bg-violet-500/20 selection:text-violet-900">{children}</body>
    </html>
  );
} 