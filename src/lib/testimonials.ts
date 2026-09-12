export const noteColors = ["PAPER", "YELLOW", "SAGE", "ROSE"] as const;
export type NoteColor = (typeof noteColors)[number];
export const noteColorLabels: Record<NoteColor, string> = {
  PAPER: "Paper",
  YELLOW: "Butter",
  SAGE: "Sage",
  ROSE: "Rose",
};

export type PublicNote = {
  id: string;
  name: string;
  message: string;
  context: string | null;
  color: NoteColor;
  x: number;
  y: number;
  rotation: number;
};

export type NoteSubmission = Omit<PublicNote, "id" | "rotation"> & {
  submissionKey: string;
};

export class BoardError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

function boundedText(value: unknown, label: string, min: number, max: number) {
  if (typeof value !== "string") throw new BoardError(`${label} is required.`);
  const text = value.trim();
  if (text.length < min || text.length > max) {
    throw new BoardError(`${label} must be ${min}–${max} characters.`);
  }
  return text;
}

export function parseSubmission(value: unknown): NoteSubmission {
  if (!value || typeof value !== "object")
    throw new BoardError("Please write a note first.");
  const input = value as Record<string, unknown>;
  if (input.website) throw new BoardError("Unable to submit this note.");
  const name = boundedText(input.name, "Your name", 2, 60);
  const message = boundedText(input.message, "Your note", 1, 280);
  const context = input.context
    ? boundedText(input.context, "Context", 0, 80)
    : null;
  if (
    typeof input.submissionKey !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      input.submissionKey,
    )
  ) {
    throw new BoardError("Please reopen the note and try again.");
  }
  if (!noteColors.includes(input.color as NoteColor))
    throw new BoardError("Choose a paper color.");
  for (const key of ["x", "y"] as const) {
    if (
      typeof input[key] !== "number" ||
      !Number.isFinite(input[key]) ||
      input[key] < 0 ||
      input[key] > 1
    ) {
      throw new BoardError("That position is outside the board.");
    }
  }
  return {
    name,
    message,
    context,
    color: input.color as NoteColor,
    x: input.x as number,
    y: input.y as number,
    submissionKey: input.submissionKey,
  };
}

export const NOTES_PER_PAGE = 6;
