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
- Verified an outside pointer interaction or page scroll restores the original About sentence and removes editor focus, while pointer interactions inside the editor/keyboard group continue the current edit.
- Rechecked the contribution card at the 780px content rail after scaling. The 738px graph aligns exactly with the card's inner width, uses larger 10px cells and 12px month labels, and retains horizontal scrolling rather than shrinking on narrow screens.
- Inspected rapid-hover behavior across the vertical project list. Each card uses an independent, interruptible CSS transform transition, lifts 6px without changing document flow, and retargets from its current position as the pointer moves to another card.

## Responsive checks

- Checked the page at 390 × 844 with no document-level horizontal overflow.
- Confirmed the wider desktop rail collapses back to the existing 14px mobile gutters without changing the small-screen reading order.
- Verified the hero, 3D technology marquee, horizontal contribution scroller, compact experience rows, project cards, and stacked project modal at mobile width.
- Verified all six circular stack icons fit on each mobile project card without colliding with metadata or controls.
- Verified coarse-pointer layouts keep the compact circular stack icons and do not expose hover-only labels.
- Verified the chat modal at 390 × 844: the image/detail split, tabs, empty state, horizontal suggestions, composer, and close control fit without document-level horizontal overflow.

## Interaction and accessibility checks

- Verified the registry-installed Aceternity dock rests as four 40px Hugeicon circles, expands the focused control to 80px with proportional neighbor response, and displays the correct hover tooltip using the source `150 / 12 / 0.1` spring values.
- Verified the contact dock remains a semantic labelled navigation region, exposes an accessible name for every icon link, and switches to the source disclosure interaction without horizontal overflow at a 390px viewport.
- Verified “View more” refreshes Lenis after the additional project cards mount; the document remains scrollable from the reveal through Contact and the footer instead of retaining the collapsed scroll boundary.
- Verified the experience list tracks the active row with React state, keeps it at full opacity, dims only its siblings to 40%, and restores all rows when the pointer leaves the list.
- Verified touch pointer entry does not activate or leave behind the experience focus treatment; native disclosure behavior and visible keyboard focus remain unchanged.
- Verified the magnetic wrapper preserves the native hero links and Cal.com button as the only focusable controls; it adds no nested or duplicate tab stop.
- Verified the supplied `150 / 25 / 0.1` spring moves a pill on fine-pointer hover, returns it on pointer exit, and remains completely static when `prefers-reduced-motion: reduce` is active.
- Verified Book a Call retains its original gradient, pill radius, inset shine, shadow, and Cal.com popup behavior while using motion-only magnetic feedback.
- Verified the wrapped CTA groups do not create horizontal overflow at a 390 px viewport.

- Opened all six project cards and confirmed the correct title and six project-specific technology icons in every modal.
- Verified modal focus moves to the close button, the background becomes inert, body scrolling locks, Escape closes the modal, and focus returns to the originating card.
- Verified experience disclosures expose the CV-backed role, location, and description.
- Verified Email, LinkedIn, GitHub, Wabi Sabi, repository, live-project, skip, and back-to-top links have valid destinations.
- Verified Book a Call opens Cal.com's official dark `rudraksh/30min` modal, locks body scrolling, displays the 30-minute calendar and available times, and exposes Cal.com's native close control.
- Verified technology icons have accessible labels and native hover titles.
- Verified the Aceternity 3D Marquee fills the 780px desktop crop with fifteen visible logo tiles, keeps twenty tiles inside the 390px mobile crop without document overflow, exposes only one accessible set of the twelve technologies, and stops its column and hover transforms for reduced-motion users.
- Verified the About editor exposes a labelled multiline textbox, the keyboard is one tab stop rather than 78, every rendered key has an accessible name and pressed state, and the keyboard receives a visible focus ring.
- Verified the shared technology component reveals the correct software name in both project cards and project details, and neither expanded row overflows its container.
- Verified Lenis is disabled for reduced-motion users and hover movement is gated to fine pointers.
- Verified the Details/Chat tabs expose the correct tab roles, selected state, keyboard focus behavior, and labelled panels.
- Verified a suggested prompt creates the user message immediately, shows a quiet assistant thinking state, streams the answer, and keeps the conversation scrolled to the newest content.
- Verified Gemini answers are grounded in per-project public-repository snapshots, include relevant file paths, render Markdown safely, and admit uncertainty through the system instruction instead of inventing unseen code.
- Verified malformed chat histories return 400, unknown projects return 404, missing configuration returns 503, and valid configured requests stream a 200 response.
- Verified the Hanabi-derived booking popup locks page scrolling, opens the official `rudraksh/30min` Cal.com embed, closes with Escape or its Hugeicons close control, restores trigger focus, and no longer exposes an internal horizontal scrollbar.

