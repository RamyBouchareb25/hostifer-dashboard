export type LogLine = {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  stream: string;
  buildId: string;
  tenantId: string;
};

type StreamBuildLogsOptions = {
  signal?: AbortSignal;
  startTimestampNs?: number;
  lastEventId?: string | null;
  onError?: (message: string) => void;
};

export const lokiClient = {
  async getBuildLogs(
    workflowName: string,
    limit: number = 1000,
  ): Promise<LogLine[]> {
    // container="main" excludes the argo wait sidecar and any other injected containers
    const query = `{build_id="${workflowName}", container="main"}`;
    const url = new URL(`${process.env.LOKI_URL}/loki/api/v1/query_range`);
    url.searchParams.set("query", query);
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("direction", "forward");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Loki query_range failed: ${res.status}`);

    const data = await res.json();
    const results: LogLine[] = [];

    for (const stream of data.data.result ?? []) {
      for (const [ts, logLine] of stream.values ?? []) {
        const line = parseLokiLine(ts, logLine, workflowName);
        if (line) results.push(line);
      }
    }

    return results.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  },

  streamBuildLogs(
    workflowName: string,
    onLine: (line: LogLine) => void,
    options: StreamBuildLogsOptions = {},
  ): void {
    const { signal, startTimestampNs, lastEventId, onError } = options;

    // container="main" is the critical filter — excludes:
    //   - argo emissary wait sidecar (produces "waiting for signals", "sub-process exited")
    //   - any other injected sidecars that share the workflow label
    const query = `{build_id="${workflowName}", container="main"}`;

    const fallbackStartNs = (Date.now() - 30 * 60 * 1000) * 1e6;
    let cursorTsNs = Math.floor(startTimestampNs ?? fallbackStartNs);
    let seenAtCursor = new Set<string>();
    let retryDelayMs = 2000;

    if (lastEventId) {
      const parsed = parseLastEventId(lastEventId);
      if (parsed) {
        cursorTsNs = parsed.tsNs;
        seenAtCursor.add(parsed.signature);
      }
    }

    const poll = async () => {
      if (signal?.aborted) return;

      try {
        const url = new URL(`${process.env.LOKI_URL}/loki/api/v1/query_range`);
        url.searchParams.set("query", query);
        url.searchParams.set("start", cursorTsNs.toString());
        // 500 instead of 200 — Buildkit emits large bursts in parallel
        // (all pending vertices at once) that easily exceed 200 lines in 2s
        url.searchParams.set("limit", "500");
        url.searchParams.set("direction", "forward");

        const res = await fetch(url.toString(), { signal });
        if (!res.ok) throw new Error(`Loki error: ${res.status}`);

        const data = await res.json();
        retryDelayMs = 2000;

        const batch: Array<{ ts: string; logLine: string; signature: string }> =
          [];

        for (const stream of data.data.result ?? []) {
          for (const [ts, logLine] of stream.values ?? []) {
            const signature = buildEventSignature(ts, logLine);
            batch.push({ ts, logLine, signature });
          }
        }

        // sort by timestamp then signature for deterministic ordering
        // when multiple lines share the same nanosecond timestamp
        batch.sort((a, b) => {
          const ta = Number(a.ts);
          const tb = Number(b.ts);
          if (ta !== tb) return ta - tb;
          return a.signature.localeCompare(b.signature);
        });

        for (const entry of batch) {
          const tsNs = Number(entry.ts);
          if (Number.isNaN(tsNs)) continue;
          if (tsNs < cursorTsNs) continue;
          if (tsNs === cursorTsNs && seenAtCursor.has(entry.signature)) {
            continue;
          }

          const line = parseLokiLine(entry.ts, entry.logLine, workflowName);
          if (line) {
            line.id = `${entry.ts}:${entry.signature}`;
            onLine(line);
          }

          if (tsNs > cursorTsNs) {
            cursorTsNs = tsNs;
            seenAtCursor = new Set<string>([entry.signature]);
          } else {
            seenAtCursor.add(entry.signature);
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error");
        if (err.name === "AbortError") return;
        onError?.(`Loki temporarily unavailable: ${err.message}`);
        retryDelayMs = Math.min(retryDelayMs * 2, 10000);
      }

      if (!signal?.aborted) {
        setTimeout(poll, retryDelayMs);
      }
    };

    poll();
  },
};

function buildEventSignature(ts: string, logLine: string): string {
  return `${ts}:${hashString(logLine)}`;
}

function parseLastEventId(lastEventId: string): {
  tsNs: number;
  signature: string;
} | null {
  const separator = lastEventId.indexOf(":");
  if (separator < 0) return null;

  const tsPart = lastEventId.slice(0, separator);
  const tsNs = Number(tsPart);
  if (!Number.isFinite(tsNs)) return null;

  return { tsNs, signature: lastEventId.slice(separator + 1) };
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function parseLokiLine(
  ts: string,
  logLine: string,
  workflowName: string,
): LogLine | null {
  const timestamp = new Date(Number(ts) / 1e6).toISOString();

  // strip the k8s container runtime prefix:
  // "2026-04-04T17:42:35.104Z stderr F {actual log}"
  const stripped = logLine.replace(/^\S+\s+(stdout|stderr)\s+\w+\s+/, "");

  try {
    const inner = JSON.parse(stripped);

    // hard filter 1: must have build_id or tenant_id — these are the fields
    // our Go builder always emits. Any pod that doesn't emit these is noise
    // (argo emissary, argocd controllers, other system pods).
    if (!inner.build_id && !inner.tenant_id) return null;

    // hard filter 2: argo emissary sidecar marks its own lines with argo=true
    if (inner.argo === true) return null;

    // hard filter 3: reject lines that belong to a different workflow
    // (shouldn't happen with container="main" but be defensive)
    if (inner.build_id && inner.build_id !== workflowName) return null;

    return {
      id: `${ts}:${buildEventSignature(ts, logLine)}`,
      timestamp,
      level: inner.level ?? "info",
      message: inner.msg ?? inner.message ?? stripped,
      stream: inner.stream ?? "build",
      buildId: inner.build_id ?? workflowName,
      tenantId: inner.tenant_id ?? "",
    };
  } catch {
    // non-JSON line — always noise (k8s system logs, sidecar output, etc.)
    // our Go builder only ever emits structured JSON via zap
    return null;
  }
}
