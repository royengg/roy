---
version: "alpha"
name: Quiet Infrastructure
description: A narrow editorial portfolio for a backend engineer, built on warm paper neutrals with concentrated bursts of product color.
colors:
  primary: "#181715"
  bg-page: "#F2EEE5"
  bg-surface: "#E8E1D5"
  bg-elevated: "#FBF8F1"
  text-primary: "#181715"
  text-secondary: "#625F59"
  border-subtle: "#CEC7BA"
  accent-solid: "#E74432"
  accent-soft: "#FFB0A5"
  status-available: "#2F8F50"
  project-yellow: "#F2C84B"
  project-coral: "#FF6658"
  project-violet: "#AEA6FF"
  project-lime: "#C9FF73"
  project-mint: "#63D8C9"
  project-dusty-rose: "#D7A5AA"
  graph-empty: "#DDD8CE"
  graph-low: "#C9DCFF"
  graph-medium: "#84ADFF"
  graph-high: "#4F70EE"
typography:
  display-xl:
    fontFamily: Geist
    fontSize: 4.875rem
    fontWeight: 570
    lineHeight: 0.96
    letterSpacing: -0.07em
  heading-lg:
    fontFamily: Geist
    fontSize: 3.4375rem
    fontWeight: 520
    lineHeight: 1
    letterSpacing: -0.055em
  heading-serif:
    fontFamily: Instrument Serif
    fontSize: 2rem
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -0.02em
  body-md:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
  label-mono:
    fontFamily: Geist Mono
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.03em
rounded:
  sm: 8px
  md: 14px
  lg: 22px
  pill: 999px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 24px
  6: 32px
  7: 48px
  8: 72px
  9: 96px
components:
  page:
    backgroundColor: "{colors.bg-page}"
    textColor: "{colors.text-primary}"
  copy-secondary:
    textColor: "{colors.text-secondary}"
  divider:
    backgroundColor: "{colors.border-subtle}"
  focus-ring:
    backgroundColor: "{colors.accent-solid}"
  selection:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.text-primary}"
  availability:
    backgroundColor: "{colors.status-available}"
  project-card-yellow:
    backgroundColor: "{colors.project-yellow}"
    textColor: "{colors.text-primary}"
  project-card-coral:
    backgroundColor: "{colors.project-coral}"
    textColor: "{colors.text-primary}"
  project-card-violet:
    backgroundColor: "{colors.project-violet}"
    textColor: "{colors.text-primary}"
  project-card-lime:
    backgroundColor: "{colors.project-lime}"
    textColor: "{colors.text-primary}"
  project-card-mint:
    backgroundColor: "{colors.project-mint}"
    textColor: "{colors.text-primary}"
  project-card-dusty-rose:
    backgroundColor: "{colors.project-dusty-rose}"
    textColor: "{colors.text-primary}"
  contribution-empty:
    backgroundColor: "{colors.graph-empty}"
  contribution-low:
    backgroundColor: "{colors.graph-low}"
  contribution-medium:
    backgroundColor: "{colors.graph-medium}"
  contribution-high:
    backgroundColor: "{colors.graph-high}"
  page-shell:
    width: 780px
    padding: 20px
  button-secondary:
    backgroundColor: "{colors.bg-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: 10px 14px
  button-secondary-active:
    backgroundColor: "{colors.bg-surface}"
  project-card:
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: 28px
  project-modal:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.bg-elevated}"
    rounded: "{rounded.lg}"
    padding: 22px
  repository-chat:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.bg-elevated}"
    rounded: "{rounded.md}"
    padding: 16px
---

## Overview

Quiet Infrastructure is intentionally restrained. It should feel like an engineer’s notebook elevated into a small editorial publication: narrow, legible, calm, and confident. The work—not decorative chrome—provides the strongest color and visual energy.

The portfolio borrows structural ideas from the supplied references without copying their expression: a centered reading column, dense but breathable metadata, expandable experience rows, a contribution calendar, vivid image-led project cards, and project details shown in a focused overlay.

## Colors

The light appearance lives on warm off-white rather than pure white. Ink and muted warm gray carry nearly all typography. Red is a small signature accent used for punctuation, focus, and key micro-details; it is not a general-purpose fill.

The dark appearance is a separately composed warm-charcoal system, not a mechanical inversion. A `#141311` page sits beneath subtly stepped `#1c1a17` and `#24211d` surfaces; ivory `#f1ede4` and warm gray `#aaa399` preserve the editorial temperature of the light theme. The primary, secondary, coral-accent, and availability pairs measure 15.89:1, 7.43:1, 6.44:1, and 8.48:1 respectively against the dark page under WCAG 2 luminance contrast. Interactive boundaries use the stronger `#696259` border at 3.09:1, while non-interactive separators intentionally remain quieter.

