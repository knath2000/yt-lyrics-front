export interface CreateJobResponse {
  jobId: string;
}

export interface JobStatusResponse {
  status: "queued" | "processing" | "done" | "error";
  pct: number;
  resultUrl?: string;
  statusMessage?: string;
  error?: string;
}

// Single backend base URL – default to Railway prod, can be overridden via env var
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://yt-lyrics-backend-production.up.railway.app";

export type ModelPreset = "regular" | "high";

export async function createJob(youtubeUrl: string, preset: ModelPreset = "regular"): Promise<CreateJobResponse> {
  const res = await fetch(`${BACKEND_URL}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ youtubeUrl, preset }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create job: ${res.status}`);
  }
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${BACKEND_URL}/api/jobs/${jobId}`);
  if (!res.ok) {
    throw new Error(`Failed to get job status: ${res.status}`);
  }
  return res.json();
}

export async function getJobProgress(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/progress`);
  if (!res.ok) {
    throw new Error(`Failed to get job progress: ${res.status}`);
  }
  return res.json();
}

export interface TranscriptionResults {
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  srt: string;
  plain: string;
  metadata: {
    title: string;
    duration: number;
    processedAt: string;
  };
}

export async function getJobResults(jobId: string): Promise<TranscriptionResults> {
  const res = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/result`);
  if (!res.ok) {
    throw new Error(`Failed to get job results: ${res.status}`);
  }
  return res.json();
}

export async function fetchResultsFromUrl(url: string): Promise<TranscriptionResults> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch results from URL: ${res.status}`);
  }
  return res.json();
}