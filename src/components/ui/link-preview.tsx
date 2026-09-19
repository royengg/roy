"use client";

// Aceternity Link Preview (static-image mode), adapted to the portfolio tokens:
// https://ui.aceternity.com/components/link-preview
import * as HoverCard from "@radix-ui/react-hover-card";
import { useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import styles from "./link-preview.module.css";

export function LinkPreview({
  children,
  url,
  imageSrc,
  label,
  tone,
}: {
  children: ReactNode;
  url: string;
  imageSrc: string;
  label: string;
  tone?: "green" | "orange";
}) {
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const translateX = useSpring(x, { stiffness: 100, damping: 15 });

  return (
    <HoverCard.Root
      open={open}
      onOpenChange={(nextOpen) => {
        // A transient tunnel/network failure must not permanently hide the image.
        if (nextOpen) setImageFailed(false);
        setOpen(nextOpen);
      }}
      openDelay={100}
      closeDelay={150}
    >
      <HoverCard.Trigger
        className={styles.trigger}
        data-tone={tone}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={(event) => {
          if (reducedMotion) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          x.set(
            Math.max(
              -8,
              Math.min(8, (event.clientX - bounds.left - bounds.width / 2) / 2),
            ),
          );
        }}
        onMouseLeave={() => x.set(0)}
      >
        <span className={styles.label}>{children}</span>
      </HoverCard.Trigger>
      <AnimatePresence>
        {open && (
          <HoverCard.Portal forceMount>
            <HoverCard.Content
              forceMount
              className={styles.content}
              side="top"
              align="center"
              sideOffset={12}
              collisionPadding={24}
              onEscapeKeyDown={() => setOpen(false)}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: reducedMotion ? 0 : 12,
                  scale: reducedMotion ? 1 : 0.92,
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: reducedMotion ? 0 : 8,
                  scale: reducedMotion ? 1 : 0.96,
                }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 260, damping: 20 }
                }
                style={{ x: reducedMotion ? 0 : translateX }}
              >
                <a
                  className={styles.card}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${label} (opens in a new tab)`}
                >
                  {imageFailed ? (
                    <span className={styles.fallback}>{label}</span>
                  ) : (
                    // These small, precompressed local screenshots need no remote image service.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageSrc}
                      width={280}
                      height={175}
                      alt={`${label} website preview`}
                      onError={() => setImageFailed(true)}
                    />
                  )}
                </a>
              </motion.div>
            </HoverCard.Content>
          </HoverCard.Portal>
        )}
      </AnimatePresence>
    </HoverCard.Root>
  );
}
