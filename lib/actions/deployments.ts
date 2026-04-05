"use server";

import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/auth-helpers";
import { generateImageName } from "@/lib/uid";
import { argoClient } from "@/lib/argo-client";
import {
  DeploymentStatus,
  DeploymentStepName,
  DeploymentStepStatus,
} from "../generated/prisma/enums";
import { getLatestCommit } from "../github";

export async function triggerDeployment(projectId: string): Promise<{
  deploymentId: string;
  workflowName: string;
}> {
  await requireProjectAccess(projectId);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      envVars: true,
    },
  });
  

  if (!project) throw new Error("Project not found");

  const tenantId = project.slug;
        const commit = await getLatestCommit(project.repoUrl);

  const imageName = generateImageName(tenantId, commit.sha);
  const subdomain = project.slug;

  let deployment;
  try {
    // Need to define a real status enum or string based on the Prisma schema.
    deployment = await prisma.deployment.create({
      data: {
        projectId,
        status: "QUEUED",
        triggeredBy: project.ownerId,
        // tenantId,
        imageName,
        // workflowName: "pending", // updated later
        steps: {
          create: [
            { name: "BUILD", status: "PENDING" },
            { name: "PROVISION", status: "PENDING" },
            { name: "DNS", status: "PENDING" },
          ],
        },
      },
    });

    const { workflowName } = await argoClient.submitDeployWorkflow({
      tenantId,
      repoUrl: project.repoUrl,
      subdomain,
      imageName,
      port: project.port || 3000,
    });

    await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: "BUILDING",
        workflowName,
      },
    });

    await prisma.deploymentStep.updateMany({
      where: { deploymentId: deployment.id, name: "BUILD" },
      data: { status: "RUNNING" },
    });

    // Write ActivityLog if needed...

    return { deploymentId: deployment.id, workflowName };
  } catch (error) {
    if (deployment) {
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { status: "FAILED" },
      });
      // also activity log if it existed...
    }
    console.log("Deployment error", error);
    throw new Error("Failed to start deployment. Please try again.");
  }
}

export async function syncDeploymentStatus(deploymentId: string) {
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: { steps: true, project: true },
  });

  if (!deployment) throw new Error("Deployment not found");
  await requireProjectAccess(deployment.projectId);

  if (!deployment.workflowName || deployment.workflowName === "pending") {
    return {
      status: deployment.status,
      steps: deployment.steps.map((s) => ({ name: s.name, status: s.status })),
    };
  }

  const workflow = await argoClient.getWorkflowStatus(deployment.workflowName);

  // map phase to your enum
  let newStatus = deployment.status;
  if (workflow.phase === "Running") newStatus = "BUILDING";
  if (workflow.phase === "Succeeded") newStatus = "LIVE";
  if (workflow.phase === "Failed" || workflow.phase === "Error")
    newStatus = "FAILED";

  // build duration in seconds
  const buildDuration =
    workflow.startedAt && workflow.finishedAt
      ? Math.round(
          (new Date(workflow.finishedAt).getTime() -
            new Date(workflow.startedAt).getTime()) /
            1000,
        )
      : null;

  // update deployment timing + status
  await prisma.deployment.update({
    where: { id: deploymentId },
    data: {
      status: newStatus as DeploymentStatus,
      startedAt: workflow.startedAt ? new Date(workflow.startedAt) : undefined,
      completedAt: workflow.finishedAt
        ? new Date(workflow.finishedAt)
        : undefined,
      buildDuration: buildDuration ?? undefined,
    },
  });

  // map argo node displayName to your step names
  const nodeStepMap: Record<string, DeploymentStepName> = {
    build: "BUILD",
    provision: "PROVISION",
    dns: "DNS",
  };

  for (const node of Object.values(workflow.nodes)) {
    const stepName = nodeStepMap[
      node.displayName?.toLowerCase() ?? ""
    ] as DeploymentStepName;
    if (!stepName) continue;

    const stepStatus =
      node.phase === "Succeeded"
        ? "SUCCEEDED"
        : node.phase === "Running"
          ? "RUNNING"
          : node.phase === "Failed"
            ? "FAILED"
            : "PENDING";

    await prisma.deploymentStep.updateMany({
      where: { deploymentId, name: stepName },
      data: {
        status: stepStatus as DeploymentStepStatus,
        startedAt: node.startedAt ? new Date(node.startedAt) : undefined,
        completedAt: node.finishedAt ? new Date(node.finishedAt) : undefined,
      },
    });
  }

  // fetch commit info once when workflow succeeds and we don't have it yet
  if (workflow.phase === "Succeeded" && !deployment.commitSha) {
    try {
      const commit = await getLatestCommit(deployment.project.repoUrl);
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          commitSha: commit.sha,
          commitMessage: commit.message,
        },
      });
    } catch {
      // non-fatal — commit info is nice to have
    }
  }

  let deployedUrl: string | undefined;
  if (newStatus === "LIVE") {
    deployedUrl =
      deployment.project.customDomain ??
      `${deployment.project.subdomain}.${process.env.HOSTIFER_DOMAIN ?? "hostifer.me"}`;
  }

  return {
    status: newStatus,
    steps: deployment.steps.map((s) => ({ name: s.name, status: s.status })),
    errorMessage:
      workflow.phase === "Failed" || workflow.phase === "Error"
        ? "Workflow failed"
        : undefined,
    deployedUrl,
    buildDuration,
    region: deployment.project.region,
  };
}
