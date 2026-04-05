import { deleteProject } from "@/lib/actions/projects";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await deleteProject(id);
    return Response.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return Response.json({ error: error.message }, { status: 401 });
      }

      if (
        error.message === "Project not found" ||
        error.message.includes("Forbidden")
      ) {
        return Response.json({ error: error.message }, { status: 403 });
      }

      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
