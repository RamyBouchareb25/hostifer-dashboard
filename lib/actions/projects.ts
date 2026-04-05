"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { encrypt } from "@/lib/crypto";
import { argoClient } from "@/lib/argo-client";
import { getLatestCommit } from "@/lib/github";

export async function createProject(data: {
  name: string;
  repoUrl: string;
  framework: string;
  port: number;
}): Promise<{ projectId: string }> {
  const session = await requireAuth();

  let plan = await prisma.plan.findUnique({
    where: { name: "Free" },
  });

  if (!plan) {
    plan = await prisma.plan.create({
      data: {
        name: "Free",
        tier: "FREE",
        maxProjects: 3,
        maxDeployments: 10,
        maxMemoryMi: 512,
        maxCpuM: 500,
        maxStorageGi: 1,
        maxBandwidthGb: 10,
        buildTimeoutMins: 15,
      },
    });
  }

  const slug =
    data.name.toLowerCase().replace(/[^a-z0-9]/g, "-") +
    "-" +
    Math.random().toString(36).substring(2, 7);
  const project = await prisma.project.create({
    data: {
      name: data.name,
      slug,
      subdomain: slug,
      repoUrl: data.repoUrl,
      framework: data.framework,
      port: data.port,
      owner: {
        connect: { id: session.user.id },
      },
      plan: {
        connect: { id: plan.id },
      },
    },
  });

  return { projectId: project.id };
}

export async function updateProjectSettings(
  projectId: string,
  data: {
    region: string;
    planName: string;
    startCommand?: string;
    buildCommand?: string;
    envVars: { key: string; value: string; isSecret: boolean }[];
  },
): Promise<void> {
  await requireProjectAccess(projectId);

  let plan = await prisma.plan.findUnique({
    where: { name: data.planName },
  });

  if (!plan) {
    // Fallback to Free if not found, or create it
    plan = await prisma.plan.findUnique({ where: { name: "Free" } });
    if (!plan) throw new Error("Plan not found");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      region: data.region,
      planId: plan.id,
    },
  });

  // Handle env vars
  await prisma.envVar.deleteMany({ where: { projectId } });

  if (data.envVars.length > 0) {
    await prisma.envVar.createMany({
      data: data.envVars.map((v) => ({
        projectId,
        key: v.key,
        value: v.isSecret ? encrypt(v.value) : v.value,
        isSecret: v.isSecret,
      })),
    });
  }
}

export async function getUserProjects() {
  const session = await requireAuth();

  return prisma.project.findMany({
    where: { ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      slug: true,
      repoUrl: true,
      _count: { select: { deployments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProject(projectId: string) {
  await requireProjectAccess(projectId);

  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      deployments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      envVars: true,
    },
  });
}

function getTagFromImageName(
  imageName: string | null | undefined,
): string | null {
  if (!imageName) return null;
  const parts = imageName.split(":");
  if (parts.length < 2) return null;
  return parts[parts.length - 1] || null;
}

export async function deleteProject(
  projectId: string,
): Promise<{ workflowName: string }> {
  await requireProjectAccess(projectId);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      slug: true,
      subdomain: true,
      repoUrl: true,
      deployments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          commitSha: true,
          imageName: true,
        },
      },
    },
  });

  if (!project) throw new Error("Project not found");

  const releaseName = project.slug;
  const subdomain = project.subdomain ?? project.slug;
  const latestDeployment = project.deployments[0];

  let commitSha =
    latestDeployment?.commitSha ??
    getTagFromImageName(latestDeployment?.imageName);
  if (!commitSha) {
    const latestCommit = await getLatestCommit(project.repoUrl);
    commitSha = latestCommit.sha;
  }

  const imageName = `${project.slug}:${commitSha}`;

  const { workflowName } = await argoClient.submitDeleteWorkflow({
    releaseName,
    subdomain,
    imageName,
  });

  await prisma.project.delete({ where: { id: project.id } });

  return { workflowName };
}
