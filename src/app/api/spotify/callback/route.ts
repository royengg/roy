import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  exchangeSpotifyAuthorizationCode,
  persistSpotifyRefreshToken,
} from "@/lib/spotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "spotify_oauth_state";

function statesMatch(received: string | null, expected: string | undefined) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

function callbackPage(ok: boolean) {
  const title = ok ? "Spotify connected" : "Spotify connection failed";
  const copy = ok
    ? "The refresh token is stored server-side. Your live listening card can now update automatically."
    : "Nothing was saved. Return to the site and start the Spotify connection again.";
  const status = ok ? 200 : 400;

  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>html{color-scheme:light dark;font-family:system-ui,sans-serif}body{min-height:100vh;margin:0;display:grid;place-items:center;background:#141311;color:#f1ede4}.card{width:min(460px,calc(100% - 40px));padding:32px;border:1px solid #37332e;border-radius:20px;background:#1c1a17;box-sizing:border-box}p{color:#aaa399;line-height:1.6}a{display:inline-flex;margin-top:12px;color:inherit;text-underline-offset:4px}</style></head><body><main class="card"><h1>${title}</h1><p>${copy}</p><a href="/#now-playing">Return to the music player</a></main></body></html>`,
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
        "Content-Type": "text/html; charset=utf-8",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  const response = callbackPage(false);
  response.cookies.set(STATE_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/api/spotify",
    sameSite: "lax",
    secure: url.protocol === "https:",
  });

  if (url.searchParams.has("error")) return response;
  if (!statesMatch(url.searchParams.get("state"), expectedState)) return response;

  const code = url.searchParams.get("code");
  if (!code) return response;

  try {
    const token = await exchangeSpotifyAuthorizationCode(code);
    if (!token.refresh_token) return response;
    await persistSpotifyRefreshToken(token.refresh_token);

    const success = callbackPage(true);
    success.cookies.set(STATE_COOKIE, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/api/spotify",
      sameSite: "lax",
      secure: url.protocol === "https:",
    });
    return success;
  } catch {
    return response;
  }
}
