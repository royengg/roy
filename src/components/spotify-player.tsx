"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Spotify } from "react-spotify-embed";
import { SiSpotify } from "react-icons/si";
import { spotifyPresets } from "@/data/spotify";

type SpotifyTrack = {
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

type SpotifyNowPlaying = {
  configured: boolean;
  status: "playing" | "paused" | "recent" | "idle";
  track: SpotifyTrack | null;
  fetchedAt: string;
};

function isNowPlaying(value: unknown): value is SpotifyNowPlaying {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<SpotifyNowPlaying>;
  return (
    typeof data.configured === "boolean" &&
    ["playing", "paused", "recent", "idle"].includes(data.status ?? "") &&
    (data.track === null || typeof data.track === "object")
  );
}

function formatDuration(milliseconds: number | null) {
  if (milliseconds === null || !Number.isFinite(milliseconds)) return "0:00";
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function statusCopy(data: SpotifyNowPlaying | null) {
  if (!data) return "Checking Spotify";
  if (!data.configured) return "Spotify setup pending";
  if (data.status === "playing") return "Live on Spotify";
  if (data.status === "paused") return "Paused on Spotify";
  if (data.status === "recent") return "Recently played";
  return "Between tracks";
}

export function SpotifyPlayer({ staticMode = false }: { staticMode?: boolean }) {
  const [nowPlaying, setNowPlaying] = useState<SpotifyNowPlaying | null>(null);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (staticMode) return;

    let disposed = false;
    let inView = false;
    let interval: number | null = null;

    const loadNowPlaying = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/spotify/now-playing", { cache: "no-store" });
        const data = (await response.json()) as unknown;
        if (!disposed && isNowPlaying(data)) setNowPlaying(data);
      } catch {
        // Keep the last successful track visible during a transient network failure.
      }
    };

    const syncPolling = () => {
      if (interval !== null) window.clearInterval(interval);
      interval = null;
      if (!inView || document.visibilityState !== "visible") return;
      void loadNowPlaying();
      interval = window.setInterval(loadNowPlaying, 15_000);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncPolling();
      },
      { rootMargin: "240px 0px", threshold: 0.01 },
    );
    const section = sectionRef.current;
    if (section) observer.observe(section);
    document.addEventListener("visibilitychange", syncPolling);

    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPolling);
      if (interval !== null) window.clearInterval(interval);
    };
  }, [staticMode]);

  const track = nowPlaying?.track ?? null;
  const progress = track?.progressMs ?? 0;
  const progressPercent = track?.durationMs
    ? Math.min(100, Math.max(0, (progress / track.durationMs) * 100))
    : 0;
  const preset = spotifyPresets[selectedPreset];

  return (
    <div className="spotify-player-grid" ref={sectionRef}>
      <article className="spotify-live-card" aria-labelledby="spotify-live-title">
        <div className="spotify-live-topline">
          <span className="spotify-live-status" aria-live="polite">
            <span data-playing={nowPlaying?.status === "playing" || undefined} />
            {statusCopy(nowPlaying)}
          </span>
          <SiSpotify aria-hidden="true" />
        </div>

        {track ? (
          <>
            <a
              className="spotify-live-artwork"
              href={track.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${track.title} by ${track.artists.join(", ")} on Spotify`}
            >
              {track.imageUrl ? (
                <Image
                  src={track.imageUrl}
                  alt={`Album cover for ${track.album}`}
                  fill
                  sizes="(max-width: 720px) 50vw, 240px"
                />
              ) : (
                <SiSpotify aria-hidden="true" />
              )}
            </a>
            <div className="spotify-live-copy">
              <p className="spotify-live-eyebrow" id="spotify-live-title">
                {nowPlaying?.status === "recent" ? "Last in the headphones" : "In the headphones"}
              </p>
              <a href={track.spotifyUrl} target="_blank" rel="noreferrer">
                <h3>{track.title}</h3>
                <p>{track.artists.join(", ")}</p>
              </a>
              <span className="spotify-live-album">{track.album}</span>
            </div>
            {nowPlaying?.status !== "recent" && (
              <div className="spotify-progress-wrap">
                <div
                  className="spotify-progress"
                  role="progressbar"
                  aria-label={`${track.title} playback progress`}
                  aria-valuemin={0}
                  aria-valuemax={track.durationMs}
                  aria-valuenow={progress}
                >
                  <span style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="spotify-time" aria-hidden="true">
                  <span>{formatDuration(progress)}</span>
                  <span>{formatDuration(track.durationMs)}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="spotify-live-empty">
            <SiSpotify aria-hidden="true" />
            <div>
              <p id="spotify-live-title">
                {nowPlaying?.configured ? "Nothing playing right now" : "Live listening will appear here"}
              </p>
              <span>
                {nowPlaying?.configured
                  ? "A recent track will appear after the next listen."
                  : "The player still works below while the private live feed is connected."}
              </span>
            </div>
          </div>
        )}
      </article>

      <div className="spotify-preset-card">
        <div className="spotify-preset-heading">
          <div>
            <span>On repeat</span>
            <h3>Pick a preset</h3>
          </div>
          <span className="spotify-preset-count">0{selectedPreset + 1} / 0{spotifyPresets.length}</span>
        </div>

        <div className="spotify-preset-list" aria-label="Song presets">
          {spotifyPresets.map((item, index) => (
            <button
              key={item.link}
              type="button"
              aria-pressed={selectedPreset === index}
              onClick={() => setSelectedPreset(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.title}</strong>
              <small>{item.artist}</small>
            </button>
          ))}
        </div>

        <div className="spotify-embed-shell">
          {staticMode ? (
            <div className="spotify-embed-placeholder" aria-hidden="true">
              <SiSpotify />
              <span>{preset.title}</span>
            </div>
          ) : embedLoaded ? (
            <Spotify
              key={preset.link}
              wide
              link={preset.link}
              width="100%"
              height={152}
              loading="lazy"
              title={`${preset.title} by ${preset.artist} — Spotify player`}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          ) : (
            <button
              className="spotify-embed-launch"
              type="button"
              onClick={() => setEmbedLoaded(true)}
              aria-label={`Load the Spotify player for ${preset.title} by ${preset.artist}`}
            >
              <SiSpotify aria-hidden="true" />
              <span>
                <strong>{preset.title}</strong>
                <small>{preset.artist}</small>
              </span>
              <em>Load player</em>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
