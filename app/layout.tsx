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
      <body>{children}</body>
    </html>
  );
} 