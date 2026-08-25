"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/ArrowUpRight01Icon";
import ArrowUp02Icon from "@hugeicons/core-free-icons/ArrowUp02Icon";
import Github01Icon from "@hugeicons/core-free-icons/Github01Icon";
import Globe02Icon from "@hugeicons/core-free-icons/Globe02Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import Add01Icon from "@hugeicons/core-free-icons/Add01Icon";
import CloudIcon from "@hugeicons/core-free-icons/CloudIcon";
import Linkedin01Icon from "@hugeicons/core-free-icons/Linkedin01Icon";
import Mail01Icon from "@hugeicons/core-free-icons/Mail01Icon";
import Queue01Icon from "@hugeicons/core-free-icons/Queue01Icon";
import {
  SiBetterauth,
  SiBun,
  SiDocker,
  SiExpress,
  SiGooglegemini,
  SiHono,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiReact,
  SiRedis,
  SiSocketdotio,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import type { IconType } from "react-icons";
import { CalBookingButton } from "@/components/cal-booking-button";
import KeyboardDemo from "@/components/keyboard-demo";
import { ThreeDMarquee, type ThreeDMarqueeItem } from "@/components/ui/3d-marquee";
import { FloatingDock, type FloatingDockItem } from "@/components/ui/floating-dock";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { PullCord } from "@/components/pull-cord";
import { WaveformScrollScrubber } from "@/components/waveform-scroll-scrubber";
import contributions from "@/data/contributions.json";
import { experiences, projects, type Project } from "@/data/portfolio";

const INITIAL_VISIBLE_PROJECTS = 4;

const ProjectChat = dynamic(
  () => import("@/components/project-chat").then((module) => module.ProjectChat),
  { ssr: false },
);

const stack = [
  { name: "TypeScript", icon: SiTypescript, color: "#3178c6", tint: "#dcecff" },
  { name: "Node.js", icon: SiNodedotjs, color: "#43853d", tint: "#e0f3dc" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169e1", tint: "#dde5ff" },
  { name: "Redis", icon: SiRedis, color: "#d82c20", tint: "#ffe1dc" },
  { name: "Next.js", icon: SiNextdotjs, color: "#111111", tint: "#e8e4dc" },
  { name: "Express", icon: SiExpress, color: "#111111", tint: "#ece7de" },
  { name: "Prisma", icon: SiPrisma, color: "#2d3748", tint: "#dde6e7" },
  { name: "Socket.IO", icon: SiSocketdotio, color: "#111111", tint: "#e7e1f6" },
  { name: "Bun", icon: SiBun, color: "#b45f4b", tint: "#f5dfcc" },
  { name: "Docker", icon: SiDocker, color: "#2496ed", tint: "#dcefff" },
  { name: "Tailwind", icon: SiTailwindcss, color: "#06b6d4", tint: "#d8f5f8" },
  { name: "Gemini", icon: SiGooglegemini, color: "#7c4dff", tint: "#ece4ff" },
];

const stackMarqueeItems = Array.from({ length: 3 }, (_, repetition) =>
  stack.map(({ name, icon: Icon, color, tint }) => ({
    id: `${name}-${repetition}`,
    label: name,
    ariaHidden: repetition > 0,
    content: (
      <div className="stack-marquee-card" style={{ backgroundColor: tint }}>
        <Icon className="stack-marquee-logo" color={color} aria-hidden="true" />
        <span>{name}</span>
      </div>
    ),
  })),
).flat() satisfies ThreeDMarqueeItem[];

const contactLinks = [
  {
    title: "Email",
    icon: <HugeiconsIcon icon={Mail01Icon} className="h-full w-full" strokeWidth={1.5} />,
    href: "mailto:rudrakshroywork@gmail.com",
  },
  {
    title: "LinkedIn",
    icon: <HugeiconsIcon icon={Linkedin01Icon} className="h-full w-full" strokeWidth={1.5} />,
    href: "https://linkedin.com/in/rudraksh-roy",
    target: "_blank",
    rel: "noreferrer",
  },
  {
    title: "GitHub",
    icon: <HugeiconsIcon icon={Github01Icon} className="h-full w-full" strokeWidth={1.5} />,
    href: "https://github.com/royengg",
    target: "_blank",
    rel: "noreferrer",
  },
  {
    title: "Wabi Sabi",
    icon: <HugeiconsIcon icon={Globe02Icon} className="h-full w-full" strokeWidth={1.5} />,
    href: "https://wabisabi.pics",
    target: "_blank",
    rel: "noreferrer",
  },
] satisfies FloatingDockItem[];

type ProjectTechIcon =
  | { type: "brand"; icon: IconType; color: string }
  | { type: "interface"; icon: IconSvgElement; color: string };

const projectTechIcons: Record<string, ProjectTechIcon> = {
  "Amazon S3": { type: "interface", icon: CloudIcon, color: "#ff6b35" },
  "Better Auth": { type: "brand", icon: SiBetterauth, color: "#f5f5f2" },
  BullMQ: { type: "interface", icon: Queue01Icon, color: "#c8ff58" },
  Bun: { type: "brand", icon: SiBun, color: "#f3dfc4" },
  Express: { type: "brand", icon: SiExpress, color: "#f5f5f2" },
  Gemini: { type: "brand", icon: SiGooglegemini, color: "#8ab4f8" },
  Hono: { type: "brand", icon: SiHono, color: "#ff6d1f" },
  "Next.js": { type: "brand", icon: SiNextdotjs, color: "#f5f5f2" },
  PostgreSQL: { type: "brand", icon: SiPostgresql, color: "#6f9cff" },
  Prisma: { type: "brand", icon: SiPrisma, color: "#dce8f4" },
  React: { type: "brand", icon: SiReact, color: "#61dafb" },
  Redis: { type: "brand", icon: SiRedis, color: "#ff493d" },
  "Socket.IO": { type: "brand", icon: SiSocketdotio, color: "#f5f5f2" },
};

function ProjectTech({ name }: { name: string }) {
  const tech = projectTechIcons[name];
  if (!tech) return null;

  return (
    <span
      className="modal-tech-icon"
      role="group"
      aria-label={name}
      title={name}
    >
      <span className="modal-tech-mark">
        {tech.type === "brand" ? (
          <tech.icon size={20} color={tech.color} aria-hidden="true" />
        ) : (
          <HugeiconsIcon icon={tech.icon} size={21} color={tech.color} strokeWidth={1.7} aria-hidden="true" />
        )}
      </span>
      <span className="modal-tech-label">{name}</span>
    </span>
  );
}

function SectionHeading({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="section-heading">
      <span className="section-index">({index})</span>
      <h2>
        {children}<span className="accent-dot">.</span>
      </h2>
    </div>
  );
}

function ContributionGraph() {
  const days = contributions.days;
  const max = Math.max(...days.map((day) => day.count), 1);
  const monthLabels = useMemo(() => {
    const labels: { name: string; column: number }[] = [];
    let lastMonth = "";
    let lastColumn = -4;
    days.forEach((day, index) => {
      const date = new Date(`${day.date}T00:00:00`);
      const month = date.toLocaleString("en", { month: "short" });
      if (month !== lastMonth && index % 7 < 4) {
        const column = Math.floor(index / 7) + 1;
        const isShortLeadingMonth = index === 0 && date.getDate() > 14;
        if (!isShortLeadingMonth && column - lastColumn >= 3) {
          labels.push({ name: month, column });
          lastColumn = column;
        }
        lastMonth = month;
      }
    });
    return labels;
  }, [days]);

  const levelColor = (count: number) => {
    if (!count) return "var(--color-graph-empty)";
    const ratio = count / max;
    if (ratio < 0.2) return "var(--color-graph-low)";
    if (ratio < 0.42) return "var(--color-graph-medium)";
    if (ratio < 0.68) return "var(--color-graph-high)";
    return "var(--color-graph-peak)";
  };

  return (
    <div
      className="contribution-shell"
      role="group"
      aria-label={`${contributions.total} GitHub contributions in the last year`}
    >
      <div className="contribution-scroller">
        <div className="month-row" aria-hidden="true">
          {monthLabels.map((label) => (
            <span key={`${label.name}-${label.column}`} style={{ gridColumn: label.column }}>
              {label.name}
            </span>
          ))}
        </div>
        <div className="contribution-grid">
          {days.map((day) => (
            <span
              className="contribution-cell"
              key={day.date}
              style={{ backgroundColor: levelColor(day.count) }}
              title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
            />
          ))}
        </div>
      </div>
      <div className="contribution-meta">
        <span>{contributions.total.toLocaleString()} contributions in the last year</span>
        <a href="https://github.com/royengg" target="_blank" rel="noreferrer">
          View profile <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}

function ExperienceRows() {
  const [open, setOpen] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className="experience-list"
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") setHovered(null);
      }}
    >
      {experiences.map((item, index) => {
        const isOpen = open === index;
        const isDimmed = hovered !== null && hovered !== index;

        return (
          <motion.div
            className="experience-item"
            key={item.name}
            onPointerEnter={(event) => {
              if (event.pointerType !== "touch") setHovered(index);
            }}
            animate={{ opacity: isDimmed ? 0.4 : 1 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          >
            <button
              className="experience-trigger"
              onClick={() => setOpen(isOpen ? -1 : index)}
              aria-expanded={isOpen}
            >
              <span className="experience-number">{item.index}</span>
              <span className="experience-name">
                {item.name}<span className="accent-dot">.</span>
              </span>
              <span className="experience-type">{item.type}</span>
              <span className="experience-period">{item.period}</span>
              <motion.span
                className="experience-plus"
                animate={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              >
                <HugeiconsIcon icon={Add01Icon} size={24} strokeWidth={1.5} />
              </motion.span>
            </button>
            {isOpen && (
              <div className="experience-detail">
                <div className="experience-detail-meta">
                  <strong>{item.role}</strong>
                  <span>{item.location}</span>
                </div>
                <p>{item.detail}</p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function ProjectCard({
  project,
  index,
  onOpen,
  preview = false,
}: {
  project: Project;
  index: number;
  onOpen?: () => void;
  preview?: boolean;
}) {
  return (
    <motion.button
      type="button"
      className="project-card"
      style={{ backgroundColor: project.color, color: project.textColor }}
      onClick={onOpen}
      disabled={preview}
      tabIndex={preview ? -1 : undefined}
      aria-hidden={preview || undefined}
    >
      <div className="project-copy">
        <div className="project-meta">
          <span>0{index + 1}</span><span>{project.year}</span>
        </div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="tech-icon-row project-card-stack" aria-label="Technology stack">
          {project.stack.map((item) => <ProjectTech key={item} name={item} />)}
        </div>
      </div>
      <motion.div
        className="project-image-wrap"
        layoutId={preview ? undefined : `image-${project.slug}`}
        transition={{ layout: { duration: 0.28, ease: [0.77, 0, 0.175, 1] } }}
      >
        <Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 760px) 92vw, 680px" />
      </motion.div>
      <span className="project-open" aria-hidden="true">
        <HugeiconsIcon icon={ArrowUpRight01Icon} size={20} strokeWidth={2} />
      </span>
    </motion.button>
  );
}

function ProjectList({
  onOpen,
  onExpand,
}: {
  onOpen: (project: Project) => void;
  onExpand: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const initialProjects = projects.slice(0, INITIAL_VISIBLE_PROJECTS);
  const additionalProjects = projects.slice(INITIAL_VISIBLE_PROJECTS);
  const nextProject = additionalProjects[0];
  const hasMoreProjects = additionalProjects.length > 0;
  const revealProjects = () => {
    setIsExpanded(true);
    requestAnimationFrame(onExpand);
  };

  return (
    <div className="project-list">
      {initialProjects.map((project, index) => (
        <ProjectCard
          key={project.slug}
          project={project}
          index={index}
          onOpen={() => onOpen(project)}
        />
      ))}

      {hasMoreProjects && !isExpanded && nextProject ? (
        <div className="project-reveal">
          <div className="project-reveal-preview" aria-hidden="true" inert>
            <ProjectCard
              project={nextProject}
              index={INITIAL_VISIBLE_PROJECTS}
              preview
            />
          </div>
          <div className="project-reveal-mask" aria-hidden="true" />
          <button
            type="button"
            className="project-reveal-button"
            onClick={revealProjects}
            aria-expanded={isExpanded}
            aria-controls="additional-projects"
          >
            <span>View more</span>
          </button>
        </div>
      ) : null}

      <div
        id="additional-projects"
        className="project-additional"
        hidden={!isExpanded}
      >
        {isExpanded
          ? additionalProjects.map((project, index) => (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, transform: "translateY(16px)" }}
                animate={{ opacity: 1, transform: "translateY(0)" }}
                transition={{
                  duration: 0.24,
                  delay: Math.min(index * 0.04, 0.12),
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <ProjectCard
                  project={project}
                  index={index + INITIAL_VISIBLE_PROJECTS}
                  onOpen={() => onOpen(project)}
                />
              </motion.div>
            ))
          : null}
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"details" | "chat">("details");
  const [hasOpenedChat, setHasOpenedChat] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const selectTab = (tab: "details" | "chat") => {
    setActiveTab(tab);
    if (tab === "chat") setHasOpenedChat(true);
  };

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;
    const background = document.querySelectorAll<HTMLElement>(".site-shell, .site-footer");
    background.forEach((element) => element.setAttribute("inert", ""));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      background.forEach((element) => element.removeAttribute("inert"));
      previousFocus.current?.focus();
    };
  }, [onClose]);

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <motion.div
        ref={modalRef}
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} project details and repository chat`}
        initial={{ opacity: 0, transform: "translateY(18px) scale(0.96)" }}
        animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
        exit={{ opacity: 0, transform: "translateY(8px) scale(0.98)" }}
        transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
      >
        <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close project details and chat">
          <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.5} />
        </button>
        <div className="modal-visual" style={{ backgroundColor: project.color }}>
          <motion.div
            className="modal-image"
            layoutId={`image-${project.slug}`}
            transition={{ layout: { duration: 0.28, ease: [0.77, 0, 0.175, 1] } }}
          >
            <Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 800px) 92vw, 45vw" />
          </motion.div>
        </div>
        <div className="modal-panel">
          <div className="modal-tabs" role="tablist" aria-label="Project view">
            {(["details", "chat"] as const).map((tab) => (
              <button
                key={tab}
                id={`${project.slug}-${tab}-tab`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`${project.slug}-${tab}-panel`}
                tabIndex={activeTab === tab ? 0 : -1}
                onClick={() => selectTab(tab)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                  event.preventDefault();
                  const nextTab = tab === "details" ? "chat" : "details";
                  selectTab(nextTab);
                  modalRef.current
                    ?.querySelector<HTMLButtonElement>(`#${project.slug}-${nextTab}-tab`)
                    ?.focus();
                }}
              >
                {tab === "details" ? "Details" : "Chat"}
              </button>
            ))}
          </div>

          <div
            className="modal-content"
            id={`${project.slug}-details-panel`}
            role="tabpanel"
            aria-labelledby={`${project.slug}-details-tab`}
            hidden={activeTab !== "details"}
          >
            <span className="modal-eyebrow">{project.category} · {project.year}</span>
            <h2>{project.title}<span className="accent-dot">.</span></h2>
            <p className="modal-lede">{project.description}</p>
            <div className="modal-block">
              <h3>Architecture &amp; build</h3>
              <ul>{project.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="tech-icon-row modal-stack" aria-label="Technology stack">
              {project.stack.map((item) => <ProjectTech key={item} name={item} />)}
            </div>
            <div className="modal-links">
              <a href={project.github} target="_blank" rel="noreferrer"><HugeiconsIcon icon={Github01Icon} size={18} strokeWidth={1.5} /> Repository</a>
              {project.live && <a href={project.live} target="_blank" rel="noreferrer"><HugeiconsIcon icon={Globe02Icon} size={18} strokeWidth={1.5} /> Live project</a>}
            </div>
          </div>

          <div
            className="project-chat-panel"
            id={`${project.slug}-chat-panel`}
            role="tabpanel"
            aria-labelledby={`${project.slug}-chat-tab`}
            hidden={activeTab !== "chat"}
          >
            {hasOpenedChat ? <ProjectChat project={project} /> : null}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

type PortfolioProps = {
  isWaveformPreview?: boolean;
};

export default function Portfolio({ isWaveformPreview = false }: PortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const reduceMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  const refreshScrollDimensions = useCallback(() => {
    lenisRef.current?.resize();
  }, []);

  useEffect(() => {
    if (reduceMotion || isWaveformPreview) return;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    const publishFrame = requestAnimationFrame(() => setLenisInstance(lenis));
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(publishFrame);
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, [isWaveformPreview, reduceMotion]);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main-content">Skip to content</a>
      {isWaveformPreview ? null : <PullCord />}
      <main
        id="main-content"
        className="site-shell"
        data-waveform-preview={isWaveformPreview || undefined}
      >
        {isWaveformPreview ? null : <WaveformScrollScrubber lenis={lenisInstance} />}
        <section id="intro" className="hero">
          <div className="availability"><span /> Available for backend &amp; full-stack work</div>
          <p className="hero-kicker">Namaste, I&apos;m</p>
          <h1>Rudraksh Roy<span className="accent-dot">.</span></h1>
          <p className="hero-role">Backend engineer with a full-stack habit.</p>
          <p className="hero-intro">
            I build dependable products from the data model outward—APIs, realtime systems, queues, caches, and the interfaces that make all of it useful.
          </p>
          <div className="hero-links">
            <MagneticButton className="rounded-full">
              <a href="#work">See selected work <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} strokeWidth={2} /></a>
            </MagneticButton>
            <MagneticButton className="rounded-full">
              <a href="https://github.com/royengg" target="_blank" rel="noreferrer">GitHub <HugeiconsIcon icon={Github01Icon} size={16} strokeWidth={1.5} /></a>
            </MagneticButton>
            <CalBookingButton />
          </div>
        </section>

        <section id="about" className="section about-section">
          <SectionHeading index="01">about</SectionHeading>
          <div className="about-grid">
            <div className="about-lede-column">
              <KeyboardDemo />
            </div>
            <div className="about-body">
              <p>My work sits where product thinking meets backend engineering. I enjoy turning complicated workflows into clear contracts, predictable state, and interfaces that feel surprisingly simple.</p>
              <p>Recently, that has meant realtime auctions, queued AI analysis, document pipelines, community products, and production deployment across modern TypeScript stacks.</p>
            </div>
          </div>
        </section>

        <section id="stack" className="section stack-section">
          <SectionHeading index="02">stack</SectionHeading>
          <p className="section-note">Tools I reach for when reliability, speed, and clarity matter.</p>
          <div className="stack-marquee-frame">
            <ThreeDMarquee
              ariaLabel="Technology stack"
              className="stack-marquee"
              items={stackMarqueeItems}
            />
          </div>
        </section>

        <section id="open-source" className="section github-section">
          <SectionHeading index="03">open source</SectionHeading>
          <ContributionGraph />
        </section>

        <section id="experience" className="section experience-section">
          <SectionHeading index="04">experience</SectionHeading><ExperienceRows />
        </section>

        <section id="work" className="section projects-section">
          <SectionHeading index="05">projects</SectionHeading>
          <p className="section-note">Selected systems, shown from the inside out. Click any card to explore the build.</p>
          <ProjectList onOpen={setSelectedProject} onExpand={refreshScrollDimensions} />
        </section>

        <section id="contact" className="section contact-section">
          <SectionHeading index="06">contact</SectionHeading>
          <p className="contact-lede">Have a difficult backend problem or a product that needs to become real?</p>
          <nav className="contact-dock" aria-label="Contact links">
            <FloatingDock
              desktopClassName="contact-dock-desktop"
              mobileClassName="contact-dock-mobile"
              items={contactLinks}
            />
          </nav>
          <p className="contact-note">Based in Kolkata · Open to thoughtful engineering work</p>
        </section>
      </main>

      <footer className="site-footer">
        <span>Rudraksh Roy · {new Date().getFullYear()}</span><a href="#main-content">Back to top <HugeiconsIcon icon={ArrowUp02Icon} size={14} strokeWidth={1.5} /></a>
      </footer>

      <AnimatePresence initial={false}>{selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}</AnimatePresence>
    </MotionConfig>
  );
}
