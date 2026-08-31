"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

type ShootingStarsProps = {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  className?: string;
};

type ActiveStar = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  trailLength: number;
};

const randomBetween = (minimum: number, maximum: number) =>
  minimum + Math.random() * (maximum - minimum);

export function ShootingStars({
  minSpeed = 165,
  maxSpeed = 225,
  minDelay = 7000,
  maxDelay = 13000,
  starColor = "#fffdf8",
  trailColor = "#ff6654",
  starWidth = 1.15,
  className,
}: ShootingStarsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const starRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGLineElement>(null);
  const headRef = useRef<SVGCircleElement>(null);
  const instanceId = useId().replaceAll(":", "");
  const gradientId = `shooting-star-gradient-${instanceId}`;
  const glowId = `shooting-star-glow-${instanceId}`;

  useEffect(() => {
    const svg = svgRef.current;
    const starGroup = starRef.current;
    const trail = trailRef.current;
    const head = headRef.current;
    if (!svg || !starGroup || !trail || !head) return;
    const svgElement: SVGSVGElement = svg;
    const starElement: SVGGElement = starGroup;
    const trailElement: SVGLineElement = trail;
    const headElement: SVGCircleElement = head;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = motionQuery.matches;
    let isVisible = document.visibilityState !== "hidden";
    let width = 0;
    let height = 0;
    let activeStar: ActiveStar | null = null;
    let frameId = 0;
    let timeoutId = 0;
    let previousTime = 0;

    const hideStar = () => {
      activeStar = null;
      starElement.style.opacity = "0";
    };

    const scheduleStar = () => {
      window.clearTimeout(timeoutId);
      if (prefersReducedMotion || !isVisible || width < 1 || height < 1) return;

      timeoutId = window.setTimeout(
        spawnStar,
        randomBetween(minDelay, maxDelay),
      );
    };

    const animate = (time: number) => {
      if (!activeStar) return;
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      activeStar.x += activeStar.velocityX * delta;
      activeStar.y += activeStar.velocityY * delta;

      const magnitude = Math.hypot(activeStar.velocityX, activeStar.velocityY);
      const directionX = activeStar.velocityX / magnitude;
      const directionY = activeStar.velocityY / magnitude;
      const tailX = activeStar.x - directionX * activeStar.trailLength;
      const tailY = activeStar.y - directionY * activeStar.trailLength;

      trailElement.setAttribute("x1", String(tailX));
      trailElement.setAttribute("y1", String(tailY));
      trailElement.setAttribute("x2", String(activeStar.x));
      trailElement.setAttribute("y2", String(activeStar.y));
      headElement.setAttribute("cx", String(activeStar.x));
      headElement.setAttribute("cy", String(activeStar.y));

      if (
        tailX > width + activeStar.trailLength ||
        tailY > height + activeStar.trailLength
      ) {
        hideStar();
        scheduleStar();
        return;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    function spawnStar() {
      if (prefersReducedMotion || !isVisible) return;

      const angle = randomBetween(22, 34) * (Math.PI / 180);
      const speed = randomBetween(minSpeed, maxSpeed);
      const trailLength = randomBetween(58, 86);
      const startsFromTop = Math.random() > 0.36;

      activeStar = {
        x: startsFromTop ? randomBetween(-trailLength, width * 0.66) : -trailLength,
        y: startsFromTop ? -4 : randomBetween(height * 0.04, height * 0.42),
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        trailLength,
      };
      previousTime = performance.now();
      starElement.style.opacity = "0.72";
      frameId = window.requestAnimationFrame(animate);
    }

    const resize = () => {
      const bounds = svgElement.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      window.cancelAnimationFrame(frameId);
      hideStar();
      scheduleStar();
    };

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState !== "hidden";
      window.cancelAnimationFrame(frameId);
      hideStar();
      scheduleStar();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(svgElement);
    motionQuery.addEventListener("change", handleMotionChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    resize();
    scheduleStar();

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [maxDelay, maxSpeed, minDelay, minSpeed]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      className={cn("absolute inset-0 h-full w-full", className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={trailColor} stopOpacity="0" />
          <stop offset="72%" stopColor={trailColor} stopOpacity="0.38" />
          <stop offset="100%" stopColor={starColor} stopOpacity="0.92" />
        </linearGradient>
        <filter id={glowId} x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="2.1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g ref={starRef} style={{ opacity: 0 }}>
        <line
          ref={trailRef}
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeWidth={starWidth}
        />
        <circle
          ref={headRef}
          r="1.45"
          fill={starColor}
          filter={`url(#${glowId})`}
        />
      </g>
    </svg>
  );
}
