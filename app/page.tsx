import React from "react";
import JobForm from "../components/JobForm";

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full">
      {/* Animated wallpaper background */}
      <div className="animated-gradient" />

      {/* Sticky glass navbar */}
      <header className="sticky top-0 z-10">
        <div className="glass glass-strong mx-4 mt-4 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-8 h-8 rounded-xl glass" />
            <span className="font-semibold tracking-tight">YouTube Lyrics Transcriber</span>
          </div>
          <a
            href="https://yt-lyrics-backend-production.up.railway.app/health"
            target="_blank"
            className="text-xs opacity-80 hover:opacity-100"
            rel="noreferrer"
          >
            Backend Health
          </a>
        </div>
      </header>

      {/* Content card */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto glass p-6 md:p-8 rounded-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Transcribe lyrics from YouTube with style ✨
          </h1>
          <p className="text-center opacity-80 mb-6">
            Paste a YouTube URL, choose a model preset, and watch progress in a modern glass UI.
          </p>
          <JobForm />
        </div>
      </section>
    </main>
  );
}