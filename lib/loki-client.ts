export type LogLine = {
  timestamp: string;
  level: string;
  message: string;
  stream: string;
  buildId: string;
  tenantId: string;
};

export const lokiClient = {
  async getBuildLogs(
    workflowName: string,
    limit: number = 1000,
  ): Promise<LogLine[]> {
    const query = `{build_id="${workflowName}"} |= \`"tenant_id"\``;
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

  // Polls query_range every 2 seconds, calling onLine for each new log line.
  // Returns a cleanup function — call it to stop polling.
  streamBuildLogs(
    workflowName: string,
    onLine: (line: LogLine) => void,
    signal?: AbortSignal,
  ): void {
    const query = `{build_id="${workflowName}"} |= \`"tenant_id"\``;
    // start from 30 minutes ago to catch all logs since workflow was submitted
    let lastTimestampNs = (Date.now() - 30 * 60 * 1000) * 1e6;

    const poll = async () => {
      if (signal?.aborted) return;

      try {
        const url = new URL(`${process.env.LOKI_URL}/loki/api/v1/query_range`);
        url.searchParams.set("query", query);
        url.searchParams.set("start", lastTimestampNs.toString());
        url.searchParams.set("limit", "200");
        url.searchParams.set("direction", "forward");

        const res = await fetch(url.toString(), { signal });
        if (!res.ok) throw new Error(`Loki error: ${res.status}`);

        const data = await res.json();

        for (const stream of data.data.result ?? []) {
          for (const [ts, logLine] of stream.values ?? []) {
            const tsNs = Number(ts);
            // strictly greater than to avoid duplicates
            if (tsNs <= lastTimestampNs) continue;
            lastTimestampNs = tsNs;
            const line = parseLokiLine(ts, logLine, workflowName);
            if (line) onLine(line);
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error");
        if (err?.name === "AbortError") return;
        // loki temporarily unavailable — keep polling
      }

      if (!signal?.aborted) {
        setTimeout(poll, 2000);
      }
    };

    // kick off immediately
    poll();
  },
};

function parseLokiLine(
  ts: string,
  logLine: string,
  workflowName: string,
): LogLine | null {
  const timestamp = new Date(Number(ts) / 1e6).toISOString();

  const stripped = logLine.replace(/^\S+\s+(stdout|stderr)\s+\w+\s+/, "");

  try {
    const inner = JSON.parse(stripped);
    // only accept lines that have our builder fields
    if (!inner.build_id && !inner.tenant_id) return null;
    return {
      timestamp,
      level: inner.level ?? "info",
      message: inner.msg ?? inner.message ?? stripped,
      stream: inner.stream ?? "build",
      buildId: inner.build_id ?? workflowName,
      tenantId: inner.tenant_id ?? "",
    };
  } catch {
    return null;
  }
}