## Additional project reveal QA — 2026-08-24

- Source visual truth: `/tmp/paseo-attachments-U2Ytgf/bac4686d76c27e075e6e2565c4da14d8d5faa84461225422c814329355734eae.png` at 1178 × 366 pixels. Source behavior truth: `Dey11/hanabi/components/work-projects-list.tsx`, which renders the next real project as a blurred, non-interactive preview under a page-colored fade and mounts the remaining cards only after activation.
- Browser implementation evidence: `.codex-artifacts/projects-reveal-collapsed-desktop-v2.png` at a 1440 × 1000 CSS-pixel viewport and device scale factor 1; `.codex-artifacts/projects-reveal-collapsed-mobile-v2.png` at 390 × 844 CSS pixels and device scale factor 1.
- Normalized focused comparison: `.codex-artifacts/projects-reveal-comparison-v2.png` at 1580 × 242 pixels. The left side contains the 1178 × 366 source resized to 780 × 242; the right side contains the implementation’s 780 × 240 project-reveal region with a two-pixel page-color extension. No density conversion was required.
- State compared: collapsed project list with four normal cards, the next real card visible only as a blurred preview, and the centered reveal control. Expanded state was checked separately after the reveal animation completed.
- Full-view evidence: the implementation preserves the portfolio’s 780px editorial rail, vertical card rhythm, and warm paper background while placing the source-derived reveal immediately after VedaAI and before Contact.
- Focused-region evidence: the normalized comparison confirms the same muted real-card preview, heavy page-colored top and bottom fade, centered outlined pill, subtle layered shadow, and non-interactive visual treatment. The mint project surface remains intentionally visible as a quiet tint so the disclosure belongs to this portfolio’s color system. The label is intentionally “View more,” matching the user’s requested wording rather than Hanabi’s “See more.”
- Typography: the control uses the portfolio’s Geist interface face at 14px/570, with sufficient visual weight at both breakpoints. Project card typography and wrapping remain unchanged.
- Spacing and layout: the reveal occupies 780 × 240 pixels on desktop and a 220px-tall region on mobile; the control stays centered and measures 44px high on the 390px touch viewport. No document-level horizontal overflow occurs at 390px.
- Colors and tokens: the fade uses `--color-bg-page`, and the button uses the existing warm elevated/surface neutrals. Project metadata opacity increased from 0.65 to 0.8 so all six card surfaces meet automated contrast checks.
- Image quality: Leadly uses the repository’s original 3730 × 1654 dashboard image. Litmus AI uses GitHub’s generated 1200 × 600 public repository preview because the source repository contains no product screenshot. Both remain sharp at card and modal sizes and use the existing image crop treatment.
- Copy and content: names, dates, summaries, stacks, architecture notes, repository links, and the Leadly live URL were checked against the two public repositories. The Litmus and Leadly chat contexts were generated from their exact checked-out revisions.
- Primary interactions tested: native button activation, `aria-expanded`, hidden-preview exclusion, mounting exactly two cards, both new project modals, Details/Chat tabs, Litmus’s live Gemini answer, and the Cloudflare preview reveal. The projects-region axe audit reports zero violations after the metadata contrast fix.
- Browser console: no application errors or framework overlay on the final local and Cloudflare checks. The initial local browser pass exposed blocked development chunks because `127.0.0.1` was not allowlisted; adding `127.0.0.1` and `localhost` to `allowedDevOrigins` restored hydration before interaction QA.

### Comparison history

| Iteration | Finding | Fix | Post-fix evidence |
| --- | --- | --- | --- |
| 1 | P2 — the intended page-colored fade did not render because the rule referenced an undefined `--color-background` token, leaving the mint preview much more saturated than the source | Replaced the invalid token with the project’s existing `--color-bg-page` token in all three gradient stops | `.codex-artifacts/projects-reveal-comparison-v2.png` shows the source and implementation with matching muted top/bottom fade and centered disclosure hierarchy |
| 2 | No actionable P0/P1/P2 differences remained; the product-specific mint tint and “View more” label are intentional adaptations | No further visual fix required | Desktop and mobile captures, actual reveal interaction, and a zero-violation projects-region accessibility audit passed |

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
- Gemini live requests — passed with `gemini-3.7-flash`; the original project checks and the new Litmus AI request cited repository files and streamed into the chat UI.
- Browser console — no application errors during final local or Cloudflare interaction checks. Development-only React/HMR notices and third-party Cal.com preload warnings were present.

final result: passed
