# Daily Knowledge Pills

A completely static, personal reading ritual for GitHub Pages. Three short ideas each local calendar day, sampled from three different books. Nonfiction is the default; occasional fiction offers a reflective concept. Daily selection is deterministic and independent of reloads, bookmarks and reading progress.

## Experience
Warm ivory paper, ink typography, terracotta accents, editorial layout. Today shows three numbered cards with a concise idea, original note excerpt, book, author and an original reflection prompt. Save and mark-read controls persist locally. Each pill has exactly one named concept and at most 110 words including attribution, keeping all three under 330 words. Optional explore-further links are outside the daily reading budget. Saved offers revisiting; Library searches curated pills by book, author, topic and text. Responsive, keyboard accessible, reduced-motion friendly. No accounts, APIs, tracking, remote fonts or runtime dependencies.

## Content
Preserve all source bytes in sources/. A standard-library Python importer reads Evernote HTML en-note bodies and DOCX paragraphs, writes normalized JSON and an extraction report. Explicit book metadata and editorial curation remain separate. Daily knowledge pills select exact substrings from source paragraphs, preserving source spelling and punctuation after whitespace normalization. Label excerpts as original notes: these exports mix direct book quotations with the reader's paraphrases, so do not claim edition verification. Added reflections are separately labeled. Do not invent page numbers or authors; unknown metadata stays out of daily rotation. Curated initial collection covers a broad selection, with remaining extracted notes available for future curation.

## Architecture and deployment
Plain HTML/CSS/ES modules in site/. Python build validates source provenance and exports only curated content to site/data/library.json. GitHub Actions uploads site/ to Pages; source exports and development files are not in the published artifact. Relative URLs support project subpaths. Node's built-in test runner validates deterministic sampling, diversity, date rollover, filtering and storage resilience. Python tests validate parsing and quote provenance. Browser smoke checks cover navigation, saving, completion, searching and mobile overflow.

## Decisions
Prefer curated pills to automatically treating every bullet as a complete idea. Prefer vanilla JavaScript to a framework for this small static experience. Prefer three different books each day to three excerpts from one book for variety. Local persistence is per browser; no synchronization is implied. No deployment without an actual configured GitHub repository; provide a ready workflow and instructions.
