"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type ThreeDMarqueeItem = {
  id: string;
  label: string;
  content: React.ReactNode;
  ariaHidden?: boolean;
};

export const ThreeDMarquee = ({
  images = [],
  items,
  className,
  ariaLabel = "3D marquee",
}: {
  images?: string[];
  items?: ThreeDMarqueeItem[];
  className?: string;
  ariaLabel?: string;
}) => {
  const shouldReduceMotion = useReducedMotion();
  const entries = items?.length
    ? items.map((item) => ({ ...item, type: "content" as const }))
    : images.map((src, index) => ({
        id: `${index}-${src}`,
        label: `Image ${index + 1}`,
        src,
        type: "image" as const,
      }));

  // Split the entries into the source component's four perspective columns.
  const chunkSize = Math.ceil(entries.length / 4);
  const chunks = Array.from({ length: 4 }, (_, colIndex) => {
    const start = colIndex * chunkSize;
    return entries.slice(start, start + chunkSize);
  });

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={cn(
        "mx-auto block h-[600px] overflow-hidden rounded-2xl max-sm:h-100",
        className,
      )}
    >
      <div className="flex size-full items-center justify-center">
        <div
          data-slot="three-d-marquee-stage"
          className="size-[1720px] shrink-0 scale-50 sm:scale-75 lg:scale-100"
        >
          <div
            data-slot="three-d-marquee-grid"
            style={{
              transform: "rotateX(55deg) rotateY(0deg) rotateZ(-45deg)",
            }}
            className="relative top-96 right-[50%] grid size-full origin-top-left grid-cols-4 gap-8 transform-3d"
          >
            {chunks.map((subarray, colIndex) => (
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: colIndex % 2 === 0 ? 100 : -100 }}
                transition={{
                  duration: colIndex % 2 === 0 ? 8.5 : 12.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                key={colIndex + "marquee"}
                className="relative flex w-full flex-col items-start gap-8"
              >
                <GridLineVertical className="-left-4" offset="80px" />
                {subarray.map((item) => (
                  <div
                    className="relative w-full"
                    key={item.id}
                    role="listitem"
                    aria-label={item.label}
                    aria-hidden={item.type === "content" && item.ariaHidden ? true : undefined}
                    data-slot="three-d-marquee-hit-area"
                  >
                    <GridLineHorizontal className="-top-4" offset="20px" />
                    {item.type === "image" ? (
                      <motion.img
                        data-slot="three-d-marquee-visual"
                        src={item.src}
                        alt={item.label}
                        className="aspect-[970/700] rounded-lg object-cover ring ring-gray-950/5"
                        width={970}
                        height={700}
                      />
                    ) : (
                      <div
                        data-slot="three-d-marquee-visual"
                        className="aspect-[970/700] w-full rounded-lg ring ring-gray-950/5"
                      >
                        {item.content}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GridLineHorizontal = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "var(--color-bg-page)",
          "--color": "var(--color-marquee-line)",
          "--height": "2px",
          "--width": "6px",
          "--fade-stop": "90%",
          "--offset": offset || "200px", //-100px if you want to keep the line inside
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "absolute left-[calc(var(--offset)/2*-1)] h-[var(--height)] w-[calc(100%+var(--offset))]",
        "bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        className,
      )}
    ></div>
  );
};

const GridLineVertical = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "var(--color-bg-page)",
          "--color": "var(--color-marquee-line)",
          "--height": "6px",
          "--width": "2px",
          "--fade-stop": "90%",
          "--offset": offset || "150px", //-100px if you want to keep the line inside
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "absolute top-[calc(var(--offset)/2*-1)] h-[calc(100%+var(--offset))] w-[var(--width)]",
        "bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        className,
      )}
    ></div>
  );
};
