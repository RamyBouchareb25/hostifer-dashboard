export class ArgoError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ArgoError";
  }
}
export const argoClient = {
  async submitDeployWorkflow(params: {
    tenantId: string;
    repoUrl: string;
    subdomain: string;
    imageName: string;
    port: number;
  }): Promise<{ workflowName: string }> {
    const url = `${process.env.ARGO_SERVER_URL}/api/v1/workflows/${process.env.ARGO_WORKFLOW_NAMESPACE}`;
    const body = {
      workflow: {
        metadata: {
          generateName: "hostifer-deploy-",
          namespace: process.env.ARGO_WORKFLOW_NAMESPACE,
        },
        spec: {
          workflowTemplateRef: {
            name: process.env.ARGO_WORKFLOW_TEMPLATE_NAME,
          },
          arguments: {
            parameters: [
              { name: "repo_url", value: params.repoUrl },
              { name: "subdomain", value: params.subdomain },
              { name: "tenant_id", value: params.tenantId },
              { name: "image_name", value: params.imageName },
              { name: "port", value: params.port.toString() },
            ],
          },
        },
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ARGO_SERVER_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ArgoError(
        res.status,
        errorData.message || "Failed to submit workflow",
      );
    }

    const data = await res.json();
    return { workflowName: data.metadata.name };
  },

  async getWorkflowStatus(workflowName: string): Promise<{
    phase: string;
    startedAt: string | null;
    finishedAt: string | null;
    nodes: Record<
      string,
      {
        displayName: string;
        phase: string;
        message?: string;
        startedAt?: string; // add these
        finishedAt?: string;
      }
    >;
  }> {
    const url = `${process.env.ARGO_SERVER_URL}/api/v1/workflows/${process.env.ARGO_WORKFLOW_NAMESPACE}/${workflowName}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.ARGO_SERVER_TOKEN}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ArgoError(
        res.status,
        errorData.message || "Failed to get workflow status",
      );
    }

    const data = await res.json();
    return {
      phase: data.status?.phase ?? "Pending",
      startedAt: data.status?.startedAt ?? null,
      finishedAt: data.status?.finishedAt ?? null,
      nodes: Object.fromEntries(
        Object.entries(data.status?.nodes ?? {}).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ([k, v]: [string, any]) => [
            k,
            {
              displayName: v.displayName,
              phase: v.phase,
              message: v.message,
              startedAt: v.startedAt ?? null,
              finishedAt: v.finishedAt ?? null,
            },
          ],
        ),
      ),
    };
  },
};
