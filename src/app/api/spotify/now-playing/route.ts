import { getSpotifyNowPlaying } from "@/lib/spotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSpotifyNowPlaying();
    return Response.json(data, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20" },
    });
  } catch {
    return Response.json(
      {
        configured: Boolean(process.env.SPOTIFY_REFRESH_TOKEN),
        status: "idle",
        track: null,
        fetchedAt: new Date().toISOString(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
