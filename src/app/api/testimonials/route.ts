import { prisma } from "@/lib/prisma";
import {
  BoardError,
  NOTES_PER_PAGE,
  parseSubmission,
} from "@/lib/testimonials";
import {
  boardFailure,
  boardResponse,
  publicNoteSelect,
  rateLimit,
  readJson,
  requireSameOrigin,
} from "@/lib/board-server";

export async function GET(request: Request) {
  try {
    const pageSize = Number(
      new URL(request.url).searchParams.get("size") || NOTES_PER_PAGE,
    );
    if (![2, 4, 6].includes(pageSize))
      throw new BoardError("Invalid page size.");
    const page = Math.max(
      0,
      Math.min(
        10000,
        Number(new URL(request.url).searchParams.get("page")) || 0,
      ),
    );
    if (!Number.isInteger(page)) throw new BoardError("Invalid page.");
    const [notes, total] = await prisma.$transaction([
      prisma.testimonial.findMany({
        where: { status: "APPROVED" },
        select: publicNoteSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: page * pageSize,
        take: pageSize,
      }),
      prisma.testimonial.count({ where: { status: "APPROVED" } }),
    ]);
    return boardResponse({
      notes,
      total,
      accepting: process.env.BOARD_SUBMISSIONS_PAUSED !== "true",
    });
  } catch (error) {
    return boardFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    if (process.env.BOARD_SUBMISSIONS_PAUSED === "true")
      throw new BoardError("New notes are paused for a little while.", 503);
    const data = parseSubmission(await readJson(request));
    await rateLimit(request, "note");
    await prisma.testimonial.upsert({
      where: { submissionKey: data.submissionKey },
      update: {},
      create: {
        ...data,
        status: "PENDING",
        rotation:
          ((parseInt(data.submissionKey.slice(0, 4), 16) % 61) - 30) / 10,
      },
    });
    return boardResponse({ submitted: true }, 202);
  } catch (error) {
    return boardFailure(error);
  }
}
