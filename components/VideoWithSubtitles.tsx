"use client";

import React, { useEffect, useRef, useState } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";

interface Cue {
  start: number; // seconds
  end: number;   // seconds
  text: string;
}

interface VideoWithSubtitlesProps {
  youtubeUrl: string;
  srt: string;
}

// Convert time like "00:01:23,456" to seconds
function timeToSeconds(time: string): number {
  const [hms, ms] = time.split(",");
  const [h, m, s] = hms.split(":").map(Number);
  return h * 3600 + m * 60 + Number(s) + Number(ms) / 1000;
}

// Parse SRT into cue array
function parseSrt(srt: string): Cue[] {
  const lines = srt.split(/\r?\n/);
  const cues: Cue[] = [];
  let i = 0;
  while (i < lines.length) {
    // Skip index line
    if (!lines[i]) { i++; continue; }
    const indexLine = lines[i++];
    if (!indexLine.match(/^[0-9]+$/)) { continue; }
    if (i >= lines.length) break;
    const timingLine = lines[i++];
    const match = timingLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!match) { continue; }
    const start = timeToSeconds(match[1]);
    const end = timeToSeconds(match[2]);
    // Collect text lines until blank
    let textLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "") {
      textLines.push(lines[i++]);
    }
    // Skip blank line
    while (i < lines.length && lines[i].trim() === "") i++;
    cues.push({ start, end, text: textLines.join("\n") });
  }
  return cues;
}

export default function VideoWithSubtitles({ youtubeUrl, srt }: VideoWithSubtitlesProps) {
  const [currentCaption, setCurrentCaption] = useState<string>("");
  const playerRef = useRef<YouTubePlayer | null>(null);
  const cuesRef = useRef<Cue[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Parse SRT only once
  useEffect(() => {
    cuesRef.current = parseSrt(srt);
  }, [srt]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function onReady(event: { target: YouTubePlayer }) {
    playerRef.current = event.target;
    // Poll current time
    intervalRef.current = setInterval(() => {
      if (!playerRef.current) return;
      const time = playerRef.current.getCurrentTime();
      const cue = cuesRef.current.find(c => time >= c.start && time <= c.end);
      setCurrentCaption(cue ? cue.text : "");
    }, 250);
  }

  // Extract videoId from URL (handles youtu.be and youtube.com)
  function extractVideoId(url: string): string | null {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === "youtu.be") {
        return parsed.pathname.slice(1);
      }
      if (parsed.hostname.includes("youtube.com")) {
        if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
        const shortsMatch = parsed.pathname.match(/\/shorts\/([\w\-]{11})/);
        if (shortsMatch) return shortsMatch[1];
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  const videoId = extractVideoId(youtubeUrl || "");

  if (!videoId) {
    return <p className="text-red-600">Invalid YouTube URL</p>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <YouTube
          videoId={videoId}
          onReady={onReady}
          opts={{
            width: "100%",
            playerVars: {
              controls: 1,
              modestbranding: 1,
            },
          }}
          className="w-full aspect-video"
        />
        {/* Caption overlay */}
        {currentCaption && (
          <div className="absolute bottom-4 w-full flex justify-center pointer-events-none">
            <span className="bg-black/70 text-white text-sm md:text-base px-2 py-1 rounded">
              {currentCaption}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 