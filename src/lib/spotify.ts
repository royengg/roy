import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
] as const;

type SpotifyTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  error?: string;
};

type SpotifyImage = {
  height: number | null;
  url: string;
  width: number | null;
};

type SpotifyApiTrack = {
  id: string;
  type: "track";
  name: string;
  duration_ms: number;
  external_urls: { spotify?: string };
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: SpotifyImage[];
  };
};

type SpotifyCurrentlyPlayingResponse = {
  is_playing: boolean;
  progress_ms: number | null;
  item: SpotifyApiTrack | { type?: string } | null;
};

type SpotifyRecentlyPlayedResponse = {
  items?: Array<{
    played_at: string;
    track: SpotifyApiTrack;
  }>;
};

export type SpotifyTrack = {
  id: string;
  title: string;
  artists: string[];
  album: string;
  imageUrl: string | null;
  spotifyUrl: string;
  durationMs: number;
  progressMs: number | null;
  playedAt: string | null;
};

export type SpotifyNowPlaying = {
  configured: boolean;
  status: "playing" | "paused" | "recent" | "idle";
  track: SpotifyTrack | null;
  fetchedAt: string;
};

let accessTokenCache: { token: string; expiresAt: number } | null = null;

function getRequiredEnvironment(name: "SPOTIFY_CLIENT_ID" | "SPOTIFY_CLIENT_SECRET") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function getSpotifyRedirectUri() {
  const value = process.env.SPOTIFY_REDIRECT_URI?.trim();
  if (!value) throw new Error("Missing SPOTIFY_REDIRECT_URI");
  return value;
}

function getBasicAuthorization() {
  const clientId = getRequiredEnvironment("SPOTIFY_CLIENT_ID");
  const clientSecret = getRequiredEnvironment("SPOTIFY_CLIENT_SECRET");
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

async function requestToken(body: URLSearchParams) {
  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: "POST",
    headers: {
      Authorization: getBasicAuthorization(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as SpotifyTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(`Spotify token exchange failed (${response.status})`);
  }

  return data;
}

export async function exchangeSpotifyAuthorizationCode(code: string) {
  return requestToken(
    new URLSearchParams({
      code,
      redirect_uri: getSpotifyRedirectUri(),
      grant_type: "authorization_code",
    }),
  );
}

export async function persistSpotifyRefreshToken(refreshToken: string) {
  if (!refreshToken || /[\r\n]/.test(refreshToken)) {
    throw new Error("Spotify returned an invalid refresh token");
  }

  const envPath = path.join(process.cwd(), ".env.local");
  let contents = "";

  try {
    contents = await fs.readFile(envPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const line = `SPOTIFY_REFRESH_TOKEN=${refreshToken}`;
  const matcher = /^SPOTIFY_REFRESH_TOKEN=.*$/m;
  const updated = matcher.test(contents)
    ? contents.replace(matcher, line)
    : `${contents.trimEnd()}${contents.trim() ? "\n" : ""}${line}\n`;

  await fs.writeFile(envPath, updated, { encoding: "utf8", mode: 0o600 });
  await fs.chmod(envPath, 0o600);
  process.env.SPOTIFY_REFRESH_TOKEN = refreshToken;
  accessTokenCache = null;
}

async function getSpotifyAccessToken() {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 30_000) {
    return accessTokenCache.token;
  }

  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN?.trim();
  if (!refreshToken) return null;

  const token = await requestToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  );

  if (token.refresh_token && token.refresh_token !== refreshToken) {
    await persistSpotifyRefreshToken(token.refresh_token);
  }

  accessTokenCache = {
    token: token.access_token!,
    expiresAt: Date.now() + Math.max((token.expires_in ?? 3600) - 60, 60) * 1000,
  };
  return accessTokenCache.token;
}

async function spotifyApiFetch(pathname: string, retry = true) {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) return null;

  const response = await fetch(`${SPOTIFY_API_URL}${pathname}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (response.status === 401 && retry) {
    accessTokenCache = null;
    return spotifyApiFetch(pathname, false);
  }

  return response;
}

function isSpotifyTrack(item: SpotifyCurrentlyPlayingResponse["item"]): item is SpotifyApiTrack {
  return Boolean(
    item &&
      item.type === "track" &&
      "id" in item &&
      "artists" in item &&
      "album" in item,
  );
}

function normalizeTrack(
  track: SpotifyApiTrack,
  options: { progressMs?: number | null; playedAt?: string | null } = {},
): SpotifyTrack {
  const image = [...track.album.images].sort(
    (a, b) => (b.width ?? 0) - (a.width ?? 0),
  )[0];

  return {
    id: track.id,
    title: track.name,
    artists: track.artists.map((artist) => artist.name),
    album: track.album.name,
    imageUrl: image?.url ?? null,
    spotifyUrl: track.external_urls.spotify ?? `https://open.spotify.com/track/${track.id}`,
    durationMs: track.duration_ms,
    progressMs: options.progressMs ?? null,
    playedAt: options.playedAt ?? null,
  };
}

export async function getSpotifyNowPlaying(): Promise<SpotifyNowPlaying> {
  const fetchedAt = new Date().toISOString();
  const currentResponse = await spotifyApiFetch("/me/player/currently-playing");

  if (!currentResponse) {
    return { configured: false, status: "idle", track: null, fetchedAt };
  }

  if (currentResponse.ok && currentResponse.status !== 204) {
    const current = (await currentResponse.json()) as SpotifyCurrentlyPlayingResponse;
    if (isSpotifyTrack(current.item)) {
      return {
        configured: true,
        status: current.is_playing ? "playing" : "paused",
        track: normalizeTrack(current.item, { progressMs: current.progress_ms }),
        fetchedAt,
      };
    }
  } else if (!currentResponse.ok && currentResponse.status !== 204) {
    throw new Error(`Spotify currently-playing request failed (${currentResponse.status})`);
  }

  const recentResponse = await spotifyApiFetch("/me/player/recently-played?limit=1");
  if (recentResponse?.ok) {
    const recent = (await recentResponse.json()) as SpotifyRecentlyPlayedResponse;
    const item = recent.items?.[0];
    if (item?.track) {
      return {
        configured: true,
        status: "recent",
        track: normalizeTrack(item.track, { playedAt: item.played_at }),
        fetchedAt,
      };
    }
  } else if (recentResponse && recentResponse.status !== 204) {
    throw new Error(`Spotify recently-played request failed (${recentResponse.status})`);
  }

  return { configured: true, status: "idle", track: null, fetchedAt };
}
