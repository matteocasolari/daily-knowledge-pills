# Daily Knowledge Pills

My personal reading notebook: five concepts from books I’ve read, revisited each day. A completely static app for GitHub Pages.

The collection includes **522 curated pills from 99 books**. The **99 book-note files** are retained in `sources/`; the importer extracted **15,688 paragraphs**. Every book and source file is represented. The [November note refresh](docs/note-refresh-2026-11-01.md) adds 13 pills from three expanded books and the newly supplied **Die with Zero**, preserving all 400 earlier pills. The Software Engineer’s Guidebook now has 16 pills to cover its expanded notes; the earlier full-library evaluation used a cap of 12. **Tools of Titans** retains three pills drawn from its original topic/page reminders. See the [book coverage audit](docs/book-coverage.md), the [earlier expansion evaluation](docs/book-expansion-evaluation.md), and the [review of the earlier 90 additions](docs/pill-review.md).

Each pill has a named concept, a short editorial refresher, the original note excerpt, the book and author, and an optional further-reading link. Pills are capped at **110 words including attribution**: at most 330 words for the daily set. Links are outside that reading budget.

The [full-library review is in progress](docs/review-work/PROGRESS.md). Validated additions are saved to the website data in batches; historical review totals below describe earlier snapshots.

## Run locally

Requires Python 3.9+; Node 22+ runs the test commands. No installation is needed to build or serve the app.

```sh
npm run build
npm run dev
```

Open <http://localhost:4173>. The app needs an HTTP server because it loads its static JSON collection; opening `index.html` directly as a file is not supported.

Without Node:

```sh
python3 scripts/import_notes.py
python3 scripts/build.py
python3 -m http.server 4173 --directory site
```

## GitHub Pages

1. Create a GitHub repository and add this project on its `main` branch.
2. In the repository, open **Settings → Pages → Build and deployment → Source**, and choose **GitHub Actions**.
3. Push to `main`, or run **Deploy Daily Knowledge Pills to GitHub Pages** from the Actions tab.
4. The workflow validates and builds the collection, runs the unit tests, and publishes only `site/`. Its deployment job reports the live URL.

