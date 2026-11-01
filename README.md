# JanelKit Website

English presentation and documentation site built with Svelte 5 + SvelteKit. JanelKit itself is a separate Python desktop framework and is never modified by this site.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. For production:

```sh
npm run check
npm test
npm run build
npm run preview
```

`build/` is a fully prerendered static site. Deploy it on a static host supporting directory indexes. No Python server is required. To install test browsers: `npx playwright install chromium`.

## Documentation checks

`npm run test:content` checks the lesson schema, required teaching blocks, and coverage of the 47 top-level public names captured from JanelKit 0.1.0. `npm test` also runs the browser suite.

To verify the Python examples, use an interpreter with JanelKit and PySide6 installed (the website itself does not need Python):

```sh
PYTHONDONTWRITEBYTECODE=1 python scripts/validate_doc_examples.py
PYTHONDONTWRITEBYTECODE=1 python scripts/test_doc_behaviors.py
```

The first command exports the current standalone examples and compiles/mounts them; the second exercises selected behaviors. Generated sources, logs, and data stay under `artifacts/doc-validation/`. A successful mount does not prove every possible interaction or multi-file snippet. See `QUALITY.md` for actual verification and limitations.

## Edit

- Palette: `src/lib/theme.css` (all semantic color tokens).
- Layout and responsive rules: `src/app.css`.
- Landing page: `src/routes/+page.svelte`.
- English learning path: `src/lib/docs.js` orders topic modules in `src/lib/docs/`; new entries become prerendered pages.
- Lesson formatting: `src/lib/components/DocSection.svelte` and `src/lib/lessons.css`.
- Authoring rules: `DOCUMENTATION_GUIDELINES.md`.
- Agent index/full text: `/llms.txt` and `/llms-full.txt`, generated from the same catalog.
- Components: `src/lib/components/`.
- Design rationale and palette: `DESIGN.md`.
- Content provenance: `CONTENT_SOURCES.md`.

The brand uses a provisional typographic wordmark. Google Fonts are optional remote resources with fallbacks. The docs provide a 24-page beginner learning path and public Python API reference, not a full translation of every upstream platform detail. The interactive counter is a browser simulation of the documented desktop example, explicitly labeled in the UI.
