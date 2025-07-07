"use client";

import React, { useState, useEffect } from "react";
import { fetchResultsFromUrl, TranscriptionResults, JobStatusResponse } from "../lib/api";
import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues with window/YouTube
const VideoWithSubtitles = dynamic(() => import("./VideoWithSubtitles"), { ssr: false });

interface ResultsViewerProps {
  jobStatus: JobStatusResponse;
  youtubeUrl: string;
}

export default function ResultsViewer({ jobStatus, youtubeUrl }: ResultsViewerProps) {
  const [results, setResults] = useState<TranscriptionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"srt" | "plain" | "words" | "video">("srt");

  useEffect(() => {
    async function fetchResults() {
      try {
        if (!jobStatus.resultUrl) {
          throw new Error("No result URL available");
        }
        const data = await fetchResultsFromUrl(jobStatus.resultUrl);
        setResults(data);
      } catch (err: any) {
        setError(err.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [jobStatus.resultUrl]);

  if (loading) {
    return (
      <div className="mt-4 p-4 border rounded bg-blue-50">
        <p className="text-blue-700">Loading transcription results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 border rounded bg-red-50">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  if (!results) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-6 p-4 border rounded bg-green-50">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          📝 Transcription Results
        </h3>
        <div className="text-sm text-gray-600 mb-3">
          <p><strong>Title:</strong> {results.metadata.title}</p>
          <p><strong>Duration:</strong> {Math.floor(results.metadata.duration / 60)}:{(results.metadata.duration % 60).toString().padStart(2, '0')}</p>
          <p><strong>Words:</strong> {results.words.length}</p>
          <p><strong>Processed:</strong> {new Date(results.metadata.processedAt).toLocaleString()}</p>
        </div>
        
        {/* View mode selector */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setViewMode("srt")}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === "srt" 
                ? "bg-green-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📺 Subtitles (SRT)
          </button>
          <button
            onClick={() => setViewMode("plain")}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === "plain" 
                ? "bg-green-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📄 Plain Text
          </button>
          <button
            onClick={() => setViewMode("words")}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === "words" 
                ? "bg-green-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🔤 Word-by-Word
          </button>
          <button
            onClick={() => setViewMode("video")}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === "video" 
                ? "bg-green-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🎬 Watch Video
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded border max-h-[32rem] overflow-y-auto">
        {viewMode === "srt" && (
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {results.srt}
          </pre>
        )}
        
        {viewMode === "plain" && (
          <div className="text-sm leading-relaxed">
            {results.plain}
          </div>
        )}
        
        {viewMode === "words" && (
          <div className="space-y-2">
            {results.words.map((word, index) => (
              <div key={index} className="flex items-center gap-2 text-sm border-b pb-1">
                <span className="font-mono text-xs text-gray-500 w-16">
                  {formatTime(word.start)}
                </span>
                <span className="flex-1">{word.word}</span>
                <span className="text-xs text-gray-400">
                  {Math.round(word.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
        {viewMode === "video" && results && (
          <div className="mt-4">
            <VideoWithSubtitles youtubeUrl={youtubeUrl} srt={results.srt} />
          </div>
        )}
      </div>
      
      {/* Download buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            const blob = new Blob([results.srt], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${results.metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}.srt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          📥 Download SRT
        </button>
        <button
          onClick={() => {
            const blob = new Blob([results.plain], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${results.metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
        >
          📥 Download Text
        </button>
      </div>
    </div>
  );
} 