Project colors are categorical surfaces rather than competing calls to action. They remain unchanged in dark mode so the work continues to carry the page’s strongest energy. Technology marks retain their recognized brand colors inside pale tinted tiles with fixed dark labels; they read as deliberate illuminated objects on the charcoal marquee rather than incorrectly inheriting ivory text. Contribution cells move from warm gray through cool blue to coral, with a deeper theme-specific ramp in dark mode, keeping the graph readable without reproducing GitHub’s green palette. The contribution grid nearly fills its 780px content rail with 10px cells, 4px gutters, and 12–13px supporting labels so the year remains readable at a glance rather than floating inside excess card space.

## Typography

Geist is the main interface and display family because it remains neutral at body sizes and crisp at large scale. Instrument Serif appears sparingly in human, reflective copy to prevent the portfolio from feeling like documentation. Geist Mono is reserved for indices, years, contribution metadata, and system-oriented labels.

Headlines are tightly tracked and balanced. Reading text stays within roughly 60–75 characters per line, uses unitless line heights, and receives `text-wrap: pretty`. Numerical metadata uses tabular figures.

## Layout

The desktop page is centered inside a 780 px maximum width with at least 20 px of inline breathing room. Sections are stacked vertically and separated primarily with whitespace; hairline rules reinforce major boundaries only.

Project cards appear one per row so their imagery has room to read. The contribution graph may scroll horizontally on narrow screens, with its summary remaining in normal flow. Experience rows collapse late and hide secondary metadata only when the content can no longer fit comfortably.

The About section keeps its reflective serif lead in the narrow first column and places an interactive Aceternity mac-style keyboard directly beneath it. “I care about” remains fixed while the following thought is a native multiline editor; the first typed or clicked key replaces the sample sentence, and later key presses edit at the current selection. The editor relies on its visible caret and text selection rather than a decorative accent perimeter, so typing never introduces an orange rectangle in either appearance; forced-colors mode restores an explicit system focus outline. Clicking beyond the editor/keyboard group or scrolling the page restores the original thought so the interaction always returns to its composed state. The official key geometry, physical-key highlighting, and mechanical sound sprite are preserved; only its responsive scale is constrained so it stays within the editorial column on desktop and expands naturally when the About layout becomes single-column.

The main technology stack replaces the flat tile grid with the registry-installed Aceternity 3D Marquee. Its four-column plane keeps the source `rotateX(55deg) rotateZ(-45deg)` geometry and alternating 8.5/12.5-second column travel, but every screenshot card becomes a branded logo-and-name tile using the established software colors. Each tile fills its complete grid column so the colored surfaces occupy the diagonal lanes like the source marquee; the remaining 32px grid gap becomes a deliberate separator instead of excess empty space. Dashed lane guides use a dedicated, theme-aware neutral with a 2px pre-transform thickness so they remain quietly legible after perspective scaling in both appearances. The twelve technologies repeat only to keep the perspective crop continuously populated; duplicate repetitions are hidden from assistive technology. A container-scaled stage keeps three diagonal card bands visible inside the 780px rail instead of letting the viewport breakpoint enlarge the fixed 1720px plane beyond its crop. Hover detection stays on a stationary wrapper while only its visual child rises 10px over 300ms, preventing the moving surface from repeatedly leaving its own hit target. The marquee remains 520px high on desktop, crops to 380px on phones, and becomes a stable plane when reduced motion is requested.

At small widths, preserve document reading order: name and role, about, technology stack, contribution graph, experience, projects, then contact. The modal becomes a stacked sheet with media above content. All controls remain at least 40 px on desktop and 44 px on touch where space permits.

## Elevation & Depth

Depth is quiet and functional. Project media uses a low-opacity pure-black outline plus a layered shadow to distinguish screenshots from colored card surfaces. The modal uses a darker, deeper shadow because it is the only true elevated layer.

The backdrop blur belongs exclusively to the project detail overlay. Ordinary sections do not use glass effects, gradients, or floating decoration.

## Shapes

Radii are soft but not playful. Nested radii remain concentric: an inner image radius equals the card radius minus its visible padding. Pills are limited to tags, links, and compact metadata. Contribution cells use a 2 px radius so the graph stays technical rather than bubbly.

## Components

Project cards are native buttons with a clear image, title, summary, a compact row of circular stack icons, and an open icon. On fine pointers, the whole card lifts 6px over 150 ms while its image rises another 4px, giving the project list a light shuffle as the pointer moves between entries; the transform-only transition remains interruptible during rapid changes. The same stack-icon treatment appears inside the project overlay, so technologies remain recognizable in both contexts. On fine-pointer hover, each circle follows the `Dey11/pf` source interaction: horizontal padding grows while a clipped, zero-width label expands and fades in beside the mark, pushing the remaining icons naturally along the row. Touch layouts keep the compact circles. Their pressed state scales to 0.96 with a quicker 100 ms response for tactile feedback. The transition into the project overlay maintains spatial continuity through the shared project image.

