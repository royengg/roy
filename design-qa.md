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
- Verified focusing and typing in the About editor shows only the caret/selection in light and dark mode, without the former orange perimeter; Windows forced-colors mode retains a system `Highlight` outline.
- Rechecked the contribution card at the 780px content rail after scaling. The 738px graph aligns exactly with the card's inner width, uses larger 10px cells and 12px month labels, and retains horizontal scrolling rather than shrinking on narrow screens.
- Inspected rapid-hover behavior across the vertical project list. Each card uses an independent, interruptible CSS transform transition, lifts 6px without changing document flow, and retargets from its current position as the pointer moves to another card.

## Responsive checks

- Checked the page at 390 × 844 with no document-level horizontal overflow.
- Confirmed the wider desktop rail collapses back to the existing 14px mobile gutters without changing the small-screen reading order.
- Verified the hero, 3D technology marquee, horizontal contribution scroller, compact experience rows, project cards, and stacked project modal at mobile width.
- Verified all six circular stack icons stay on one line at 390px and 320px: the 390px card row uses 241px of its 318px content rail, while the 320px card keeps the full row inside its 248px rail without wrapping or card-level overflow. In all six project cards, the image is relatively positioned after the copy with a measured 14px icon-to-image gap, including after “View more” mounts Litmus AI and Leadly.
- Verified coarse-pointer layouts keep the compact circular stack icons and do not expose hover-only labels.
- Verified the chat modal at 390 × 844: the image/detail split, tabs, empty state, horizontal suggestions, composer, and close control fit without document-level horizontal overflow.

## Interaction and accessibility checks

- Verified the registry-installed Aceternity dock rests as four 40px Hugeicon circles, expands the focused control to 80px with proportional neighbor response, and displays the correct hover tooltip using the source `150 / 12 / 0.1` spring values.
- Verified the contact dock remains a semantic labelled navigation region, exposes an accessible name for every icon link, and keeps all four direct controls visible inside the same 242 × 80 px tray at a 390px viewport. The mobile disclosure is absent, both themes have zero horizontal overflow, and the scoped accessibility audit reports no violations.
- Verified the 56 × 320 px waveform exposes exactly one native vertical slider with section-aware value text. Home and End move the root document to exact 0% and 100% positions, and the control remains inside the inert page shell when project details are open.
- Verified the waveform’s 304 × 240 px hover/focus card contains a single inert, unfocusable live page miniature rather than a recreated index. Section-anchor mapping keeps the child on the matching content and maps both parent and miniature to their respective scroll limits at Contact. The footer shows only `06` and `Contact`, while the native slider retains `100 percent scrolled, Contact section` for assistive technology; light and dark themes stay synchronized.
- Verified the miniature route renders no nested waveform, pull cord, or development Agentation overlay; the card and waveform rail both compute to `box-shadow: none`. At 390 × 844 and without a fine pointer, the widget is hidden, no preview iframe is requested, and the document has no horizontal overflow.
- Verified the transparent range retains the normal default cursor, the waveform renders only its 37 signal bars with no generated center/per-row guides, and the visual preview footer contains no percentage.
- Verified reduced-motion mode removes preview translation and waveform energy, holds the miniature still while scrolling within a section, then updates it immediately at the next section boundary. The accessibility tree exposes the slider only, with no iframe descendants.
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
- Verified every transformed marquee card keeps its 80px logo and one-line 22px label inside the colored surface with increased lower-edge breathing room at desktop and mobile sizes.
- Verified the container-scaled marquee keeps at least three diagonal card bands visible through the alternating column cycle, and that hover uses a stationary hit area with an interruptible 300ms child transform rather than moving the pointer target itself.
- Verified every marquee hit area now fills its 406px source-grid column, producing approximately 386px-wide transformed tiles at the 780px desktop rail; the stronger 2px dashed guides remain visible between surfaces in light and dark mode without becoming card borders.
- Verified the pull cord toggles the complete semantic light/dark palette by click, 66px drag, Enter, and Space; exposes a 44px target with a changing accessible name and `aria-pressed`; and persists the chosen theme across reloads without a hydration warning.
- Verified the dark appearance preserves the bright project and stack surfaces, switches the keyboard, graph, dock, structural surfaces, shadows, borders, and text roles, and introduces no horizontal overflow at 1280px or 390px.
- Verified reduced-motion mode bypasses the circular View Transition while retaining an immediate theme change, and the dark primary, secondary, accent, status, and interactive-border pairs measure 15.89:1, 7.43:1, 6.44:1, 8.48:1, and 3.09:1 against the declared page background.
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
