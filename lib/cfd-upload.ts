/**
 * Chunked, resumable CFD geometry upload: a TypeScript port of the control
 * plane's apps/api/app/static/cfd_upload.js (same protocol, same numbers).
 *
 * Chunks of 8 MB (under Cloudflare's 100 MB request cap), 3 in parallel, each
 * sent with its SHA-256 (X-Chunk-SHA256) and retried up to 4 times. The file
 * checksum is a tree hash: SHA-256 over the chunks' hex digests joined by "\n",
 * so the browser never holds the whole file. Choosing the same file again
 * resumes: chunks already on the server are skipped.
 */
import { API_BASE } from "@/lib/api-base";
import { apiFetch } from "@/lib/session";
import { jobTokenHeaders } from "@/lib/cfd-my-jobs";

const CHUNK = 8 * 1024 * 1024;
const PARALLEL = 3;
const RETRIES = 4;

export type UploadPhase = "checksum" | "upload" | "verify";
export interface UploadProgress {
  phase: UploadPhase;
  done: number;
  total: number;
}

class UploadError extends Error {
  status?: number;
}

function hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(data: BufferSource): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", data));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function api<T>(
  ref: string,
  token: string,
  method: string,
  path: string,
  body?: BodyInit | null,
  headers?: Record<string, string>,
): Promise<T> {
  const url = `${API_BASE}/cfd-jobs/${encodeURIComponent(ref)}${path}`;
  // Signed in: the session cookie opens the job for its own account.
  const h: Record<string, string> = { ...(headers ?? {}), ...jobTokenHeaders(token) };
  const r = await apiFetch(url, { method, body: body ?? undefined, headers: h });
  const j = (await r.json().catch(() => ({}))) as { detail?: { message?: string } | string } & T;
  if (!r.ok) {
    const d = j.detail;
    const e = new UploadError(
      (typeof d === "object" && d?.message) || (typeof d === "string" ? d : `HTTP ${r.status}`),
    );
    e.status = r.status;
    throw e;
  }
  return j;
}

export async function uploadGeometry(opts: {
  ref: string;
  token: string;
  file: File;
  onProgress?: (p: UploadProgress) => void;
}): Promise<unknown> {
  const { ref, token, file } = opts;
  const progress = opts.onProgress ?? (() => {});
  const n = Math.max(1, Math.ceil(file.size / CHUNK));
  const digests: string[] = new Array(n);
  progress({ phase: "checksum", done: 0, total: n });
  for (let k = 0; k < n; k++) {
    const buf = await file.slice(k * CHUNK, Math.min(file.size, (k + 1) * CHUNK)).arrayBuffer();
    digests[k] = await sha256(buf);
    progress({ phase: "checksum", done: k + 1, total: n });
  }
  const tree = await sha256(new TextEncoder().encode(digests.join("\n")));
  const session = await api<{ upload_id: string; uploaded_chunks?: number[] }>(
    ref,
    token,
    "POST",
    "/uploads",
    JSON.stringify({ filename: file.name, size_bytes: file.size, sha256: tree, chunk_size_bytes: CHUNK }),
    { "Content-Type": "application/json" },
  );
  const have = new Set(session.uploaded_chunks ?? []);
  const todo: number[] = [];
  for (let k = 0; k < n; k++) if (!have.has(k)) todo.push(k);
  let done = n - todo.length;
  progress({ phase: "upload", done, total: n });

  async function attempt(k: number, blob: Blob, t: number): Promise<void> {
    try {
      await api(ref, token, "PUT", `/uploads/${session.upload_id}/chunks/${k}`, blob, {
        "X-Chunk-SHA256": digests[k],
      });
    } catch (e) {
      const s = (e as UploadError).status;
      if (t >= RETRIES || (s && s < 500 && s !== 429 && s !== 422)) throw e;
      await sleep(1000 * 2 ** t);
      return attempt(k, blob, t + 1);
    }
  }
  async function worker(): Promise<void> {
    for (let k = todo.shift(); k !== undefined; k = todo.shift()) {
      await attempt(k, file.slice(k * CHUNK, Math.min(file.size, (k + 1) * CHUNK)), 0);
      done++;
      progress({ phase: "upload", done, total: n });
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  progress({ phase: "verify", done: n, total: n });
  return api(ref, token, "POST", `/uploads/${session.upload_id}/complete`, null);
}
