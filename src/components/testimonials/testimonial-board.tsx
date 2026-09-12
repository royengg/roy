"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { NOTES_PER_PAGE, type PublicNote } from "@/lib/testimonials";
import { TestimonialNote } from "./testimonial-note";
import {
  TestimonialComposer,
  type ComposerProps,
} from "./testimonial-composer";

type Point = { x: number; y: number };
type NoteNode = Node<
  { note: PublicNote; onRead: (note: PublicNote) => void },
  "note"
>;
type DraftNode = Node<ComposerProps, "draft">;
type BoardNode = NoteNode | DraftNode;
const NOTE_WIDTH = 204;
const NOTE_HEIGHT = 250;
const PUBLISHED_NOTE_HEIGHT = 226;
const NOTE_SLOT_WIDTH = 248;
const INSET = 16;

function PaperNode({ data }: NodeProps<NoteNode>) {
  return (
    <div
      className="board-note-button nodrag nopan"
      role="button"
      tabIndex={0}
      aria-label={`Read note from ${data.note.name}`}
      onClick={() => data.onRead(data.note)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          data.onRead(data.note);
        }
      }}
    >
      <TestimonialNote note={data.note} compact />
    </div>
  );
}
function Draft({ data }: NodeProps<DraftNode>) {
  return <TestimonialComposer {...data} />;
}
const nodeTypes = { note: PaperNode, draft: Draft };

