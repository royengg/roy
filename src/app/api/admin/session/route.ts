import { cookies } from "next/headers";
import { BoardError } from "@/lib/testimonials";
import {
  boardFailure,
  boardResponse,
  createSession,
  passwordsMatch,
  rateLimit,
  readJson,
  requireOwner,
  requireSameOrigin,
  SESSION_COOKIE,
  SESSION_SECONDS,
} from "@/lib/board-server";

export async function GET() {
  try {
    await requireOwner();
    return boardResponse({ authenticated: true });
  } catch (error) {
    return boardFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const data = await readJson(request);
    await rateLimit(request, "login");
    if (typeof data?.password !== "string" || !passwordsMatch(data.password))
      throw new BoardError("That password is not correct.", 401);
    (await cookies()).set(SESSION_COOKIE, createSession(), {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production" ||
        request.headers.get("origin")?.startsWith("https://"),
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_SECONDS,
    });
    return boardResponse({ authenticated: true });
  } catch (error) {
    return boardFailure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request);
    (await cookies()).delete(SESSION_COOKIE);
    return boardResponse({ authenticated: false });
  } catch (error) {
    return boardFailure(error);
  }
}