The workflow follows [GitHub’s custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Relative asset paths work at both a domain root and a project URL such as `https://username.github.io/daily-knowledge-pills/`. If you use a different default branch, change the workflow's `branches` entry.

The website artifact contains the curated excerpts; it does not contain the original HTML/DOCX exports. A public **source repository** still exposes everything committed to it, including `sources/`. If you prefer to keep the source collection local, publish only the already-built `site/` directory in a separate Pages repository and select branch-based publishing there; use `.nojekyll` as included. Do not use this build workflow in that deployment-only repository.

No repository or live deployment was created as part of the local build.

## Behavior

- One standalone quote above Today’s reminders, drawn from `sources/quotes/Paper note's good quotes.docx` (currently 66 quotes). Quotes cycle daily in document order, stay stable during the local calendar day, and repeat after the full collection. They have no saving, reading progress, explanation, categories, or Library entry. Each build generates `site/data/quotes.json` from the DOCX, preserving original wording and normalizing whitespace.

- Five distinct books per local calendar day. Reloading does not shuffle them.
- Nonfiction every day, with one fiction slot every fourth day.
- Book selection uses a date-seeded ranking. Each selected book rotates through its pills; with multiple pills per book, consecutive days cannot repeat a pill.
- The collection refreshes after midnight within 30 seconds, or immediately when you return to the tab.
- Bookmarks and read progress stay in local storage in the current browser. Disabled storage falls back to the current visit. There is no account or cross-device synchronization.
- Saved and Library views search concepts, excerpts, refreshers, book titles, authors, and topics.
- No backend, API keys, runtime libraries, remote fonts, analytics, or scheduled server jobs. A newly deployed collection can change the selection for the same date.

## Content and provenance

The supplied notes mix copied passages, summaries, and personal observations. **From my notes** means the excerpt exactly matches the imported note after whitespace normalization. It does not mean that the wording has been verified against a published edition. Existing spelling and punctuation are preserved. Added refreshers are editorial and separate from the excerpt. Page numbers and missing edition information are never invented.

Every pill includes at least one further-reading resource by someone other than its book’s author. These links are selected for the specific concept: articles, practical exercises, research papers, and interactive explanations. Outside resources appear first, followed by an author or book link where available. Links are optional, may change over time, and do not serve as proof that an imported quote is verbatim. `content/pills.json` is the editable content source.

```text
sources/                     Original book-note HTML and DOCX exports
sources/quotes/              Separate original DOCX source for daily quotes
content/notes.json           All normalized paragraphs with source hashes
content/source-manifest.json Current hashes for the 99 retained book-note files
content/import-report.json  Extraction counts and empty-file report
content/pills.json           Editorially selected concepts and source references
content/curation-report.json Curated sources and sources awaiting curation
scripts/import_notes.py     Standard-library HTML / DOCX importer
scripts/build.py            Provenance, attribution, link and length validation
site/                       Entire deployable website
  data/library.json         Generated curated collection
  data/quotes.json          Generated daily quotes from the quote DOCX
  core.js                   Selection, search, persistence, reading time
  app.js                    Rendering and interactions
  style.css                 Responsive visual design
  index.html                Accessible page shell
tests/                      Python, Node and browser checks
.github/workflows/pages.yml GitHub Pages deployment
```

## Update daily quotes

Edit or replace `sources/quotes/Paper note's good quotes.docx`, then run `npm run build` and `npm test`. Keep the first nonempty paragraph as `Paper note's good quotes`, followed by one quote per paragraph. Blank paragraphs are ignored; line breaks within a quote become spaces. The build rejects a missing title or an empty collection. Do not edit the generated `site/data/quotes.json` directly.

The quote source is kept separately from book notes and is excluded from the book library and its source counts. Author names already in the text are preserved; the document is the import source, not verification of original authorship. Only the extracted quote text is published with the site.

## Add a book or pill

1. Put an HTML Evernote export or DOCX note file in `sources/` and run `python3 scripts/import_notes.py`.
2. Find its paragraphs in `content/notes.json`. The importer reads `en-note` bodies in HTML and text paragraphs in DOCX; images, formulas rendered as images, tables' layout, and annotations are not interpreted.
3. Add a record to `content/pills.json`. Use a stable unique `id`; keep the same `bookId`, title, author, and genre across a book’s pills. `source.paragraph` is **zero-based**. Copy a complete standalone passage or an exact contiguous excerpt. Do not rewrite the quote.
4. Write one clear concept and a brief refresher. Verify authorship and add at least one useful HTTPS resource from another writer, researcher, or institution. Check the destination and its relevance to this concept; a generic book page or an interview with the same author does not satisfy this requirement. Put the outside resource first, and optionally add an author resource after it. Label papers, PDFs, and interactive tools in the link title. Aim for at least three distinct concepts per book.
5. Run `npm run build` and `npm test`, then preview the result. The build rejects unmatched quotes, missing attribution, duplicate IDs, unsafe links, and pills over the word budget.
6. Commit and push; the Pages workflow rebuilds automatically.

Example record shape (use your actual source text):

```json
{
  "id": "atomic-habits-systems-over-goals",
  "bookId": "atomic-habits",
  "book": "Atomic Habits",
  "author": "James Clear",
  "genre": "nonfiction",
  "topic": "Habits",
  "concept": "Systems over goals",
  "quote": "You do not rise to the level of your goals. You fall to the level of your systems.",
  "refresher": "A goal names the destination; a system determines what happens on an ordinary Tuesday. Improve the recurring action that produces the result.",
  "source": {"file": "Clear J. - Atomic Habits.docx", "paragraph": 7},
  "links": [
    {"title": "BJ Fogg · How motivation, ability, and prompts shape habits", "url": "https://www.behaviormodel.org/"},
    {"title": "James Clear · Goals and systems", "url": "https://jamesclear.com/goals-systems"}
  ]
}
```

## Tests

```sh
npm test
```

Browser tests use Playwright as a **development-only** dependency and an installed Google Chrome:

```sh
npm ci
npm run test:browser
```

They cover the daily ritual, bookmark persistence, completion, search and filters, optional links, a failed request and retry, blocked local storage, mobile overflow, and midnight rollover. Screenshots are written to ignored `test-results/`. For systems without Chrome, install it or remove `channel: 'chrome'` from `playwright.config.js` and run `npx playwright install chromium`.
