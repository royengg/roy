"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import { watchlist } from "@/data/watchlist";

const CircularGallery = dynamic(() => import("@/components/CircularGallery"), {
  ssr: false,
  loading: () => (
    <div className="now-showing-pending" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => <span key={index} />)}
    </div>
  ),
});

function StaticWatchlist() {
  return (
    <ul className="watchlist-static" aria-label="Movies and shows I watch">
      {watchlist.map((item) => (
        <li key={item.title}>
          <div className="watchlist-static-poster">
            <Image
              alt={item.posterAlt}
              fill
              sizes="(max-width: 520px) 42vw, 190px"
              src={item.poster}
              unoptimized={item.poster.startsWith("data:")}
            />
          </div>
          <strong>{item.title}</strong>
          <span>{item.year}</span>
        </li>
      ))}
    </ul>
  );
}

export function NowShowing({ staticMode = false }: { staticMode?: boolean }) {
  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const galleryItems = useMemo(
    () =>
      watchlist.map((item) => ({
        image: item.poster,
        // Poster art carries the visual story; keep the canvas free of a
        // second title line beneath each image.
        text: "",
      })),
    [],
  );

  if (reduceMotion || staticMode) {
    return <StaticWatchlist />;
  }

  return (
    <div className="now-showing-stage">
      <CircularGallery
        ariaLabel="Movies and shows I watch. Drag horizontally or use the Left and Right Arrow keys to browse."
        bend={1}
        borderRadius={0.035}
        className="now-showing-gallery"
        font="600 24px Arial"
        itemHeight={960}
        itemWidth={640}
        items={galleryItems}
        mobileScrollSpeed={2.3}
        scrollEase={0.065}
        scrollSpeed={1.75}
        textColor={resolvedTheme === "dark" ? "#f1ede4" : "#181715"}
      />

      <ul className="sr-only">
        {watchlist.map((item) => (
          <li key={item.title}>
            {item.title}{item.year === "—" ? "" : `, ${item.year}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
