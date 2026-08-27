"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  type KeyboardInputAction,
} from "@/components/ui/keyboard";

const DEFAULT_THOUGHT = "systems that stay understandable as they grow.";
const MAX_THOUGHT_LENGTH = 140;

export default function KeyboardDemo() {
  const [thought, setThought] = useState(DEFAULT_THOUGHT);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const interactionRef = useRef<HTMLDivElement>(null);
  const hasEditedRef = useRef(false);
  const pendingCaretRef = useRef<number | null>(null);

  const resetThought = useCallback(() => {
    const editor = editorRef.current;
    if (!hasEditedRef.current && document.activeElement !== editor) return;

    hasEditedRef.current = false;
    pendingCaretRef.current = null;
    setThought(DEFAULT_THOUGHT);
    editor?.blur();
  }, []);

  useEffect(() => {
    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && interactionRef.current?.contains(target)) return;
      resetThought();
    };

    document.addEventListener("pointerdown", handleOutsidePointer, true);
    window.addEventListener("scroll", resetThought, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer, true);
      window.removeEventListener("scroll", resetThought);
    };
  }, [resetThought]);

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.style.height = "0px";
    editor.style.height = `${editor.scrollHeight}px`;

    if (pendingCaretRef.current !== null) {
      const caret = pendingCaretRef.current;
      editor.focus({ preventScroll: true });
      editor.setSelectionRange(caret, caret);
      pendingCaretRef.current = null;
    }
  }, [thought]);

  const handleType = useCallback((action: KeyboardInputAction) => {
    const editor = editorRef.current;
    const shouldReplaceSample = !hasEditedRef.current;
    const selectionStart = shouldReplaceSample
      ? 0
      : (editor?.selectionStart ?? 0);
    const selectionEnd = shouldReplaceSample
      ? DEFAULT_THOUGHT.length
      : (editor?.selectionEnd ?? selectionStart);

    hasEditedRef.current = true;

    setThought((currentThought) => {
      const current = shouldReplaceSample ? "" : currentThought;
      const start = shouldReplaceSample ? 0 : selectionStart;
      const end = shouldReplaceSample ? 0 : selectionEnd;

      if (action.type === "insert") {
        const availableCharacters = Math.max(
          0,
          MAX_THOUGHT_LENGTH - (current.length - (end - start)),
        );
        const insertedValue = action.value.slice(0, availableCharacters);
        const next = `${current.slice(0, start)}${insertedValue}${current.slice(end)}`;
        pendingCaretRef.current = start + insertedValue.length;
        return next;
      }

      if (action.type === "backspace") {
        const deleteFrom = start === end ? Math.max(0, start - 1) : start;
        const next = `${current.slice(0, deleteFrom)}${current.slice(end)}`;
        pendingCaretRef.current = deleteFrom;
        return next;
      }

      const deleteTo = start === end ? Math.min(current.length, end + 1) : end;
      const next = `${current.slice(0, start)}${current.slice(deleteTo)}`;
      pendingCaretRef.current = start;
      return next;
    });
  }, []);

  return (
    <div ref={interactionRef} className="about-keyboard-interaction">
      <div className="about-lede">
        <span className="about-lede-prefix">I care about</span>
        <textarea
          ref={editorRef}
          value={thought}
          rows={1}
          maxLength={MAX_THOUGHT_LENGTH}
          inputMode="none"
          spellCheck
          suppressHydrationWarning
          aria-label="What I care about"
          aria-describedby="about-editor-instructions"
          data-keyboard-editor
          className="about-lede-editor"
          onFocus={(event) => {
            if (!hasEditedRef.current) event.currentTarget.select();
          }}
          onClick={(event) => {
            if (!hasEditedRef.current) event.currentTarget.select();
          }}
          onKeyDown={(event) => {
            const isTypingKey =
              event.key.length === 1 ||
              event.key === "Backspace" ||
              event.key === "Delete" ||
              event.key === "Enter";
            if (!event.metaKey && !event.ctrlKey && !event.altKey && isTypingKey) {
              event.preventDefault();
            }
          }}
          onChange={(event) => {
            hasEditedRef.current = true;
            setThought(event.currentTarget.value);
          }}
        />
      </div>
      <span id="about-editor-instructions" className="sr-only">
        Type here or use the keyboard below. Your first keystroke replaces the sample text.
        The sample returns when you click elsewhere or scroll the page.
      </span>
      <div className="about-keyboard-demo">
        <Keyboard
          enableSound
          onType={handleType}
          className="mx-0 [zoom:0.8] sm:[zoom:0.8] md:[zoom:0.65] lg:[zoom:0.72] xl:[zoom:0.72]"
        />
      </div>
    </div>
  );
}
