"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import ArrowUp02Icon from "@hugeicons/core-free-icons/ArrowUp02Icon";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Project } from "@/data/portfolio";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type ChatStatus = "idle" | "submitting" | "streaming" | "error";

const suggestions = [
  "What does this project do?",
  "What’s the tech stack?",
  "What did you build here?",
];

export function ProjectChat({ project }: { project: Project }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState("");
  const nextMessageId = useRef(0);
  const abortController = useRef<AbortController | null>(null);
  const conversationEnd = useRef<HTMLDivElement>(null);

  const isBusy = status === "submitting" || status === "streaming";

  useEffect(() => {
    conversationEnd.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  useEffect(
    () => () => {
      abortController.current?.abort();
    },
    [],
  );

  async function sendMessage(content: string) {
    const question = content.trim();
    if (!question || isBusy) return;

    const userMessage: ChatMessage = {
      id: nextMessageId.current++,
      role: "user",
      content: question,
    };
    const assistantMessage: ChatMessage = {
      id: nextMessageId.current++,
      role: "assistant",
      content: "",
    };
    const requestMessages = [...messages, userMessage]
      .slice(-12)
      .map(({ role, content: messageContent }) => ({ role, content: messageContent }));

    setInput("");
    setError("");
    setStatus("submitting");
    setMessages((current) => [...current, userMessage, assistantMessage]);

    const controller = new AbortController();
    abortController.current = controller;

    try {
      const response = await fetch(`/api/projects/${project.slug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: requestMessages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "The repository assistant could not answer right now.");
      }

      if (!response.body) throw new Error("The repository assistant returned an empty response.");

      setStatus("streaming");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      async function readAnswer(answer = ""): Promise<string> {
        const { done, value } = await reader.read();
        if (done) return answer + decoder.decode();

        const nextAnswer = answer + decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessage.id ? { ...message, content: nextAnswer } : message,
          ),
        );

        return readAnswer(nextAnswer);
      }

      const answer = await readAnswer();
      if (!answer.trim()) throw new Error("The repository assistant returned an empty response.");
      setStatus("idle");
    } catch (caughtError) {
      if (controller.signal.aborted) return;
      setMessages((current) => current.filter((message) => message.id !== assistantMessage.id));
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The repository assistant could not answer right now.",
      );
      setStatus("error");
    } finally {
      if (abortController.current === controller) abortController.current = null;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  return (
    <div className="project-chat">
      <div className="chat-conversation" role="log" aria-live="polite" aria-relevant="additions text">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <h3>Ask about {project.title}</h3>
            <p>The assistant knows this project&apos;s architecture, stack, and implementation.</p>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((message) => (
              <article className={`chat-message chat-message-${message.role}`} key={message.id}>
                <span>{message.role === "user" ? "You" : project.title}</span>
                {message.content ? (
                  <div className="chat-message-content">
                    <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
                  </div>
                ) : (
                  <p className="chat-thinking">Thinking…</p>
                )}
              </article>
            ))}
          </div>
        )}
        <div ref={conversationEnd} />
      </div>

      <div className="chat-composer-shell">
        <div className="chat-suggestions" aria-label="Suggested questions">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)} disabled={isBusy}>
              {suggestion}
            </button>
          ))}
        </div>

        {error && <p className="chat-error" role="alert">{error}</p>}

        <form className="chat-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor={`project-question-${project.slug}`}>
            Ask a question about {project.title}
          </label>
          <textarea
            id={`project-question-${project.slug}`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder={`Ask anything about ${project.title}`}
            rows={1}
            maxLength={3000}
            disabled={isBusy}
          />
          <button type="submit" aria-label="Send question" disabled={!input.trim() || isBusy}>
            <HugeiconsIcon icon={ArrowUp02Icon} size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
