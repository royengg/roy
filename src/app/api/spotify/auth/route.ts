import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getSpotifyRedirectUri,
  SPOTIFY_SCOPES,
} from "@/lib/spotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "spotify_oauth_state";

export async function GET() {
  try {
    const redirectUri = getSpotifyRedirectUri();
    const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
    if (!clientId) throw new Error("Missing SPOTIFY_CLIENT_ID");

    const state = randomBytes(32).toString("hex");
    const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
    authorizeUrl.search = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: SPOTIFY_SCOPES.join(" "),
      state,
    }).toString();

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      maxAge: 10 * 60,
      path: "/api/spotify",
      sameSite: "lax",
      secure: new URL(redirectUri).protocol === "https:",
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return Response.json(
      { error: "Spotify OAuth is not configured on the server." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
