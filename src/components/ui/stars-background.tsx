"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Star = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  phase: number;
  twinkleSpeed: number;
  sparkles: boolean;
  nextSparkleAt: number;
  sparkleStartedAt: number | null;
  sparkleDuration: number;
};

type StarsBackgroundProps = {
  starDensity?: number;
  starColor?: string;
  glowColor?: string;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  className?: string;
};

const randomBetween = (minimum: number, maximum: number) =>
  minimum + Math.random() * (maximum - minimum);

export function StarsBackground({
  starDensity = 0.00006,
  starColor = "#f1ede4",
  glowColor = "rgba(255, 102, 84, 0.58)",
  twinkleProbability = 0.48,
  minTwinkleSpeed = 0.32,
  maxTwinkleSpeed = 0.72,
  className,
}: StarsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = motionQuery.matches;
    let isVisible = document.visibilityState !== "hidden";
    let frameId = 0;
    let lastFrameTime = 0;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];

    const generateStars = () => {
      const starCount = Math.max(
        12,
        Math.min(60, Math.floor(width * height * starDensity)),
      );

      const now = performance.now();

      stars = Array.from({ length: starCount }, () => {
        const sparkles = Math.random() < 0.22;

        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: randomBetween(0.38, 1.12),
          opacity: randomBetween(0.22, 0.68),
          phase: Math.random() * Math.PI * 2,
          twinkleSpeed:
            Math.random() < twinkleProbability
              ? randomBetween(minTwinkleSpeed, maxTwinkleSpeed)
              : 0,
          sparkles,
          nextSparkleAt: now + randomBetween(1200, 9000),
          sparkleStartedAt: null,
          sparkleDuration: randomBetween(760, 1280),
        };
      });
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      for (const star of stars) {
        if (
          star.sparkles &&
          !prefersReducedMotion &&
          star.sparkleStartedAt === null &&
          time >= star.nextSparkleAt
        ) {
          star.sparkleStartedAt = time;
          star.nextSparkleAt = time + randomBetween(7000, 17000);
        }

        const sparkleProgress =
          star.sparkleStartedAt === null
            ? 0
            : Math.min((time - star.sparkleStartedAt) / star.sparkleDuration, 1);
        const sparkle =
          sparkleProgress > 0 && sparkleProgress < 1
            ? Math.sin(sparkleProgress * Math.PI) ** 3
            : 0;

        if (sparkleProgress >= 1) {
          star.sparkleStartedAt = null;
          star.sparkleDuration = randomBetween(760, 1280);
        }

        const twinkle =
          !prefersReducedMotion && star.twinkleSpeed > 0
            ? 0.72 + Math.sin(time * 0.001 * star.twinkleSpeed + star.phase) * 0.28
            : 1;

        context.save();
        context.globalAlpha = Math.min(1, star.opacity * twinkle + sparkle * 0.5);
        context.fillStyle = starColor;
        if (star.sparkles) {
          context.shadowBlur = 4 + sparkle * 14;
          context.shadowColor = glowColor;
        }
        context.beginPath();
        context.arc(
          star.x,
          star.y,
          star.radius * (1 + sparkle * 0.58),
          0,
          Math.PI * 2,
        );
        context.fill();

        if (sparkle > 0.16) {
          const rayLength = star.radius * (2.8 + sparkle * 5.4);
          context.globalAlpha = sparkle * 0.52;
          context.strokeStyle = starColor;
          context.lineWidth = 0.5;
          context.beginPath();
          context.moveTo(star.x - rayLength, star.y);
          context.lineTo(star.x + rayLength, star.y);
          context.moveTo(star.x, star.y - rayLength);
          context.lineTo(star.x, star.y + rayLength);
          context.stroke();
        }
        context.restore();
      }
    };

    const animate = (time: number) => {
      if (time - lastFrameTime >= 50) {
        draw(time);
        lastFrameTime = time;
      }
      frameId = window.requestAnimationFrame(animate);
    };

    const start = () => {
      window.cancelAnimationFrame(frameId);
      draw(performance.now());
      if (!prefersReducedMotion && isVisible) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      generateStars();
      draw(performance.now());
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      start();
    };

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState !== "hidden";
      if (isVisible) {
        const now = performance.now();
        for (const star of stars) {
          star.sparkleStartedAt = null;
          star.nextSparkleAt = now + randomBetween(800, 9000);
        }
      }
      start();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    motionQuery.addEventListener("change", handleMotionChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    resize();
    start();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    glowColor,
    maxTwinkleSpeed,
    minTwinkleSpeed,
    starColor,
    starDensity,
    twinkleProbability,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full", className)}
    />
  );
}
