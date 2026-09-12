# What people say about me

Branch: `feat/testimonial-board`, based on main at `8f3aa9a`.
Delivery is local only: no remote push or Vercel deployment without a new request.

## Confirmed design

- Existing section heading before Contact; no introductory sentence, invitation,
  empty-state illustration, extra labels, or “Leave a note” button.
- A soft chalk-white classroom board in both themes, with a quiet neutral frame,
  faded square guides, erased traces at the edges, and subtle enamel shading.
  A slim metallic frame, bottom tray, and red-capped marker add physical detail;
  paper has a subtly lifted corner and directional shadows. All decoration is
  non-interactive and hidden from assistive technology. Empty-space swipes scroll the page.
  The surrounding portfolio keeps its existing theme, type, and spacing.
- Clicking or tapping empty space creates a small yellow sticky at that point,
  clamped inside the board. Enter/Space on the focused board also creates one.
- Write directly on the sticky, with an animated typing placeholder and native
  caret. Keep Geist, not a separate handwriting font. Reduced motion removes
  the typing and spatial animations.
- A name line signs the note. A checkmark submits; the cross or Escape cancels.
  No composer modal, separate submission form, preview step, or approval copy
  inside the draft. Sending and pending states still provide feedback.
- One draft at a time. A failed submission preserves its contents. A successful
  submission shows a private pending state until dismissed, not a public note.
- Clicking another empty spot discards the unfinished draft and starts a blank
  note there with a fresh typing animation. This is disabled during submission;
  dragging and clicks inside the editor preserve the existing draft.
- Draft paper can be dragged with touch or mouse, using grab/grabbing cursors.
  Text fields and action buttons are excluded. Positions stay inside the board
  and the chosen coordinates are submitted; sending/pending notes cannot move.
- Approved cards have subtle depth and slight rotation. Opening an approved
  note shows its full text with keyboard dismissal and focus restoration.

## Implementation

React Flow owns the bounded canvas and custom note nodes; Motion animates the
paper. The canvas does not capture wheel scrolling or allow visitors to move
other people's notes. Coordinates are normalized to usable board space and
adapt to screen size. Up to six notes per public page bound the payload (four
on tablets, two on phones). Overlapping approved notes use the nearest free
slots; draft notes always appear at the clicked position. The owner can adjust
preferred placement during review.

Neon PostgreSQL stores notes through a conventional server-only Prisma 7 client
and the PostgreSQL adapter. The committed migration defines testimonials and
shared rate counters. Database constraints and API validation enforce text and
position bounds. Submission keys prevent duplicate rows.

`POST /api/testimonials` always creates a pending note. `GET /api/testimonials`
selects only approved public fields. Visible boards refresh every 30 seconds
and on window focus. The waveform preview is read-only and fetches once.

`/admin/testimonials` supports owner login, approval, rejection, unpublishing,
and position changes. The owner password is server-only; signed HttpOnly
SameSite cookies expire after eight hours. Each moderation request authenticates
the owner, checks origin, and uses an update timestamp to detect concurrent edits.
API responses are private/no-store. No visitor accounts or email collection.

Abuse controls include an 8 KiB request limit, honeypot, shared database-backed
limits (three submissions/hour and ten login attempts/15 minutes), hashed client
identifiers, and `BOARD_SUBMISSIONS_PAUSED`. The trusted-proxy assumption is
documented in README. Rejected notes remain private; no automatic content deletion.

## Verification

- Build, TypeScript, and lint.
- Local API tests for validation, origin checks, owner authentication, pending
  privacy, idempotency, approval, stale reviews, rejection, unpublishing, and limits.
- Browser tests for actual board clicks, inline input, submission, owner approval,
  full-note reading, pagination, and light/dark responsive screenshots.
- Test fixtures are explicitly labeled and removed in cleanup; never fabricated
  endorsements retained on the board.
- Source and local secrets recovered into the permitted workspace; secrets and
  screenshots are ignored. Keep preview/production databases separate if the
  user later authorizes deployment.
