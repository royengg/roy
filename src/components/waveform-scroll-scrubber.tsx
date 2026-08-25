"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from "react";
import type Lenis from "lenis";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

const BAR_PROFILE = [
  0.26, 0.42, 0.61, 0.34, 0.72, 0.48, 0.85, 0.39, 0.66, 0.53,
  0.91, 0.44, 0.75, 0.31, 0.58, 0.82, 0.47, 0.69, 0.36, 0.88,
  0.54, 0.73, 0.41, 0.64, 0.29, 0.79, 0.5, 0.93, 0.38, 0.68,
  0.46, 0.84, 0.32, 0.57, 0.76, 0.43, 0.62,
] as const;

const RANGE_MAX = 1000;
const PAGE_SECTIONS = [
  { id: "intro", index: "00", label: "Intro" },
  { id: "about", index: "01", label: "About" },
  { id: "stack", index: "02", label: "Stack" },
  { id: "open-source", index: "03", label: "Open source" },
  { id: "experience", index: "04", label: "Experience" },
  { id: "work", index: "05", label: "Projects" },
  { id: "contact", index: "06", label: "Contact" },
] as const;
type PageSectionId = (typeof PAGE_SECTIONS)[number]["id"];
const SCROLL_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  "Space",
]);

type WaveformScrollScrubberProps = {
  lenis: Lenis | null;
};

type WaveformBarProps = {
  baseScale: number;
  energy: MotionValue<number>;
  index: number;
  progress: MotionValue<number>;
};

type PreviewScrollMapping = {
  anchors: Array<{ parent: number; preview: number }>;
  parentLimit: number;
  previewLimit: number;
};

function clampProgress(value: number) {
  return Math.min(1, Math.max(0, value));
}

function getNativeScrollLimit() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function WaveformBar({ baseScale, energy, index, progress }: WaveformBarProps) {
  const barPosition = index / (BAR_PROFILE.length - 1);
  const transform = useTransform([progress, energy], ([latestProgress, latestEnergy]) => {
    const distance = Math.abs(Number(latestProgress) - barPosition);
    const envelope = Math.exp(-Math.pow(distance / 0.075, 2));
    const scale = Math.min(
      1,
      baseScale + envelope * (0.28 + Number(latestEnergy) * 0.24),
    );

    return `scaleX(${scale})`;
  });
  const accentOpacity = useTransform(progress, (latestProgress) => {
    const distance = Math.abs(latestProgress - barPosition);
    return Math.max(0, 1 - distance / 0.095);
  });

  return (
    <span className="waveform-scrollbar-row">
      <motion.span className="waveform-scrollbar-bar" style={{ transform }} />
      <motion.span
        className="waveform-scrollbar-bar waveform-scrollbar-bar-active"
        style={{ opacity: accentOpacity, transform }}
      />
    </span>
  );
}

