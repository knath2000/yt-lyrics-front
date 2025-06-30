"use client";

import React, { useState, useEffect } from "react";
import { createJob, getJobStatus } from "../lib/api";
import ResultsViewer from "./ResultsViewer";

interface JobStatus {
  status: "queued" | "processing" | "done" | "error";
  pct: number;
  resultUrl?: string;
  statusMessage?: string;
  error?: string;
}

export default function JobForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for job status
  useEffect(() => {
    if (!jobId || jobStatus?.status === "done" || jobStatus?.status === "error") {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);
        setJobStatus(status);
        
        if (status.status === "done" || status.status === "error") {
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Failed to poll job status:", err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [jobId, jobStatus?.status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setJobStatus(null);
    
    try {
      const { jobId } = await createJob(url);
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
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="url"
          placeholder="Enter YouTube music URL"
          className="border p-2 rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={loading || (!!jobStatus && jobStatus.status !== "done" && jobStatus.status !== "error")}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          disabled={loading || (!!jobStatus && jobStatus.status !== "done" && jobStatus.status !== "error")}
        >
          {loading ? "Submitting..." : "Transcribe"}
        </button>
      </form>

      {jobId && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">Job ID: {jobId}</p>
          
          {jobStatus && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Status: {jobStatus.status}</span>
                <span className="text-sm text-gray-600">{jobStatus.pct}%</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${jobStatus.pct}%` }}
                ></div>
              </div>
              
              {jobStatus.statusMessage && (
                <p className="text-sm text-gray-700">{jobStatus.statusMessage}</p>
              )}
              
              {jobStatus.status === "done" && (
                <div className="mt-3">
                  <p className="text-green-700 font-medium">✅ Transcription complete!</p>
                  <button
                    onClick={resetForm}
                    className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Transcribe Another
                  </button>
                </div>
              )}
              
              {jobStatus.status === "error" && (
                <div className="mt-3">
                  <p className="text-red-700 font-medium">❌ Error: {jobStatus.error}</p>
                  <button
                    onClick={resetForm}
                    className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-red-600">{error}</p>}
      
      {/* Show results when job is complete */}
      {jobId && jobStatus?.status === "done" && (
        <ResultsViewer jobId={jobId} />
      )}
    </div>
  );
} 