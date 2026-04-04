import { requireAuth } from "@/lib/auth-helpers";
import type { LogLine } from "@/lib/loki-client";
import { prisma } from "@/lib/prisma";
import { lokiClient } from "@/lib/loki-client";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!deployment || deployment.project.ownerId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const encoder = new TextEncoder();
    const lastEventId = request.headers.get("last-event-id");
    const startTimestampNs = Math.floor(
      (deployment.startedAt?.getTime() ?? deployment.createdAt.getTime()) * 1e6,
    );

    const stream = new ReadableStream({
      start(controller) {
        const enqueueSse = (payload: Record<string, unknown>) => {
          try {
            const lines: string[] = [];
            if (typeof payload.id === "string") {
              lines.push(`id: ${payload.id}`);
            }
            if (typeof payload.type === "string") {
              lines.push(`event: ${payload.type}`);
            }
            lines.push(`data: ${JSON.stringify(payload)}`);
            controller.enqueue(encoder.encode(`${lines.join("\n")}\n\n`));
          } catch {
            // controller already closed — client disconnected
          }
        };

        let heartbeat: ReturnType<typeof setInterval> | null = null;
        let pendingPoll: ReturnType<typeof setInterval> | null = null;
        let streamStarted = false;

        const cleanup = () => {
          if (heartbeat) clearInterval(heartbeat);
          if (pendingPoll) clearInterval(pendingPoll);
          heartbeat = null;
          pendingPoll = null;
        };

        const startWorkflowStream = (workflowName: string) => {
          if (streamStarted) return;
          streamStarted = true;
          enqueueSse({
            type: "ready",
            message: "Workflow logs stream connected",
          });

          lokiClient.streamBuildLogs(
            workflowName,
            (line: LogLine) => enqueueSse(line),
            {
              signal: request.signal,
              startTimestampNs,
              lastEventId,
              onError: (message: string) =>
                enqueueSse({ type: "error", message }),
            },
          );
        };

        if (deployment.workflowName) {
          startWorkflowStream(deployment.workflowName);
        } else {
          enqueueSse({
            type: "pending",
            message: "Workflow is being prepared. Retrying...",
          });

          pendingPoll = setInterval(async () => {
            try {
              const latest = await prisma.deployment.findUnique({
                where: { id },
                select: { workflowName: true },
              });
              if (!latest?.workflowName) return;

              if (pendingPoll) {
                clearInterval(pendingPoll);
                pendingPoll = null;
              }
              startWorkflowStream(latest.workflowName);
            } catch {
              enqueueSse({
                type: "pending",
                message: "Still waiting for workflow assignment...",
              });
            }
          }, 1500);
        }

        heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          } catch {
            // already closed
          }
        }, 15000);

        // initial event confirms SSE framing is active
        enqueueSse({ type: "connected" });

        // when the client disconnects, the signal aborts which stops polling
        request.signal.addEventListener("abort", () => {
          cleanup();
          try {
            controller.close();
          } catch {
            // already closed
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("SSE Logs Route Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
