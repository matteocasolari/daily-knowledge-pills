# Daily Knowledge Pills Implementation Plan

**Goal:** Build a deployable static daily reading app from the supplied book notes.
**Architecture:** Separate immutable source notes, repeatable extraction, editorial selections, and the static UI.
**Tech Stack:** Python standard library, vanilla HTML/CSS/JavaScript, Node test runner, GitHub Pages.
**Spec:** docs/superpowers/specs/2026-09-05-daily-knowledge-pills-design.md

User delegated routine design decisions; execute inline in this new, non-Git workspace.

- [x] Preserve sources and implement tested extraction of en-note HTML and DOCX paragraph runs. Normalize whitespace only; preserve paragraph indices. Verify source byte hashes before/after move.
- [x] Read extracted notes, curate standalone excerpts and reflections, and associate explicit book/author metadata. Build fails for unmatched excerpts or missing attribution. Export curated JSON and report coverage.
- [x] Test and implement daily selection: local date key, stable three distinct books, nonfiction preference, no adjacent-day pill repeats when pool permits. Implement resilient saved/read persistence.
- [x] Build responsive Today, Saved and Library views, with accessible controls, source attribution, filters, empty/error states and day rollover.
- [x] Test local root and project-subpath serving; inspect desktop/mobile rendering and interaction. Add exact build/preview/deploy instructions and GitHub Pages artifact workflow.

## Verification

Completed 2026-09-05: 7 Python tests, 7 Node tests, 7 Chrome browser checks. Desktop and 375px mobile screenshots inspected. Verified all 102 original SHA-256 hashes. Built artifact: 65 curated pills from 18 books, 41–85 words per pill. Root and project-subdirectory serving both pass. Independent review findings (skip-link routing and small-text contrast) addressed; skip-link regression reproduced before fix. Browser tests include optional reading links, search/topic filtering, save/remove persistence, completion persistence, load retry, blocked storage, and local midnight rollover. GitHub workflow prepared; no repository or deployment configured.

## Collection expansion and personal notebook copy

Expanded the collection from 65 to 135 pills and from 18 to 32 books; all original entries retain their IDs and content. Added topic-specific optional resources, including resources by people other than the book authors. Every excerpt matches its source paragraph; current pills range from 41 to 92 words including attribution. The radiocarbon refresher explicitly corrects an inaccuracy in the original note while preserving the excerpt.

Revised the interface to read as a personal notebook: “Notes to my future self,” “My library,” “Today’s reminders,” and “From my notes.” Retained the established visual design. Updated library browser checks to use the actual collection size so content additions do not require hardcoded totals.

Verification: build, 14 unit checks, and all 7 browser checks pass. Inspected desktop and mobile screenshots. A 730-day simulation reached every pill, kept three distinct books per day, avoided consecutive-day pill repeats, and stayed at an estimated two minutes or less per daily set.