export function WaveformScrollScrubber({ lenis }: WaveformScrollScrubberProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const latestPreviewScrollRef = useRef({ position: 0, limit: 0 });
  const previewScrollMappingRef = useRef<PreviewScrollMapping | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const resizeFrameRef = useRef<number | null>(null);
  const keyboardScrollUntilRef = useRef(0);
  const previewSectionRef = useRef<PageSectionId>(PAGE_SECTIONS[0].id);
  const pointerActiveRef = useRef(false);
  const previousNativeScrollRef = useRef({ position: 0, time: 0 });
  const [activeSection, setActiveSection] = useState<PageSectionId>(PAGE_SECTIONS[0].id);
  const [canRenderPreview, setCanRenderPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const rawEnergy = useMotionValue(0);
  const energy = useSpring(rawEnergy, {
    stiffness: 300,
    damping: 32,
    mass: 0.3,
  });

  const updateActiveSection = useCallback(
    (scrollPosition: number, scrollLimit: number) => {
      if (scrollLimit > 0 && scrollPosition >= scrollLimit - 1) {
        const lastSection = PAGE_SECTIONS[PAGE_SECTIONS.length - 1].id;
        setActiveSection(lastSection);
        return lastSection;
      }

      const readingLine = window.innerHeight * 0.38;
      let nextSection: PageSectionId = PAGE_SECTIONS[0].id;

      for (const section of PAGE_SECTIONS) {
        const element = document.getElementById(section.id);
        if (!element || element.getBoundingClientRect().top > readingLine) break;
        nextSection = section.id;
      }

      setActiveSection((currentSection) =>
        currentSection === nextSection ? currentSection : nextSection,
      );

      return nextSection;
    },
    [],
  );

  const syncPreview = useCallback(
    (nextScrollPosition: number, parentScrollLimit: number) => {
      latestPreviewScrollRef.current = {
        position: nextScrollPosition,
        limit: parentScrollLimit,
      };

      const previewWindow = previewFrameRef.current?.contentWindow;
      const previewDocument = previewFrameRef.current?.contentDocument;
      const scrollingElement = previewDocument?.scrollingElement;
      if (!previewWindow || !scrollingElement) return;

      const previewLimit = Math.max(
        0,
        scrollingElement.scrollHeight - previewWindow.innerHeight,
      );
      if (previewLimit === 0 || parentScrollLimit === 0) {
        scrollingElement.scrollTop = 0;
        return;
      }

      let mapping = previewScrollMappingRef.current;

      if (
        !mapping ||
        mapping.parentLimit !== parentScrollLimit ||
        mapping.previewLimit !== previewLimit
      ) {
        const sectionAnchors = PAGE_SECTIONS.flatMap((section) => {
          const parentSection = document.getElementById(section.id);
          const previewSection = previewDocument.getElementById(section.id);
          if (!parentSection || !previewSection) return [];

          const parentTop =
            parentSection.getBoundingClientRect().top + window.scrollY;
          const previewTop =
            previewSection.getBoundingClientRect().top + previewWindow.scrollY;

          if (
            parentTop <= 0 ||
            parentTop >= parentScrollLimit ||
            previewTop <= 0 ||
            previewTop >= previewLimit
          ) {
            return [];
          }

          return [{ parent: parentTop, preview: previewTop }];
        });

        mapping = {
          anchors: [
            { parent: 0, preview: 0 },
            ...sectionAnchors,
            { parent: parentScrollLimit, preview: previewLimit },
          ],
          parentLimit: parentScrollLimit,
          previewLimit,
        };
        previewScrollMappingRef.current = mapping;
      }

      const { anchors } = mapping;
      const clampedPosition = Math.min(parentScrollLimit, nextScrollPosition);
      let lowerAnchor = anchors[0];
      let upperAnchor = anchors[anchors.length - 1];

      for (let index = 1; index < anchors.length; index += 1) {
        if (anchors[index].parent >= clampedPosition) {
          lowerAnchor = anchors[index - 1];
          upperAnchor = anchors[index];
          break;
        }
      }

      const anchorDistance = upperAnchor.parent - lowerAnchor.parent;
      const segmentProgress =
        anchorDistance > 0
          ? (clampedPosition - lowerAnchor.parent) / anchorDistance
          : 0;
      const previewPosition =
        lowerAnchor.preview +
        (upperAnchor.preview - lowerAnchor.preview) * segmentProgress;

      scrollingElement.scrollTop = previewPosition;
    },
    [],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 900px) and (any-pointer: fine)",
    );
    const syncPreviewAvailability = () => {
      if (!mediaQuery.matches) previewScrollMappingRef.current = null;
      setCanRenderPreview(mediaQuery.matches);
    };

    syncPreviewAvailability();
    mediaQuery.addEventListener("change", syncPreviewAvailability);

    return () => mediaQuery.removeEventListener("change", syncPreviewAvailability);
  }, []);

  const settleEnergy = useCallback(() => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
    }

    settleTimerRef.current = window.setTimeout(() => {
      rawEnergy.set(0);
      settleTimerRef.current = null;
    }, 72);
  }, [rawEnergy]);

  const updateProgress = useCallback(
    (nextProgress: number, velocity = 0, scrollLimit = getNativeScrollLimit()) => {
      const normalizedProgress = scrollLimit > 0 ? clampProgress(nextProgress) : 0;
      const scrollPosition = normalizedProgress * scrollLimit;
      const rangeValue = Math.round(normalizedProgress * RANGE_MAX);
      const percentage = Math.round(normalizedProgress * 100);
      const nextSection = updateActiveSection(scrollPosition, scrollLimit);
      const nextSectionLabel =
        PAGE_SECTIONS.find((section) => section.id === nextSection)?.label ?? "Intro";

      progress.set(normalizedProgress);
      setIsScrollable(scrollLimit > window.innerHeight * 0.25);

      if (!reduceMotion || previewSectionRef.current !== nextSection) {
        previewSectionRef.current = nextSection;
        syncPreview(scrollPosition, scrollLimit);
      } else {
        latestPreviewScrollRef.current = {
          position: scrollPosition,
          limit: scrollLimit,
        };
      }

      if (inputRef.current) {
        if (inputRef.current.value !== String(rangeValue)) {
          inputRef.current.value = String(rangeValue);
        }
        inputRef.current.setAttribute(
          "aria-valuetext",
          `${percentage} percent scrolled, ${nextSectionLabel} section`,
        );
      }

      const suppressEnergy =
        reduceMotion || performance.now() < keyboardScrollUntilRef.current;

      if (suppressEnergy) {
        rawEnergy.set(0);
        return;
      }

      rawEnergy.set(Math.min(1, Math.abs(velocity) / 18));
      settleEnergy();
    },
    [
      progress,
      rawEnergy,
      reduceMotion,
      settleEnergy,
      syncPreview,
      updateActiveSection,
    ],
  );

  useEffect(() => {
    const handleKeyboardScroll = (event: KeyboardEvent) => {
      if (
        SCROLL_KEYS.has(event.code) &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        keyboardScrollUntilRef.current = performance.now() + 240;
        rawEnergy.set(0);
      }
    };

    window.addEventListener("keydown", handleKeyboardScroll);
    return () => window.removeEventListener("keydown", handleKeyboardScroll);
  }, [rawEnergy]);

  useEffect(() => {
    const syncFromNativeScroll = () => {
      const scrollLimit = getNativeScrollLimit();
      const position = window.scrollY;
      const now = performance.now();
      const elapsed = Math.max(16, now - previousNativeScrollRef.current.time);
      const velocity =
        previousNativeScrollRef.current.time === 0
          ? 0
          : ((position - previousNativeScrollRef.current.position) / elapsed) * 16;

      previousNativeScrollRef.current = { position, time: now };
      updateProgress(scrollLimit > 0 ? position / scrollLimit : 0, velocity, scrollLimit);
    };

    const syncFromLenis = (instance: Lenis) => {
      updateProgress(instance.progress, instance.velocity, instance.limit);
    };

    const syncDimensions = () => {
      if (resizeFrameRef.current !== null) return;

      resizeFrameRef.current = window.requestAnimationFrame(() => {
        resizeFrameRef.current = null;
        previewScrollMappingRef.current = null;
        lenis?.resize();

        if (lenis) {
          updateProgress(lenis.progress, 0, lenis.limit);
        } else {
          syncFromNativeScroll();
        }
      });
    };

    const resizeObserver = new ResizeObserver(syncDimensions);
    resizeObserver.observe(document.body);
    window.addEventListener("resize", syncDimensions, { passive: true });

    if (lenis) {
      lenis.on("scroll", syncFromLenis);
      syncFromLenis(lenis);
    } else {
      window.addEventListener("scroll", syncFromNativeScroll, { passive: true });
      syncFromNativeScroll();
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncDimensions);
      window.removeEventListener("scroll", syncFromNativeScroll);
      lenis?.off("scroll", syncFromLenis);

      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
    };
  }, [lenis, updateProgress]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }
    };
  }, []);

  const scrollToProgress = useCallback(
    (nextProgress: number) => {
      const normalizedProgress = clampProgress(nextProgress);
      const scrollLimit = lenis?.limit ?? getNativeScrollLimit();
      const target = normalizedProgress * scrollLimit;

      progress.set(normalizedProgress);

      if (lenis) {
        lenis.scrollTo(target, { immediate: true });
      } else {
        const scrollingElement = document.scrollingElement;
        if (scrollingElement) scrollingElement.scrollTop = target;
      }
    },
    [lenis, progress],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextProgress = Number(event.currentTarget.value) / RANGE_MAX;

    if (!pointerActiveRef.current) {
      keyboardScrollUntilRef.current = performance.now() + 240;
      rawEnergy.set(0);
    }

    scrollToProgress(nextProgress);
  };

  const handlePointerDown = (event: PointerEvent<HTMLInputElement>) => {
    if (!event.isPrimary) return;
    pointerActiveRef.current = true;
    setIsDragging(true);
  };

  const endPointerInteraction = () => {
    pointerActiveRef.current = false;
    setIsDragging(false);
  };

  const activeSectionMeta =
    PAGE_SECTIONS.find((section) => section.id === activeSection) ?? PAGE_SECTIONS[0];

  return (
    <div
      className="waveform-scrollbar"
      data-dragging={isDragging}
      data-scrollable={isScrollable}
      data-slot="waveform-scrollbar"
    >
      <input
        ref={inputRef}
        aria-controls="main-content"
        aria-label="Page scroll position"
        aria-orientation="vertical"
        aria-valuetext="0 percent scrolled"
        className="waveform-scrollbar-range"
        defaultValue={0}
        max={RANGE_MAX}
        min={0}
        onBlur={endPointerInteraction}
        onChange={handleChange}
        onLostPointerCapture={endPointerInteraction}
        onPointerCancel={endPointerInteraction}
        onPointerDown={handlePointerDown}
        onPointerUp={endPointerInteraction}
        step={1}
        type="range"
      />

      <div className="waveform-scrollbar-shell" aria-hidden="true">
        <div className="waveform-scrollbar-bars">
          {BAR_PROFILE.map((baseScale, index) => (
            <WaveformBar
              key={`${index}-${baseScale}`}
              baseScale={baseScale}
              energy={energy}
              index={index}
              progress={progress}
            />
          ))}
        </div>
      </div>

      <div className="waveform-scrollbar-preview" aria-hidden="true" inert>
        <div className="waveform-scrollbar-preview-viewport">
          {canRenderPreview ? (
            <iframe
              ref={previewFrameRef}
              aria-hidden="true"
              className="waveform-scrollbar-preview-frame"
              onLoad={() => {
                const latestScroll = latestPreviewScrollRef.current;
                previewScrollMappingRef.current = null;
                syncPreview(latestScroll.position, latestScroll.limit);
              }}
              src="/waveform-preview"
              tabIndex={-1}
              title="Current page position preview"
            />
          ) : null}
        </div>
        <div className="waveform-scrollbar-preview-meta">
          <span>{activeSectionMeta.index}</span>
          <strong>{activeSectionMeta.label}</strong>
        </div>
      </div>
    </div>
  );
}
