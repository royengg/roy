import { prisma } from "@/lib/prisma";
import { BoardError } from "@/lib/testimonials";
import {
  boardFailure,
  boardResponse,
  publicNoteSelect,
  readJson,
  requireOwner,
  requireSameOrigin,
} from "@/lib/board-server";

const statuses = ["PENDING", "APPROVED", "REJECTED"] as const;
export async function GET(request: Request) {
  try {
    await requireOwner();
    const status = new URL(request.url).searchParams.get("status") || "PENDING";
    if (!statuses.includes(status as (typeof statuses)[number]))
      throw new BoardError("Invalid status.");
    const notes = await prisma.testimonial.findMany({
      where: { status: status as (typeof statuses)[number] },
      select: {
        ...publicNoteSelect,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    return boardResponse({ notes });
  } catch (error) {
    return boardFailure(error);
  }
}

export async function PATCH(request: Request) {
  try {
    requireSameOrigin(request);
    await requireOwner();
    const data = await readJson(request);
    if (
      !data ||
      typeof data.id !== "string" ||
      !statuses.includes(data.status) ||
      typeof data.updatedAt !== "string" ||
      !Number.isFinite(Date.parse(data.updatedAt))
    )
      throw new BoardError("Invalid review.");
    const position: { x?: number; y?: number } = {};
    for (const key of ["x", "y"] as const) {
      if (data[key] === undefined) continue;
      if (
        typeof data[key] !== "number" ||
        !Number.isFinite(data[key]) ||
        data[key] < 0 ||
        data[key] > 1
      )
        throw new BoardError("Position must be inside the board.");
      position[key] = data[key];
    }
    const result = await prisma.testimonial.updateMany({
      where: { id: data.id, updatedAt: new Date(data.updatedAt) },
      data: {
        status: data.status,
        reviewedAt: new Date(),
        reviewedBy: "owner",
        ...position,
      },
    });
    if (!result.count)
      throw new BoardError(
        "This note changed in another tab. Refresh before reviewing it.",
        409,
      );
    return boardResponse({ saved: true });
  } catch (error) {
    return boardFailure(error);
  }
}
