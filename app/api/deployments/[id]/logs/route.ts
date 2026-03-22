import { requireAuth } from "@/lib/auth-helpers";
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

    if (!deployment.workflowName) {
      return new Response("Not ready", { status: 400 });
    }

    const workflowName = deployment.workflowName;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        const enqueue = (payload: object) => {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
            );
          } catch {
            // controller already closed — client disconnected
          }
        };

        // stream logs via polling
        lokiClient.streamBuildLogs(
          workflowName,
          (line) => enqueue(line),
          request.signal,
        );

        // when the client disconnects, the signal aborts which stops polling
        request.signal.addEventListener("abort", () => {
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