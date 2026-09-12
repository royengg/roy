# What people say about me — feature plan

Status: proposed implementation, September 12, 2026. Branch: `feat/testimonial-board`, based on main at `8f3aa9a`. This branch contains planning only.

## Product decision

A shared, moderated wall of personal notes. Visitors click an empty part of the board, write a note, preview it, and submit it for Roy's approval. Only approved notes become public. A submission is never briefly published while awaiting review.

Recommended v1: custom React/DOM components, CSS, and the existing Motion dependency. No drawing toolbar, infinite canvas, visitor accounts, file uploads, or public editing of other people's notes. “Collaborative” initially means everyone contributes to the same persistent board. Live cursors are an optional scope decision, not needed for submissions or moderation.

tldraw provides sophisticated canvas editing and multiplayer, but adds editor integration and a production license requirement; moderation still needs a separate implementation. Reconsider it if freehand drawing, pan/zoom, and shared editing become central requirements.

## Art direction

- Place the section immediately before Contact: section 08, with Contact becoming 09. Use the exact heading “What people say about me,” balanced across lines when needed, with the existing SectionHeading typography and divider.
- Stay within the actual site shell, currently capped by `--content-width: 1000px`. Some older DESIGN.md measurements say 840px; implementation should follow current CSS.
- Board: about 540px high on desktop, theme-aware surface and hairline border, 22px outer radius, a very faint CSS dot grid. Keep the texture understated so the notes carry the visual interest.
- Notes: approximately 200–230px wide, warm paper plus muted yellow, sage, and dusty rose variants derived from the existing palette. Dark ink remains readable on these paper colors in both themes. Avoid neon colors and heavy grain.
- Use restrained paper depth: a narrow top-edge highlight, soft contact shadow, and a small folded corner. Slight deterministic rotations between -3 and +3 degrees; never randomize on each render.
- Use Geist at 16px with relaxed leading for note text, Geist at 13px for the author, and a quiet existing label style for optional context. Keep Instrument Serif for a short board invitation if it improves the composition. No new handwriting font in v1.
- Supporting copy: “Worked together? Leave a little note.” Visible pill action: “Leave a note,” using the current button system and a 1.5px Hugeicons document-plus icon.
- Empty state: a clearly instructional paper card, “Your note could be the first,” plus the action. Never invent endorsements to populate the live board. Preview fixtures must be visibly labeled as examples.
- Motion: short lift and slight straightening on hover; a draft appears with a small scale/opacity transition. No perpetual wobble. Honor reduced motion and preserve visible keyboard focus.

## Visitor flow

1. Click/tap empty board space, or use the keyboard-accessible “Leave a note” button. Clicking existing notes never creates a new draft; drag/scroll gestures must not count as clicks.
2. A draft note appears near that point, clamped inside the board. On desktop, edit in a spacious note-shaped popover anchored to it; use an accessible sheet/dialog on phones. Trap focus only in the dialog, support Escape, restore focus, and handle the on-screen keyboard.
3. Collect name (required, 2–60 characters), message (required, 10–280 characters), and optional relationship/context (up to 80 characters). Offer four fixed paper colors. No email, attachments, rich text, or links in v1.
4. Show a preview with “Submit for approval” and “Keep editing.” Explain before submission: “Your name and note will be public if approved.” Only one active draft at a time.
5. Submit once with an idempotency key. Disable duplicate submission while pending. On success, show “Sent to Roy for approval” and remove the draft from the public board. On failure, retain the draft and show a retry action; never imply successful storage before the server confirms it.
6. Approved notes become visible to everyone after the public board refreshes. Pending/rejected notes are unavailable from all public endpoints, HTML, client payloads, and subscriptions.

## Layout and growth

Desktop uses a bounded arrangement rather than an infinitely growing canvas. Store normalized preferred coordinates (0–1); pick the closest available slot when placements collide. Clamp cards and rotations away from edges. The owner may adjust placement during review. Visitors may move their own unsent draft, but cannot rearrange approved notes.

Start with a maximum of eight notes on a board page, with a subtle next/previous control as the archive grows. Each page uses a deterministic collision-free slot arrangement. Keep a stable reading order independent of visual rotation. A newly approved note must not unexpectedly move other notes while someone is reading.

Phones use a single-column paper-note list and the same add-note action. Do not shrink the desktop canvas into unreadable cards or intercept page scrolling. Preserve all approved notes through pagination and expose the same content to assistive technology.

## Storage and moderation

Proposed service: Supabase Postgres plus Supabase Auth, subject to confirmation of any existing service. The repository currently has no configured database/auth dependency for this feature. Keep the application on its existing Next.js/Vercel deployment.