The first four project cards remain immediately visible. Two more repository-backed projects sit behind a Hanabi-derived “View more” disclosure: the collapsed state shows a blurred, non-interactive crop of the next real card under a warm page-colored fade, while the outlined pill stays centered above it. Activating the native button mounts both additional cards with a short opacity-and-translation reveal, then explicitly refreshes Lenis after React commits the larger document so every browser receives the new scroll boundary. The preview is removed from the accessibility tree, the button exposes `aria-expanded`, and reduced-motion preferences suppress the spatial transition.

The project overlay has a compact Details/Chat tab row. Chat keeps the same dark surface as project details, with a quiet centered empty state, horizontally scrollable suggestion chips, repository-grounded responses, and a bottom-anchored composer. User messages receive a small elevated bubble; assistant answers remain visually open for long-form technical reading. Error and streaming states stay inline so the modal never jumps or becomes blocked.

Hero pills use a source-owned `MagneticButton` wrapper. Fine-pointer movement pulls the original native link or button toward the cursor using a `150 / 25 / 0.1` spring, while the warm coral outline and wash provide a static color cue. The wrapper never becomes a second focus target, and reduced-motion users receive the unchanged, stationary control.

Contact links use the registry-installed Aceternity floating dock, adapted only to the portfolio palette and destinations. The resting state is a compact chalk-neutral tray (`#f7f7f3`) with crisp ivory 40 px Hugeicon controls (`#fffefb`) and a cool neutral border (`#dbdad5`), keeping the dock clean against the warmer page. Pointer distance drives the source component’s `150 / 12 / 0.1` springs: nearby controls expand independently up to 80 px while their icons interpolate from 20 to 40 px, and the active label appears in a dark tooltip above the dock. At narrow widths, the source component becomes a single disclosure button that reveals the four labelled links vertically.

The theme control adapts Hasan Harman’s public Pull-Cord Theme Switcher and hangs from the top edge of the hero without becoming a navbar. Its original two-axis Motion springs (`180 / 12 / 0.9` horizontally and `300 / 10 / 0.9` vertically), 66 px pull threshold, and bounded sway create the cord response. Releasing beyond the threshold toggles a persisted `next-themes` class and reveals the new appearance from the handle with a 550 ms circular View Transition. A native 44 px button tracks the visible bead, so click, touch, Enter, and Space are equivalent to pulling and expose the current state through `aria-pressed`. The initial appearance stays light to preserve the established portfolio, subsequent choices persist across reloads, and reduced-motion users receive an immediate state change with no spatial reveal. The bulb glow is brighter while the lights are on and nearly extinguished in dark mode.

The Book a Call control reuses Hanabi's Cal popup component pattern: a compact black pill with restrained inset shine opens the official Cal.com embed in a centered, dark, blurred overlay. The implementation keeps Hanabi's popup sizing and overflow safeguards while adapting the event slug and close icon to this portfolio. It uses the same magnetic translation but disables the wrapper feedback surface so the black pill, inset shine, border, and shadow remain visually unchanged.

Experience rows are native disclosure buttons with a plus indicator, visible expanded state, and concise supporting copy. The list follows the `Dey11/pf` focus treatment: React tracks the fine-pointer row currently under the cursor, keeps it fully opaque, and dims every sibling to 40% over an interruptible 150 ms opacity transition. Leaving the list restores every row immediately to the shared resting state, while touch input never activates the hover treatment. Technology tiles display real brand marks with their official colors, while general interface actions use Hugeicons at a consistent 1.5 px stroke weight.

Motion is purposeful and occasional: cards provide press feedback, disclosure indicators communicate state, experience rows use a short opacity focus shift, technology pills reveal their labels over 300 ms, pill CTAs use a bounded magnetic spring, and the project modal explains the relationship between overview and detail. The technology-pill reveal intentionally mirrors its source component's measured CSS expansion; other UI transitions stay under 300 ms and use strong ease-out curves. Reduced-motion preferences remove the pill expansion, magnetic translation, and spatial movement elsewhere while retaining brief opacity and color cues.

## Do's and Don'ts

- Do keep the reading column narrow and centered, even on wide displays.
- Do use real project imagery and recognized technology marks.
- Do let project surfaces and images carry the loudest color.
- Do preserve native semantics, visible focus, keyboard dismissal, and focus restoration.
- Do use exact-property transitions and gate hover motion to fine pointers.
- Don’t turn the portfolio into a dashboard, résumé template, or full-bleed landing page.
- Don’t add glassmorphism, decorative gradients outside source-derived functional controls, floating 3D objects, or excessive pills.
- Don’t invent employment claims, dates, outcomes, or contact details.
- Don’t use Lucide or mixed interface icon families; use Hugeicons for product UI actions.
