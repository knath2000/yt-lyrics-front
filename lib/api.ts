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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export async function createJob(youtubeUrl: string): Promise<CreateJobResponse> {
  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ youtubeUrl }),
  });
  if (!res.ok) {
    throw new Error("Failed to create job");
  }
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
  if (!res.ok) {
    throw new Error("Failed to get job status");
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
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}/result`);
  if (!res.ok) {
    throw new Error("Failed to get job results");
  }
  return res.json();
} 