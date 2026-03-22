import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import ProjectListClient from "./ProjectListClient";

// Await the params per Next.js convention for searchParams
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await requireAuth();
  const params = await searchParams;
  const q = params?.q || "";
  const statusFilter = (params?.status || "all").toLowerCase();

  // Fetch from DB: all projects for owner matching query
  const projects = await prisma.project.findMany({
    where: {
      ownerId: session.user.id,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      deployments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { deployments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Since deployment status ("live", "building", etc) is derived from relations,
  // we filter that manually here before sending to client.
  const filteredProjects = projects.filter((p) => {
    if (statusFilter === "all") return true;

    const latestDeploy = p.deployments?.[0];
    const derivedStatus =
      latestDeploy?.status === "LIVE"
        ? "live"
        : latestDeploy?.status === "FAILED"
          ? "failed"
          : !latestDeploy
            ? "sleeping"
            : "building";

    return derivedStatus === statusFilter;
  });

  return <ProjectListClient projects={filteredProjects} />;
}
