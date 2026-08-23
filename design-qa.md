# Design QA

## Visual comparison

- Compared the centered editorial reference and implementation together at 1440 × 1000. The implementation preserves the narrow single-column composition, warm paper background, restrained rules, large typographic hierarchy, and absence of a top navigation bar.
- Rechecked the shared content rail at 780px. The additional width gives the hero, experience rows, and project cards more breathing room while preserving the centered editorial composition.
- Compared the project-grid reference and implementation together at 1440 × 1000. The implementation carries the reference's vivid image-led surfaces into a vertical card sequence suited to the requested reading flow, without copying its masonry layout.
- Compared the blurred project-detail reference and implementation together at 1440 × 1000. The implementation retains the focused dark overlay, background blur, strong media/content split, clear close control, and scroll-contained detail panel.
- Compared the supplied project-chat reference and implementation in the same open-modal state. The implementation matches its Details/Chat hierarchy, quiet dark panel, centered repository-assistant empty state, suggestion chips, bottom composer, and contained conversation scrolling without copying unrelated project imagery.
- Compared the supplied expanded technology-pill reference with the `Dey11/pf` source and the implementation in both card and open-modal states. The 42px dark circle expands to fit the exact technology label, keeps the mark anchored on the left, and pushes sibling circles along the row as shown in the reference.
- Rechecked a live Gemini answer at 1320 × 912 after Markdown rendering was added. Headings, emphasis, lists, inline file paths, user messages, and long answers remain legible while the composer stays anchored to the bottom edge.
- Reused Hanabi's Cal popup component structure and overflow safeguards, then compared the result against the supplied booking-overlay reference. The centered dark calendar, blurred full-screen backdrop, native time-slot controls, and icon close control are aligned with the source behavior.
- Checked the contribution, experience, project, and contact sections at desktop width for consistent alignment, spacing, hairlines, and type hierarchy.
- Verified the official Aceternity keyboard sits directly below the About serif lead, remains inside the left column at desktop width, and preserves its interactive key-press and mechanical-sound behavior.
- Verified the fixed “I care about” lead remains intact while the editable suffix replaces its sample on the first physical or on-screen key press, then supports insertion, selection, Backspace, Delete, spaces, line breaks, paste, and automatic height growth.
- Rechecked the contribution card at the 780px content rail after scaling. The 738px graph aligns exactly with the card's inner width, uses larger 10px cells and 12px month labels, and retains horizontal scrolling rather than shrinking on narrow screens.
- Inspected rapid-hover behavior across the vertical project list. Each card uses an independent, interruptible CSS transform transition, lifts 6px without changing document flow, and retargets from its current position as the pointer moves to another card.

## Responsive checks

- Checked the page at 390 × 844 with no document-level horizontal overflow.
- Confirmed the wider desktop rail collapses back to the existing 14px mobile gutters without changing the small-screen reading order.
- Verified the hero, two-column technology grid, horizontal contribution scroller, compact experience rows, project cards, and stacked project modal at mobile width.
- Verified all six circular stack icons fit on each mobile project card without colliding with metadata or controls.
- Verified coarse-pointer layouts keep the compact circular stack icons and do not expose hover-only labels.
- Verified the chat modal at 390 × 844: the image/detail split, tabs, empty state, horizontal suggestions, composer, and close control fit without document-level horizontal overflow.

## Interaction and accessibility checks

- Opened all four project cards and confirmed the correct title and six project-specific technology icons in every modal.
- Verified modal focus moves to the close button, the background becomes inert, body scrolling locks, Escape closes the modal, and focus returns to the originating card.
- Verified experience disclosures expose the CV-backed role, location, and description.
- Verified Email, LinkedIn, GitHub, Wabi Sabi, repository, live-project, skip, and back-to-top links have valid destinations.
- Verified Book a Call opens Cal.com's official dark `rudraksh/30min` modal, locks body scrolling, displays the 30-minute calendar and available times, and exposes Cal.com's native close control.
- Verified technology icons have accessible labels and native hover titles.
- Verified the About editor exposes a labelled multiline textbox, the keyboard is one tab stop rather than 78, every rendered key has an accessible name and pressed state, and the keyboard receives a visible focus ring.
- Verified the shared technology component reveals the correct software name in both project cards and project details, and neither expanded row overflows its container.
- Verified Lenis is disabled for reduced-motion users and hover movement is gated to fine pointers.
- Verified the Details/Chat tabs expose the correct tab roles, selected state, keyboard focus behavior, and labelled panels.
- Verified a suggested prompt creates the user message immediately, shows a quiet assistant thinking state, streams the answer, and keeps the conversation scrolled to the newest content.
- Verified Gemini answers are grounded in per-project public-repository snapshots, include relevant file paths, render Markdown safely, and admit uncertainty through the system instruction instead of inventing unseen code.
- Verified malformed chat histories return 400, unknown projects return 404, missing configuration returns 503, and valid configured requests stream a 200 response.
- Verified the Hanabi-derived booking popup locks page scrolling, opens the official `rudraksh/30min` Cal.com embed, closes with Escape or its Hugeicons close control, restores trigger focus, and no longer exposes an internal horizontal scrollbar.

## Animation review

| Before | After | Why |
| --- | --- | --- |
| Accordion animated `height` | Disclosure content changes without a layout animation | Avoids main-thread layout animation on a repeated control |
| Modal used `y` and `scale` shorthands | Modal uses a single full `transform` string | Keeps the occasional transition GPU-friendly |
| Project cards animated shadows on hover | Project media uses a short `translateY` transform | Avoids paint-heavy shadow animation and keeps hover feedback restrained |
| Project cards had only an internal image lift | The card now lifts 6px while the image adds 4px of restrained parallax | Makes the selected project visibly pop without reflow; CSS transforms remain smooth when hover targets change quickly |
| Broad reduced-motion override removed all transitions | Reduced motion keeps brief color and opacity feedback while removing movement | Preserves useful state feedback without spatial motion |
| Custom Motion layout animation for stack labels | Source-matched CSS padding plus clipped `max-width`, margin, and opacity reveal | Reproduces the exact `Dey11/pf` interaction without the scale distortion of FLIP layout transforms |

Animation verdict: approve. The source-matched technology reveal is interruptible, limited to a small repeated row, gated to fine pointers, and disabled for reduced-motion preferences; other UI transitions remain below 300 ms.

## Automated checks

- `bun run lint` — passed.
- `bun run build` — passed; static route generated successfully.
- `bunx tsc --noEmit` — passed.
- `bunx @google/design.md lint DESIGN.md` — 0 errors, 0 warnings.
- Gemini live request — passed with `gemini-3.7-flash`; the response cited repository files and streamed into the chat UI.
- Browser console — no application errors during final interaction checks. Development-only React/HMR notices and third-party Cal.com preload warnings were present.

final result: passed
