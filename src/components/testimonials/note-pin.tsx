/** Decorative only: pointer events pass through to the paper's drag handle. */
export function NotePin() {
  return (
    <svg
      className="note-pin"
      viewBox="0 0 32 38"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="19" cy="31" rx="8" ry="3" fill="#30231b" opacity="0.16" />
      <path d="M16 21 15 33 18 30 19 21" fill="#7e8582" />
      <path d="m16 23-1 10 2-4 1-6" fill="#e5e9e4" />
      <path d="M12 12h9l-1 8 5 5c1 4-18 4-18 0l6-5Z" fill="#a52d25" />
      <path
        d="m13 13 3 1-1 8-5 3c3 1 8 2 12 0-1 3-12 3-13 0l5-5Z"
        fill="#db5140"
      />
      <ellipse cx="16" cy="12" rx="10" ry="7" fill="#9e3028" />
      <ellipse cx="16" cy="10" rx="10" ry="6" fill="#d94a3b" />
      <path
        d="M9 10c0-3 7-5 11-2"
        fill="none"
        stroke="#f99c7d"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
