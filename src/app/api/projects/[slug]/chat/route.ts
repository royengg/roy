import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createTextStreamResponse, streamText, type ModelMessage } from "ai";
import { getRepositoryPrompt } from "@/lib/repository-context";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL_ID = "gemini-3.6-flash";
const MODEL_TIMEOUT_MS = 20_000;
const MODEL_FAILURE_MESSAGE =
  "The repository assistant is temporarily unavailable. Please try again in a moment.";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

const requestLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARACTERS = 3_000;
const MAX_TOTAL_CHARACTERS = 12_000;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function createSafeTextStream(
  textStream: AsyncIterable<string>,
  requestSignal: AbortSignal,
) {
  return new ReadableStream<string>({
    async start(controller) {
      let hasText = false;

      try {
        for await (const delta of textStream) {
          if (!delta) continue;
          hasText = true;
          controller.enqueue(delta);
        }

        if (!hasText && !requestSignal.aborted) {
          controller.enqueue(MODEL_FAILURE_MESSAGE);
        }
      } catch {
        if (!hasText && !requestSignal.aborted) {
          controller.enqueue(MODEL_FAILURE_MESSAGE);
        }
      } finally {
        controller.close();
      }
    },
  });
}

function getClientIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

function isRateLimited(identifier: string) {
  const now = Date.now();
  const recentRequests = (requestLog.get(identifier) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestLog.set(identifier, recentRequests);
    return true;
  }

  recentRequests.push(now);
  requestLog.set(identifier, recentRequests);
  return false;
}

function validateMessages(value: unknown): IncomingMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return null;

  let totalCharacters = 0;
  const messages: IncomingMessage[] = [];

  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") return null;

    const role = "role" in candidate ? candidate.role : undefined;
    const content = "content" in candidate ? candidate.content : undefined;

    if (
      (role !== "user" && role !== "assistant") ||
      typeof content !== "string" ||
      content.trim().length === 0 ||
      content.length > MAX_MESSAGE_CHARACTERS
    ) {
      return null;
    }

    totalCharacters += content.length;
    if (totalCharacters > MAX_TOTAL_CHARACTERS) return null;
    messages.push({ role, content: content.trim() });
  }

  if (messages.at(-1)?.role !== "user") return null;
  return messages;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const repositoryPrompt = getRepositoryPrompt(slug);

  if (!repositoryPrompt) return jsonError("Project repository not found.", 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("The request body must be valid JSON.", 400);
  }

  const messages = validateMessages(
    body && typeof body === "object" && "messages" in body ? body.messages : undefined,
  );
  if (!messages) return jsonError("The chat history is invalid or too long.", 400);

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return jsonError(
      "Gemini is not configured yet. Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local and restart the development server.",
      503,
    );
  }

  const identifier = getClientIdentifier(request);
  if (isRateLimited(identifier)) {
    return jsonError("Too many questions. Please wait a few minutes and try again.", 429);
  }

  const google = createGoogleGenerativeAI({ apiKey });
  const result = streamText({
    model: google(MODEL_ID),
    system: repositoryPrompt.system,
    messages: messages satisfies ModelMessage[],
    maxOutputTokens: 700,
    maxRetries: 0,
    timeout: MODEL_TIMEOUT_MS,
    abortSignal: request.signal,
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingLevel: "low",
        },
      },
    },
    onError: ({ error }) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[project-chat] ${MODEL_ID} request failed for ${slug}: ${message}`);
    },
  });

  return createTextStreamResponse({
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
    stream: createSafeTextStream(result.textStream, request.signal),
  });
}