export function TestimonialBoard({
  staticMode = false,
  onResize,
}: {
  staticMode?: boolean;
  onResize?: () => void;
}) {
  const [notes, setNotes] = useState<PublicNote[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [accepting, setAccepting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [position, setPosition] = useState<Point | null>(null);
  const [draftVersion, setDraftVersion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState<PublicNote | null>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const frame = useRef<HTMLDivElement>(null);
  const columns = Math.min(
    3,
    Math.max(1, Math.floor((size.width - INSET * 2 + 24) / NOTE_SLOT_WIDTH)),
  );
  const pageSize = Math.min(NOTES_PER_PAGE, columns * 2);

  useEffect(() => {
    let active = true;
    let inView = false;
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch(
          `/api/testimonials?page=${page}&size=${pageSize}`,
          {
            signal: controller.signal,
          },
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (active) {
          setNotes((previous) =>
            JSON.stringify(previous) === JSON.stringify(data.notes)
              ? previous
              : data.notes,
          );
          setTotal(data.total);
          setAccepting(data.accepting);
          setLoading(false);
          setError("");
          // Recover if moderation removed the last note on this page.
          if (page > 0 && page * pageSize >= data.total)
            setPage(Math.max(0, Math.ceil(data.total / pageSize) - 1));
        }
      } catch (error) {
        if (active && !controller.signal.aborted) {
          setLoading(false);
          setError(
            error instanceof Error
              ? error.message
              : "Could not load the board.",
          );
        }
      }
    };
    void load();
    if (staticMode)
      return () => {
        active = false;
        controller.abort();
      };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    if (frame.current) observer.observe(frame.current);
    const refresh = () => {
      if (document.visibilityState === "visible" && inView) void load();
    };
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      controller.abort();
      observer.disconnect();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [page, pageSize, staticMode]);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      setSize({ width: element.clientWidth, height: element.clientHeight });
      onResize?.();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [onResize]);

  const closeDraft = useCallback(() => {
    setPosition(null);
    setDragging(false);
    document
      .querySelector<HTMLElement>("#kind-words .testimonial-board")
      ?.focus({ preventScroll: true });
  }, []);
  // Store positions as a fraction of usable board space, so notes stay on-board
  // at every viewport size. Only overlapping approved cards use free slots.
  const extent = useMemo(
    () => ({
      x: Math.max(1, size.width - NOTE_WIDTH - INSET * 2),
      y: Math.max(1, size.height - NOTE_HEIGHT - INSET * 2),
    }),
    [size],
  );
  const nodes: BoardNode[] = useMemo(() => {
    const visible = notes.slice(0, pageSize);
    const preferred = visible.map((note) => ({
      x: INSET + note.x * extent.x,
      y: INSET + note.y * extent.y,
    }));
    const overlaps = preferred.some((a, i) =>
      preferred.some(
        (b, j) =>
          i < j &&
          Math.abs(a.x - b.x) < NOTE_WIDTH + 20 &&
          Math.abs(a.y - b.y) < PUBLISHED_NOTE_HEIGHT + 20,
      ),
    );
    const slots = Array.from({ length: pageSize }, (_, i) => ({
      x:
        INSET +
        (columns === 1
          ? extent.x / 2
          : ((i % columns) * extent.x) / (columns - 1)),
      y: INSET + Math.floor(i / columns) * extent.y,
    }));
    const positions = overlaps
      ? preferred.map((point) => {
          let closest = 0;
          slots.forEach((slot, index) => {
            if (
              Math.hypot(slot.x - point.x, slot.y - point.y) <
              Math.hypot(slots[closest].x - point.x, slots[closest].y - point.y)
            )
              closest = index;
          });
          return slots.splice(closest, 1)[0];
        })
      : preferred;
    const placed: BoardNode[] = visible.map((note, index) => ({
      id: note.id,
      type: "note",
      data: { note, onRead: setReading },
      position: positions[index],
      width: NOTE_WIDTH,
      height: PUBLISHED_NOTE_HEIGHT,
      draggable: false,
      focusable: false,
      // Read-only canvas nodes still contain interactive controls.
      // React Flow otherwise disables hit-testing when selection/dragging are off.
      style: { pointerEvents: "auto" },
    }));
    if (position)
      placed.push({
        id: `draft-${draftVersion}`,
        type: "draft",
        data: {
          position,
          onClose: closeDraft,
          onBusyChange: setSubmitting,
        },
        width: NOTE_WIDTH,
        height: NOTE_HEIGHT,
        position: {
          x: INSET + position.x * extent.x,
          y: INSET + position.y * extent.y,
        },
        draggable: !staticMode,
        dragging,
        dragHandle: '.sticky-composer[data-draggable="true"]',
        extent: [
          [INSET, INSET],
          [size.width - INSET, size.height - INSET],
        ],
        focusable: false,
        style: { pointerEvents: "auto" },
        zIndex: 1000,
      });
    return placed;
  }, [
    notes,
    extent,
    position,
    draftVersion,
    closeDraft,
    columns,
    pageSize,
    dragging,
    staticMode,
    size,
  ]);

  const add = (point: Point) => {
    if (staticMode || submitting) return;
    if (!accepting) {
      setError(
        loading
          ? "The board is loading. Try again in a moment."
          : "New notes are temporarily paused.",
      );
      return;
    }
    // Remount only for a new empty-space click, never for a drag or resize.
    // This resets text, validation, animation, and the submission identity.
    setDraftVersion((version) => version + 1);
    setDragging(false);
    setPosition(point);
  };

  return (
    <div className="testimonials">
      <div className="board-assembly">
        <div
          className="testimonial-board"
          ref={frame}
          tabIndex={staticMode ? -1 : 0}
          aria-busy={loading}
          role="group"
          aria-label="Whiteboard. Click an empty space, or press Enter, to write a sticky note."
          onKeyDown={(event) => {
            if (
              event.target === event.currentTarget &&
              (event.key === "Enter" || event.key === " ")
            ) {
              event.preventDefault();
              add({ x: 0.5, y: 0.5 });
            }
          }}
        >
          <svg
            className="board-wipe-marks"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g fill="none" stroke="currentColor" strokeLinecap="round">
              <path
                d="M26 38 Q88 30 152 39 M32 43 Q96 36 167 44 M24 48 Q88 42 136 48"
                strokeWidth="3"
              />
              <path
                d="M930 83 Q961 120 947 155 M937 88 Q966 124 952 161"
                strokeWidth="2"
              />
              <path
                d="M775 554 Q860 541 965 551 M802 560 Q883 549 959 556 M842 566 L936 561"
                strokeWidth="4"
              />
            </g>
          </svg>
          <ReactFlow<BoardNode>
            nodes={nodes}
            edges={[]}
            nodeTypes={nodeTypes}
            onNodesChange={(changes) => {
              for (const change of changes) {
                if (
                  change.type !== "position" ||
                  change.id !== `draft-${draftVersion}`
                )
                  continue;
                if (change.position) {
                  const point = change.position;
                  setPosition(
                    (current) =>
                      current && {
                        x: Math.max(
                          0,
                          Math.min(1, (point.x - INSET) / extent.x),
                        ),
                        y: Math.max(
                          0,
                          Math.min(1, (point.y - INSET) / extent.y),
                        ),
                      },
                  );
                }
                if (change.dragging !== undefined) setDragging(change.dragging);
              }
            }}
            nodesDraggable={false}
            autoPanOnNodeDrag={false}
            nodesConnectable={false}
            elementsSelectable={false}
            deleteKeyCode={null}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            minZoom={1}
            maxZoom={1}
            autoPanOnNodeFocus={false}
            proOptions={{ hideAttribution: true }}
            onPaneClick={(event) => {
              const rect = frame.current!.getBoundingClientRect();
              add({
                x: Math.max(
                  0,
                  Math.min(1, (event.clientX - rect.left - INSET) / extent.x),
                ),
                y: Math.max(
                  0,
                  Math.min(1, (event.clientY - rect.top - INSET) / extent.y),
                ),
              });
            }}
          />
        </div>
        <div className="board-tray" aria-hidden="true">
          <span className="board-marker">
            <span />
          </span>
        </div>
      </div>
      {total > pageSize && (
        <div className="board-pagination">
          <button
            aria-label="Previous notes"
            disabled={page === 0 || !!position}
            onClick={() => setPage((p) => p - 1)}
          >
            ←
          </button>
          <span>
            {page + 1} / {Math.ceil(total / pageSize)}
          </span>
          <button
            aria-label="Next notes"
            disabled={(page + 1) * pageSize >= total || !!position}
            onClick={() => setPage((p) => p + 1)}
          >
            →
          </button>
        </div>
      )}
      {error && (
        <p className="board-error" role="status">
          {error}
        </p>
      )}
      {reading && (
        <NoteReader note={reading} onClose={() => setReading(null)} />
      )}
    </div>
  );
}

function NoteReader({
  note,
  onClose,
}: {
  note: PublicNote;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="note-dialog note-reader"
      aria-label={`Note from ${note.name}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div data-lenis-prevent>
        <TestimonialNote note={note} preview />
        <button className="board-button" onClick={onClose}>
          Close
        </button>
      </div>
    </dialog>
  );
}