Data model: `testimonials` with UUID, name, message, optional context, color enum, preferred x/y, rotation, status (`pending`, `approved`, `rejected`), created timestamp, reviewed timestamp, reviewer ID, and unique submission key. Enforce bounds, lengths, allowed colors, and status defaults in the database as well as at the API boundary.

- `GET /api/testimonials`: approved fields only, paginated with deterministic ordering. Short public caching (for example 30 seconds). Refresh on visibility/focus and at a modest interval only while the board is visible; no realtime server needed for v1.
- `POST /api/testimonials`: server validation, plain-text storage/rendering, fixed pending status, and atomic duplicate prevention. Never accept a client-supplied reviewer or publication status.
- `/admin/testimonials`: authenticated owner-only queue with full note preview, approve, reject, reposition, and unpublish. No public signup UI. Verify the owner against an immutable configured auth user ID on every privileged request; hiding the route is not authorization.
- Moderation requests use authenticated cookies, same-origin/CSRF protection, and conditional database updates so two tabs cannot silently overwrite review state. Approval preserves the visitor's wording; reject instead of silently rewriting an endorsement.
- Enable RLS and least-privilege grants. Public callers can read only approved notes and cannot insert/update the table directly. Submission goes through the validated server endpoint. Any service credential remains server-only. Admin responses must be private/no-store.
- Invalidate public board cache on approval/unpublish. Pending content must not leak through error responses, logs, preview fixtures, or realtime channels.
- Abuse controls: honeypot plus a shared database-backed rate limit (not per-function memory), using a short-lived salted hash of the platform-provided client IP. Initial policy: three submissions per hour, adjustable after usage. Limit request size, expire rejected notes/abuse records on a documented schedule, and provide a moderation kill switch to pause submissions. Add a managed challenge only if actual spam warrants it.

Preview deployments must use a separate database/project or isolated dataset and a separate owner configuration. Do not let preview testing submit or moderate production notes.

## Implementation sequence

1. Visual prototype on this branch using explicitly marked fixtures: empty, lightly populated, full, draft editor, confirmation, and mobile states. Review dark and light screenshots and cursor/touch interactions before backend integration.
2. Finalize the art direction in the existing page. Add `testimonial-board.tsx`, `testimonial-note.tsx`, and `testimonial-composer.tsx`; reuse existing icons, fonts, tokens, and Motion. Document new board tokens in DESIGN.md.
3. Provision/configure the chosen database and owner authentication, then add migration, RLS, API handlers, server-only data helpers, and moderation page. Read the installed Next.js docs for route handlers, caching, and authentication boundaries before coding.
4. Integrate the new section with `portfolio.tsx` and the explicit section list in `waveform-scroll-scrubber.tsx`. Update section indices. The waveform preview must use a static/read-only board without an editor, polling, or duplicate submissions; refresh Lenis measurements when content height changes.
5. Verify on a Vercel preview with isolated data, then promote only after visual and moderation review. Do not seed production with fabricated testimonials.

## Acceptance checks

- Visual: 1440px desktop, 768px tablet, 390px and 320px phones; dark/light themes; empty, one-note, full, and long-text boards; no clipping, overlap, or page overflow. Hover polish cannot move click targets unexpectedly.
- Interaction: click-to-create, keyboard add, pointer movement vs click, editing, cancel, submit, retry, duplicate-submit prevention, focus restoration, reduced motion, touch scrolling, and on-screen keyboard.
- Moderation: a pending submission never appears publicly; non-owner requests fail; approval publishes the original text; rejection stays private; unpublish removes it after cache invalidation; concurrent reviews resolve predictably.
- Security: attempted status spoofing, direct database writes, HTML/script input, oversized bodies, rate-limit bypass across function instances, and unauthenticated admin access.
- Persistence: notes survive redeploys and appear on another device. Preview actions cannot affect production. Database failure leaves the rest of the portfolio usable and does not falsely accept a note.
- Delivery: production build, TypeScript, targeted lint, meaningful API/RLS tests, and recorded browser verification of the final design.

## Open choices

Awaiting preference: shared approved notes only versus live visitor cursors; existing data service versus proposed Supabase. Owner login identity must be supplied during backend setup. These do not block planning or the visual prototype. No paid services, accounts, credentials, or infrastructure are created by this planning change.

## References

- [tldraw production license requirements](https://tldraw.dev/sdk-features/license-key)
- [tldraw multiplayer sync](https://tldraw.dev/docs/sync)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase server-side authentication](https://supabase.com/docs/guides/auth/server-side)
