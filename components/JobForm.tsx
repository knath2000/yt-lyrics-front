"use client";

import React, { useState, useEffect } from "react";
import { createJob, getJobStatus, getJobProgress, JobStatusResponse, ModelPreset } from "../lib/api";
import ResultsViewer from "./ResultsViewer";

export default function JobForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<ModelPreset>("regular");

  // Poll for job status
  useEffect(() => {
    if (!jobId) return;

    // Stop polling if job completed
    if (jobStatus && (jobStatus.status === "done" || jobStatus.status === "error")) return;

    const interval = setInterval(async () => {
      try {
        // Use progress endpoint for real-time updates during processing
        const status = jobStatus?.status === "processing"
          ? await getJobProgress(jobId)
          : await getJobStatus(jobId);
        setJobStatus(status);
      } catch (err) {
        console.error("Failed to poll job status:", err);
      }
    }, 1000); // Poll more frequently for better responsiveness

    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setJobStatus(null);
    
    try {
      const { jobId } = await createJob(url, preset);
      setJobId(jobId);
      setJobStatus({ status: "queued", pct: 0 });
      
    } catch (err: any) {
      setError(err.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setUrl("");
    setJobId(null);
    setJobStatus(null);
    setError(null);
    setPreset("regular");
  }

  const hasActiveJob = !!jobId;
  const jobComplete = hasActiveJob && jobStatus && (
    jobStatus.status === "done" || jobStatus.status === "completed" || jobStatus.status === "error"
  );

  return (
    <div className="w-full max-w-4xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="url"
          placeholder="Enter YouTube music URL"
          className="border p-2 rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={loading || (hasActiveJob && !jobComplete)}
        />

        {/* Model selector */}
        <select
          className="border p-2 rounded"
          value={preset}
          onChange={(e) => setPreset(e.target.value as ModelPreset)}
          disabled={loading || (hasActiveJob && !jobComplete)}
        >
          <option value="regular">Regular – GPT-4o Mini</option>
          <option value="high">High – GPT-4o</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          disabled={loading || (hasActiveJob && !jobComplete)}
        >
          {loading ? "Submitting job..." : "Transcribe"}
        </button>
      </form>

      {hasActiveJob && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Job Progress</h3>
          {jobId && (
            <div className="p-4 border rounded-lg bg-purple-50">
              <p className="text-sm text-gray-600 mb-2">Job ID: {jobId}</p>
              {jobStatus && (
                <BackendStatusDisplay status={jobStatus} color="purple" />
              )}
            </div>
          )}

          {jobComplete && (
            <div className="mt-4 text-center">
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                New Transcription
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-red-600">{error}</p>}
      
      {/* Show results when job is complete */}
      {jobComplete && (jobStatus?.status === "done" || jobStatus?.status === "completed") && jobId && jobStatus.resultUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Transcription Results</h3>
          <ResultsViewer jobStatus={jobStatus} youtubeUrl={url} />
        </div>
      )}
    </div>
  );
}

interface BackendStatusDisplayProps {
  status: JobStatusResponse;
  color: 'purple' | 'blue';
}

function BackendStatusDisplay({ status, color }: BackendStatusDisplayProps) {
  if (!status) return null;

  const colorClasses = {
    purple: {
      progress: 'from-purple-500 to-purple-600',
      done: 'bg-purple-600',
      error: 'bg-red-600'
    },
    blue: {
      progress: 'from-blue-500 to-blue-600', 
      done: 'bg-blue-600',
      error: 'bg-red-600'
    }
  } as const;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Status: {status.status}</span>
        <span className="text-sm text-gray-600">{status.pct}%</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2 relative overflow-hidden">
        <div 
          className={`bg-gradient-to-r ${colorClasses[color].progress} h-3 rounded-full transition-all duration-500 ease-out relative`}
          style={{ width: `${status.pct}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
        
        {/* Stage markers */}
        <div className="absolute inset-0 flex justify-between items-center px-1">
          {[
            { pct: 5, label: "📥", title: "Download" },
            { pct: 20, label: "🎵", title: "Process" },
            { pct: 50, label: "🎤", title: "Transcribe" },
            { pct: 75, label: "⏱️", title: "Align" },
            { pct: 90, label: "💾", title: "Save" }
          ].map((stage, i) => (
            <div 
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                status.pct >= stage.pct 
                  ? 'bg-green-500 text-white shadow-lg scale-110' 
                  : 'bg-gray-300 text-gray-600'
              }`}
              title={stage.title}
            >
              {stage.label}
            </div>
          ))}
        </div>
      </div>
      
      {status.statusMessage && (
        <p className="text-sm text-gray-700">{status.statusMessage}</p>
      )}
      
      {(status.status === "done" || status.status === "completed") && (
        <p className="text-green-700 font-medium mt-2">✅ Transcription complete!</p>
      )}
      
      {status.status === "error" && (
        <p className="text-red-700 font-medium mt-2">❌ Error: {status.error}</p>
      )}
    </div>
  );
}