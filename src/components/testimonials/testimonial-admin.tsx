"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { TestimonialNote } from "./testimonial-note";
import type { PublicNote } from "@/lib/testimonials";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
type ReviewNote = PublicNote & {
  status: ReviewStatus;
  updatedAt: string;
  createdAt: string;
};
const labels: Record<ReviewStatus, string> = {
  PENDING: "Waiting for you",
  APPROVED: "On the board",
  REJECTED: "Not published",
};

export function TestimonialAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<ReviewStatus>("PENDING");
  const [notes, setNotes] = useState<ReviewNote[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const response = await fetch(`/api/admin/testimonials?status=${status}`);
    const data = await response.json();
    if (response.status === 401) setAuthenticated(false);
    if (!response.ok) throw new Error(data.error);
    setNotes(data.notes);
  }, [status]);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => setAuthenticated(response.ok))
      .catch(() => setError("Could not check your session."))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const controller = new AbortController();
    fetch(`/api/admin/testimonials?status=${status}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 401) setAuthenticated(false);
        if (!response.ok) throw new Error(data.error);
        setNotes(data.notes);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, [authenticated, status]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy("login");
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPassword("");
      setAuthenticated(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setBusy(null);
    }
  }

  async function review(note: ReviewNote, nextStatus: ReviewStatus) {
    setBusy(note.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: note.id,
          updatedAt: note.updatedAt,
          status: nextStatus,
          x: note.x,
          y: note.y,
        }),
      });
      const data = await response.json();
      if (response.status === 401) setAuthenticated(false);
      if (!response.ok) throw new Error(data.error);
      setNotice(
        nextStatus === "APPROVED"
          ? "Approved. This note is now on the board."
          : nextStatus === "PENDING"
            ? "Moved back to review. It is no longer public."
            : "Not published. This note is private.",
      );
      await load();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not save the review.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    setBusy("logout");
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok)
        throw new Error("Could not sign out. Please try again.");
      setAuthenticated(false);
      setNotes([]);
      setNotice("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign out.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="board-admin">
      <Link className="board-back" href="/#kind-words">
        ← Back to the portfolio
      </Link>
      <div className="admin-heading">
        <div>
          <span className="board-eyebrow">THE KIND WORDS BOARD / OWNER</span>
          <h1>
            A little mail
            <br />
            for you, Roy.
          </h1>
          <p>Read it. Keep it. Give it a place on the board.</p>
        </div>
        {authenticated && (
          <button className="board-button" disabled={!!busy} onClick={logout}>
            Sign out
          </button>
        )}
      </div>
      {checking ? (
        <p role="status">Checking your session…</p>
      ) : !authenticated ? (
        <form className="admin-login" onSubmit={login}>
          <h2>Just for you.</h2>
          <p>Sign in to approve notes before anyone else sees them.</p>
          <label className="board-field">
            Owner password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            className="board-button board-button-primary"
            disabled={!!busy}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <>
          <div className="admin-tabs" aria-label="Filter notes">
            {(Object.keys(labels) as ReviewStatus[]).map((value) => (
              <button
                key={value}
                className="board-button"
                aria-pressed={status === value}
                onClick={() => {
                  setStatus(value);
                  setError("");
                  setNotice("");
                }}
              >
                {labels[value]}
              </button>
            ))}
            <button
              className="board-button"
              onClick={() =>
                void load().catch((error) => setError(error.message))
              }
            >
              Refresh
            </button>
          </div>
          {!notes.length && (
            <div className="admin-empty">
              <h2>All quiet here.</h2>
              <p>
                {status === "PENDING"
                  ? "New notes will arrive here, ready for your approval."
                  : "There are no notes in this collection yet."}
              </p>
            </div>
          )}
          <div className="admin-note-grid">
            {notes.map((note) => (
              <div className="admin-note" key={note.id}>
                <TestimonialNote note={note} preview />
                <span className="admin-note-date">
                  Received{" "}
                  {new Date(note.createdAt).toLocaleDateString("en", {
                    dateStyle: "medium",
                  })}
                </span>
                <details className="admin-placement">
                  <summary>Placement on the board</summary>
                  {(["x", "y"] as const).map((axis) => (
                    <label className="board-field" key={axis}>
                      {axis === "x" ? "Left to right" : "Top to bottom"}
                      <input
                        aria-label={`${note.name}: ${axis} position`}
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={note[axis]}
                        onChange={(event) =>
                          setNotes((list) =>
                            list.map((item) =>
                              item.id === note.id
                                ? {
                                    ...item,
                                    [axis]: Number(event.target.value),
                                  }
                                : item,
                            ),
                          )
                        }
                      />
                    </label>
                  ))}
                  <small>
                    Positions adapt to each screen; overlapping notes use the
                    nearest free space.
                  </small>
                </details>
                <div className="admin-note-actions">
                  {note.status !== "APPROVED" && (
                    <button
                      className="board-button board-button-primary"
                      disabled={!!busy}
                      onClick={() => review(note, "APPROVED")}
                    >
                      Approve
                    </button>
                  )}
                  {note.status === "APPROVED" && (
                    <>
                      <button
                        className="board-button"
                        disabled={!!busy}
                        onClick={() => review(note, "APPROVED")}
                      >
                        Save placement
                      </button>
                      <button
                        className="board-button"
                        disabled={!!busy}
                        onClick={() => review(note, "PENDING")}
                      >
                        Unpublish
                      </button>
                    </>
                  )}
                  {note.status !== "REJECTED" && (
                    <button
                      className="board-button"
                      disabled={!!busy}
                      onClick={() => review(note, "REJECTED")}
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {notes.length === 100 && (
            <p className="note-consent">
              Showing the oldest 100 notes. Review these to see the next batch.
            </p>
          )}
        </>
      )}
      {notice && (
        <p className="admin-notice" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="board-error" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
